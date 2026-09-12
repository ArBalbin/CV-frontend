import { ChartData } from "chart.js";
import { Line } from "react-chartjs-2";
import { Activity, RotateCcw } from "lucide-react";
import { Panel } from "../ui";
import { queueChartOptions } from "./chartConfig";

interface QueueTrendPanelProps {
  chartData: ChartData<"line">;
  onClear: () => void;
}

export default function QueueTrendPanel({
  chartData,
  onClear,
}: QueueTrendPanelProps) {
  return (
    <Panel className="p-5 border border-zinc-600/80 bg-[#212833] shadow-lg shadow-black/25 rounded-sm transition hover:border-zinc-500 text-zinc-100">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-zinc-600/60 bg-[#283140] p-2 text-amber-400 shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Queue Trend
            </h2>
            <p className="text-sm text-zinc-400">
              Queue length and estimated wait time.
            </p>
          </div>
        </div>
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-600/60 bg-[#283140] px-3.5 py-1.5 text-sm font-medium text-zinc-100 hover:bg-zinc-700 shadow-sm transition"
        >
          <RotateCcw className="h-4 w-4 text-zinc-400" />
          Clear
        </button>
      </div>

      <div className="h-px bg-zinc-500 mb-4 -mx-5"/>

      <div className="h-80 rounded-md border border-zinc-600/60 bg-[#283140] p-4 shadow-sm">
        <Line data={chartData} options={queueChartOptions} />
      </div>
    </Panel>
  );
}
