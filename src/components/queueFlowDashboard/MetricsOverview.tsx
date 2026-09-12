import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gauge,
  Hash,
  Timer,
  TrendingUp,
  Users,
  LucideIcon,
} from "lucide-react";
import { QueueData, QueuePrediction, QueueState } from "../../types/api";
import { numberLabel } from "../../utils/format";

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
    <div className="flex flex-col bg-[#212833] hover:bg-[#283140]/40 transition">
      <div className="p-4 flex flex-col justify-between flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            {label}
          </span>
          <Icon className="h-4 w-4 text-emerald-400 flex-shrink-0" />
        </div>
        <div className="my-3">
          <span className="font-mono text-xl sm:text-2xl font-semibold text-zinc-100">
            {value}
          </span>
        </div>
      </div>
      <div className="border-t border-zinc-600/60 px-4 py-2.5 bg-[#212833]/50">
        <span className="text-xs text-zinc-400">{detail}</span>
      </div>
    </div>
  );
}

export default function MetricsOverview({
  data,
  queueState,
  prediction,
  utilization,
  utilizationPercent,
}: MetricsOverviewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 2xl:grid-cols-8 divide-x divide-zinc-600/60 rounded-sm border border-zinc-600/80 bg-[#212833] shadow-lg shadow-black/25 overflow-hidden mb-5">
      <MetricCell
        icon={Users}
        label="Queue length"
        value={queueState.queue_count}
        detail="Linked to a number"
      />
      <MetricCell
        icon={AlertTriangle}
        label="Pending link"
        value={queueState.pending_count}
        detail="Confirmed present, unlinked"
      />
      <MetricCell
        icon={Timer}
        label="Current wait"
        value={`${numberLabel(data.estimated_wait_time)} min`}
        detail="Estimated wait"
      />
      <MetricCell
        icon={Hash}
        label="Counters"
        value={data.active_counters}
        detail="Active service points"
      />
      <MetricCell
        icon={Clock3}
        label="Avg service time"
        value={
          prediction
            ? `${prediction.avg_service_time_min} min`
            : `${numberLabel(data.estimated_wait_time || 3)} min`
        }
        detail={
          prediction?.service_time_source === "measured"
            ? "Measured from DB"
            : "Default (.env)"
        }
      />
      <MetricCell
        icon={Gauge}
        label="Utilization"
        value={`${numberLabel(utilizationPercent, 1)}%`}
        detail={utilization >= 0.9 ? "High load" : "Within range"}
      />
      <MetricCell
        icon={TrendingUp}
        label="Arrival rate"
        value={numberLabel(data.arrival_rate, 2)}
        detail="People per minute"
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