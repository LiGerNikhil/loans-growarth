"use server";

import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";

export async function assignLead(leadId: string, agentId: string | null) {
  const ctx = await getAuthContext();
  if (!ctx) throw new Error("Unauthorized");
  if (!can(ctx.role, "assign_lead")) throw new Error("Forbidden: cannot reassign");

  await dbConnect();

  const lead = await Lead.findById(leadId);
  if (!lead) throw new Error("Lead not found");

  if (ctx.role === "AGENT" && lead.assignedTo?.toString() !== ctx.userId) {
    throw new Error("Forbidden");
  }

  const prevAgent = lead.assignedTo
    ? (await User.findById(lead.assignedTo).select("name"))?.name || "Unknown"
    : "Unassigned";
  const nextAgent = agentId
    ? (await User.findById(agentId).select("name"))?.name || "Unknown"
    : "Unassigned";

  lead.assignedTo = (agentId || undefined) as any;
  await lead.save();

  await Activity.create({
    leadId: lead._id,
    actionType: "LEAD_ASSIGNED",
    performedBy: ctx.userId,
    description: `Reassigned from ${prevAgent} to ${nextAgent}`,
  });

  return { success: true, leadId };
}

export async function bulkAssignLeads(leadIds: string[], agentId: string | null) {
  const ctx = await getAuthContext();
  if (!ctx) throw new Error("Unauthorized");
  if (!can(ctx.role, "assign_lead")) throw new Error("Forbidden: cannot reassign");

  await dbConnect();

  const nextAgentName = agentId
    ? (await User.findById(agentId).select("name"))?.name || "Unknown"
    : "Unassigned";

  const results = await Promise.allSettled(
    leadIds.map(async (leadId) => {
      const lead = await Lead.findById(leadId);
      if (!lead) return null;

      const prevAgent = lead.assignedTo
        ? (await User.findById(lead.assignedTo).select("name"))?.name || "Unknown"
        : "Unassigned";

      lead.assignedTo = (agentId || undefined) as any;
      await lead.save();

      return { lead, prevAgent };
    })
  );

  const activityEntries = [];
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      const { lead, prevAgent } = result.value;
      activityEntries.push({
        leadId: lead._id,
        actionType: "LEAD_ASSIGNED",
        performedBy: ctx.userId,
        description: `Bulk reassigned from ${prevAgent} to ${nextAgentName}`,
      });
    }
  }

  if (activityEntries.length > 0) {
    await Activity.insertMany(activityEntries);
  }

  return { success: true, count: activityEntries.length };
}
