import { ShieldAlert } from "lucide-react";
import { Panel, StatusBadge } from "../ui";
import { AppearanceRejection, CompletedQueuePerson } from "../../types/api";

interface CompletedAndRejectionsPanelProps {
  completed: CompletedQueuePerson[];
  appearanceRejections: AppearanceRejection[];
}

export function CompletedAndRejectionsPanel({
  completed,
  appearanceRejections,
}: CompletedAndRejectionsPanelProps) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
      <Panel className="p-5">
        <h2 className="mb-4 text-base font-semibold text-zinc-100">
          Recently completed
        </h2>
        <div className="h-px bg-zinc-600 -mx-5 mb-4" />

        <div className="grid gap-2">
          {completed.length > 0 ? (
            completed
              .slice()
              .reverse()
              .map((person) => (
                <div
                  key={`${person.queue_number}-${person.completed_at}`}
                  className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm"
                >
                  <span className="font-mono font-medium text-zinc-100">
                    {person.queue_label}
                  </span>
                  <span className="text-zinc-400">
                    {person.total_wait_time || person.wait_time}
                  </span>
                  <StatusBadge
                    label={
                      person.bump_reason === "no_show" ? "No-show" : "Served"
                    }
                    tone={person.bump_reason === "no_show" ? "amber" : "green"}
                  />
                </div>
              ))
          ) : (
            <div className="py-8 text-center text-zinc-500">
              <p className="text-sm">No completed transactions yet</p>
            </div>
          )}
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <ShieldAlert
            className="h-5 w-5 text-amber-signal"
            strokeWidth={1.75}
          />
          <h2 className="text-base font-semibold text-zinc-100">
            Appearance rejections
          </h2>
        </div>
        <div className="h-px bg-zinc-600 -mx-5 mb-4" />
        <div className="grid gap-2">
          {appearanceRejections.length > 0 ? (
            appearanceRejections
              .slice()
              .reverse()
              .map((rejection, index) => (
                <div
                  key={`${rejection.queue_number}-${index}`}
                  className="rounded border border-amber-signal/30 bg-amber-signal/10 px-3 py-2 text-sm text-amber-signal"
                >
                  <span className="font-mono font-semibold">
                    {rejection.queue_number}
                  </span>
                  <span className="mx-2 opacity-70">mismatch at</span>
                  <span className="font-mono">{rejection.at}</span>
                </div>
              ))
          ) : (
            <div className="py-8 text-center text-zinc-500">
              <p className="text-sm">No appearance rejections</p>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
