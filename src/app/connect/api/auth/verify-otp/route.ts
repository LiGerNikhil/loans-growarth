import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import Connector from "@/models/Connector";
import OtpRequest from "@/models/OtpRequest";
import { signConnectorToken, setConnectorSessionCookie } from "@/lib/connect-auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const body = await request.json();
  const email: string = (body.email || "").toLowerCase().trim();
  const otp: string = (body.otp || "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  if (!/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: "Invalid OTP format" }, { status: 400 });
  }

  const rateKey = `verify:${ip}:${email}`;
  const { allowed } = checkRateLimit(rateKey);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }

  await dbConnect();

  const otpHash = crypto.createHash("sha256").update(`${otp}:${process.env.AUTH_SECRET}`).digest("hex");

  const otpRequest = await OtpRequest.findOne({
    email,
    expiresAt: { $gt: new Date() },
    verified: false,
  }).sort({ createdAt: -1 });

  if (!otpRequest || otpRequest.otpHash !== otpHash) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
  }

  otpRequest.verified = true;
  await otpRequest.save();

  const connector = await Connector.findOne({ email, status: "ACTIVE" }).select("name connectorCode");
  if (!connector) {
    return NextResponse.json({ error: "Connector account not found" }, { status: 404 });
  }

  const token = await signConnectorToken({
    connectorId: connector._id.toString(),
    email,
    name: connector.name,
    connectorCode: connector.connectorCode,
    type: "connector",
  });

  await setConnectorSessionCookie(token);

  resetRateLimit(rateKey);

  return NextResponse.json({ success: true, redirect: "/connect/dashboard" });
}
