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
  QueueState,
} from "../types/api";
import { formatTimestamp, numberLabel } from "../utils/format";

import { QueueMetricsGrid } from "../components/queueAnalytics/QueueMetricsGrid";
import { QueueForecastSummary } from "../components/queueAnalytics/QueueForecastSummary";
import { QueueEstimatesList } from "../components/queueAnalytics/QueueEstimatesList";
import { QueueChartsSection } from "../components/queueAnalytics/QueueChartsSection";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

interface TrendSample {
  label: string;
  queueLength: number;
  waitTime: number;
}

const emptyQueueState: QueueState = {
  active_queue: [],
  queue_count: 0,
  next_number: 1,
  total_served: 0,
  completed: [],
  noshow_alerts: [],
  on_way_notifications: [],
  appearance_rejections: [],
  counter_assignments: [],
  newly_called: [],
  num_counters: 3,
};

const emptyQueueData: QueueData = {
  count: 0,
  avg_density: 0,
  max_density: 0,
  timestamp: "",
  queue_length: 0,
  estimated_wait_time: 0,
  active_counters: 3,
  arrival_rate: 0,
  system_utilization: 0,
  predicted_wait_5min: 0,
  predicted_wait_15min: 0,
  predicted_wait_30min: 0,
  ...emptyQueueState,
};

function utilizationTone(value: number): "green" | "amber" | "red" {
  if (value >= 0.9) return "red";
  if (value >= 0.7) return "amber";
  return "green";
}

function queueLabel(value: number) {
  return `Q${String(value).padStart(3, "0")}`;
}

function analyticsToQueueData(analytics: QueueAnalyticsResponse): QueueData {
  const liveCrowd = analytics.live_crowd || emptyQueueData;
  const forecast = analytics.forecast;

  return {
    ...emptyQueueData,
    ...liveCrowd,
    queue_length: analytics.overview.queue_length,
    queue_count: analytics.overview.queue_length,
    next_number: analytics.overview.next_number,
    total_served: analytics.overview.total_served,
    active_counters: analytics.overview.active_counters,
    estimated_wait_time:
      analytics.new_arrival?.estimated_wait_time_minutes ||
      forecast?.now?.estimated_wait_time_minutes ||
      0,
    predicted_wait_5min: forecast?.in_5min?.estimated_wait_time_minutes || 0,
    predicted_wait_15min: forecast?.in_15min?.estimated_wait_time_minutes || 0,
    predicted_wait_30min: forecast?.in_30min?.estimated_wait_time_minutes || 0,
    noshow_alerts: analytics.noshow_alerts || [],
    appearance_rejections: analytics.appearance_rejections || [],
    completed: analytics.recent_completed || [],
  };
}

export default function QueueAnalytics() {
  const [queueData, setQueueData] = useState<QueueData>(emptyQueueData);
  const [analytics, setAnalytics] = useState<QueueAnalyticsResponse | null>(
    null,
  );
  const [crowdHistory, setCrowdHistory] = useState<
    Array<{ label: string; count: number }>
  >([]);
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
    () => ({
      labels: crowdHistory.map((sample) => sample.label),
      datasets: [
        {
          label: "People count",
          data: crowdHistory.map((sample) => sample.count),
          borderColor: "#14b8a6",
          backgroundColor: "rgba(20, 184, 166, 0.12)",
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
        },
      ],
    }),
    [crowdHistory],
  );

  const queueTrendData = useMemo(
    () => ({
      labels: trendSamples.map((sample) => sample.label),
      datasets: [
        {
          label: "Queue length",
          data: trendSamples.map((sample) => sample.queueLength),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.12)",
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          yAxisID: "y",
        },
        {
          label: "Wait time",
          data: trendSamples.map((sample) => sample.waitTime),
          borderColor: "#f59e0b",
          backgroundColor: "rgba(245, 158, 11, 0.1)",
          borderWidth: 2,
          fill: false,
          tension: 0.35,
          pointRadius: 0,
          yAxisID: "y1",
        },
      ],
    }),
    [trendSamples],
  );

  const baseChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index" as const, intersect: false },
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          labels: { color: "#a1a1aa", usePointStyle: true },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#a1a1aa", maxTicksLimit: 8 },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(63, 63, 70, 0.4)" },
          ticks: { color: "#a1a1aa", precision: 0 },
        },
      },
    }),
    [],
  );

  const queueChartOptions = useMemo(
    () => ({
      ...baseChartOptions,
      scales: {
        x: baseChartOptions.scales.x,
        y: {
          type: "linear" as const,
          position: "left" as const,
          beginAtZero: true,
          grid: { color: "rgba(63, 63, 70, 0.4)" },
          ticks: { color: "#a1a1aa", precision: 0 },
        },
        y1: {
          type: "linear" as const,
          position: "right" as const,
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          ticks: { color: "#a1a1aa" },
        },
      },
    }),
    [baseChartOptions],
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
        <div className="mb-4 flex items-center justify-between gap-3 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {lastError}
          </div>
          <button
            onClick={() => setLastError("")}
            className="font-semibold text-red-300 hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Live Overview
          </h3>
          <QueueMetricsGrid
            queueData={queueData}
            analytics={analytics}
            utilizationPercent={utilizationPercent}
            queueLabel={queueLabel}
          />
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Forecasting & Active Queue
          </h3>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(420px,0.9fr)]">
            <QueueForecastSummary
              queueData={queueData}
              analytics={analytics}
              forecastRows={forecastRows}
              utilizationPercent={utilizationPercent}
              completionRate={completionRate}
              utilizationTone={utilizationTone}
            />
            <QueueEstimatesList analytics={analytics} isLoading={isLoading} />
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Trends & History
          </h3>
          <QueueChartsSection
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
