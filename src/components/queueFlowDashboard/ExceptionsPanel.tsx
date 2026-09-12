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
    <Panel className="p-5 border border-zinc-600/80 bg-[#212833] shadow-lg shadow-black/25 rounded-sm transition hover:border-zinc-500 text-zinc-100">
      <div className="mb-4 flex items-center gap-2.5">
        <ShieldAlert className="h-5 w-5 text-amber-400" />
        <h2 className="text-base font-semibold text-zinc-100">Exceptions</h2>
      </div>
      <div className="h-px bg-zinc-500 mb-4 -mx-5"/>


      {!hasPending && !hasCompleted ? (
        <EmptyState icon={ShieldAlert} title="No recent exceptions" />
      ) : (
        <div className="space-y-4">
          {hasPending && (
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
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
                      className="rounded-md border border-amber-500/40 bg-[#283140] px-3.5 py-3 text-sm text-zinc-100 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2">
                          <span className="font-semibold text-zinc-100">
                            {person.has_face_embedding
                              ? "Face detected"
                              : "Waiting for face"}
                          </span>
                          <span className="font-mono text-xs text-amber-400">
                            camera #{person.track_id}
                          </span>
                        </span>
                        {alert && (
                          <span className="font-mono text-xs text-amber-400">
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
                          className="w-24 rounded border border-zinc-600/60 bg-[#212833] px-2.5 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                        <button
                          onClick={() => onLinkPending(person.track_id)}
                          disabled={linkingTrackId === person.track_id}
                          className="rounded border border-zinc-600/60 bg-[#212833] px-3 py-1.5 text-sm font-medium text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
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
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Recently completed
              </p>
              <div className="space-y-2">
                {queueState.completed
                  .slice()
                  .reverse()
                  .map((person) => (
                    <div
                      key={`${person.queue_number}-${person.completed_at}`}
                      className="flex items-center justify-between rounded-md border border-zinc-600/60 bg-[#283140] px-3.5 py-3 text-sm text-zinc-100 shadow-sm"
                    >
                      <span className="font-semibold font-mono text-zinc-100">
                        {person.queue_label}
                      </span>
                      <span className="font-mono text-xs text-zinc-400">
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