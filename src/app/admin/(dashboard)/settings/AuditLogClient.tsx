"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, ChevronDown, ArrowUpDown, Filter, Clock } from "lucide-react";

interface Actor {
  _id: string;
  name: string;
  email: string;
}

interface ActivityEntry {
  _id: string;
  actionType: string;
  performedBy?: { _id: string; name: string; email: string } | null;
  leadId?: string;
  description: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ActivitiesResponse {
  activities: ActivityEntry[];
  pagination: Pagination;
  actors: Actor[];
  actionTypes: string[];
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  LOGIN_SUCCESS: "Login Success",
  LOGIN_FAILED: "Login Failed",
  LOGOUT: "Logout",
  LEAD_CREATED: "Lead Created",
  STATUS_UPDATED: "Status Updated",
  REMARK_ADDED: "Remark Added",
  LEAD_ASSIGNED: "Lead Assigned",
  USER_CREATED: "User Created",
  USER_ROLE_CHANGED: "Role Changed",
  USER_DEACTIVATED: "User Deactivated",
  USER_ACTIVATED: "User Activated",
  PASSWORD_CHANGED: "Password Changed",
  NOTIFICATION_FAILED: "Notification Failed",
};

const ACTION_ICON_CLASS: Record<string, string> = {
  LOGIN_SUCCESS: "bg-success/20 text-success",
  LOGIN_FAILED: "bg-critical/20 text-critical",
  LOGOUT: "bg-surface-soft text-slate",
  LEAD_CREATED: "bg-primary-soft text-primary",
  STATUS_UPDATED: "bg-primary-soft text-primary",
  REMARK_ADDED: "bg-attention/20 text-attention",
  LEAD_ASSIGNED: "bg-success/20 text-success",
  USER_CREATED: "bg-charcoal/20 text-charcoal",
  USER_ROLE_CHANGED: "bg-attention/20 text-attention",
  USER_DEACTIVATED: "bg-critical/20 text-critical",
  USER_ACTIVATED: "bg-success/20 text-success",
  PASSWORD_CHANGED: "bg-charcoal/20 text-charcoal",
  NOTIFICATION_FAILED: "bg-critical/20 text-critical",
};

function ActionIcon({ type }: { type: string }) {
  const cls = ACTION_ICON_CLASS[type] || "bg-surface-soft text-slate";
  const label = ACTION_TYPE_LABELS[type] || type;
  const initial = label.charAt(0);
  return (
    <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-caption font-medium ${cls}`}>
      {initial}
    </span>
  );
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function AuditLogClient() {
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState("");
  const [actor, setActor] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<ActivitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (actionType) params.set("actionType", actionType);
      if (actor) params.set("actor", actor);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      params.set("page", String(page));
      const res = await fetch(`/api/activities?${params.toString()}`);
      const json: ActivitiesResponse = await res.json();
      setData(json);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, actionType, actor, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function clearFilters() {
    setSearch("");
    setActionType("");
    setActor("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  const hasFilters = search || actionType || actor || dateFrom || dateTo;

  const totalActions = data?.pagination.total ?? 0;
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className="p-section-sm lg:p-section">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 font-heading text-ink-deep">Audit Log</h1>
          <p className="text-body text-slate mt-1">Searchable, immutable activity history</p>
        </div>
        <div className="flex items-center gap-2 text-caption text-steel">
          <Clock className="size-3.5" />
          {totalActions} total entries
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-steel" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search descriptions..."
          className="h-11 w-full rounded-full border border-hairline-soft bg-canvas pl-9 pr-4 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
        />
        {search && (
          <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-ink">
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          value={actionType}
          onChange={(e) => { setActionType(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          aria-label="Action type"
        >
          <option value="">All Actions</option>
          {(data?.actionTypes || []).map((t) => (
            <option key={t} value={t}>{ACTION_TYPE_LABELS[t] || t}</option>
          ))}
        </select>

        <select
          value={actor}
          onChange={(e) => { setActor(e.target.value); setPage(1); }}
          className="h-10 rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          aria-label="Actor"
        >
          <option value="">All Actors</option>
          {(data?.actors || []).map((a) => (
            <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
          ))}
        </select>

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

        {hasFilters && (
          <button onClick={clearFilters} className="text-caption text-critical hover:text-critical-strong ml-1">
            Clear all
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-hairline-soft bg-canvas shadow-elevation-xs">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline-soft">
              {["", "Action", "Description", "Actor", "Date"].map((header) => (
                <th key={header} className="whitespace-nowrap px-4 py-3 text-left text-caption text-steel font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && !data ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-body text-slate">Loading...</td>
              </tr>
            ) : data?.activities.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-body text-slate">No activity found</td>
              </tr>
            ) : (
              data?.activities.map((entry) => (
                <tr key={entry._id} className="border-b border-hairline-soft last:border-b-0 transition-colors hover:bg-primary-soft/40">
                  <td className="px-4 py-3">
                    <ActionIcon type={entry.actionType} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className="inline-flex h-5 items-center rounded-full bg-surface-soft px-2 py-0.5 text-caption text-slate border border-hairline-soft">
                      {ACTION_TYPE_LABELS[entry.actionType] || entry.actionType.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-body text-ink max-w-md">
                    <p className="truncate">{entry.description}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-body text-slate">
                    {entry.performedBy?.name || "System"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-body text-slate">
                    {new Date(entry.createdAt).toLocaleString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-caption text-slate">
            Page {page} of {totalPages} ({data?.pagination.total} entries)
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex h-10 items-center rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink transition-colors hover:bg-surface-soft disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages || loading}
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
          <div className="rounded-full bg-primary-soft px-4 py-2 text-caption text-primary shadow-elevation-sm">Loading...</div>
        </div>
      )}
    </div>
  );
}
