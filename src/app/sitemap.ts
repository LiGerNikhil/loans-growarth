import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;

  const pages = [
    { path: "/", priority: 1.0, changeFreq: "weekly" as const },
    { path: "/about", priority: 0.8, changeFreq: "monthly" as const },
    { path: "/contact", priority: 0.8, changeFreq: "monthly" as const },
    { path: "/connector-business", priority: 0.9, changeFreq: "monthly" as const },
    { path: "/personal-loan", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/business-loan", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/loan-against-property", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/overdraft-facility", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/privacy-policy", priority: 0.3, changeFreq: "yearly" as const },
    { path: "/terms-of-use", priority: 0.3, changeFreq: "yearly" as const },
    { path: "/data-security", priority: 0.5, changeFreq: "monthly" as const },
  ];

  return pages.map(({ path, priority, changeFreq }) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: changeFreq,
    priority,
  }));
}
