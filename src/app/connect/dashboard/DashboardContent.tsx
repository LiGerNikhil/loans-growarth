"use client";

import { useEffect, useState, useCallback } from "react";
import { CardCheckoutSummary } from "@/components/ui/card-variants";
import { BadgeSuccess, BadgeAttention, BadgeCritical } from "@/components/ui/badge-variants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Copy, Share2, Loader2, ChevronDown, ChevronRight, LogOut, LayoutDashboard, Users, IndianRupee, Trophy, UserCircle, Plus, Send, BookOpen, CheckCircle, Link as LinkIcon, Smartphone, Globe, MessageCircle, DollarSign, TrendingUp, Target, Rocket, FileText, Landmark, Wallet, Lightbulb, Shield, AlertCircle, Info, ExternalLink, BarChart3, Zap, Award, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────

interface DashboardProps {
  name: string;
  connectorCode: string;
  email: string;
  referralLink: string;
}

interface LeadRow {
  _id: string;
  leadId: string;
  name: string;
  loanType: string;
  status: "Approved" | "In Progress" | "Not Progressed";
  dateReferred: string;
}

interface EarningsData {
  pendingTotal: number;
  approvedTotal: number;
  paidTotal: number;
  paidList: { amount: number; paidAt: string | null }[];
  runningTotal: number;
}

interface RankData {
  rank: number | null;
  totalRanked: number;
}

interface ProfileData {
  name: string;
  mobile: string;
  email: string;
  city: string;
  networkType: string;
  status: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifsc: string;
  } | null;
}

interface DashboardStats {
  totalLeads: number;
  leadsThisMonth: number;
  approvedLeads: number;
  conversionRate: number;
  totalCommission: number;
  rank: number | null;
  totalRanked: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, React.ReactNode> = {
  Approved: <BadgeSuccess>Approved</BadgeSuccess>,
  "In Progress": <BadgeAttention>In Progress</BadgeAttention>,
  "Not Progressed": <BadgeCritical>Not Progressed</BadgeCritical>,
};

function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);
}

function formatDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

// ─── Referral Link Card ──────────────────────────────────────────────

function ReferralLinkCard({ referralLink }: { referralLink: string; connectorCode: string }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    import("qrcode").then((qr) => {
      qr.toDataURL(referralLink, { width: 160, margin: 2 }, (err, url) => {
        if (!err) setQrDataUrl(url);
      });
    });
  }, [referralLink]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [referralLink]);

  const whatsAppLink = `https://wa.me/?text=${encodeURIComponent(
    `Get your loan through Growarth Capita! Use my referral link: ${referralLink}`
  )}`;

  return (
    <CardCheckoutSummary className="p-4 sm:p-5">
      <h3 className="text-body-small font-accent text-slate mb-1 uppercase tracking-wide">
        My Referral Link
      </h3>
      <p className="mb-4 break-all text-body text-ink-deep font-medium font-mono text-sm">
        {referralLink}
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="QR Code" className="mx-auto size-24 shrink-0 rounded-lg sm:mx-0" />
        ) : (
          <div className="mx-auto flex size-24 shrink-0 items-center justify-center rounded-lg bg-surface-soft sm:mx-0">
            <Loader2 className="size-5 animate-spin text-steel" />
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-1 sm:self-center">
          <button
            onClick={handleCopy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-hairline-soft bg-canvas px-4 text-body-small text-ink transition-colors hover:bg-surface-soft active:bg-surface-soft sm:h-9"
          >
            <Copy className="size-3.5" />
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-body-small text-white transition-opacity hover:opacity-90 sm:h-9"
          >
            <Share2 className="size-3.5" />
            Share on WhatsApp
          </a>
        </div>
      </div>
    </CardCheckoutSummary>
  );
}

// ─── Leads Table ─────────────────────────────────────────────────────

function LeadsTable() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ leads: LeadRow[] }>("/connect/api/leads")
      .then((d) => setLeads(d.leads))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CardCheckoutSummary className="overflow-hidden">
      <div className="p-4 pb-3 sm:p-5 sm:pb-3">
        <h3 className="text-body-small font-accent text-slate mb-1 uppercase tracking-wide">
          My Leads
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-5 animate-spin text-steel" />
        </div>
      ) : error ? (
        <p className="px-4 pb-4 text-body-small text-critical sm:px-5 sm:pb-5">{error}</p>
      ) : leads.length === 0 ? (
        <p className="px-4 pb-4 text-body text-slate sm:px-5 sm:pb-5">No leads referred yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-t border-hairline-soft">
                <th className="whitespace-nowrap px-4 py-2.5 text-left text-caption font-accent text-slate uppercase sm:px-5">Name</th>
                <th className="whitespace-nowrap px-4 py-2.5 text-left text-caption font-accent text-slate uppercase sm:px-5">Lead ID</th>
                <th className="whitespace-nowrap px-4 py-2.5 text-left text-caption font-accent text-slate uppercase sm:px-5">Loan Type</th>
                <th className="whitespace-nowrap px-4 py-2.5 text-left text-caption font-accent text-slate uppercase sm:px-5">Status</th>
                <th className="whitespace-nowrap px-4 py-2.5 text-left text-caption font-accent text-slate uppercase sm:px-5">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l._id} className="border-t border-hairline-soft">
                  <td className="whitespace-nowrap px-4 py-2.5 text-body-small text-ink font-medium sm:px-5">{l.name}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-body-small text-ink font-mono sm:px-5">{l.leadId}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-body-small text-ink sm:px-5">{l.loanType}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 sm:px-5">{STATUS_BADGE[l.status]}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-body-small text-slate sm:px-5">{formatDate(l.dateReferred)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </CardCheckoutSummary>
  );
}

