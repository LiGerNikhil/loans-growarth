import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Growarth Capita Consultants LLP",
  description: "Growarth Capita Consultants LLP's privacy policy explains how we collect, use, store, and protect your personal information in compliance with applicable data protection laws.",
  keywords: ["Growarth Capita privacy policy", "privacy policy India", "data protection loan agency", "Growarth Capita Consultants LLP"],
  alternates: { canonical: "/privacy-policy" },
};

const SECTIONS = [
  {
    title: "Information We Collect",
    content: "We collect personal information that you voluntarily provide when you submit a loan inquiry, fill out our online forms, or contact us. This includes your name, mobile number, email address, monthly income, loan amount requirement, and loan type preference. We may also collect employment details, bank account information, and KYC documents when required for loan processing with our partner financial institutions.",
  },
  {
    title: "How We Use Your Information",
    content: "Your information is used solely for the purpose of evaluating your loan eligibility, connecting you with appropriate lending partners, processing your application, and communicating with you about your loan status. We may also use anonymised data for analytics to improve our services. We do not sell, rent, or trade your personal information to third parties for marketing purposes.",
  },
  {
    title: "Information Sharing",
    content: "We share your information only with your consent and strictly for the purpose of loan processing. This includes sharing relevant details with our partner banks, NBFCs, credit bureaus (for credit score checks), and regulatory authorities as required by law. All third parties we work with are contractually bound to maintain the confidentiality and security of your data.",
  },
  {
    title: "Data Retention",
    content: "We retain your personal information for as long as necessary to fulfill the purposes described in this policy, or as required by applicable law. Loan application data is retained for a minimum of 8 years to comply with regulatory requirements. After the retention period, your data is securely deleted or anonymised.",
  },
  {
    title: "Data Security",
    content: "We implement industry-standard security measures including 256-bit SSL/TLS encryption for all data transmission, encrypted storage of sensitive information, role-based access controls, and regular security audits. Our systems are hosted in ISO 27001-certified data centres with restricted physical access.",
  },
  {
    title: "Your Rights",
    content: "You have the right to access, correct, or delete your personal information held by us. You may withdraw consent for data processing at any time by contacting us. We will respond to your request within 30 days. You also have the right to file a complaint with the relevant data protection authority if you believe your data has been mishandled.",
  },
  {
    title: "Cookies",
    content: "Our website uses essential cookies for functionality and analytics cookies to improve user experience. You can control cookie preferences through your browser settings. We do not use cookies for behavioural tracking or advertising.",
  },
  {
    title: "Changes to This Policy",
    content: "We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically. Material changes will be communicated via email or website notice.",
  },
  {
    title: "Contact Us",
    content: "If you have questions about this privacy policy or wish to exercise your data rights, please contact our Data Protection Officer at dpo@growarthcapita.com or write to us at our registered office in Mumbai, Maharashtra.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-canvas via-primary-soft/30 to-canvas">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-hero">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-overline text-primary tracking-[0.12em]">Legal</span>
            <h1 className="text-[clamp(1.75rem,4vw,3rem)] font-display text-ink-deep leading-[1.08] tracking-[-0.02em] mt-2 mb-4">
              Privacy Policy
            </h1>
            <p className="text-body text-slate/70">Last updated: July 2026</p>
            <p className="text-body-large text-slate/80 leading-relaxed mt-4">
              Your privacy matters to us. This policy outlines how Growarth Capita collects, uses, stores, and protects your personal information when you use our website and services.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-hairline-soft bg-surface-soft/50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col gap-8">
              {SECTIONS.map((s) => (
                <div key={s.title}>
                  <h2 className="text-heading-5 font-heading text-ink-deep mb-2">{s.title}</h2>
                  <p className="text-body text-slate/80 leading-relaxed">{s.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
