import Link from "next/link";
import Image from "next/image";

const PRODUCT_LINKS = [
  { label: "Personal Loan", href: "/personal-loan" },
  { label: "Business Loan", href: "/business-loan" },
  { label: "Loan Against Property", href: "/loan-against-property" },
  { label: "Overdraft Facility", href: "/overdraft-facility" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Connector Business", href: "/connector-business" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms-of-use" },
  { label: "Data Security", href: "/data-security" },
];

export default function Footer() {
  return (
    <footer className="border-t border-hairline-soft bg-surface-soft">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-section">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image src="/images/icons/logo.png" alt="Growarth Capita" width={400} height={112} className="h-20 w-auto mb-3" />
            <p className="text-body text-slate/80">
              Your trusted partner for tailored loan solutions. Fast, transparent, and expert-driven financial guidance.
            </p>
          </div>

          <div>
            <h4 className="text-label text-charcoal mb-3">Loan Products</h4>
            <ul className="flex flex-col gap-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body text-slate hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-label text-charcoal mb-3">Company</h4>
            <ul className="flex flex-col gap-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-body text-slate hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-primary-soft to-primary-soft/40 p-5 text-center ring-1 ring-hairline-soft">
            <h3 className="text-label font-accent text-ink-deep mb-0.5">
              Earn Commissions
            </h3>
            <p className="text-body-small text-slate/70 mb-3 leading-relaxed">
              Refer loan leads from your network. We handle the rest. You earn a share of every disbursal.
            </p>
            <Link
              href="/connector-business"
              className="inline-flex h-11 items-center justify-center gap-1 rounded-full bg-ink-deep px-4 text-button text-ink-button transition-all active:bg-ink-deep/90"
            >
              Become a Connector <span className="text-primary text-sm leading-none ml-0.5">&rarr;</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-hairline-soft pt-6 lg:mt-section-sm">
          <p className="text-body-small text-stone text-center">
            &copy; {new Date().getFullYear()} Growarth Capita. All rights
            reserved.
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <Link
              href="/admin/login"
              className="text-caption text-stone hover:text-slate transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
