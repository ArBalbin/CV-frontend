import { ChartData } from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Activity,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Eye,
  RotateCcw,
  Users,
} from "lucide-react";
import { MetricCard, Panel } from "../ui";
import { QueueData } from "../../types/api";
import { formatAgeSeconds, numberLabel } from "../../utils/format";
import { peopleChartOptions } from "./chartConfig";

interface DetectionPanelProps {
  show: boolean;
  onToggle: () => void;
  data: QueueData;
  peopleChartData: ChartData<"line">;
  onClearPeopleSamples: () => void;
}

export default function DetectionPanel({
  show,
  onToggle,
  data,
  peopleChartData,
  onClearPeopleSamples,
}: DetectionPanelProps) {
  return (
    <Panel className="p-5 border border-zinc-600/80 bg-[#212833] shadow-lg shadow-black/25 rounded-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 text-left focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-zinc-700/60 p-2.5 text-emerald-400 shadow-inner">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Camera &amp; Detection
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              People detection, density, and camera health — usually only needed
              when troubleshooting.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded border border-zinc-600/80 bg-[#283140] px-3 py-1.5 text-xs font-semibold text-zinc-200 shadow-sm transition hover:bg-zinc-700">
          {show ? "Hide" : "Show"}
          {show ? (
            <ChevronUp className="h-4 w-4 text-emerald-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-emerald-400" />
          )}
        </span>
      </button>

      {show && (
        <div className="mt-5 border-t border-zinc-700/80 pt-5 space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              icon={Users}
              label="People detected"
              value={data.count}
              detail={formatAgeSeconds(data.timestamp)}
              tone="blue"
            />
            <MetricCard
              icon={Activity}
              label="Average density"
              value={numberLabel(data.avg_density, 2)}
              detail="People per grid cell"
              tone="teal"
            />
            <MetricCard
              icon={BarChart3}
              label="Maximum density"
              value={numberLabel(data.max_density, 2)}
              detail="Busiest grid cell"
              tone="amber"
            />
          </div>

          <div className="rounded-sm border border-zinc-700/80 bg-[#181d24] p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-zinc-200">
                People count trend
              </h3>
              <button
                onClick={onClearPeopleSamples}
                className="inline-flex items-center gap-2 border border-zinc-500 bg-[#283140] px-3 py-1.5 text-xs font-medium text-zinc-100 transition hover:bg-zinc-700 rounded-md shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5 text-emerald-400" />
                Clear
              </button>
            </div>
            <div className="h-72">
              <Line data={peopleChartData} options={peopleChartOptions} />
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
