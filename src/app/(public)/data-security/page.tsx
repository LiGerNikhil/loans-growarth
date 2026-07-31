import type { Metadata } from "next";
import { Shield, Lock, Server, Eye, FileCheck, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Data Security & Compliance | Growarth Capita Consultants LLP",
  description: "Growarth Capita Consultants LLP's commitment to data security, regulatory compliance, and confidentiality. Learn how we protect your personal and financial information.",
  keywords: ["Growarth Capita data security", "loan data protection", "confidentiality loan agency", "Growarth Capita Consultants LLP security", "ISO 27001 loan agency"],
  alternates: { canonical: "/data-security" },
};

const MEASURES = [
  { icon: Lock, title: "256-Bit Encryption", desc: "All data transmitted between your browser and our servers is encrypted using TLS 1.3 with 256-bit AES encryption — the same standard used by leading financial institutions." },
  { icon: Server, title: "Secure Infrastructure", desc: "Our systems are hosted in ISO 27001-certified data centres with 24/7 monitoring, biometric access controls, redundant power, and multi-layered firewalls." },
  { icon: Eye, title: "Access Controls", desc: "Strict role-based access controls ensure that only authorised personnel with a legitimate business need can access your data. All access is logged and audited." },
  { icon: FileCheck, title: "Regulatory Compliance", desc: "We comply with applicable data protection regulations including the IT Act, 2000 and its amendments. We follow RBI guidelines on data storage and outsourcing of financial services." },
  { icon: Shield, title: "Regular Audits", desc: "Our security infrastructure undergoes regular vulnerability assessments, penetration testing, and compliance audits by independent third-party firms." },
  { icon: RefreshCw, title: "Data Backup & Recovery", desc: "Automated encrypted backups are performed daily with redundant storage across geographically separate locations. Our RPO is under 1 hour and RTO under 4 hours." },
];

const COMPLIANCE_LIST = [
  "Information Technology Act, 2000 and IT (Reasonable Security Practices) Rules, 2011",
  "RBI Master Direction on Outsourcing of Financial Services",
  "RBI Guidelines on Data Localisation and Storage",
  "ISO 27001:2022 aligned information security practices",
  "PCI DSS compliant data handling for payment information",
  "GDPR principles applied to EU customer data",
];

const CONFIDENTIALITY = [
  { title: "Non-Disclosure", desc: "All employees and contractors sign comprehensive NDAs. Customer data access is granted strictly on a need-to-know basis." },
  { title: "Data Minimisation", desc: "We collect only the information necessary for loan processing. We do not retain data beyond the legally mandated retention period." },
  { title: "Third-Party Vetting", desc: "All partner banks and NBFCs undergo security due diligence before integration. Data-sharing agreements mandate equivalent security standards." },
  { title: "Breach Notification", desc: "In the unlikely event of a data breach, affected customers will be notified within 72 hours along with remediation steps." },
];

export default function DataSecurityPage() {
  return (
    <>
      {/* ══════ HERO ══════ */}
      <section className="bg-gradient-to-br from-canvas via-primary-soft/30 to-canvas">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-hero">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-overline text-primary tracking-[0.12em]">Security &amp; Compliance</span>
            <h1 className="text-[clamp(1.75rem,4vw,3rem)] font-display text-ink-deep leading-[1.08] tracking-[-0.02em] mt-2 mb-4">
              Your Data Is Safe With Us
            </h1>
            <p className="text-body-large text-slate/80 leading-relaxed">
              At Growarth Capita, we treat your personal and financial data with the highest level of security and confidentiality. Our practices meet or exceed industry standards and regulatory requirements.
            </p>
          </div>
        </div>
      </section>

      {/* ══════ SECURITY MEASURES ══════ */}
      <section className="border-y border-hairline-soft bg-surface-soft/50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
          <div className="mb-8 text-center">
            <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-2">Security Measures</h2>
            <p className="text-body text-slate/80">Every layer of our infrastructure is designed to protect your information from unauthorised access, disclosure, or loss.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MEASURES.map((m) => (
              <div key={m.title} className="rounded-xl bg-canvas p-5 shadow-elevation-xs ring-1 ring-hairline-soft sm:p-6">
                <span className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <m.icon className="size-5" />
                </span>
                <h3 className="text-heading-5 font-heading text-ink-deep mb-1.5">{m.title}</h3>
                <p className="text-body text-slate/80 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ COMPLIANCE ══════ */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-4">Regulatory Compliance</h2>
            <p className="text-body text-slate/80 leading-relaxed mb-6">
              We operate in full compliance with Indian data protection and financial services regulations. Our compliance framework is reviewed quarterly and updated to reflect regulatory changes.
            </p>
            <ul className="flex flex-col gap-3">
              {COMPLIANCE_LIST.map((c) => (
                <li key={c} className="flex items-start gap-3 text-body text-ink">
                  <span className="mt-1.5 flex size-3 shrink-0 items-center justify-center rounded-full bg-success">
                    <span className="size-1.5 rounded-full bg-canvas" />
                  </span>
                  <span className="text-slate/80">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[clamp(1.25rem,2.2vw,1.75rem)] font-heading text-ink-deep mb-4">Confidentiality Commitment</h2>
            <p className="text-body text-slate/80 leading-relaxed mb-6">
              Confidentiality is the foundation of our customer relationship. Every individual and organisation that handles your data is bound by strict confidentiality obligations.
            </p>
            <div className="flex flex-col gap-4">
              {CONFIDENTIALITY.map((c) => (
                <div key={c.title} className="rounded-lg border border-hairline-soft bg-canvas p-4">
                  <h3 className="text-label font-accent text-ink-deep mb-1">{c.title}</h3>
                  <p className="text-body-small text-slate/70 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════ CERTIFICATIONS ══════ */}
      <section className="border-y border-hairline-soft bg-surface-soft/50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-section text-center">
          <h2 className="text-[clamp(1.1rem,2vw,1.5rem)] font-heading text-ink-deep mb-2">Our Commitment</h2>
          <p className="text-body text-slate/80 leading-relaxed">
            We continuously invest in our security infrastructure, train our team on data protection best practices, and engage independent auditors to validate our controls. If you have any questions about our security practices, please contact our Data Protection Officer at <span className="text-primary">info@growarthcapita.com</span>.
          </p>
        </div>
      </section>
    </>
  );
}
