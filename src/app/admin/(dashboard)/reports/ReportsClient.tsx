"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { Download, FileDown } from "lucide-react";
import { can } from "@/lib/permissions";
import type { ReportData } from "@/lib/reports";

const PIE_COLORS = [
  "var(--primary, #0066FF)",
  "var(--success, #22A65E)",
  "var(--attention, #EAAA1C)",
  "var(--critical, #E02B3E)",
  "var(--warning, #F47B20)",
  "var(--steel, #858B94)",
];

const CONVERSION_COLORS: Record<string, string> = {
  NEW: "var(--steel, #858B94)",
  CONTACTED: "var(--primary, #0066FF)",
  FOLLOW_UP: "var(--attention, #EAAA1C)",
  DOCUMENT_PENDING: "var(--warning, #F47B20)",
  UNDER_REVIEW: "var(--warning, #F47B20)",
  APPROVED: "var(--success, #22A65E)",
  REJECTED: "var(--critical, #E02B3E)",
  CLOSED: "var(--steel, #858B94)",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  FOLLOW_UP: "Follow Up",
  DOCUMENT_PENDING: "Docs Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CLOSED: "Closed",
};

type Tab = "daily-leads" | "monthly-leads" | "agent-performance" | "loan-type" | "conversion" | "connector-performance";

const TABS: { key: Tab; label: string }[] = [
  { key: "daily-leads", label: "Daily Leads" },
  { key: "monthly-leads", label: "Monthly Leads" },
  { key: "agent-performance", label: "Agent Performance" },
  { key: "loan-type", label: "Loan Type" },
  { key: "conversion", label: "Conversion" },
  { key: "connector-performance", label: "Connector Performance" },
];

