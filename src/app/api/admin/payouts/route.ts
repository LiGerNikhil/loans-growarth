import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ConnectorPayout from "@/models/ConnectorPayout";
import Connector from "@/models/Connector";
import Activity from "@/models/Activity";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import mongoose from "mongoose";

const VALID_STATUSES = ["PENDING", "APPROVED", "PAID", "REJECTED"] as const;

export async function GET(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx || !can(ctx.role, "manage_connectors")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const statusParam = searchParams.get("status") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

  const filter: Record<string, unknown> = {};

  if (statusParam) {
    const statuses = statusParam.split(",").filter((s) => (VALID_STATUSES as readonly string[]).includes(s));
    if (statuses.length) filter.status = { $in: statuses };
  }

  if (dateFrom || dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(dateTo);
    filter.createdAt = dateFilter;
  }

  if (search) {
    const connectorIds = await Connector.find({
      $or: [
        { name: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
        { connectorCode: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } },
      ],
    }).select("_id").lean();
    filter.connectorId = { $in: connectorIds.map((c) => c._id) };
  }

  const skip = (page - 1) * limit;

  const [payouts, total] = await Promise.all([
    ConnectorPayout.find(filter)
      .sort({ flaggedForReview: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("connectorId", "name connectorCode")
      .populate("leadId", "leadId name bankName bankPayout")
      .lean(),
    ConnectorPayout.countDocuments(filter),
  ]);

  const allConnectors = await Connector.find({ status: "ACTIVE" })
    .select("name connectorCode")
    .sort({ name: 1 })
    .lean();

  const flaggedCount = await ConnectorPayout.countDocuments({ flaggedForReview: true, status: "PENDING" });

  return NextResponse.json({
    payouts,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    connectors: allConnectors,
    flaggedCount,
  });
}

async function recomputeConnectorEarnings(connectorId: string) {
  const result = await ConnectorPayout.aggregate([
    { $match: { connectorId: new mongoose.Types.ObjectId(connectorId) } },
    { $group: { _id: null, total: { $sum: "$commissionAmount" } } },
  ]);
  const total = result.length > 0 ? result[0].total : 0;
  await Connector.findByIdAndUpdate(connectorId, { totalCommissionEarned: total });
}

export async function PATCH(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx || !can(ctx.role, "manage_connectors")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    payoutIds?: string[];
    action?: string;
    paymentReference?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.payoutIds || !Array.isArray(body.payoutIds) || body.payoutIds.length === 0) {
    return NextResponse.json({ error: "payoutIds array required" }, { status: 400 });
  }

  if (!body.action || !["approve", "reject", "mark-paid"].includes(body.action)) {
    return NextResponse.json({ error: "action must be approve, reject, or mark-paid" }, { status: 400 });
  }

  if (body.action === "mark-paid" && !body.paymentReference?.trim()) {
    return NextResponse.json({ error: "paymentReference required for mark-paid" }, { status: 400 });
  }

  await dbConnect();

  const payouts = await ConnectorPayout.find({ _id: { $in: body.payoutIds } }).populate("connectorId", "name connectorCode").lean();
  if (payouts.length !== body.payoutIds.length) {
    return NextResponse.json({ error: "One or more payout records not found" }, { status: 404 });
  }

  const actionLabel = body.action === "approve" ? "approved"
    : body.action === "reject" ? "rejected"
    : "marked as paid";

  const update: Record<string, unknown> = {};
  const now = new Date();

  if (body.action === "approve") {
    for (const p of payouts) {
      if (p.status !== "PENDING") {
        return NextResponse.json({ error: `Payout ${p._id} is not in PENDING status` }, { status: 400 });
      }
    }
    update.status = "APPROVED";
    update.approvedBy = new mongoose.Types.ObjectId(ctx.userId);
    update.approvedAt = now;
  }

  if (body.action === "reject") {
    for (const p of payouts) {
      if (p.status !== "PENDING") {
        return NextResponse.json({ error: `Payout ${p._id} is not in PENDING status` }, { status: 400 });
      }
    }
    update.status = "REJECTED";
  }

  if (body.action === "mark-paid") {
    for (const p of payouts) {
      if (p.status !== "APPROVED") {
        return NextResponse.json({ error: `Payout ${p._id} is not in APPROVED status` }, { status: 400 });
      }
    }
    update.status = "PAID";
    update.paidAt = now;
    update.paymentReference = body.paymentReference?.trim();
  }

  await ConnectorPayout.updateMany(
    { _id: { $in: body.payoutIds } },
    { $set: update }
  );

  const idsStr = body.payoutIds.map((id) => id.slice(-6)).join(", ");
  const adminLabel = `${ctx.name} (${ctx.role})`;

  await Activity.create({
    actionType: body.action === "approve" ? "COMMISSION_APPROVED"
      : body.action === "reject" ? "COMMISSION_REJECTED"
      : "COMMISSION_PAID",
    performedBy: new mongoose.Types.ObjectId(ctx.userId),
    description: `${adminLabel} ${actionLabel} ${body.payoutIds.length} payout(s): [${idsStr}]${body.paymentReference ? ` (ref: ${body.paymentReference})` : ""}`,
  });

  // Recompute earnings and notify for paid payouts
  if (body.action === "mark-paid") {
    const freshPayouts = await ConnectorPayout.find({ _id: { $in: body.payoutIds } })
      .populate("connectorId", "name connectorCode email")
      .populate("leadId", "name")
      .lean();

    const connectorIdSet = new Set<string>();
    for (const fp of freshPayouts) {
      const c = fp.connectorId as unknown as { _id: string };
      connectorIdSet.add(c._id.toString());
    }
    await Promise.allSettled(
      Array.from(connectorIdSet).map((cid) => recomputeConnectorEarnings(cid))
    );

    const { sendPayoutProcessedNotification } = await import("@/lib/notifications");
    for (const fp of freshPayouts) {
      const c = fp.connectorId as unknown as { _id: string; name?: string };
      const l = fp.leadId as unknown as { name?: string };
      sendPayoutProcessedNotification(c._id.toString(), {
        amount: fp.commissionAmount,
        paymentReference: body.paymentReference?.trim() || "",
        leadName: l?.name || "N/A",
      });
    }
  }

  return NextResponse.json({ success: true, updated: body.payoutIds.length });
}
