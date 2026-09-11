import {
  HiUsers,
  HiChartBar,
  HiHashtag,
  HiCheckCircle,
  HiServer,
} from "react-icons/hi2";
import { TbActivity } from "react-icons/tb";
import { Panel, MetricCard } from "../ui";
import { CrowdData, HealthStatus, QueueState } from "../../types/api";
import { formatAgeSeconds, numberLabel } from "../../utils/format";
import { queueLabel } from "./helpers";

interface MetricsRowProps {
  data: CrowdData;
  queueState: QueueState;
  health: HealthStatus | null;
}

export function MetricsRow({ data, queueState, health }: MetricsRowProps) {
  return (
    <Panel className="overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-zinc-700/60">
        <MetricCard
          icon={HiUsers}
          label="People detected"
          value={data.count}
          detail={formatAgeSeconds(data.timestamp)}
          tone="blue"
        />
        <MetricCard
          icon={TbActivity}
          label="Average density"
          value={numberLabel(data.avg_density, 2)}
          detail="People density"
          tone="teal"
        />
        <MetricCard
          icon={HiChartBar}
          label="Maximum density"
          value={numberLabel(data.max_density, 2)}
          detail="Peak density"
          tone="amber"
        />
        <MetricCard
          icon={HiHashtag}
          label="Active queue"
          value={queueState.queue_count}
          detail={`Next ${queueLabel(queueState.next_number)}`}
          tone="slate"
        />
        <MetricCard
          icon={HiCheckCircle}
          label="Served"
          value={queueState.total_served}
          detail="Completed tickets"
          tone="green"
        />
        <MetricCard
          icon={HiServer}
          label="Backend"
          value={health?.db ? "Ready" : "Check"}
          detail={health?.snapshot ? "Snapshot active" : "No snapshot"}
          tone={health?.db ? "green" : "red"}
        />
      </div>
    </Panel>
  );
}
