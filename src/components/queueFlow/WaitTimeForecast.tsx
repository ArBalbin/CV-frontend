import { Clock3 } from "lucide-react";
import { Panel, ProgressBar, StatusBadge } from "../../components/ui";
import { QueueData, QueuePrediction } from "../../types/api";
import { formatAgeSeconds, numberLabel } from "../../utils/format";

interface WaitTimeForecastProps {
  data: QueueData;
  prediction: QueuePrediction | null;
  utilizationPercent: number;
  utilizationTone: (utilization: number) => "green" | "amber" | "red";
  utilization: number;
}

export function WaitTimeForecast({
  data,
  prediction,
  utilizationPercent,
  utilizationTone,
  utilization,
}: WaitTimeForecastProps) {
  const forecastCards = [
    prediction?.forecast.now || {
      horizon_minutes: 0,
      estimated_wait_time: data.estimated_wait_time,
      estimated_wait_time_minutes: data.estimated_wait_time,
      estimated_wait_time_label: `${numberLabel(data.estimated_wait_time)} min`,
    },
    prediction?.forecast.in_5min || {
      horizon_minutes: 5,
      estimated_wait_time: data.predicted_wait_5min,
      estimated_wait_time_minutes: data.predicted_wait_5min,
      estimated_wait_time_label: `${numberLabel(data.predicted_wait_5min)} min`,
    },
    prediction?.forecast.in_15min || {
      horizon_minutes: 15,
      estimated_wait_time: data.predicted_wait_15min,
      estimated_wait_time_minutes: data.predicted_wait_15min,
      estimated_wait_time_label: `${numberLabel(data.predicted_wait_15min)} min`,
    },
    prediction?.forecast.in_30min || {
      horizon_minutes: 30,
      estimated_wait_time: data.predicted_wait_30min,
      estimated_wait_time_minutes: data.predicted_wait_30min,
      estimated_wait_time_label: `${numberLabel(data.predicted_wait_30min)} min`,
    },
  ];

  return (
    <Panel className="p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">
            Wait-Time Forecast
          </h2>
          <p className="mt-1 font-mono text-xs text-zinc-500">
            New arrival:{" "}
            {prediction?.new_arrival.estimated_wait_time_label ||
              `${numberLabel(data.estimated_wait_time)} min`}
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
      <div className="h-px bg-zinc-600 -mx-5 mb-4" />

      <div className="grid gap-3 md:grid-cols-4">
        {forecastCards.map((forecast) => (
          <div
            key={forecast.horizon_minutes}
            className="rounded border border-zinc-800 bg-zinc-900/50 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs uppercase tracking-wide text-zinc-500">
                {forecast.horizon_minutes === 0
                  ? "Now"
                  : `In ${forecast.horizon_minutes} min`}
              </span>
              <Clock3 className="h-4 w-4 text-zinc-400" strokeWidth={1.75} />
            </div>
            <p className="mt-3 font-mono text-2xl font-semibold text-zinc-100">
              {forecast.estimated_wait_time_label}
            </p>
            <p className="mt-1 font-mono text-xs text-zinc-500">
              {numberLabel(forecast.estimated_wait_time_minutes)} minutes
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-300">System utilization</span>
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
