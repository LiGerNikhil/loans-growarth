import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/admin/login");
  if (!can(ctx.role, "manage_users")) redirect("/admin/dashboard");

  return <UsersClient />;
}
