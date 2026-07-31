import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import ChangePasswordForm from "./ChangePasswordForm";
import AuditLogClient from "./AuditLogClient";

export default async function SettingsPage() {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/admin/login");
  if (!can(ctx.role, "view_audit_logs")) redirect("/admin/dashboard");

  return (
    <div className="p-section-sm lg:p-section">
      <div className="mb-8">
        <h1 className="text-heading-3 font-heading text-ink-deep">Settings</h1>
        <p className="mt-1 text-body text-slate">Manage your account and view audit logs</p>
      </div>
      <div className="space-y-6">
        <ChangePasswordForm />
        <AuditLogClient />
      </div>
    </div>
  );
}
