import { NextResponse } from "next/server";
import { sendPendingPayoutDigest } from "@/lib/notifications";

// Simple in-memory cooldown to prevent duplicate digests within the same day
let lastDigestDate = "";

export async function POST() {
  const today = new Date().toISOString().slice(0, 10);

  if (lastDigestDate === today) {
    return NextResponse.json({ success: true, skipped: true, reason: "Digest already sent today" });
  }

  await sendPendingPayoutDigest();

  lastDigestDate = today;

  return NextResponse.json({ success: true, skipped: false });
}
