import { Clock3 } from "lucide-react";
import { Panel, ProgressBar, StatusBadge } from "../ui";
import { ForecastItem, QueueData, QueuePrediction } from "../../types/api";
import { formatAgeSeconds, numberLabel } from "../../utils/format";
import { utilizationTone } from "./utils";

interface ForecastPanelProps {
  data: QueueData;
  prediction: QueuePrediction | null;
  forecastCards: ForecastItem[];
  utilization: number;
  utilizationPercent: number;
}

export default function ForecastPanel({
  data,
  prediction,
  forecastCards,
  utilization,
  utilizationPercent,
}: ForecastPanelProps) {
  return (
    <Panel className="p-5 border border-zinc-200/80 bg-white shadow-sm rounded-sm transition hover:border-zinc-300 text-zinc-900">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">
            Wait-Time Forecast
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            New arrival:{" "}
            <span className="font-semibold text-zinc-900">
              {prediction?.new_arrival.estimated_wait_time_label ||
                `${numberLabel(data.estimated_wait_time)} min`}
            </span>
          </p>
        </div>
        <StatusBadge
          label={
            prediction
              ? `${prediction.data_age_seconds}s data age`
              : formatAgeSeconds(data.timestamp)
          }
          tone={prediction?.data_status === "stale" ? "amber" : "green"}
        />
      </div>

      <div className="h-px bg-zinc-300 mb-4 -mx-5"/>

      <div className="grid gap-3 md:grid-cols-4">
        {forecastCards.map((forecast) => (
          <div
            key={forecast.horizon_minutes}
            className="rounded-md border border-zinc-200/60 bg-zinc-100 p-4 text-zinc-900 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {forecast.horizon_minutes === 0
                  ? "Now"
                  : `In ${forecast.horizon_minutes} min`}
              </span>
              <Clock3 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-4 font-mono text-2xl font-semibold text-zinc-900">
              {forecast.estimated_wait_time_label}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {numberLabel(forecast.estimated_wait_time_minutes)} minutes
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-md border border-zinc-200/60 bg-zinc-100 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-semibold text-zinc-600">
            System utilization
          </span>
          <span className="font-mono font-semibold text-zinc-900">
            {numberLabel(utilizationPercent, 1)}%
          </span>
        </div>
        <ProgressBar
          value={utilizationPercent}
          tone={utilizationTone(utilization)}
        />
      </div>
    </Panel>
  );
}