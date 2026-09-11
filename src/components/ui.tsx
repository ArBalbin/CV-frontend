import { ReactNode } from "react";
import { IconType } from "react-icons";
import { FaUsersBetweenLines } from "react-icons/fa6";

interface PanelProps {
  children: ReactNode;
  className?: string;
}

interface MetricCardProps {
  icon: IconType;
  label: string;
  value: string | number;
  detail?: string;
  tone?: "blue" | "teal" | "amber" | "red" | "slate" | "green";
}

const iconToneClasses = {
  blue: "text-sky-400",
  teal: "text-teal-400",
  amber: "text-amber-400",
  red: "text-rose-400",
  slate: "text-zinc-400",
  green: "text-emerald-400",
};

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-[3px] bg-zinc-800/90 ring-1 ring-zinc-700/70 shadow-lg transition-all hover:ring-zinc-600 ${className}`}
    >
      {children}
    </section>
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
    <div className="flex flex-col justify-between p-4 sm:p-5 bg-zinc-800/60 hover:bg-zinc-800 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </span>
        <Icon className={`h-4 w-4 shrink-0 ${iconToneClasses[tone]}`} />
      </div>

      <div className="mt-4">
        <p className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100 tabular-nums">
          {value}
        </p>
      </div>

      {detail && (
        <>
          <div className="h-px bg-zinc-700/60 -mx-4 sm:-mx-5 my-3" />
          <p className="text-xs font-medium text-zinc-400 truncate">{detail}</p>
        </>
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
  const dotClasses = {
    green: "bg-emerald-400",
    amber: "bg-amber-400",
    red: "bg-rose-400",
    blue: "bg-sky-400",
    slate: "bg-zinc-400",
  };

  const containerClasses = {
    green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    red: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    blue: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    slate: "border-zinc-700 bg-zinc-800 text-zinc-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 border px-3 py-1 text-xs font-semibold tracking-wide ${containerClasses[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} />
      {label}
    </span>
  );
}

export function EmptyState({
  title,
  detail,
}: {
  icon: IconType;
  title: string;
  detail?: string;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-800/40 px-6 py-10 text-center">
      <div>
        <FaUsersBetweenLines className="h-20 w-auto text-zinc-500 opacity-80" />
      </div>
      <p className="mt-3 text-2xl font-bold text-zinc-100">{title}</p>
      {detail && (
        <p className="mt-1 max-w-xs text-xs text-zinc-400">{detail}</p>
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
  const classes = {
    blue: "bg-sky-500",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-rose-500",
  };

  return (
    <div className="h-2 overflow-hidden rounded-full bg-zinc-700 p-0.5">
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${classes[tone]}`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
