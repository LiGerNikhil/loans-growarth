import type { Metadata } from "next";
import Link from "next/link";
import LeadForm from "@/components/public/LeadForm";
import { Check, ArrowRight, CreditCard, RefreshCw, PiggyBank, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Overdraft Facility — Flexible Credit Line | Growarth Capita",
  description:
    "Get an overdraft facility from Growarth Capita. Pay interest only on what you use. Sanction limits up to ₹25 Lakhs, instant access, revolving credit line.",
  keywords: ["overdraft facility", "overdraft loan India", "credit line", "working capital", "best loan agency", "Growarth Capita", "instant credit"],
  openGraph: { title: "Overdraft Facility — Flexible Credit Line | Growarth Capita", description: "Overdraft facility with flexible credit. Pay interest only on what you use. Apply in minutes." },
  alternates: { canonical: "/overdraft-facility" },
};

const FEATURES = [
  { icon: PiggyBank, title: "Pay for What You Use", desc: "Interest is charged only on the amount you draw, not the entire sanctioned limit." },
  { icon: RefreshCw, title: "Revolving Credit Line", desc: "Withdraw, repay, and withdraw again — the limit replenishes automatically as you repay." },
  { icon: Zap, title: "Instant Access", desc: "Once sanctioned, funds are available immediately with no repeated documentation." },
  { icon: CreditCard, title: "Flexible Limits", desc: "Sanction limits from ₹50,000 to ₹25 Lakhs based on your credit profile and relationship." },
];

const DETAILS = [
  { label: "Sanction Limit", value: "₹50,000 – ₹25,00,000" },
  { label: "Interest Rate", value: "Starting from 11% p.a." },
  { label: "Interest Type", value: "On utilised amount only" },
  { label: "Processing Fee", value: "Up to 1.5% of limit" },
  { label: "Validity", value: "12 months (renewable)" },
];

const ELIGIBILITY = [
  "Existing salary or savings account holder",
  "Minimum 6 months of banking relationship",
  "Regular monthly credit of ₹25,000+",
  "Good credit history (CIBIL 700+)",
  "Business owners with 2+ year vintage",
];

const DOCUMENTS = [
  "KYC documents (Aadhaar, PAN, Passport)",
  "Last 6 months' bank statement",
  "Last 3 months' salary slip (salaried)",
  "ITR for last 2 years (self-employed)",
  "Business proof (if self-employed)",
];

const FAQS = [
  { q: "How is overdraft different from a personal loan?", a: "An overdraft is a revolving facility — you pay interest only on what you use and the limit replenishes as you repay. A personal loan gives you a one-time lump sum with fixed EMIs." },
  { q: "Can I increase my overdraft limit?", a: "Yes, after 6 months of regular usage and timely repayments, you can request a limit enhancement." },
  { q: "Is there a fixed repayment schedule?", a: "No, you can deposit any amount at any time. There's no fixed EMI — only interest on the outstanding amount." },
  { q: "What happens if I don't use the facility?", a: "If you don't draw any amount, no interest is charged. Some lenders may levy a minimal non-utilisation charge after a period." },
];

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  name: "Overdraft Facility",
  description: "Revolving credit line with limits up to ₹25 Lakhs. Pay interest only on the amount used. Flexible access and repayment.",
  provider: { "@type": "Organization", name: "Growarth Capita Consultants LLP" },
  annualPercentageRate: "11% p.a.",
  feesAndCommissionsSpecification: "Up to 1.5% processing fee",
};

