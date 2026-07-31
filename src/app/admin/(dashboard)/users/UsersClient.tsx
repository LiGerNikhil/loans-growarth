"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, UserCheck, UserX, Shield, Mail, UserPlus } from "lucide-react";

const ROLES = ["AGENT", "MANAGER", "SUPER_ADMIN"] as const;

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

interface FormData {
  _id?: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  password: string;
}

export default function UsersClient() {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function openEdit(user: UserData) {
    setEditing({ _id: user._id, name: user.name, email: user.email, role: user.role, active: user.active, password: "" });
    setError("");
  }

  function closeForm() {
    setEditing(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");

    try {
      const isNew = !editing._id;
      const url = "/api/users";
      const method = isNew ? "POST" : "PATCH";
      const body = isNew ? editing : { _id: editing._id, name: editing.name, email: editing.email, role: editing.role, active: editing.active };

      if (!isNew && editing.password) {
        (body as any).password = editing.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save user");
      }

      closeForm();
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(user: UserData) {
    if (user._id === "current") return;
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: user._id, active: !user.active }),
      });
      if (res.ok) fetchUsers();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-section-sm lg:p-section">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-heading-3 font-heading text-ink-deep">Users</h1>
        <button
          onClick={() => router.push("/admin/users/new")}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-button text-on-primary transition-all active:bg-primary-deep"
        >
          <Plus className="size-3.5" />
          Add User
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-hairline-soft bg-canvas shadow-elevation-xs">
        <table className="w-full">
          <thead>
            <tr className="border-b border-hairline-soft">
              {["Name", "Email", "Role", "Status", "Created", ""].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-caption text-steel font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-body text-slate">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-body text-slate">No users found</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="border-b border-hairline-soft last:border-b-0 transition-colors hover:bg-primary-soft/40">
                  <td className="whitespace-nowrap px-4 py-3 text-body text-ink-deep font-accent">{u.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-body text-slate">{u.email}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-flex h-5 items-center rounded-full px-2 py-0.5 text-caption font-medium ${
                      u.role === "SUPER_ADMIN" ? "bg-charcoal/20 text-charcoal" :
                      u.role === "MANAGER" ? "bg-primary-soft text-primary" :
                      "bg-surface-soft text-slate border border-hairline-soft"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`inline-flex h-5 items-center rounded-full px-2 py-0.5 text-caption font-medium ${
                      u.active ? "bg-success text-canvas" : "bg-critical text-canvas"
                    }`}>
                      {u.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-body text-slate">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-caption text-primary hover:text-primary-deep transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeactivate(u)}
                        disabled={saving}
                        className={`inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-caption transition-all disabled:opacity-50 ${
                          u.active
                            ? "bg-critical/10 text-critical hover:bg-critical/20"
                            : "bg-success/10 text-success hover:bg-success/20"
                        }`}
                      >
                        {u.active ? <UserX className="size-3" /> : <UserCheck className="size-3" />}
                        {u.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal — horizontal label layout */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-deep/30 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-xl bg-canvas shadow-elevation-lg">
            <div className="relative px-6 pb-4 pt-5">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/60 to-primary" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <UserPlus className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-heading-5 font-heading text-ink-deep">
                      Edit User
                    </h2>
                    <p className="text-caption text-slate">
                      Update user details and permissions
                    </p>
                  </div>
                </div>
                <button onClick={closeForm} className="flex size-8 items-center justify-center rounded-lg text-steel transition-colors hover:bg-surface-soft hover:text-ink">
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-y-5 border-t border-hairline-soft px-6 py-6">
                <div className="flex items-center gap-4">
                  <label htmlFor="name" className="flex w-28 shrink-0 items-center gap-1.5 text-body font-accent text-ink">
                    <UserPlus className="size-3.5 text-steel" />
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    required
                    className="h-10 flex-1 rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                    placeholder="John Doe"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label htmlFor="email" className="flex w-28 shrink-0 items-center gap-1.5 text-body font-accent text-ink">
                    <Mail className="size-3.5 text-steel" />
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={editing.email}
                    onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                    required
                    className="h-10 flex-1 rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                    placeholder="john@growarth.com"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label htmlFor="password" className="flex w-28 shrink-0 items-center gap-1.5 text-body font-accent text-ink">
                    <Shield className="size-3.5 text-steel" />
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={editing.password}
                    onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                    required={!editing._id}
                    minLength={8}
                    className="h-10 flex-1 rounded-lg border border-hairline-soft bg-canvas px-3 text-body text-ink placeholder:text-stone outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
                    placeholder={editing._id ? "Leave blank to keep current" : "Min 8 characters"}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label htmlFor="role" className="flex w-28 shrink-0 items-center gap-1.5 text-body font-accent text-ink">
                    <Shield className="size-3.5 text-steel" />
                    Role
                  </label>
                  <div className="relative flex-1">
                    <select
                      id="role"
                      value={editing.role}
                      onChange={(e) => setEditing({ ...editing, role: e.target.value })}
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
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex w-28 shrink-0 items-center gap-1.5 text-body font-accent text-ink">
                    <Shield className="size-3.5 text-steel" />
                    Status
                  </span>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-hairline-soft px-3.5 py-2 transition-colors hover:bg-surface-soft has-checked:border-primary has-checked:bg-primary-soft/50">
                    <div className="relative flex items-center">
                      <input
                        id="active"
                        type="checkbox"
                        checked={editing.active}
                        onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-9 rounded-full border border-hairline bg-surface-soft transition-colors peer-checked:border-primary peer-checked:bg-primary" />
                      <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-canvas shadow-elevation-xs transition-transform peer-checked:translate-x-4" />
                    </div>
                    <div>
                      <p className="text-body font-accent text-ink">{editing.active ? "Active" : "Inactive"}</p>
                      <p className="text-caption text-slate">{editing.active ? "Can sign in to the CRM" : "Account is disabled"}</p>
                    </div>
                  </label>
                </div>
              </div>

              {error && (
                <div className="mx-6 mb-4 rounded-lg bg-critical/10 px-4 py-2.5">
                  <p className="text-caption text-critical-strong flex items-center gap-1.5">
                    <span className="inline-block size-1.5 rounded-full bg-critical" />
                    {error}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 border-t border-hairline-soft px-6 py-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="inline-flex h-9 items-center rounded-lg border border-hairline-soft bg-canvas px-4 text-button text-slate transition-colors hover:bg-surface-soft hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-5 text-button text-on-primary transition-all active:bg-primary-deep disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
