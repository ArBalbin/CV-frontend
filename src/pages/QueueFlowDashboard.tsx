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
  Activity,
  BarChart3,
  Sliders,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { StatusBadge } from "../components/ui";
import { apiClient } from "../config/api";
import {
  HealthStatus,
  HistoryResponse,
  QueueData,
  QueuePrediction,
  QueueState,
  QueueZone,
} from "../types/api";
import { formatTimestamp, numberLabel } from "../utils/format";
import {
  BackendStatusPanel,
  buildPeopleChartData,
  buildQueueChartData,
  CameraPanel,
  DetectionPanel,
  ErrorBanner,
  ExceptionsPanel,
  extractQueueState,
  ForecastPanel,
  initialQueueData,
  initialQueueState,
  MetricsOverview,
  NoshowAlerts,
  OnWayNotifications,
  PeopleChartSample,
  QueueChartSample,
  QueueTrackerPanel,
  QueueTrendPanel,
  ServiceControlsPanel,
  queueLabel,
} from "../components/queueFlowDashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

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
  const [linkingTrackId, setLinkingTrackId] = useState<number | null>(null);
  const [linkNumberByTrack, setLinkNumberByTrack] = useState<
    Record<number, string>
  >({});
  const [manualNumber, setManualNumber] = useState("");
  const [addingManual, setAddingManual] = useState(false);
  const [peopleSamples, setPeopleSamples] = useState<PeopleChartSample[]>([]);
  const [showDetection, setShowDetection] = useState(false);

  const [activeTab, setActiveTab] = useState<"live" | "analytics" | "controls">(
    "live",
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
        const label = formatTimestamp(queueData.timestamp);
        setChartSamples((current) => {
          const next = [
            ...current,
            {
              label,
              queue: queueData.queue_length || queueData.queue_count || 0,
              wait: queueData.estimated_wait_time || 0,
            },
          ];
          return next.slice(-60);
        });
        setPeopleSamples((current) =>
          [...current, { label, count: queueData.count || 0 }].slice(-60),
        );
      }
    } catch {
      setIsConnected(false);
      setLastError("Queue metrics are unavailable.");
    }
  };

  const loadPeopleHistory = async () => {
    try {
      const response = await apiClient.get<HistoryResponse>("/api/history");
      setPeopleSamples(
        response.data.history
          .map((point) => ({
            label: formatTimestamp(point.timestamp),
            count: point.count,
          }))
          .slice(-60),
      );
    } catch {
      setPeopleSamples([]);
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
    loadPeopleHistory();

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

  const linkPending = async (trackId: number) => {
    const parsed = parseInt(linkNumberByTrack[trackId] || "", 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setLastError("Enter the number printed on their ticket first.");
      return;
    }
    setLinkingTrackId(trackId);
    try {
      await apiClient.post("/api/queue/link-pending", {
        track_id: trackId,
        queue_number: parsed,
      });
      setLinkNumberByTrack((current) => ({ ...current, [trackId]: "" }));
      await Promise.all([fetchData(), fetchPrediction()]);
    } catch {
      setLastError(
        `Could not link Q${String(parsed).padStart(3, "0")} — it may already be linked today.`,
      );
    } finally {
      setLinkingTrackId(null);
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

  const forceNewPerson = async () => {
    const parsed = parseInt(manualNumber, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setLastError("Enter the number printed on the kiosk ticket first.");
      return;
    }
    setAddingManual(true);
    try {
      await apiClient.post("/api/queue/force-new", {
        queue_number: parsed,
        is_walkin: true,
      });
      setManualNumber("");
      await Promise.all([fetchData(), fetchPrediction()]);
    } catch {
      setLastError(
        `Could not link Q${String(parsed).padStart(3, "0")} — it may already be linked today.`,
      );
    } finally {
      setAddingManual(false);
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
    () => buildQueueChartData(chartSamples),
    [chartSamples],
  );
  const peopleChartData = useMemo(
    () => buildPeopleChartData(peopleSamples),
    [peopleSamples],
  );

  const utilization = Math.max(
    0,
    data.system_utilization || prediction?.system_utilization || 0,
  );
  const utilizationPercent = Math.min(utilization * 100, 100);
  const forecastCards = [
    prediction?.forecast.now || {
      horizon_minutes: 0,
      estimated_wait_time: data.estimated_wait_time,
      estimated_wait_time_minutes: data.estimated_wait_time,
      estimated_wait_time_label: `${numberLabel(data.estimated_wait_time)} min`,
    },
    prediction?.forecast.in_5min || {
      horizon_minutes: 5,
      estimated_wait_time: data.predicted_wait_5min,
      estimated_wait_time_minutes: data.predicted_wait_5min,
      estimated_wait_time_label: `${numberLabel(data.predicted_wait_5min)} min`,
    },
    prediction?.forecast.in_15min || {
      horizon_minutes: 15,
      estimated_wait_time: data.predicted_wait_15min,
      estimated_wait_time_minutes: data.predicted_wait_15min,
      estimated_wait_time_label: `${numberLabel(data.predicted_wait_15min)} min`,
    },
    prediction?.forecast.in_30min || {
      horizon_minutes: 30,
      estimated_wait_time: data.predicted_wait_30min,
      estimated_wait_time_minutes: data.predicted_wait_30min,
      estimated_wait_time_label: `${numberLabel(data.predicted_wait_30min)} min`,
    },
  ];

  return (
    <DashboardLayout
      title="QueuEx Dashboard"
      subtitle="Live queue, service counters, walk-in entry, and no-show handling."
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
      {lastError && (
        <ErrorBanner message={lastError} onDismiss={() => setLastError("")} />
      )}

      <NoshowAlerts alerts={queueState.noshow_alerts} onBump={markDone} />
      <OnWayNotifications notifications={queueState.on_way_notifications} />

      {/* Streamlined Navigation Tabs */}
      <div className="my-5 flex items-center gap-2 border-b border-zinc-400/80 pb-3">
        <button
          onClick={() => setActiveTab("live")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition ${
            activeTab === "live"
              ? "bg-emerald-600 text-zinc-100 shadow-md"
              : "bg-white text-zinc-600 border border-zinc-200/80 hover:bg-zinc-100 hover:text-zinc-900"
          }`}
        >
          <Activity className="h-4 w-4" />
          Live Operations
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition ${
            activeTab === "analytics"
              ? "bg-emerald-600 text-zinc-100 shadow-md"
              : "bg-white text-zinc-600 border border-zinc-200/80 hover:bg-zinc-100 hover:text-zinc-900"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Analytics & Forecast
        </button>
        <button
          onClick={() => setActiveTab("controls")}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition ${
            activeTab === "controls"
              ? "bg-emerald-600 text-zinc-100 shadow-md"
              : "bg-white text-zinc-600 border border-zinc-200/80 hover:bg-zinc-100 hover:text-zinc-900"
          }`}
        >
          <Sliders className="h-4 w-4" />
          Controls & Exceptions
        </button>
      </div>

      {/* Tab Content Panels */}
      {activeTab === "live" && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              System Metrics Overview
            </h2>
            <MetricsOverview
              data={data}
              queueState={queueState}
              prediction={prediction}
              utilization={utilization}
              utilizationPercent={utilizationPercent}
            />
          </div>
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Live Feed & Queue Tracking
            </h2>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(420px,0.9fr)]">
              <CameraPanel
                data={data}
                health={health}
                streamError={streamError}
                streamKey={streamKey}
                onStreamError={() => setStreamError(true)}
                onRetry={() => {
                  setStreamKey((k) => k + 1);
                  setStreamError(false);
                }}
              />
              <QueueTrackerPanel
                queueState={queueState}
                manualNumber={manualNumber}
                onManualNumberChange={setManualNumber}
                addingManual={addingManual}
                onForceNewPerson={forceNewPerson}
                onResetQueue={resetQueue}
                markingDone={markingDone}
                onMarkDone={markDone}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Wait Time Forecasts
            </h2>

            <QueueTrendPanel
              chartData={chartData}
              onClear={() => setChartSamples([])}
            />
          </div>
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Detection Analysis
            </h2>
            <DetectionPanel
              show={showDetection}
              onToggle={() => setShowDetection((current) => !current)}
              data={data}
              peopleChartData={peopleChartData}
              onClearPeopleSamples={() => setPeopleSamples([])}
            />
          </div>
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Queue Trends & System Status
            </h2>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.9fr)]">
              <ForecastPanel
                data={data}
                prediction={prediction}
                forecastCards={forecastCards}
                utilization={utilization}
                utilizationPercent={utilizationPercent}
              />
              <BackendStatusPanel health={health} zone={zone} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "controls" && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Service Management & Exceptions
            </h2>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(420px,0.9fr)]">
              <ServiceControlsPanel
                activeCounters={data.active_counters}
                onAdjustCounters={adjustCounters}
                noshowWindow={noshowWindow}
                noshowInput={noshowInput}
                onNoshowInputChange={setNoshowInput}
                savingNoshow={savingNoshow}
                savedNoshow={savedNoshow}
                onSaveNoshow={saveNoshowConfig}
              />
              <ExceptionsPanel
                queueState={queueState}
                linkNumberByTrack={linkNumberByTrack}
                onLinkNumberChange={(trackId, value) =>
                  setLinkNumberByTrack((current) => ({
                    ...current,
                    [trackId]: value,
                  }))
                }
                linkingTrackId={linkingTrackId}
                onLinkPending={linkPending}
              />
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Backend Health
            </h2>
            <div className="grid grid-cols-1 gap-5">
              <BackendStatusPanel health={health} zone={zone} />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
