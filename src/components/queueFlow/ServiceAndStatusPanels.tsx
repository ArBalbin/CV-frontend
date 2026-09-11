import {
  Database,
  MapPinned,
  Minus,
  Plus,
  Video,
} from "lucide-react";
import { Panel, StatusBadge } from "../../components/ui";
import { HealthStatus, QueueData, QueueZone } from "../../types/api";
import { formatDateTime } from "../../utils/format";

interface ServiceAndStatusProps {
  data: QueueData;
  health: HealthStatus | null;
  zone: QueueZone | null;
  noshowWindow: number;
  noshowInput: string;
  savingNoshow: boolean;
  savedNoshow: boolean;
  onAdjustCounters: (change: number) => void;
  onNoshowInputChange: (val: string) => void;
  onSaveNoshowConfig: () => void;
}

export function ServiceAndStatusPanels({
  data,
  health,
  zone,
  noshowWindow,
  noshowInput,
  savingNoshow,
  savedNoshow,
  onAdjustCounters,
  onNoshowInputChange,
  onSaveNoshowConfig,
}: ServiceAndStatusProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-5 items-stretch">
      <Panel className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
                Service Controls
              </h2>
            </div>
          </div>
          <div className="h-px bg-zinc-600 -mx-5 mb-4" />

          <div className="mt-5 space-y-6">
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-400">
                  Active counters
                </label>
                <StatusBadge
                  label={`${data.active_counters} open`}
                  tone="blue"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAdjustCounters(-1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700"
                  aria-label="Decrease counters"
                  title="Decrease counters"
                >
                  <Minus className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
                <div className="flex h-9 flex-1 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/50 font-mono text-sm font-semibold text-zinc-100">
                  {data.active_counters}
                </div>
                <button
                  onClick={() => onAdjustCounters(1)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-700"
                  aria-label="Increase counters"
                  title="Increase counters"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <label
                  htmlFor="noshow-window"
                  className="text-xs font-medium text-zinc-400"
                >
                  No-show window
                </label>
                <StatusBadge label={`${noshowWindow}s`} tone="amber" />
              </div>

              <div className="flex items-center rounded-md border border-zinc-800 bg-zinc-900 overflow-hidden focus-within:border-zinc-700 transition-colors">
                <input
                  id="noshow-window"
                  type="number"
                  min={30}
                  max={300}
                  value={noshowInput}
                  onChange={(e) => onNoshowInputChange(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 font-mono text-xs text-zinc-100 focus:outline-none"
                  placeholder="30–300"
                />
                <button
                  onClick={onSaveNoshowConfig}
                  disabled={savingNoshow}
                  className="m-1 rounded bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50 transition-colors shrink-0"
                >
                  {savingNoshow ? "Saving" : savedNoshow ? "Saved" : "Apply"}
                </button>
              </div>
              <p className="mt-1.5 font-mono text-[11px] text-zinc-500">
                Allowed range: 30 to 300 seconds.
              </p>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
              Backend Status
            </h2>
            <StatusBadge
              label={health?.status === "ok" ? "Operational" : "Unavailable"}
              tone={health?.status === "ok" ? "green" : "red"}
            />
          </div>
          <div className="h-px bg-zinc-600 -mx-5 mb-4" />

          <div className="mt-4 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5">
              <span className="inline-flex items-center gap-2 text-zinc-400 font-sans text-xs">
                <Database
                  className="h-3.5 w-3.5 text-zinc-500"
                  strokeWidth={1.75}
                />
                Database
              </span>
              <span className="font-semibold text-zinc-200">
                {health?.db ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5">
              <span className="inline-flex items-center gap-2 text-zinc-400 font-sans text-xs">
                <Video
                  className="h-3.5 w-3.5 text-zinc-500"
                  strokeWidth={1.75}
                />
                Snapshot
              </span>
              <span className="font-semibold text-zinc-200">
                {health?.snapshot ? "Active" : "Waiting"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5">
              <span className="text-zinc-400 font-sans text-xs">
                Last checked
              </span>
              <span className="text-zinc-300">
                {formatDateTime(health?.timestamp)}
              </span>
            </div>

            {zone && (
              <div className="flex items-center justify-between rounded-md border border-zinc-800/80 bg-zinc-900/40 px-3 py-2.5">
                <span className="inline-flex items-center gap-2 text-zinc-400 font-sans text-xs">
                  <MapPinned
                    className="h-3.5 w-3.5 text-zinc-500"
                    strokeWidth={1.75}
                  />
                  Zone Bounds
                </span>
                <span className="text-zinc-300">
                  {zone.x1},{zone.y1} → {zone.x2},{zone.y2}
                </span>
              </div>
            )}
          </div>
        </div>
      </Panel>
    </div>
  );
}
