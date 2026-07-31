import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Connector from "@/models/Connector";
import { getConnectorSession } from "@/lib/connect-auth";
import { decrypt } from "@/lib/encryption";

const UPDATABLE_FIELDS = ["name", "email", "city", "networkType"] as const;

export async function GET(request: NextRequest) {
  const session = await getConnectorSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const connector = await Connector.findById(session.connectorId).lean();
  if (!connector) {
    return NextResponse.json({ error: "Connector not found" }, { status: 404 });
  }

  if (connector.bankDetails) {
    const bd = connector.bankDetails;
    if (bd.accountNumber?.startsWith("ENC:")) bd.accountNumber = decrypt(bd.accountNumber.slice(4));
    if (bd.ifsc?.startsWith("ENC:")) bd.ifsc = decrypt(bd.ifsc.slice(4));
    if (bd.accountHolderName?.startsWith("ENC:")) bd.accountHolderName = decrypt(bd.accountHolderName.slice(4));
  }

  return NextResponse.json({
    name: connector.name,
    mobile: connector.mobile,
    email: connector.email,
    city: connector.city,
    networkType: connector.networkType,
    status: connector.status,
    bankDetails: connector.bankDetails || null,
  });
}

export async function PATCH(request: NextRequest) {
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

  if (body.mobile !== undefined) {
    return NextResponse.json(
      { error: "Mobile number change requires OTP verification. Use the mobile change flow." },
      { status: 422 }
    );
  }

  const update: Record<string, unknown> = {};

  for (const field of UPDATABLE_FIELDS) {
    if (body[field] !== undefined) {
      update[field] = body[field];
    }
  }

  let hasBank = false;
  let bankData: Record<string, unknown> = {};
  if (body.bankDetails && typeof body.bankDetails === "object") {
    const bd = body.bankDetails as Record<string, unknown>;
    if (bd.accountNumber || bd.ifsc || bd.accountHolderName) {
      hasBank = true;
      bankData = { accountNumber: bd.accountNumber, ifsc: bd.ifsc, accountHolderName: bd.accountHolderName };
    }
  }

  if (Object.keys(update).length === 0 && !hasBank) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

  await dbConnect();

  const connector = await Connector.findById(session.connectorId);
  if (!connector) {
    return NextResponse.json({ error: "Connector not found" }, { status: 404 });
  }

  Object.assign(connector, update);

  if (hasBank) {
    connector.set("bankDetails", {
      accountNumber: bankData.accountNumber as string,
      ifsc: bankData.ifsc as string,
      accountHolderName: bankData.accountHolderName as string,
    });
  }

  await connector.save();

  return NextResponse.json({ success: true });
}
