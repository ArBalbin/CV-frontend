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
          className={`flex flex-col justify-between gap-3 rounded-md border px-4 py-3 sm:flex-row sm:items-center bg-[#283140] shadow-sm ${
            alert.status === "critical"
              ? "border-red-500/60 text-red-200"
              : "border-amber-500/60 text-amber-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${alert.status === "critical" ? "text-red-400" : "text-amber-400"}`} />
            <span className="text-sm font-medium text-zinc-100">
              <span className="font-mono font-semibold">{alert.queue_number}</span> absent at the first position. Auto-bump in{" "}
              <span className="font-mono font-semibold">{alert.seconds_remaining}s</span>.
            </span>
          </div>
          <button
            onClick={() => onBump(alert.queue_number_int)}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-600/60 bg-[#212833] px-3.5 py-1.5 text-sm font-medium text-zinc-100 hover:bg-zinc-700 transition"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Bump now
          </button>
        </div>
      ))}
    </div>
  );
}