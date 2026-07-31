import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { getAuthContext } from "@/lib/dashboard";

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  amount_high: { loanAmount: -1 },
  amount_low: { loanAmount: 1 },
};

const VALID_STATUSES = [
  "NEW", "CONTACTED", "FOLLOW_UP", "DOCUMENT_PENDING",
  "UNDER_REVIEW", "APPROVED", "REJECTED", "CLOSED",
];

const VALID_LOAN_TYPES = [
  "Personal Loan", "Business Loan", "Loan Against Property",
  "Overdraft Facility", "Home Loan", "Other",
];

export async function GET(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const statusParam = searchParams.get("status") || "";
  const loanTypeParam = searchParams.get("loanType") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const assignedTo = searchParams.get("assignedTo") || "";
  const sortKey = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

  const filter: Record<string, unknown> = {};

  if (ctx.role === "AGENT") {
    filter.assignedTo = ctx.userId;
  }

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { mobile: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  if (statusParam) {
    const statuses = statusParam.split(",").filter((s) => VALID_STATUSES.includes(s));
    if (statuses.length) filter.status = { $in: statuses };
  }

  if (loanTypeParam) {
    const types = loanTypeParam.split(",").filter((t) => VALID_LOAN_TYPES.includes(t));
    if (types.length) filter.loanType = { $in: types };
  }

  if (dateFrom || dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(dateTo);
    filter.createdAt = dateFilter;
  }

  if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  const sort = SORT_MAP[sortKey] || SORT_MAP.newest;
  const skip = (page - 1) * limit;

  const [leads, total, agents] = await Promise.all([
    Lead.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("assignedTo", "name email")
      .populate("connectorId", "name connectorCode")
      .lean(),
    Lead.countDocuments(filter),
    User.find({ active: true, role: { $in: ["AGENT", "MANAGER"] } })
      .select("name email")
      .lean(),
  ]);

  return NextResponse.json({
    leads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    agents,
  });
}
