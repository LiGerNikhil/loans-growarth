import Lead from "@/models/Lead";
import type { Transporter } from "nodemailer";

function formatCurrency(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

async function createTransporter(): Promise<Transporter> {
  const nodemailer = await import("nodemailer");
  return nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function confirmationEmailHtml(lead: {
  name: string;
  leadId: string;
  loanType: string;
  loanAmount: number;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#0066FF;padding:32px;text-align:center;">
<h1 style="color:#fff;font-size:22px;margin:0 0 4px;">Thank You, ${lead.name}!</h1>
<p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">We&rsquo;ve received your loan inquiry</p>
</td></tr>
<tr><td style="padding:32px;">
<p style="font-size:14px;color:#1C2026;line-height:1.6;margin:0 0 20px;">
Dear <strong>${lead.name}</strong>,
</p>
<p style="font-size:14px;color:#1C2026;line-height:1.6;margin:0 0 20px;">
Thank you for reaching out to <strong>Growarth Capita</strong>. Our team has received your application and one of our loan specialists will get in touch with you shortly.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;border-radius:12px;margin-bottom:20px;">
<tr><td style="padding:20px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:8px;font-size:13px;color:#6F7580;">Reference ID</td>
<td style="padding-bottom:8px;font-size:14px;color:#1C2026;font-weight:600;text-align:right;">${lead.leadId}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;color:#6F7580;border-top:1px solid #e4e7ec;">Loan Type</td>
<td style="padding:8px 0;font-size:14px;color:#1C2026;text-align:right;border-top:1px solid #e4e7ec;">${lead.loanType}</td></tr>
<tr><td style="padding-top:8px;font-size:13px;color:#6F7580;border-top:1px solid #e4e7ec;">Loan Amount</td>
<td style="padding-top:8px;font-size:14px;color:#1C2026;font-weight:600;text-align:right;border-top:1px solid #e4e7ec;">${formatCurrency(lead.loanAmount)}</td></tr>
</table>
</td></tr>
</table>
<p style="font-size:14px;color:#1C2026;line-height:1.6;margin:0 0 20px;">
If you have any urgent questions, feel free to reply to this email or call us.
</p>
<p style="font-size:14px;color:#1C2026;line-height:1.6;margin:0;">
Warm regards,<br>
<strong>Growarth Capita Team</strong>
</p>
</td></tr>
<tr><td style="background:#f5f6f8;padding:20px 32px;text-align:center;border-top:1px solid #e4e7ec;">
<p style="font-size:11px;color:#858B94;margin:0;">
&copy; ${new Date().getFullYear()} Growarth Capita Consultants LLP. All rights reserved.
</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

function emailHtml(lead: {
  leadId: string;
  name: string;
  mobile: string;
  email: string;
  loanType: string;
  loanAmount: number;
  monthlySalary: number;
}): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 0; background: #f4f5f7;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding: 40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden;">
<tr><td style="background: #1a1a2e; padding: 24px 32px;">
<h1 style="color: #ffffff; font-size: 18px; margin: 0;">New Lead Generated</h1>
</td></tr>
<tr><td style="padding: 32px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom: 8px; font-size: 13px; color: #6b7280;">Lead ID</td>
<td style="padding-bottom: 8px; font-size: 14px; color: #1a1a2e; font-weight: 600; text-align: right;">${lead.leadId}</td></tr>
<tr><td style="padding-bottom: 8px; font-size: 13px; color: #6b7280; border-top: 1px solid #f0f0f0; padding-top: 8px;">Name</td>
<td style="padding-bottom: 8px; font-size: 14px; color: #1a1a2e; text-align: right; border-top: 1px solid #f0f0f0; padding-top: 8px;">${lead.name}</td></tr>
<tr><td style="padding-bottom: 8px; font-size: 13px; color: #6b7280; border-top: 1px solid #f0f0f0; padding-top: 8px;">Mobile</td>
<td style="padding-bottom: 8px; font-size: 14px; color: #1a1a2e; text-align: right; border-top: 1px solid #f0f0f0; padding-top: 8px;">${lead.mobile}</td></tr>
<tr><td style="padding-bottom: 8px; font-size: 13px; color: #6b7280; border-top: 1px solid #f0f0f0; padding-top: 8px;">Email</td>
<td style="padding-bottom: 8px; font-size: 14px; color: #1a1a2e; text-align: right; border-top: 1px solid #f0f0f0; padding-top: 8px;">${lead.email}</td></tr>
<tr><td style="padding-bottom: 8px; font-size: 13px; color: #6b7280; border-top: 1px solid #f0f0f0; padding-top: 8px;">Loan Type</td>
<td style="padding-bottom: 8px; font-size: 14px; color: #1a1a2e; text-align: right; border-top: 1px solid #f0f0f0; padding-top: 8px;">${lead.loanType}</td></tr>
<tr><td style="padding-bottom: 8px; font-size: 13px; color: #6b7280; border-top: 1px solid #f0f0f0; padding-top: 8px;">Loan Amount</td>
<td style="padding-bottom: 8px; font-size: 14px; color: #1a1a2e; font-weight: 600; text-align: right; border-top: 1px solid #f0f0f0; padding-top: 8px;">${formatCurrency(lead.loanAmount)}</td></tr>
<tr><td style="font-size: 13px; color: #6b7280; border-top: 1px solid #f0f0f0; padding-top: 8px;">Monthly Salary</td>
<td style="font-size: 14px; color: #1a1a2e; text-align: right; border-top: 1px solid #f0f0f0; padding-top: 8px;">${formatCurrency(lead.monthlySalary)}</td></tr>
</table>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

function whatsappMessage(lead: {
  leadId: string;
  name: string;
  mobile: string;
  loanType: string;
  loanAmount: number;
}): string {
  return (
    `🔔 *New Lead Generated* 🔔\n\n` +
    `📋 *Lead ID:* ${lead.leadId}\n` +
    `👤 *Name:* ${lead.name}\n` +
    `📞 *Mobile:* ${lead.mobile}\n` +
    `🏦 *Loan Type:* ${lead.loanType}\n` +
    `💰 *Loan Amount:* ${formatCurrency(lead.loanAmount)}\n\n` +
    `_Please contact the lead at the earliest._`
  );
}

async function sendMail(args: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    return { success: false, error: "SMTP not configured" };
  }
  try {
    const transporter = await createTransporter();
    await transporter.sendMail({
      from: `"Growarth Capita" <${process.env.SMTP_USER}>`,
      ...args,
    });
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown email error";
    return { success: false, error: msg };
  }
}

export async function sendLeadEmail(
  lead: InstanceType<typeof Lead>
): Promise<{ success: boolean; error?: string }> {
  const { leadId, name, mobile, email, loanType, loanAmount, monthlySalary } = lead;

  return sendMail({
    to: process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER || "",
    subject: `New Lead: ${leadId} — ${name} — ${loanType}`,
    html: emailHtml({ leadId, name, mobile, email, loanType, loanAmount, monthlySalary }),
  });
}

export async function sendLeadConfirmationToLead(
  lead: InstanceType<typeof Lead>
): Promise<{ success: boolean; error?: string }> {
  const { name, leadId, loanType, loanAmount, email } = lead;

  return sendMail({
    to: email,
    subject: `Thank you for your inquiry, ${name} — Growarth Capita`,
    html: confirmationEmailHtml({ name, leadId, loanType, loanAmount }),
  });
}

function connectorSignupEmailHtml(details: {
  name: string;
  mobile: string;
  email: string;
  city: string;
  networkType: string;
}): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#0066FF;padding:32px;text-align:center;">
<h1 style="color:#fff;font-size:20px;margin:0;">New Connector Signup</h1>
<p style="color:rgba(255,255,255,0.85);font-size:13px;margin:4px 0 0;">Pending Approval</p>
</td></tr>
<tr><td style="padding:32px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:8px;font-size:13px;color:#6F7580;">Name</td>
<td style="padding-bottom:8px;font-size:14px;color:#1C2026;font-weight:600;text-align:right;">${details.name}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;color:#6F7580;border-top:1px solid #e4e7ec;">Mobile</td>
<td style="padding:8px 0;font-size:14px;color:#1C2026;text-align:right;border-top:1px solid #e4e7ec;">${details.mobile}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;color:#6F7580;border-top:1px solid #e4e7ec;">Email</td>
<td style="padding:8px 0;font-size:14px;color:#1C2026;text-align:right;border-top:1px solid #e4e7ec;">${details.email}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;color:#6F7580;border-top:1px solid #e4e7ec;">City</td>
<td style="padding:8px 0;font-size:14px;color:#1C2026;text-align:right;border-top:1px solid #e4e7ec;">${details.city}</td></tr>
<tr><td style="padding-top:8px;font-size:13px;color:#6F7580;border-top:1px solid #e4e7ec;">Network Type</td>
<td style="padding-top:8px;font-size:14px;color:#1C2026;font-weight:600;text-align:right;border-top:1px solid #e4e7ec;">${details.networkType}</td></tr>
</table>
<p style="font-size:12px;color:#858B94;margin-top:24px;">Review and approve this connector from the admin panel.</p>
</td></tr>
<tr><td style="background:#f5f6f8;padding:16px 32px;text-align:center;border-top:1px solid #e4e7ec;">
<p style="font-size:11px;color:#858B94;margin:0;">&copy; ${new Date().getFullYear()} Growarth Capita Consultants LLP</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

function connectorLeadEmailHtml(lead: { name: string; leadId: string; loanType: string; loanAmount: number }): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#0066FF;padding:32px;text-align:center;">
<h1 style="color:#fff;font-size:20px;margin:0;">New Lead Referred!</h1>
<p style="color:rgba(255,255,255,0.85);font-size:13px;margin:4px 0 0;">Thank you for the referral</p>
</td></tr>
<tr><td style="padding:32px;">
<p style="font-size:14px;color:#1C2026;margin:0 0 16px;">A new lead has been referred through your link:</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;border-radius:12px;">
<tr><td style="padding:20px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:8px;font-size:13px;color:#6F7580;">Name</td>
<td style="padding-bottom:8px;font-size:14px;color:#1C2026;font-weight:600;text-align:right;">${lead.name}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;color:#6F7580;border-top:1px solid #e4e7ec;">Lead ID</td>
<td style="padding:8px 0;font-size:14px;color:#1C2026;text-align:right;border-top:1px solid #e4e7ec;">${lead.leadId}</td></tr>
<tr><td style="padding:8px 0;font-size:13px;color:#6F7580;border-top:1px solid #e4e7ec;">Loan Type</td>
<td style="padding:8px 0;font-size:14px;color:#1C2026;text-align:right;border-top:1px solid #e4e7ec;">${lead.loanType}</td></tr>
<tr><td style="padding-top:8px;font-size:13px;color:#6F7580;border-top:1px solid #e4e7ec;">Loan Amount</td>
<td style="padding-top:8px;font-size:14px;color:#1C2026;font-weight:600;text-align:right;border-top:1px solid #e4e7ec;">${formatCurrency(lead.loanAmount)}</td></tr>
</table>
</td></tr>
</table>
<p style="font-size:12px;color:#858B94;margin-top:20px;">We&apos;ll keep you updated on the status. Thank you for partnering with Growarth Capita!</p>
</td></tr>
<tr><td style="background:#f5f6f8;padding:16px 32px;text-align:center;border-top:1px solid #e4e7ec;">
<p style="font-size:11px;color:#858B94;margin:0;">&copy; ${new Date().getFullYear()} Growarth Capita Consultants LLP</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

export async function sendConnectorLeadNotification(
  lead: { name: string; leadId: string; email: string; loanType: string; loanAmount: number },
  connectorId: string
): Promise<void> {
  try {
    const Connector = (await import("@/models/Connector")).default;
    const connector = await Connector.findById(connectorId).select("email name").lean();
    if (!connector || !connector.email) return;

    await sendMail({
      to: connector.email,
      subject: `New lead referred — ${lead.name} — Thank you!`,
      html: connectorLeadEmailHtml(lead),
    });
  } catch {
    // silent — best-effort
  }
}

function commissionAccruedEmailHtml(lead: { name: string; leadId: string; loanType: string }, amount: number): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#0066FF;padding:32px;text-align:center;">
<h1 style="color:#fff;font-size:20px;margin:0;">Your Referral Was Approved!</h1>
</td></tr>
<tr><td style="padding:32px;text-align:center;">
<p style="font-size:14px;color:#1C2026;margin:0 0 8px;">Congratulations!</p>
<p style="font-size:14px;color:#5A5F68;margin:0 0 20px;">The lead you referred — <strong>${lead.name}</strong> (${lead.leadId}, ${lead.loanType}) — has been approved. A commission of <strong>${formatCurrency(amount)}</strong> has been accrued and is pending review.</p>
<p style="font-size:12px;color:#858B94;margin:0;">We&apos;ll notify you once the payout is processed.</p>
</td></tr>
<tr><td style="background:#f5f6f8;padding:16px 32px;text-align:center;border-top:1px solid #e4e7ec;">
<p style="font-size:11px;color:#858B94;margin:0;">&copy; ${new Date().getFullYear()} Growarth Capita Consultants LLP</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

export async function sendCommissionAccruedNotification(
  lead: { name: string; leadId: string; loanType: string; email?: string },
  connectorId: string,
  amount: number
): Promise<void> {
  try {
    const Connector = (await import("@/models/Connector")).default;
    const connector = await Connector.findById(connectorId).select("email").lean();
    if (!connector || !connector.email) return;
    await sendMail({
      to: connector.email,
      subject: `Your referral was approved — ${formatCurrency(amount)} commission pending review`,
      html: commissionAccruedEmailHtml(lead, amount),
    });
  } catch { /* best-effort */ }
}

function commissionRuleMissingHtml(lead: { name: string; leadId: string; loanType: string }): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#E02B3E;padding:24px 32px;text-align:center;">
<h1 style="color:#fff;font-size:18px;margin:0;">Commission Rule Missing</h1>
</td></tr>
<tr><td style="padding:32px;">
<p style="font-size:14px;color:#1C2026;margin:0 0 16px;">A connector-attributed lead was approved but no active commission rule exists for its loan type.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;border-radius:12px;">
<tr><td style="padding:16px;">
<p style="font-size:13px;color:#5A5F68;margin:0 0 4px;">Lead: <strong>${lead.name}</strong> (${lead.leadId})</p>
<p style="font-size:13px;color:#5A5F68;margin:0;">Loan Type: <strong>${lead.loanType}</strong></p>
</td></tr>
</table>
<p style="font-size:12px;color:#858B94;margin-top:16px;">Action required: Create or activate a commission rule for this loan type.</p>
</td></tr>
<tr><td style="background:#f5f6f8;padding:16px 32px;text-align:center;border-top:1px solid #e4e7ec;">
<p style="font-size:11px;color:#858B94;margin:0;">&copy; ${new Date().getFullYear()} Growarth Capita Consultants LLP</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

export async function sendCommissionRuleMissingNotification(
  lead: { name: string; leadId: string; loanType: string },
  connectorId: string
): Promise<void> {
  try {
    const Connector = (await import("@/models/Connector")).default;
    const connector = await Connector.findById(connectorId).select("name").lean();
    const User = (await import("@/models/User")).default;
    const admins = await User.find({ active: true, role: { $in: ["MANAGER", "SUPER_ADMIN"] } }).select("email").lean();
    const subject = `[ACTION REQUIRED] Commission rule missing for ${lead.leadId}`;
    const html = commissionRuleMissingHtml(lead);
    await Promise.allSettled(admins.map((a) => sendMail({ to: a.email, subject, html }).catch(() => {})));
  } catch { /* best-effort */ }
}

function payoutFlaggedHtml(lead: { name: string; leadId: string; loanType: string }, status: string): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#F47B20;padding:24px 32px;text-align:center;">
<h1 style="color:#fff;font-size:18px;margin:0;">Commission Flagged for Review</h1>
</td></tr>
<tr><td style="padding:32px;">
<p style="font-size:14px;color:#1C2026;margin:0 0 16px;">A connector-attributed lead was moved to <strong>${status}</strong> after a payout was already created.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;border-radius:12px;">
<tr><td style="padding:16px;">
<p style="font-size:13px;color:#5A5F68;margin:0 0 4px;">Lead: <strong>${lead.name}</strong> (${lead.leadId})</p>
<p style="font-size:13px;color:#5A5F68;margin:0;">Loan Type: <strong>${lead.loanType}</strong></p>
</td></tr>
</table>
<p style="font-size:12px;color:#858B94;margin-top:16px;">Action required: Review this payout manually and decide whether to reverse it.</p>
</td></tr>
<tr><td style="background:#f5f6f8;padding:16px 32px;text-align:center;border-top:1px solid #e4e7ec;">
<p style="font-size:11px;color:#858B94;margin:0;">&copy; ${new Date().getFullYear()} Growarth Capita Consultants LLP</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

export async function sendPayoutFlaggedNotification(
  lead: { name: string; leadId: string; loanType: string },
  newStatus: string
): Promise<void> {
  try {
    const User = (await import("@/models/User")).default;
    const admins = await User.find({ active: true, role: { $in: ["MANAGER", "SUPER_ADMIN"] } }).select("email").lean();
    const subject = `[REVIEW REQUIRED] Commission payout flagged for ${lead.leadId}`;
    const html = payoutFlaggedHtml(lead, newStatus);
    await Promise.allSettled(admins.map((a) => sendMail({ to: a.email, subject, html }).catch(() => {})));
  } catch { /* best-effort */ }
}

export async function sendConnectorSignupNotifications(details: {
  name: string;
  mobile: string;
  email: string;
  city: string;
  networkType: string;
}): Promise<void> {
  const User = (await import("@/models/User")).default;
  const admins = await User.find({ active: true, role: { $in: ["MANAGER", "SUPER_ADMIN"] } }).select("email name").lean();

  const subject = `New Connector Signup: ${details.name} — ${details.networkType}`;
  const html = connectorSignupEmailHtml(details);

  const emailPromises = admins.map((admin) =>
    sendMail({ to: admin.email, subject, html }).catch(() => {})
  );

  const whatsappMessage =
    `🔔 *New Connector Signup*\n\n` +
    `👤 *Name:* ${details.name}\n` +
    `📞 *Mobile:* ${details.mobile}\n` +
    `📧 *Email:* ${details.email}\n` +
    `🏙 *City:* ${details.city}\n` +
    `🏷 *Type:* ${details.networkType}\n\n` +
    `_Review in admin panel._`;

  if (process.env.WHATSAPP_API_KEY && process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_TO) {
    emailPromises.push(
      (async () => {
        try {
          await fetch(`https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: process.env.WHATSAPP_TO,
              type: "text",
              text: { body: whatsappMessage },
            }),
          });
        } catch { /* best-effort */ }
      })()
    );
  }

  await Promise.allSettled(emailPromises);
}

export async function sendLeadWhatsApp(
  lead: InstanceType<typeof Lead>
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.WHATSAPP_API_KEY) {
    return { success: false, error: "WhatsApp not configured" };
  }

  try {
    const { leadId, name, mobile, loanType, loanAmount } = lead;
    const message = whatsappMessage({ leadId, name, mobile, loanType, loanAmount });

    if (process.env.WHATSAPP_API_KEY && process.env.WHATSAPP_PHONE_ID) {
      const res = await fetch(
        `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: process.env.WHATSAPP_TO || "",
            type: "text",
            text: { body: message },
          }),
        }
      );

      if (!res.ok) {
        const body = await res.text();
        return { success: false, error: `WhatsApp API error: ${body}` };
      }
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown WhatsApp error";
    return { success: false, error: msg };
  }
}

// ─── Connector Signup Confirmation (under review) ──────────────────

function connectorUnderReviewHtml(details: { name: string }): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#1a1a2e;padding:24px 32px;text-align:center;">
<h1 style="color:#fff;font-size:18px;margin:0;">Application Under Review</h1>
</td></tr>
<tr><td style="padding:32px;text-align:center;">
<p style="font-size:14px;color:#1C2026;margin:0 0 12px;">Dear <strong>${details.name}</strong>,</p>
<p style="font-size:14px;color:#5A5F68;margin:0 0 8px;">Thank you for signing up as a Connector Partner!</p>
<p style="font-size:14px;color:#5A5F68;margin:0;">Your application is currently under review by our team. We will notify you once it has been approved.</p>
</td></tr>
<tr><td style="background:#f5f6f8;padding:16px 32px;text-align:center;border-top:1px solid #e4e7ec;">
<p style="font-size:11px;color:#858B94;margin:0;">&copy; ${new Date().getFullYear()} Growarth Capita Consultants LLP</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

export async function sendConnectorSignupConfirmation(connector: {
  name: string;
  email: string;
}): Promise<void> {
  try {
    await sendMail({
      to: connector.email,
      subject: `Application under review — Growarth Capita`,
      html: connectorUnderReviewHtml({ name: connector.name }),
    });
  } catch { /* best-effort */ }
}

// ─── Connector Status Change Notifications ──────────────────────────

function connectorApprovedHtml(connector: { name: string; connectorCode: string }): string {
  const referralLink = `https://loans.growarthcapita.com/?ref=${connector.connectorCode}`;
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#0066FF;padding:32px;text-align:center;">
<h1 style="color:#fff;font-size:20px;margin:0;">You&rsquo;re Approved!</h1>
<p style="color:rgba(255,255,255,0.85);font-size:13px;margin:6px 0 0;">Welcome to the Growarth Capita Connector Network</p>
</td></tr>
<tr><td style="padding:32px;">
<p style="font-size:14px;color:#1C2026;margin:0 0 16px;">Dear <strong>${connector.name}</strong>,</p>
<p style="font-size:14px;color:#5A5F68;margin:0 0 16px;">Your connector application has been approved! You can now start referring loans and earning commissions.</p>
<p style="font-size:14px;color:#5A5F68;margin:0 0 8px;">Your unique referral link:</p>
<p style="font-size:16px;color:#0066FF;font-weight:600;margin:0 0 20px;word-break:break-all;">${referralLink}</p>
<p style="font-size:12px;color:#858B94;margin:0;">Share this link with your network to earn commissions.</p>
</td></tr>
<tr><td style="background:#f5f6f8;padding:16px 32px;text-align:center;border-top:1px solid #e4e7ec;">
<p style="font-size:11px;color:#858B94;margin:0;">&copy; ${new Date().getFullYear()} Growarth Capita Consultants LLP</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

function connectorStatusHtml(connector: { name: string }, status: string): string {
  const messages: Record<string, { title: string; body: string }> = {
    REJECTED: { title: "Application Update", body: "Your connector application has been reviewed and was not approved at this time." },
    SUSPENDED: { title: "Account Suspended", body: "Your connector account has been suspended. Please contact support for more information." },
    ACTIVE: { title: "Account Reactivated", body: "Your connector account has been reactivated. You can resume referring loans." },
  };
  const msg = messages[status] || { title: "Account Update", body: "Your connector account status has been updated." };
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#1a1a2e;padding:24px 32px;text-align:center;">
<h1 style="color:#fff;font-size:18px;margin:0;">${msg.title}</h1>
</td></tr>
<tr><td style="padding:32px;text-align:center;">
<p style="font-size:14px;color:#1C2026;margin:0 0 8px;">Dear <strong>${connector.name}</strong>,</p>
<p style="font-size:14px;color:#5A5F68;margin:0;">${msg.body}</p>
</td></tr>
<tr><td style="background:#f5f6f8;padding:16px 32px;text-align:center;border-top:1px solid #e4e7ec;">
<p style="font-size:11px;color:#858B94;margin:0;">&copy; ${new Date().getFullYear()} Growarth Capita Consultants LLP</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

export async function sendConnectorStatusNotification(
  connectorId: string,
  newStatus: string
): Promise<void> {
  try {
    const Connector = (await import("@/models/Connector")).default;
    const connector = await Connector.findById(connectorId).select("name email connectorCode").lean();
    if (!connector || !connector.email) return;

    if (newStatus === "ACTIVE") {
      await sendMail({
        to: connector.email,
        subject: `You're approved! Start referring loans — Growarth Capita`,
        html: connectorApprovedHtml({ name: connector.name, connectorCode: connector.connectorCode }),
      });
    } else {
      await sendMail({
        to: connector.email,
        subject: `Connector account ${newStatus.toLowerCase()} — Growarth Capita`,
        html: connectorStatusHtml({ name: connector.name }, newStatus),
      });
    }
  } catch { /* best-effort */ }
}

// ─── Payout Processed Notification ──────────────────────────────────

function payoutProcessedHtml(details: { amount: number; paymentReference: string; leadName: string }): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#0066FF;padding:24px 32px;text-align:center;">
<h1 style="color:#fff;font-size:18px;margin:0;">Payout Processed!</h1>
</td></tr>
<tr><td style="padding:32px;text-align:center;">
<p style="font-size:14px;color:#1C2026;margin:0 0 16px;">Your commission payment has been processed.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;border-radius:12px;">
<tr><td style="padding:16px;">
<p style="font-size:13px;color:#5A5F68;margin:0 0 4px;">Lead: <strong>${details.leadName}</strong></p>
<p style="font-size:13px;color:#5A5F68;margin:0 0 4px;">Amount: <strong>₹${details.amount.toLocaleString("en-IN")}</strong></p>
<p style="font-size:13px;color:#5A5F68;margin:0;">Ref: ${details.paymentReference}</p>
</td></tr>
</table>
<p style="font-size:12px;color:#858B94;margin-top:16px;">Thank you for partnering with Growarth Capita!</p>
</td></tr>
<tr><td style="background:#f5f6f8;padding:16px 32px;text-align:center;border-top:1px solid #e4e7ec;">
<p style="font-size:11px;color:#858B94;margin:0;">&copy; ${new Date().getFullYear()} Growarth Capita Consultants LLP</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

export async function sendPayoutProcessedNotification(
  connectorId: string,
  details: { amount: number; paymentReference: string; leadName: string }
): Promise<void> {
  try {
    const Connector = (await import("@/models/Connector")).default;
    const connector = await Connector.findById(connectorId).select("email name").lean();
    if (!connector || !connector.email) return;

    await sendMail({
      to: connector.email,
      subject: `Payout processed — ₹${details.amount.toLocaleString("en-IN")}`,
      html: payoutProcessedHtml(details),
    });
  } catch { /* best-effort */ }
}

// ─── Pending Payout Digest ─────────────────────────────────────────

function pendingPayoutDigestHtml(pendingCount: number, connectors: string[]): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#F47B20;padding:24px 32px;text-align:center;">
<h1 style="color:#fff;font-size:18px;margin:0;">Payouts Awaiting Approval</h1>
</td></tr>
<tr><td style="padding:32px;">
<p style="font-size:14px;color:#1C2026;margin:0 0 16px;"><strong>${pendingCount}</strong> payout(s) from ${connectors.length} connector(s) are pending review.</p>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f6f8;border-radius:12px;">
<tr><td style="padding:16px;">
<p style="font-size:13px;color:#5A5F68;margin:0 0 4px;">Connectors with pending payouts:</p>
${connectors.map((c) => `<p style="font-size:13px;color:#1C2026;margin:0 0 2px;">&bull; ${c}</p>`).join("")}
</td></tr>
</table>
<p style="font-size:12px;color:#858B94;margin-top:16px;">Review and approve payouts in the admin panel.</p>
</td></tr>
<tr><td style="background:#f5f6f8;padding:16px 32px;text-align:center;border-top:1px solid #e4e7ec;">
<p style="font-size:11px;color:#858B94;margin:0;">&copy; ${new Date().getFullYear()} Growarth Capita Consultants LLP</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

export async function sendPendingPayoutDigest(): Promise<void> {
  try {
    const ConnectorPayout = (await import("@/models/ConnectorPayout")).default;
    const Connector = (await import("@/models/Connector")).default;
    const User = (await import("@/models/User")).default;

    const pendingPayouts = await ConnectorPayout.find({ status: "PENDING" })
      .populate("connectorId", "name connectorCode")
      .lean();

    if (pendingPayouts.length === 0) return;

    const connectorNames = new Set<string>();
    for (const p of pendingPayouts) {
      const c = p.connectorId as unknown as { name: string };
      if (c?.name) connectorNames.add(c.name);
    }

    const admins = await User.find({ active: true, role: { $in: ["MANAGER", "SUPER_ADMIN"] } })
      .select("email")
      .lean();

    const subject = `[Digest] ${pendingPayouts.length} payout(s) pending approval`;
    const html = pendingPayoutDigestHtml(pendingPayouts.length, Array.from(connectorNames));

    await Promise.allSettled(
      admins.map((a) => sendMail({ to: a.email, subject, html }).catch(() => {}))
    );
  } catch { /* best-effort */ }
}
