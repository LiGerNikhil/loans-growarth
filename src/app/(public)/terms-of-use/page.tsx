import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Growarth Capita Consultants LLP",
  description: "Terms and conditions governing the use of the Growarth Capita Consultants LLP website and services. Please read these terms carefully before using our platform.",
  keywords: ["Growarth Capita terms", "terms of use", "loan website terms", "Growarth Capita Consultants LLP"],
  alternates: { canonical: "/terms-of-use" },
};

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    content: "By accessing or using the Growarth Capita website, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you must not use our website or services. These terms constitute a legally binding agreement between you and Growarth Capita.",
  },
  {
    title: "Eligibility",
    content: "By using our services, you confirm that you are at least 18 years of age and are legally capable of entering into binding contracts. You agree to provide accurate, current, and complete information during the loan application process and to update such information as necessary.",
  },
  {
    title: "Services Description",
    content: "Growarth Capita acts as a loan distribution partner (DSA) connecting borrowers with banks and NBFCs. We facilitate the loan application process but do not directly lend money. Final loan approval, terms, and disbursal are at the sole discretion of the partnering financial institution. We do not guarantee loan approval.",
  },
  {
    title: "User Obligations",
    content: "You agree to provide truthful and accurate information in all communications with us. You must not misrepresent your identity, income, employment, or any other information relevant to your loan application. Providing false information may result in rejection of your application and legal action.",
  },
  {
    title: "Fees and Charges",
    content: "Our loan facilitation services are free of charge to borrowers. We do not charge any upfront fees for processing loan applications. Any fees charged by partner financial institutions (such as processing fees) will be disclosed to you before you accept the loan offer.",
  },
  {
    title: "Intellectual Property",
    content: "All content on this website — including text, graphics, logos, icons, and software — is the property of Growarth Capita or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.",
  },
  {
    title: "Limitation of Liability",
    content: "Growarth Capita shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or services. Our total liability shall not exceed the amount of fees paid by you to us, if any. We are not responsible for decisions made by partner financial institutions regarding loan approval or terms.",
  },
  {
    title: "Third-Party Links",
    content: "Our website may contain links to third-party websites. We are not responsible for the content, privacy practices, or terms of those websites. Accessing third-party links is at your own risk, and we encourage you to review their terms and policies.",
  },
  {
    title: "Termination",
    content: "We reserve the right to suspend or terminate your access to our services at any time without notice if you violate these terms or engage in fraudulent or inappropriate conduct. Upon termination, your right to use our services ceases immediately.",
  },
  {
    title: "Governing Law",
    content: "These terms are governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.",
  },
  {
    title: "Changes to Terms",
    content: "We may revise these Terms of Use at any time by updating this page. Continued use of our services after changes constitutes acceptance of the revised terms. We encourage you to review this page periodically.",
  },
  {
    title: "Contact",
    content: "For questions about these Terms of Use, please contact us at hello@growarthcapita.com or through our Contact page.",
  },
];

export default function TermsOfUsePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-canvas via-primary-soft/30 to-canvas">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:py-hero">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-overline text-primary tracking-[0.12em]">Legal</span>
            <h1 className="text-[clamp(1.75rem,4vw,3rem)] font-display text-ink-deep leading-[1.08] tracking-[-0.02em] mt-2 mb-4">
              Terms of Use
            </h1>
            <p className="text-body text-slate/70">Last updated: July 2026</p>
            <p className="text-body-large text-slate/80 leading-relaxed mt-4">
              Please read these terms carefully before using the Growarth Capita website or services.
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
