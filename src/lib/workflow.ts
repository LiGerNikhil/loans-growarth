import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import User from "@/models/User";
import Activity from "@/models/Activity";

const SLA_HOURS = 24;
const STALE_DAYS = 3;

export async function autoAssignLead(leadId: string): Promise<string | null> {
  await dbConnect();

  const agents = await User.find({ active: true, role: "AGENT" }).select("_id").lean();
  if (agents.length === 0) return null;

  const loads = await Promise.all(
    agents.map((a) =>
      Lead.countDocuments({
        assignedTo: a._id,
        status: { $nin: ["APPROVED", "REJECTED", "CLOSED"] },
      }).then((count) => ({ agentId: a._id.toString(), count }))
    )
  );

  loads.sort((a, b) => a.count - b.count);
  const chosenId = loads[0].agentId;

  await Lead.findByIdAndUpdate(leadId, { assignedTo: chosenId });
  return chosenId;
}

export async function getStaleLeads(): Promise<
  { _id: string; leadId: string; name: string; daysSinceUpdate: number; assignedTo?: { name: string } }[]
> {
  await dbConnect();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - STALE_DAYS);

  const raw = await Lead.find({
    status: "FOLLOW_UP",
    updatedAt: { $lte: cutoff },
  })
    .populate("assignedTo", "name")
    .lean();

  const stale: { _id: string; leadId: string; name: string; daysSinceUpdate: number; assignedTo?: { name: string } }[] = [];

  for (const item of raw) {
    const rec = item as unknown as Record<string, unknown>;
    const updatedAt = rec.updatedAt as Date | undefined;
    const createdAt = rec.createdAt as Date | undefined;
    stale.push({
      _id: String(rec._id),
      leadId: String(rec.leadId),
      name: String(rec.name),
      daysSinceUpdate: Math.floor(
        (Date.now() - new Date(updatedAt || createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)
      ),
      assignedTo: rec.assignedTo ? (rec.assignedTo as { name: string }) : undefined,
    });
  }

  return stale;
}

export async function escalateStaleLeads(): Promise<number> {
  await dbConnect();

  const managers = await User.find({ active: true, role: "MANAGER" }).select("_id").lean();
  const managerIds = managers.map((m) => m._id);
  if (managerIds.length === 0) return 0;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - STALE_DAYS);

  const staleLeadDocs = await Lead.find({
    status: "FOLLOW_UP",
    updatedAt: { $lte: cutoff },
    assignedTo: { $nin: managerIds },
  });

  if (staleLeadDocs.length === 0) return 0;

  const managerId = managerIds[0];

  const activityEntries = staleLeadDocs.map((lead) => ({
    leadId: lead._id,
    actionType: "LEAD_ESCALATED",
    performedBy: managerId,
    description: `Auto-escalated from ${lead.assignedTo ? "agent" : "unassigned"} to manager — stale in FOLLOW_UP for >${STALE_DAYS} days`,
  }));

  await Promise.all([
    Lead.updateMany(
      { _id: { $in: staleLeadDocs.map((l) => l._id) } },
      { $set: { assignedTo: managerId } }
    ),
    Activity.insertMany(activityEntries),
  ]);

  return staleLeadDocs.length;
}

export async function getSlaMetrics() {
  await dbConnect();

  const total = await Lead.countDocuments();
  const breached = await Lead.countDocuments({
    slaDeadline: { $lt: new Date() },
    status: "NEW",
  });

  const responded = await Lead.countDocuments({
    firstResponseAt: { $ne: null },
  });

  return {
    total,
    breached,
    responded,
    slaRate: total > 0 ? Math.round((responded / total) * 100) : 100,
  };
}
