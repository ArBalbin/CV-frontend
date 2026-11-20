import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Hash,
  Timer,
  Users,
  LucideIcon,
} from "lucide-react";
import { QueueData, QueuePrediction, QueueState } from "../../types/api";
import { numberLabel } from "../../utils/format";

/** Seconds as "1:57" (minutes:seconds). */
function clockLabel(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

interface MetricsOverviewProps {
  data: QueueData;
  queueState: QueueState;
  prediction: QueuePrediction | null;
  utilization: number;
  utilizationPercent: number;
}

interface MetricCellProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail: string;
}

function MetricCell({ icon: Icon, label, value, detail }: MetricCellProps) {
  return (
    <div className="flex flex-col bg-white hover:bg-zinc-100/40 transition">
      <div className="p-4 flex flex-col justify-between flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {label}
          </span>
          <Icon className="h-4 w-4 text-emerald-600 flex-shrink-0" />
        </div>
        <div className="my-3">
          <span className="font-mono text-xl sm:text-2xl font-semibold text-zinc-900">
            {value}
          </span>
        </div>
      </div>
      <div className="border-t border-zinc-200/60 px-4 py-2.5 bg-white/50">
        <span className="text-xs text-zinc-500">{detail}</span>
      </div>
    </div>
  );
}

export default function MetricsOverview({
  data,
  queueState,
  prediction,
}: MetricsOverviewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 2xl:grid-cols-6 divide-x divide-zinc-200/60 rounded-sm border border-zinc-200/80 bg-white shadow-sm overflow-hidden mb-5">
      <MetricCell
        icon={Users}
        label="In line"
        value={queueState.queue_count}
        detail="With a queue number"
      />
      <MetricCell
        icon={AlertTriangle}
        label="Needs a number"
        value={queueState.pending_count}
        detail="In line, not identified yet"
      />
      <MetricCell
        icon={Timer}
        label="Wait now"
        value={
          prediction?.new_arrival.estimated_wait_time_label ||
          `${numberLabel(data.estimated_wait_time)} min`
        }
        detail="For someone joining now"
      />
      <MetricCell
        icon={Hash}
        label="Counters open"
        value={data.active_counters}
        detail="Serving the queue"
      />
      <MetricCell
        icon={Clock3}
        label="Avg service time"
        value={
          prediction
            ? prediction.avg_service_seconds !== undefined
              ? clockLabel(prediction.avg_service_seconds)
              : `${prediction.avg_service_time_min} min`
            : `${numberLabel(data.estimated_wait_time || 3)} min`
        }
        detail={
          // The same average the students' app shows: the services marked
          // done in the past two hours, or the usual pace before any are.
          prediction?.avg_service_basis?.startsWith("last")
            ? `From the ${prediction.avg_service_basis}`
            : "Usual pace (none timed yet)"
        }
      />
      <MetricCell
        icon={CheckCircle2}
        label="Served"
        value={queueState.total_served}
        detail="Completed tickets"
      />
    </div>
  );
}