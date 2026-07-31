import { NextRequest, NextResponse } from "next/server";
import { getDashboardMetrics, getAuthContext } from "@/lib/dashboard";

export async function GET(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") || "daily") as "daily" | "weekly" | "monthly";

  const metrics = await getDashboardMetrics(ctx.role, ctx.userId, period);

  return NextResponse.json(metrics);
}
