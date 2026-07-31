import type { Metadata } from "next";
import Link from "next/link";
import LeadForm from "@/components/public/LeadForm";
import { Check, ArrowRight, Clock, FileText, Banknote, Shield, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Personal Loan — Instant Approval Up to ₹25 Lakhs | Growarth Capita",
  description:
    "Get instant personal loans from Growarth Capita — India's best loan agency. Collateral-free funding up to ₹25 Lakhs with 24-hour disbursal. Minimal paperwork, competitive rates.",
  keywords: ["personal loan", "instant personal loan", "personal loan India", "best loan agency", "Growarth Capita", "unsecured loan", "24-hour loan disbursal"],
  openGraph: { title: "Personal Loan — Instant Approval Up to ₹25 Lakhs | Growarth Capita", description: "Collateral-free personal loan up to ₹25 Lakhs with 24-hour disbursal. Apply now." },
  alternates: { canonical: "/personal-loan" },
};

const FEATURES = [
  { icon: Banknote, title: "High Loan Amount", desc: "Borrow from ₹50,000 up to ₹25 Lakhs with zero collateral required." },
  { icon: Clock, title: "24-Hour Disbursal", desc: "Fully paperless process. Funds credited to your account within a day of approval." },
  { icon: FileText, title: "Minimal Paperwork", desc: "Basic KYC, last 3 months' salary slips, and bank statements are all you need." },
  { icon: Shield, title: "No Collateral", desc: "Completely unsecured. No guarantor, no security deposit, no asset mortgage." },
];

const DETAILS = [
  { label: "Loan Amount", value: "₹50,000 – ₹25,00,000" },
  { label: "Interest Rate", value: "Starting from 10.5% p.a." },
  { label: "Repayment Tenure", value: "12 – 60 months" },
  { label: "Processing Fee", value: "Up to 2% of loan amount" },
  { label: "Prepayment Charges", value: "Nil after 6 months" },
];

const ELIGIBILITY = [
  "Indian resident aged 21–60 years",
  "Salaried or self-employed with stable income",
  "Minimum monthly income of ₹20,000",
  "Minimum CIBIL score of 650",
  "Employment tenure of 1+ year with current employer",
];

const DOCUMENTS = [
  "Aadhaar Card / PAN Card (identity proof)",
  "Address proof (utility bill / passport / driving licence)",
  "Last 3 months' bank statements",
  "Salary slips of last 3 months",
  "ITR for self-employed applicants",
];

const FAQS = [
  { q: "Can I prepay my personal loan?", a: "Yes, you can prepay the loan after 6 months with zero prepayment charges." },
  { q: "How long does approval take?", a: "Our AI-based system approves eligible applicants within 2–4 hours of document submission." },
  { q: "Is collateral required?", a: "No. Our personal loan is completely unsecured — no collateral or guarantor needed." },
  { q: "Can I apply with a low credit score?", a: "We consider applications with scores as low as 650, though the rate may vary based on your profile." },
];

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  name: "Personal Loan",
  description: "Collateral-free personal loan up to ₹25 Lakhs with 24-hour disbursal, competitive rates from 10.5% p.a., and flexible tenure up to 60 months.",
  provider: { "@type": "Organization", name: "Growarth Capita Consultants LLP" },
  annualPercentageRate: "10.5% p.a.",
  feesAndCommissionsSpecification: "Up to 2% processing fee",
  loanMortgageAmount: { "@type": "MonetaryAmount", value: "2500000" },
};

export default function PersonalLoanPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      {/* ══════ HERO ══════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-canvas via-primary-soft/30 to-canvas">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:items-center lg:gap-16 lg:py-hero">
          <div className="flex flex-1 flex-col gap-6">
            <span className="text-overline text-primary tracking-[0.12em] uppercase">Personal Loan</span>
            <h1 className="text-[clamp(1.75rem,4.5vw,3.25rem)] font-display text-ink-deep leading-[1.08] tracking-[-0.02em]">
              Funds for Life&apos;s Important Moments
            </h1>
            <p className="text-[clamp(0.875rem,1.1vw,1rem)] text-slate/80 leading-relaxed">
              Whether it&apos;s a wedding, medical emergency, dream vacation, or consolidating existing debt — our personal loans offer quick, collateral-free funding with flexible repayment terms.
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
          <h2 className="text-[clamp(1.35rem,2.5vw,2rem)] font-heading text-ink-deep mb-3 text-center">Why Choose Our Personal Loan?</h2>
          <p className="text-[clamp(0.85rem,1.1vw,1rem)] text-slate/80 mb-10 text-center leading-relaxed">
            Built around your needs — fast, transparent, and completely digital from application to disbursal.
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

      {/* ══════ DOCUMENTS — horizontal cards ══════ */}
      <section className="border-y border-hairline-soft bg-surface-soft">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
          <h2 className="text-[clamp(1.35rem,2.5vw,2rem)] font-heading text-ink-deep mb-3 text-center">Documents Required</h2>
          <p className="text-[clamp(0.85rem,1.1vw,1rem)] text-slate/80 mb-10 text-center leading-relaxed">
            We keep the paperwork minimal. Here&apos;s everything you need to get started.
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
          Quick answers to common queries about our personal loan product.
        </p>
        <div className="mx-auto max-w-3xl divide-y divide-hairline-soft">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between text-body font-accent text-ink list-none">
                {faq.q}
                <TrendingUp className="size-4 text-slate rotate-90 group-open:rotate-180 transition-transform shrink-0" />
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
            Ready to Apply for a Personal Loan?
          </h2>
          <p className="text-body-large text-slate/80 mb-6 leading-relaxed">
            Submit your application and get a response from our team within 2 hours.
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
