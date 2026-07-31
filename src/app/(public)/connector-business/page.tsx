import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search, Share2, FileText, Banknote, Users, Percent, Zap, Phone, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Connector Business — Earn Commissions | Growarth Capita Consultants LLP",
  description: "Join Growarth Capita's connector business network. Refer loan leads, earn commissions on every disbursal. Zero investment, simple process, transparent payouts. Best loan DSA partner India.",
  keywords: ["connector business", "loan connector", "DSA partner", "loan distribution partner", "earn commissions referring loans", "Growarth Capita connector", "best loan agency partnership"],
  openGraph: { title: "Connector Business — Earn Commissions Referring Loan Leads", description: "Join our connector network. Refer leads, earn commissions. Zero investment required." },
  alternates: { canonical: "/connector-business" },
};

const LOAN_TYPES = [
  "Personal Loan",
  "Business Loan",
  "Loan Against Property (LAP)",
  "Home Loan",
  "Overdraft / Working Capital",
];

const LEAD_FIELDS = [
  { icon: Users, label: "Name", desc: "Full name of the borrower" },
  { icon: Phone, label: "Mobile Number", desc: "Direct contact number" },
  { icon: Banknote, label: "Loan Requirement", desc: "Amount and loan type needed" },
  { icon: MapPin, label: "City", desc: "Borrower's location" },
];

const STEPS = [
  {
    icon: Search,
    title: "Connector finds a lead",
    desc: "Someone looking for a Personal Loan, Business Loan, Loan Against Property (LAP), Home Loan, or Overdraft / Working Capital.",
  },
  {
    icon: Share2,
    title: "Connector shares the lead",
    desc: "Just four details needed — Name, Mobile Number, Loan Requirement, and City.",
  },
  {
    icon: FileText,
    title: "DSA processes the case",
    desc: "We collect documents, check eligibility, and apply with suitable banks and NBFCs.",
  },
  {
    icon: Banknote,
    title: "Loan gets disbursed",
    desc: "Bank pays commission to DSA. DSA shares an agreed portion with the connector.",
  },
];

export default function ConnectorBusinessPage() {
  return (
    <>
      {/* ══════ HERO ══════ */}
      <section className="bg-gradient-to-br from-canvas via-primary-soft/30 to-canvas">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-hero">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-overline text-primary tracking-[0.12em]">Partner Programme</span>
            <h1 className="text-[clamp(1.75rem,4vw,3rem)] font-display text-ink-deep leading-[1.08] tracking-[-0.02em] mt-2 mb-4">
              Connector Business
            </h1>
            <p className="text-body-large text-slate/80 leading-relaxed">
              Earn commissions by referring loan leads to Growarth Capita. No paperwork, no follow-ups — just share the lead and we handle the rest.
            </p>
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section className="border-y border-hairline-soft bg-surface-soft/50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
          <div className="mb-10 text-center">
            <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-2">How the Connector Model Works</h2>
            <p className="text-body text-slate/80">A simple four-step process from lead to payout.</p>
          </div>
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2">
              {STEPS.map((s, i) => (
                <div key={s.title} className="relative rounded-xl bg-canvas p-6 shadow-elevation-xs ring-1 ring-hairline-soft">
                  <span className="absolute -top-2.5 -left-2.5 flex size-7 items-center justify-center rounded-full bg-primary text-caption font-accent text-on-primary">
                    {i + 1}
                  </span>
                  <span className="mb-3 mt-1 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <s.icon className="size-5" />
                  </span>
                  <h3 className="text-heading-5 font-heading text-ink-deep mb-1.5">{s.title}</h3>
                  <p className="text-body text-slate/80 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ LOAN TYPES / LEAD DETAILS ══════ */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-4">Loans You Can Refer</h2>
            <p className="text-body text-slate/80 leading-relaxed mb-5">
              Connectors can refer leads across our full product suite. If someone needs credit, we have a solution.
            </p>
            <div className="flex flex-col gap-2.5">
              {LOAN_TYPES.map((loan) => (
                <div key={loan} className="flex items-center gap-3 rounded-lg bg-surface-soft px-4 py-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success/10">
                    <span className="size-2 rounded-full bg-success" />
                  </span>
                  <span className="text-body text-ink">{loan}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-4">What You Share</h2>
            <p className="text-body text-slate/80 leading-relaxed mb-5">
              Only four basic details to register a lead. We take it from there.
            </p>
            <div className="flex flex-col gap-3">
              {LEAD_FIELDS.map((f) => (
                <div key={f.label} className="flex items-start gap-4 rounded-lg border border-hairline-soft bg-canvas p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-label font-accent text-ink-deep">{f.label}</p>
                    <p className="text-body-small text-slate/70">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ COMMISSION & BENEFITS ══════ */}
      <section className="border-y border-hairline-soft bg-surface-soft/50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-4">Commission Structure</h2>
              <p className="text-body text-slate/80 leading-relaxed mb-5">
                When a referred lead gets funded, the bank pays commission to Growarth Capita. We share a pre-agreed portion with you — no delays, no deductions.
              </p>
              <div className="rounded-xl bg-canvas p-5 shadow-elevation-xs ring-1 ring-hairline-soft">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-success/10 text-success">
                    <Percent className="size-4" />
                  </span>
                  <div>
                    <p className="text-label font-accent text-ink-deep">Transparent Payouts</p>
                    <p className="text-body-small text-slate/70">Agreed percentage of DSA commission shared on every successful disbursal.</p>
                  </div>
                </div>
                <ul className="flex flex-col gap-2 pt-2 border-t border-hairline-soft">
                  {["Commission rate agreed upfront — no surprises", "Payout within 15 days of loan disbursal", "Track every lead and commission in real time", "No minimum volume commitment required"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-body-small text-slate/80">
                      <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-4">Why Partner With Us</h2>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Zap, title: "Zero Processing Effort", desc: "You share the lead. We handle documentation, eligibility checks, and bank submissions." },
                  { icon: Users, title: "Dedicated Support", desc: "Get a personal relationship manager to track your leads and answer questions." },
                  { icon: Percent, title: "Competitive Commissions", desc: "Industry-leading payout structures with regular revisions based on performance." },
                  { icon: FileText, title: "Simple Onboarding", desc: "Register once, start referring immediately. No complex paperwork or agreements." },
                ].map((b) => (
                  <div key={b.title} className="flex items-start gap-3 rounded-lg bg-canvas p-4 shadow-elevation-xs ring-1 ring-hairline-soft">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <b.icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-label font-accent text-ink-deep">{b.title}</p>
                      <p className="text-body-small text-slate/70">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section className="bg-ink-deep">
        <div className="mx-auto max-w-7xl px-6 py-10 text-center">
          <h2 className="text-[clamp(1.1rem,2vw,1.5rem)] font-heading text-ink-button mb-1.5">Ready to Start Referring?</h2>
          <p className="text-body text-steel/70 mb-5">Join our connector network and earn commissions by referring loan leads. Zero investment, zero risk.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/connect/signup" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-6 text-button text-on-primary transition-all active:bg-primary-deep">
              Become a Connector <ArrowRight className="size-3.5" />
            </Link>
            <Link href="/#lead-form" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-steel/30 px-6 text-button text-ink-button transition-all active:bg-white/5">
              Submit a Lead
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
