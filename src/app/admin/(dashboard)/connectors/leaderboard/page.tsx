"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Medal, Users, TrendingUp, IndianRupee, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  connectorId: string;
  connectorName: string;
  connectorCode: string;
  totalLeadsReferred: number;
  approvedLeads: number;
  conversionRate: number;
  totalCommission: number;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="size-6 text-attention" />;
  if (rank === 2) return <Medal className="size-6 text-steel" />;
  if (rank === 3) return <Medal className="size-6 text-[#CD7F32]" />;
  return <span className="text-heading-4 font-heading text-slate">#{rank}</span>;
}

function TopCard({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const colors = [
    "border-attention/30 bg-attention/5",
    "border-steel/20 bg-steel/5",
    "border-[#CD7F32]/30 bg-[#CD7F32]/5",
  ];
  const iconColors = [
    "bg-attention/20 text-attention",
    "bg-steel/20 text-steel",
    "bg-[#CD7F32]/20 text-[#CD7F32]",
  ];

  return (
    <div className={`rounded-xl border-2 ${colors[rank - 1]} p-5`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`flex size-10 items-center justify-center rounded-full ${iconColors[rank - 1]}`}>
          <RankIcon rank={rank} />
        </div>
        <div>
          <p className="text-body font-accent text-ink-deep">{entry.connectorName}</p>
          <p className="text-caption text-slate font-mono">{entry.connectorCode}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-caption text-slate">Leads</p>
          <p className="text-heading-4 font-heading text-ink-deep">{entry.totalLeadsReferred}</p>
        </div>
        <div>
          <p className="text-caption text-slate">Conversion</p>
          <p className="text-heading-4 font-heading text-ink-deep">{entry.conversionRate}%</p>
        </div>
        <div>
          <p className="text-caption text-slate">Commission</p>
          <p className="text-heading-4 font-heading text-ink-deep">{formatINR(entry.totalCommission)}</p>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [data, setData] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaderboard = useCallback(async (y: number, m: number) => {
    setLoading(true);
    setError("");
    try {
      const monthStr = `${y}-${String(m + 1).padStart(2, "0")}`;
      const res = await fetch(`/api/admin/leaderboard?month=${monthStr}`);
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setData(json.leaderboard);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(year, month);
  }, [year, month, fetchLeaderboard]);

  const top3 = data?.slice(0, 3) || [];
  const rest = data?.slice(3) || [];

  const label = `${MONTH_NAMES[month]} ${year}`;

  return (
    <div className="p-section-sm lg:p-section">
      <div className="mb-6">
        <button onClick={() => router.push("/admin/connectors")} className="inline-flex items-center gap-1.5 text-caption text-slate hover:text-ink transition-colors mb-2">
          ← Back to Connectors
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-3 font-heading text-ink-deep">Leaderboard</h1>
            <p className="text-body text-slate mt-1">Connector rankings for {label}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (month === 0) { setYear(year - 1); setMonth(11); }
                else setMonth(month - 1);
              }}
              className="flex size-8 items-center justify-center rounded-lg border border-hairline-soft text-slate hover:border-primary hover:text-primary transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <select
              value={`${year}-${String(month + 1).padStart(2, "0")}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split("-").map(Number);
                setYear(y);
                setMonth(m - 1);
              }}
              className="h-8 rounded-lg border border-hairline-soft bg-canvas px-2.5 text-body text-ink outline-none focus-visible:border-primary"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const y = d.getFullYear();
                const m = d.getMonth();
                return `${y}-${String(m + 1).padStart(2, "0")}`;
              })
                .filter((v, i, a) => a.indexOf(v) === i)
                .slice(0, 24)
                .map((v) => {
                  const [y, m] = v.split("-").map(Number);
                  return (
                    <option key={v} value={v}>
                      {MONTH_NAMES[m - 1]} {y}
                    </option>
                  );
                })}
            </select>
            <button
              onClick={() => {
                if (month === 11) { setYear(year + 1); setMonth(0); }
                else setMonth(month + 1);
              }}
              disabled={year === now.getFullYear() && month >= now.getMonth()}
              className="flex size-8 items-center justify-center rounded-lg border border-hairline-soft text-slate hover:border-primary hover:text-primary transition-colors disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-critical/10 px-3 py-2 text-body-small text-critical-strong">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-6 animate-spin text-steel" />
        </div>
      ) : data && data.length === 0 ? (
        <div className="rounded-xl bg-canvas p-12 text-center shadow-elevation-sm ring-1 ring-hairline-soft">
          <Users className="size-8 text-steel mx-auto mb-3" />
          <p className="text-body text-slate">No connector activity recorded for {label}.</p>
        </div>
      ) : (
        <>
          {/* Top 3 Tiles */}
          {top3.length > 0 && (
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {top3.map((entry) => (
                <TopCard key={entry.connectorId} entry={entry} rank={entry.rank} />
              ))}
            </div>
          )}

          {/* Full Ranked Table */}
          {rest.length > 0 && (
            <div className="overflow-x-auto rounded-xl bg-canvas shadow-elevation-sm ring-1 ring-hairline-soft">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline-soft">
                    <th className="px-4 py-3 text-left text-caption font-accent text-slate uppercase w-12">Rank</th>
                    <th className="px-4 py-3 text-left text-caption font-accent text-slate uppercase">Connector</th>
                    <th className="px-4 py-3 text-right text-caption font-accent text-slate uppercase">Leads</th>
                    <th className="px-4 py-3 text-right text-caption font-accent text-slate uppercase">Approved</th>
                    <th className="px-4 py-3 text-right text-caption font-accent text-slate uppercase">Conversion</th>
                    <th className="px-4 py-3 text-right text-caption font-accent text-slate uppercase">Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((entry) => (
                    <tr key={entry.connectorId} className="border-b border-hairline-soft hover:bg-surface-soft/50">
                      <td className="px-4 py-3">
                        <span className="text-heading-5 font-heading text-slate">{entry.rank}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-body text-ink-deep font-accent">{entry.connectorName}</div>
                        <div className="text-caption text-slate font-mono">{entry.connectorCode}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-body text-ink">{entry.totalLeadsReferred}</td>
                      <td className="px-4 py-3 text-right text-body text-ink">{entry.approvedLeads}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-body font-medium ${entry.conversionRate >= 50 ? "text-success" : entry.conversionRate >= 20 ? "text-attention" : "text-slate"}`}>
                          {entry.conversionRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-body font-medium text-ink-deep">{formatINR(entry.totalCommission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
