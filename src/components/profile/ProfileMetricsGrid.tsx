import { ShieldCheck, Database, Video } from "lucide-react";
import { MetricCard } from "../ui";
import { HealthStatus } from "../../types/api";

interface ProfileMetricsGridProps {
  health: HealthStatus | null;
}

export function ProfileMetricsGrid({ health }: ProfileMetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <MetricCard
        icon={ShieldCheck}
        label="Auth status"
        value="Active"
        detail="Protected dashboard session"
        tone="green"
      />
      <MetricCard
        icon={Database}
        label="Database"
        value={health?.db ? "Online" : "Check"}
        detail="Backend health check"
        tone={health?.db ? "green" : "red"}
      />
      <MetricCard
        icon={Video}
        label="Snapshot"
        value={health?.snapshot ? "Active" : "Waiting"}
        detail="Detector stream state"
        tone={health?.snapshot ? "green" : "amber"}
      />
    </div>
  );
}
