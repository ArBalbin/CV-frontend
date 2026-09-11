import { CheckCircle2, Clock3, Hash, RefreshCcw } from "lucide-react";
import { EmptyState, Panel, StatusBadge } from "../../components/ui";
import { QueueState } from "../../types/api";

interface QueueTrackerListProps {
  queueState: QueueState;
  markingDone: number | null;
  onResetQueue: () => void;
  onMarkDone: (queueNumber: number) => void;
  positionTone: (
    status: string,
    counterNumber?: number | null,
  ) => "green" | "amber" | "blue" | "slate";
  queueLabel: (number: number) => string;
}

export function QueueTrackerList({
  queueState,
  markingDone,
  onResetQueue,
  onMarkDone,
  positionTone,
  queueLabel,
}: QueueTrackerListProps) {
  return (
    <Panel className="p-5 flex flex-col">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Queue Tracker
            </h2>
            <p className="font-mono text-xs text-zinc-500">
              {queueState.queue_count} active, {queueState.total_served} served
            </p>
          </div>
        </div>
        <button
          onClick={onResetQueue}
          className="inline-flex items-center gap-1.5 rounded border border-brick-signal/30 bg-brick-signal/10 px-3 py-1.5 text-xs font-medium text-brick-signal hover:bg-brick-signal/20 transition-colors"
        >
          <RefreshCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
          Reset
        </button>
      </div>
      <div className="h-px bg-zinc-600 -mx-5 mb-4" />

      {queueState.active_queue.length === 0 ? (
        <div className="py-4 h-full flex items-center justify-center">
          <EmptyState
            icon={Hash}
            title="Queue is clear"
            detail="Tracked queue entries will appear here."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {queueState.active_queue.map((person) => {
            const alert = queueState.noshow_alerts.find(
              (item) => item.queue_number_int === person.queue_number,
            );
            return (
              <div
                key={person.queue_number}
                className={`rounded border p-4 transition-colors ${
                  alert?.status === "critical"
                    ? "border-brick-signal/30 bg-brick-signal/10 text-brick-signal"
                    : alert
                      ? "border-amber-signal/30 bg-amber-signal/10 text-amber-signal"
                      : "border-zinc-800 bg-zinc-900/50 text-zinc-100"
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded border border-zinc-800 bg-zinc-900 font-mono text-sm font-semibold text-zinc-100">
                      {person.queue_label || queueLabel(person.queue_number)}
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
                      <div className="mt-1 flex flex-wrap gap-3 font-mono text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5" strokeWidth={1.75} />
                          {person.wait_time}
                        </span>
                        <span>Joined {person.joined_at}</span>
                        {person.track_id !== undefined && (
                          <span>Track {person.track_id}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onMarkDone(person.queue_number)}
                    disabled={markingDone === person.queue_number}
                    className="inline-flex items-center gap-1.5 rounded bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
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
