import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface PanelProps {
  children: ReactNode;
  className?: string;
}

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail?: string;
  tone?: "blue" | "teal" | "amber" | "red" | "slate" | "green";
}

const iconToneClasses: Record<string, string> = {
  blue: "text-blue-600",
  teal: "text-teal-600",
  amber: "text-amber-600",
  red: "text-red-600",
  slate: "text-zinc-500",
  green: "text-emerald-600",
};

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <div
      className={`rounded-sm border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 text-zinc-900 ${className}`}
    >
      {children}
    </div>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "blue",
}: MetricCardProps) {
  return (
    <div className="flex flex-col justify-between bg-white p-4 shadow-sm transition hover:bg-zinc-50">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        <Icon className={`h-4 w-4 flex-shrink-0 ${iconToneClasses[tone]}`} />
      </div>
      <div className="my-3">
        <span className="font-mono text-xl sm:text-2xl font-semibold text-zinc-900 tabular-nums">
          {value}
        </span>
      </div>
      {detail && (
        <div>
          <span className="text-xs text-zinc-500 truncate">{detail}</span>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({
  label,
  tone = "slate",
}: {
  label: string;
  tone?: "green" | "amber" | "red" | "blue" | "slate";
}) {
  const dotClasses: Record<string, string> = {
    green: "bg-emerald-600",
    amber: "bg-amber-600",
    red: "bg-red-600",
    blue: "bg-blue-600",
    slate: "bg-zinc-400",
  };

  const badgeClasses: Record<string, string> = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    slate: "border-zinc-200 bg-zinc-50 text-zinc-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-xs font-medium shadow-sm ${badgeClasses[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} />
      {label}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  detail,
}: {
  icon: LucideIcon;
  title: string;
  detail?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center">
      <div className="rounded-md border border-zinc-200 bg-white p-3 text-zinc-500 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-zinc-900">{title}</p>
      {detail && (
        <p className="mt-1 max-w-sm text-xs text-zinc-500">{detail}</p>
      )}
    </div>
  );
}

export function ProgressBar({
  value,
  tone = "blue",
}: {
  value: number;
  tone?: "blue" | "green" | "amber" | "red";
}) {
  const safeValue = Math.max(0, Math.min(100, value));
  const classes: Record<string, string> = {
    blue: "bg-blue-600",
    green: "bg-emerald-600",
    amber: "bg-amber-600",
    red: "bg-red-600",
  };

  return (
    <div className="h-2 w-full overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 p-0.5">
      <div
        className={`h-full rounded-full transition-all duration-300 ${classes[tone]}`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
