import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ConnectorPayout from "@/models/ConnectorPayout";
import { getConnectorSession } from "@/lib/connect-auth";

export async function GET(request: NextRequest) {
  const session = await getConnectorSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const payouts = await ConnectorPayout.find(
    { connectorId: session.connectorId },
    { status: 1, commissionAmount: 1, paidAt: 1, createdAt: 1 }
  )
    .sort({ createdAt: -1 })
    .lean();

  let pendingTotal = 0;
  let approvedTotal = 0;
  let paidTotal = 0;
  const paidList: { amount: number; paidAt: string | null }[] = [];

  for (const p of payouts) {
    if (p.status === "PENDING") pendingTotal += p.commissionAmount;
    if (p.status === "APPROVED") approvedTotal += p.commissionAmount;
    if (p.status === "PAID") {
      paidTotal += p.commissionAmount;
      paidList.push({ amount: p.commissionAmount, paidAt: p.paidAt?.toISOString() ?? null });
    }
  }

  const runningTotal = pendingTotal + approvedTotal + paidTotal;

  return NextResponse.json({
    pendingTotal,
    approvedTotal,
    paidTotal,
    paidList,
    runningTotal,
  });
}
