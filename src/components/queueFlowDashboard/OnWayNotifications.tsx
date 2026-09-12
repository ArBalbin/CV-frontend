import { Navigation } from "lucide-react";
import { OnWayNotification } from "../../types/api";

interface OnWayNotificationsProps {
  notifications: OnWayNotification[];
}

export default function OnWayNotifications({
  notifications,
}: OnWayNotificationsProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="mb-5 grid gap-3">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="flex flex-col justify-between gap-3 rounded-md border border-emerald-500/40 bg-[#283140] px-4 py-3 sm:flex-row sm:items-center shadow-sm text-zinc-100"
        >
          <div className="flex items-center gap-3 text-emerald-300">
            <Navigation className="h-5 w-5 flex-shrink-0 animate-pulse text-emerald-400" />
            <div>
              <span className="text-sm font-medium text-zinc-100">
                <span className="font-mono font-semibold">{n.queue_label}</span> is on the way to the queue zone
              </span>
              <span className="ml-2 font-mono text-xs text-zinc-400">
                {n.created_at_display}
              </span>
            </div>
          </div>
          <span className="rounded-full border border-emerald-500/40 bg-[#212833] px-3 py-1 text-xs font-semibold text-emerald-300">
            Coming soon
          </span>
        </div>
      ))}
    </div>
  );
}