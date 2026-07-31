import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";

export async function POST(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "assign_lead")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();
  const { leadIds, assignedTo } = await request.json();

  if (!Array.isArray(leadIds) || leadIds.length === 0) {
    return NextResponse.json({ error: "leadIds array is required" }, { status: 400 });
  }

  const nextAgentName = assignedTo
    ? (await User.findById(assignedTo).select("name"))?.name || "Unknown"
    : "Unassigned";

  const activityEntries = [];

  for (const leadId of leadIds) {
    const lead = await Lead.findById(leadId);
    if (!lead) continue;

    const prevAgent = lead.assignedTo
      ? (await User.findById(lead.assignedTo).select("name"))?.name || "Unknown"
      : "Unassigned";

    lead.assignedTo = (assignedTo || undefined) as any;
    await lead.save();

    activityEntries.push({
      leadId: lead._id,
      actionType: "LEAD_ASSIGNED",
      performedBy: ctx.userId,
      description: `Bulk reassigned from ${prevAgent} to ${nextAgentName}`,
    });
  }

  if (activityEntries.length > 0) {
    await Activity.insertMany(activityEntries);
  }

  return NextResponse.json({ success: true, count: activityEntries.length });
}
