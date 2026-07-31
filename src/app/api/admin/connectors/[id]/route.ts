import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Connector from "@/models/Connector";
import Lead from "@/models/Lead";
import ConnectorPayout from "@/models/ConnectorPayout";
import Activity from "@/models/Activity";
import User from "@/models/User";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import { decrypt } from "@/lib/encryption";
import mongoose from "mongoose";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function decryptBankDetails(bd: any) {
  if (!bd) return;
  if (bd.accountNumber?.startsWith("ENC:")) bd.accountNumber = decrypt(bd.accountNumber.slice(4));
  if (bd.ifsc?.startsWith("ENC:")) bd.ifsc = decrypt(bd.ifsc.slice(4));
  if (bd.accountHolderName?.startsWith("ENC:")) bd.accountHolderName = decrypt(bd.accountHolderName.slice(4));
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  if (!ctx || !can(ctx.role, "manage_connectors")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  await dbConnect();

  const connector = await Connector.findById(id).lean();
  if (!connector) {
    return NextResponse.json({ error: "Connector not found" }, { status: 404 });
  }

  decryptBankDetails(connector.bankDetails);

  const [leads, payouts, activities] = await Promise.all([
    Lead.find({ connectorId: id })
      .select("leadId name mobile email loanType loanAmount status assignedTo createdAt")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .lean(),
    ConnectorPayout.find({ connectorId: id })
      .sort({ createdAt: -1 })
      .lean(),
    Activity.find({ description: { $regex: connector.connectorCode, $options: "i" } })
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean(),
    User.find({ active: true, role: { $in: ["AGENT", "MANAGER"] } })
      .select("name email")
      .lean(),
  ]);

  return NextResponse.json({
    connector,
    leads,
    payouts,
    activities,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthContext();
  if (!ctx || !can(ctx.role, "manage_connectors")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  await dbConnect();

  const connector = await Connector.findById(id);
  if (!connector) {
    return NextResponse.json({ error: "Connector not found" }, { status: 404 });
  }

  const body = await request.json();
  const { bankDetails } = body;

  if (bankDetails !== undefined) {
    connector.bankDetails = {
      accountHolderName: bankDetails.accountHolderName || "",
      accountNumber: bankDetails.accountNumber || "",
      ifsc: bankDetails.ifsc || "",
    };
  }

  await connector.save();

  return NextResponse.json({ success: true });
}
