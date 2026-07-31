import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";
import ConnectorPayout from "@/models/ConnectorPayout";
import Connector from "@/models/Connector";

export interface LeaderboardEntry {
  rank: number;
  connectorId: string;
  connectorName: string;
  connectorCode: string;
  totalLeadsReferred: number;
  approvedLeads: number;
  conversionRate: number;
  totalCommission: number;
}

function monthBounds(year: number, month: number): { start: Date; end: Date } {
  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 1),
  };
}

export async function computeLeaderboard(
  year: number,
  month: number
): Promise<LeaderboardEntry[]> {
  const { start, end } = monthBounds(year, month);

  await dbConnect();

  const [leadAgg, payoutAgg, connectors] = await Promise.all([
    Lead.aggregate([
      {
        $match: {
          connectorId: { $ne: null, $exists: true },
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$connectorId",
          totalLeads: { $sum: 1 },
          approvedLeads: {
            $sum: { $cond: [{ $eq: ["$status", "APPROVED"] }, 1, 0] },
          },
        },
      },
    ]),
    ConnectorPayout.aggregate([
      {
        $match: {
          status: { $in: ["APPROVED", "PAID"] },
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$connectorId",
          totalCommission: { $sum: "$commissionAmount" },
        },
      },
    ]),
    Connector.find({})
      .select("name connectorCode")
      .lean(),
  ]);

  const payoutMap = new Map<string, number>();
  for (const p of payoutAgg) {
    payoutMap.set(p._id.toString(), p.totalCommission);
  }

  const connectorMap = new Map<string, { name: string; connectorCode: string }>();
  for (const c of connectors) {
    connectorMap.set(c._id.toString(), {
      name: c.name,
      connectorCode: c.connectorCode,
    });
  }

  const merged: Omit<LeaderboardEntry, "rank">[] = [];

  for (const l of leadAgg) {
    const cid = l._id.toString();
    const info = connectorMap.get(cid);
    if (!info) continue;

    merged.push({
      connectorId: cid,
      connectorName: info.name,
      connectorCode: info.connectorCode,
      totalLeadsReferred: l.totalLeads,
      approvedLeads: l.approvedLeads,
      conversionRate:
        l.totalLeads > 0
          ? Math.round((l.approvedLeads / l.totalLeads) * 10000) / 100
          : 0,
      totalCommission: payoutMap.get(cid) || 0,
    });
  }

  // Add connectors with commission but no leads (edge case)
  for (const [cid, commission] of payoutMap) {
    if (!merged.find((m) => m.connectorId === cid)) {
      const info = connectorMap.get(cid);
      if (info) {
        merged.push({
          connectorId: cid,
          connectorName: info.name,
          connectorCode: info.connectorCode,
          totalLeadsReferred: 0,
          approvedLeads: 0,
          conversionRate: 0,
          totalCommission: commission,
        });
      }
    }
  }

  // Sort: totalLeads desc, then totalCommission desc
  merged.sort((a, b) => {
    if (b.totalLeadsReferred !== a.totalLeadsReferred)
      return b.totalLeadsReferred - a.totalLeadsReferred;
    return b.totalCommission - a.totalCommission;
  });

  return merged.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

export async function getConnectorRank(
  connectorId: string,
  year: number,
  month: number
): Promise<{ rank: number | null; totalRanked: number }> {
  const leaderboard = await computeLeaderboard(year, month);
  const index = leaderboard.findIndex(
    (e) => e.connectorId === connectorId
  );
  return {
    rank: index !== -1 ? index + 1 : null,
    totalRanked: leaderboard.length,
  };
}
