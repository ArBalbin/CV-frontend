import { BarChart3, Hash } from "lucide-react";
import { EmptyState, Panel } from "../../components/ui";
import { QueueAnalytics as QueueAnalyticsResponse } from "../../types/api";

interface QueueEstimatesListProps {
  analytics: QueueAnalyticsResponse | null;
  isLoading: boolean;
}

export function QueueEstimatesList({
  analytics,
  isLoading,
}: QueueEstimatesListProps) {
  return (
    <Panel className="p-5 flex flex-col">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-blue-400" />
        <h2 className="text-base font-semibold text-zinc-100">
          Current Queue Estimates
        </h2>
      </div>
      <div className="h-px bg-zinc-600 -mx-5 mb-4" />

      {analytics?.active_queue.length ? (
        <div className="space-y-2">
          {analytics.active_queue.slice(0, 8).map((person) => (
            <div
              key={person.queue_number}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm transition-all hover:bg-zinc-900"
            >
              <div>
                <p className="font-semibold text-zinc-100">
                  {person.queue_label}
                </p>
                <p className="text-xs text-zinc-400">
                  Position {person.position}
                </p>
              </div>
              <span className="font-semibold text-zinc-300">
                {person.estimated_wait_time_label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 h-full">
          <EmptyState
            icon={Hash}
            title={
              isLoading
                ? "Loading queue estimates"
                : "No active queue estimates"
            }
          />
        </div>
      )}
    </Panel>
  );
}
