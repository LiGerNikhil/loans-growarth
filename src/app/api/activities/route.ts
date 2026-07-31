import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Activity from "@/models/Activity";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";

const ACTION_TYPES = [
  "LOGIN_SUCCESS", "LOGIN_FAILED", "LOGOUT",
  "LEAD_CREATED", "STATUS_UPDATED", "REMARK_ADDED",
  "LEAD_ASSIGNED", "USER_CREATED", "NOTIFICATION_FAILED",
] as const;

export async function GET(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "view_audit_logs")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const actionType = searchParams.get("actionType") || "";
  const actor = searchParams.get("actor") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));

  const filter: Record<string, unknown> = {};

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.description = { $regex: escaped, $options: "i" };
  }

  if (actionType) {
    const types = actionType.split(",").filter((t) => (ACTION_TYPES as readonly string[]).includes(t));
    if (types.length) filter.actionType = { $in: types };
  }

  if (actor) filter.performedBy = actor;

  if (dateFrom || dateTo) {
    const df: Record<string, Date> = {};
    if (dateFrom) df.$gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      df.$lte = end;
    }
    filter.createdAt = df;
  }

  const skip = (page - 1) * limit;

  const [activities, total, distinctActors] = await Promise.all([
    Activity.find(filter)
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Activity.countDocuments(filter),
    Activity.distinct("performedBy", { performedBy: { $ne: null } }),
  ]);

  const { default: User } = await import("@/models/User");
  const actors = await User.find({ _id: { $in: distinctActors } })
    .select("name email")
    .lean();

  return NextResponse.json({
    activities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    actors,
    actionTypes: ACTION_TYPES,
  });
}
