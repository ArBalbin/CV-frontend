import { CheckCircle2, Clock3, Hash, RefreshCcw, UserPlus } from "lucide-react";
import { EmptyState, Panel, StatusBadge } from "../ui";
import { QueuePerson } from "../../types/api";
import { positionTone } from "./helpers";

interface ActiveQueuePanelProps {
  activeQueue: QueuePerson[];
  addingManual: boolean;
  markingDone: number | null;
  onForceNew: () => void;
  onReset: () => void;
  onMarkDone: (queueNumber: number) => void;
}

export function ActiveQueuePanel({
  activeQueue,
  addingManual,
  markingDone,
  onForceNew,
  onReset,
  onMarkDone,
}: ActiveQueuePanelProps) {
  return (
    <Panel className="p-5 flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-100">Active queue</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onForceNew}
            disabled={addingManual}
            title="Manually add next queue number (use when camera misses someone or for identical twins)"
            className="btn-secondary"
          >
            <UserPlus className="h-4 w-4" strokeWidth={1.75} />
            {addingManual ? "Adding" : "Manual add"}
          </button>
          <button onClick={onReset} className="btn-danger">
            <RefreshCcw className="h-4 w-4" strokeWidth={1.75} />
            Reset
          </button>
        </div>
      </div>
      <div className="h-px bg-zinc-600 -mx-5 mb-4" />

      {activeQueue.length === 0 ? (
        <div className="py-4 h-full">
          <EmptyState
            icon={Hash}
            title="Queue is clear"
            detail="New queue numbers appear when tracked people enter the configured zone."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {activeQueue.map((person) => (
            <div
              key={person.queue_number}
              className="rounded border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded bg-zinc-800 font-mono text-xs font-semibold text-zinc-100">
                    {person.queue_label}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-zinc-100">
                        Position {person.position_in_line}
                      </p>
                      <StatusBadge
                        label={
                          person.status === "missing"
                            ? "Missing"
                            : person.counter_number != null
                              ? `Serving · C${person.counter_number}`
                              : "Waiting"
                        }
                        tone={positionTone(
                          person.status,
                          person.counter_number,
                        )}
                      />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 font-mono text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {person.wait_time}
                      </span>
                      <span>joined {person.joined_at}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onMarkDone(person.queue_number)}
                  disabled={markingDone === person.queue_number}
                  className="btn-primary"
                >
                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                  {markingDone === person.queue_number ? "Saving" : "Done"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
