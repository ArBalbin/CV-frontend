import { AlertTriangle, CheckCircle2, Navigation } from "lucide-react";
import { NoshowAlert, OnWayNotification } from "../../types/api";

interface AlertBannersProps {
  lastError: string;
  onDismissError: () => void;
  noshowAlerts: NoshowAlert[];
  onWayNotifications: OnWayNotification[];
  onBump: (queueNumberInt: number) => void;
}

export function AlertBanners({
  lastError,
  onDismissError,
  noshowAlerts,
  onWayNotifications,
  onBump,
}: AlertBannersProps) {
  return (
    <>
      {lastError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded border border-brick-signal bg-brick-signal/5 px-3 py-2 text-xs text-brick-signal">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span>{lastError}</span>
          </div>
          <button
            onClick={onDismissError}
            className="font-medium underline underline-offset-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {noshowAlerts.length > 0 && (
        <div className="mb-4 grid gap-2">
          {noshowAlerts.map((alert) => (
            <div
              key={alert.queue_number}
              className={`flex flex-col justify-between gap-2 rounded border px-3 py-2 text-xs sm:flex-row sm:items-center ${
                alert.status === "critical"
                  ? "border-brick-signal/30 bg-brick-signal/10 text-brick-signal"
                  : "border-amber-signal/30 bg-amber-signal/10 text-amber-signal"
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.75}
                />
                <span>
                  {alert.queue_number} absent. Auto-bump in{" "}
                  {alert.seconds_remaining}s.
                </span>
              </div>
              <button
                onClick={() => onBump(alert.queue_number_int)}
                className="btn-secondary inline-flex items-center gap-1.5 py-1 text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                Bump now
              </button>
            </div>
          ))}
        </div>
      )}

      {onWayNotifications.length > 0 && (
        <div className="mb-4 grid gap-2">
          {onWayNotifications.map((n) => (
            <div
              key={n.id}
              className="flex flex-col justify-between gap-2 rounded border border-moss-signal/30 bg-moss-signal/10 px-3 py-2 text-xs sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-2 text-moss-signal font-medium">
                <Navigation
                  className="h-4 w-4 shrink-0 animate-pulse"
                  strokeWidth={1.75}
                />
                <div>
                  <span>{n.queue_label} is on the way</span>
                  <span className="ml-1.5 font-mono opacity-70">
                    ({n.created_at_display})
                  </span>
                </div>
              </div>
              <span className="rounded border border-moss-signal/30 bg-zinc-900 px-2 py-0.5 text-xs font-medium text-moss-signal">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
