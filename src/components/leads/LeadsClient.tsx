"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ChevronDown, ArrowUpDown, Check, UserPlus, FileDown, Download, Clock, AlertTriangle } from "lucide-react";
import { can } from "@/lib/permissions";

const STATUSES = [
  "NEW", "CONTACTED", "FOLLOW_UP", "DOCUMENT_PENDING",
  "UNDER_REVIEW", "APPROVED", "REJECTED", "CLOSED",
] as const;

const LOAN_TYPES = [
  "Personal Loan", "Business Loan", "Loan Against Property",
  "Overdraft Facility", "Home Loan", "Other",
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "amount_high", label: "Highest Amount" },
  { value: "amount_low", label: "Lowest Amount" },
] as const;

type Status = (typeof STATUSES)[number];
type LoanType = (typeof LOAN_TYPES)[number];
type Role = "PUBLIC" | "AGENT" | "MANAGER" | "SUPER_ADMIN";

const STATUS_BADGE_CLASS: Record<string, string> = {
  APPROVED: "bg-success text-canvas",
  REJECTED: "bg-critical text-canvas",
  FOLLOW_UP: "bg-attention text-ink-deep",
  UNDER_REVIEW: "bg-attention text-ink-deep",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE_CLASS[status] || "bg-surface-soft text-slate border border-hairline-soft";
  return (
    <span className={`inline-flex h-5 items-center rounded-full px-2 py-0.5 text-caption font-medium whitespace-nowrap ${cls}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function SlaIndicator({ lead }: { lead: { status: string; slaDeadline?: string; firstResponseAt?: string; createdAt: string } }) {
  if (lead.firstResponseAt) {
    const responded = new Date(lead.firstResponseAt);
    const created = new Date(lead.createdAt);
    const hours = Math.round((responded.getTime() - created.getTime()) / (1000 * 60 * 60));
    const cls = hours <= 24 ? "text-success" : "text-critical";
    return (
      <span className={`inline-flex items-center gap-1 text-caption ${cls}`}>
        <Check className="size-3" />
        {hours}h
      </span>
    );
  }

  if (lead.slaDeadline && lead.status === "NEW") {
    const deadline = new Date(lead.slaDeadline);
    const now = new Date();
    const remainingMs = deadline.getTime() - now.getTime();
    if (remainingMs <= 0) {
      return (
        <span className="inline-flex items-center gap-1 text-caption text-critical">
          <AlertTriangle className="size-3" />
          Overdue
        </span>
      );
    }
    const remainingHours = Math.round(remainingMs / (1000 * 60 * 60));
    return (
      <span className="inline-flex items-center gap-1 text-caption text-attention">
        <Clock className="size-3" />
        {remainingHours}h left
      </span>
    );
  }

  if (lead.status === "FOLLOW_UP") {
    const updated = new Date(lead.createdAt);
    const days = Math.floor((Date.now() - updated.getTime()) / (1000 * 60 * 60 * 24));
    if (days >= 3) {
      return (
        <span className="inline-flex items-center gap-1 text-caption text-critical">
          <AlertTriangle className="size-3" />
          Stale {days}d
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-caption text-attention">
        <Clock className="size-3" />
        {days}d
      </span>
    );
  }

  return <span className="text-caption text-steel">—</span>;
}

interface ConnectorRef {
  _id: string;
  name: string;
  connectorCode: string;
}

interface Lead {
  _id: string;
  leadId: string;
  name: string;
  mobile: string;
  email: string;
  monthlySalary: number;
  loanAmount: number;
  loanType: string;
  source: string;
  status: string;
  assignedTo?: { _id: string; name: string; email: string } | null;
  connectorId?: ConnectorRef | null;
  createdAt: string;
  slaDeadline?: string;
  firstResponseAt?: string;
}

interface Agent {
  _id: string;
  name: string;
  email: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface LeadsResponse {
  leads: Lead[];
  pagination: Pagination;
  agents: Agent[];
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

interface FilterDropdownProps {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

function FilterDropdown({ label, options, selected, onChange }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggle(val: string) {
    if (selected.includes(val)) {
      onChange(selected.filter((s) => s !== val));
    } else {
      onChange([...selected, val]);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-caption transition-colors ${
          selected.length
            ? "border-primary bg-primary-soft text-primary"
            : "border-hairline-soft text-slate hover:border-hairline"
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-on-primary">
            {selected.length}
          </span>
        )}
        <ChevronDown className="size-3" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 w-44 rounded-lg border border-hairline-soft bg-canvas p-1.5 shadow-elevation-sm">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-caption transition-colors hover:bg-surface-soft ${
                selected.includes(opt) ? "text-primary" : "text-ink"
              }`}
            >
              <span
                className={`flex size-3.5 items-center justify-center rounded border ${
                  selected.includes(opt)
                    ? "border-primary bg-primary text-on-primary"
                    : "border-hairline"
                }`}
              >
                {selected.includes(opt) && (
                  <svg className="size-2.5" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {opt.replace("_", " ")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-caption text-primary">
      {label}
      <button type="button" onClick={onRemove} className="flex hover:text-primary-deep" aria-label={`Remove ${label} filter`}>
        <X className="size-2.5" />
      </button>
    </span>
  );
}

export default function LeadsClient({
  initialData,
  initialParams,
  role,
}: {
  initialData: LeadsResponse;
  initialParams: Record<string, string>;
  role: string;
}) {
  const router = useRouter();
  const canAssign = can(role, "assign_lead");
  const canUpdateStatus = can(role, "update_lead_status");
  const canExport = can(role, "export_data");

  const [search, setSearch] = useState(initialParams.search || "");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    initialParams.status ? initialParams.status.split(",") : []
  );
  const [selectedLoanTypes, setSelectedLoanTypes] = useState<string[]>(
    initialParams.loanType ? initialParams.loanType.split(",") : []
  );
  const [dateFrom, setDateFrom] = useState(initialParams.dateFrom || "");
  const [dateTo, setDateTo] = useState(initialParams.dateTo || "");
  const [assignedTo, setAssignedTo] = useState(initialParams.assignedTo || "");
  const [sort, setSort] = useState(initialParams.sort || "newest");
  const [page, setPage] = useState(parseInt(initialParams.page || "1", 10));

  const [data, setData] = useState<LeadsResponse>(initialData);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const fetchData = useCallback(async (params: Record<string, string>) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`/api/leads?${qs}`);
      const json: LeadsResponse = await res.json();
      setData(json);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const buildParams = useCallback(
    (overrides: Record<string, string | undefined> = {}) => {
      const params: Record<string, string> = {};
      if (overrides.search ?? debouncedSearch) params.search = overrides.search ?? debouncedSearch;
      if (overrides.status ?? selectedStatuses.length) params.status = overrides.status ?? selectedStatuses.join(",");
      if (overrides.loanType ?? selectedLoanTypes.length) params.loanType = overrides.loanType ?? selectedLoanTypes.join(",");
      if (overrides.dateFrom ?? dateFrom) params.dateFrom = overrides.dateFrom ?? dateFrom;
      if (overrides.dateTo ?? dateTo) params.dateTo = overrides.dateTo ?? dateTo;
      if (overrides.assignedTo ?? assignedTo) params.assignedTo = overrides.assignedTo ?? assignedTo;
      if (overrides.sort ?? sort) params.sort = overrides.sort ?? sort;
      params.page = overrides.page ?? String(page);
      return params;
    },
    [debouncedSearch, selectedStatuses, selectedLoanTypes, dateFrom, dateTo, assignedTo, sort, page]
  );

  useEffect(() => {
    const params = buildParams();
    fetchData(params);
    const qs = new URLSearchParams(params).toString();
    router.replace(`/admin/leads?${qs}`, { scroll: false });
  }, [debouncedSearch, selectedStatuses, selectedLoanTypes, dateFrom, dateTo, assignedTo, sort, page, buildParams, fetchData, router]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [data.leads]);

  function navigateToLead(id: string) {
    router.push(`/admin/leads/${id}`);
  }

  function clearAllFilters() {
    setSearch("");
    setSelectedStatuses([]);
    setSelectedLoanTypes([]);
    setDateFrom("");
    setDateTo("");
    setAssignedTo("");
    setPage(1);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === data.leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.leads.map((l) => l._id)));
    }
  }

  async function handleBulkAssign(agentId: string) {
    if (selectedIds.size === 0) return;
    setAssigning(true);
    try {
      await fetch("/api/leads/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: Array.from(selectedIds), assignedTo: agentId || null }),
      });
      setSelectedIds(new Set());
      const params = buildParams();
      fetchData(params);
    } finally {
      setAssigning(false);
    }
  }

  async function handleBulkStatusChange(status: string) {
    if (selectedIds.size === 0) return;
    setAssigning(true);
    try {
      await fetch("/api/leads/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: Array.from(selectedIds), status }),
      });
      setSelectedIds(new Set());
      const params = buildParams();
      fetchData(params);
    } finally {
      setAssigning(false);
    }
  }

  async function handleSingleAssign(leadId: string, agentId: string) {
    setAssigning(true);
    try {
      await fetch("/api/leads/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: [leadId], assignedTo: agentId || null }),
      });
      const params = buildParams();
      fetchData(params);
    } finally {
      setAssigning(false);
    }
  }

  const hasActiveFilters =
    selectedStatuses.length > 0 || selectedLoanTypes.length > 0 || dateFrom || dateTo || assignedTo || search;

  const filterChips: { label: string; onRemove: () => void }[] = [];
  selectedStatuses.forEach((s) =>
    filterChips.push({
      label: s.replace("_", " "),
      onRemove: () => { setSelectedStatuses((prev) => prev.filter((x) => x !== s)); setPage(1); },
    })
  );
  selectedLoanTypes.forEach((t) =>
    filterChips.push({
      label: t,
      onRemove: () => { setSelectedLoanTypes((prev) => prev.filter((x) => x !== t)); setPage(1); },
    })
  );
  if (dateFrom)
    filterChips.push({
      label: `From: ${dateFrom}`,
      onRemove: () => { setDateFrom(""); setPage(1); },
    });
  if (dateTo)
    filterChips.push({
      label: `To: ${dateTo}`,
      onRemove: () => { setDateTo(""); setPage(1); },
    });
  if (assignedTo) {
    const agent = data.agents.find((a) => a._id === assignedTo);
    filterChips.push({
      label: agent ? `Agent: ${agent.name}` : `Agent: ${assignedTo}`,
      onRemove: () => { setAssignedTo(""); setPage(1); },
    });
  }

  const baseHeaders = ["Lead ID", "Name", "Mobile", "Email", "Salary", "Loan Amount", "Loan Type", "Status", "Source", "SLA", "Assigned To", "Created"];
  const headers = canAssign ? ["", ...baseHeaders] : baseHeaders;

  return (
    <div className="p-section-sm lg:p-section">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-heading-3 font-heading text-ink-deep">Leads</h1>
        {canExport && (
          <div className="flex items-center gap-2">
            <a
              href={`/api/leads/export?format=csv&${new URLSearchParams(buildParams()).toString()}`}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-hairline-soft bg-canvas px-4 text-button text-ink transition-colors hover:bg-surface-soft"
            >
              <FileDown className="size-3.5" />
              CSV
            </a>
            <a
              href={`/api/leads/export?format=excel&${new URLSearchParams(buildParams()).toString()}`}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-hairline-soft bg-canvas px-4 text-button text-ink transition-colors hover:bg-surface-soft"
            >
              <Download className="size-3.5" />
              Excel
            </a>
          </div>
        )}
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-primary-soft px-4 py-2.5">
          <span className="text-body font-accent text-primary">
            {selectedIds.size} lead{selectedIds.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {canUpdateStatus && (
              <>
                <ArrowUpDown className="size-4 text-primary" />
                <select
                  onChange={(e) => {
                    if (e.target.value !== "") handleBulkStatusChange(e.target.value);
                  }}
                  defaultValue=""
                  disabled={assigning}
                  className="h-10 rounded-lg border border-primary bg-canvas px-3 text-body text-ink outline-none transition-colors focus-visible:ring-3 focus-visible:ring-primary/20"
                >
                  <option value="" disabled>Change status to...</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </>
            )}
            {canAssign && (
              <>
                <UserPlus className="size-4 text-primary" />
                <select
                  onChange={(e) => {
                    if (e.target.value !== "") handleBulkAssign(e.target.value);
                  }}
                  defaultValue=""
                  disabled={assigning}
                  className="h-10 rounded-lg border border-primary bg-canvas px-3 text-body text-ink outline-none transition-colors focus-visible:ring-3 focus-visible:ring-primary/20"
                >
                  <option value="" disabled>Assign to...</option>
                  {data.agents.map((a) => (
                    <option key={a._id} value={a._id}>{a.name}</option>
                  ))}
                </select>
              </>
            )}
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="inline-flex h-7 items-center rounded-full border border-hairline-soft bg-canvas px-2.5 text-caption text-slate hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, mobile or email..."
          className="h-11 w-full rounded-full border border-hairline-soft bg-canvas pl-9 pr-4 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
        />
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(""); setPage(1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Status"
          options={STATUSES}
          selected={selectedStatuses}
          onChange={(v) => { setSelectedStatuses(v); setPage(1); }}
        />
        <FilterDropdown
          label="Loan Type"
          options={LOAN_TYPES}
          selected={selectedLoanTypes}
          onChange={(v) => { setSelectedLoanTypes(v); setPage(1); }}
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          aria-label="From date"
        />
        <span className="text-caption text-steel">–</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          aria-label="To date"
        />
        <select
          value={assignedTo}
          onChange={(e) => { setAssignedTo(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          aria-label="Assigned agent"
        >
          <option value="">All Agents</option>
          {data.agents.map((a) => (
            <option key={a._id} value={a._id}>{a.name}</option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <ArrowUpDown className="size-3 text-steel" />
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="h-10 rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
            aria-label="Sort order"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filter chips */}
      {filterChips.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {filterChips.map((chip, i) => (
            <FilterChip key={i} label={chip.label} onRemove={chip.onRemove} />
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-caption text-critical hover:text-critical-strong ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-hairline-soft bg-canvas shadow-elevation-xs">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline-soft">
              {canAssign && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={data.leads.length > 0 && selectedIds.size === data.leads.length}
                    onChange={toggleSelectAll}
                    className="size-4 rounded border-hairline text-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                  />
                </th>
              )}
              {baseHeaders.map((header) => (
                  <th
                    key={header}
                    className="whitespace-nowrap px-4 py-3 text-left text-caption text-steel font-medium"
                  >
                    {header}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {data.leads.length === 0 ? (
              <tr>
                <td colSpan={canAssign ? 14 : 13} className="px-4 py-12 text-center text-body text-slate">
                  No leads found
                </td>
              </tr>
            ) : (
              data.leads.map((lead) => (
                <tr
                  key={lead._id}
                  onClick={() => navigateToLead(lead._id)}
                  className="group cursor-pointer border-b border-hairline-soft last:border-b-0 transition-colors hover:bg-primary-soft/40"
                >
                  {canAssign && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(lead._id)}
                        onChange={() => toggleSelect(lead._id)}
                        className="size-4 rounded border-hairline text-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                      />
                    </td>
                  )}
                  <td className="whitespace-nowrap px-4 py-3 text-body text-primary font-accent">
                    {lead.leadId}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-body text-ink-deep">
                    {lead.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-body text-ink">{lead.mobile}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-body text-slate">{lead.email}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-body text-ink font-accent">
                    ₹{lead.monthlySalary.toLocaleString("en-IN")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-body text-ink-deep font-accent">
                    ₹{lead.loanAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-body text-ink">{lead.loanType}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {lead.source === "Connector" && lead.connectorId ? (
                      <span className="inline-flex items-center gap-1.5 text-caption text-slate">
                        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-caption text-primary font-medium">Connector</span>
                        <span className="hidden lg:inline">{lead.connectorId.name}</span>
                      </span>
                    ) : (
                      <span className="text-caption text-steel">Website</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <SlaIndicator lead={lead} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    {canAssign ? (
                      <select
                        value={lead.assignedTo?._id || ""}
                        onChange={(e) => handleSingleAssign(lead._id, e.target.value)}
                        disabled={assigning}
                        className="h-7 max-w-[110px] rounded-md border border-hairline-soft bg-canvas px-1.5 text-caption text-ink outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                      >
                        <option value="">Unassigned</option>
                        {data.agents.map((a) => (
                          <option key={a._id} value={a._id}>{a.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-body text-slate">{lead.assignedTo?.name || "—"}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-body text-slate">
                    {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-caption text-slate">
            Showing {(data.pagination.page - 1) * data.pagination.limit + 1}–
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-10 items-center rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink transition-colors hover:bg-surface-soft disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(data.pagination.totalPages, 5) }, (_, i) => {
                const start = Math.max(1, data.pagination.page - 2);
                const p = start + i;
                if (p > data.pagination.totalPages) return null;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`flex size-8 items-center justify-center rounded-lg text-caption transition-colors ${
                      p === page
                        ? "bg-primary text-on-primary"
                        : "border border-hairline-soft bg-canvas text-ink hover:bg-surface-soft"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={page >= data.pagination.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex h-10 items-center rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink transition-colors hover:bg-surface-soft disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-start justify-center pt-20">
          <div className="rounded-full bg-primary-soft px-4 py-2 text-caption text-primary shadow-elevation-sm">
            Loading...
          </div>
        </div>
      )}
    </div>
  );
}
