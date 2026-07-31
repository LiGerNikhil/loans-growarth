import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | Growarth Capita Consultants LLP — Noida",
  description: "Contact Growarth Capita Consultants LLP at A-48, Sec-2, Noida. Call 8882426515 or email info@growarthcapita.com. India's best loan agency for personal and business loans.",
  keywords: ["Growarth Capita contact", "Growarth Capita Consultants LLP", "best loan agency Noida", "loan consultant contact", "8882426515", "Noida loan office"],
  openGraph: { title: "Contact Growarth Capita — A-48, Sec-2, Noida", description: "Visit our Noida office or call 8882426515. India's trusted loan agency." },
  alternates: { canonical: "/contact" },
};

const CONTACT_INFO = [
  { icon: Phone, label: "Phone", value: "8882426515", detail: "Mon–Sat, 9 AM – 7 PM", href: "tel:8882426515" },
  { icon: Mail, label: "Email", value: "info@growarthcapita.com", detail: "We respond within 2 hours", href: "mailto:info@growarthcapita.com" },
  { icon: MapPin, label: "Office", value: "A-48, Sec-2, Noida", detail: "Uttar Pradesh, India" },
  { icon: Clock, label: "Business Hours", value: "Monday – Saturday", detail: "9:00 AM – 7:00 PM" },
];

export default function ContactPage() {
  return (
    <>
      {/* ══════ HERO ══════ */}
      <section className="bg-gradient-to-br from-canvas via-primary-soft/30 to-canvas">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-hero">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-overline text-primary tracking-[0.12em]">Contact</span>
            <h1 className="text-[clamp(1.75rem,4vw,3rem)] font-display text-ink-deep leading-[1.08] tracking-[-0.02em] mt-2 mb-4">
              We&apos;re Here to Help
            </h1>
            <p className="text-body-large text-slate/80 leading-relaxed">
              Reach out to us by phone, email, or visit our office. Our team is ready to assist you with any loan-related inquiry.
            </p>
          </div>
        </div>
      </section>

      {/* ══════ CONTACT DETAILS + MAP ══════ */}
      <section className="border-y border-hairline-soft bg-surface-soft/50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-6">Get in Touch</h2>
              <div className="flex flex-col gap-5">
                {CONTACT_INFO.map((c) => {
                  const Wrapper = c.href ? "a" : "div";
                  const wrapperProps = c.href ? { href: c.href, target: c.href.startsWith("tel") ? undefined : "_blank", rel: c.href.startsWith("tel") ? undefined : "noopener noreferrer" } : {};
                  return (
                    <Wrapper key={c.label} {...wrapperProps} className={`flex items-start gap-4 ${c.href ? "group cursor-pointer" : ""}`}>
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <c.icon className="size-4" />
                      </span>
                      <div>
                        <p className="text-label text-ink-deep">{c.label}</p>
                        <p className={`text-body ${c.href ? "text-primary group-hover:underline" : "text-slate/80"}`}>
                          {c.value}
                          {c.href && <ExternalLink className="ml-1 inline size-3 align-middle opacity-60" />}
                        </p>
                        <p className="text-body-small text-slate/60">{c.detail}</p>
                      </div>
                    </Wrapper>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-4">Our Location</h2>
              <div className="rounded-xl bg-canvas ring-1 ring-hairline-soft overflow-hidden">
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=77.298,28.583,77.318,28.594&layer=mapnik&marker=28.5885,77.3085"
                  width="100%"
                  height="260"
                  style={{ border: 0, display: "block" }}
                  loading="lazy"
                  title="Growarth Capita Office at A-48, Sec-2, Noida"
                />
                <a
                  href="https://maps.app.goo.gl/Rqr7SiC2o4Akaji69"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-surface-soft"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="size-4 shrink-0 text-primary" />
                    <div>
                      <p className="text-label font-accent text-ink-deep">Growarth Capita</p>
                      <p className="text-body-small text-slate/70">A-48, Sec-2, Noida, Uttar Pradesh</p>
                    </div>
                  </div>
                  <ExternalLink className="size-4 shrink-0 text-primary" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════ WEBSITE ══════ */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
        <div className="rounded-xxl bg-gradient-to-br from-primary-soft to-primary-soft/40 p-8 text-center ring-1 ring-hairline-soft sm:p-12">
          <span className="text-overline text-primary tracking-[0.12em]">Full Website</span>
          <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mt-2 mb-3">
            Explore All Products &amp; Services
          </h2>
          <p className="text-body text-slate/70 leading-relaxed mb-6">
            Visit our complete website to learn about Personal Loans, Business Loans, Loan Against Property, Overdraft Facilities, Home Loans, and more — with detailed eligibility criteria, interest rates, documentation requirements, and instant eligibility checks.
          </p>
          <a
            href="https://growarthcapita.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-ink-deep px-6 text-button text-ink-button transition-all hover:bg-ink-deep/90"
          >
            Visit www.growarthcapita.com <ExternalLink className="size-3.5" />
          </a>
        </div>
      </section>
    </>
  );
}
