import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dbConnect from "@/lib/mongodb";
import Connector from "@/models/Connector";
import OtpRequest from "@/models/OtpRequest";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limiter";

function otpEmailHtml(name: string, otp: string): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px;">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
<tr><td style="background:#0066FF;padding:32px;text-align:center;">
<h1 style="color:#fff;font-size:20px;margin:0;">Connector Login OTP</h1>
</td></tr>
<tr><td style="padding:32px;text-align:center;">
<p style="font-size:14px;color:#1C2026;margin:0 0 16px;">Hello <strong>${name}</strong>,</p>
<p style="font-size:14px;color:#5A5F68;margin:0 0 24px;">Use the OTP below to sign in to your Connector dashboard. It expires in 5 minutes.</p>
<div style="background:#f5f6f8;border-radius:12px;padding:24px;margin-bottom:24px;display:inline-block;">
<span style="font-size:32px;font-weight:700;color:#1C2026;letter-spacing:8px;">${otp}</span>
</div>
<p style="font-size:12px;color:#858B94;margin:0;">If you did not request this, please ignore this email.</p>
</td></tr>
<tr><td style="background:#f5f6f8;padding:16px 32px;text-align:center;border-top:1px solid #e4e7ec;">
<p style="font-size:11px;color:#858B94;margin:0;">&copy; ${new Date().getFullYear()} Growarth Capita Consultants LLP</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const body = await request.json();
  const email: string = (body.email || "").toLowerCase().trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const rateKey = `otp:${ip}:${email}`;
  const { allowed } = checkRateLimit(rateKey);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  await dbConnect();

  const connector = await Connector.findOne({ email, status: "ACTIVE" }).select("name connectorCode");
  if (!connector) {
    return NextResponse.json({ error: "No active connector found for this email" }, { status: 404 });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = crypto.createHash("sha256").update(`${otp}:${process.env.AUTH_SECRET}`).digest("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await OtpRequest.create({ email, otpHash, expiresAt });

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log(`[EMAIL] OTP for ${email}: ${otp}`);
  } else {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: `"Growarth Capita" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your Connector Login OTP — Growarth Capita",
        html: otpEmailHtml(connector.name, otp),
      });
    } catch {
      return NextResponse.json({ error: "Failed to send OTP email. Please try again." }, { status: 500 });
    }
  }

  resetRateLimit(rateKey);

  return NextResponse.json({ success: true, message: "OTP sent to your email" });
}
