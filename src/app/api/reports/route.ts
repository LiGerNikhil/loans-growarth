import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import { getReports } from "@/lib/reports";

export async function GET(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "access_reports")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const networkType = searchParams.get("networkType") || undefined;

  const data = await getReports(ctx.role, ctx.userId, dateFrom, dateTo, networkType);
  return NextResponse.json(data);
}
