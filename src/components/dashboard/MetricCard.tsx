import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
}

export default function MetricCard({ label, value, icon }: MetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-hairline-soft bg-canvas p-xl shadow-elevation-xs transition-shadow hover:shadow-elevation-md">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/60 to-primary" />
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-caption text-steel">{label}</p>
          <p className="text-heading-3 font-heading text-ink-deep">{value}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
