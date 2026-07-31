"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, ChevronDown } from "lucide-react";
import { can } from "@/lib/permissions";

const STATUSES = ["PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "REJECTED"] as const;
const NETWORK_TYPES = [
  "Shopkeeper", "Insurance Agent", "CA/Accountant", "Real Estate Broker", "Individual", "Other",
] as const;

type Role = "PUBLIC" | "AGENT" | "MANAGER" | "SUPER_ADMIN";

const STATUS_BADGE_CLASS: Record<string, string> = {
  PENDING_APPROVAL: "bg-attention text-ink-deep",
  ACTIVE: "bg-success text-canvas",
  SUSPENDED: "bg-attention text-ink-deep",
  REJECTED: "bg-critical text-canvas",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE_CLASS[status] || "bg-surface-soft text-slate border border-hairline-soft";
  return (
    <span className={`inline-flex h-5 items-center rounded-full px-2 py-0.5 text-caption font-medium whitespace-nowrap ${cls}`}>
      {status.replace("_", " ")}
    </span>
  );
}

interface Connector {
  _id: string;
  connectorCode: string;
  name: string;
  mobile: string;
  city: string;
  networkType: string;
  status: string;
  totalLeadsReferred: number;
  totalCommissionEarned: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ConnectorsResponse {
  connectors: Connector[];
  pagination: Pagination;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function FilterDropdown({
  label, options, selected, onChange,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
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
    onChange(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val]);
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
              <span className={`flex size-3.5 items-center justify-center rounded border ${
                selected.includes(opt) ? "border-primary bg-primary text-on-primary" : "border-hairline"
              }`}>
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

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-caption text-primary">
      {label}
      <button type="button" onClick={onRemove} className="flex hover:text-primary-deep" aria-label={`Remove ${label} filter`}>
        <X className="size-2.5" />
      </button>
    </span>
  );
}

export default function ConnectorsClient({
  initialData,
  initialParams,
  role,
}: {
  initialData: ConnectorsResponse;
  initialParams: Record<string, string>;
  role: string;
}) {
  const router = useRouter();
  const canManage = can(role, "manage_connectors");

  const [search, setSearch] = useState(initialParams.search || "");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    initialParams.status ? initialParams.status.split(",") : []
  );
  const [selectedNetworkTypes, setSelectedNetworkTypes] = useState<string[]>(
    initialParams.networkType ? initialParams.networkType.split(",") : []
  );
  const [cityFilter, setCityFilter] = useState(initialParams.city || "");
  const [page, setPage] = useState(parseInt(initialParams.page || "1", 10));
  const [data, setData] = useState<ConnectorsResponse>(initialData);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetchData = useCallback(async (params: Record<string, string>) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetch(`/api/admin/connectors?${qs}`);
      const json: ConnectorsResponse = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params: Record<string, string> = { page: String(page), limit: "20" };
    if (debouncedSearch) params.search = debouncedSearch;
    if (selectedStatuses.length) params.status = selectedStatuses.join(",");
    if (selectedNetworkTypes.length) params.networkType = selectedNetworkTypes.join(",");
    if (cityFilter) params.city = cityFilter;
    fetchData(params);
  }, [debouncedSearch, selectedStatuses, selectedNetworkTypes, cityFilter, page, fetchData]);

  async function handleStatusChange(connectorId: string, newStatus: string) {
    setStatusLoading(connectorId);
    try {
      const res = await fetch("/api/admin/connectors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectorId, status: newStatus }),
      });
      if (res.ok) {
        const params: Record<string, string> = { page: String(page), limit: "20" };
        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedStatuses.length) params.status = selectedStatuses.join(",");
        if (selectedNetworkTypes.length) params.networkType = selectedNetworkTypes.join(",");
        if (cityFilter) params.city = cityFilter;
        await fetchData(params);
      }
    } finally {
      setStatusLoading(null);
    }
  }

  const { connectors, pagination } = data;

  return (
    <div className="p-section-sm lg:p-section">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-heading-3 font-heading text-ink-deep">Connectors</h1>
        <span className="text-body text-slate">{pagination.total} total</span>
      </div>

      {/* Search & Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-steel" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, mobile, code..."
            className="h-8 w-full rounded-lg border border-hairline-soft bg-canvas pl-8 pr-3 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          />
        </div>

        <FilterDropdown
          label="Status"
          options={STATUSES}
          selected={selectedStatuses}
          onChange={(v) => { setSelectedStatuses(v); setPage(1); }}
        />
        <FilterDropdown
          label="Network Type"
          options={NETWORK_TYPES}
          selected={selectedNetworkTypes}
          onChange={(v) => { setSelectedNetworkTypes(v); setPage(1); }}
        />

        <div className="relative">
          <input
            type="text"
            value={cityFilter}
            onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
            placeholder="City..."
            className="h-8 w-28 rounded-lg border border-hairline-soft bg-canvas px-2.5 text-caption text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      {/* Active filter chips */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {selectedStatuses.map((s) => (
          <FilterChip key={s} label={`Status: ${s.replace("_", " ")}`} onRemove={() => {
            setSelectedStatuses(selectedStatuses.filter((x) => x !== s));
            setPage(1);
          }} />
        ))}
        {selectedNetworkTypes.map((t) => (
          <FilterChip key={t} label={`Network: ${t}`} onRemove={() => {
            setSelectedNetworkTypes(selectedNetworkTypes.filter((x) => x !== t));
            setPage(1);
          }} />
        ))}
        {cityFilter && (
          <FilterChip label={`City: ${cityFilter}`} onRemove={() => { setCityFilter(""); setPage(1); }} />
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl bg-canvas shadow-elevation-sm ring-1 ring-hairline-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline-soft">
              <th className="px-4 py-3 text-left text-caption font-accent text-slate uppercase">Code</th>
              <th className="px-4 py-3 text-left text-caption font-accent text-slate uppercase">Name</th>
              <th className="px-4 py-3 text-left text-caption font-accent text-slate uppercase">Mobile</th>
              <th className="px-4 py-3 text-left text-caption font-accent text-slate uppercase">City</th>
              <th className="px-4 py-3 text-left text-caption font-accent text-slate uppercase">Network Type</th>
              <th className="px-4 py-3 text-left text-caption font-accent text-slate uppercase">Status</th>
              <th className="px-4 py-3 text-right text-caption font-accent text-slate uppercase">Leads</th>
              <th className="px-4 py-3 text-right text-caption font-accent text-slate uppercase">Commission</th>
              <th className="px-4 py-3 text-left text-caption font-accent text-slate uppercase">Joined</th>
              <th className="px-4 py-3 text-center text-caption font-accent text-slate uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-body text-slate">Loading...</td></tr>
            ) : connectors.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-body text-slate">No connectors found.</td></tr>
            ) : connectors.map((c) => (
              <tr key={c._id} className="border-b border-hairline-soft hover:bg-surface-soft/50">
                <td className="px-4 py-3">
                  <button
                    onClick={() => router.push(`/admin/connectors/${c._id}`)}
                    className="font-mono text-caption text-primary hover:text-primary-deep transition-colors"
                  >
                    {c.connectorCode}
                  </button>
                </td>
                <td className="px-4 py-3 text-body text-ink-deep font-accent">{c.name}</td>
                <td className="px-4 py-3 text-body text-slate">{c.mobile}</td>
                <td className="px-4 py-3 text-body text-slate">{c.city}</td>
                <td className="px-4 py-3 text-body text-slate">{c.networkType}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-right text-body text-ink">{c.totalLeadsReferred}</td>
                <td className="px-4 py-3 text-right text-body text-ink">
                  ₹{c.totalCommissionEarned.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-caption text-slate">
                  {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-center">
                  {canManage && (
                    <StatusActions
                      connectorId={c._id}
                      currentStatus={c.status}
                      loading={statusLoading === c._id}
                      onStatusChange={handleStatusChange}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="inline-flex h-8 items-center rounded-lg border border-hairline-soft px-3 text-caption text-slate transition-colors hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
          >
            Previous
          </button>
          <span className="text-caption text-slate px-2">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page >= pagination.totalPages}
            className="inline-flex h-8 items-center rounded-lg border border-hairline-soft px-3 text-caption text-slate transition-colors hover:border-primary hover:text-primary disabled:opacity-30 disabled:pointer-events-none"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function StatusActions({
  connectorId, currentStatus, loading, onStatusChange,
}: {
  connectorId: string;
  currentStatus: string;
  loading: boolean;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const actions: { label: string; status: string; variant: string }[] = [];

  if (currentStatus === "PENDING_APPROVAL") {
    actions.push({ label: "Approve", status: "ACTIVE", variant: "primary" });
    actions.push({ label: "Reject", status: "REJECTED", variant: "critical" });
  }
  if (currentStatus === "ACTIVE") {
    actions.push({ label: "Suspend", status: "SUSPENDED", variant: "attention" });
  }
  if (currentStatus === "SUSPENDED") {
    actions.push({ label: "Reactivate", status: "ACTIVE", variant: "primary" });
  }

  return (
    <div className="flex items-center justify-center gap-1">
      {actions.map((a) => (
        <button
          key={a.status}
          onClick={() => onStatusChange(connectorId, a.status)}
          disabled={loading}
          className={`inline-flex h-6 items-center rounded-full px-2 text-caption font-medium transition-colors disabled:opacity-40 ${
            a.variant === "primary"
              ? "bg-primary text-on-primary hover:bg-primary-deep"
              : a.variant === "critical"
              ? "bg-critical text-on-primary hover:opacity-80"
              : "bg-attention text-ink-deep hover:opacity-80"
          }`}
        >
          {loading ? "..." : a.label}
        </button>
      ))}
    </div>
  );
}