export default function OverdraftPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      {/* ══════ HERO ══════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-canvas via-primary-soft/30 to-canvas">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:items-center lg:gap-16 lg:py-hero">
          <div className="flex flex-1 flex-col gap-6">
            <span className="text-overline text-primary tracking-[0.12em] uppercase">Overdraft Facility</span>
            <h1 className="text-[clamp(1.75rem,4.5vw,3.25rem)] font-display text-ink-deep leading-[1.08] tracking-[-0.02em]">
              Flexible Credit When You Need It
            </h1>
            <p className="text-[clamp(0.875rem,1.1vw,1rem)] text-slate/80 leading-relaxed">
              An overdraft facility gives you instant access to funds up to your sanctioned limit. Pay interest only on what you use — ideal for managing cash flow gaps and unexpected expenses.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="#lead-form"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink-deep px-7 text-button-large text-ink-button transition-all active:bg-ink-deep/90"
              >
                Apply Now <ArrowRight className="size-4" />
              </Link>
              <Link
                href="#details"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-hairline px-7 text-button-large text-ink transition-all active:bg-surface-soft"
              >
                See Details
              </Link>
            </div>
          </div>
          <div id="lead-form" className="w-full shrink-0 lg:w-[420px]">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* ══════ FEATURES ══════ */}
      <section className="border-y border-hairline-soft bg-surface-soft">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
          <h2 className="text-[clamp(1.35rem,2.5vw,2rem)] font-heading text-ink-deep mb-3 text-center">Why Choose Our Overdraft Facility?</h2>
          <p className="text-[clamp(0.85rem,1.1vw,1rem)] text-slate/80 mb-10 text-center leading-relaxed">
            The smart way to manage short-term liquidity without taking on a term loan.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl bg-canvas p-5 shadow-elevation-xs sm:p-6">
                <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 className="text-heading-5 font-heading text-ink-deep mb-1.5">{f.title}</h3>
                <p className="text-body text-slate leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ DETAILS + ELIGIBILITY ══════ */}
      <section id="details" className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-5">Facility Details</h2>
            <div className="rounded-xl border border-hairline-soft bg-canvas divide-y divide-hairline-soft">
              {DETAILS.map((d) => (
                <div key={d.label} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-body text-slate">{d.label}</span>
                  <span className="text-body font-accent text-ink text-right">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-5">Eligibility Criteria</h2>
            <ul className="flex flex-col gap-3">
              {ELIGIBILITY.map((e) => (
                <li key={e} className="flex items-start gap-3 text-body text-ink">
                  <Check className="mt-0.5 size-4 text-success shrink-0" />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ══════ DOCUMENTS ══════ */}
      <section className="border-y border-hairline-soft bg-surface-soft">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
          <h2 className="text-[clamp(1.35rem,2.5vw,2rem)] font-heading text-ink-deep mb-3 text-center">Documents Required</h2>
          <p className="text-[clamp(0.85rem,1.1vw,1rem)] text-slate/80 mb-10 text-center leading-relaxed">
            Simple documentation for quick approval.
          </p>
          <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
            {DOCUMENTS.map((d) => (
              <div key={d} className="flex items-center gap-3 rounded-lg bg-canvas px-5 py-3.5 shadow-elevation-xs">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/10">
                  <Check className="size-3.5 text-success" />
                </span>
                <span className="text-body text-ink">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ FAQ ══════ */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
        <h2 className="text-[clamp(1.35rem,2.5vw,2rem)] font-heading text-ink-deep mb-3 text-center">Frequently Asked Questions</h2>
        <p className="text-[clamp(0.85rem,1.1vw,1rem)] text-slate/80 mb-10 text-center leading-relaxed">
          Common questions about our Overdraft Facility.
        </p>
        <div className="mx-auto max-w-3xl divide-y divide-hairline-soft">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between text-body font-accent text-ink list-none">
                {faq.q}
                <ArrowRight className="size-4 text-slate rotate-90 group-open:rotate-180 transition-transform shrink-0" />
              </summary>
              <p className="text-body text-slate mt-2 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section className="mx-auto max-w-7xl px-6 pb-12 lg:pb-section">
        <div className="rounded-xxl bg-gradient-to-br from-primary-soft to-primary-soft/60 p-8 text-center sm:p-12">
          <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-2">
            Get Your Overdraft Facility Today
          </h2>
          <p className="text-body-large text-slate/80 mb-6 leading-relaxed">
            Flexible credit at your fingertips. Apply in minutes.
          </p>
          <Link
            href="#lead-form"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink-deep px-7 text-button-large text-ink-button transition-all active:bg-ink-deep/90"
          >
            Apply Now <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
