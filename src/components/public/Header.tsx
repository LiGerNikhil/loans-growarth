"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";

const NAV_LINKS = [
  { label: "Personal Loan", href: "/personal-loan" },
  { label: "Business Loan", href: "/business-loan" },
  { label: "Loan Against Property", href: "/loan-against-property" },
  { label: "Overdraft Facility", href: "/overdraft-facility" },
  { label: "Connector", href: "/connector-business" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline-soft bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          <Image src="/images/icons/logo.png" alt="Growarth Capita" width={350} height={100} className="h-20 w-auto" priority />
        </Link>

        {/* Desktop nav — hidden below 1024px */}
        <nav className="hidden lg:flex lg:items-center lg:gap-4 xl:gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-label text-slate transition-colors hover:text-ink"
            >
              {link.label === "Loan Against Property" ? (
                <><span className="hidden xl:inline">Loan Against Property</span><span className="xl:hidden">LAP</span></>
              ) : (
                link.label
              )}
            </Link>
          ))}
          <div className="flex items-center gap-2 xl:gap-3">
            <Link
              href="/connect/login"
              className="inline-flex h-9 items-center justify-center rounded-full border border-hairline-soft px-4 text-caption text-slate transition-colors hover:border-primary hover:text-primary"
            >
              Connector Login
            </Link>
            <Link
              href="/#lead-form"
              className="inline-flex h-9 items-center justify-center rounded-full bg-ink-deep px-5 text-caption text-ink-button transition-all active:bg-ink-deep/90"
            >
              Apply Now
            </Link>
          </div>
        </nav>

        {/* Hamburger — visible below 1024px */}
        <button
          onClick={() => setOpen(!open)}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-ink lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out lg:hidden ${
          open ? "max-h-[32rem] border-t border-hairline-soft" : "max-h-0"
        }`}
      >
        <div className="px-4 pb-6 pt-4 sm:px-6">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-body text-slate transition-colors hover:bg-surface-soft hover:text-ink"
              >
                {link.label}
                <ChevronDown className="ml-auto size-3.5 -rotate-90 text-steel" />
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-hairline-soft pt-4">
            <Link
              href="/connect/login"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-full items-center justify-center rounded-full border border-hairline-soft text-button text-slate transition-colors hover:border-primary hover:text-primary"
            >
              Connector Login
            </Link>
            <Link
              href="/#lead-form"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-ink-deep text-button text-ink-button transition-all active:bg-ink-deep/90"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
