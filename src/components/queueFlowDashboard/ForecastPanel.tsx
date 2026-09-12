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
    <Panel className="p-5 border border-zinc-600/80 bg-[#212833] shadow-lg shadow-black/25 rounded-sm transition hover:border-zinc-500 text-zinc-100">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">
            Wait-Time Forecast
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            New arrival:{" "}
            <span className="font-semibold text-zinc-100">
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

      <div className="h-px bg-zinc-500 mb-4 -mx-5"/>

      <div className="grid gap-3 md:grid-cols-4">
        {forecastCards.map((forecast) => (
          <div
            key={forecast.horizon_minutes}
            className="rounded-md border border-zinc-600/60 bg-[#283140] p-4 text-zinc-100 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {forecast.horizon_minutes === 0
                  ? "Now"
                  : `In ${forecast.horizon_minutes} min`}
              </span>
              <Clock3 className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-4 font-mono text-2xl font-semibold text-zinc-100">
              {forecast.estimated_wait_time_label}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              {numberLabel(forecast.estimated_wait_time_minutes)} minutes
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-md border border-zinc-600/60 bg-[#283140] p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-semibold text-zinc-300">
            System utilization
          </span>
          <span className="font-mono font-semibold text-zinc-100">
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