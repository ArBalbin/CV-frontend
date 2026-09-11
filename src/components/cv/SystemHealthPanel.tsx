import { Panel, StatusBadge } from "../ui";
import { HealthStatus } from "../../types/api";
import { formatDateTime } from "../../utils/format";

export function SystemHealthPanel({ health }: { health: HealthStatus | null }) {
  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-100">System health</h2>
        <StatusBadge
          label={health?.status === "ok" ? "Operational" : "Unavailable"}
          tone={health?.status === "ok" ? "green" : "red"}
        />
      </div>
      <div className="h-px bg-zinc-600 -mx-5 mb-4" />
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-zinc-800/70 py-2 text-sm">
          <span className="text-zinc-400">Database</span>
          <span className="font-mono text-zinc-100">
            {health?.db ? "connected" : "disconnected"}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-zinc-800/70 py-2 text-sm">
          <span className="text-zinc-400">Snapshot</span>
          <span className="font-mono text-zinc-100">
            {health?.snapshot ? "active" : "waiting"}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 text-sm">
          <span className="text-zinc-400">Checked</span>
          <span className="font-mono text-zinc-100">
            {formatDateTime(health?.timestamp)}
          </span>
        </div>
      </div>
    </Panel>
  );
}
