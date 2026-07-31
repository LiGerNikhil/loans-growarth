import dbConnect from "./mongodb";
import Lead from "@/models/Lead";
import User from "@/models/User";
import type { PipelineStage } from "mongoose";

function buildFilter(role: string, userId?: string): Record<string, unknown> {
  return role === "AGENT" && userId ? { assignedTo: userId } : {};
}

export interface DailyLeadsRow {
  date: string;
  count: number;
}

export interface MonthlyLeadsRow {
  month: string;
  count: number;
}

export interface AgentPerformanceRow {
  _id: string;
  name: string;
  total: number;
  approved: number;
  rejected: number;
  pending: number;
}

export interface LoanTypeRow {
  name: string;
  count: number;
  totalAmount: number;
}

export interface ConversionRow {
  status: string;
  count: number;
}

export interface ConnectorPerformanceRow {
  _id: string;
  name: string;
  connectorCode: string;
  networkType: string;
  totalLeads: number;
  approvedLeads: number;
  totalAccrued: number;
  totalPaid: number;
}

export interface ReportData {
  dailyLeads: DailyLeadsRow[];
  monthlyLeads: MonthlyLeadsRow[];
  agentPerformance: AgentPerformanceRow[];
  loanType: LoanTypeRow[];
  conversion: ConversionRow[];
  connectorPerformance: ConnectorPerformanceRow[];
}

export async function getReports(
  role: string,
  userId?: string,
  dateFrom?: string,
  dateTo?: string,
  networkType?: string
): Promise<ReportData> {
  await dbConnect();
  const baseFilter = buildFilter(role, userId);

  const dateFilter: Record<string, unknown> = {};
  if (dateFrom) dateFilter.$gte = new Date(dateFrom);
  if (dateTo) {
    const end = new Date(dateTo);
    end.setHours(23, 59, 59, 999);
    dateFilter.$lte = end;
  }
  const timeFilter = dateFrom || dateTo ? { createdAt: dateFilter } : {};

  const fullFilter = { ...baseFilter, ...timeFilter };

  const dailyLeads = await Lead.aggregate([
    { $match: fullFilter },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { date: "$_id", count: 1, _id: 0 } },
  ]);

  const monthlyLeads = await Lead.aggregate([
    { $match: fullFilter },
    { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { month: "$_id", count: 1, _id: 0 } },
  ]);

  const agentPerformance = await Lead.aggregate([
    { $match: { ...fullFilter, assignedTo: { $ne: null } } },
    {
      $group: {
        _id: "$assignedTo",
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "REJECTED"] }, 1, 0] } },
        pending: {
          $sum: {
            $cond: [
              { $in: ["$status", ["NEW", "CONTACTED", "FOLLOW_UP", "DOCUMENT_PENDING", "UNDER_REVIEW"]] },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const agents = await User.find({
    _id: { $in: agentPerformance.map((a) => a._id) },
  })
    .select("name")
    .lean();
  const agentMap = new Map(agents.map((a) => [a._id.toString(), a.name]));

  const agentPerformanceWithNames = agentPerformance.map((a) => ({
    _id: a._id.toString(),
    name: agentMap.get(a._id.toString()) || "Unknown",
    total: a.total,
    approved: a.approved,
    rejected: a.rejected,
    pending: a.pending,
  }));

  const loanType = await Lead.aggregate([
    { $match: fullFilter },
    {
      $group: {
        _id: "$loanType",
        count: { $sum: 1 },
        totalAmount: { $sum: "$loanAmount" },
      },
    },
    { $sort: { count: -1 } },
    { $project: { name: "$_id", count: 1, totalAmount: 1, _id: 0 } },
  ]);

  const conversion = await Lead.aggregate([
    { $match: fullFilter },
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { status: "$_id", count: 1, _id: 0 } },
  ]);

  // Connector Performance
  const connectorPerformancePipeline: PipelineStage[] = [
    { $match: { ...fullFilter, connectorId: { $ne: null } } },
    {
      $group: {
        _id: "$connectorId",
        totalLeads: { $sum: 1 },
        approvedLeads: { $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] } },
      },
    },
    {
      $lookup: {
        from: "connectors",
        localField: "_id",
        foreignField: "_id",
        as: "connector",
      },
    },
    { $unwind: "$connector" },
  ];

  if (networkType) {
    connectorPerformancePipeline.push({ $match: { ["connector.networkType"]: networkType } });
  }

  connectorPerformancePipeline.push(
    {
      $lookup: {
        from: "connectorpayouts",
        let: { cid: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$connectorId", "$$cid"] } } },
          {
            $group: {
              _id: null,
              totalAccrued: { $sum: "$commissionAmount" },
              totalPaid: {
                $sum: {
                  $cond: [{ $eq: ["$status", "PAID"] }, "$commissionAmount", 0],
                },
              },
            },
          },
        ],
        as: "payouts",
      },
    } as PipelineStage,
    {
      $addFields: {
        totalAccrued: { $ifNull: [{ $arrayElemAt: ["$payouts.totalAccrued", 0] }, 0] },
        totalPaid: { $ifNull: [{ $arrayElemAt: ["$payouts.totalPaid", 0] }, 0] },
      },
    },
    { $sort: { totalLeads: -1 } },
    {
      $project: {
        _id: 1,
        name: "$connector.name",
        connectorCode: "$connector.connectorCode",
        networkType: "$connector.networkType",
        totalLeads: 1,
        approvedLeads: 1,
        totalAccrued: 1,
        totalPaid: 1,
      },
    }
  );

  const connectorPerformance = await Lead.aggregate(connectorPerformancePipeline);

  return {
    dailyLeads,
    monthlyLeads,
    agentPerformance: agentPerformanceWithNames,
    loanType,
    conversion,
    connectorPerformance,
  };
}
