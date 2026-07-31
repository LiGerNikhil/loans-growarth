import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/dashboard";
import { can } from "@/lib/permissions";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/admin/login");
  if (!can(ctx.role, "access_reports")) redirect("/admin/dashboard");

  return <ReportsClient role={ctx.role} />;
}
