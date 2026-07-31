import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import ConnectorPayout from "@/models/ConnectorPayout";
import mongoose from "mongoose";
import { getConnectorSession } from "@/lib/connect-auth";
import { getConnectorRank } from "@/lib/leaderboard";

export async function GET(request: NextRequest) {
  const session = await getConnectorSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const connectorId = new mongoose.Types.ObjectId(session.connectorId);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalLeads, leadsThisMonth, approvedLeads, payouts, rankResult] = await Promise.all([
    Lead.countDocuments({ connectorId }),
    Lead.countDocuments({ connectorId, createdAt: { $gte: startOfMonth } }),
    Lead.countDocuments({ connectorId, status: "APPROVED" }),
    ConnectorPayout.aggregate([
      { $match: { connectorId: session.connectorId } },
      { $group: { _id: null, total: { $sum: "$commissionAmount" } } },
    ]),
    getConnectorRank(session.connectorId, now.getFullYear(), now.getMonth()),
  ]);

  const totalCommission = payouts.length > 0 ? payouts[0].total : 0;
  const conversionRate = totalLeads > 0 ? Math.round((approvedLeads / totalLeads) * 100) : 0;

  return NextResponse.json({
    totalLeads,
    leadsThisMonth,
    approvedLeads,
    conversionRate,
    totalCommission,
    rank: rankResult.rank,
    totalRanked: rankResult.totalRanked,
  });
}
