import { useEffect, useRef, useState } from "react";
import { Navigation } from "lucide-react";
import { OnWayNotification } from "../../types/api";

interface OnWayNotificationsProps {
  notifications: OnWayNotification[];
}

/** How long a banner takes to fade out once the backend stops sending it. */
const FADE_MS = 700;

export default function OnWayNotifications({
  notifications,
}: OnWayNotificationsProps) {
  // Everything currently on screen. This is deliberately not the same list the
  // backend sends: an alert that has just expired stays here a moment longer
  // so it can fade rather than vanish between two polls.
  const [rendered, setRendered] = useState<OnWayNotification[]>(notifications);
  const [exiting, setExiting] = useState<string[]>([]);
  const timers = useRef<number[]>([]);

  // Add newly arrived alerts.
  useEffect(() => {
    setRendered((prev) => {
      const known = new Set(prev.map((n) => n.id));
      const additions = notifications.filter((n) => !known.has(n.id));
      return additions.length > 0 ? [...prev, ...additions] : prev;
    });
  }, [notifications]);

  // Retire alerts the backend has dropped, after letting them fade.
  useEffect(() => {
    const live = new Set(notifications.map((n) => n.id));
    const leaving = rendered
      .filter((n) => !live.has(n.id) && !exiting.includes(n.id))
      .map((n) => n.id);

    if (leaving.length === 0) return;

    setExiting((prev) => [...prev, ...leaving]);

    const timer = window.setTimeout(() => {
      setRendered((prev) => prev.filter((n) => !leaving.includes(n.id)));
      setExiting((prev) => prev.filter((id) => !leaving.includes(id)));
    }, FADE_MS);
    timers.current.push(timer);
  }, [notifications, rendered, exiting]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  if (rendered.length === 0) return null;

  return (
    <div className="mb-5 grid gap-3">
      {rendered.map((n) => {
        const isLeaving = exiting.includes(n.id);
        return (
          <div
            key={n.id}
            aria-hidden={isLeaving}
            className={[
              "flex flex-col justify-between gap-3 rounded-md border border-emerald-200/40",
              "bg-zinc-100 px-4 py-3 shadow-sm text-zinc-900 sm:flex-row sm:items-center",
              "transition-all ease-out motion-reduce:transition-none",
              isLeaving
                ? "opacity-0 -translate-y-1 duration-700"
                : "opacity-100 translate-y-0 duration-300",
            ].join(" ")}
          >
            <div className="flex items-center gap-3 text-emerald-700">
              <Navigation className="h-5 w-5 flex-shrink-0 animate-pulse text-emerald-600" />
              <div>
                <span className="text-sm font-medium text-zinc-900">
                  <span className="font-mono font-semibold">
                    {n.queue_label}
                  </span>{" "}
                  is on the way to the queue zone
                </span>
                <span className="ml-2 font-mono text-xs text-zinc-500">
                  {n.created_at_display}
                </span>
              </div>
            </div>
            <span className="rounded-full border border-emerald-200/40 bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
              Coming soon
            </span>
          </div>
        );
      })}
    </div>
  );
}
