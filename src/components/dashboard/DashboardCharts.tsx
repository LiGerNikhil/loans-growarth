"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { DashboardMetrics } from "@/lib/dashboard";

type Period = "daily" | "weekly" | "monthly";

interface DashboardChartsProps {
  initialData: DashboardMetrics;
}

const PIE_COLORS = [
  "var(--primary, #0066FF)",
  "var(--success, #22A65E)",
  "var(--attention, #EAAA1C)",
  "var(--critical, #E02B3E)",
  "var(--warning, #F47B20)",
  "var(--steel, #858B94)",
];

const PERIOD_LABELS: Record<Period, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

export default function DashboardCharts({ initialData }: DashboardChartsProps) {
  const [period, setPeriod] = useState<Period>("daily");
  const [trendData, setTrendData] = useState(initialData.leadTrend);
  const [loading, setLoading] = useState(false);

  const fetchTrend = useCallback(async (p: Period) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/metrics?period=${p}`);
      const data: DashboardMetrics = await res.json();
      setTrendData(data.leadTrend);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (period !== "daily") fetchTrend(period);
  }, [period, fetchTrend]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Lead Trend */}
      <div className="rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-heading-5 font-heading text-ink-deep">Lead Trend</h3>
          <div className="flex gap-1 rounded-lg border border-hairline-soft p-0.5">
            {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setPeriod(key); if (key === "daily") setTrendData(initialData.leadTrend); }}
                className={`rounded-md px-2.5 py-1 text-caption font-accent transition-colors ${
                  period === key
                    ? "bg-primary text-on-primary"
                    : "text-slate hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          {loading ? (
            <div className="flex h-full items-center justify-center text-body text-slate">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-soft, #E4E7EC)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--steel, #858B94)" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--steel, #858B94)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--hairline-soft, #E4E7EC)",
                    fontSize: 12,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="var(--primary, #0066FF)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Loan Type Breakdown */}
      <div className="rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs">
        <h3 className="text-heading-5 font-heading text-ink-deep mb-4">Loan Type Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={initialData.loanTypeBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {initialData.loanTypeBreakdown.map((_entry, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid var(--hairline-soft, #E4E7EC)",
                  fontSize: 12,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: "var(--ink, #1C2026)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Rate */}
      <div className="rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs lg:col-span-2">
        <h3 className="text-heading-5 font-heading text-ink-deep mb-4">Conversion Rate</h3>
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary-soft">
              <span className="text-heading-3 font-heading text-primary">
                {initialData.conversionRate.rate}%
              </span>
            </div>
            <div>
              <p className="text-caption text-steel">Leads Converted</p>
              <p className="text-body font-accent text-ink-deep">
                {initialData.conversionRate.approved} / {initialData.conversionRate.total}
              </p>
            </div>
          </div>

          <div className="flex flex-1 gap-2">
            {(() => {
              const pct = initialData.conversionRate.rate;
              return (
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-hairline-soft">
                  <div
                    className="h-full rounded-full bg-success transition-all"
                    style={{ width: `${pct}%` }}
                  />
                  <div
                    className="h-full rounded-full bg-critical transition-all"
                    style={{ width: `${100 - pct}%` }}
                  />
                </div>
              );
            })()}
          </div>

          <div className="flex gap-6 text-caption">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-success" />
              <span className="text-ink">Approved ({initialData.conversionRate.approved})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-critical" />
              <span className="text-ink">
                Not Converted ({initialData.conversionRate.total - initialData.conversionRate.approved})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
