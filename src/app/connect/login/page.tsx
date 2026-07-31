"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConnectorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/connect/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSentTo(email);
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/connect/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid OTP");
        return;
      }

      router.push(data.redirect || "/connect/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setStep("email");
    setOtp("");
    setError("");
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left: Brand Panel */}
      <div className="relative hidden items-center justify-center bg-ink-deep px-16 py-16 lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary)_0%,_transparent_60%)] opacity-20" />
        <div className="relative w-full max-w-md">
          <h1 className="mb-3 whitespace-nowrap text-heading-2 font-heading text-on-primary">
            Growarth<span className="text-primary"> Capita</span>
          </h1>
        </div>
        <span className="absolute bottom-6 left-16 text-caption text-steel/30">
          &copy; {new Date().getFullYear()} Growarth Capita Consultants LLP
        </span>
      </div>

      {/* Right: Login Panel */}
      <div className="flex min-h-screen flex-1 items-center justify-center bg-surface-soft px-6 py-12">
        <div className="w-full max-w-[450px]">
          {/* Mobile brand */}
          <div className="mb-8 lg:hidden">
            <h1 className="text-heading-4 font-heading text-ink-deep">
              Growarth<span className="text-primary"> Capita</span>
            </h1>
            <p className="mt-1 text-body text-slate">Connector Portal</p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-heading-3 font-heading text-ink-deep mb-1.5">
              {step === "email" ? "Connector Login" : "Enter OTP"}
            </h2>
            <p className="text-body text-slate">
              {step === "email"
                ? "Sign in with your registered email address"
                : `Enter the 6-digit code sent to ${sentTo}`}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl bg-critical/10 px-4 py-3">
              <p className="text-body-small text-critical-strong flex items-center gap-2">
                <span className="inline-block size-1.5 rounded-full bg-critical shrink-0" />
                {error}
              </p>
            </div>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={requestOtp} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-label text-ink">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-11 w-full rounded-xl border bg-canvas px-3.5 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:ring-3 ${
                    error
                      ? "border-critical focus-visible:border-critical focus-visible:ring-critical/20"
                      : "border-hairline focus-visible:border-primary focus-visible:ring-primary/20"
                  }`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email.includes("@")}
                className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-button-large text-on-primary transition-all active:bg-primary-deep disabled:opacity-50"
              >
                {loading ? "Sending OTP\u2026" : "Send OTP"}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={verifyOtp} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="otp" className="text-label text-ink">
                  6-Digit OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className={`h-11 w-full rounded-xl border bg-canvas px-3.5 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:ring-3 ${
                    error
                      ? "border-critical focus-visible:border-critical focus-visible:ring-critical/20"
                      : "border-hairline focus-visible:border-primary focus-visible:ring-primary/20"
                  }`}
                  placeholder="Enter OTP"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-button-large text-on-primary transition-all active:bg-primary-deep disabled:opacity-50"
              >
                {loading ? "Verifying\u2026" : "Verify & Sign In"}
              </button>

              <button
                type="button"
                onClick={goBack}
                className="text-body text-slate hover:text-ink transition-colors self-center"
              >
                Change email address
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
