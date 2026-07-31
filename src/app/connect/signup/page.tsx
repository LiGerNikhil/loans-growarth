"use client";

import { useActionState } from "react";
import { ChevronDown, Handshake, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { signupConnector, type SignupConnectorResult } from "@/actions/connector/signupConnector";

const NETWORK_TYPES = [
  "Shopkeeper",
  "Insurance Agent",
  "CA/Accountant",
  "Real Estate Broker",
  "Individual",
  "Other",
] as const;

function FieldError({ field, fieldErrors }: { field: string; fieldErrors?: Record<string, string[]> }) {
  const messages = fieldErrors?.[field];
  return (
    <div className="min-h-[1.25rem]">
      {messages?.map((m, i) => (
        <p key={i} className="text-caption text-critical-strong mt-0.5">{m}</p>
      ))}
    </div>
  );
}

const inputBase =
  "h-11 w-full rounded-lg border bg-canvas px-3 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:ring-3";

const inputNormal =
  "border-hairline focus-visible:border-primary focus-visible:ring-primary/20";

function inputClass(error?: boolean) {
  return error
    ? `${inputBase} border-critical focus-visible:border-critical focus-visible:ring-critical/20`
    : `${inputBase} ${inputNormal}`;
}

function FormField({ label, id, error, children }: { label: string; id: string; error?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-caption text-ink mb-0.5 block font-accent">{label}</label>
      {children}
    </div>
  );
}

export default function ConnectorSignupPage() {
  const [state, formAction, pending] = useActionState<SignupConnectorResult | null, FormData>(signupConnector, null);
  const fieldErrors = state && !state.success ? state.fieldErrors : undefined;

  return (
    <div className="flex min-h-svh flex-col bg-surface-soft sm:min-h-screen">
      {/* Top brand bar — always visible */}
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
          <div className="ml-auto hidden sm:block">
            <Link
              href="/connect/login"
              className="inline-flex h-9 items-center rounded-full border border-white/20 px-4 text-caption text-on-primary/80 transition-colors hover:border-white/40 hover:text-on-primary"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Back link — mobile only */}
      <div className="px-4 pt-4 sm:hidden">
        <Link href="/connector-business" className="inline-flex items-center gap-1 text-caption text-slate hover:text-ink transition-colors">
          <ArrowLeft className="size-3.5" /> Back
        </Link>
      </div>

      {/* Form card */}
      <div className="flex flex-1 items-start justify-center px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-10">
        <div className="w-full max-w-[500px]">
          <div className="rounded-2xl bg-canvas p-5 shadow-elevation-sm ring-1 ring-hairline-soft sm:p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-heading-3 font-heading text-ink-deep">Partner with Us</h2>
              <p className="mt-1 text-body text-slate leading-relaxed">
                Fill in your details to become a Loan Connector Partner and start earning commissions.
              </p>
            </div>

            <form action={formAction} className="flex flex-col gap-4">
              {state && !state.success && state.error && !state.fieldErrors && (
                <div className="rounded-lg bg-critical/10 px-3 py-2 text-body-small text-critical-strong">
                  {state.error}
                </div>
              )}

              {/* Row: Name + Mobile */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Full Name" id="name" error={!!fieldErrors?.name}>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Rajesh Sharma"
                    autoComplete="name"
                    className={inputClass(!!fieldErrors?.name)}
                  />
                  <FieldError field="name" fieldErrors={fieldErrors} />
                </FormField>

                <FormField label="Mobile Number" id="mobile" error={!!fieldErrors?.mobile}>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    placeholder="9876543210"
                    autoComplete="tel"
                    className={inputClass(!!fieldErrors?.mobile)}
                  />
                  <FieldError field="mobile" fieldErrors={fieldErrors} />
                </FormField>
              </div>

              {/* Row: Email + City */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Email Address" id="email" error={!!fieldErrors?.email}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="rajesh@example.com"
                    autoComplete="email"
                    className={inputClass(!!fieldErrors?.email)}
                  />
                  <FieldError field="email" fieldErrors={fieldErrors} />
                </FormField>

                <FormField label="City / Area" id="city" error={!!fieldErrors?.city}>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Noida, Sector 62"
                    autoComplete="address-level2"
                    className={inputClass(!!fieldErrors?.city)}
                  />
                  <FieldError field="city" fieldErrors={fieldErrors} />
                </FormField>
              </div>

              {/* Network Type */}
              <FormField label="Occupation / Network Type" id="networkType" error={!!fieldErrors?.networkType}>
                <div className={inputClass(!!fieldErrors?.networkType) + " relative"}>
                  <select
                    id="networkType"
                    name="networkType"
                    defaultValue=""
                    className="h-full w-full appearance-none bg-transparent pr-6 outline-none"
                  >
                    <option value="" disabled>Select your occupation</option>
                    {NETWORK_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-steel" />
                </div>
                <FieldError field="networkType" fieldErrors={fieldErrors} />
              </FormField>

              <button
                type="submit"
                disabled={pending}
                className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary text-button text-on-primary transition-all active:bg-primary-deep disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? "Submitting..." : "Submit Application"}
              </button>

              <p className="text-caption text-slate text-center">
                Already registered?{" "}
                <Link href="/connect/login" className="text-primary hover:text-primary-deep transition-colors font-accent">
                  Sign in
                </Link>
              </p>
            </form>
          </div>

          <p className="mt-4 text-center text-caption text-slate/60">
            &copy; {new Date().getFullYear()} Growarth Capita Consultants LLP
          </p>
        </div>
      </div>
    </div>
  );
}
