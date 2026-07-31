import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, Users, TrendingUp, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Growarth Capita Consultants LLP",
  description: "Trusted financial partner since 2015. Growarth Capita Consultants LLP connects individuals and businesses with the right loan products from India's leading banks and NBFCs.",
  keywords: ["Growarth Capita", "Growarth Capita Consultants LLP", "about best loan agency", "loan consultant India", "Noida loan agency"],
  openGraph: { title: "About Us | Growarth Capita Consultants LLP", description: "Trusted financial partner since 2015. We connect borrowers with India's leading banks and NBFCs." },
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: Shield, title: "Integrity First", desc: "Every recommendation we make is driven by what's best for you — never by commission structures or sales targets." },
  { icon: Users, title: "Customer-Centric", desc: "Our processes are built around your convenience. From application to disbursal, we prioritise your experience." },
  { icon: TrendingUp, title: "Expert Guidance", desc: "With a decade of domain expertise, our team provides insights that help you make informed financial decisions." },
  { icon: HeartHandshake, title: "Long-Term Partnership", desc: "We don't just close loans — we build lasting relationships. Our support extends well beyond disbursal." },
];

const TEAM_HIGHLIGHTS = [
  "10+ years of combined experience in banking and NBFC sectors",
  "Processed over 50,000 loan applications across 15+ product categories",
  "Partnerships with 30+ financial institutions including major banks",
  "Dedicated relationship managers for every borrower",
];

const TIMELINE = [
  { year: "2015", event: "Growarth Capita founded with a vision to simplify loan access" },
  { year: "2017", event: "Crossed ₹50Cr in total loan disbursement; partnered with 5 major banks" },
  { year: "2019", event: "Launched digital application platform; expanded to 10+ NBFC partnerships" },
  { year: "2021", event: "₹200Cr disbursement milestone; introduced AI-powered eligibility checks" },
  { year: "2023", event: "Surpassed ₹400Cr in disbursements; 50,000+ customers served" },
  { year: "2025", event: "Expanded product suite to include overdraft facilities and property loans" },
];

export default function AboutPage() {
  return (
    <>
      {/* ══════ HERO ══════ */}
      <section className="bg-gradient-to-br from-canvas via-primary-soft/30 to-canvas">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-hero">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-overline text-primary tracking-[0.12em]">About Us</span>
            <h1 className="text-[clamp(1.75rem,4vw,3rem)] font-display text-ink-deep leading-[1.08] tracking-[-0.02em] mt-2 mb-4">
              Your Trusted Partner in Financial Growth
            </h1>
            <p className="text-body-large text-slate/80 leading-relaxed">
              Since 2015, Growarth Capita has been bridging the gap between borrowers and India&apos;s leading financial institutions. We don&apos;t just process loan applications — we guide you to the right financial decision with complete transparency and expert advice.
            </p>
          </div>
        </div>
      </section>

      {/* ══════ MISSION ══════ */}
      <section className="border-y border-hairline-soft bg-surface-soft/50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-4">Our Mission</h2>
              <p className="text-body text-slate/80 leading-relaxed mb-4">
                To democratise access to credit by connecting every borrower — salaried, self-employed, or business owner — with loan products that truly fit their needs. We believe informed borrowers make better financial decisions, and we exist to provide that clarity.
              </p>
              <p className="text-body text-slate/80 leading-relaxed">
                Through deep partnerships with India&apos;s most trusted banks and NBFCs, we ensure competitive rates, faster approvals, and a borrowing experience that respects your time and intelligence.
              </p>
            </div>
            <div className="rounded-xl bg-canvas p-6 shadow-elevation-sm ring-1 ring-hairline-soft">
              <h3 className="text-heading-5 font-heading text-ink-deep mb-3">By the Numbers</h3>
              <div className="grid grid-cols-2 gap-4">
                {["₹500Cr+", "50,000+", "30+", "99.2%"].map((val, i) => (
                  <div key={i}>
                    <p className="text-[clamp(1.1rem,1.8vw,1.5rem)] font-display text-primary leading-none">{val}</p>
                    <p className="text-body-small text-slate/70 mt-1">
                      {["Total Disbursed", "Customers Served", "Lending Partners", "Approval Rate"][i]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ VALUES ══════ */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
        <div className="mb-10 text-center">
          <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-2">What We Stand For</h2>
          <p className="text-body text-slate/80">Our values shape every interaction, every recommendation, and every relationship we build.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-xl bg-canvas p-5 shadow-elevation-xs ring-1 ring-hairline-soft sm:p-6">
              <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <v.icon className="size-5" />
              </span>
              <h3 className="text-heading-5 font-heading text-ink-deep mb-1.5">{v.title}</h3>
              <p className="text-body text-slate/80 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ TIMELINE ══════ */}
      <section className="border-y border-hairline-soft bg-surface-soft/50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
          <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-8 text-center">Our Journey</h2>
          <div className="mx-auto max-w-3xl">
            {TIMELINE.map((t, i) => (
              <div key={t.year} className="flex gap-5 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-accent text-on-primary">{t.year.slice(2)}</span>
                  {i < TIMELINE.length - 1 && <span className="mt-1 w-px flex-1 bg-hairline-soft" />}
                </div>
                <div className="pt-1">
                  <span className="text-label text-primary">{t.year}</span>
                  <p className="text-body text-slate/80">{t.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ TEAM ══════ */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
        <div className="mb-8 text-center">
          <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-2">Why Borrowers Trust Us</h2>
          <p className="text-body text-slate/80">Our team brings deep institutional knowledge and a personal commitment to every borrower.</p>
        </div>
        <div className="mx-auto grid max-w-3xl gap-3">
          {TEAM_HIGHLIGHTS.map((h) => (
            <div key={h} className="flex items-start gap-3 rounded-lg bg-surface-soft px-5 py-3.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/10">
                <span className="size-2 rounded-full bg-success" />
              </span>
              <span className="text-body text-ink">{h}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════ CTA ══════ */}
      <section className="bg-ink-deep">
        <div className="mx-auto max-w-7xl px-6 py-10 text-center">
          <h2 className="text-[clamp(1.1rem,2vw,1.5rem)] font-heading text-ink-button mb-1.5">Ready to Work with Us?</h2>
          <p className="text-body text-steel/70 mb-5">Experience the Growarth Capita difference. Apply for a loan or get in touch with our team.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/#lead-form" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-6 text-button text-on-primary transition-all active:bg-primary-deep">
              Apply Now <ArrowRight className="size-3.5" />
            </Link>
            <Link href="/contact" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-steel/30 px-6 text-button text-ink-button transition-all active:bg-white/5">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
