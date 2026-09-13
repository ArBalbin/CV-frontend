import { ShieldAlert } from "lucide-react";
import { EmptyState, Panel, StatusBadge } from "../ui";
import { QueueState } from "../../types/api";

interface ExceptionsPanelProps {
  queueState: QueueState;
  linkNumberByTrack: Record<number, string>;
  onLinkNumberChange: (trackId: number, value: string) => void;
  linkingTrackId: number | null;
  onLinkPending: (trackId: number) => void;
}

export default function ExceptionsPanel({
  queueState,
  linkNumberByTrack,
  onLinkNumberChange,
  linkingTrackId,
  onLinkPending,
}: ExceptionsPanelProps) {
  const hasPending = (queueState.pending_queue?.length || 0) > 0;
  const hasCompleted = queueState.completed.length > 0;

  return (
    <Panel className="p-5 border border-zinc-200/80 bg-white shadow-sm rounded-sm transition hover:border-zinc-300 text-zinc-900">
      <div className="mb-4 flex items-center gap-2.5">
        <ShieldAlert className="h-5 w-5 text-amber-600" />
        <h2 className="text-base font-semibold text-zinc-900">Exceptions</h2>
      </div>
      <div className="h-px bg-zinc-300 mb-4 -mx-5"/>


      {!hasPending && !hasCompleted ? (
        <EmptyState icon={ShieldAlert} title="No recent exceptions" />
      ) : (
        <div className="space-y-4">
          {hasPending && (
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Pending link — present in zone, not yet linked
              </p>
              <div className="space-y-2.5">
                {queueState.pending_queue!.map((person) => {
                  const alert = queueState.pending_link_alerts?.find(
                    (a) => a.track_id === person.track_id,
                  );
                  return (
                    <div
                      key={person.track_id}
                      className="rounded-md border border-amber-200/40 bg-zinc-100 px-3.5 py-3 text-sm text-zinc-900 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2">
                          <span className="font-semibold text-zinc-900">
                            {person.has_face_embedding
                              ? "Face detected"
                              : "Waiting for face"}
                          </span>
                          <span className="font-mono text-xs text-amber-600">
                            camera #{person.track_id}
                          </span>
                        </span>
                        {alert && (
                          <span className="font-mono text-xs text-amber-600">
                            waiting {alert.seconds_waiting}s
                          </span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          value={linkNumberByTrack[person.track_id] || ""}
                          onChange={(e) =>
                            onLinkNumberChange(
                              person.track_id,
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          placeholder="Ticket #"
                          className="w-24 rounded border border-zinc-200/60 bg-white px-2.5 py-1.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-600"
                        />
                        <button
                          onClick={() => onLinkPending(person.track_id)}
                          disabled={linkingTrackId === person.track_id}
                          className="rounded border border-zinc-200/60 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 disabled:opacity-50"
                        >
                          {linkingTrackId === person.track_id
                            ? "Linking…"
                            : "Link"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {hasCompleted && (
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Recently completed
              </p>
              <div className="space-y-2">
                {queueState.completed
                  .slice()
                  .reverse()
                  .map((person) => (
                    <div
                      key={`${person.queue_number}-${person.completed_at}`}
                      className="flex items-center justify-between rounded-md border border-zinc-200/60 bg-zinc-100 px-3.5 py-3 text-sm text-zinc-900 shadow-sm"
                    >
                      <span className="font-semibold font-mono text-zinc-900">
                        {person.queue_label}
                      </span>
                      <span className="font-mono text-xs text-zinc-500">
                        {person.total_wait_time || person.wait_time}
                      </span>
                      <StatusBadge
                        label={
                          person.bump_reason === "no_show"
                            ? "No-show"
                            : "Served"
                        }
                        tone={
                          person.bump_reason === "no_show" ? "amber" : "green"
                        }
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}