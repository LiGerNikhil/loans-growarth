import { redirect } from "next/navigation";
import { Users, UserPlus, CalendarDays, CalendarCheck, CheckCircle2, XCircle } from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import { getDashboardMetrics, getAuthContext } from "@/lib/dashboard";

export default async function DashboardPage() {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/admin/login");

  const metrics = await getDashboardMetrics(ctx.role, ctx.userId);

  return (
    <div className="p-section-sm lg:p-section">
      <div className="mb-8">
        <h1 className="text-heading-3 font-heading text-ink-deep">Dashboard</h1>
        <p className="text-body text-slate mt-1">
          Welcome back, {ctx.name}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Leads" value={metrics.totalLeads} icon={<Users className="size-5" />} />
        <MetricCard label="Today's Leads" value={metrics.todayLeads} icon={<UserPlus className="size-5" />} />
        <MetricCard label="This Week" value={metrics.weekLeads} icon={<CalendarDays className="size-5" />} />
        <MetricCard label="This Month" value={metrics.monthLeads} icon={<CalendarCheck className="size-5" />} />
        <MetricCard label="Approved" value={metrics.approvedLeads} icon={<CheckCircle2 className="size-5" />} />
        <MetricCard label="Rejected" value={metrics.rejectedLeads} icon={<XCircle className="size-5" />} />
      </div>

      <div className="mt-6">
        <DashboardCharts initialData={metrics} />
      </div>
    </div>
  );
}
