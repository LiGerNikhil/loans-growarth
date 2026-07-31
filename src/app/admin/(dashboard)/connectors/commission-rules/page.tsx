"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, Loader2 } from "lucide-react";

const LOAN_TYPES = [
  "Personal Loan", "Business Loan", "Loan Against Property",
  "Overdraft Facility", "Home Loan", "Other",
] as const;

interface Rule {
  _id: string;
  loanType: string;
  commissionType: "FLAT" | "PERCENTAGE";
  value: number;
  effectiveFrom: string;
  active: boolean;
  createdBy?: { _id: string; name: string; email: string };
  createdAt: string;
}

interface CommissionRulesResponse {
  rules: Rule[];
  grouped: Record<string, Rule[]>;
}

const inputBase =
  "h-11 w-full rounded-lg border bg-canvas px-3 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:ring-3";
const inputNormal =
  "border-hairline focus-visible:border-primary focus-visible:ring-primary/20";
const inputError =
  "border-critical focus-visible:border-critical focus-visible:ring-critical/20";

function FieldError({ message }: { message?: string }) {
  return (
    <div className="min-h-[1.25rem]">
      {message && <p className="text-caption text-critical-strong mt-0.5">{message}</p>}
    </div>
  );
}

function RuleForm({ onDone, editing }: { onDone: () => void; editing?: Rule | null }) {
  const [loanType, setLoanType] = useState(editing?.loanType || "");
  const [commissionType, setCommissionType] = useState<"FLAT" | "PERCENTAGE">(editing?.commissionType || "PERCENTAGE");
  const [value, setValue] = useState(editing?.value?.toString() || "");
  const [effectiveFrom, setEffectiveFrom] = useState(
    editing?.effectiveFrom ? new Date(editing.effectiveFrom).toISOString().slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!loanType) errs.loanType = "Select a loan type";
    if (!value || isNaN(Number(value)) || Number(value) <= 0) errs.value = "Enter a positive number";
    if (!effectiveFrom) errs.effectiveFrom = "Select an effective date";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/commission-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanType,
          commissionType,
          value: Number(value),
          effectiveFrom,
          ruleId: editing?._id,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save rule");
      }

      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-critical/10 px-3 py-2 text-body-small text-critical-strong">
          {error}
        </div>
      )}

      <div>
        <label className="text-caption text-ink mb-0.5 block font-accent">Loan Type</label>
        <select
          value={loanType}
          onChange={(e) => setLoanType(e.target.value)}
          className={`${inputBase} ${fieldErrors.loanType ? inputError : inputNormal} appearance-none cursor-pointer pr-9`}
        >
          <option value="">Select loan type</option>
          {LOAN_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <FieldError message={fieldErrors.loanType} />
      </div>

      <div>
        <label className="text-caption text-ink mb-1.5 block font-accent">Commission Type</label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="commissionType"
              value="FLAT"
              checked={commissionType === "FLAT"}
              onChange={() => setCommissionType("FLAT")}
              className="size-4 accent-primary"
            />
            <span className="text-body text-ink">Flat (₹)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="commissionType"
              value="PERCENTAGE"
              checked={commissionType === "PERCENTAGE"}
              onChange={() => setCommissionType("PERCENTAGE")}
              className="size-4 accent-primary"
            />
            <span className="text-body text-ink">Percentage (%)</span>
          </label>
        </div>
      </div>

      <div>
        <label className="text-caption text-ink mb-0.5 block font-accent">
          Value {commissionType === "FLAT" ? "(₹)" : "(%)"}
        </label>
        <input
          type="number"
          step="any"
          min="0"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={commissionType === "FLAT" ? "e.g. 5000" : "e.g. 1.5"}
          className={`${inputBase} ${fieldErrors.value ? inputError : inputNormal}`}
        />
        <FieldError message={fieldErrors.value} />
      </div>

      <div>
        <label className="text-caption text-ink mb-0.5 block font-accent">Effective From</label>
        <input
          type="date"
          value={effectiveFrom}
          onChange={(e) => setEffectiveFrom(e.target.value)}
          className={`${inputBase} ${fieldErrors.effectiveFrom ? inputError : inputNormal}`}
        />
        <FieldError message={fieldErrors.effectiveFrom} />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-button text-on-primary transition-all active:bg-primary-deep disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : editing ? "Update Rule" : "Create Rule"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="inline-flex h-11 items-center justify-center rounded-full border border-hairline-soft px-6 text-button text-slate transition-colors hover:border-primary hover:text-primary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function CommissionRulesPage() {
  const router = useRouter();
  const [data, setData] = useState<CommissionRulesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expandedLoanType, setExpandedLoanType] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/commission-rules");
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setData(json);
      if (json.rules.length > 0) setExpandedLoanType(json.rules[0].loanType);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-steel" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-section-sm lg:p-section">
        <p className="text-body text-critical">{error}</p>
        <button onClick={() => router.push("/admin/connectors")} className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-4 text-button text-on-primary">
          Back to Connectors
        </button>
      </div>
    );
  }

  const grouped = data?.grouped || {};

  return (
    <div className="p-section-sm lg:p-section">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push("/admin/connectors")}
            className="inline-flex items-center gap-1.5 text-caption text-slate hover:text-ink transition-colors mb-2"
          >
            ← Back to Connectors
          </button>
          <h1 className="text-heading-3 font-heading text-ink-deep">Commission Rules</h1>
          <p className="text-body text-slate mt-1">
            Define commission rates per loan type. Creating a new rule deactivates the previous active rule.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-button text-on-primary transition-all active:bg-primary-deep"
        >
          <Plus className="size-4" />
          New Rule
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="mb-8 rounded-xl bg-surface-soft p-6 shadow-elevation-sm ring-1 ring-hairline-soft">
          <h2 className="text-heading-5 font-heading text-ink-deep mb-4">Create Commission Rule</h2>
          <RuleForm onDone={() => { setShowForm(false); fetchRules(); }} />
        </div>
      )}

      {/* Rules grouped by loanType */}
      {Object.keys(grouped).length === 0 ? (
        <div className="rounded-xl bg-canvas p-12 text-center shadow-elevation-sm ring-1 ring-hairline-soft">
          <p className="text-body text-slate mb-2">No commission rules defined yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-button text-on-primary transition-all active:bg-primary-deep"
          >
            <Plus className="size-4" />
            Create First Rule
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {LOAN_TYPES.map((lt) => {
            const rules = grouped[lt];
            if (!rules || rules.length === 0) return null;

            const active = rules.find((r) => r.active);
            const isExpanded = expandedLoanType === lt;

            return (
              <div key={lt} className="rounded-xl bg-canvas shadow-elevation-sm ring-1 ring-hairline-soft overflow-hidden">
                <button
                  onClick={() => setExpandedLoanType(isExpanded ? null : lt)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-surface-soft/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-heading-5 font-heading text-ink-deep">{lt}</span>
                    {active ? (
                      <span className="inline-flex h-5 items-center rounded-full bg-success px-2 text-caption font-medium text-canvas">
                        Active: {active.commissionType === "FLAT" ? "₹" : ""}{active.value}{active.commissionType === "PERCENTAGE" ? "%" : ""}
                      </span>
                    ) : (
                      <span className="inline-flex h-5 items-center rounded-full bg-surface-soft px-2 text-caption font-medium text-slate border border-hairline-soft">
                        No active rule
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`size-4 text-steel transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>

                {isExpanded && (
                  <div className="border-t border-hairline-soft">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-hairline-soft">
                          <th className="px-5 py-2.5 text-left text-caption font-accent text-slate uppercase">Type</th>
                          <th className="px-5 py-2.5 text-right text-caption font-accent text-slate uppercase">Value</th>
                          <th className="px-5 py-2.5 text-left text-caption font-accent text-slate uppercase">Effective From</th>
                          <th className="px-5 py-2.5 text-left text-caption font-accent text-slate uppercase">Status</th>
                          <th className="px-5 py-2.5 text-left text-caption font-accent text-slate uppercase">Created By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rules.map((r) => (
                          <tr key={r._id} className="border-b border-hairline-soft last:border-b-0">
                            <td className="px-5 py-2.5 text-body text-ink">
                              {r.commissionType === "FLAT" ? "Flat (₹)" : "Percentage (%)"}
                            </td>
                            <td className="px-5 py-2.5 text-right text-body font-medium text-ink-deep">
                              {r.commissionType === "FLAT" ? "₹" : ""}{r.value}{r.commissionType === "PERCENTAGE" ? "%" : ""}
                            </td>
                            <td className="px-5 py-2.5 text-body text-slate">
                              {new Date(r.effectiveFrom).toLocaleDateString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric",
                              })}
                            </td>
                            <td className="px-5 py-2.5">
                              {r.active ? (
                                <span className="inline-flex h-5 items-center rounded-full bg-success px-2 text-caption font-medium text-canvas">Active</span>
                              ) : (
                                <span className="inline-flex h-5 items-center rounded-full bg-surface-soft px-2 text-caption font-medium text-slate border border-hairline-soft">Inactive</span>
                              )}
                            </td>
                            <td className="px-5 py-2.5 text-caption text-slate">
                              {r.createdBy?.name || "System"} · {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
