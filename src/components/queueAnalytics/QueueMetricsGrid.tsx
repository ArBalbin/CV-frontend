import { Hash, Clock3, TrendingUp, Gauge, Users, Timer } from "lucide-react";
import { Panel, MetricCard } from "../../components/ui";
import {
  QueueAnalytics as QueueAnalyticsResponse,
  QueueData,
} from "../../types/api";
import { formatAgeSeconds, numberLabel } from "../../utils/format";

interface QueueMetricsGridProps {
  queueData: QueueData;
  analytics: QueueAnalyticsResponse | null;
  utilizationPercent: number;
  queueLabel: (val: number) => string;
}

export function QueueMetricsGrid({
  queueData,
  analytics,
  utilizationPercent,
  queueLabel,
}: QueueMetricsGridProps) {
  return (
    <Panel className="overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-zinc-700">
        <MetricCard
          icon={Hash}
          label="Queue length"
          value={queueData.queue_count || queueData.queue_length}
          detail={`Next ${queueLabel(queueData.next_number)}`}
          tone="blue"
        />
        <MetricCard
          icon={Clock3}
          label="Current wait"
          value={`${numberLabel(queueData.estimated_wait_time)} min`}
          detail="Estimated wait"
          tone="amber"
        />
        <MetricCard
          icon={TrendingUp}
          label="Arrival rate"
          value={numberLabel(queueData.arrival_rate, 2)}
          detail="People per minute"
          tone="teal"
        />
        <MetricCard
          icon={Gauge}
          label="Utilization"
          value={`${numberLabel(utilizationPercent, 1)}%`}
          detail="Service load"
          tone={
            utilizationPercent >= 90
              ? "red"
              : utilizationPercent >= 70
                ? "amber"
                : "green"
          }
        />
        <MetricCard
          icon={Users}
          label="People count"
          value={queueData.count}
          detail={formatAgeSeconds(queueData.timestamp)}
          tone="slate"
        />
        <MetricCard
          icon={Timer}
          label="New arrival"
          value={analytics?.new_arrival.estimated_wait_time_label || "No data"}
          detail={`Position ${analytics?.new_arrival.position || queueData.queue_count + 1}`}
          tone="green"
        />
      </div>
    </Panel>
  );
}
