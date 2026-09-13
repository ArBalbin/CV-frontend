import { Database, MapPinned, Video } from "lucide-react";
import { Panel, StatusBadge } from "../ui";
import { HealthStatus, QueueZone } from "../../types/api";
import { formatDateTime } from "../../utils/format";

interface BackendStatusPanelProps {
  health: HealthStatus | null;
  zone: QueueZone | null;
}

export default function BackendStatusPanel({
  health,
  zone,
}: BackendStatusPanelProps) {
  return (
    <Panel className="p-5 border border-zinc-200/80 bg-white shadow-sm rounded-sm transition hover:border-zinc-300">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-900">
          Backend Status
        </h2>
        <StatusBadge
          label={health?.status === "ok" ? "Operational" : "Unavailable"}
          tone={health?.status === "ok" ? "green" : "red"}
        />
      </div>

      <div className="h-px bg-zinc-300 mb-4 -mx-5"/>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-md border border-zinc-200/60 bg-zinc-100 px-3.5 py-3 text-sm shadow-sm">
          <span className="inline-flex items-center gap-2.5 text-zinc-600 font-medium">
            <Database className="h-4 w-4 text-emerald-600" />
            Database
          </span>
          <span className="font-semibold text-zinc-900 font-mono text-xs">
            {health?.db ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-zinc-200/60 bg-zinc-100 px-3.5 py-3 text-sm shadow-sm">
          <span className="inline-flex items-center gap-2.5 text-zinc-600 font-medium">
            <Video className="h-4 w-4 text-emerald-600" />
            Snapshot
          </span>
          <span className="font-semibold text-zinc-900 font-mono text-xs">
            {health?.snapshot ? "Active" : "Waiting"}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-zinc-200/60 bg-zinc-100 px-3.5 py-3 text-sm shadow-sm">
          <span className="text-zinc-600 font-medium">Checked</span>
          <span className="font-semibold text-zinc-900 font-mono text-xs">
            {formatDateTime(health?.timestamp)}
          </span>
        </div>
        {zone && (
          <div className="flex items-center justify-between rounded-md border border-zinc-200/60 bg-zinc-100 px-3.5 py-3 text-sm shadow-sm">
            <span className="inline-flex items-center gap-2.5 text-zinc-600 font-medium">
              <MapPinned className="h-4 w-4 text-emerald-600" />
              Zone
            </span>
            <span className="font-semibold text-zinc-900 font-mono text-xs">
              {zone.x1},{zone.y1} to {zone.x2},{zone.y2}
            </span>
          </div>
        )}
      </div>
    </Panel>
  );
}