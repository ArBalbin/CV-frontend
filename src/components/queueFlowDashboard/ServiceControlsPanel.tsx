import { Minus, Plus, Settings } from "lucide-react";
import { Panel, StatusBadge } from "../ui";

interface ServiceControlsPanelProps {
  activeCounters: number;
  onAdjustCounters: (change: number) => void;
}

export default function ServiceControlsPanel({
  activeCounters,
  onAdjustCounters,
}: ServiceControlsPanelProps) {
  return (
    <Panel className="p-5 border border-zinc-200/80 bg-white shadow-sm rounded-sm transition hover:border-zinc-300 text-zinc-900">
      <div className="mb-4 flex items-center gap-2.5">
        <Settings className="h-5 w-5 text-zinc-500" />
        <h2 className="text-base font-semibold text-zinc-900">
          Service Controls
        </h2>
      </div>

      <div className="h-px bg-zinc-300 mb-4 -mx-5"/>


      <div className="space-y-5">
        <div className="rounded-md border border-zinc-200/60 bg-zinc-100 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-semibold text-zinc-600">
              Active counters
            </label>
            <StatusBadge label={`${activeCounters} open`} tone="blue" />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAdjustCounters(-1)}
              className="rounded-md border border-zinc-200/60 bg-white px-3 py-2 text-zinc-900 hover:bg-zinc-100 transition shadow-sm"
              aria-label="Decrease counters"
              title="Decrease counters"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="flex h-11 min-w-16 items-center justify-center rounded-md border border-zinc-200/60 bg-white font-mono text-xl font-semibold text-zinc-900 shadow-sm">
              {activeCounters}
            </div>
            <button
              onClick={() => onAdjustCounters(1)}
              className="rounded-md border border-zinc-200/60 bg-white px-3 py-2 text-zinc-900 hover:bg-zinc-100 transition shadow-sm"
              aria-label="Increase counters"
              title="Increase counters"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </Panel>
  );
}
