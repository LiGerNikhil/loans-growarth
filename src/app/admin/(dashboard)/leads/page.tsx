import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import User from "@/models/User";
import { getAuthContext } from "@/lib/dashboard";
import LeadsClient from "@/components/leads/LeadsClient";

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  amount_high: { loanAmount: -1 },
  amount_low: { loanAmount: 1 },
};

const VALID_STATUSES = new Set([
  "NEW", "CONTACTED", "FOLLOW_UP", "DOCUMENT_PENDING",
  "UNDER_REVIEW", "APPROVED", "REJECTED", "CLOSED",
]);

const VALID_LOAN_TYPES = new Set([
  "Personal Loan", "Business Loan", "Loan Against Property",
  "Overdraft Facility", "Home Loan", "Other",
]);

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/admin/login");

  const params = await searchParams;
  const search = params.search || "";
  const statusParam = params.status || "";
  const loanTypeParam = params.loanType || "";
  const dateFrom = params.dateFrom || "";
  const dateTo = params.dateTo || "";
  const assignedTo = params.assignedTo || "";
  const sortKey = params.sort || "newest";
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const limit = 20;

  await dbConnect();

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
    const statuses = statusParam.split(",").filter((s) => VALID_STATUSES.has(s));
    if (statuses.length) filter.status = { $in: statuses };
  }

  if (loanTypeParam) {
    const types = loanTypeParam.split(",").filter((t) => VALID_LOAN_TYPES.has(t));
    if (types.length) filter.loanType = { $in: types };
  }

  if (dateFrom || dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(dateTo);
    filter.createdAt = dateFilter;
  }

  if (assignedTo) filter.assignedTo = assignedTo;

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

  const initialData = {
    leads: JSON.parse(JSON.stringify(leads)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    agents: JSON.parse(JSON.stringify(agents)),
  };

  const initialParams = {
    search,
    status: statusParam,
    loanType: loanTypeParam,
    dateFrom,
    dateTo,
    assignedTo,
    sort: sortKey,
    page: String(page),
  };

  return <LeadsClient initialData={initialData as never} initialParams={initialParams} role={ctx.role} />;
}
