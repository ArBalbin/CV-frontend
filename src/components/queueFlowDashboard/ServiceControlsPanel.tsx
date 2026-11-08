import { useState } from "react";
import { Coffee, Minus, Plus, Settings } from "lucide-react";
import { Panel, StatusBadge } from "../ui";

interface ServiceControlsPanelProps {
  activeCounters: number;
  onAdjustCounters: (change: number) => void;
  closedUntil: string | null;
  onCloseCounters: (until: string) => void;
  onOpenCounters: () => void;
}

function clockLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ServiceControlsPanel({
  activeCounters,
  onAdjustCounters,
  closedUntil,
  onCloseCounters,
  onOpenCounters,
}: ServiceControlsPanelProps) {
  const [reopenAt, setReopenAt] = useState("13:00");

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

        {/* While closed, nobody is called and every wait estimate counts the
            time until the counters reopen. */}
        <div className="rounded-md border border-zinc-200/60 bg-zinc-100 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-zinc-600">
              <Coffee className="h-4 w-4" />
              Lunch break
            </label>
            {closedUntil ? (
              <StatusBadge label={`Closed until ${clockLabel(closedUntil)}`} tone="amber" />
            ) : (
              <StatusBadge label="Counters open" tone="green" />
            )}
          </div>
          {closedUntil ? (
            <button
              onClick={onOpenCounters}
              className="rounded-md border border-zinc-200/60 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition shadow-sm"
            >
              Reopen counters now
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <label className="text-sm text-zinc-600" htmlFor="reopen-at">
                Close all counters until
              </label>
              <input
                id="reopen-at"
                type="time"
                value={reopenAt}
                onChange={(event) => setReopenAt(event.target.value)}
                className="rounded-md border border-zinc-200/60 bg-white px-2 py-1.5 font-mono text-sm text-zinc-900 shadow-sm"
              />
              <button
                onClick={() => onCloseCounters(reopenAt)}
                disabled={!reopenAt}
                className="rounded-md border border-zinc-200/60 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition shadow-sm disabled:opacity-50"
              >
                Close
              </button>
            </div>
          )}
        </div>

      </div>
    </Panel>
  );
}
