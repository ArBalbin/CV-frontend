import { Line } from "react-chartjs-2";
import { Activity, Users } from "lucide-react";
import { Panel } from "../../components/ui";

interface QueueChartsSectionProps {
  queueTrendData: any;
  queueChartOptions: any;
  crowdChartData: any;
  baseChartOptions: any;
}

export function QueueChartsSection({
  queueTrendData,
  queueChartOptions,
  crowdChartData,
  baseChartOptions,
}: QueueChartsSectionProps) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
      <Panel className="p-5">
        <div className="mb-5 flex items-center gap-3">
          <Activity className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-zinc-100">
            Queue Length vs Wait Time
          </h2>
        </div>
        <div className="h-px bg-zinc-600 -mx-5 mb-4" />

        <div className="h-80">
          <Line data={queueTrendData} options={queueChartOptions} />
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="mb-5 flex items-center gap-3">
          <Users className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-semibold text-zinc-100">
            People History
          </h2>
        </div>
        <div className="h-px bg-zinc-600 -mx-5 mb-4" />

        <div className="h-80">
          <Line data={crowdChartData} options={baseChartOptions} />
        </div>
      </Panel>
    </div>
  );
}
