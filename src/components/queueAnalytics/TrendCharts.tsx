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
      <Panel className="border-zinc-600/80 bg-[#212833] p-5 shadow-lg shadow-black/25">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded bg-emerald-500/10 p-2 text-emerald-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Queue Length vs Wait Time
            </h2>
            <p className="text-sm text-zinc-400">
              Live samples collected while this page is open.
            </p>
          </div>
        </div>
        <div className="h-px bg-zinc-500 mb-4 -mx-5" />

        <div className="h-80">
          <Line data={queueTrendData} options={queueChartOptions} />
        </div>
      </Panel>

      <Panel className="border-zinc-600/80 bg-[#212833] p-5 shadow-lg shadow-black/25">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded bg-emerald-500/10 p-2 text-emerald-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              People History
            </h2>
            <p className="text-sm text-zinc-400">
              Rolling count from `/api/history`.
            </p>
          </div>
        </div>
        <div className="h-px bg-zinc-500 mb-4 -mx-5" />

        <div className="h-80">
          <Line data={crowdChartData} options={baseChartOptions} />
        </div>
      </Panel>
    </div>
  );
}
