import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import Activity from "@/models/Activity";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";

const VALID_STATUSES = new Set([
  "NEW", "CONTACTED", "FOLLOW_UP", "DOCUMENT_PENDING",
  "UNDER_REVIEW", "APPROVED", "REJECTED", "CLOSED",
]);

export async function POST(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "update_lead_status")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();
  const { leadIds, status } = await request.json();

  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return NextResponse.json({ error: "leadIds array is required" }, { status: 400 });
  }

  if (!VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
  }

  const now = new Date();
  const activityEntries = [];

  for (const leadId of leadIds) {
    const lead = await Lead.findById(leadId);
    if (!lead) continue;

    const prevStatus = lead.status;
    if (prevStatus === status) continue;

    if (prevStatus === "NEW" && status !== "NEW" && !lead.firstResponseAt) {
      lead.firstResponseAt = now;
    }

    lead.status = status;
    await lead.save();

    activityEntries.push({
      leadId: lead._id,
      actionType: "STATUS_UPDATED",
      performedBy: ctx.userId,
      description: `Bulk status changed from ${prevStatus} to ${status}`,
    });
  }

  if (activityEntries.length > 0) {
    await Activity.insertMany(activityEntries);
  }

  return NextResponse.json({ success: true, count: activityEntries.length });
}
