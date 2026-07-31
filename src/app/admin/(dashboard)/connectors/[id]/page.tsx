"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, User, MapPin, Briefcase, Banknote, Check, X, Loader2, Pencil, Save } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  PENDING_APPROVAL: "Pending Approval",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  REJECTED: "Rejected",
};

const STATUS_BADGE: Record<string, string> = {
  APPROVED: "bg-success text-canvas",
  REJECTED: "bg-critical text-canvas",
  CLOSED: "bg-slate text-canvas",
  FOLLOW_UP: "bg-attention text-ink-deep",
  UNDER_REVIEW: "bg-attention text-ink-deep",
};

function Pill({ status }: { status: string }) {
  const cls = STATUS_BADGE[status] || "bg-surface-soft text-slate border border-hairline-soft";
  return (
    <span className={`inline-flex h-5 items-center rounded-full px-2 py-0.5 text-caption font-medium whitespace-nowrap ${cls}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline-soft py-2 last:border-b-0">
      <span className="text-caption text-slate">{label}</span>
      <span className="text-body text-ink-deep text-right ml-4 break-all">{value}</span>
    </div>
  );
}

function BankDetailsSection({
  bankDetails: initialBankDetails,
  connectorId,
}: {
  bankDetails: ConnectorDetail["connector"]["bankDetails"];
  connectorId: string;
}) {
  const [bankDetails, setBankDetails] = useState(initialBankDetails);
  const [editing, setEditing] = useState(!bankDetails);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    accountHolderName: bankDetails?.accountHolderName || "",
    accountNumber: bankDetails?.accountNumber || "",
    ifsc: bankDetails?.ifsc || "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/connectors/${connectorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankDetails: form }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setBankDetails(form);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-lg border border-hairline-soft bg-canvas p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-body-small font-accent text-ink">Bank Account Details</p>
        {!editing && (
          <button onClick={() => { setEditing(true); setForm({ accountHolderName: bankDetails?.accountHolderName || "", accountNumber: bankDetails?.accountNumber || "", ifsc: bankDetails?.ifsc || "" }); }} className="inline-flex items-center gap-1 text-caption text-primary hover:underline">
            <Pencil className="size-3" /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="text-caption text-slate block mb-1">Account Holder</label>
            <input
              type="text"
              value={form.accountHolderName}
              onChange={(e) => setForm((f) => ({ ...f, accountHolderName: e.target.value }))}
              className="w-full rounded-lg border border-hairline-soft bg-surface-soft px-3 py-2 text-body text-ink placeholder:text-steel outline-none focus:border-primary transition-colors"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="text-caption text-slate block mb-1">Account Number</label>
            <input
              type="text"
              value={form.accountNumber}
              onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
              className="w-full rounded-lg border border-hairline-soft bg-surface-soft px-3 py-2 text-body text-ink placeholder:text-steel outline-none focus:border-primary transition-colors"
              placeholder="e.g. 1234567890"
            />
          </div>
          <div>
            <label className="text-caption text-slate block mb-1">IFSC Code</label>
            <input
              type="text"
              value={form.ifsc}
              onChange={(e) => setForm((f) => ({ ...f, ifsc: e.target.value.toUpperCase() }))}
              className="w-full rounded-lg border border-hairline-soft bg-surface-soft px-3 py-2 text-body text-ink placeholder:text-steel outline-none focus:border-primary transition-colors"
              placeholder="e.g. HDFC0001234"
            />
          </div>
          <div className="col-span-full flex gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-button text-on-primary disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              {saving ? "Saving..." : "Save"}
            </button>
            {bankDetails && (
              <button onClick={() => setEditing(false)} className="inline-flex h-9 items-center rounded-full border border-hairline-soft px-4 text-button text-slate">
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : bankDetails ? (
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
          <div>
            <span className="text-caption text-slate block">Holder</span>
            <span className="text-body text-ink">{bankDetails.accountHolderName}</span>
          </div>
          <div>
            <span className="text-caption text-slate block">Account Number</span>
            <span className="font-mono text-body text-ink">{bankDetails.accountNumber}</span>
          </div>
          <div>
            <span className="text-caption text-slate block">IFSC</span>
            <span className="font-mono text-body text-ink">{bankDetails.ifsc}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface ConnectorDetail {
  connector: {
    _id: string;
    connectorCode: string;
    name: string;
    mobile: string;
    email: string;
    city: string;
    networkType: string;
    status: string;
    totalLeadsReferred: number;
    totalCommissionEarned: number;
    approvedBy?: { _id: string; name: string };
    approvedAt?: string;
    createdAt: string;
    bankDetails?: {
      accountHolderName: string;
      accountNumber: string;
      ifsc: string;
    } | null;
  };
  leads: Array<{
    _id: string;
    leadId: string;
    name: string;
    mobile: string;
    email: string;
    loanType: string;
    loanAmount: number;
    status: string;
    assignedTo?: { _id: string; name: string; email: string } | null;
    createdAt: string;
  }>;
  payouts: Array<{
    _id: string;
    leadId: string;
    loanType: string;
    loanAmountDisbursed: number;
    commissionAmount: number;
    status: string;
    paidAt?: string;
    approvedAt?: string;
    createdAt: string;
  }>;
  activities: Array<{
    _id: string;
    actionType: string;
    performedBy?: { _id: string; name: string; email: string } | null;
    description: string;
    createdAt: string;
  }>;
}

export default function ConnectorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ConnectorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/admin/connectors/${id}`);
    if (!res.ok) throw new Error("Not found");
    return res.json();
  }, [id]);

  useEffect(() => {
    setLoading(true);
    fetchData()
      .then(setData)
      .catch(() => setError("Connector not found"))
      .finally(() => setLoading(false));
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-steel" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-section-sm lg:p-section">
        <p className="text-body text-critical">{error || "Connector not found"}</p>
        <button onClick={() => router.push("/admin/connectors")} className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-4 text-button text-on-primary">
          Back to Connectors
        </button>
      </div>
    );
  }

  const { connector, leads, payouts, activities } = data;

  return (
    <div className="p-section-sm lg:p-section">
      <button
        onClick={() => router.push("/admin/connectors")}
        className="mb-6 inline-flex items-center gap-1.5 text-caption text-slate hover:text-ink transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to Connectors
      </button>

      {/* Profile Panel */}
      <div className="rounded-xl bg-surface-soft p-xl shadow-elevation-sm ring-1 ring-hairline-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-body font-accent text-primary">
                {connector.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-heading-3 font-heading text-ink-deep">{connector.name}</h1>
                <p className="text-body text-primary font-accent mt-0.5 font-mono">{connector.connectorCode}</p>
              </div>
            </div>
          </div>
          <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-caption font-medium ${
            connector.status === "ACTIVE" ? "bg-success text-canvas"
            : connector.status === "REJECTED" ? "bg-critical text-canvas"
            : connector.status === "SUSPENDED" ? "bg-attention text-ink-deep"
            : "bg-attention text-ink-deep"
          }`}>
            {STATUS_LABELS[connector.status] || connector.status}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Mobile" value={connector.mobile} />
          <InfoRow label="Email" value={connector.email} />
          <InfoRow label="City" value={connector.city} />
          <InfoRow label="Network Type" value={connector.networkType} />
          <InfoRow label="Total Leads" value={String(connector.totalLeadsReferred)} />
          <InfoRow label="Total Commission" value={`₹${connector.totalCommissionEarned.toLocaleString("en-IN")}`} />
          <InfoRow label="Joined" value={new Date(connector.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} />
          {connector.approvedAt && (
            <InfoRow label="Approved" value={new Date(connector.approvedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} />
          )}
        </div>

        {/* Bank Details */}
        <BankDetailsSection
          bankDetails={connector.bankDetails}
          connectorId={connector._id}
        />
      </div>

      {/* Referred Leads */}
      <div className="mt-6 rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs">
        <h2 className="text-heading-5 font-heading text-ink-deep mb-4">Referred Leads</h2>
        {leads.length === 0 ? (
          <p className="text-body text-slate py-4 text-center">No leads referred yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline-soft">
                  <th className="px-3 py-2 text-left text-caption font-accent text-slate uppercase">Lead ID</th>
                  <th className="px-3 py-2 text-left text-caption font-accent text-slate uppercase">Name</th>
                  <th className="px-3 py-2 text-left text-caption font-accent text-slate uppercase">Loan Type</th>
                  <th className="px-3 py-2 text-left text-caption font-accent text-slate uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-caption font-accent text-slate uppercase">Assigned To</th>
                  <th className="px-3 py-2 text-left text-caption font-accent text-slate uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l._id} className="border-b border-hairline-soft hover:bg-surface-soft/50">
                    <td className="px-3 py-2 font-mono text-caption text-primary">{l.leadId}</td>
                    <td className="px-3 py-2 text-body text-ink">{l.name}</td>
                    <td className="px-3 py-2 text-body text-slate">{l.loanType}</td>
                    <td className="px-3 py-2"><Pill status={l.status} /></td>
                    <td className="px-3 py-2 text-caption text-slate">{l.assignedTo?.name || "—"}</td>
                    <td className="px-3 py-2 text-caption text-slate">
                      {new Date(l.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Commission Ledger */}
      <div className="mt-6 rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs">
        <h2 className="text-heading-5 font-heading text-ink-deep mb-4">Commission Ledger</h2>
        {payouts.length === 0 ? (
          <p className="text-body text-slate py-4 text-center">No commission records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hairline-soft">
                  <th className="px-3 py-2 text-left text-caption font-accent text-slate uppercase">Lead ID</th>
                  <th className="px-3 py-2 text-left text-caption font-accent text-slate uppercase">Loan Type</th>
                  <th className="px-3 py-2 text-right text-caption font-accent text-slate uppercase">Disbursed</th>
                  <th className="px-3 py-2 text-right text-caption font-accent text-slate uppercase">Commission</th>
                  <th className="px-3 py-2 text-left text-caption font-accent text-slate uppercase">Status</th>
                  <th className="px-3 py-2 text-left text-caption font-accent text-slate uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p._id} className="border-b border-hairline-soft hover:bg-surface-soft/50">
                    <td className="px-3 py-2 font-mono text-caption text-primary">{p.leadId}</td>
                    <td className="px-3 py-2 text-body text-slate">{p.loanType}</td>
                    <td className="px-3 py-2 text-right text-body text-ink">₹{p.loanAmountDisbursed.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2 text-right text-body font-medium text-ink-deep">₹{p.commissionAmount.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2"><Pill status={p.status} /></td>
                    <td className="px-3 py-2 text-caption text-slate">
                      {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      {p.paidAt && ` · Paid: ${new Date(p.paidAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity History */}
      <div className="mt-6 rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs">
        <h2 className="text-heading-5 font-heading text-ink-deep mb-4">Activity History</h2>
        {activities.length === 0 ? (
          <p className="text-body text-slate py-4 text-center">No activity recorded yet.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((a) => (
              <div key={a._id} className="flex items-start gap-2.5 border-b border-hairline-soft pb-3 last:border-b-0">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-caption text-primary">
                  {a.actionType === "CONNECTOR_APPROVED" ? <Check className="size-3" /> : a.actionType === "CONNECTOR_REJECTED" ? <X className="size-3" /> : "•"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body text-ink">{a.description}</p>
                  <p className="text-caption text-slate mt-0.5">
                    {a.performedBy?.name || "System"} · {new Date(a.createdAt).toLocaleString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
