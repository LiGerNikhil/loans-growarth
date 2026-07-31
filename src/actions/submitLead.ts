"use server";

import dbConnect from "@/lib/mongodb";
import { publicLeadSchema } from "@/lib/validation";
import Lead from "@/models/Lead";
import Activity from "@/models/Activity";
import { sendLeadEmail, sendLeadWhatsApp, sendLeadConfirmationToLead } from "@/lib/notifications";
import { autoAssignLead } from "@/lib/workflow";
import { redirect } from "next/navigation";

export type SubmitLeadResult =
  | { success: true; leadId: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function submitLead(
  _prev: SubmitLeadResult | null,
  formData: FormData
): Promise<SubmitLeadResult> {
  const raw = {
    name: formData.get("name") as string,
    mobile: formData.get("mobile") as string,
    email: formData.get("email") as string,
    monthlySalary: Number(formData.get("monthlySalary")),
    loanAmount: Number(formData.get("loanAmount")),
    loanType: formData.get("loanType") as string,
  };

  const parsed = publicLeadSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return { success: false, error: "Validation failed", fieldErrors };
  }

  await dbConnect();

  let connectorRef: { _id?: string } = {};
  try {
    const refCode = (await (await import("next/headers")).cookies()).get("gcc_ref")?.value;
    if (refCode && /^GCC-CNR-\d{4}$/.test(refCode)) {
      const Connector = (await import("@/models/Connector")).default;
      const found = await Connector.findOne({ connectorCode: refCode, status: "ACTIVE" }).select("_id").lean();
      if (found) connectorRef = { _id: found._id.toString() };
    }
  } catch {
    // silent — attribution is best-effort
  }

  const slaDeadline = new Date();
  slaDeadline.setHours(slaDeadline.getHours() + 24);

  const lead = await Lead.create({
    name: parsed.data.name,
    mobile: parsed.data.mobile,
    email: parsed.data.email,
    monthlySalary: parsed.data.monthlySalary,
    loanAmount: parsed.data.loanAmount,
    loanType: parsed.data.loanType,
    source: connectorRef._id ? "Connector" : "Website",
    connectorId: connectorRef._id || null,
    status: "NEW",
    slaDeadline,
  });

  if (connectorRef._id) {
    try {
      const Connector = (await import("@/models/Connector")).default;
      await Connector.findByIdAndUpdate(connectorRef._id, { $inc: { totalLeadsReferred: 1 } });
      const { sendConnectorLeadNotification } = await import("@/lib/notifications");
      await sendConnectorLeadNotification(lead, connectorRef._id);
    } catch {
      // silent — best-effort
    }
  }

  await Activity.create({
    leadId: lead._id,
    actionType: "LEAD_CREATED",
    description: `Lead ${lead.leadId} created via website form — ${parsed.data.name}, ${parsed.data.loanType}, ${formatCurrency(parsed.data.loanAmount)}`,
  });

  try {
    const agentId = await autoAssignLead(lead._id.toString());
    if (agentId) {
      const agent = await import("@/models/User").then((m) =>
        (m.default as typeof import("@/models/User").default).findById(agentId).select("name")
      );
      await Activity.create({
        leadId: lead._id,
        actionType: "LEAD_ASSIGNED",
        description: `Auto-assigned to ${agent?.name || "agent"}`,
      });
    }
  } catch {
    // silent — assignment is best-effort
  }

  const [emailResult, confirmationResult, whatsappResult] = await Promise.allSettled([
    sendLeadEmail(lead).catch((e) => ({ success: false, error: e?.message })),
    sendLeadConfirmationToLead(lead).catch((e) => ({ success: false, error: e?.message })),
    sendLeadWhatsApp(lead).catch((e) => ({ success: false, error: e?.message })),
  ]);

  for (const [label, result] of [
    ["Email notification", emailResult],
    ["Lead confirmation", confirmationResult],
    ["WhatsApp", whatsappResult],
  ] as const) {
    if (result.status === "rejected" || (result.status === "fulfilled" && !result.value.success)) {
      const err = result.status === "rejected" ? result.reason?.message : result.value.error;
      await Activity.create({
        leadId: lead._id,
        actionType: "NOTIFICATION_FAILED",
        description: `${label} failed for lead ${lead.leadId}: ${err || "Unknown error"}`,
      }).catch(() => {});
    }
  }

  redirect(`/thank-you?leadId=${encodeURIComponent(lead.leadId)}`);
}

function formatCurrency(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}
