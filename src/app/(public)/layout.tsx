import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import RefTracker from "@/components/public/RefTracker";
import { SITE_NAME, SITE_URL, SITE_NAME_FULL, SITE_DESCRIPTION, ORG_ADDRESS, ORG_CONTACT } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Personal Loan | Business Loan | LAP | Growarth Capita",
  description: SITE_DESCRIPTION,
  keywords: [
    "Growarth Capita",
    "Growarth Capita Consultants LLP",
    "best loan agency",
    "connector business",
    "personal loan Noida",
    "business loan India",
    "loan against property",
    "overdraft facility",
    "loan DSA partner",
  ],
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: SITE_NAME_FULL,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: SITE_DESCRIPTION,
    foundingDate: "2015",
    address: {
      "@type": "PostalAddress",
      streetAddress: ORG_ADDRESS.street,
      addressLocality: ORG_ADDRESS.city,
      addressRegion: ORG_ADDRESS.state,
      addressCountry: ORG_ADDRESS.country,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: ORG_CONTACT.phone,
        contactType: "customer service",
        email: ORG_CONTACT.email,
        availableLanguage: ["English", "Hindi"],
      },
    ],
    sameAs: [
      SITE_URL,
    ],
    makesOffer: [
      { "@type": "Offer", name: "Personal Loan" },
      { "@type": "Offer", name: "Business Loan" },
      { "@type": "Offer", name: "Loan Against Property" },
      { "@type": "Offer", name: "Overdraft Facility" },
      { "@type": "Offer", name: "Home Loan" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RefTracker />
      <Header />
      <main className="flex flex-1 flex-col bg-canvas">{children}</main>
      <Footer />
    </>
  );
}
