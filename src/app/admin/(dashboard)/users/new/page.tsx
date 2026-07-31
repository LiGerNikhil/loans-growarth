import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import UserForm from "@/components/admin/UserForm";

export default async function NewUserPage() {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/admin/login");
  if (!can(ctx.role, "manage_users")) redirect("/admin/dashboard");

  return (
    <div className="p-section-sm lg:p-section">
      <UserForm />
    </div>
  );
}
