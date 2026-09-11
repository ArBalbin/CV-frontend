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
  Pause,
  Play,
  RefreshCcw,
  LayoutDashboard,
  BarChart3,
  History,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { StatusBadge } from "../components/ui";
import { AlertBanners } from "../components/cv/AlertBanners";
import { MetricsRow } from "../components/cv/MetricsRow";
import { CameraStreamPanel } from "../components/cv/CameraStreamPanel";
import { SystemHealthPanel } from "../components/cv/SystemHealthPanel";
import { QueueSnapshotPanel } from "../components/cv/QueueSnapshotPanel";
import { PeopleTrendChart } from "../components/cv/PeopleTrendChart";
import { ActiveQueuePanel } from "../components/cv/ActiveQueuePanel";
import { CompletedAndRejectionsPanel } from "../components/cv/CompletedAndRejectionsPanel";
import { queueLabel } from "../components/cv/helpers";
import { API_BASE_URL, apiClient } from "../config/api";
import {
  CrowdData,
  HealthStatus,
  HistoryResponse,
  QueueState,
  QueueZone,
} from "../types/api";
import { formatTimestamp } from "../utils/format";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

interface ChartSample {
  label: string;
  count: number;
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

const initialCrowdData: CrowdData = {
  count: 0,
  avg_density: 0,
  max_density: 0,
  timestamp: "",
};

export default function ComputerVisionDashboard() {
  const [data, setData] = useState<CrowdData>(initialCrowdData);
  const [queueState, setQueueState] = useState<QueueState>(initialQueueState);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [zone, setZone] = useState<QueueZone | null>(null);
  const [samples, setSamples] = useState<ChartSample[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [streamKey, setStreamKey] = useState(0);
  const [markingDone, setMarkingDone] = useState<number | null>(null);
  const [addingManual, setAddingManual] = useState(false);
  const [lastError, setLastError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "operations" | "analytics" | "history"
  >("operations");

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

  const loadHistory = async () => {
    try {
      const response = await apiClient.get<HistoryResponse>("/api/history");
      const historySamples = response.data.history.map((point) => ({
        label: formatTimestamp(point.timestamp),
        count: point.count,
      }));
      setSamples(historySamples.slice(-60));
    } catch {
      setSamples([]);
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

  const fetchCrowd = async () => {
    try {
      const response = await apiClient.get<CrowdData>("/api/crowd/data");
      const crowd = response.data;
      setData(crowd);
      setIsConnected(true);
      setLastError("");

      if (!isPaused) {
        setSamples((current) => {
          const next = [
            ...current,
            { label: formatTimestamp(crowd.timestamp), count: crowd.count },
          ];
          return next.slice(-60);
        });
      }
    } catch {
      setIsConnected(false);
      setLastError("People data is unavailable.");
    }
  };

  const fetchQueue = async () => {
    try {
      const response = await apiClient.get<QueueState>("/api/queue/list");
      setQueueState(response.data);
    } catch {
      setLastError("Queue data is unavailable.");
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchHealth(), fetchZone(), fetchCrowd(), fetchQueue()]);
  };

  useEffect(() => {
    refreshAll();
    loadHistory();

    const dataInterval = window.setInterval(() => {
      if (!isPaused) {
        fetchCrowd();
        fetchQueue();
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
      await fetchQueue();
    } catch {
      setLastError(`Could not complete ${queueLabel(queueNumber)}.`);
    } finally {
      setMarkingDone(null);
    }
  };

  const forceNewPerson = async () => {
    setAddingManual(true);
    try {
      await apiClient.post("/api/queue/force-new");
      await fetchQueue();
    } catch {
      setLastError("Could not manually add a queue entry.");
    } finally {
      setAddingManual(false);
    }
  };

  const resetQueue = async () => {
    if (!confirm("Reset the entire queue?")) return;
    try {
      await apiClient.post("/api/queue/reset");
      await fetchQueue();
    } catch {
      setLastError("Could not reset the queue.");
    }
  };

  const chartData = useMemo(
    () => ({
      labels: samples.map((sample) => sample.label),
      datasets: [
        {
          label: "People count",
          data: samples.map((sample) => sample.count),
          borderColor: "#0E7C86",
          backgroundColor: "rgba(14, 124, 134, 0.10)",
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    }),
    [samples],
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index" as const, intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { mode: "index" as const, intersect: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#8A909B",
            maxTicksLimit: 8,
            font: { family: "IBM Plex Mono", size: 10 },
          },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(82, 82, 91, 0.4)" },
          ticks: {
            color: "#8A909B",
            precision: 0,
            font: { family: "IBM Plex Mono", size: 10 },
          },
        },
      },
    }),
    [],
  );

  const activeQueue = queueState.active_queue;
  const firstAlert = queueState.noshow_alerts[0];

  return (
    <DashboardLayout
      title="Computer vision dashboard"
      actions={
        <>
          <StatusBadge
            label={isConnected ? "Live feed" : "Data offline"}
            tone={isConnected ? "green" : "red"}
          />
          <button onClick={refreshAll} className="btn-secondary">
            <RefreshCcw className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            onClick={() => setIsPaused((current) => !current)}
            className="btn-primary"
          >
            {isPaused ? (
              <Play className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Pause className="h-4 w-4" strokeWidth={1.75} />
            )}
            {isPaused ? "Resume" : "Pause"}
          </button>
        </>
      }
    >
      <AlertBanners
        lastError={lastError}
        onDismissError={() => setLastError("")}
        noshowAlerts={queueState.noshow_alerts}
        onWayNotifications={queueState.on_way_notifications}
        onBump={markDone}
      />

      <div className="mb-6">
        <MetricsRow data={data} queueState={queueState} health={health} />
      </div>

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
          Analytics & Health
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-xs font-medium transition-all ${
            activeTab === "history"
              ? "border-zinc-200 text-zinc-100 bg-zinc-800/40"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <History className="h-4 w-4" />
          Completed & Rejections
        </button>
      </div>

      {activeTab === "operations" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(360px,0.9fr)]">
            <CameraStreamPanel
              timestamp={data.timestamp}
              zone={zone}
              health={health}
              streamError={streamError}
              streamKey={streamKey}
              videoUrl={`${API_BASE_URL}/api/crowd/video`}
              onStreamError={() => setStreamError(true)}
              onRetry={() => {
                setStreamKey((k) => k + 1);
                setStreamError(false);
              }}
            />
            <div className="grid gap-6 grid-cols-1">
              <QueueSnapshotPanel
                activeQueue={activeQueue}
                firstAlert={firstAlert}
              />
              <ActiveQueuePanel
                activeQueue={activeQueue}
                addingManual={addingManual}
                markingDone={markingDone}
                onForceNew={forceNewPerson}
                onReset={resetQueue}
                onMarkDone={markDone}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 animate-in fade-in duration-200">
          <PeopleTrendChart
            chartData={chartData}
            chartOptions={chartOptions}
            onClear={() => setSamples([])}
          />
          <SystemHealthPanel health={health} />
        </div>
      )}

      {activeTab === "history" && (
        <div className="animate-in fade-in duration-200">
          <CompletedAndRejectionsPanel
            completed={queueState.completed}
            appearanceRejections={queueState.appearance_rejections}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
