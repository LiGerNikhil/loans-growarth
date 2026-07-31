import Link from "next/link";
import { Handshake, Mail } from "lucide-react";

export default function SignupConfirmationPage() {
  return (
    <div className="flex min-h-svh flex-col bg-surface-soft sm:min-h-screen">
      {/* Top brand bar — matches signup page */}
      <div className="bg-ink-deep px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
            <Handshake className="size-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-heading-5 font-heading text-on-primary">
              Growarth<span className="text-primary"> Capita</span>
            </h1>
            <p className="truncate text-caption text-on-primary/60">Connector Partner Signup</p>
          </div>
        </div>
      </div>

      {/* Confirmation card */}
      <div className="flex flex-1 items-center justify-center px-4 pb-12 pt-10 sm:px-6 sm:pb-16">
        <div className="w-full max-w-[420px]">
          <div className="rounded-2xl bg-canvas px-6 pb-8 pt-8 text-center shadow-elevation-sm ring-1 ring-hairline-soft sm:px-10 sm:pb-10 sm:pt-10">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-success/10 sm:size-16">
              <svg className="size-7 text-success sm:size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>

            <h1 className="text-heading-4 font-heading text-ink-deep sm:text-heading-3">
              Application Received!
            </h1>
            <p className="mt-2 text-body text-slate leading-relaxed">
              Thank you for registering as a Connector Partner.
            </p>

            <div className="mx-auto mt-6 flex items-start gap-3 rounded-xl bg-surface-soft/70 px-4 py-3.5 text-left ring-1 ring-hairline-soft">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-body-small text-slate leading-relaxed">
                We&rsquo;ll review your application and get back to you within <strong>24 hours</strong>. You&rsquo;ll receive a confirmation email once approved.
              </p>
            </div>

            <div className="mt-7 flex flex-col-reverse items-center gap-2.5 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="inline-flex h-11 w-full items-center justify-center rounded-full border border-hairline-soft px-6 text-button text-slate transition-colors hover:border-primary hover:text-primary sm:w-auto"
              >
                Back to Home
              </Link>
              <Link
                href="/connect/login"
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-button text-on-primary transition-all active:bg-primary-deep sm:w-auto"
              >
                Go to Login
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-caption text-slate/50">
            &copy; {new Date().getFullYear()} Growarth Capita Consultants LLP
          </p>
        </div>
      </div>
    </div>
  );
}
