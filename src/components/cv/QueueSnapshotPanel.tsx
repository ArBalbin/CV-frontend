import { Users } from "lucide-react";
import { EmptyState, Panel, StatusBadge } from "../ui";
import { NoshowAlert, QueuePerson } from "../../types/api";
import { positionTone } from "./helpers";

interface QueueSnapshotPanelProps {
  activeQueue: QueuePerson[];
  firstAlert?: NoshowAlert;
}

export function QueueSnapshotPanel({
  activeQueue,
  firstAlert,
}: QueueSnapshotPanelProps) {
  return (
    <Panel className="p-5 flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-100">
          Queue snapshot
        </h2>
        <StatusBadge label={`${activeQueue.length} active`} tone="slate" />
      </div>
      {firstAlert && (
        <div className="mb-4 rounded border border-amber-signal/30 bg-amber-signal/10 px-3 py-2 text-sm text-amber-signal">
          {firstAlert.queue_number} bump timer: {firstAlert.seconds_remaining}s
        </div>
      )}
      <div className="h-px bg-zinc-600 -mx-5 mb-4" />

      <div className="flex-1 flex flex-col">
        {activeQueue.length > 0 ? (
          <div className="space-y-2">
            {activeQueue.slice(0, 5).map((person) => (
              <div
                key={person.queue_number}
                className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-zinc-800 font-mono text-xs font-semibold text-zinc-100">
                    {person.queue_label}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-100">
                      Position {person.position_in_line}
                    </p>
                    <p className="font-mono text-xs text-zinc-500">
                      {person.wait_time} waiting
                    </p>
                  </div>
                </div>
                <StatusBadge
                  label={
                    person.status === "missing"
                      ? "Missing"
                      : person.counter_number != null
                        ? `Serving · C${person.counter_number}`
                        : "Waiting"
                  }
                  tone={positionTone(person.status, person.counter_number)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col py-2">
            <EmptyState icon={Users} title="No active queue entries" />
          </div>
        )}
      </div>
    </Panel>
  );
}
