"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, MessageCircle, Mail, IndianRupee, Briefcase, Plus, Check, User, UserPlus, Building2, Eye, EyeOff } from "lucide-react";
import { can, type Role } from "@/lib/permissions";

const STATUS_FLOW = [
  "NEW", "CONTACTED", "DOCUMENT_PENDING", "UNDER_REVIEW",
  "FOLLOW_UP", "APPROVED", "REJECTED", "CLOSED",
] as const;
const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  DOCUMENT_PENDING: "Documents Received",
  UNDER_REVIEW: "Under Review",
  FOLLOW_UP: "Follow Up",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CLOSED: "Closed",
};

const NEXT_STATUS: Record<string, string> = {
  NEW: "CONTACTED",
  CONTACTED: "DOCUMENT_PENDING",
  DOCUMENT_PENDING: "UNDER_REVIEW",
  UNDER_REVIEW: "APPROVED",
  FOLLOW_UP: "DOCUMENT_PENDING",
};
function nextStatus(current: string): string {
  return NEXT_STATUS[current] || current;
}

interface Remark {
  text: string;
  author: string;
  createdAt: string;
}

interface ActivityItem {
  _id: string;
  actionType: string;
  performedBy?: { _id: string; name: string; email: string } | null;
  description: string;
  createdAt: string;
}

interface Agent {
  _id: string;
  name: string;
  email: string;
}

interface ConnectorRef {
  _id: string;
  name: string;
  connectorCode: string;
}

interface LeadData {
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
  bankName?: string;
  bankPayout?: number;
  remarks: Remark[];
  createdAt: string;
  updatedAt: string;
  _currentUserRole?: string;
  _currentUserId?: string;
  _agents?: Agent[];
}

