import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import Connector from "@/models/Connector";
import CommissionRule from "@/models/CommissionRule";
import ConnectorPayout from "@/models/ConnectorPayout";
import Activity from "@/models/Activity";

function formatCurrency(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

export async function calculateCommission(leadId: string): Promise<void> {
  await dbConnect();

  const lead = await Lead.findById(leadId).select("connectorId loanType loanAmount leadId name").lean();
  if (!lead || !lead.connectorId) return;

  const rule = await CommissionRule.findOne({
    loanType: lead.loanType,
    active: true,
    effectiveFrom: { $lte: new Date() },
  }).sort({ effectiveFrom: -1 }).lean();

  if (!rule) {
    await Activity.create({
      leadId: lead._id,
      actionType: "COMMISSION_RULE_MISSING",
      description: `No active commission rule found for loan type "${lead.loanType}" on connector-attributed lead ${lead.leadId}`,
    });
    const { sendCommissionRuleMissingNotification } = await import("@/lib/notifications");
    await sendCommissionRuleMissingNotification(lead, lead.connectorId.toString()).catch(() => {});
    return;
  }

  const commissionAmount =
    rule.commissionType === "FLAT"
      ? rule.value
      : Math.round((rule.value / 100) * (lead.loanAmount || 0) * 100) / 100;

  await ConnectorPayout.create({
    connectorId: lead.connectorId,
    leadId: lead._id,
    loanType: lead.loanType,
    loanAmountDisbursed: lead.loanAmount,
    commissionAmount,
    commissionRuleApplied: rule._id,
    status: "PENDING",
  });

  await Connector.findByIdAndUpdate(lead.connectorId, { $inc: { totalCommissionEarned: commissionAmount } });

  await Activity.create({
    leadId: lead._id,
    actionType: "COMMISSION_ACCRUED",
    description: `Commission of ${formatCurrency(commissionAmount)} accrued for connector on lead ${lead.leadId} (${rule.commissionType}: ${rule.value}${rule.commissionType === "PERCENTAGE" ? "%" : ""})`,
  });

  const { sendCommissionAccruedNotification } = await import("@/lib/notifications");
  await sendCommissionAccruedNotification(lead, lead.connectorId.toString(), commissionAmount).catch(() => {});
}
