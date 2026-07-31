import type { Metadata } from "next";
import Link from "next/link";
import { Check, Search, FileText, Banknote, ArrowRight, Clock, Shield, Phone, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Thank You — Application Received | Growarth Capita",
  description: "Your loan application has been submitted successfully. Our team will contact you within 2 hours.",
  robots: { index: false },
  alternates: { canonical: "/thank-you" },
};

const STEPS = [
  { icon: Search, title: "Review & Eligibility Check", desc: "Our team assesses your details against partner banks and NBFCs." },
  { icon: FileText, title: "Document Collection", desc: "We reach out to collect required documents and verify your information." },
  { icon: Banknote, title: "Disbursal Within 24hrs", desc: "Once approved, funds are credited to your account within 24 hours." },
];

export default async function ThankYouPage(props: { searchParams: Promise<{ leadId?: string }> }) {
  const { leadId } = await props.searchParams;

  return (
    <section className="relative">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3 lg:pr-8">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-success/10 ring-1 ring-success/20 mb-6">
              <Check className="size-7 text-success" />
            </div>

            <h1 className="text-heading-2 text-ink-deep font-semibold mb-3 leading-tight">
              Application Received
            </h1>

            <p className="text-body-large text-slate mb-1">
              Thank you for choosing <span className="text-primary font-medium">Growarth Capita</span>.
            </p>
            <p className="text-body text-slate/70 mb-6 leading-relaxed">
              Your loan request has been successfully submitted. Our team will review your details and reach out within <strong className="text-ink font-semibold">2 hours</strong>.
            </p>

            {leadId && (
              <div className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/8 to-primary/3 px-5 py-3 ring-1 ring-primary/10 mb-8">
                <span className="text-caption text-slate/60 font-semibold uppercase tracking-widest">Lead ID</span>
                <span className="h-4 w-px bg-primary/15" />
                <span className="text-heading-5 font-sans font-semibold text-primary tracking-wider">{leadId}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink-deep px-5 text-button font-medium text-ink-button transition-all hover:bg-ink-deep/90 active:translate-y-px"
              >
                Back to Home <ArrowRight className="size-4" />
              </Link>
              <Link
                href="tel:+918882426515"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-hairline bg-canvas px-5 text-button font-medium text-ink transition-all hover:bg-surface-soft active:translate-y-px"
              >
                <Phone className="size-4" /> Need Help?
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <span className="text-caption text-slate font-medium">2hr response</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                <span className="text-caption text-slate font-medium">100% secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-primary" />
                <span className="text-caption text-slate font-medium">Dedicated support</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-hairline-soft bg-canvas p-6 shadow-elevation-sm">
              <p className="text-label font-semibold text-ink-deep mb-6 flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-md bg-primary/10 text-primary text-caption font-bold">i</span>
                What happens next?
              </p>
              <div className="flex flex-col gap-0">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const isLast = i === STEPS.length - 1;
                  return (
                    <div key={s.title} className={`flex gap-4 ${isLast ? "" : "pb-5 border-l-2 border-primary/15 ml-3"}`}>
                      <div className="flex flex-col items-center">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-caption font-semibold text-on-primary -ml-[15px]">
                          <Icon className="size-3.5" />
                        </span>
                        {!isLast && <div className="flex-1 w-0.5 bg-primary/10 min-h-5 mt-1" />}
                      </div>
                      <div className="pt-0.5">
                        <p className="text-label font-semibold text-ink-deep mb-0.5">{s.title}</p>
                        <p className="text-body-small text-slate/60 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-5 border-t border-hairline-soft">
                <Link
                  href="/personal-loan"
                  className="group flex items-center justify-between rounded-xl bg-surface-soft px-4 py-3 transition-colors hover:bg-primary/5"
                >
                  <span className="text-body-small font-medium text-ink">Explore our loan products</span>
                  <ChevronRight className="size-4 text-slate group-hover:text-primary transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
