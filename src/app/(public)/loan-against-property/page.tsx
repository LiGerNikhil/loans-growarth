import type { Metadata } from "next";
import Link from "next/link";
import LeadForm from "@/components/public/LeadForm";
import { Check, ArrowRight, Home, Landmark, ShieldCheck, BadgeIndianRupee } from "lucide-react";

export const metadata: Metadata = {
  title: "Loan Against Property — Up to 70% Property Value | Growarth Capita",
  description:
    "Unlock your property's value with Growarth Capita. Loan Against Property up to 70% LTV at rates starting from 9.5% p.a. Low EMIs with 20-year tenure. Best loan agency India.",
  keywords: ["loan against property", "LAP loan", "property loan India", "best loan agency", "Growarth Capita", "low interest loan", "property mortgage loan"],
  openGraph: { title: "Loan Against Property — Up to 70% Property Value | Growarth Capita", description: "Loan Against Property up to 70% LTV. Rates from 9.5% p.a., flexible 20-year tenure." },
  alternates: { canonical: "/loan-against-property" },
};

const FEATURES = [
  { icon: BadgeIndianRupee, title: "High Loan-to-Value", desc: "Borrow up to 70% of your property's market value — ideal for large funding needs." },
  { icon: Landmark, title: "Low Interest Rates", desc: "Secured lending means significantly lower rates compared to unsecured loans." },
  { icon: ShieldCheck, title: "Long Repayment Tenure", desc: "Flexible repayment up to 20 years, keeping EMIs affordable and manageable." },
  { icon: Home, title: "Property Unused", desc: "Continue living in or using your property while the loan is outstanding." },
];

const DETAILS = [
  { label: "Loan Amount", value: "Up to 70% of property value" },
  { label: "Interest Rate", value: "Starting from 9.5% p.a." },
  { label: "Repayment Tenure", value: "Up to 20 years (240 months)" },
  { label: "Processing Fee", value: "Up to 1% of loan amount" },
  { label: "Prepayment Charges", value: "Nil for floating rate" },
];

const ELIGIBILITY = [
  "Age 25–65 years",
  "Salaried or self-employed with stable income",
  "Ownership of clear-title residential or commercial property",
  "Minimum property value of ₹15 Lakhs",
  "Co-applicant (spouse / earning family member) preferred",
];

const DOCUMENTS = [
  "KYC of applicant and co-applicant",
  "Property title deed & encumbrance certificate",
  "Latest property tax paid receipt",
  "Income proof (ITR, salary slips, bank statements)",
  "Property valuation report (arranged by lender)",
];

const FAQS = [
  { q: "Can I continue living in my property after taking the loan?", a: "Yes, you retain full possession and usage of the property. The lender holds a lien but you continue to live or use it." },
  { q: "What types of property are accepted?", a: "Both residential and commercial properties with clear titles are accepted. The property must be legally usable and marketable." },
  { q: "How is the loan amount determined?", a: "The loan amount is based on the property's current market value as assessed by an approved valuer, typically up to 70%." },
  { q: "What happens if I default?", a: "We work with you to restructure the loan before any enforcement action. Genuine repayment difficulties are handled case by case." },
];

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  name: "Loan Against Property",
  description: "Loan against property up to 70% LTV with rates from 9.5% p.a., flexible repayment up to 20 years.",
  provider: { "@type": "Organization", name: "Growarth Capita Consultants LLP" },
  annualPercentageRate: "9.5% p.a.",
  feesAndCommissionsSpecification: "Up to 1% processing fee",
  loanMortgageAmount: { "@type": "MonetaryAmount", value: "70% of property value" },
};

export default function LoanAgainstPropertyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      {/* ══════ HERO ══════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-canvas via-primary-soft/30 to-canvas">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:items-center lg:gap-16 lg:py-hero">
          <div className="flex flex-1 flex-col gap-6">
            <span className="text-overline text-primary tracking-[0.12em] uppercase">Loan Against Property</span>
            <h1 className="text-[clamp(1.75rem,4.5vw,3.25rem)] font-display text-ink-deep leading-[1.08] tracking-[-0.02em]">
              Unlock the Value of Your Property
            </h1>
            <p className="text-[clamp(0.875rem,1.1vw,1rem)] text-slate/80 leading-relaxed">
              Convert your idle property into liquid capital. Whether for business expansion, higher education, or medical emergencies — a Loan Against Property offers high value at lower interest rates.
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
          <h2 className="text-[clamp(1.35rem,2.5vw,2rem)] font-heading text-ink-deep mb-3 text-center">Why Choose Loan Against Property?</h2>
          <p className="text-[clamp(0.85rem,1.1vw,1rem)] text-slate/80 mb-10 text-center leading-relaxed">
            Leverage your property to meet your biggest financial goals.
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
            We make the process straightforward with clear documentation.
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
          Common questions about Loan Against Property.
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
            Unlock Your Property&apos;s Potential
          </h2>
          <p className="text-body-large text-slate/80 mb-6 leading-relaxed">
            Get a loan against your property at the best rates.
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
