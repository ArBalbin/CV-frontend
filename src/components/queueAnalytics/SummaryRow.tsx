import { BarChart3, Hash } from "lucide-react";
import { EmptyState, Panel, ProgressBar, StatusBadge } from "../ui";
import {
  QueueAnalytics as QueueAnalyticsResponse,
  QueueData,
} from "../../types/api";
import { formatAgeSeconds, numberLabel } from "../../utils/format";
import { utilizationTone } from "./analyticsHelpers";

interface ForecastRow {
  label: string;
  value: string;
}

interface SummaryRowProps {
  queueData: QueueData;
  analytics: QueueAnalyticsResponse | null;
  forecastRows: ForecastRow[];
  utilization: number;
  utilizationPercent: number;
  completionRate: number;
  isLoading: boolean;
}

export default function SummaryRow({
  queueData,
  analytics,
  forecastRows,
  utilization,
  utilizationPercent,
  completionRate,
  isLoading,
}: SummaryRowProps) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(420px,0.9fr)]">
      <Panel className="border-zinc-600/80 bg-[#212833] p-5 shadow-lg shadow-black/25">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Forecast Summary
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Data age:{" "}
              {analytics
                ? `${analytics.overview.data_age_seconds}s`
                : formatAgeSeconds(queueData.timestamp)}
            </p>
          </div>
          <StatusBadge
            label={analytics?.overview.data_status || "loading"}
            tone={
              analytics?.overview.data_status === "stale" ? "amber" : "green"
            }
          />
        </div>

        <div className="h-px bg-zinc-500 mb-4 -mx-5" />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {forecastRows.map((item) => (
            <div
              key={item.label}
              className="rounded border border-zinc-600/60 bg-[#181d24] p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                {item.label}
              </p>
              <p className="mt-3 text-2xl font-semibold text-zinc-100 font-mono">
                {item.value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded border border-zinc-600/60 bg-[#181d24] p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-zinc-300">
                System utilization
              </span>
              <span className="font-semibold text-zinc-100 font-mono">
                {numberLabel(utilizationPercent, 1)}%
              </span>
            </div>
            <ProgressBar
              value={utilizationPercent}
              tone={utilizationTone(utilization)}
            />
          </div>
          <div className="rounded border border-zinc-600/60 bg-[#181d24] p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-zinc-300">
                Completion share
              </span>
              <span className="font-semibold text-zinc-100 font-mono">
                {numberLabel(completionRate, 1)}%
              </span>
            </div>
            <ProgressBar value={completionRate} tone="blue" />
          </div>
        </div>
      </Panel>

      <Panel className="border-zinc-600/80 bg-[#212833] p-5 shadow-lg shadow-black/25">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-400" />
          <h2 className="text-base font-semibold text-zinc-100">
            Current Queue Estimates
          </h2>
        </div>
        <div className="h-px bg-zinc-500 mb-4 -mx-5" />

        {analytics?.active_queue.length ? (
          <div className="space-y-2">
            {analytics.active_queue.slice(0, 8).map((person) => (
              <div
                key={person.queue_number}
                className="flex items-center justify-between rounded border border-zinc-600/60 bg-[#181d24] px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-zinc-100">
                    {person.queue_label}
                  </p>
                  <p className="text-xs text-zinc-400">
                    Position {person.position}
                  </p>
                </div>
                <span className="font-semibold text-zinc-300 font-mono">
                  {person.estimated_wait_time_label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Hash}
            title={
              isLoading
                ? "Loading queue estimates"
                : "No active queue estimates"
            }
          />
        )}
      </Panel>
    </div>
  );
}
