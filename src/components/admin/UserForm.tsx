"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Shield, Mail, ArrowLeft, Check, X } from "lucide-react";

const ROLES = ["AGENT", "MANAGER", "SUPER_ADMIN"] as const;

interface FormData {
  name: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
}

const emptyForm: FormData = { name: "", email: "", password: "", role: "AGENT", active: true };

export default function UserForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
        }
        throw new Error(data.error || "Failed to create user");
      }

      router.push("/admin/users");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        type="button"
        onClick={() => router.push("/admin/users")}
        className="mb-6 inline-flex items-center gap-1.5 text-body text-slate transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to Users
      </button>

      <div className="overflow-hidden rounded-xl bg-canvas shadow-elevation-sm ring-1 ring-hairline-soft">
        <div className="relative px-8 pb-5 pt-6">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/60 to-primary" />
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h1 className="text-heading-4 font-heading text-ink-deep">Create User</h1>
              <p className="text-body text-slate">Add a new team member to the CRM</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="border-t border-hairline-soft px-8 py-6">
            <div className="space-y-5">
              <div className="grid grid-cols-[8rem_1fr] items-center gap-x-4 gap-y-1">
                <label htmlFor="name" className="text-body font-accent text-ink">
                  Full Name
                </label>
                <div>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="h-10 w-full rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                    placeholder="John Doe"
                  />
                </div>

                <label htmlFor="email" className="text-body font-accent text-ink">
                  Email
                </label>
                <div>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="h-10 w-full rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                    placeholder="john@growarth.com"
                  />
                </div>

                <label htmlFor="password" className="text-body font-accent text-ink">
                  Password
                </label>
                <div>
                  <input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={8}
                    className="h-10 w-full rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                    placeholder="Min 8 characters"
                  />
                </div>

                <label htmlFor="role" className="text-body font-accent text-ink">
                  Role
                </label>
                <div className="relative">
                  <select
                    id="role"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="h-10 w-full appearance-none rounded-lg border border-hairline-soft bg-canvas px-3 pr-8 text-body text-ink outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-steel" viewBox="0 0 12 12" fill="none">
                    <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <label className="text-body font-accent text-ink">
                  Status
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-hairline-soft px-3.5 py-2 transition-colors hover:bg-surface-soft has-checked:border-primary has-checked:bg-primary-soft/50">
                  <div className="relative flex items-center">
                    <input
                      id="active"
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      className="peer sr-only"
                    />
                    <div className="h-5 w-9 rounded-full border border-hairline bg-surface-soft transition-colors peer-checked:border-primary peer-checked:bg-primary" />
                    <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-canvas shadow-elevation-xs transition-transform peer-checked:translate-x-4" />
                  </div>
                  <div>
                    <p className="text-body font-accent text-ink">{form.active ? "Active" : "Inactive"}</p>
                    <p className="text-caption text-slate">{form.active ? "Can sign in to the CRM" : "Account is disabled"}</p>
                  </div>
                </label>
              </div>
            </div>

            {fieldErrors && Object.keys(fieldErrors).length > 0 && (
              <div className="mt-4 rounded-lg bg-critical/10 px-4 py-3">
                {Object.entries(fieldErrors).map(([field, msgs]) => (
                  <p key={field} className="text-caption text-critical-strong flex items-center gap-1.5">
                    <X className="size-3 shrink-0" />
                    {msgs.join(", ")}
                  </p>
                ))}
              </div>
            )}

            {error && !Object.keys(fieldErrors).length && (
              <div className="mt-4 rounded-lg bg-critical/10 px-4 py-2.5">
                <p className="text-caption text-critical-strong flex items-center gap-1.5">
                  <span className="inline-block size-1.5 shrink-0 rounded-full bg-critical" />
                  {error}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-hairline-soft px-8 py-4">
            <button
              type="button"
              onClick={() => router.push("/admin/users")}
              className="inline-flex h-9 items-center rounded-lg border border-hairline-soft bg-canvas px-4 text-button text-slate transition-colors hover:bg-surface-soft hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-5 text-button text-on-primary transition-all active:bg-primary-deep disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
