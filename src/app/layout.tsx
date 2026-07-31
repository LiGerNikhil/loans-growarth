import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { SITE_NAME, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_URL } from "@/lib/seo";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Best Loan Agency & Connector Business`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Best Loan Agency & Connector Business`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  icons: {
    icon: "/images/icons/logo.png",
    shortcut: "/favicon.ico",
    apple: "/images/icons/logo.png",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Best Loan Agency & Connector Business`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <head>
        <meta name="geo.region" content="IN-UP" />
        <meta name="geo.placename" content="Noida" />
        <meta name="geo.position" content="28.5885;77.3085" />
        <meta name="ICBM" content="28.5885, 77.3085" />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