export default function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [lead, setLead] = useState<LeadData | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async () => {
    const [leadRes, actRes] = await Promise.all([
      fetch(`/api/leads/${id}`),
      fetch(`/api/leads/${id}/activities`),
    ]);
    if (!leadRes.ok) throw new Error("Not found");
    const [leadData, actData] = await Promise.all([leadRes.json(), actRes.json()]);
    setLead(leadData);
    setActivities(actData);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchAll().catch(() => setError("Lead not found")).finally(() => setLoading(false));
  }, [fetchAll]);

  async function handleStatusUpdate(newStatus: string) {
    if (!lead || newStatus === lead.status) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLead({ ...lead, status: newStatus });
        fetchAll();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleAddRemark() {
    if (!lead || !remark.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remark: remark.trim() }),
      });
      if (res.ok) {
        setRemark("");
        fetchAll();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleReassign(userId: string) {
    if (!lead) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: userId || null }),
      });
      if (res.ok) fetchAll();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-body text-slate">Loading...</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-section-sm lg:p-section">
        <p className="text-body text-critical">{error || "Lead not found"}</p>
        <button onClick={() => router.push("/admin/leads")} className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-4 text-button text-on-primary">
          Back to Leads
        </button>
      </div>
    );
  }

  return (
    <div className="p-section-sm lg:p-section">
      <button
        onClick={() => router.push("/admin/leads")}
        className="mb-6 inline-flex items-center gap-1.5 text-caption text-slate hover:text-ink transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to Leads
      </button>

      {/* Lead Information Panel */}
      <div className="rounded-xl bg-surface-soft p-xl shadow-elevation-sm ring-1 ring-hairline-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-heading-3 font-heading text-ink-deep">{lead.name}</h1>
              <StatusPill status={lead.status} />
            </div>
            <p className="text-body text-primary font-accent mt-1">{lead.leadId}</p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${lead.mobile}`}
              className="flex size-11 items-center justify-center rounded-full bg-primary text-on-primary transition-all active:bg-primary-deep"
              aria-label="Call"
            >
              <Phone className="size-4" />
            </a>
            <a
              href={`https://wa.me/${lead.mobile.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-11 items-center justify-center rounded-full bg-success text-canvas transition-all active:opacity-80"
              aria-label="WhatsApp"
            >
              <MessageCircle className="size-4" />
            </a>
            <a
              href={`mailto:${lead.email}`}
              className="flex size-11 items-center justify-center rounded-full bg-charcoal text-canvas transition-all active:opacity-80"
              aria-label="Email"
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
          <InfoItem label="Mobile" value={lead.mobile} />
          <InfoItem label="Email" value={lead.email} />
          <InfoItem label="Monthly Salary" value={`₹${lead.monthlySalary.toLocaleString("en-IN")}`} />
          <InfoItem label="Loan Amount" value={`₹${lead.loanAmount.toLocaleString("en-IN")}`} />
          <InfoItem label="Loan Type" value={lead.loanType} />
          <InfoItem label="Source" value={lead.source} />
          {lead.source === "Connector" && lead.connectorId && (
            <InfoItem label="Referred By" value={`${lead.connectorId.name} (${lead.connectorId.connectorCode})`} />
          )}
        </div>
      </div>

      {/* Bank & Payout Details (admin only) */}
      {lead._currentUserRole && can(lead._currentUserRole, "manage_connectors") && (
        <BankPayoutSection lead={lead} onUpdate={(updated) => setLead({ ...lead, ...updated })} />
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Status Timeline */}
        <div className="rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs lg:col-span-2">
          <h2 className="text-heading-5 font-heading text-ink-deep mb-5">Status Timeline</h2>

          <div className="relative">
            <div className="absolute top-4 left-[11px] h-[calc(100%-32px)] w-0.5 bg-hairline-soft" />

            {STATUS_FLOW.map((step, i) => {
              const stepIndex = STATUS_FLOW.indexOf(lead.status as typeof STATUS_FLOW[number]);
              const currentIndex = STATUS_FLOW.indexOf(step);
              const isCompleted = stepIndex >= 0 && currentIndex < stepIndex;
              const isCurrent = lead.status === step;
              const isFuture = !isCompleted && !isCurrent;

              return (
                <div key={step} className="relative flex items-start gap-3 pb-6 last:pb-0">
                  <div
                    className={`relative z-10 mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      isCompleted
                        ? "border-success bg-success text-canvas"
                        : isCurrent
                        ? "border-primary bg-primary text-on-primary"
                        : "border-stone bg-canvas text-stone"
                    }`}
                  >
                    {isCompleted ? <Check className="size-3" /> : <span className="text-caption font-medium">{i + 1}</span>}
                  </div>
                  <div className="flex flex-1 items-center justify-between pt-0.5">
                    <div>
                      <p
                        className={`text-body font-accent ${
                          isCurrent ? "text-ink-deep font-medium" : isCompleted ? "text-ink" : "text-stone"
                        }`}
                      >
                        {STATUS_LABELS[step] || step.replace("_", " ")}
                      </p>
                      {isCurrent && (
                        <p className="text-caption text-primary mt-0.5">Current stage</p>
                      )}
                    </div>

                    {isCurrent && !["APPROVED", "REJECTED", "CLOSED"].includes(lead.status) && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStatusUpdate(nextStatus(lead.status))}
                          disabled={saving}
                          className="inline-flex h-7 items-center rounded-full bg-primary px-3 text-caption text-on-primary transition-all active:bg-primary-deep disabled:opacity-50"
                        >
                          Advance
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>


        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs">
          <h2 className="text-heading-5 font-heading text-ink-deep mb-4">Quick Actions</h2>

          {lead._currentUserRole && can(lead._currentUserRole, "assign_lead") && (
            <div className="mb-4">
              <label className="text-caption text-steel mb-1 block">Assigned To</label>
              <div className="flex items-center gap-2">
                <UserPlus className="size-4 shrink-0 text-steel" />
                <select
                  value={lead.assignedTo?._id || ""}
                  onChange={(e) => handleReassign(e.target.value)}
                  disabled={saving}
                  className="h-11 flex-1 rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                >
                  <option value="">Unassigned</option>
                  {(lead._agents || []).map((a) => (
                    <option key={a._id} value={a._id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {(["NEW", "CONTACTED", "DOCUMENT_PENDING"] as const).map((step) => (
              <button
                key={step}
                onClick={() => handleStatusUpdate(step)}
                disabled={saving || lead.status === step}
                className={`inline-flex h-7 items-center rounded-full px-3 text-caption transition-all disabled:opacity-40 ${
                  lead.status === step
                    ? "bg-primary text-on-primary"
                    : "border border-hairline-soft text-slate hover:border-primary hover:text-primary"
                }`}
              >
                {STATUS_LABELS[step]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {(["UNDER_REVIEW", "FOLLOW_UP"] as const).map((step) => (
              <button
                key={step}
                onClick={() => handleStatusUpdate(step)}
                disabled={saving || lead.status === step}
                className={`inline-flex h-7 items-center rounded-full px-3 text-caption transition-all disabled:opacity-40 ${
                  lead.status === step
                    ? "bg-attention text-ink-deep"
                    : "border border-hairline-soft text-slate hover:border-primary hover:text-primary"
                }`}
              >
                {STATUS_LABELS[step]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {(["APPROVED", "REJECTED", "CLOSED"] as const).map((step) => (
              <button
                key={step}
                onClick={() => handleStatusUpdate(step)}
                disabled={saving || lead.status === step}
                className={`inline-flex h-7 items-center rounded-full px-3 text-caption transition-all disabled:opacity-40 ${
                  lead.status === step
                    ? step === "APPROVED" ? "bg-success text-canvas"
                      : step === "REJECTED" ? "bg-critical text-on-primary"
                      : "bg-slate text-canvas"
                    : "border border-hairline-soft text-slate hover:border-primary hover:text-primary"
                }`}
              >
                {STATUS_LABELS[step]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Notes / Remarks */}
        <div className="rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs">
          <h2 className="text-heading-5 font-heading text-ink-deep mb-4">Notes</h2>

          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Add a note..."
              className="h-9 flex-1 rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
              onKeyDown={(e) => { if (e.key === "Enter") handleAddRemark(); }}
            />
            <button
              onClick={handleAddRemark}
              disabled={saving || !remark.trim()}
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-button text-on-primary transition-all active:bg-primary-deep disabled:opacity-50"
            >
              <Plus className="size-3.5" />
              Add Note
            </button>
          </div>

          {lead.remarks.length === 0 ? (
            <p className="text-body text-slate py-4 text-center">No notes yet</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {[...lead.remarks].reverse().map((r, i) => (
                <div key={i} className="border-b border-hairline-soft pb-3 last:border-b-0">
                  <p className="text-body text-ink">{r.text}</p>
                  <p className="text-caption text-slate mt-1">
                    {r.author} &middot; {new Date(r.createdAt).toLocaleString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity History */}
        <div className="rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs">
          <h2 className="text-heading-5 font-heading text-ink-deep mb-4">Activity History</h2>

          {activities.length === 0 ? (
            <p className="text-body text-slate py-4 text-center">No activity recorded yet</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {activities.map((a) => (
                <div key={a._id} className="border-b border-hairline-soft pb-3 last:border-b-0">
                  <div className="flex items-start gap-2.5">
                    <ActivityIcon type={a.actionType} />
                    <div className="flex-1 min-w-0">
                      <p className="text-body text-ink">{a.description}</p>
                      <p className="text-caption text-slate mt-0.5">
                        {a.performedBy?.name || "System"} &middot; {new Date(a.createdAt).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    APPROVED: "bg-success text-canvas",
    REJECTED: "bg-critical text-canvas",
    FOLLOW_UP: "bg-attention text-ink-deep",
    UNDER_REVIEW: "bg-attention text-ink-deep",
    CLOSED: "bg-slate text-canvas",
  };
  const cls = colors[status] || "bg-surface-soft text-slate border border-hairline-soft";
  return (
    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-caption font-medium whitespace-nowrap ${cls}`}>
      {STATUS_LABELS[status] || status.replace("_", " ")}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-caption text-steel">{label}</p>
      <p className="text-body text-ink-deep truncate">{value}</p>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const cls = "flex size-6 shrink-0 items-center justify-center rounded-full";
  if (type === "STATUS_UPDATED") return <span className={`${cls} bg-primary-soft text-primary text-caption`}>S</span>;
  if (type === "REMARK_ADDED") return <span className={`${cls} bg-attention/20 text-attention text-caption`}>N</span>;
  if (type === "LEAD_ASSIGNED") return <span className={`${cls} bg-success/20 text-success text-caption`}>A</span>;
  if (type === "LEAD_CREATED") return <span className={`${cls} bg-primary-soft text-primary text-caption`}>+</span>;
  return <span className={`${cls} bg-surface-soft text-slate text-caption`}>•</span>;
}

function BankPayoutSection({ lead, onUpdate }: { lead: LeadData; onUpdate: (updates: Partial<LeadData>) => void }) {
  const [bankName, setBankName] = useState(lead.bankName || "");
  const [bankPayout, setBankPayout] = useState(lead.bankPayout ? String(lead.bankPayout) : "");
  const [saving, setSaving] = useState(false);
  const [showPayout, setShowPayout] = useState(false);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/leads/${lead._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: bankName.trim() || null,
          bankPayout: bankPayout ? Number(bankPayout) : 0,
        }),
      });
      if (res.ok) {
        onUpdate({ bankName: bankName.trim(), bankPayout: bankPayout ? Number(bankPayout) : 0 });
      }
    } finally {
      setSaving(false);
    }
  }, [lead._id, bankName, bankPayout, onUpdate]);

  return (
    <div className="mt-6 rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="size-5 text-primary" />
        <h2 className="text-heading-5 font-heading text-ink-deep">Bank &amp; Payout Details</h2>
        <span className="rounded-full bg-attention/10 px-2 py-0.5 text-caption text-attention">Confidential</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-caption text-steel mb-1 block">Bank / NBFC Name</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. HDFC Bank, Bajaj Finance"
            className="h-10 w-full rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
          />
        </div>
        <div>
          <label className="text-caption text-steel mb-1 block">Payout Received (₹)</label>
          <div className="relative">
            <input
              type={showPayout ? "text" : "password"}
              value={bankPayout}
              onChange={(e) => setBankPayout(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 25000"
              className="h-10 w-full rounded-lg border border-hairline-soft bg-canvas pl-3 pr-10 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowPayout(!showPayout)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-steel hover:text-ink"
            >
              {showPayout ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-button text-on-primary transition-all active:bg-primary-deep disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Bank Details"}
        </button>
        {(lead.bankName || lead.bankPayout) && (
          <span className="text-caption text-success flex items-center gap-1">
            <Check className="size-3" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