// ─── Earnings Summary ─────────────────────────────────────────────────

function EarningsSummary() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<EarningsData>("/connect/api/earnings")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-4 font-heading text-ink-deep">My Earnings</h2>
        <p className="text-body text-slate">Track your commission at every stage</p>
      </div>

      {/* Payout Lifecycle Guide */}
      <CardCheckoutSummary className="p-5 border border-attention/20 bg-attention/5">
        <h3 className="text-body-small font-accent text-ink-deep mb-2 uppercase tracking-wide">How Payouts Work</h3>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-canvas p-3 border border-hairline-soft">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface-soft text-caption font-medium text-slate text-[11px]">1</span>
            <p className="text-body-small font-accent text-ink mt-1">Lead Submitted</p>
            <p className="text-caption text-slate mt-0.5">No commission yet</p>
          </div>
          <div className="rounded-lg bg-canvas p-3 border border-hairline-soft">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-attention/20 text-caption font-medium text-attention text-[11px]">2</span>
            <p className="text-body-small font-accent text-ink mt-1">Pending</p>
            <p className="text-caption text-slate mt-0.5">Approved, awaiting disbursement</p>
          </div>
          <div className="rounded-lg bg-canvas p-3 border border-hairline-soft">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-success/20 text-caption font-medium text-success text-[11px]">3</span>
            <p className="text-body-small font-accent text-ink mt-1">Approved</p>
            <p className="text-caption text-slate mt-0.5">Disbursed, queued for payout</p>
          </div>
          <div className="rounded-lg bg-canvas p-3 border border-hairline-soft">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-soft text-caption font-medium text-primary text-[11px]">4</span>
            <p className="text-body-small font-accent text-ink mt-1">Paid</p>
            <p className="text-caption text-slate mt-0.5">Credited to your bank</p>
          </div>
        </div>
      </CardCheckoutSummary>

      <CardCheckoutSummary className="p-4 sm:p-5">
        <h3 className="text-body-small font-accent text-slate mb-1 uppercase tracking-wide">
          Commission Summary
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-steel" />
          </div>
        ) : error ? (
          <p className="text-body-small text-critical">{error}</p>
        ) : data ? (
          <div className="mt-2 space-y-3">
            <EarningsRow label="Pending Commission" value={data.pendingTotal} className="text-attention" />
            <EarningsRow label="Approved Commission" value={data.approvedTotal} className="text-success" />
            <EarningsRow label="Paid Commission" value={data.paidTotal} className="text-ink-deep" />

            {data.paidList.length > 0 && (
              <details className="mt-1">
                <summary className="flex cursor-pointer items-center gap-1 text-caption text-slate hover:text-ink transition-colors">
                  <ChevronDown className="size-3" />
                  Payout History ({data.paidList.length})
                </summary>
                <div className="mt-2 space-y-1">
                  {data.paidList.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-caption text-slate">
                      <span>{formatDate(p.paidAt)}</span>
                      <span>{formatINR(p.amount)}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}

            <div className="border-t border-hairline-soft pt-3 mt-3 flex items-center justify-between">
              <span className="text-body font-medium text-ink-deep">Running Total</span>
              <span className="text-heading-5 font-heading text-ink-deep sm:text-heading-4">{formatINR(data.runningTotal)}</span>
            </div>
          </div>
        ) : <p className="text-body text-slate py-3">Unable to load earnings data.</p>}
      </CardCheckoutSummary>

      <CardCheckoutSummary className="p-5">
        <h3 className="text-body-small font-accent text-slate mb-1 uppercase tracking-wide">Commission Rates At a Glance</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border border-hairline-soft px-4 py-3">
            <span className="text-body text-ink">Personal Loan</span>
            <span className="text-body font-accent text-success">1-2% of disbursed amount</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-hairline-soft px-4 py-3">
            <span className="text-body text-ink">Business Loan</span>
            <span className="text-body font-accent text-success">1-2% of disbursed amount</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-hairline-soft px-4 py-3">
            <span className="text-body text-ink">Loan Against Property</span>
            <span className="text-body font-accent text-success">0.5-1% of disbursed amount</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-hairline-soft px-4 py-3">
            <span className="text-body text-ink">Home Loan</span>
            <span className="text-body font-accent text-success">0.5-1% of disbursed amount</span>
          </div>
        </div>
        <p className="text-caption text-slate mt-3">Commission is calculated on the final loan amount disbursed. Larger loans = higher commission even at lower rates. Exact rates are set by the admin per product.</p>
      </CardCheckoutSummary>
    </div>
  );
}

function EarningsRow({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-body text-ink">{label}</span>
      <span className={`text-body font-medium ${className}`}>{formatINR(value)}</span>
    </div>
  );
}

// ─── Rank ─────────────────────────────────────────────────────────────

function RankBadge() {
  const [data, setData] = useState<RankData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<RankData>("/connect/api/rank")
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const monthName = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <CardCheckoutSummary className="p-4 sm:p-5">
      <h3 className="text-body-small font-accent text-slate mb-1 uppercase tracking-wide">
        My Rank
      </h3>
      <p className="text-caption text-slate mb-3">{monthName}</p>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="size-5 animate-spin text-steel" />
        </div>
      ) : error ? (
        <p className="text-body-small text-critical">{error}</p>
      ) : data && data.rank !== null ? (
        <div className="flex items-baseline gap-1">
          <span className="font-heading text-heading-2 text-primary sm:text-heading-1">#{data.rank}</span>
          <span className="text-body text-slate">of {data.totalRanked}</span>
        </div>
      ) : (
        <p className="text-body text-slate">No ranking yet this month.</p>
      )}
    </CardCheckoutSummary>
  );
}