export default function ReportsClient({ role }: { role: string }) {
  const canExport = can(role, "export_data");

  const [tab, setTab] = useState<Tab>("daily-leads");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [networkType, setNetworkType] = useState("");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (from: string, to: string, nt: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("dateFrom", from);
      if (to) params.set("dateTo", to);
      if (nt) params.set("networkType", nt);
      const res = await fetch(`/api/reports?${params.toString()}`);
      const json: ReportData = await res.json();
      setData(json);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(dateFrom, dateTo, networkType);
  }, [fetchData, dateFrom, dateTo, networkType]);

  function exportReport(format: "csv" | "excel") {
    const params = new URLSearchParams({ format, type: tab });
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (networkType) params.set("networkType", networkType);
    window.open(`/api/reports/export?${params.toString()}`, "_blank");
  }

  function exportLeads(format: "csv" | "excel") {
    const params = new URLSearchParams({ format });
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    window.open(`/api/leads/export?${params.toString()}`, "_blank");
  }

  return (
    <div className="p-section-sm lg:p-section">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-heading-3 font-heading text-ink-deep">Reports</h1>

        {canExport && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportLeads("csv")}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-hairline-soft bg-canvas px-4 text-button text-ink transition-colors hover:bg-surface-soft"
            >
              <FileDown className="size-3.5" />
              Export CSV
            </button>
            <button
              onClick={() => exportLeads("excel")}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-hairline-soft bg-canvas px-4 text-button text-ink transition-colors hover:bg-surface-soft"
            >
              <Download className="size-3.5" />
              Export Excel
            </button>
          </div>
        )}
      </div>

      {/* Date range + network type filter + tab bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-10 rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          aria-label="From date"
        />
        <span className="text-caption text-steel">–</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-10 rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          aria-label="To date"
        />
        {tab === "connector-performance" && (
          <select
            value={networkType}
            onChange={(e) => setNetworkType(e.target.value)}
            className="h-10 rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
            aria-label="Network type"
          >
            <option value="">All Networks</option>
            <option value="Shopkeeper">Shopkeeper</option>
            <option value="Insurance Agent">Insurance Agent</option>
            <option value="CA/Accountant">CA/Accountant</option>
            <option value="Real Estate Broker">Real Estate Broker</option>
            <option value="Individual">Individual</option>
            <option value="Other">Other</option>
          </select>
        )}

        <div className="ml-auto flex gap-1 rounded-lg border border-hairline-soft p-0.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-md px-3 py-1 text-caption transition-colors ${
                tab === t.key
                  ? "bg-primary text-on-primary"
                  : "text-slate hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-body text-slate">Loading...</p>
        </div>
      ) : !data ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-body text-slate">No data available</p>
        </div>
      ) : (
        <>
          {tab === "daily-leads" && <DailyLeadsView data={data} canExport={canExport} onExport={exportReport} />}
          {tab === "monthly-leads" && <MonthlyLeadsView data={data} canExport={canExport} onExport={exportReport} />}
          {tab === "agent-performance" && <AgentPerformanceView data={data} canExport={canExport} onExport={exportReport} />}
          {tab === "loan-type" && <LoanTypeView data={data} canExport={canExport} onExport={exportReport} />}
          {tab === "conversion" && <ConversionView data={data} canExport={canExport} onExport={exportReport} />}
          {tab === "connector-performance" && <ConnectorPerformanceView data={data} canExport={canExport} onExport={exportReport} />}
        </>
      )}
    </div>
  );
}

function ViewHeader({ title, canExport, onExport }: { title: string; canExport: boolean; onExport: (f: "csv" | "excel") => void }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-heading-5 font-heading text-ink-deep">{title}</h2>
      {canExport && (
        <div className="flex gap-2">
          <button onClick={() => onExport("csv")} className="inline-flex h-7 items-center gap-1 rounded-full border border-hairline-soft px-3 text-caption text-slate transition-colors hover:bg-surface-soft">
            <FileDown className="size-3" /> CSV
          </button>
          <button onClick={() => onExport("excel")} className="inline-flex h-7 items-center gap-1 rounded-full border border-hairline-soft px-3 text-caption text-slate transition-colors hover:bg-surface-soft">
            <Download className="size-3" /> Excel
          </button>
        </div>
      )}
    </div>
  );
}

function DailyLeadsView({ data, canExport, onExport }: { data: ReportData; canExport: boolean; onExport: (f: "csv" | "excel") => void }) {
  return (
    <div className="space-y-6">
      <ViewHeader title="Daily Leads" canExport={canExport} onExport={onExport} />
      <div className="rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dailyLeads} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-soft, #E4E7EC)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--steel, #858B94)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--steel, #858B94)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--hairline-soft, #E4E7EC)", fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke="var(--primary, #0066FF)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <DataTable
        columns={["Date", "Leads"]}
        rows={data.dailyLeads.map((r) => ({ Date: r.date, Leads: r.count }))}
      />
    </div>
  );
}

function MonthlyLeadsView({ data, canExport, onExport }: { data: ReportData; canExport: boolean; onExport: (f: "csv" | "excel") => void }) {
  return (
    <div className="space-y-6">
      <ViewHeader title="Monthly Leads" canExport={canExport} onExport={onExport} />
      <div className="rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyLeads} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-soft, #E4E7EC)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--steel, #858B94)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--steel, #858B94)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--hairline-soft, #E4E7EC)", fontSize: 12 }} />
              <Bar dataKey="count" fill="var(--primary, #0066FF)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <DataTable
        columns={["Month", "Leads"]}
        rows={data.monthlyLeads.map((r) => ({ Month: r.month, Leads: r.count }))}
      />
    </div>
  );
}

function AgentPerformanceView({ data, canExport, onExport }: { data: ReportData; canExport: boolean; onExport: (f: "csv" | "excel") => void }) {
  return (
    <div className="space-y-6">
      <ViewHeader title="Agent Performance" canExport={canExport} onExport={onExport} />
      <div className="rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.agentPerformance} margin={{ top: 4, right: 8, bottom: 4, left: -16 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-soft, #E4E7EC)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--steel, #858B94)" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "var(--steel, #858B94)" }} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--hairline-soft, #E4E7EC)", fontSize: 12 }} />
              <Bar dataKey="total" fill="var(--primary, #0066FF)" radius={[0, 4, 4, 0]} name="Total" />
              <Bar dataKey="approved" fill="var(--success, #22A65E)" radius={[0, 4, 4, 0]} name="Approved" />
              <Bar dataKey="rejected" fill="var(--critical, #E02B3E)" radius={[0, 4, 4, 0]} name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <DataTable
        columns={["Agent", "Total Leads", "Approved", "Rejected", "Pending"]}
        rows={data.agentPerformance.map((r) => ({ Agent: r.name, "Total Leads": r.total, Approved: r.approved, Rejected: r.rejected, Pending: r.pending }))}
      />
    </div>
  );
}

function LoanTypeView({ data, canExport, onExport }: { data: ReportData; canExport: boolean; onExport: (f: "csv" | "excel") => void }) {
  return (
    <div className="space-y-6">
      <ViewHeader title="Loan Type Report" canExport={canExport} onExport={onExport} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.loanType} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={2} dataKey="count" nameKey="name">
                  {data.loanType.map((_e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--hairline-soft, #E4E7EC)", fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: "var(--ink, #1C2026)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <DataTable
          columns={["Loan Type", "Count", "Total Amount"]}
          rows={data.loanType.map((r) => ({
            "Loan Type": r.name,
            Count: r.count,
            "Total Amount": `₹${r.totalAmount.toLocaleString("en-IN")}`,
          }))}
        />
      </div>
    </div>
  );
}

function ConversionView({ data, canExport, onExport }: { data: ReportData; canExport: boolean; onExport: (f: "csv" | "excel") => void }) {
  const conversionData = data.conversion
    .filter((r) => r.count > 0)
    .map((r) => ({ ...r, label: STATUS_LABELS[r.status] || r.status }));

  const total = conversionData.reduce((s, r) => s + r.count, 0);
  const approved = conversionData.find((r) => r.status === "APPROVED")?.count || 0;
  const rate = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <ViewHeader title="Conversion Report" canExport={canExport} onExport={onExport} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary-soft">
              <span className="text-heading-3 font-heading text-primary">{rate}%</span>
            </div>
            <div>
              <p className="text-caption text-steel">Conversion Rate</p>
              <p className="text-body font-accent text-ink-deep">{approved} / {total} approved</p>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-soft, #E4E7EC)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--steel, #858B94)" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: "var(--steel, #858B94)" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--hairline-soft, #E4E7EC)", fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {conversionData.map((r) => (
                    <Cell key={r.status} fill={CONVERSION_COLORS[r.status] || "var(--steel, #858B94)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <DataTable
          columns={["Status", "Count"]}
          rows={conversionData.map((r) => ({ Status: r.label, Count: r.count }))}
        />
      </div>
    </div>
  );
}

function ConnectorPerformanceView({ data, canExport, onExport }: { data: ReportData; canExport: boolean; onExport: (f: "csv" | "excel") => void }) {
  const perf = data.connectorPerformance;

  const totalConnectors = perf.length;
  const totalLeads = perf.reduce((s, r) => s + r.totalLeads, 0);
  const totalApproved = perf.reduce((s, r) => s + r.approvedLeads, 0);
  const totalAccrued = perf.reduce((s, r) => s + r.totalAccrued, 0);
  const totalPaid = perf.reduce((s, r) => s + r.totalPaid, 0);
  const overallRate = totalLeads > 0 ? Math.round((totalApproved / totalLeads) * 100) : 0;

  const chartData = useMemo(
    () =>
      perf.map((r) => ({
        name: `${r.name} (${r.connectorCode})`,
        Leads: r.totalLeads,
        Approved: r.approvedLeads,
      })),
    [perf]
  );

  return (
    <div className="space-y-6">
      <ViewHeader title="Connector Performance" canExport={canExport} onExport={onExport} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-hairline-soft bg-canvas p-4 shadow-elevation-xs">
          <p className="text-caption text-steel">Connectors</p>
          <p className="text-heading-4 font-heading text-ink-deep">{totalConnectors}</p>
        </div>
        <div className="rounded-xl border border-hairline-soft bg-canvas p-4 shadow-elevation-xs">
          <p className="text-caption text-steel">Leads Referred</p>
          <p className="text-heading-4 font-heading text-ink-deep">{totalLeads}</p>
        </div>
        <div className="rounded-xl border border-hairline-soft bg-canvas p-4 shadow-elevation-xs">
          <p className="text-caption text-steel">Approved</p>
          <p className="text-heading-4 font-heading text-ink-deep">{totalApproved}</p>
        </div>
        <div className="rounded-xl border border-hairline-soft bg-canvas p-4 shadow-elevation-xs">
          <p className="text-caption text-steel">Conversion Rate</p>
          <p className="text-heading-4 font-heading text-primary">{overallRate}%</p>
        </div>
        <div className="rounded-xl border border-hairline-soft bg-canvas p-4 shadow-elevation-xs">
          <p className="text-caption text-steel">Commission</p>
          <p className="text-heading-4 font-heading text-ink-deep">
            ₹{totalPaid.toLocaleString("en-IN")}
            <span className="text-caption text-slate"> / ₹{totalAccrued.toLocaleString("en-IN")}</span>
          </p>
        </div>
      </div>

      {/* Horizontal bar chart */}
      {chartData.length > 0 && (
        <div className="rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--hairline-soft, #E4E7EC)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--steel, #858B94)" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "var(--steel, #858B94)" }} axisLine={false} tickLine={false} width={140} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--hairline-soft, #E4E7EC)", fontSize: 12 }} />
                <Bar dataKey="Leads" fill="var(--primary, #0066FF)" radius={[0, 4, 4, 0]} name="Leads" />
                <Bar dataKey="Approved" fill="var(--success, #22A65E)" radius={[0, 4, 4, 0]} name="Approved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Data table */}
      <DataTable
        columns={["Connector", "Code", "Network Type", "Leads Referred", "Approved", "Conversion Rate", "Commission Accrued", "Commission Paid"]}
        rows={perf.map((r) => ({
          Connector: r.name,
          Code: r.connectorCode,
          "Network Type": r.networkType,
          "Leads Referred": r.totalLeads,
          Approved: r.approvedLeads,
          "Conversion Rate": `${r.totalLeads > 0 ? Math.round((r.approvedLeads / r.totalLeads) * 100) : 0}%`,
          "Commission Accrued": `₹${r.totalAccrued.toLocaleString("en-IN")}`,
          "Commission Paid": `₹${r.totalPaid.toLocaleString("en-IN")}`,
        }))}
      />
    </div>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: Record<string, unknown>[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-hairline-soft bg-canvas shadow-elevation-xs">
      <table className="w-full">
        <thead>
          <tr className="border-b border-hairline-soft">
            {columns.map((col) => (
              <th key={col} className="whitespace-nowrap px-4 py-3 text-left text-caption text-steel font-medium">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-body text-slate">
                No data found
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-b border-hairline-soft last:border-b-0 transition-colors hover:bg-primary-soft/40">
                {columns.map((col) => (
                  <td key={col} className="whitespace-nowrap px-4 py-3 text-body text-ink">
                    {String(row[col] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
