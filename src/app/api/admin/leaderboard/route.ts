import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import { computeLeaderboard } from "@/lib/leaderboard";

export async function GET(request: NextRequest) {
  const ctx = await getAuthContext();
  if (!ctx || !can(ctx.role, "manage_connectors")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get("month") || "";

  let year: number;
  let month: number;

  if (/^\d{4}-\d{2}$/.test(monthParam)) {
    year = parseInt(monthParam.slice(0, 4), 10);
    month = parseInt(monthParam.slice(5, 7), 10) - 1;
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  const leaderboard = await computeLeaderboard(year, month);

  return NextResponse.json({ leaderboard, year, month });
}
