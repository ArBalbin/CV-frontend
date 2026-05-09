import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PanelProps {
  children: ReactNode;
  className?: string;
}

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail?: string;
  tone?: 'blue' | 'teal' | 'amber' | 'red' | 'slate' | 'green';
}

const toneClasses = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  teal: 'bg-teal-50 text-teal-700 border-teal-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  red: 'bg-red-50 text-red-700 border-red-100',
  slate: 'bg-slate-50 text-slate-700 border-slate-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

export function Panel({ children, className = '' }: PanelProps) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function MetricCard({ icon: Icon, label, value, detail, tone = 'blue' }: MetricCardProps) {
  return (
    <Panel className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">{value}</p>
          {detail && <p className="mt-1 text-sm text-slate-500">{detail}</p>}
        </div>
        <div className={`rounded-lg border p-2.5 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Panel>
  );
}

export function StatusBadge({
  label,
  tone = 'slate',
}: {
  label: string;
  tone?: 'green' | 'amber' | 'red' | 'blue' | 'slate';
}) {
  const classes = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[tone]}`}>
      {label}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, detail }: { icon: LucideIcon; title: string; detail?: string }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
      <Icon className="h-9 w-9 text-slate-300" />
      <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
      {detail && <p className="mt-1 max-w-sm text-sm text-slate-500">{detail}</p>}
    </div>
  );
}

export function ProgressBar({ value, tone = 'blue' }: { value: number; tone?: 'blue' | 'green' | 'amber' | 'red' }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const classes = {
    blue: 'bg-blue-600',
    green: 'bg-emerald-600',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${classes[tone]}`} style={{ width: `${safeValue}%` }} />
    </div>
  );
}
