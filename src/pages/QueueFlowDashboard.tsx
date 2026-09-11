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
import {
  CheckCircle2,
  Clock3,
  Gauge,
  Hash,
  Pause,
  Play,
  RefreshCcw,
  Timer,
  TrendingUp,
  Users,
  LayoutDashboard,
  BarChart3,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { MetricCard, Panel, StatusBadge } from "../components/ui";
import { apiClient } from "../config/api";
import {
  HealthStatus,
  QueueData,
  QueuePrediction,
  QueueState,
  QueueZone,
} from "../types/api";
import { formatTimestamp, numberLabel } from "../utils/format";

import { QueueAlerts } from "../components/queueFlow/QueueAlerts";
import { QueueCameraStream } from "../components/queueFlow/QueueCameraStream";
import { QueueTrackerList } from "../components/queueFlow/QueueTrackerList";
import { ServiceAndStatusPanels } from "../components/queueFlow/ServiceAndStatusPanels";
import { QueueTrendAndExceptions } from "../components/queueFlow/AnalyticsAndForecasting";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

interface QueueChartSample {
  label: string;
  queue: number;
  wait: number;
}

const initialQueueState: QueueState = {
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

const initialQueueData: QueueData = {
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
  ...initialQueueState,
};

function queueLabel(number: number) {
  return `Q${String(number).padStart(3, "0")}`;
}

function extractQueueState(data: QueueData): QueueState {
  return {
    active_queue: data.active_queue || [],
    queue_count: data.queue_count || data.queue_length || 0,
    next_number: data.next_number || 1,
    total_served: data.total_served || 0,
    completed: data.completed || [],
    noshow_alerts: data.noshow_alerts || [],
    on_way_notifications: data.on_way_notifications || [],
    appearance_rejections: data.appearance_rejections || [],
    counter_assignments: data.counter_assignments || [],
    newly_called: data.newly_called || [],
    num_counters: data.num_counters ?? 3,
  };
}

function positionTone(
  status: string,
  counterNumber?: number | null,
): "green" | "amber" | "blue" | "slate" {
  if (status === "missing") return "amber";
  if (counterNumber != null) return "green";
  return "slate";
}

function utilizationTone(utilization: number): "green" | "amber" | "red" {
  if (utilization >= 0.9) return "red";
  if (utilization >= 0.7) return "amber";
  return "green";
}

export default function QueueFlowDashboard() {
  const [data, setData] = useState<QueueData>(initialQueueData);
  const [queueState, setQueueState] = useState<QueueState>(initialQueueState);
  const [prediction, setPrediction] = useState<QueuePrediction | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [zone, setZone] = useState<QueueZone | null>(null);
  const [chartSamples, setChartSamples] = useState<QueueChartSample[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [markingDone, setMarkingDone] = useState<number | null>(null);
  const [noshowWindow, setNoshowWindow] = useState(180);
  const [noshowInput, setNoshowInput] = useState("180");
  const [savingNoshow, setSavingNoshow] = useState(false);
  const [savedNoshow, setSavedNoshow] = useState(false);
  const [lastError, setLastError] = useState("");
  const [streamError, setStreamError] = useState(false);
  const [streamKey, setStreamKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"operations" | "analytics">(
    "operations",
  );

  useEffect(() => {
    if (!streamError) return;
    const t = window.setTimeout(() => {
      setStreamKey((k) => k + 1);
      setStreamError(false);
    }, 5000);
    return () => window.clearTimeout(t);
  }, [streamError]);

  const fetchHealth = async () => {
    try {
      const response = await apiClient.get<HealthStatus>("/health");
      setHealth(response.data);
    } catch {
      setHealth(null);
    }
  };

  const fetchZone = async () => {
    try {
      const response = await apiClient.get<QueueZone>("/api/queue/zone");
      setZone(response.data);
    } catch {
      setZone(null);
    }
  };

  const fetchPrediction = async () => {
    try {
      const response = await apiClient.get<QueuePrediction>(
        "/api/queue/prediction",
      );
      setPrediction(response.data);
    } catch {
      setPrediction(null);
    }
  };

  const fetchNoshowConfig = async () => {
    try {
      const response = await apiClient.get<{ noshow_window_seconds: number }>(
        "/api/queue/noshow_config",
      );
      setNoshowWindow(response.data.noshow_window_seconds);
      setNoshowInput(String(response.data.noshow_window_seconds));
    } catch {
      setLastError("No-show settings are unavailable.");
    }
  };

  const fetchData = async () => {
    try {
      const response = await apiClient.get<QueueData>("/api/queue/data");
      const queueData = response.data;
      setData(queueData);
      setQueueState(extractQueueState(queueData));
      setIsConnected(true);
      setLastError("");

      if (!isPaused) {
        setChartSamples((current) => {
          const next = [
            ...current,
            {
              label: formatTimestamp(queueData.timestamp),
              queue: queueData.queue_length || queueData.queue_count || 0,
              wait: queueData.estimated_wait_time || 0,
            },
          ];
          return next.slice(-60);
        });
      }
    } catch {
      setIsConnected(false);
      setLastError("Queue metrics are unavailable.");
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      fetchHealth(),
      fetchZone(),
      fetchPrediction(),
      fetchData(),
      fetchNoshowConfig(),
    ]);
  };

  useEffect(() => {
    refreshAll();

    const dataInterval = window.setInterval(() => {
      if (!isPaused) {
        fetchData();
        fetchPrediction();
      }
    }, 3000);
    const healthInterval = window.setInterval(fetchHealth, 5000);

    return () => {
      window.clearInterval(dataInterval);
      window.clearInterval(healthInterval);
    };
  }, [isPaused]);

  const markDone = async (queueNumber: number) => {
    setMarkingDone(queueNumber);
    try {
      await apiClient.post("/api/queue/done", { queue_number: queueNumber });
      await Promise.all([fetchData(), fetchPrediction()]);
    } catch {
      setLastError(`Could not complete ${queueLabel(queueNumber)}.`);
    } finally {
      setMarkingDone(null);
    }
  };

  const resetQueue = async () => {
    if (!confirm("Reset the entire queue?")) return;
    try {
      await apiClient.post("/api/queue/reset");
      await Promise.all([fetchData(), fetchPrediction()]);
    } catch {
      setLastError("Could not reset the queue.");
    }
  };

  const adjustCounters = async (change: number) => {
    const nextCount = Math.max(1, Math.min(10, data.active_counters + change));
    try {
      await apiClient.post("/api/queue/adjust_counters", {
        counters: nextCount,
      });
      setData((current) => ({ ...current, active_counters: nextCount }));
      await Promise.all([fetchData(), fetchPrediction()]);
    } catch {
      setLastError("Could not update service counters.");
    }
  };

  const saveNoshowConfig = async () => {
    const seconds = Number.parseInt(noshowInput, 10);
    if (Number.isNaN(seconds) || seconds < 30 || seconds > 300) {
      setLastError("No-show window must be between 30 and 300 seconds.");
      return;
    }

    setSavingNoshow(true);
    try {
      await apiClient.post("/api/queue/noshow_config", { seconds });
      setNoshowWindow(seconds);
      setSavedNoshow(true);
      window.setTimeout(() => setSavedNoshow(false), 1800);
    } catch {
      setLastError("Could not save no-show settings.");
    } finally {
      setSavingNoshow(false);
    }
  };

  const chartData = useMemo(
    () => ({
      labels: chartSamples.map((sample) => sample.label),
      datasets: [
        {
          label: "Queue length",
          data: chartSamples.map((sample) => sample.queue),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.12)",
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          yAxisID: "y",
        },
        {
          label: "Wait time",
          data: chartSamples.map((sample) => sample.wait),
          borderColor: "#d97706",
          backgroundColor: "rgba(217, 119, 6, 0.1)",
          borderWidth: 2,
          fill: false,
          tension: 0.35,
          pointRadius: 0,
          yAxisID: "y1",
        },
      ],
    }),
    [chartSamples],
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index" as const, intersect: false },
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          labels: { color: "#475569", usePointStyle: true },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#64748b", maxTicksLimit: 8 },
        },
        y: {
          type: "linear" as const,
          position: "left" as const,
          beginAtZero: true,
          grid: { color: "rgba(148, 163, 184, 0.24)" },
          ticks: { color: "#64748b", precision: 0 },
        },
        y1: {
          type: "linear" as const,
          position: "right" as const,
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          ticks: { color: "#64748b" },
        },
      },
    }),
    [],
  );

  const utilization = Math.max(
    0,
    data.system_utilization || prediction?.system_utilization || 0,
  );
  const utilizationPercent = Math.min(utilization * 100, 100);

  return (
    <DashboardLayout
      title="Queue Flow Dashboard"
      actions={
        <>
          <StatusBadge
            label={
              prediction?.data_status === "stale"
                ? "Prediction stale"
                : isConnected
                  ? "Live metrics"
                  : "Metrics offline"
            }
            tone={
              prediction?.data_status === "stale"
                ? "amber"
                : isConnected
                  ? "green"
                  : "red"
            }
          />
          <button onClick={refreshAll} className="btn-secondary">
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsPaused((current) => !current)}
            className="btn-primary"
          >
            {isPaused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
            {isPaused ? "Resume" : "Pause"}
          </button>
        </>
      }
    >
      <QueueAlerts
        lastError={lastError}
        onDismissError={() => setLastError("")}
        queueState={queueState}
        onMarkDone={markDone}
      />

      <Panel className="rounded-sm overflow-hidden mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-7 divide-y sm:divide-y-0 sm:divide-x divide-zinc-700/60">
          <MetricCard
            icon={Users}
            label="Queue length"
            value={queueState.queue_count}
            detail={`Next ${queueLabel(queueState.next_number)}`}
            tone="blue"
          />
          <MetricCard
            icon={Timer}
            label="Current wait"
            value={`${numberLabel(data.estimated_wait_time)} min`}
            detail="Estimated wait"
            tone="amber"
          />
          <MetricCard
            icon={Hash}
            label="Counters"
            value={data.active_counters}
            detail="Active service points"
            tone="slate"
          />
          <MetricCard
            icon={Clock3}
            label="Avg service time"
            value={
              prediction
                ? `${prediction.avg_service_time_min} min`
                : `${numberLabel(data.estimated_wait_time || 3)} min`
            }
            detail={
              prediction?.service_time_source === "measured"
                ? "Measured from DB"
                : "Default (.env)"
            }
            tone={
              prediction?.service_time_source === "measured" ? "green" : "slate"
            }
          />
          <MetricCard
            icon={Gauge}
            label="Utilization"
            value={`${numberLabel(utilizationPercent, 1)}%`}
            detail={utilization >= 0.9 ? "High load" : "Within range"}
            tone={
              utilization >= 0.9
                ? "red"
                : utilization >= 0.7
                  ? "amber"
                  : "green"
            }
          />
          <MetricCard
            icon={TrendingUp}
            label="Arrival rate"
            value={numberLabel(data.arrival_rate, 2)}
            detail="People per minute"
            tone="teal"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Served"
            value={queueState.total_served}
            detail="Completed tickets"
            tone="green"
          />
        </div>
      </Panel>

      <div className="mb-6 flex items-center border-b border-zinc-800 gap-2">
        <button
          onClick={() => setActiveTab("operations")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-medium transition-all ${
            activeTab === "operations"
              ? "border-zinc-200 text-zinc-100 bg-zinc-800/40"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Live Operations
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-medium transition-all ${
            activeTab === "analytics"
              ? "border-zinc-200 text-zinc-100 bg-zinc-800/40"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Analytics & Forecasting
        </button>
      </div>

      {activeTab === "operations" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(420px,0.9fr)]">
            <QueueCameraStream
              data={data}
              health={health}
              streamError={streamError}
              streamKey={streamKey}
              onRetryStream={() => {
                setStreamKey((k) => k + 1);
                setStreamError(false);
              }}
              onStreamError={() => setStreamError(true)}
            />

            <QueueTrackerList
              queueState={queueState}
              markingDone={markingDone}
              onResetQueue={resetQueue}
              onMarkDone={markDone}
              positionTone={positionTone}
              queueLabel={queueLabel}
            />
          </div>

          <div className="grid grid-cols-1 gap-5">
            <ServiceAndStatusPanels
              data={data}
              health={health}
              zone={zone}
              noshowWindow={noshowWindow}
              noshowInput={noshowInput}
              savingNoshow={savingNoshow}
              savedNoshow={savedNoshow}
              onAdjustCounters={adjustCounters}
              onNoshowInputChange={setNoshowInput}
              onSaveNoshowConfig={saveNoshowConfig}
            />
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <QueueTrendAndExceptions
            chartData={chartData}
            chartOptions={chartOptions}
            onClearChart={() => setChartSamples([])}
            queueState={queueState}
            data={data}
            prediction={prediction}
            utilizationPercent={utilizationPercent}
            utilizationTone={utilizationTone}
            utilization={utilization}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
