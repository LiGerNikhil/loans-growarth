"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Check, X, Loader2, AlertTriangle } from "lucide-react";

const STATUSES = ["PENDING", "APPROVED", "PAID", "REJECTED"] as const;

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-attention text-ink-deep",
  APPROVED: "bg-success text-canvas",
  PAID: "bg-primary text-on-primary",
  REJECTED: "bg-critical text-canvas",
};

function Badge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status] || "bg-surface-soft text-slate border border-hairline-soft";
  return (
    <span className={`inline-flex h-5 items-center rounded-full px-2 py-0.5 text-caption font-medium whitespace-nowrap ${cls}`}>
      {status}
    </span>
  );
}

interface Payout {
  _id: string;
  connectorId: { _id: string; name: string; connectorCode: string };
  leadId: { _id: string; leadId: string; name: string; bankName?: string; bankPayout?: number };
  loanType: string;
  loanAmountDisbursed: number;
  commissionAmount: number;
  status: string;
  paymentReference?: string;
  flaggedForReview?: boolean;
  approvedAt?: string;
  paidAt?: string;
  createdAt: string;
}

interface ConnectorBrief {
  _id: string;
  name: string;
  connectorCode: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PayoutsResponse {
  payouts: Payout[];
  pagination: Pagination;
  connectors: ConnectorBrief[];
  flaggedCount: number;
}

function FilterDropdown({
  label, options, selected, onChange,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  function toggle(val: string) {
    onChange(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val]);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-caption transition-colors ${
          selected.length ? "border-primary bg-primary-soft text-primary" : "border-hairline-soft text-slate hover:border-hairline"
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-on-primary">{selected.length}</span>
        )}
        <ChevronDown className="size-3" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 w-36 rounded-lg border border-hairline-soft bg-canvas p-1.5 shadow-elevation-sm">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-caption transition-colors hover:bg-surface-soft ${
                selected.includes(opt) ? "text-primary" : "text-ink"
              }`}
            >
              <span className={`flex size-3.5 items-center justify-center rounded border ${selected.includes(opt) ? "border-primary bg-primary text-on-primary" : "border-hairline"}`}>
                {selected.includes(opt) && (
                  <svg className="size-2.5" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-caption text-primary">
      {label}
      <button type="button" onClick={onRemove}><X className="size-2.5" /></button>
    </span>
  );
}

function PaymentRefDialog({
  open, onConfirm, onCancel, loading,
}: {
  open: boolean;
  onConfirm: (ref: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [ref, setRef] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-xl bg-canvas p-6 shadow-elevation-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-heading-5 font-heading text-ink-deep mb-1">Mark as Paid</h3>
        <p className="text-body text-slate mb-4">Enter the payment reference (UTR / transaction ID).</p>
        <input
          type="text"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="e.g. HDFC250726XXXXX"
          className="h-11 w-full rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          autoFocus
        />
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => { onConfirm(ref); setRef(""); }}
            disabled={!ref.trim() || loading}
            className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-button text-on-primary transition-all active:bg-primary-deep disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm Payment"}
          </button>
          <button onClick={onCancel} className="inline-flex h-10 items-center rounded-full border border-hairline-soft px-5 text-button text-slate">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PayoutsPage() {
  const router = useRouter();
  const [data, setData] = useState<PayoutsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPaymentRef, setShowPaymentRef] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const fetchData = useCallback(async (params: Record<string, string>) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`/api/admin/payouts?${qs}`);
      const json: PayoutsResponse = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params: Record<string, string> = { page: String(page), limit: "20" };
    if (selectedStatuses.length) params.status = selectedStatuses.join(",");
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (search) params.search = search;
    fetchData(params);
  }, [page, selectedStatuses, dateFrom, dateTo, search, fetchData]);

  async function handleAction(action: string, paymentRef?: string) {
    if (selectedIds.size === 0) return;
    setActionLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutIds: Array.from(selectedIds),
          action,
          paymentReference: paymentRef,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Action failed");
      }

      setSelectedIds(new Set());
      const params: Record<string, string> = { page: String(page), limit: "20" };
      if (selectedStatuses.length) params.status = selectedStatuses.join(",");
      if (search) params.search = search;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      await fetchData(params);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (!data) return;
    if (selectedIds.size === data.payouts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.payouts.map((p) => p._id)));
    }
  }

  const payouts = data?.payouts || [];
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 };
  const flaggedPayouts = payouts.filter((p) => p.flaggedForReview && p.status === "PENDING");
  const normalPayouts = payouts.filter((p) => !(p.flaggedForReview && p.status === "PENDING"));

  const bulkApproveDisabled = selectedIds.size === 0 || actionLoading;
  const bulkRejectDisabled = selectedIds.size === 0 || actionLoading;
  const bulkMarkPaidDisabled = selectedIds.size === 0 || actionLoading;

  return (
    <div className="p-section-sm lg:p-section">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button onClick={() => router.push("/admin/connectors")} className="inline-flex items-center gap-1.5 text-caption text-slate hover:text-ink transition-colors mb-2">
            ← Back to Connectors
          </button>
          <h1 className="text-heading-3 font-heading text-ink-deep">Commission Payouts</h1>
          <p className="text-body text-slate mt-1">{pagination.total} total records</p>
        </div>
      </div>

      {/* Flagged Payouts Banner */}
      {data && data.flaggedCount > 0 && (
        <div className="mb-6 rounded-xl border border-attention/30 bg-attention/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 shrink-0 text-attention mt-0.5" />
            <div>
              <h2 className="text-body font-accent text-ink-deep">Flagged for Review</h2>
              <p className="text-body-small text-slate mt-0.5">
                {data.flaggedCount} payout{data.flaggedCount > 1 ? "s" : ""} need{data.flaggedCount === 1 ? "s" : ""} a decision — the underlying lead was moved to a non-approved status.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-steel" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search connector name or code..."
            className="h-8 w-full rounded-lg border border-hairline-soft bg-canvas pl-8 pr-3 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          />
        </div>

        <FilterDropdown label="Status" options={STATUSES} selected={selectedStatuses} onChange={(v) => { setSelectedStatuses(v); setPage(1); }} />

        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="h-8 rounded-lg border border-hairline-soft bg-canvas px-2.5 text-caption text-ink outline-none focus-visible:border-primary" />
        <span className="text-caption text-slate">—</span>
        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="h-8 rounded-lg border border-hairline-soft bg-canvas px-2.5 text-caption text-ink outline-none focus-visible:border-primary" />
      </div>

      {/* Active filter chips */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {selectedStatuses.map((s) => (
          <FilterChip key={s} label={`Status: ${s}`} onRemove={() => { setSelectedStatuses(selectedStatuses.filter((x) => x !== s)); setPage(1); }} />
        ))}
        {dateFrom && <FilterChip label={`From: ${dateFrom}`} onRemove={() => { setDateFrom(""); setPage(1); }} />}
        {dateTo && <FilterChip label={`To: ${dateTo}`} onRemove={() => { setDateTo(""); setPage(1); }} />}
        {search && <FilterChip label={`Search: ${search}`} onRemove={() => { setSearch(""); setPage(1); }} />}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-critical/10 px-3 py-2 text-body-small text-critical-strong">{error}</div>
      )}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary-soft px-4 py-2">
          <span className="text-caption text-primary font-medium">{selectedIds.size} selected</span>
          <button
            onClick={() => { setPendingAction("approve"); handleAction("approve"); }}
            disabled={bulkApproveDisabled}
            className="inline-flex h-7 items-center rounded-full bg-success px-3 text-caption font-medium text-canvas disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => { setPendingAction("reject"); handleAction("reject"); }}
            disabled={bulkRejectDisabled}
            className="inline-flex h-7 items-center rounded-full bg-critical px-3 text-caption font-medium text-canvas disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={() => { setShowPaymentRef(true); setPendingAction("mark-paid"); }}
            disabled={bulkMarkPaidDisabled}
            className="inline-flex h-7 items-center rounded-full bg-primary px-3 text-caption font-medium text-on-primary disabled:opacity-50"
          >
            Mark as Paid
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-caption text-slate hover:text-ink">Clear</button>
        </div>
      )}

      {/* Flagged payouts section */}
      {flaggedPayouts.length > 0 && (
        <div className="mb-6 rounded-xl border border-attention/20 bg-attention/5 overflow-hidden">
          <div className="px-4 py-2 border-b border-attention/20 bg-attention/10">
            <span className="text-caption font-accent text-attention uppercase tracking-wide">Flagged for Review — {flaggedPayouts.length} payout{flaggedPayouts.length > 1 ? "s" : ""}</span>
          </div>
          {renderPayoutTable(flaggedPayouts, true)}
        </div>
      )}

      {/* Normal payouts table */}
      <div className="overflow-x-auto rounded-xl bg-canvas shadow-elevation-sm ring-1 ring-hairline-soft">
        {renderPayoutTable(normalPayouts, false)}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
            className="inline-flex h-8 items-center rounded-lg border border-hairline-soft px-3 text-caption text-slate hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none">
            Previous
          </button>
          <span className="text-caption text-slate px-2">Page {pagination.page} of {pagination.totalPages}</span>
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages}
            className="inline-flex h-8 items-center rounded-lg border border-hairline-soft px-3 text-caption text-slate hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none">
            Next
          </button>
        </div>
      )}

      <PaymentRefDialog
        open={showPaymentRef}
        onConfirm={(ref) => { setShowPaymentRef(false); handleAction("mark-paid", ref); }}
        onCancel={() => { setShowPaymentRef(false); setPendingAction(null); }}
        loading={actionLoading}
      />
    </div>
  );

  function renderPayoutTable(list: Payout[], isFlagged: boolean) {
    if (loading) {
      return <div className="flex items-center justify-center py-12"><Loader2 className="size-5 animate-spin text-steel" /></div>;
    }

    if (list.length === 0) {
      return <p className="px-4 py-12 text-center text-body text-slate">No payouts found.</p>;
    }

    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline-soft">
            <th className="px-3 py-2.5 w-10">
              <input type="checkbox" checked={list.every((p) => selectedIds.has(p._id)) && list.length > 0}
                onChange={toggleSelectAll} className="size-4 accent-primary" />
            </th>
            <th className="px-3 py-2.5 text-left text-caption font-accent text-slate uppercase">Connector</th>
            <th className="px-3 py-2.5 text-left text-caption font-accent text-slate uppercase">Lead</th>
            <th className="px-3 py-2.5 text-left text-caption font-accent text-slate uppercase">Loan Type</th>
            <th className="px-3 py-2.5 text-left text-caption font-accent text-slate uppercase">Bank / NBFC</th>
            <th className="px-3 py-2.5 text-right text-caption font-accent text-slate uppercase">Disbursed</th>
            <th className="px-3 py-2.5 text-right text-caption font-accent text-slate uppercase">Bank Payout</th>
            <th className="px-3 py-2.5 text-right text-caption font-accent text-slate uppercase">Commission</th>
            <th className="px-3 py-2.5 text-left text-caption font-accent text-slate uppercase">Status</th>
            <th className="px-3 py-2.5 text-left text-caption font-accent text-slate uppercase">Date</th>
            <th className="px-3 py-2.5 text-center text-caption font-accent text-slate uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p._id} className={`border-b border-hairline-soft hover:bg-surface-soft/50 ${isFlagged ? "bg-attention/5" : ""}`}>
              <td className="px-3 py-2.5">
                <input type="checkbox" checked={selectedIds.has(p._id)} onChange={() => toggleSelect(p._id)} className="size-4 accent-primary" />
              </td>
              <td className="px-3 py-2.5">
                <div className="text-body text-ink-deep font-accent">{p.connectorId?.name || "—"}</div>
                <div className="text-caption text-slate font-mono">{p.connectorId?.connectorCode || ""}</div>
              </td>
              <td className="px-3 py-2.5">
                <div className="text-body text-ink">{p.leadId?.name || "—"}</div>
                {p.leadId?.leadId && <div className="text-caption text-slate font-mono">{p.leadId.leadId}</div>}
              </td>
              <td className="px-3 py-2.5 text-body text-slate">{p.loanType}</td>
              <td className="px-3 py-2.5 text-body text-ink">
                {p.leadId?.bankName || <span className="text-steel">—</span>}
              </td>
              <td className="px-3 py-2.5 text-right text-body text-ink">₹{p.loanAmountDisbursed.toLocaleString("en-IN")}</td>
              <td className="px-3 py-2.5 text-right text-body text-steel">
                {p.leadId?.bankPayout ? (
                  <span title="Confidential — not visible to connector">₹{p.leadId.bankPayout.toLocaleString("en-IN")}</span>
                ) : (
                  <span className="text-steel">—</span>
                )}
              </td>
              <td className="px-3 py-2.5 text-right text-body font-medium text-ink-deep">₹{p.commissionAmount.toLocaleString("en-IN")}</td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <Badge status={p.status} />
                  {p.flaggedForReview && (
                    <span title="Flagged for review"><AlertTriangle className="size-3 text-attention" /></span>
                  )}
                </div>
              </td>
              <td className="px-3 py-2.5 text-caption text-slate">
                {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                {p.paidAt && <><br />Paid: {new Date(p.paidAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  {p.paymentReference && <span className="font-mono"> · {p.paymentReference}</span>}</>}
              </td>
              <td className="px-3 py-2.5 text-center">
                <RowActions payout={p} onAction={handleAction} loading={actionLoading} onPaymentRef={() => {
                  setSelectedIds(new Set([p._id]));
                  setShowPaymentRef(true);
                }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

function RowActions({
  payout, onAction, loading, onPaymentRef,
}: {
  payout: Payout;
  onAction: (action: string, ref?: string) => Promise<void>;
  loading: boolean;
  onPaymentRef: () => void;
}) {
  const single = async (action: string) => {
    const res = await fetch("/api/admin/payouts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payoutIds: [payout._id], action }),
    });
    if (res.ok) window.location.reload();
  };

  if (payout.status === "PENDING") {
    return (
      <div className="flex items-center justify-center gap-1">
        <button onClick={() => single("approve")} disabled={loading}
          className="inline-flex h-6 items-center rounded-full bg-success px-2 text-caption font-medium text-canvas disabled:opacity-40">
          Approve
        </button>
        <button onClick={() => single("reject")} disabled={loading}
          className="inline-flex h-6 items-center rounded-full bg-critical px-2 text-caption font-medium text-canvas disabled:opacity-40">
          Reject
        </button>
      </div>
    );
  }

  if (payout.status === "APPROVED") {
    return (
      <div className="flex items-center justify-center gap-1">
        <button onClick={onPaymentRef} disabled={loading}
          className="inline-flex h-6 items-center rounded-full bg-primary px-2 text-caption font-medium text-on-primary disabled:opacity-40">
          Mark Paid
        </button>
      </div>
    );
  }

  return <span className="text-caption text-slate">—</span>;
}
