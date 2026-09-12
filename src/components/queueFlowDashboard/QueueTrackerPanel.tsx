import { CheckCircle2, Clock3, Hash, RefreshCcw, UserPlus } from "lucide-react";
import { EmptyState, Panel, StatusBadge } from "../ui";
import { QueueState } from "../../types/api";
import { positionTone } from "./utils";

interface QueueTrackerPanelProps {
  queueState: QueueState;
  manualNumber: string;
  onManualNumberChange: (value: string) => void;
  addingManual: boolean;
  onForceNewPerson: () => void;
  onResetQueue: () => void;
  markingDone: number | null;
  onMarkDone: (queueNumber: number) => void;
}

export default function QueueTrackerPanel({
  queueState,
  manualNumber,
  onManualNumberChange,
  addingManual,
  onForceNewPerson,
  onResetQueue,
  markingDone,
  onMarkDone,
}: QueueTrackerPanelProps) {
  return (
    <Panel className="p-5 border border-zinc-600/80 bg-[#212833] shadow-lg shadow-black/25 rounded-sm transition hover:border-zinc-500 text-zinc-100">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-zinc-600/60 bg-[#283140] p-2 text-emerald-400 shadow-sm">
            <Hash className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Queue Tracker
            </h2>
            <p className="text-sm text-zinc-400">
              <span className="font-mono font-medium text-zinc-200">
                {queueState.queue_count}
              </span>{" "}
              active,{" "}
              <span className="font-mono font-medium text-zinc-200">
                {queueState.total_served}
              </span>{" "}
              served
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={manualNumber}
            onChange={(e) =>
              onManualNumberChange(e.target.value.replace(/\D/g, ""))
            }
            placeholder="Ticket #"
            title="The number printed on the walk-in's kiosk ticket"
            className="w-24 rounded-md border border-zinc-600/60 bg-[#283140] px-2.5 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 shadow-sm"
          />
          <button
            onClick={onForceNewPerson}
            disabled={addingManual}
            title="Link a walk-in's printed kiosk ticket number, or override when the camera missed someone"
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-600/60 bg-[#283140] px-3.5 py-1.5 text-sm font-medium text-zinc-100 hover:bg-zinc-700 disabled:opacity-50 shadow-sm transition"
          >
            <UserPlus className="h-4 w-4 text-emerald-400" />
            {addingManual ? "Adding…" : "Manual Add"}
          </button>
          <button
            onClick={onResetQueue}
            className="inline-flex items-center gap-1.5 rounded-md border border-red-500/40 bg-red-950/30 px-3.5 py-1.5 text-sm font-medium text-red-200 hover:bg-red-900/40 shadow-sm transition"
          >
            <RefreshCcw className="h-4 w-4 text-red-400" />
            Reset
          </button>
        </div>
      </div>
      <div className="h-px bg-zinc-500 mb-4 -mx-5"/>


      {queueState.active_queue.length === 0 ? (
        <EmptyState
          icon={Hash}
          title="Queue is clear"
          detail="Tracked queue entries will appear here."
        />
      ) : (
        <div className="space-y-3">
          {queueState.active_queue.map((person) => {
            const alert = queueState.noshow_alerts.find(
              (item) => item.queue_number_int === person.queue_number,
            );
            return (
              <div
                key={person.queue_number}
                className={`rounded-md border p-4 bg-[#283140] shadow-sm text-zinc-100 ${
                  alert?.status === "critical"
                    ? "border-red-500/60"
                    : alert
                      ? "border-amber-500/60"
                      : "border-zinc-600/60"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md border border-zinc-600/60 bg-[#212833] font-mono text-sm font-semibold text-zinc-100 shadow-sm">
                      {person.queue_label}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-zinc-100">
                          Position {person.position_in_line}
                        </p>
                        <StatusBadge
                          label={
                            person.status === "missing"
                              ? "Missing"
                              : person.counter_number != null
                                ? `Serving · Counter ${person.counter_number}`
                                : "Waiting"
                          }
                          tone={positionTone(
                            person.status,
                            person.counter_number,
                          )}
                        />
                        {alert && (
                          <StatusBadge
                            label={`${alert.seconds_remaining}s bump`}
                            tone={alert.status === "critical" ? "red" : "amber"}
                          />
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 font-mono text-xs text-zinc-400">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5 text-zinc-500" />
                          {person.wait_time}
                        </span>
                        <span>Joined {person.joined_at}</span>
                        {person.track_id !== undefined && (
                          <span className="text-zinc-500">
                            camera #{person.track_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onMarkDone(person.queue_number)}
                    disabled={markingDone === person.queue_number}
                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-600/60 bg-[#212833] px-3.5 py-1.5 text-sm font-medium text-zinc-100 hover:bg-zinc-700 disabled:opacity-50 shadow-sm transition"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {markingDone === person.queue_number ? "Saving" : "Done"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
