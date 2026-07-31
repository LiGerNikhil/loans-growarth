import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import Activity from "@/models/Activity";
import mongoose from "mongoose";
import { getConnectorSession } from "@/lib/connect-auth";

const STATUS_MAP: Record<string, string> = {
  APPROVED: "Approved",
  NEW: "In Progress",
  CONTACTED: "In Progress",
  FOLLOW_UP: "In Progress",
  DOCUMENT_PENDING: "In Progress",
  UNDER_REVIEW: "In Progress",
  REJECTED: "Not Progressed",
  CLOSED: "Not Progressed",
};

function maskLeadId(leadId: string): string {
  const parts = leadId.split("-");
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    parts[parts.length - 1] = last.slice(-4).padStart(last.length, "X");
    return parts.join("-");
  }
  return "XXXX-XXXX";
}

type LeadDoc = {
  _id: mongoose.Types.ObjectId;
  leadId: string;
  loanType: string;
  status: string;
  createdAt?: Date;
};

export async function GET(request: NextRequest) {
  const session = await getConnectorSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const leads = await Lead.find(
    { connectorId: new mongoose.Types.ObjectId(session.connectorId) },
    "leadId name loanType status createdAt"
  )
    .sort({ createdAt: -1 })
    .lean() as unknown as (LeadDoc & { name: string })[];

  const data = leads.map((l) => ({
    _id: l._id.toString(),
    leadId: maskLeadId(l.leadId),
    name: l.name,
    loanType: l.loanType,
    status: STATUS_MAP[l.status] || "In Progress",
    dateReferred: l.createdAt,
  }));

  return NextResponse.json({ leads: data });
}

export async function POST(request: NextRequest) {
  const session = await getConnectorSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = (body.name as string || "").trim();
  const mobile = (body.mobile as string || "").trim();
  const loanType = (body.loanType as string || "").trim();
  const email = (body.email as string || "").trim();
  const monthlySalary = typeof body.monthlySalary === "number" ? body.monthlySalary : Number(body.monthlySalary) || 0;
  const loanAmount = typeof body.loanAmount === "number" ? body.loanAmount : Number(body.loanAmount) || 0;
  const city = (body.city as string || "").trim();
  const notes = (body.notes as string || "").trim();

  if (!name) {
    return NextResponse.json({ error: "Lead name is required" }, { status: 400 });
  }
  if (!/^\d{10}$/.test(mobile)) {
    return NextResponse.json({ error: "Valid 10-digit mobile number is required" }, { status: 400 });
  }
  if (!loanType) {
    return NextResponse.json({ error: "Loan type is required" }, { status: 400 });
  }

  const VALID_LOAN_TYPES = [
    "Personal Loan", "Business Loan", "Loan Against Property",
    "Overdraft Facility", "Home Loan", "Other",
  ];
  if (!VALID_LOAN_TYPES.includes(loanType)) {
    return NextResponse.json({ error: "Invalid loan type" }, { status: 400 });
  }

  await dbConnect();

  const lead = (await Lead.create({
    name,
    mobile,
    email: email || "",
    monthlySalary,
    loanAmount,
    loanType: loanType as "Personal Loan" | "Business Loan" | "Loan Against Property" | "Overdraft Facility" | "Home Loan" | "Other",
    source: "Connector",
    connectorId: new mongoose.Types.ObjectId(session.connectorId),
    status: "NEW" as const,
    remarks: notes ? [{ text: `Note from connector: ${notes}`, author: session.name, createdAt: new Date() }] : [],
  })) as { _id: mongoose.Types.ObjectId; leadId: string };

  await Activity.create({
    leadId: lead._id,
    actionType: "LEAD_CREATED",
    description: `Lead ${lead.leadId} submitted by connector ${session.name} (${session.connectorCode}) — ${name}, ${loanType}`,
  });

  try {
    const ConnectorModel = await import("@/models/Connector").then((m) => m.default);
    await ConnectorModel.findByIdAndUpdate(session.connectorId, { $inc: { totalLeadsReferred: 1 } });
  } catch {
    // silent
  }

  return NextResponse.json({ success: true, leadId: lead.leadId });
}
