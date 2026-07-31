import dbConnect from "./mongodb";
import Lead from "@/models/Lead";
import { auth } from "./auth";

export interface DashboardMetrics {
  totalLeads: number;
  todayLeads: number;
  weekLeads: number;
  monthLeads: number;
  approvedLeads: number;
  rejectedLeads: number;
  leadTrend: { date: string; count: number }[];
  loanTypeBreakdown: { name: string; value: number }[];
  conversionRate: { total: number; approved: number; rate: number };
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function buildFilter(role: string, userId?: string): Record<string, unknown> {
  if (role === "AGENT" && userId) return { assignedTo: userId };
  return {};
}

const TREND_PERIODS: Record<string, { format: string; label: string; start: Date; groupExpr: Record<string, unknown> }> = {
  daily: {
    format: "%Y-%m-%d",
    label: "%Y-%m-%d",
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    groupExpr: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
  },
  weekly: {
    format: "%Y-W%V",
    label: "%Y-W%V",
    start: new Date(Date.now() - 84 * 24 * 60 * 60 * 1000),
    groupExpr: { $dateToString: { format: "%Y-W%V", date: "$createdAt" } },
  },
  monthly: {
    format: "%Y-%m",
    label: "%Y-%m",
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    groupExpr: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
  },
};

export async function getDashboardMetrics(
  role: string,
  userId?: string,
  period: "daily" | "weekly" | "monthly" = "daily"
): Promise<DashboardMetrics> {
  await dbConnect();

  const baseFilter = buildFilter(role, userId);
  const now = new Date();

  const [totalLeads, todayLeads, weekLeads, monthLeads, approvedLeads, rejectedLeads] = await Promise.all([
    Lead.countDocuments(baseFilter),
    Lead.countDocuments({ ...baseFilter, createdAt: { $gte: startOfDay(now) } }),
    Lead.countDocuments({ ...baseFilter, createdAt: { $gte: startOfWeek(now) } }),
    Lead.countDocuments({ ...baseFilter, createdAt: { $gte: startOfMonth(now) } }),
    Lead.countDocuments({ ...baseFilter, status: "APPROVED" }),
    Lead.countDocuments({ ...baseFilter, status: "REJECTED" }),
  ]);

  const trendConfig = TREND_PERIODS[period];
  const leadTrendRaw = await Lead.aggregate([
    { $match: { ...baseFilter, createdAt: { $gte: trendConfig.start } } },
    { $group: { _id: trendConfig.groupExpr, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { date: "$_id", count: 1, _id: 0 } },
  ]);

  const loanTypeBreakdown = await Lead.aggregate([
    { $match: baseFilter },
    { $group: { _id: "$loanType", value: { $sum: 1 } } },
    { $project: { name: "$_id", value: 1, _id: 0 } },
    { $sort: { value: -1 } },
  ]);

  const conversionTotal = await Lead.countDocuments({
    ...baseFilter,
    status: { $in: ["APPROVED", "REJECTED", "CLOSED"] },
  });
  const conversionRate = conversionTotal > 0 ? Math.round((approvedLeads / conversionTotal) * 100) : 0;

  return {
    totalLeads,
    todayLeads,
    weekLeads,
    monthLeads,
    approvedLeads,
    rejectedLeads,
    leadTrend: leadTrendRaw,
    loanTypeBreakdown,
    conversionRate: { total: conversionTotal, approved: approvedLeads, rate: conversionRate },
  };
}

export async function getAuthContext() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.role) return null;
  return {
    userId: session.user.id,
    role: session.user.role as string,
    name: session.user.name as string,
    email: session.user.email as string,
  };
}
