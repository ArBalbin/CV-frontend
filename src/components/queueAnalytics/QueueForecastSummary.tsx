import { Panel, ProgressBar, StatusBadge } from "../../components/ui";
import {
  QueueAnalytics as QueueAnalyticsResponse,
  QueueData,
} from "../../types/api";
import { formatAgeSeconds, numberLabel } from "../../utils/format";

interface QueueForecastSummaryProps {
  queueData: QueueData;
  analytics: QueueAnalyticsResponse | null;
  forecastRows: Array<{ label: string; value: string }>;
  utilizationPercent: number;
  completionRate: number;
  utilizationTone: (val: number) => "green" | "amber" | "red";
}

export function QueueForecastSummary({
  queueData,
  analytics,
  forecastRows,
  utilizationPercent,
  completionRate,
  utilizationTone,
}: QueueForecastSummaryProps) {
  return (
    <Panel className="p-5">
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
          tone={analytics?.overview.data_status === "stale" ? "amber" : "green"}
        />
      </div>

      <div className="h-px bg-zinc-600 -mx-5 mb-4" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {forecastRows.map((item) => (
          <div
            key={item.label}
            className="rounded-sm border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:bg-zinc-900"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {item.label}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-100">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-sm border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-zinc-300">
              System utilization
            </span>
            <span className="font-semibold text-zinc-100">
              {numberLabel(utilizationPercent, 1)}%
            </span>
          </div>
          <ProgressBar
            value={utilizationPercent}
            tone={utilizationTone(queueData.system_utilization || 0)}
          />
        </div>
        <div className="rounded-sm border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold text-zinc-300">
              Completion share
            </span>
            <span className="font-semibold text-zinc-100">
              {numberLabel(completionRate, 1)}%
            </span>
          </div>
          <ProgressBar value={completionRate} tone="blue" />
        </div>
      </div>
    </Panel>
  );
}