// ─── Dashboard Overview (Stats Cards) ────────────────────────────────

function DashboardOverview({ onNavigate }: { onNavigate?: (tab: TabKey) => void }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<DashboardStats>("/connect/api/stats")
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <CardCheckoutSummary className="p-5">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-5 animate-spin text-steel" />
        </div>
      </CardCheckoutSummary>
    );
  }

  if (error) {
    return (
      <CardCheckoutSummary className="p-5">
        <p className="text-body-small text-critical">{error}</p>
      </CardCheckoutSummary>
    );
  }

  if (!stats) return null;

  const monthName = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-4 font-heading text-ink-deep">Dashboard Overview</h2>
        <p className="text-body text-slate">{monthName}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardCheckoutSummary className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft">
              <Users className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-caption text-slate uppercase tracking-wide">Total Leads</p>
              <p className="text-heading-4 font-heading text-ink-deep">{stats.totalLeads}</p>
            </div>
          </div>
          <p className="mt-2 text-caption text-slate">
            {stats.leadsThisMonth} this month
          </p>
        </CardCheckoutSummary>

        <CardCheckoutSummary className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle className="size-5 text-success" />
            </div>
            <div>
              <p className="text-caption text-slate uppercase tracking-wide">Approved</p>
              <p className="text-heading-4 font-heading text-ink-deep">{stats.approvedLeads}</p>
            </div>
          </div>
          <p className="mt-2 text-caption text-slate">
            {stats.conversionRate}% conversion rate
          </p>
        </CardCheckoutSummary>

        <CardCheckoutSummary className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-attention/10">
              <DollarSign className="size-5 text-attention" />
            </div>
            <div>
              <p className="text-caption text-slate uppercase tracking-wide">Total Commission</p>
              <p className="text-heading-4 font-heading text-ink-deep">{formatINR(stats.totalCommission)}</p>
            </div>
          </div>
          <p className="mt-2 text-caption text-slate">Lifetime earnings</p>
        </CardCheckoutSummary>

        <CardCheckoutSummary className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft">
              <TrendingUp className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-caption text-slate uppercase tracking-wide">Your Rank</p>
              <p className="text-heading-4 font-heading text-ink-deep">
                {stats.rank !== null ? `#${stats.rank}` : "—"}
              </p>
            </div>
          </div>
          <p className="mt-2 text-caption text-slate">
            {stats.totalRanked > 0 ? `of ${stats.totalRanked} connectors` : "No ranking yet"}
          </p>
        </CardCheckoutSummary>
      </div>

      {/* Loan Type Breakdown */}
      <CardCheckoutSummary className="p-5">
        <h3 className="text-body-small font-accent text-slate mb-1 uppercase tracking-wide">Quick Tips By Loan Type</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-lg border border-hairline-soft p-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft"><DollarSign className="size-4 text-primary" /></div>
            <div><p className="text-body-small font-accent text-ink-deep">Personal Loan</p><p className="text-caption text-slate mt-0.5">Fastest approval, widest audience</p></div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-hairline-soft p-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft"><BarChart3 className="size-4 text-primary" /></div>
            <div><p className="text-body-small font-accent text-ink-deep">Business Loan</p><p className="text-caption text-slate mt-0.5">Target local shopkeepers &amp; traders</p></div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-hairline-soft p-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft"><Home className="size-4 text-primary" /></div>
            <div><p className="text-body-small font-accent text-ink-deep">Loan Against Property</p><p className="text-caption text-slate mt-0.5">Highest commission per lead</p></div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-hairline-soft p-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft"><Home className="size-4 text-primary" /></div>
            <div><p className="text-body-small font-accent text-ink-deep">Home Loan</p><p className="text-caption text-slate mt-0.5">Partner with real estate agents</p></div>
          </div>
        </div>
      </CardCheckoutSummary>

      <CardCheckoutSummary className="p-5">
        <h3 className="text-body-small font-accent text-slate mb-1 uppercase tracking-wide">Quick Actions</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          <button onClick={() => onNavigate?.("submit")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-button-small text-on-primary transition-all active:bg-primary-deep">
            <Plus className="size-4" /> Submit New Lead
          </button>
          <button onClick={() => onNavigate?.("academy")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-hairline-soft px-4 text-body-small text-ink transition-colors hover:bg-surface-soft">
            <BookOpen className="size-4" /> Learning Center
          </button>
          <button onClick={() => onNavigate?.("earnings")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-hairline-soft px-4 text-body-small text-ink transition-colors hover:bg-surface-soft">
            <Wallet className="size-4" /> My Earnings
          </button>
        </div>
      </CardCheckoutSummary>
    </div>
  );
}

// ─── Lead Submission Form ────────────────────────────────────────────

const LOAN_TYPES = [
  "Personal Loan", "Business Loan", "Loan Against Property",
  "Overdraft Facility", "Home Loan", "Other",
] as const;

function LeadForm({ connectorCode, referralLink }: { connectorCode: string; referralLink: string }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [loanType, setLoanType] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; leadId?: string } | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setSubmitting(true);

    try {
      const res = await fetch("/connect/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, mobile, email: email || undefined, loanType,
          monthlySalary: monthlySalary ? Number(monthlySalary) : 0,
          loanAmount: loanAmount ? Number(loanAmount) : 0,
          city: city || undefined, notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ success: false, message: data.error || "Submission failed" });
      } else {
        setResult({ success: true, message: "Lead submitted successfully!", leadId: data.leadId });
        setName(""); setMobile(""); setEmail(""); setLoanType(""); setMonthlySalary(""); setLoanAmount(""); setCity(""); setNotes("");
      }
    } catch {
      setResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }, [name, mobile, email, loanType, city, notes]);

  const inputClasses = "h-11 w-full rounded-xl border border-hairline bg-canvas px-3.5 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20";
  const labelClasses = "text-label text-ink";
  const selectClasses = "h-11 w-full rounded-xl border border-hairline bg-canvas px-3.5 text-body text-ink outline-none appearance-none cursor-pointer transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-4 font-heading text-ink-deep">Submit a Lead</h2>
        <p className="text-body text-slate">Refer a potential customer directly from your dashboard</p>
      </div>

      {result && (
        <div className={`rounded-xl px-4 py-3 ${result.success ? "bg-success/10 text-success" : "bg-critical/10 text-critical-strong"}`}>
          <p className="text-body-small flex items-center gap-2">
            {result.success ? <CheckCircle className="size-4" /> : null}
            {result.message}
            {result.leadId ? <span className="font-mono text-caption opacity-80">({result.leadId})</span> : null}
          </p>
        </div>
      )}

      <CardCheckoutSummary className="p-5">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lf-name" className={labelClasses}>Full Name *</label>
              <input id="lf-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder="e.g. Rajesh Sharma" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lf-mobile" className={labelClasses}>Mobile Number *</label>
              <input id="lf-mobile" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} className={inputClasses} placeholder="e.g. 9876543210" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lf-email" className={labelClasses}>Email</label>
              <input id="lf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} placeholder="rajesh@example.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lf-loan" className={labelClasses}>Loan Type *</label>
              <div className="relative">
                <select id="lf-loan" value={loanType} onChange={(e) => setLoanType(e.target.value)} className={selectClasses} required>
                  <option value="">Select loan type</option>
                  {LOAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-steel" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lf-salary" className={labelClasses}>Monthly Salary (₹)</label>
              <input id="lf-salary" type="number" value={monthlySalary} onChange={(e) => setMonthlySalary(e.target.value.replace(/\D/g, ""))} className={inputClasses} placeholder="e.g. 50000" min="0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lf-amount" className={labelClasses}>Loan Amount (₹)</label>
              <input id="lf-amount" type="number" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value.replace(/\D/g, ""))} className={inputClasses} placeholder="e.g. 500000" min="0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lf-city" className={labelClasses}>City / Area</label>
              <input id="lf-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClasses} placeholder="e.g. Noida" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lf-notes" className={labelClasses}>Notes</label>
            <textarea id="lf-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={`${inputClasses} h-auto min-h-[80px] resize-y py-2.5`} placeholder="Any additional details about the lead..." />
          </div>
          <button type="submit" disabled={submitting} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-button-large text-on-primary transition-all active:bg-primary-deep disabled:opacity-50 sm:w-auto">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {submitting ? "Submitting..." : "Submit Lead"}
          </button>
        </form>
      </CardCheckoutSummary>

      <CardCheckoutSummary className="p-5">
        <h3 className="text-body-small font-accent text-slate mb-1 uppercase tracking-wide">Your Referral Link</h3>
        <p className="mt-1 mb-3 break-all text-body text-ink-deep font-medium font-mono text-sm">{referralLink}</p>
        <p className="text-body-small text-slate">Share this link with your network. When someone applies for a loan using your link, they&apos;ll be automatically attributed to you.</p>
      </CardCheckoutSummary>
    </div>
  );
}

