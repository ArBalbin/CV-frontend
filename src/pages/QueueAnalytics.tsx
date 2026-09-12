import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { StatusBadge } from "../components/ui";
import { apiClient } from "../config/api";
import {
  HistoryResponse,
  QueueAnalytics as QueueAnalyticsResponse,
  QueueData,
} from "../types/api";
import { formatTimestamp, numberLabel } from "../utils/format";
import {
  analyticsToQueueData,
  baseChartOptions,
  buildCrowdChartData,
  buildQueueTrendData,
  CrowdSample,
  emptyQueueData,
  queueChartOptions,
  TrendSample,
} from "../components/queueAnalytics/analyticsHelpers";
import MetricsOverview from "../components/queueAnalytics/MetricsOverview";
import SummaryRow from "../components/queueAnalytics/SummaryRow";
import TrendCharts from "../components/queueAnalytics/TrendCharts";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

export default function QueueAnalytics() {
  const [queueData, setQueueData] = useState<QueueData>(emptyQueueData);
  const [analytics, setAnalytics] = useState<QueueAnalyticsResponse | null>(
    null,
  );
  const [crowdHistory, setCrowdHistory] = useState<CrowdSample[]>([]);
  const [trendSamples, setTrendSamples] = useState<TrendSample[]>([]);
  const [lastError, setLastError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const [analyticsResponse, historyResponse] = await Promise.all([
        apiClient.get<QueueAnalyticsResponse>("/api/queue/analytics"),
        apiClient.get<HistoryResponse>("/api/history"),
      ]);

      const nextQueueData = analyticsToQueueData(analyticsResponse.data);
      setQueueData(nextQueueData);
      setAnalytics(analyticsResponse.data);
      setCrowdHistory(
        historyResponse.data.history.slice(-60).map((point) => ({
          label: formatTimestamp(point.timestamp),
          count: point.count,
        })),
      );
      setTrendSamples((current) => {
        const next = [
          ...current,
          {
            label: formatTimestamp(nextQueueData.timestamp),
            queueLength:
              nextQueueData.queue_length || nextQueueData.queue_count || 0,
            waitTime: nextQueueData.estimated_wait_time || 0,
          },
        ];
        return next.slice(-60);
      });
      setLastError("");
    } catch {
      setLastError(
        "Queue analytics are unavailable. Check the backend connection and login session.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = window.setInterval(fetchAnalytics, 3000);
    return () => window.clearInterval(interval);
  }, []);

  const crowdChartData = useMemo(
    () => buildCrowdChartData(crowdHistory),
    [crowdHistory],
  );
  const queueTrendData = useMemo(
    () => buildQueueTrendData(trendSamples),
    [trendSamples],
  );

  const utilization = queueData.system_utilization || 0;
  const utilizationPercent = Math.min(Math.max(utilization * 100, 0), 100);
  const completionRate = analytics?.overview.completion_rate_percent || 0;

  const forecast = analytics?.forecast;
  const forecastRows = [
    {
      label: "Now",
      value:
        forecast?.now.estimated_wait_time_label ||
        `${numberLabel(queueData.estimated_wait_time)} min`,
    },
    {
      label: "In 5 min",
      value:
        forecast?.in_5min.estimated_wait_time_label ||
        `${numberLabel(queueData.predicted_wait_5min)} min`,
    },
    {
      label: "In 15 min",
      value:
        forecast?.in_15min.estimated_wait_time_label ||
        `${numberLabel(queueData.predicted_wait_15min)} min`,
    },
    {
      label: "In 30 min",
      value:
        forecast?.in_30min.estimated_wait_time_label ||
        `${numberLabel(queueData.predicted_wait_30min)} min`,
    },
  ];

  return (
    <DashboardLayout
      title="Queue Analytics"
      subtitle="Read-only performance view for wait-time forecasts, demand trends, and queue throughput."
      eyebrow="Analytics"
      actions={
        <>
          <StatusBadge
            label={
              analytics?.overview.data_status === "stale"
                ? "Stale data"
                : "Live analytics"
            }
            tone={
              analytics?.overview.data_status === "stale" ? "amber" : "green"
            }
          />
          <button onClick={fetchAnalytics} className="btn-secondary">
            <RefreshCcw className="h-4 w-4" />
          </button>
        </>
      }
    >
      {lastError && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-sm border border-red-500/40 bg-red-950/60 px-4 py-3 text-sm text-red-200 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {lastError}
          </div>
          <button
            onClick={() => setLastError("")}
            className="font-semibold text-brick-signal"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Metrics Overview
          </h2>
          <MetricsOverview
            queueData={queueData}
            analytics={analytics}
            utilizationPercent={utilizationPercent}
          />
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Forecast Summary & Queue Estimates
          </h2>
          <SummaryRow
            queueData={queueData}
            analytics={analytics}
            forecastRows={forecastRows}
            utilization={utilization}
            utilizationPercent={utilizationPercent}
            completionRate={completionRate}
            isLoading={isLoading}
          />
        </div>

        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Performance Trends & History
          </h2>
          <TrendCharts
            queueTrendData={queueTrendData}
            queueChartOptions={queueChartOptions}
            crowdChartData={crowdChartData}
            baseChartOptions={baseChartOptions}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
