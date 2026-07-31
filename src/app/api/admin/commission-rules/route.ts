import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CommissionRule, { type ICommissionRule } from "@/models/CommissionRule";
import Activity from "@/models/Activity";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import mongoose from "mongoose";

const LOAN_TYPES = [
  "Personal Loan", "Business Loan", "Loan Against Property",
  "Overdraft Facility", "Home Loan", "Other",
] as const;

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx || !can(ctx.role, "manage_connectors")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const rules = await CommissionRule.find()
    .populate("createdBy", "name email")
    .sort({ loanType: 1, effectiveFrom: -1 })
    .lean();

  const grouped: Record<string, typeof rules> = {};
  for (const rule of rules) {
    if (!grouped[rule.loanType]) grouped[rule.loanType] = [];
    grouped[rule.loanType].push(rule);
  }

  return NextResponse.json({ rules, grouped });
}

export async function POST(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx || !can(ctx.role, "manage_connectors")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    loanType?: string;
    commissionType?: string;
    value?: number;
    effectiveFrom?: string;
    ruleId?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.loanType || !(LOAN_TYPES as readonly string[]).includes(body.loanType)) {
    return NextResponse.json({ error: "Invalid loanType" }, { status: 400 });
  }

  if (!body.commissionType || !["FLAT", "PERCENTAGE"].includes(body.commissionType)) {
    return NextResponse.json({ error: "commissionType must be FLAT or PERCENTAGE" }, { status: 400 });
  }

  if (!body.value || body.value <= 0) {
    return NextResponse.json({ error: "value must be a positive number" }, { status: 400 });
  }

  if (!body.effectiveFrom) {
    return NextResponse.json({ error: "effectiveFrom is required" }, { status: 400 });
  }

  await dbConnect();

  const effectiveFrom = new Date(body.effectiveFrom);

  const loanType = body.loanType as ICommissionRule["loanType"];
  const commissionType = body.commissionType as ICommissionRule["commissionType"];

  // Deactivate the prior active rule for this loanType
  await CommissionRule.updateMany(
    { loanType, active: true },
    { $set: { active: false } }
  );

  const rule = await CommissionRule.create({
    loanType,
    commissionType,
    value: body.value,
    effectiveFrom,
    active: true,
    createdBy: new mongoose.Types.ObjectId(ctx.userId),
  });

  await Activity.create({
    actionType: "COMMISSION_RULE_UPDATED",
    performedBy: new mongoose.Types.ObjectId(ctx.userId),
    description: `${ctx.name} ${body.ruleId ? "updated" : "created"} commission rule for ${loanType}: ${commissionType === "FLAT" ? "₹" : ""}${body.value}${commissionType === "PERCENTAGE" ? "%" : ""} (effective ${effectiveFrom.toLocaleDateString("en-IN")})`,
  });

  return NextResponse.json({ success: true, rule });
}
