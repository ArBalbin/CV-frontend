import { ChartData, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import { Activity, Users } from "lucide-react";
import { Panel } from "../ui";

interface TrendChartsProps {
  queueTrendData: ChartData<"line">;
  queueChartOptions: ChartOptions<"line">;
  crowdChartData: ChartData<"line">;
  baseChartOptions: ChartOptions<"line">;
}

export default function TrendCharts({
  queueTrendData,
  queueChartOptions,
  crowdChartData,
  baseChartOptions,
}: TrendChartsProps) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
      <Panel className="border-zinc-200/80 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded bg-emerald-200/10 p-2 text-emerald-600">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Queue Length vs Wait Time
            </h2>
            <p className="text-sm text-zinc-500">
              Live samples collected while this page is open.
            </p>
          </div>
        </div>
        <div className="h-px bg-zinc-300 mb-4 -mx-5" />

        <div className="h-80">
          <Line data={queueTrendData} options={queueChartOptions} />
        </div>
      </Panel>

      <Panel className="border-zinc-200/80 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded bg-emerald-200/10 p-2 text-emerald-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              People History
            </h2>
            <p className="text-sm text-zinc-500">
              Rolling count from `/api/history`.
            </p>
          </div>
        </div>
        <div className="h-px bg-zinc-300 mb-4 -mx-5" />

        <div className="h-80">
          <Line data={crowdChartData} options={baseChartOptions} />
        </div>
      </Panel>
    </div>
  );
}