// ─── Academy (Learning Center) ───────────────────────────────────────

interface ModuleSection {
  title: string;
  body: string;
}

interface ModuleLesson {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sections: ModuleSection[];
}

const academyModules: ModuleLesson[] = [
  {
    icon: Rocket,
    title: "Getting Started — Your Role as a Connector",
    sections: [
      {
        title: "What is a Connector?",
        body: "As a Growarth Capita Connector, you are our partner in finding credit-worthy customers. You refer people who need loans — salaried employees, business owners, property owners — and earn a commission when their loan gets approved and disbursed. Think of yourself as a bridge between customers and the best loan options available.",
      },
      {
        title: "How the Referral Process Works",
        body: "1. You share your unique referral link or submit a lead directly through your dashboard.\n2. We receive the lead and verify the customer's eligibility.\n3. Our team processes the application and connects the customer with the best-suited bank or NBFC.\n4. When the loan is approved and disbursed, you earn a commission.\n5. You track every stage — from lead submission to commission payout — in real time on your dashboard.",
      },
      {
        title: "Your Dashboard Tour",
        body: "Dashboard — Your stats at a glance: total leads, approvals, commission earned, and rank.\nSubmit Lead — Enter a customer's details directly if they don't want to use the link.\nMy Leads — Track every lead you've referred and its current status.\nMy Earnings — See your pending, approved, and paid commissions with full history.\nMy Rank — Your monthly leaderboard position among all connectors.\nAcademy — You are here! Learn everything about our products, partners, and payouts.\nProfile & Payouts — Manage your personal details and bank account for payouts.",
      },
    ],
  },
  {
    icon: FileText,
    title: "Loan Products — What We Offer",
    sections: [
      {
        title: "Personal Loan",
        body: "Amount: ₹50,000 – ₹25,00,000\nInterest: Starting from 10.49% p.a.\nTenure: 12 – 72 months\nEligibility: Salaried (min ₹15,000/month) or Self-employed (min ₹2L ITR)\nDocuments: Aadhaar, PAN, bank statements, salary slips / ITR\nBest for: Medical expenses, wedding, travel, debt consolidation, home renovation. Our rates beat most banks, making this our most referred product.",
      },
      {
        title: "Business Loan",
        body: "Amount: ₹1,00,000 – ₹50,00,000\nInterest: Starting from 12% p.a.\nTenure: 12 – 60 months\nEligibility: Business vintage 1+ year, min ₹3L annual turnover\nDocuments: Aadhaar, PAN, GST returns, bank statements, ITR\nBest for: Working capital, inventory purchase, expansion, equipment. We work with NBFCs that approve faster than traditional banks.",
      },
      {
        title: "Loan Against Property (LAP)",
        body: "Amount: ₹5,00,000 – ₹5,00,00,000\nInterest: Starting from 9% p.a.\nTenure: up to 180 months\nEligibility: Own a residential or commercial property with clear title\nDocuments: Property papers, Aadhaar, PAN, ITR, bank statements\nBest for: Large funding needs — business expansion, higher education, medical emergencies. Higher commissions for you due to larger loan sizes.",
      },
      {
        title: "Home Loan",
        body: "Amount: ₹5,00,000 – ₹10,00,00,000\nInterest: Starting from 8.50% p.a.\nTenure: up to 360 months\nEligibility: Salaried or self-employed with stable income\nDocuments: Property papers, Aadhaar, PAN, salary slips / ITR, bank statements\nBest for: Purchase, construction, or renovation of home. Long tenure means high customer satisfaction and repeat referrals.",
      },
      {
        title: "Overdraft Facility",
        body: "Amount: ₹1,00,000 – ₹25,00,000\nInterest: Only on the amount used (not the full limit)\nTenure: Renewable annually\nEligibility: Salaried or business with good bank statement history\nDocuments: Aadhaar, PAN, bank statements (6-12 months)\nBest for: Customers who need flexible credit — pay interest only on what they use. Great for businessmen with fluctuating cash flow.",
      },
    ],
  },
  {
    icon: Landmark,
    title: "Partner Banks & NBFCs — How the Network Works",
    sections: [
      {
        title: "Our Partner Network",
        body: "Growarth Capita has tie-ups with 15+ leading banks and NBFCs across India. This includes major private banks, public sector banks, and non-banking financial companies. Each partner has their own strengths — some approve faster, some offer lower rates, some specialize in certain loan types. Our underwriting team matches each customer to the best partner based on their profile, ensuring the highest approval chances.",
      },
      {
        title: "How Banks & NBFCs Differ",
        body: "• Banks (e.g., HDFC, ICICI, SBI) — More stringent eligibility, lower interest rates, larger loan amounts. Best for customers with strong credit scores (750+) and stable income.\n\n• NBFCs (e.g., Bajaj Finserv, Tata Capital, L&T Finance) — Faster approval, more flexible eligibility, slightly higher rates. Best for self-employed customers or those with moderate credit scores.\n\nOur team handles the end-to-end process with the partner, so you don't need to know which bank is right — just refer the lead and we take it from there.",
      },
      {
        title: "Why Our Partners Choose Us",
        body: "Banks and NBFCs partner with Growarth Capita because we bring them pre-vetted, high-quality leads. Our connectors are local trusted individuals who understand their community. This reduces the bank's acquisition cost and default risk. The better the quality of leads you submit, the more our partners value us — and the better commission rates we can offer you.",
      },
      {
        title: "Bank Payout vs Your Commission",
        body: "When a loan is approved, the bank/NBFC pays us a referral fee (this is their customer acquisition cost). From that fee, we pay you your commission. The bank's payout to us is higher for larger loans and certain products. Your commission is a fixed percentage of the loan amount disbursed, regardless of what the bank pays us. This means you always earn a predictable, transparent commission.",
      },
    ],
  },
  {
    icon: Wallet,
    title: "Commission & Payout System",
    sections: [
      {
        title: "How Commissions Are Calculated",
        body: "Your commission is calculated as a percentage of the loan amount disbursed to the customer. The rate depends on the loan type and is set by the admin. For example:\n• Personal Loan: ~1-2% of disbursed amount\n• Business Loan: ~1-2% of disbursed amount\n• Loan Against Property: ~0.5-1% of disbursed amount\n• Home Loan: ~0.5-1% of disbursed amount\n\nA ₹5 Lakh personal loan at 2% commission = ₹10,000 earned by you. The larger the loan, the higher your commission — even at lower percentage rates.",
      },
      {
        title: "Commission Lifecycle — From Lead to Payout",
        body: "STAGE 1: Lead Submitted — No commission yet. Status: In Progress.\nSTAGE 2: Loan Approved — Commission is recorded but not yet payable. Status: Pending.\nSTAGE 3: Loan Disbursed — Commission is confirmed and approved. Status: Approved.\nSTAGE 4: Payout Processed — We transfer your commission to your bank account. Status: Paid.\n\nThe entire lifecycle is visible on your My Earnings tab. You can track exactly where each payout stands.",
      },
      {
        title: "How to Track Your Earnings",
        body: "Go to the My Earnings tab.\n• Pending Commission — Loans approved but awaiting disbursement confirmation.\n• Approved Commission — Loans disbursed; payment will be processed on the next payout cycle.\n• Paid Commission — Amounts already credited to your bank account.\n• Running Total — Your all-time earnings from the program.\n• Click the Payout History dropdown to see individual payment dates and amounts.",
      },
      {
        title: "Why Growarth Capita Pays Better Than Competitors",
        body: "Most competitor platforms cap their connector commissions or reduce rates after a threshold. At Growarth Capita:\n• No cap on how much you can earn — more approvals = more commission, always.\n• Commission rates are competitive with the industry (1-2% vs 0.5-1% at many others).\n• Faster payout cycles — we process payouts monthly, not quarterly.\n• Higher conversion rates because our underwriting team actively works each lead rather than just forwarding it.\n• Rank bonuses — top connectors each month earn additional rewards and recognition.",
      },
    ],
  },
  {
    icon: Lightbulb,
    title: "Pro Tips for Maximum Earnings",
    sections: [
      {
        title: "Build a Lead Pipeline",
        body: "Top connectors don't wait for leads — they build a pipeline. Aim to submit at least 5-10 leads per week. Even if only 20-30% convert, a steady flow ensures consistent commission income. Keep a spreadsheet or use the dashboard to track your leads and follow up regularly.",
      },
      {
        title: "Target the Right Audience by Loan Type",
        body: "• Personal Loan — Salaried employees in offices, corporate parks, and industrial areas. People needing money for weddings, medical emergencies, or travel.\n• Business Loan — Local shopkeepers, manufacturers, traders, and small business owners. Visit markets and commercial areas.\n• Loan Against Property — Property owners who need large funds. Real estate agents and property dealers are excellent sources.\n• Home Loan — Young couples, families looking to buy a home, people planning construction. Connect with real estate agents and builders.\n\nMatch the right product to the right person — your conversion rate will double.",
      },
      {
        title: "Use Your Local Network",
        body: "You already know people who need loans — friends, family, neighbors, colleagues, local business owners. Start with your immediate network and ask them to refer others. A personal recommendation from a trusted source converts 3x more than a cold lead. Create WhatsApp broadcast lists and share your referral link weekly with useful loan information.",
      },
      {
        title: "Partner with Local Businesses",
        body: "Visit these businesses and offer to partner:\n• Real estate agents — They meet buyers who need home loans every day.\n• CA & tax consultants — Their clients often need business loans or LAP.\n• Insurance agents — They have a large customer base with financial needs.\n• Local shopkeepers — They know everyone in the neighborhood.\n• Auto dealers — Car buyers often need auto or personal loans.\nLeave your referral card and explain the commission structure.",
      },
      {
        title: "Seasonal Opportunities",
        body: "Lead demand varies throughout the year. Capitalize on these peak seasons:\n• April-June: Education loans for admissions, travel loans for vacations.\n• October-December: Wedding season — huge demand for personal loans.\n• March: Business loans for working capital before the new financial year.\n• Festival seasons (Diwali, Onam, Durga Puja): Consumer durable loans, personal loans for shopping and celebrations.\nPlan your outreach around these events for maximum conversions.",
      },
      {
        title: "Follow Up Systematically",
        body: "Not every lead converts immediately. Build a follow-up system:\n• Day 1: Submit the lead and message the customer.\n• Day 3: Check if they were contacted by our team.\n• Week 1: Follow up on document submission.\n• Week 2-3: Check on approval status.\n• After approval: Congratulate them — happy customers give repeat business and referrals.\nUse the My Leads tab to track where each lead stands.",
      },
    ],
  },
  {
    icon: Shield,
    title: "Compliance & Best Practices",
    sections: [
      {
        title: "Customer Consent is Mandatory",
        body: "Always get explicit verbal or written consent before submitting someone's details. Never submit a lead without the customer's knowledge — it damages our reputation and can lead to legal issues. When using the direct submission form, confirm that the customer has agreed to be contacted.",
      },
      {
        title: "KYC Requirements",
        body: "For a loan application to proceed, the customer needs:\n• Aadhaar Card (mandatory for all products)\n• PAN Card (mandatory for loans above ₹50,000)\n• Latest bank statements (3-6 months depending on product)\n• Salary slips (for salaried) or IT returns (for self-employed)\n• Property documents (for LAP and Home Loan)\n\nInform customers to keep these documents ready for faster processing.",
      },
      {
        title: "Data Privacy Rules",
        body: "Customer data is confidential. Never share a customer's personal information with anyone outside Growarth Capita. Do not store customer data on your personal phone or computer beyond what is needed for follow-ups. All data submitted through the dashboard is encrypted and stored securely.",
      },
      {
        title: "Avoid These Mistakes",
        body: "• Do NOT submit fake or duplicate leads — it wastes our team's time and may lead to account suspension.\n• Do NOT misrepresent loan terms to customers — let our team explain the exact rates and conditions.\n• Do NOT charge customers any fee — connectors are never allowed to charge customers. We pay you commission.\n• Do NOT harass customers for documents or decisions — our team handles all communication professionally.\n• Do NOT promise loan approval — approval depends on the bank's underwriting, which we cannot guarantee.",
      },
    ],
  },
];

