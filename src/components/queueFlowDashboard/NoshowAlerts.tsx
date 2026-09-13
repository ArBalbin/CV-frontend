import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { NoshowAlert } from "../../types/api";

interface NoshowAlertsProps {
  alerts: NoshowAlert[];
  onBump: (queueNumberInt: number) => void;
}

export default function NoshowAlerts({ alerts, onBump }: NoshowAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="mb-5 grid gap-3">
      {alerts.map((alert) => (
        <div
          key={alert.queue_number}
          className={`flex flex-col justify-between gap-3 rounded-md border px-4 py-3 sm:flex-row sm:items-center bg-zinc-50 shadow-sm ${
            alert.status === "critical"
              ? "border-red-300"
              : "border-amber-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${alert.status === "critical" ? "text-red-600" : "text-amber-600"}`} />
            <span className="text-sm font-medium text-zinc-900">
              <span className="font-mono font-semibold">{alert.queue_number}</span> absent at the first position. Auto-bump in{" "}
              <span className="font-mono font-semibold">{alert.seconds_remaining}s</span>.
            </span>
          </div>
          <button
            onClick={() => onBump(alert.queue_number_int)}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200/60 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 transition"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Bump now
          </button>
        </div>
      ))}
    </div>
  );
}