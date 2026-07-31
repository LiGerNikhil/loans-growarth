import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Connector from "@/models/Connector";
import Activity from "@/models/Activity";
import User from "@/models/User";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import { sendConnectorStatusNotification } from "@/lib/notifications";
import mongoose from "mongoose";

const VALID_STATUSES = ["PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "REJECTED"] as const;
const VALID_NETWORK_TYPES = [
  "Shopkeeper", "Insurance Agent", "CA/Accountant", "Real Estate Broker", "Individual", "Other",
] as const;

export async function GET(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx || !can(ctx.role, "manage_connectors")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const statusParam = searchParams.get("status") || "";
  const networkTypeParam = searchParams.get("networkType") || "";
  const cityParam = searchParams.get("city") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

  const filter: Record<string, unknown> = {};

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { mobile: { $regex: escaped, $options: "i" } },
      { connectorCode: { $regex: escaped, $options: "i" } },
    ];
  }

  if (statusParam) {
    const statuses = statusParam.split(",").filter((s) => (VALID_STATUSES as readonly string[]).includes(s));
    if (statuses.length) filter.status = { $in: statuses };
  }

  if (networkTypeParam) {
    const types = networkTypeParam.split(",").filter((t) => (VALID_NETWORK_TYPES as readonly string[]).includes(t));
    if (types.length) filter.networkType = { $in: types };
  }

  if (cityParam) {
    filter.city = { $regex: cityParam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }

  const skip = (page - 1) * limit;

  const [connectors, total] = await Promise.all([
    Connector.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Connector.countDocuments(filter),
  ]);

  return NextResponse.json({
    connectors,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function PATCH(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx || !can(ctx.role, "manage_connectors")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { connectorId?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.connectorId || !body.status) {
    return NextResponse.json({ error: "connectorId and status required" }, { status: 400 });
  }

  const newStatus = body.status;
  if (!(VALID_STATUSES as readonly string[]).includes(newStatus as typeof VALID_STATUSES[number])) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await dbConnect();

  const connector = await Connector.findById(body.connectorId);
  if (!connector) {
    return NextResponse.json({ error: "Connector not found" }, { status: 404 });
  }

  const prevStatus = connector.status;
  connector.status = newStatus as typeof connector.status;

  if (newStatus === "ACTIVE" && prevStatus !== "ACTIVE") {
    connector.approvedBy = new mongoose.Types.ObjectId(ctx.userId);
    connector.approvedAt = new Date();
  }

  await connector.save();

  await Activity.create({
    actionType: newStatus === "ACTIVE" && prevStatus !== "ACTIVE" ? "CONNECTOR_APPROVED"
      : newStatus === "REJECTED" ? "CONNECTOR_REJECTED"
      : newStatus === "SUSPENDED" ? "CONNECTOR_SUSPENDED"
      : "CONNECTOR_REACTIVATED",
    performedBy: new mongoose.Types.ObjectId(ctx.userId),
    description: `${ctx.name} changed connector ${connector.connectorCode} (${connector.name}) status from ${prevStatus} to ${newStatus}`,
  });

  sendConnectorStatusNotification(connector._id.toString(), newStatus);

  return NextResponse.json({ success: true, status: newStatus });
}