function Academy() {
  const [openModule, setOpenModule] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading-4 font-heading text-ink-deep">Learning Center</h2>
          <p className="text-body text-slate">Master everything about being a top-performing connector</p>
        </div>
        <span className="hidden sm:inline-flex h-6 items-center rounded-full bg-primary-soft px-2.5 text-caption font-medium text-primary">
          {academyModules.length} Modules
        </span>
      </div>

      {/* Progress Overview */}
      <CardCheckoutSummary className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft">
              <Award className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-body font-accent text-ink-deep">Your Learning Journey</p>
              <p className="text-caption text-slate">Complete all modules to become a Growarth Capita expert</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-caption text-slate">
            <CheckCircle className="size-3.5 text-success" />
            Read each module at your own pace
          </div>
        </div>
      </CardCheckoutSummary>

      {/* Modules */}
      <div className="space-y-4">
        {academyModules.map((mod, idx) => {
          const Icon = mod.icon;
          const isOpen = openModule === idx;

          return (
            <CardCheckoutSummary key={idx} className="overflow-hidden">
              <button
                onClick={() => setOpenModule(isOpen ? null : idx)}
                className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-surface-soft/50"
              >
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${isOpen ? "bg-primary text-on-primary" : "bg-primary-soft text-primary"}`}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body font-accent text-ink-deep">Module {idx + 1}</p>
                  <p className="text-body-small text-slate mt-0.5">{mod.title}</p>
                </div>
                <ChevronDown className={`size-5 shrink-0 text-steel transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              {isOpen && (
                <div className="border-t border-hairline-soft px-5 pb-5 pt-4 space-y-4">
                  {mod.sections.map((sec, si) => (
                    <details key={si} className="group rounded-lg border border-hairline-soft open:bg-surface-soft/30">
                      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-body-small font-accent text-ink-deep transition-colors group-open:border-b group-open:border-hairline-soft">
                        <ChevronRight className="size-3.5 shrink-0 text-steel transition-transform group-open:rotate-90" />
                        {sec.title}
                      </summary>
                      <div className="px-4 py-3">
                        <p className="text-body text-slate whitespace-pre-line">{sec.body}</p>
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </CardCheckoutSummary>
          );
        })}
      </div>

      {/* Quick Summary */}
      <CardCheckoutSummary className="border border-attention/20 bg-attention/5 p-5">
        <div className="flex items-start gap-3">
          <Award className="size-5 shrink-0 text-attention mt-0.5" />
          <div>
            <h3 className="text-body font-accent text-ink-deep">Your Success = Our Success</h3>
            <p className="text-body-small text-slate mt-1">
              Every lead you submit helps someone get the funding they need, and every approval
              earns you commission. The more you learn about our products and process, the better
              you can identify opportunities and guide customers. Top connectors who complete all
              modules earn 3x more than the average — because knowledge translates to quality leads.
              <br /><br />
              Ready to start? Go to the <strong>Submit Lead</strong> tab or share your referral link
              from the <strong>Dashboard</strong> tab. Our team is always here to support you!
            </p>
          </div>
        </div>
      </CardCheckoutSummary>
    </div>
  );
}

// ─── Profile Form ─────────────────────────────────────────────────────

const NETWORK_TYPES = [
  "Shopkeeper",
  "Insurance Agent",
  "CA/Accountant",
  "Real Estate Broker",
  "Individual",
  "Other",
] as const;

function ProfileForm({ name: initialName, email: initialEmail }: { name: string; email: string }) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    apiFetch<ProfileData>("/connect/api/profile")
      .then(setProfile)
      .catch((e) => setMessage({ type: "error", text: e.message }))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {};

    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const city = form.get("city") as string;
    const networkType = form.get("networkType") as string;
    const bankAccountHolderName = form.get("bankAccountHolderName") as string;
    const bankAccountNumber = form.get("bankAccountNumber") as string;
    const bankIfsc = form.get("bankIfsc") as string;

    if (name?.trim()) body.name = name.trim();
    if (email?.trim()) body.email = email.trim();
    if (city?.trim()) body.city = city.trim();
    if (networkType) body.networkType = networkType;

    if (bankAccountHolderName || bankAccountNumber || bankIfsc) {
      body.bankDetails = {
        accountHolderName: bankAccountHolderName,
        accountNumber: bankAccountNumber,
        ifsc: bankIfsc,
      };
    }

    try {
      await apiFetch("/connect/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setMessage({ type: "success", text: "Profile updated successfully." });
      const updated = await apiFetch<ProfileData>("/connect/api/profile");
      setProfile(updated);
    } catch (e: unknown) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Update failed" });
    } finally {
      setSaving(false);
    }
  }, []);

  if (loading) {
    return (
      <CardCheckoutSummary className="p-4 sm:p-5">
        <h3 className="text-body-small font-accent text-slate mb-1 uppercase tracking-wide">
          Profile &amp; Payout Details
        </h3>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="size-5 animate-spin text-steel" />
        </div>
      </CardCheckoutSummary>
    );
  }

  return (
    <CardCheckoutSummary className="p-4 sm:p-5">
      <h3 className="text-body-small font-accent text-slate mb-1 uppercase tracking-wide">
        Profile &amp; Payout Details
      </h3>

      {message && (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-body-small ${
            message.type === "success"
              ? "bg-success/10 text-success"
              : "bg-critical/10 text-critical-strong"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="p-name">Full Name</Label>
            <Input key={`name-${profile?.name ?? initialName}`} id="p-name" name="name" type="text" defaultValue={profile?.name ?? initialName} />
          </div>
          <div>
            <Label htmlFor="p-email">Email</Label>
            <Input key={`email-${profile?.email ?? initialEmail}`} id="p-email" name="email" type="email" defaultValue={profile?.email ?? initialEmail} />
          </div>
          <div>
            <Label htmlFor="p-mobile">Mobile Number</Label>
            <div className="flex items-center gap-2">
              <Input id="p-mobile" type="tel" value={profile?.mobile ?? ""} disabled className="opacity-60" />
              <span className="shrink-0 text-caption text-attention">OTP required to change</span>
            </div>
          </div>
          <div>
            <Label htmlFor="p-city">City / Area</Label>
            <Input key={`city-${profile?.city ?? ""}`} id="p-city" name="city" type="text" defaultValue={profile?.city ?? ""} placeholder="e.g. Noida" />
          </div>
          <div>
            <Label htmlFor="p-networkType">Network Type</Label>
            <div className="relative">
              <select
                key={`nt-${profile?.networkType ?? ""}`}
                id="p-networkType"
                name="networkType"
                defaultValue={profile?.networkType ?? ""}
                className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 pr-8 text-base outline-none appearance-none cursor-pointer transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              >
                <option value="" disabled>Select</option>
                {NETWORK_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-steel" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-hairline-soft bg-canvas p-4 space-y-3">
          <p className="text-body-small font-accent text-ink">Bank Account Details</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="p-bank-holder">Account Holder Name</Label>
              <Input key={`bank-holder-${profile?.bankDetails?.accountHolderName ?? ""}`} id="p-bank-holder" name="bankAccountHolderName" type="text" defaultValue={profile?.bankDetails?.accountHolderName ?? ""} placeholder="e.g. Rajesh Sharma" />
            </div>
            <div>
              <Label htmlFor="p-bank-number">Account Number</Label>
              <Input key={`bank-number-${profile?.bankDetails?.accountNumber ?? ""}`} id="p-bank-number" name="bankAccountNumber" type="text" defaultValue={profile?.bankDetails?.accountNumber ?? ""} placeholder="12345678901" />
            </div>
            <div>
              <Label htmlFor="p-bank-ifsc">IFSC Code</Label>
              <Input key={`bank-ifsc-${profile?.bankDetails?.ifsc ?? ""}`} id="p-bank-ifsc" name="bankIfsc" type="text" defaultValue={profile?.bankDetails?.ifsc ?? ""} placeholder="SBIN0001234" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 w-full items-center justify-center rounded-full bg-primary px-6 text-button text-on-primary transition-all active:bg-primary-deep disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={async () => {
              try { await fetch("/connect/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
              window.location.href = "/connect/login";
            }}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-hairline-soft px-5 text-caption text-slate transition-colors hover:border-primary hover:text-primary"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </form>
    </CardCheckoutSummary>
  );
}

// ─── Sidebar Navigation ──────────────────────────────────────────────

const navItems = [
  { key: "overview", label: "Dashboard", icon: LayoutDashboard },
  { key: "submit", label: "Submit Lead", icon: Plus },
  { key: "leads", label: "My Leads", icon: Users },
  { key: "earnings", label: "My Earnings", icon: IndianRupee },
  { key: "rank", label: "My Rank", icon: Trophy },
  { key: "academy", label: "Academy", icon: BookOpen },
  { key: "profile", label: "Profile & Payouts", icon: UserCircle },
] as const;

type TabKey = (typeof navItems)[number]["key"];

function ConnectorSidebar({
  activeTab,
  onTabChange,
  connectorCode,
  onLogout,
}: {
  activeTab: TabKey;
  onTabChange: (k: TabKey) => void;
  connectorCode: string;
  onLogout: () => void;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-hairline-soft bg-canvas lg:w-56 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2 border-b border-hairline-soft px-4 py-3 lg:px-5 lg:py-4">
        <Image src="/images/icons/logo.png" alt="Growarth Capita" width={260} height={72} className="h-16 w-auto" />
        <div className="ml-auto min-w-0 flex-1 text-right">
          <p className="truncate font-mono text-caption text-steel">{connectorCode}</p>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-col lg:px-3 lg:py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-body transition-colors whitespace-nowrap lg:w-full",
                isActive
                  ? "bg-primary-soft text-primary font-accent"
                  : "text-slate hover:bg-primary-soft hover:text-primary",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
              <span className="inline text-caption lg:hidden">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-hairline-soft p-3 lg:block">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-body text-slate transition-colors hover:bg-critical/10 hover:text-critical"
        >
          <LogOut className="size-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────

export default function DashboardContent(props: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const handleLogout = useCallback(async () => {
    try { await fetch("/connect/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    window.location.href = "/connect/login";
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-surface-soft lg:flex-row">
      <ConnectorSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        connectorCode={props.connectorCode}
        onLogout={handleLogout}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Header */}
        <header className="border-b border-hairline-soft bg-canvas px-4 py-3 sm:px-6 sm:py-4">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-heading-5 font-heading text-ink-deep sm:text-heading-4">
                Welcome, {props.name.split(" ")[0]}
              </h1>
              <p className="truncate text-caption text-slate">{props.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-hairline-soft px-3 text-caption text-slate transition-colors hover:border-primary hover:text-primary lg:hidden"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6">
          {activeTab === "overview" && (
            <DashboardOverview onNavigate={setActiveTab} />
          )}

          {activeTab === "submit" && <LeadForm connectorCode={props.connectorCode} referralLink={props.referralLink} />}

          {activeTab === "leads" && <LeadsTable />}

          {activeTab === "earnings" && <EarningsSummary />}

          {activeTab === "rank" && <RankBadge />}

          {activeTab === "academy" && <Academy />}

          {activeTab === "profile" && <ProfileForm name={props.name} email={props.email} />}
        </main>

        <footer className="border-t border-hairline-soft px-4 py-3 text-center text-caption text-slate sm:px-6 sm:py-4">
          &copy; {new Date().getFullYear()} Growarth Capita Consultants LLP
        </footer>
      </div>
    </div>
  );
}
