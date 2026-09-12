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
  blue: "text-blue-400",
  teal: "text-teal-400",
  amber: "text-amber-400",
  red: "text-red-400",
  slate: "text-zinc-400",
  green: "text-emerald-400",
};

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <div
      className={`rounded-sm border border-zinc-600/80 bg-[#212833] p-5 shadow-lg shadow-black/25 transition hover:border-zinc-500 text-zinc-100 ${className}`}
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
    <div className="flex flex-col justify-between bg-[#212833] p-4 shadow-sm transition hover:bg-[#283140]/40">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </span>
        <Icon className={`h-4 w-4 flex-shrink-0 ${iconToneClasses[tone]}`} />
      </div>
      <div className="my-3">
        <span className="font-mono text-xl sm:text-2xl font-semibold text-zinc-100 tabular-nums">
          {value}
        </span>
      </div>
      {detail && (
        <div>
          <span className="text-xs text-zinc-400 truncate">{detail}</span>
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
    green: "bg-emerald-400",
    amber: "bg-amber-400",
    red: "bg-red-400",
    blue: "bg-blue-400",
    slate: "bg-zinc-400",
  };

  const badgeClasses: Record<string, string> = {
    green: "border-emerald-500/40 bg-emerald-950/30 text-emerald-300",
    amber: "border-amber-500/40 bg-amber-950/30 text-amber-300",
    red: "border-red-500/40 bg-red-950/30 text-red-300",
    blue: "border-blue-500/40 bg-blue-950/30 text-blue-300",
    slate: "border-zinc-600/60 bg-[#283140] text-zinc-300",
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
    <div className="flex flex-col items-center justify-center rounded-md border border-zinc-600/60 bg-[#283140] p-8 text-center shadow-sm">
      <div className="rounded-md border border-zinc-600/60 bg-[#212833] p-3 text-zinc-400 shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-zinc-100">{title}</p>
      {detail && (
        <p className="mt-1 max-w-sm text-xs text-zinc-400">{detail}</p>
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
    blue: "bg-blue-500",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  return (
    <div className="h-2 w-full overflow-hidden rounded-full border border-zinc-600/60 bg-[#212833] p-0.5 shadow-inner">
      <div
        className={`h-full rounded-full transition-all duration-300 ${classes[tone]}`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
