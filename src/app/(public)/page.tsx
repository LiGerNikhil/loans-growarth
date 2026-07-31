import type { Metadata } from "next";
import Link from "next/link";
import LeadForm from "@/components/public/LeadForm";
import AnimatedLogoBar from "@/components/public/AnimatedLogoBar";
import { Check, ArrowRight, Clock, Percent, Shield, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Best Loan Agency in India | Personal & Business Loans | Growarth Capita",
  description:
    "Growarth Capita Consultants LLP — India's best loan agency for Personal Loans, Business Loans, Loan Against Property, and Overdraft Facilities. Instant approval, competitive rates, expert guidance.",
  keywords: [
    "Growarth Capita",
    "Growarth Capita Consultants LLP",
    "best loan agency",
    "loan agency India",
    "personal loan",
    "business loan",
    "loan against property",
    "connector business",
    "instant loan online",
  ],
  openGraph: {
    title: "Growarth Capita — Best Loan Agency & Connector Business",
    description:
      "India's trusted loan agency for Personal Loans, Business Loans, Loan Against Property, and Overdraft Facilities. Expert guidance, competitive rates, fast disbursal.",
  },
};



const PRODUCTS = [
  {
    title: "Personal Loan",
    desc: "Unsecured loans for weddings, medical emergencies, travel, or debt consolidation. Disbursal within 24 hours.",
    href: "/personal-loan",
    features: ["No collateral", "Up to ₹25 Lakhs", "Flexible 60-month tenure"],
  },
  {
    title: "Business Loan",
    desc: "Working capital, expansion funding, or equipment financing without pledging assets.",
    href: "/business-loan",
    features: ["Unsecured up to ₹50 Lakhs", "Minimal documentation", "Customised repayment"],
  },
  {
    title: "Loan Against Property",
    desc: "Unlock your property's value at lower interest rates with long repayment tenures.",
    href: "/loan-against-property",
    features: ["Up to 70% property value", "Lower rates", "20-year tenure"],
  },
  {
    title: "Overdraft Facility",
    desc: "A revolving credit line — pay interest only on what you use.",
    href: "/overdraft-facility",
    features: ["Interest on utilised amount", "Revolving limit", "Quick access"],
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Submit", desc: "Fill the online form in under 2 minutes." },
  { step: "02", title: "Verify", desc: "We assess your eligibility and verify documents within hours." },
  { step: "03", title: "Get Funded", desc: "Loan approved and funds disbursed to your account." },
];

const STATS = [
  { value: "₹500Cr+", label: "Total Loan Disbursement" },
  { value: "50,000+", label: "Customers Served" },
  { value: "4.8/5", label: "Average Customer Rating" },
  { value: "24 hrs", label: "Average Approval Time" },
];

const BENEFITS = [
  { icon: Clock, title: "Lightning-Fast Processing", desc: "AI-powered verification. Funds in your account within 24 hours." },
  { icon: Percent, title: "Competitive Interest Rates", desc: "Rates starting from 10.5% p.a., customised to your profile." },
  { icon: Shield, title: "Complete Transparency", desc: "No hidden fees, no prepayment penalties after 6 months." },
  { icon: Users, title: "Dedicated Support", desc: "Personal relationship manager from application to repayment." },
];

export default function HomePage() {
  return (
    <>
      {/* ══════ HERO ══════ */}
      <section className="bg-gradient-to-br from-canvas via-primary-soft/40 to-canvas">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 lg:flex-row lg:items-center lg:gap-16 lg:py-20">
          <div className="flex flex-1 flex-col gap-5">
            <span className="text-overline text-primary tracking-[0.12em]">Growarth Capita — Trusted Since 2015</span>
            <h1 className="text-[clamp(1.75rem,4vw,3.25rem)] font-display text-ink-deep leading-[1.08] tracking-[-0.02em]">
              Get Instant Loans with Expert Guidance
            </h1>
            <p className="text-[clamp(0.875rem,1.1vw,1rem)] text-slate/80 leading-relaxed sm:leading-relaxed">
              From personal loans to business financing and property-backed funding — we connect you with the right loan at the best rates. Fill the Quote form Below to check your eligibility and get a call back from our experts within 2 hours.
            </p>
            
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 pt-1 text-body-small text-steel">
              <span className="flex items-center gap-1.5"><Check className="size-3.5 text-success" /> No hidden charges</span>
              <span className="flex items-center gap-1.5"><Check className="size-3.5 text-success" /> 100% digital</span>
              <span className="flex items-center gap-1.5"><Check className="size-3.5 text-success" /> Same-day disbursal</span>
            </div>
          </div>
          <div id="lead-form" className="w-full shrink-0 lg:w-[400px]">
            <LeadForm />
          </div>
        </div>
      </section>

      {/* ══════ STATS ══════ */}
      <section className="bg-ink-deep">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 py-8 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[clamp(1.25rem,2.5vw,2rem)] font-display text-primary leading-none">{s.value}</p>
              <p className="text-[clamp(0.7rem,0.9vw,0.85rem)] text-steel mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ PARTNERS ══════ */}
      <section className="border-b border-hairline-soft bg-surface-soft/50">
        <div className="mx-auto max-w-7xl px-6 py-10 text-center">
          <span className="text-overline text-primary tracking-[0.12em]">Official Partners</span>
          <h2 className="text-[clamp(1.1rem,1.8vw,1.35rem)] font-heading text-ink-deep mt-1.5 mb-1">
            Trusted by Leading Banks &amp; NBFCs
          </h2>
          <p className="text-body-small text-slate/70 mb-7">
            We are authorised distribution partners of India&apos;s most reputable financial institutions.
          </p>
          <AnimatedLogoBar />
        </div>
      </section>

      {/* ══════ LOAN PRODUCTS ══════ */}
      <section id="products" className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-2">
            Choose Your Loan Product
          </h2>
          <p className="text-[clamp(0.85rem,1.05vw,0.95rem)] text-slate/80">
            Every financial need is unique. We offer a range of products designed for different goals, tenures, and profiles.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {PRODUCTS.map((p) => (
            <Link
              key={p.title}
              href={p.href}
              className="group rounded-xxl border border-hairline-soft bg-canvas p-5 transition-all active:shadow-sm sm:p-6"
            >
              <h3 className="text-heading-5 font-heading text-ink-deep mb-1.5">{p.title}</h3>
              <p className="text-body text-slate mb-3">{p.desc}</p>
              <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-1 text-body-small text-charcoal">
                    <ArrowRight className="size-3 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <span className="inline-flex items-center gap-1 text-label text-primary group-active:gap-1.5 transition-all">
                Know More <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════ BENEFITS ══════ */}
      <section className="bg-surface-soft border-y border-hairline-soft">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8 text-center">
            <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-2">
              Why Growarth Capita?
            </h2>
            <p className="text-[clamp(0.85rem,1.05vw,0.95rem)] text-slate/80">
              We combine deep financial expertise with modern technology to deliver a loan experience that&apos;s fast, fair, and transparent.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-xl bg-canvas p-5 shadow-elevation-xs">
                <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <b.icon className="size-5" />
                </span>
                <h3 className="text-heading-5 font-heading text-ink-deep mb-1">{b.title}</h3>
                <p className="text-body text-slate">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 text-center">
          <h2 className="text-[clamp(1.1rem,2vw,1.5rem)] font-heading text-ink-deep mb-1.5">
            How It Works
          </h2>
          <p className="text-[clamp(0.8rem,1vw,0.9rem)] text-slate/80">
            Three simple steps from application to disbursal.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {HOW_IT_WORKS.map((s, i) => (
            <div key={s.step} className="relative flex flex-col items-center text-center">
              <span className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-primary text-body font-accent text-on-primary">
                {s.step}
              </span>
              {i < HOW_IT_WORKS.length - 1 && (
                <span className="hidden md:block absolute left-[60%] top-5 w-[80%] border-t border-dashed border-hairline" />
              )}
              <h3 className="text-body font-accent text-ink-deep mb-0.5">{s.title}</h3>
              <p className="text-body-small text-slate max-w-[260px]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ FINAL CTA ══════ */}
      <section className="bg-ink-deep">
        <div className="mx-auto max-w-7xl px-6 py-10 text-center">
          <h2 className="text-[clamp(1.1rem,2vw,1.5rem)] font-heading text-ink-button mb-1.5">
            Ready to Get Started?
          </h2>
          <p className="text-[clamp(0.8rem,1vw,0.9rem)] text-steel/70 mb-5">
            Submit your details and we&apos;ll call you back within 2 hours — no obligation, no pressure.
          </p>
          <Link
            href="#lead-form"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-6 text-button text-on-primary transition-all active:bg-primary-deep"
          >
            Apply Now <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
