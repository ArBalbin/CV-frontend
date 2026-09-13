import {
  Clock3,
  Gauge,
  Timer,
  TrendingUp,
  Users,
  LucideIcon,
} from "lucide-react";
import {
  QueueAnalytics as QueueAnalyticsResponse,
  QueueData,
} from "../../types/api";
import { numberLabel } from "../../utils/format";

interface MetricsOverviewProps {
  queueData: QueueData;
  analytics: QueueAnalyticsResponse | null;
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
  queueData,
  analytics,
  utilizationPercent,
}: MetricsOverviewProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 2xl:grid-cols-6 divide-x divide-zinc-200/60 rounded-sm border border-zinc-200/80 bg-white shadow-sm overflow-hidden mb-5">
      <MetricCell
        icon={Users}
        label="Queue length"
        value={queueData.queue_count || queueData.queue_length || 0}
        detail={`${queueData.pending_count || 0} pending link`}
      />
      <MetricCell
        icon={Clock3}
        label="Current wait"
        value={`${numberLabel(queueData.estimated_wait_time || 0)} min`}
        detail="Estimated wait"
      />
      <MetricCell
        icon={TrendingUp}
        label="Arrival rate"
        value={numberLabel(queueData.arrival_rate || 0, 2)}
        detail="People per minute"
      />
      <MetricCell
        icon={Gauge}
        label="Utilization"
        value={`${numberLabel(utilizationPercent, 1)}%`}
        detail="Service load"
      />
      <MetricCell
        icon={Users}
        label="People count"
        value={queueData.count || 0}
        detail="Current occupants"
      />
      <MetricCell
        icon={Timer}
        label="New arrival"
        value={analytics?.new_arrival.estimated_wait_time_label || "No data"}
        detail={`Position ${analytics?.new_arrival.position || (queueData.queue_count || queueData.queue_length || 0) + 1}`}
      />
    </div>
  );
}