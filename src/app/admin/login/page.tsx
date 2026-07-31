"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error === "TOO_MANY_ATTEMPTS") {
        setError("Too many attempts. Please try again later.");
        return;
      }

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* ── Left: Brand Panel ── */}
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

      {/* ── Right: Login Panel ── */}
      <div className="flex min-h-screen flex-1 items-center justify-center bg-surface-soft px-6 py-12">
        <div className="w-full max-w-[450px]">
          {/* Mobile brand */}
          <div className="mb-8 lg:hidden">
            <h1 className="text-heading-4 font-heading text-ink-deep">
              Growarth<span className="text-primary"> Capita</span>
            </h1>
            <p className="mt-1 text-body text-slate">CRM Portal</p>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-heading-3 font-heading text-ink-deep mb-1.5">
              Welcome back
            </h2>
            <p className="text-body text-slate">
              Sign in to your CRM account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-label text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-11 w-full rounded-xl border bg-canvas px-3.5 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:ring-3 ${
                  error && !email
                    ? "border-critical focus-visible:border-critical focus-visible:ring-critical/20"
                    : "border-hairline focus-visible:border-primary focus-visible:ring-primary/20"
                }`}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-label text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-11 w-full rounded-xl border bg-canvas px-3.5 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:ring-3 ${
                  error && !password
                    ? "border-critical focus-visible:border-critical focus-visible:ring-critical/20"
                    : "border-hairline focus-visible:border-primary focus-visible:ring-primary/20"
                }`}
                placeholder="\u2022 \u2022 \u2022 \u2022 \u2022 \u2022 \u2022 \u2022"
                autoComplete="current-password"
              />
            </div>

            {/* Options row */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="size-4 rounded border-hairline text-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                />
                <span className="text-body text-ink">Remember me</span>
              </label>
              <button
                type="button"
                className="text-body text-primary hover:text-primary-deep transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-critical/10 px-4 py-3">
                <p className="text-body-small text-critical-strong flex items-center gap-2">
                  <span className="inline-block size-1.5 rounded-full bg-critical shrink-0" />
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-button-large text-on-primary transition-all active:bg-primary-deep disabled:opacity-50"
            >
              {loading ? "Signing in\u2026" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
