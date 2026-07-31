import { NextResponse } from "next/server";
import { clearConnectorSessionCookie } from "@/lib/connect-auth";

export async function POST() {
  await clearConnectorSessionCookie();
  return NextResponse.json({ success: true });
}
