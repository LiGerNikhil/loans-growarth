import { NextRequest, NextResponse } from "next/server";
import { getConnectorSession } from "@/lib/connect-auth";
import { getConnectorRank } from "@/lib/leaderboard";

export async function GET(request: NextRequest) {
  const session = await getConnectorSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const result = await getConnectorRank(
    session.connectorId,
    now.getFullYear(),
    now.getMonth()
  );

  return NextResponse.json(result);
}
