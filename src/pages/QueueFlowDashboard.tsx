import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Gauge,
  Hash,
  MapPinned,
  Minus,
  Navigation,
  Pause,
  Play,
  Plus,
  RefreshCcw,
  RotateCcw,
  Settings,
  ShieldAlert,
  Timer,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { EmptyState, MetricCard, Panel, ProgressBar, StatusBadge } from '../components/ui';
import { API_BASE_URL, apiClient } from '../config/api';
import {
  HealthStatus,
  OnWayNotification,
  QueueData,
  QueuePrediction,
  QueueState,
  QueueZone,
} from '../types/api';
import { formatAgeSeconds, formatDateTime, formatTimestamp, numberLabel } from '../utils/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

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
  timestamp: '',
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
  return `Q${String(number).padStart(3, '0')}`;
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

function positionTone(status: string, counterNumber?: number | null): 'green' | 'amber' | 'blue' | 'slate' {
  if (status === 'missing') return 'amber';
  if (counterNumber != null) return 'green';
  return 'slate';
}

function utilizationTone(utilization: number): 'green' | 'amber' | 'red' {
  if (utilization >= 0.9) return 'red';
  if (utilization >= 0.7) return 'amber';
  return 'green';
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
  const [noshowInput, setNoshowInput] = useState('180');
  const [savingNoshow, setSavingNoshow] = useState(false);
  const [savedNoshow, setSavedNoshow] = useState(false);
  const [lastError, setLastError] = useState('');
  const [streamError, setStreamError] = useState(false);
  const [streamKey, setStreamKey] = useState(0);

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
      const response = await apiClient.get<HealthStatus>('/health');
      setHealth(response.data);
    } catch {
      setHealth(null);
    }
  };

  const fetchZone = async () => {
    try {
      const response = await apiClient.get<QueueZone>('/api/queue/zone');
      setZone(response.data);
    } catch {
      setZone(null);
    }
  };

  const fetchPrediction = async () => {
    try {
      const response = await apiClient.get<QueuePrediction>('/api/queue/prediction');
      setPrediction(response.data);
    } catch {
      setPrediction(null);
    }
  };

  const fetchNoshowConfig = async () => {
    try {
      const response = await apiClient.get<{ noshow_window_seconds: number }>('/api/queue/noshow_config');
      setNoshowWindow(response.data.noshow_window_seconds);
      setNoshowInput(String(response.data.noshow_window_seconds));
    } catch {
      setLastError('No-show settings are unavailable.');
    }
  };

  const fetchData = async () => {
    try {
      const response = await apiClient.get<QueueData>('/api/queue/data');
      const queueData = response.data;
      setData(queueData);
      setQueueState(extractQueueState(queueData));
      setIsConnected(true);
      setLastError('');

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
      setLastError('Queue metrics are unavailable.');
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchHealth(), fetchZone(), fetchPrediction(), fetchData(), fetchNoshowConfig()]);
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
      await apiClient.post('/api/queue/done', { queue_number: queueNumber });
      await Promise.all([fetchData(), fetchPrediction()]);
    } catch {
      setLastError(`Could not complete ${queueLabel(queueNumber)}.`);
    } finally {
      setMarkingDone(null);
    }
  };

  const resetQueue = async () => {
    if (!confirm('Reset the entire queue?')) return;
    try {
      await apiClient.post('/api/queue/reset');
      await Promise.all([fetchData(), fetchPrediction()]);
    } catch {
      setLastError('Could not reset the queue.');
    }
  };

  const adjustCounters = async (change: number) => {
    const nextCount = Math.max(1, Math.min(10, data.active_counters + change));
    try {
      await apiClient.post('/api/queue/adjust_counters', { counters: nextCount });
      setData((current) => ({ ...current, active_counters: nextCount }));
      await Promise.all([fetchData(), fetchPrediction()]);
    } catch {
      setLastError('Could not update service counters.');
    }
  };

  const saveNoshowConfig = async () => {
    const seconds = Number.parseInt(noshowInput, 10);
    if (Number.isNaN(seconds) || seconds < 30 || seconds > 300) {
      setLastError('No-show window must be between 30 and 300 seconds.');
      return;
    }

    setSavingNoshow(true);
    try {
      await apiClient.post('/api/queue/noshow_config', { seconds });
      setNoshowWindow(seconds);
      setSavedNoshow(true);
      window.setTimeout(() => setSavedNoshow(false), 1800);
    } catch {
      setLastError('Could not save no-show settings.');
    } finally {
      setSavingNoshow(false);
    }
  };

  const chartData = useMemo(
    () => ({
      labels: chartSamples.map((sample) => sample.label),
      datasets: [
        {
          label: 'Queue length',
          data: chartSamples.map((sample) => sample.queue),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          borderWidth: 2,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          yAxisID: 'y',
        },
        {
          label: 'Wait time',
          data: chartSamples.map((sample) => sample.wait),
          borderColor: '#d97706',
          backgroundColor: 'rgba(217, 119, 6, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.35,
          pointRadius: 0,
          yAxisID: 'y1',
        },
      ],
    }),
    [chartSamples],
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
          labels: { color: '#475569', usePointStyle: true },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', maxTicksLimit: 8 },
        },
        y: {
          type: 'linear' as const,
          position: 'left' as const,
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.24)' },
          ticks: { color: '#64748b', precision: 0 },
        },
        y1: {
          type: 'linear' as const,
          position: 'right' as const,
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          ticks: { color: '#64748b' },
        },
      },
    }),
    [],
  );

  const utilization = Math.max(0, data.system_utilization || prediction?.system_utilization || 0);
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
      title="Queue Flow Dashboard"
      subtitle="Queue forecasting, service counters, and no-show handling."
      actions={
        <>
          <StatusBadge label={prediction?.data_status === 'stale' ? 'Prediction stale' : isConnected ? 'Live metrics' : 'Metrics offline'} tone={prediction?.data_status === 'stale' ? 'amber' : isConnected ? 'green' : 'red'} />
          <button onClick={refreshAll} className="btn-secondary">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button onClick={() => setIsPaused((current) => !current)} className="btn-primary">
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </>
      }
    >
      {lastError && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {lastError}
          </div>
          <button onClick={() => setLastError('')} className="font-semibold text-red-800">
            Dismiss
          </button>
        </div>
      )}

      {queueState.noshow_alerts.length > 0 && (
        <div className="mb-5 grid gap-3">
          {queueState.noshow_alerts.map((alert) => (
            <div
              key={alert.queue_number}
              className={`flex flex-col justify-between gap-3 rounded-lg border px-4 py-3 sm:flex-row sm:items-center ${
                alert.status === 'critical'
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-semibold">
                  {alert.queue_number} absent at the first position. Auto-bump in {alert.seconds_remaining}s.
                </span>
              </div>
              <button onClick={() => markDone(alert.queue_number_int)} className="btn-secondary">
                <CheckCircle2 className="h-4 w-4" />
                Bump now
              </button>
            </div>
          ))}
        </div>
      )}

      {queueState.on_way_notifications.length > 0 && (
        <div className="mb-5 grid gap-3">
          {queueState.on_way_notifications.map((n: OnWayNotification) => (
            <div
              key={n.id}
              className="flex flex-col justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-3 text-emerald-800">
                <Navigation className="h-5 w-5 flex-shrink-0 animate-pulse" />
                <div>
                  <span className="text-sm font-semibold">{n.queue_label} is on the way to the queue zone</span>
                  <span className="ml-2 text-xs text-emerald-600">{n.created_at_display}</span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Coming soon
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-7">
        <MetricCard icon={Users} label="Queue length" value={queueState.queue_count} detail={`Next ${queueLabel(queueState.next_number)}`} tone="blue" />
        <MetricCard icon={Timer} label="Current wait" value={`${numberLabel(data.estimated_wait_time)} min`} detail="Estimated wait" tone="amber" />
        <MetricCard icon={Hash} label="Counters" value={data.active_counters} detail="Active service points" tone="slate" />
        <MetricCard
          icon={Clock3}
          label="Avg service time"
          value={prediction ? `${prediction.avg_service_time_min} min` : `${numberLabel(data.estimated_wait_time || 3)} min`}
          detail={prediction?.service_time_source === 'measured' ? 'Measured from DB' : 'Default (.env)'}
          tone={prediction?.service_time_source === 'measured' ? 'green' : 'slate'}
        />
        <MetricCard icon={Gauge} label="Utilization" value={`${numberLabel(utilizationPercent, 1)}%`} detail={utilization >= 0.9 ? 'High load' : 'Within range'} tone={utilization >= 0.9 ? 'red' : utilization >= 0.7 ? 'amber' : 'green'} />
        <MetricCard icon={TrendingUp} label="Arrival rate" value={numberLabel(data.arrival_rate, 2)} detail="People per minute" tone="teal" />
        <MetricCard icon={CheckCircle2} label="Served" value={queueState.total_served} detail="Completed tickets" tone="green" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(420px,0.9fr)]">
        <Panel className="p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Wait-Time Forecast</h2>
              <p className="mt-1 text-sm text-slate-500">
                New arrival: {prediction?.new_arrival.estimated_wait_time_label || `${numberLabel(data.estimated_wait_time)} min`}
              </p>
            </div>
            <StatusBadge
              label={prediction ? `${prediction.data_age_seconds}s data age` : formatAgeSeconds(data.timestamp)}
              tone={prediction?.data_status === 'stale' ? 'amber' : 'green'}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {forecastCards.map((forecast) => (
              <div key={forecast.horizon_minutes} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {forecast.horizon_minutes === 0 ? 'Now' : `In ${forecast.horizon_minutes} min`}
                  </span>
                  <Clock3 className="h-4 w-4 text-blue-600" />
                </div>
                <p className="mt-4 text-2xl font-semibold text-slate-950">{forecast.estimated_wait_time_label}</p>
                <p className="mt-1 text-xs text-slate-500">{numberLabel(forecast.estimated_wait_time_minutes)} minutes</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">System utilization</span>
              <span className="font-semibold text-slate-950">{numberLabel(utilizationPercent, 1)}%</span>
            </div>
            <ProgressBar value={utilizationPercent} tone={utilizationTone(utilization)} />
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">Queue Camera</h2>
                <p className="text-sm text-slate-500">Updated {formatTimestamp(data.timestamp)}</p>
              </div>
            </div>
            <StatusBadge label={health?.snapshot ? 'Streaming' : 'Waiting'} tone={health?.snapshot ? 'green' : 'amber'} />
          </div>
          <div className="bg-slate-950">
            <div className="aspect-video">
              {!streamError ? (
                <img
                  key={streamKey}
                  src={`${API_BASE_URL}/api/crowd/video`}
                  alt="Live annotated queue camera stream"
                  className="h-full w-full object-contain"
                  onError={() => setStreamError(true)}
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-slate-300">
                  <div>
                    <Video className="mx-auto h-10 w-10 text-slate-500" />
                    <p className="mt-3 text-sm font-semibold">Video stream unavailable</p>
                    <p className="mt-1 text-xs text-slate-500">Retrying in 5 s…</p>
                    <button
                      onClick={() => { setStreamKey((k) => k + 1); setStreamError(false); }}
                      className="mt-4 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900"
                    >
                      Retry now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(420px,0.9fr)]">
        <Panel className="p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                <Hash className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">Queue Tracker</h2>
                <p className="text-sm text-slate-500">{queueState.queue_count} active, {queueState.total_served} served</p>
              </div>
            </div>
            <button onClick={resetQueue} className="btn-danger">
              <RefreshCcw className="h-4 w-4" />
              Reset
            </button>
          </div>

          {queueState.active_queue.length === 0 ? (
            <EmptyState icon={Hash} title="Queue is clear" detail="Tracked queue entries will appear here." />
          ) : (
            <div className="space-y-3">
              {queueState.active_queue.map((person) => {
                const alert = queueState.noshow_alerts.find((item) => item.queue_number_int === person.queue_number);
                return (
                  <div
                    key={person.queue_number}
                    className={`rounded-lg border p-4 ${
                      alert?.status === 'critical'
                        ? 'border-red-200 bg-red-50'
                        : alert
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white">
                          {person.queue_label}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-950">Position {person.position_in_line}</p>
                            <StatusBadge
                              label={
                                person.status === 'missing'
                                  ? 'Missing'
                                  : person.counter_number != null
                                  ? `Serving · Counter ${person.counter_number}`
                                  : 'Waiting'
                              }
                              tone={positionTone(person.status, person.counter_number)}
                            />
                            {alert && <StatusBadge label={`${alert.seconds_remaining}s bump`} tone={alert.status === 'critical' ? 'red' : 'amber'} />}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5" />
                              {person.wait_time}
                            </span>
                            <span>Joined {person.joined_at}</span>
                            {person.track_id !== undefined && <span>Track {person.track_id}</span>}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => markDone(person.queue_number)}
                        disabled={markingDone === person.queue_number}
                        className="btn-primary"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {markingDone === person.queue_number ? 'Saving' : 'Done'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <div className="grid gap-5">
          <Panel className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-600" />
              <h2 className="text-base font-semibold text-slate-950">Service Controls</h2>
            </div>

            <div className="space-y-5">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Active counters</label>
                  <StatusBadge label={`${data.active_counters} open`} tone="blue" />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => adjustCounters(-1)} className="btn-secondary" aria-label="Decrease counters" title="Decrease counters">
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex h-11 min-w-16 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xl font-semibold text-slate-950">
                    {data.active_counters}
                  </div>
                  <button onClick={() => adjustCounters(1)} className="btn-secondary" aria-label="Increase counters" title="Increase counters">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label htmlFor="noshow-window" className="text-sm font-semibold text-slate-700">No-show window</label>
                  <StatusBadge label={`${noshowWindow}s`} tone="amber" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    id="noshow-window"
                    type="number"
                    min={30}
                    max={300}
                    value={noshowInput}
                    onChange={(event) => setNoshowInput(event.target.value)}
                    className="field w-28"
                  />
                  <button onClick={saveNoshowConfig} disabled={savingNoshow} className="btn-primary">
                    {savingNoshow ? 'Saving' : savedNoshow ? 'Saved' : 'Apply'}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">Allowed range: 30 to 300 seconds.</p>
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-950">Backend Status</h2>
              <StatusBadge label={health?.status === 'ok' ? 'Operational' : 'Unavailable'} tone={health?.status === 'ok' ? 'green' : 'red'} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="inline-flex items-center gap-2 text-slate-500">
                  <Database className="h-4 w-4" />
                  Database
                </span>
                <span className="font-semibold text-slate-900">{health?.db ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="inline-flex items-center gap-2 text-slate-500">
                  <Video className="h-4 w-4" />
                  Snapshot
                </span>
                <span className="font-semibold text-slate-900">{health?.snapshot ? 'Active' : 'Waiting'}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-500">Checked</span>
                <span className="font-semibold text-slate-900">{formatDateTime(health?.timestamp)}</span>
              </div>
              {zone && (
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="inline-flex items-center gap-2 text-slate-500">
                    <MapPinned className="h-4 w-4" />
                    Zone
                  </span>
                  <span className="font-semibold text-slate-900">{zone.x1},{zone.y1} to {zone.x2},{zone.y2}</span>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.9fr)]">
        <Panel className="p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">Queue Trend</h2>
                <p className="text-sm text-slate-500">Queue length and estimated wait time.</p>
              </div>
            </div>
            <button onClick={() => setChartSamples([])} className="btn-secondary">
              <RotateCcw className="h-4 w-4" />
              Clear
            </button>
          </div>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-semibold text-slate-950">Exceptions</h2>
          </div>

          {queueState.appearance_rejections.length === 0 && queueState.completed.length === 0 ? (
            <EmptyState icon={ShieldAlert} title="No recent exceptions" />
          ) : (
            <div className="space-y-4">
              {queueState.appearance_rejections.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Appearance rejections</p>
                  <div className="space-y-2">
                    {queueState.appearance_rejections.slice().reverse().map((rejection, index) => (
                      <div key={`${rejection.queue_number}-${index}`} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        <span className="font-semibold">{rejection.queue_number}</span>
                        <span className="mx-2 text-amber-700">mismatch at</span>
                        <span>{rejection.at}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {queueState.completed.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Recently completed</p>
                  <div className="space-y-2">
                    {queueState.completed.slice().reverse().map((person) => (
                      <div key={`${person.queue_number}-${person.completed_at}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                        <span className="font-semibold text-slate-900">{person.queue_label}</span>
                        <span className="text-slate-500">{person.total_wait_time || person.wait_time}</span>
                        <StatusBadge label={person.bump_reason === 'no_show' ? 'No-show' : 'Served'} tone={person.bump_reason === 'no_show' ? 'amber' : 'green'} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>
    </DashboardLayout>
  );
}
