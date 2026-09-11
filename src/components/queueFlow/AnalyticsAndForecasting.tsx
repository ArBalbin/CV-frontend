import { Line } from "react-chartjs-2";
import { Activity, ShieldAlert, RotateCcw } from "lucide-react";
import { EmptyState, Panel, StatusBadge } from "../ui";
import { QueueState } from "../../types/api";
import { WaitTimeForecast } from "./WaitTimeForecast";

interface QueueTrendAndExceptionsProps {
  chartData: any;
  chartOptions: any;
  onClearChart: () => void;
  queueState: QueueState;
  data: any;
  prediction: any;
  utilizationPercent: any;
  utilization: any;
  utilizationTone: any;
}

export function QueueTrendAndExceptions({
  data,
  prediction,
  utilizationPercent,
  utilization,
  utilizationTone,
  chartData,
  chartOptions,
  onClearChart,
  queueState,
}: QueueTrendAndExceptionsProps) {
  return (
    <div className="mt-5 flex flex-col gap-5">
      <Panel className="p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded border border-zinc-800 p-2 text-zinc-400">
              <Activity className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Queue Trend
              </h2>
              <p className="font-mono text-xs text-zinc-500">
                Queue length and estimated wait time.
              </p>
            </div>
          </div>
          <button
            onClick={onClearChart}
            className="inline-flex items-center gap-1.5 rounded border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
            Clear
          </button>
        </div>
        <div className="h-px bg-zinc-600 -mx-5 mb-4" />

        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 items-stretch">
        <WaitTimeForecast
          data={data}
          prediction={prediction}
          utilizationPercent={utilizationPercent}
          utilizationTone={utilizationTone}
          utilization={utilization}
        />

        <Panel className="p-5 flex flex-col h-full">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert
              className="h-5 w-5 text-amber-signal"
              strokeWidth={1.75}
            />
            <h2 className="text-base font-semibold text-zinc-100">
              Exceptions
            </h2>
          </div>
          <div className="h-px bg-zinc-600 -mx-5 mb-4" />

          {queueState.appearance_rejections.length === 0 &&
          queueState.completed.length === 0 ? (
            <div className="py-4 h-full flex items-center justify-center">
              <EmptyState icon={ShieldAlert} title="No recent exceptions" />
            </div>
          ) : (
            <div className="space-y-4">
              {queueState.appearance_rejections.length > 0 && (
                <div>
                  <p className="mb-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
                    Appearance rejections
                  </p>
                  <div className="space-y-2">
                    {queueState.appearance_rejections
                      .slice()
                      .reverse()
                      .map((rejection, index) => (
                        <div
                          key={`${rejection.queue_number}-${index}`}
                          className="rounded border border-amber-signal/30 bg-amber-signal/10 px-3 py-2 font-mono text-xs text-amber-signal"
                        >
                          <span className="font-semibold">
                            {rejection.queue_number}
                          </span>
                          <span className="mx-2 opacity-75">mismatch at</span>
                          <span>{rejection.at}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {queueState.completed.length > 0 && (
                <div>
                  <p className="mb-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
                    Recently completed
                  </p>
                  <div className="space-y-2">
                    {queueState.completed
                      .slice()
                      .reverse()
                      .map((person) => (
                        <div
                          key={`${person.queue_number}-${person.completed_at}`}
                          className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-300"
                        >
                          <span className="font-mono font-semibold text-zinc-100">
                            {person.queue_label}
                          </span>
                          <span className="font-mono text-zinc-500">
                            {person.total_wait_time || person.wait_time}
                          </span>
                          <StatusBadge
                            label={
                              person.bump_reason === "no_show"
                                ? "No-show"
                                : "Served"
                            }
                            tone={
                              person.bump_reason === "no_show"
                                ? "amber"
                                : "green"
                            }
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
