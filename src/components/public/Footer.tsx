import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12s.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

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

const SOCIAL_LINKS = [
  { icon: FacebookIcon, label: "Facebook", href: "https://facebook.com" },
  { icon: InstagramIcon, label: "Instagram", href: "https://instagram.com" },
  { icon: LinkedinIcon, label: "LinkedIn", href: "https://linkedin.com" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink-deep text-white">
      {/* Subtle primary glow at the top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,_var(--primary)_0%,_transparent_55%)] opacity-25" />

      <div className="relative mx-auto max-w-7xl px-6 py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 inline-flex rounded-lg bg-white p-2">
              <Image src="/images/icons/logo.png" alt="Growarth Capita" width={160} height={45} className="h-8 w-auto" />
            </div>
            <p className="text-sm leading-relaxed text-white/60">
              Your trusted partner for tailored loan solutions. Fast, transparent, and expert-driven financial guidance.
            </p>

            <ul className="mt-5 space-y-2.5">
              <li className="flex items-center gap-2.5 text-sm text-white/70">
                <MapPin className="size-4 shrink-0 text-primary" />
                Noida, Uttar Pradesh, India
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/70">
                <Mail className="size-4 shrink-0 text-primary" />
                info@growarthcapita.com
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/70">
                <Phone className="size-4 shrink-0 text-primary" />
                +91 98XXXXXXXX
              </li>
            </ul>

            <div className="mt-5 flex items-center gap-2.5">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-primary hover:bg-primary hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Loan Products */}
          <div>
            <h4 className="text-caption font-accent uppercase tracking-wider text-primary mb-4">
              Loan Products
            </h4>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
                  >
                    <span className="size-1.5 rounded-full bg-primary/60 transition-colors group-hover:bg-primary" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-caption font-accent uppercase tracking-wider text-primary mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
                  >
                    <span className="size-1.5 rounded-full bg-primary/60 transition-colors group-hover:bg-primary" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connector CTA */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="size-5 text-primary" />
              <h3 className="text-label font-accent text-white">Earn Commissions</h3>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Refer loan leads from your network. We handle the rest. You earn a share of every disbursal.
            </p>
            <Link
              href="/connector-business"
              className="group inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-button text-on-primary transition-all hover:bg-primary-deep active:bg-primary-deep"
            >
              Become a Connector
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/45">
            &copy; {new Date().getFullYear()} Growarth Capita Consultants LLP. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="text-xs text-white/45 transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms-of-use" className="text-xs text-white/45 transition-colors hover:text-white">
              Terms of Use
            </Link>
            <Link href="/admin/login" className="text-xs text-white/45 transition-colors hover:text-white">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
