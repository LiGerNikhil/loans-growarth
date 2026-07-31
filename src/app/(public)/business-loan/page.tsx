import type { Metadata } from "next";
import Link from "next/link";
import LeadForm from "@/components/public/LeadForm";
import { Check, ArrowRight, TrendingUp, Briefcase, BarChart3, Handshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Business Loan — Unsecured Funding Up to ₹50 Lakhs | Growarth Capita",
  description:
    "Growarth Capita offers unsecured business loans up to ₹50 Lakhs for working capital, expansion, and equipment. Fast approval, customised repayment, no collateral required.",
  keywords: ["business loan", "unsecured business loan", "business loan India", "working capital loan", "best loan agency", "Growarth Capita", "MSME loan"],
  openGraph: { title: "Business Loan — Unsecured Funding Up to ₹50 Lakhs | Growarth Capita", description: "Unsecured business loan up to ₹50 Lakhs. Fast approval, no collateral, customised repayment." },
  alternates: { canonical: "/business-loan" },
};

const FEATURES = [
  { icon: TrendingUp, title: "High Funding", desc: "Unsecured loans from ₹1 Lakh up to ₹50 Lakhs for working capital, expansion, or equipment." },
  { icon: Briefcase, title: "Customised Solutions", desc: "Repayment structures aligned with your business cash flow — not a rigid EMI schedule." },
  { icon: BarChart3, title: "Quick Turnaround", desc: "Streamlined digital approval with minimal documentation. Funds in 48 hours." },
  { icon: Handshake, title: "No Collateral", desc: "Unsecured funding — no asset mortgage or third-party guarantee required." },
];

const DETAILS = [
  { label: "Loan Amount", value: "₹1,00,000 – ₹50,00,000" },
  { label: "Interest Rate", value: "Starting from 12% p.a." },
  { label: "Repayment Tenure", value: "12 – 60 months" },
  { label: "Processing Fee", value: "Up to 2.5% of loan amount" },
  { label: "Prepayment Charges", value: "Nil after 12 months" },
];

const ELIGIBILITY = [
  "Business vintage of 3+ years",
  "Minimum annual turnover of ₹10 Lakhs",
  "Age 25–65 years (individual applicants)",
  "ITR filed for the last 2 years",
  "No history of default or NPA",
];

const DOCUMENTS = [
  "KYC of promoters / directors",
  "Last 2 years ITR with computation",
  "Last 6 months' bank statements",
  "Business proof (GST / Udyam / Trade License)",
  "Financials (P&L, Balance Sheet for 2 years)",
];

const FAQS = [
  { q: "Can I get a business loan without collateral?", a: "Yes, our business loans are unsecured. No collateral or guarantor is required." },
  { q: "How quickly can I get the funds?", a: "Once all documents are submitted, eligible applicants receive funds within 48 hours." },
  { q: "What is the minimum turnover required?", a: "Your business should have a minimum annual turnover of ₹10 Lakhs." },
  { q: "Can startups apply?", a: "We primarily serve businesses with a minimum vintage of 3 years. For younger businesses, we evaluate on a case-by-case basis." },
];

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  name: "Business Loan",
  description: "Unsecured business loan up to ₹50 Lakhs for working capital, expansion, and equipment financing. No collateral required, rates from 12% p.a.",
  provider: { "@type": "Organization", name: "Growarth Capita Consultants LLP" },
  annualPercentageRate: "12% p.a.",
  feesAndCommissionsSpecification: "Up to 2.5% processing fee",
  loanMortgageAmount: { "@type": "MonetaryAmount", value: "5000000" },
};

export default function BusinessLoanPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      {/* ══════ HERO ══════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-canvas via-primary-soft/30 to-canvas">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:items-center lg:gap-16 lg:py-hero">
          <div className="flex flex-1 flex-col gap-6">
            <span className="text-overline text-primary tracking-[0.12em] uppercase">Business Loan</span>
            <h1 className="text-[clamp(1.75rem,4.5vw,3.25rem)] font-display text-ink-deep leading-[1.08] tracking-[-0.02em]">
              Fuel Your Business Growth
            </h1>
            <p className="text-[clamp(0.875rem,1.1vw,1rem)] text-slate/80 leading-relaxed">
              Expand operations, manage working capital, or invest in new equipment. Our unsecured business loans offer quick funding with terms that adapt to your cash flow.
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
          <h2 className="text-[clamp(1.35rem,2.5vw,2rem)] font-heading text-ink-deep mb-3 text-center">Why Choose Our Business Loan?</h2>
          <p className="text-[clamp(0.85rem,1.1vw,1rem)] text-slate/80 mb-10 text-center leading-relaxed">
            Capital designed for enterprises that need speed, flexibility, and trust.
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
            <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-5">Loan Details</h2>
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
            Get started with these essential documents.
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
          Quick answers about our business loan product.
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
            Ready to Grow Your Business?
          </h2>
          <p className="text-body-large text-slate/80 mb-6 leading-relaxed">
            Apply for a business loan and get funded within 48 hours.
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
