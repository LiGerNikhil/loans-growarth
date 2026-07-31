"use client";

import { useActionState } from "react";
import { ChevronDown } from "lucide-react";
import { submitLead, type SubmitLeadResult } from "@/actions/submitLead";

const LOAN_TYPES = [
  "Personal Loan",
  "Business Loan",
  "Loan Against Property",
  "Overdraft Facility",
  "Home Loan",
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

export default function LeadForm() {
  const [state, formAction, pending] = useActionState<SubmitLeadResult | null, FormData>(submitLead, null);
  const fieldErrors = state && !state.success ? state.fieldErrors : undefined;

  return (
    <div className="rounded-xl bg-surface-soft p-5 shadow-elevation-sm ring-1 ring-hairline-soft">
      <h2 className="text-heading-5 font-heading text-ink-deep mb-0.5">
        Request Callback
      </h2>
      <p className="text-body-small text-slate mb-4">
        Fill in your details and our team will get back to you.
      </p>

      <form action={formAction} className="flex flex-col gap-3">
        {state && !state.success && state.error && !state.fieldErrors && (
          <div className="rounded-lg bg-critical/10 px-3 py-2 text-body-small text-critical-strong">
            {state.error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="text-caption text-ink mb-0.5 block font-accent">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Rajesh Sharma"
            autoComplete="name"
            className={inputClass(!!fieldErrors?.name)}
          />
          <FieldError field="name" fieldErrors={fieldErrors} />
        </div>

        <div>
          <label htmlFor="mobile" className="text-caption text-ink mb-0.5 block font-accent">
            Mobile Number
          </label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            placeholder="e.g. 9876543210"
            autoComplete="tel"
            className={inputClass(!!fieldErrors?.mobile)}
          />
          <FieldError field="mobile" fieldErrors={fieldErrors} />
        </div>

        <div>
          <label htmlFor="email" className="text-caption text-ink mb-0.5 block font-accent">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="e.g. rajesh@example.com"
            autoComplete="email"
            className={inputClass(!!fieldErrors?.email)}
          />
          <FieldError field="email" fieldErrors={fieldErrors} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="monthlySalary" className="text-caption text-ink mb-0.5 block font-accent">
              Salary (₹)
            </label>
            <input
              id="monthlySalary"
              name="monthlySalary"
              type="number"
              placeholder="50000"
              className={inputClass(!!fieldErrors?.monthlySalary)}
            />
            <FieldError field="monthlySalary" fieldErrors={fieldErrors} />
          </div>
          <div>
            <label htmlFor="loanAmount" className="text-caption text-ink mb-0.5 block font-accent">
              Loan (₹)
            </label>
            <input
              id="loanAmount"
              name="loanAmount"
              type="number"
              placeholder="500000"
              className={inputClass(!!fieldErrors?.loanAmount)}
            />
            <FieldError field="loanAmount" fieldErrors={fieldErrors} />
          </div>
        </div>

        <div>
          <label htmlFor="loanType" className="text-caption text-ink mb-0.5 block font-accent">
            Loan Type
          </label>
          <div className="relative">
            <select
              id="loanType"
              name="loanType"
              className={`${inputClass(!!fieldErrors?.loanType)} appearance-none cursor-pointer pr-9`}
            >
              <option value="">Select loan type</option>
              {LOAN_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-steel" />
          </div>
          <FieldError field="loanType" fieldErrors={fieldErrors} />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-full bg-primary text-button text-on-primary transition-all active:bg-primary-deep disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Submitting..." : "Request Callback"}
        </button>
      </form>
    </div>
  );
}
