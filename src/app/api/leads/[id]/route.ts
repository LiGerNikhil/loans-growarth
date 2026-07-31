import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import Activity from "@/models/Activity";
import User from "@/models/User";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;

  const [lead, agents] = await Promise.all([
    Lead.findById(id).populate("assignedTo", "name email").populate("connectorId", "name connectorCode").lean(),
    User.find({ active: true, role: { $in: ["AGENT", "MANAGER"] } })
      .select("name email")
      .lean(),
  ]);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  if (ctx.role === "AGENT" && lead.assignedTo?._id?.toString() !== ctx.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ ...lead, _currentUserRole: ctx.role, _currentUserId: ctx.userId, _agents: agents });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { id } = await params;
  const body = await request.json();

  const lead = await Lead.findById(id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  if (ctx.role === "AGENT" && lead.assignedTo?.toString() !== ctx.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let description = "";

  if (body.status) {
    if (!can(ctx.role, "update_lead_status")) {
      return NextResponse.json({ error: "Forbidden: cannot update status" }, { status: 403 });
    }
    const prevStatus = lead.status;
    lead.status = body.status;

    if (prevStatus === "NEW" && body.status !== "NEW" && !lead.firstResponseAt) {
      lead.firstResponseAt = new Date();
    }

    if (body.status === "NEW" && !lead.slaDeadline) {
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 24);
      lead.slaDeadline = deadline;
    }

    description = `Status changed from ${prevStatus} to ${body.status}`;
  }

  if (body.remark !== undefined) {
    if (!can(ctx.role, "add_remark")) {
      return NextResponse.json({ error: "Forbidden: cannot add remarks" }, { status: 403 });
    }
    if (body.remark.trim()) {
      lead.remarks.push({
        text: body.remark.trim(),
        author: ctx.name,
        createdAt: new Date(),
      });
      description = `Remark added by ${ctx.name}`;
    }
  }

  if (body.assignedTo !== undefined) {
    if (!can(ctx.role, "assign_lead")) {
      return NextResponse.json({ error: "Forbidden: cannot reassign" }, { status: 403 });
    }
    const targetUser = await User.findById(body.assignedTo).select("name");
    const previous = lead.assignedTo ? (await User.findById(lead.assignedTo).select("name"))?.name : "Unassigned";
    const next = targetUser?.name || "Unassigned";
    lead.assignedTo = body.assignedTo || undefined;
    description = `Reassigned from ${previous} to ${next}`;
  }

  let bankUpdated = false;
  if (body.bankName !== undefined || body.bankPayout !== undefined) {
    if (!can(ctx.role, "manage_connectors")) {
      return NextResponse.json({ error: "Forbidden: cannot update bank details" }, { status: 403 });
    }
    if (body.bankName !== undefined) lead.bankName = body.bankName;
    if (body.bankPayout !== undefined) lead.bankPayout = Number(body.bankPayout) || 0;
    bankUpdated = true;
    description = "Bank/payout details updated";
  }

  if (!description && !bankUpdated) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  await lead.save();

  await Activity.create({
    leadId: lead._id,
    actionType: body.status ? "STATUS_UPDATED" : body.assignedTo !== undefined ? "LEAD_ASSIGNED" : bankUpdated ? "LEAD_UPDATED" : "REMARK_ADDED",
    performedBy: ctx.userId,
    description,
  });

  if (body.status === "APPROVED" && lead.connectorId) {
    const { calculateCommission } = await import("@/actions/connector/calculateCommission");
    calculateCommission(lead._id.toString()).catch(() => {});
  }

  if ((body.status === "REJECTED" || body.status === "CLOSED") && lead.connectorId) {
    try {
      const ConnectorPayout = (await import("@/models/ConnectorPayout")).default;
      const existingPayout = await ConnectorPayout.findOne({ leadId: lead._id });
      if (existingPayout) {
        existingPayout.flaggedForReview = true;
        await existingPayout.save();
        const { sendPayoutFlaggedNotification } = await import("@/lib/notifications");
        const { name, leadId, loanType } = lead;
        sendPayoutFlaggedNotification({ name, leadId, loanType }, body.status).catch(() => {});
      }
    } catch { /* silent */ }
  }

  return NextResponse.json({ success: true });
}
