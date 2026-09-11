import { Line } from "react-chartjs-2";
import { BarChart3, RotateCcw } from "lucide-react";
import { Panel } from "../ui";
import { ChartData, ChartOptions } from "chart.js";

interface PeopleTrendChartProps {
  chartData: ChartData<"line">;
  chartOptions: ChartOptions<"line">;
  onClear: () => void;
}

export function PeopleTrendChart({
  chartData,
  chartOptions,
  onClear,
}: PeopleTrendChartProps) {
  return (
    <Panel className="p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded border border-signal/30 p-1 text-signal">
            <BarChart3 className="h-6 w-auto" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              People count trend
            </h2>
          </div>
        </div>
        <button onClick={onClear} className="btn-secondary">
          <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
          Clear
        </button>
      </div>
      <div className="h-px bg-zinc-600 -mx-5 mb-4" />

      <div className="h-80">
        <Line data={chartData} options={chartOptions} />
      </div>
    </Panel>
  );
}
