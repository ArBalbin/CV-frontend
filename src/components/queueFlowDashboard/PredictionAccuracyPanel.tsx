import { useEffect, useState } from "react";
import { Download, Target } from "lucide-react";
import { Panel, StatusBadge } from "../ui";
import { apiClient } from "../../config/api";
import { PredictionAccuracy } from "../../types/api";
import { queueLabel } from "./utils";

const REFRESH_MS = 30_000;

function minutes(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return `${Number(value.toFixed(1))} min`;
}

// Every served ticket is checked: the wait the app showed when the ticket was
// issued against when the person was actually called. Fetches on its own,
// every 30 seconds, so the page's live polling never waits on a database read.
export default function PredictionAccuracyPanel() {
  const [accuracy, setAccuracy] = useState<PredictionAccuracy | null>(null);
  const [failed, setFailed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  // Served tickets' real waits and service times, as a CSV for retraining the
  // wait estimate. Times and counts only; no names or school IDs.
  const downloadRecords = async () => {
    setDownloading(true);
    setDownloadError("");
    try {
      const response = await apiClient.get<Blob>("/api/queue/service_records.csv", {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `queuex_service_records_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Could not download the records. Check that you are still signed in.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await apiClient.get<PredictionAccuracy>(
          "/api/queue/prediction_accuracy",
        );
        if (!cancelled) {
          setAccuracy(response.data);
          setFailed(false);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    load();
    const timer = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const checked = accuracy?.tickets_checked ?? 0;
  const unavailable = failed || accuracy?.available === false;
  const beatsFixedGuess =
    checked > 0 &&
    accuracy?.average_miss_minutes !== null &&
    accuracy?.fixed_guess_average_miss_minutes !== null &&
    (accuracy?.average_miss_minutes ?? 0) <= (accuracy?.fixed_guess_average_miss_minutes ?? 0);

  let badge: { label: string; tone: "green" | "amber" | "slate" | "red" };
  if (unavailable) badge = { label: "Records unavailable", tone: "red" };
  else if (checked === 0) badge = { label: "Waiting for served tickets", tone: "slate" };
  else if (beatsFixedGuess) badge = { label: "Better than a fixed guess", tone: "green" };
  else badge = { label: "Not yet better than a fixed guess", tone: "amber" };

  let leaning = "";
  if (accuracy?.typical_direction === "too_low")
    leaning = `Estimates usually run ${minutes(accuracy.typical_miss_minutes)} short: people waited longer than they were told.`;
  else if (accuracy?.typical_direction === "too_high")
    leaning = `Estimates usually run ${minutes(accuracy.typical_miss_minutes)} long: people were called sooner than they were told.`;
  else if (accuracy?.typical_direction === "even")
    leaning = "Estimates are usually on target, neither too short nor too long.";

  return (
    <Panel className="p-5 border border-zinc-200/80 bg-white shadow-sm rounded-sm transition hover:border-zinc-300">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 text-base font-semibold text-zinc-900">
          <Target className="h-4 w-4 text-emerald-600" />
          Wait Estimate Accuracy
        </h2>
        <StatusBadge label={badge.label} tone={badge.tone} />
      </div>
      <p className="mb-4 max-w-prose text-sm text-zinc-600">
        Each served ticket is checked automatically: the wait the app showed when the
        ticket was issued, against when the person was actually called. Covers the last{" "}
        {accuracy?.lookback_days ?? 30} days.
      </p>

      <div className="h-px bg-zinc-300 mb-4 -mx-5" />

      {unavailable ? (
        <p className="text-sm text-zinc-600">
          Could not read the service records right now. This panel retries every 30 seconds.
        </p>
      ) : checked === 0 ? (
        <p className="text-sm text-zinc-600">
          No served tickets to check yet. Once staff mark tickets done, the result appears
          here on its own.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-zinc-200/60 bg-zinc-100 px-3.5 py-3 shadow-sm">
              <div className="text-xs font-medium text-zinc-500">Tickets checked</div>
              <div className="text-xl font-semibold tabular-nums text-zinc-900">{checked}</div>
              <div className="text-xs text-zinc-500">
                over {accuracy?.days_covered} {accuracy?.days_covered === 1 ? "day" : "days"}
              </div>
            </div>
            <div className="rounded-md border border-zinc-200/60 bg-zinc-100 px-3.5 py-3 shadow-sm">
              <div className="text-xs font-medium text-zinc-500">Average miss</div>
              <div className="text-xl font-semibold tabular-nums text-zinc-900">
                {minutes(accuracy?.average_miss_minutes)}
              </div>
              <div className="text-xs text-zinc-500">
                A fixed {accuracy?.fixed_guess_minutes}-min guess:{" "}
                {minutes(accuracy?.fixed_guess_average_miss_minutes)}
              </div>
            </div>
            <div className="rounded-md border border-zinc-200/60 bg-zinc-100 px-3.5 py-3 shadow-sm">
              <div className="text-xs font-medium text-zinc-500">
                Within {accuracy?.close_enough_minutes} min
              </div>
              <div className="text-xl font-semibold tabular-nums text-zinc-900">
                {accuracy?.close_enough_percent}%
              </div>
              <div className="text-xs text-zinc-500">of tickets</div>
            </div>
          </div>

          {leaning && <p className="text-sm text-zinc-700">{leaning}</p>}

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Latest tickets
            </div>
            <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200/60">
              {accuracy?.recent.map((t) => (
                <li
                  key={`${t.service_date}-${t.queue_number}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 text-sm"
                >
                  <span className="font-semibold text-zinc-900">{queueLabel(t.queue_number)}</span>
                  <span className="tabular-nums text-zinc-600">
                    app said {minutes(t.predicted_minutes)} · called after{" "}
                    {minutes(t.actual_minutes)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-4">
        <button
          onClick={downloadRecords}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200/60 bg-zinc-100 px-3.5 py-1.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-200 disabled:opacity-50"
        >
          <Download className="h-4 w-4 text-emerald-600" />
          {downloading ? "Preparing…" : "Download service records (CSV)"}
        </button>
        <span className="text-xs text-zinc-500">
          Real waits and service times of served tickets, for retraining. No names or school IDs.
        </span>
        {downloadError && <span className="text-sm text-red-700">{downloadError}</span>}
      </div>
    </Panel>
  );
}
