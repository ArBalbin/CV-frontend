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
  BarChart3,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  Hash,
  MapPinned,
  Navigation,
  Pause,
  Play,
  RefreshCcw,
  RotateCcw,
  ShieldAlert,
  UserPlus,
  Users,
  Video,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { EmptyState, MetricCard, Panel, StatusBadge } from '../components/ui';
import { API_BASE_URL, apiClient } from '../config/api';
import { CrowdData, HealthStatus, HistoryResponse, OnWayNotification, QueueState, QueueZone } from '../types/api';
import { formatAgeSeconds, formatDateTime, formatTimestamp, numberLabel } from '../utils/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

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
  timestamp: '',
};

function queueLabel(number: number) {
  return `Q${String(number).padStart(3, '0')}`;
}

function positionTone(status: string, counterNumber?: number | null): 'green' | 'amber' | 'blue' | 'slate' {
  if (status === 'missing') return 'amber';
  if (counterNumber != null) return 'green';
  return 'slate';
}

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
  const [lastError, setLastError] = useState('');

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

  const loadHistory = async () => {
    try {
      const response = await apiClient.get<HistoryResponse>('/api/history');
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
      const response = await apiClient.get<QueueZone>('/api/queue/zone');
      setZone(response.data);
    } catch {
      setZone(null);
    }
  };

  const fetchCrowd = async () => {
    try {
      const response = await apiClient.get<CrowdData>('/api/crowd/data');
      const crowd = response.data;
      setData(crowd);
      setIsConnected(true);
      setLastError('');

      if (!isPaused) {
        setSamples((current) => {
          const next = [...current, { label: formatTimestamp(crowd.timestamp), count: crowd.count }];
          return next.slice(-60);
        });
      }
    } catch {
      setIsConnected(false);
      setLastError('People data is unavailable.');
    }
  };

  const fetchQueue = async () => {
    try {
      const response = await apiClient.get<QueueState>('/api/queue/list');
      setQueueState(response.data);
    } catch {
      setLastError('Queue data is unavailable.');
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
      await apiClient.post('/api/queue/done', { queue_number: queueNumber });
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
      await apiClient.post('/api/queue/force-new');
      await fetchQueue();
    } catch {
      setLastError('Could not manually add a queue entry.');
    } finally {
      setAddingManual(false);
    }
  };

  const resetQueue = async () => {
    if (!confirm('Reset the entire queue?')) return;
    try {
      await apiClient.post('/api/queue/reset');
      await fetchQueue();
    } catch {
      setLastError('Could not reset the queue.');
    }
  };

  const chartData = useMemo(
    () => ({
      labels: samples.map((sample) => sample.label),
      datasets: [
        {
          label: 'People count',
          data: samples.map((sample) => sample.count),
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          borderWidth: 2,
          fill: true,
          tension: 0.35,
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
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index' as const, intersect: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', maxTicksLimit: 8 },
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.24)' },
          ticks: { color: '#64748b', precision: 0 },
        },
      },
    }),
    [],
  );

  const activeQueue = queueState.active_queue;
  const firstAlert = queueState.noshow_alerts[0];

  return (
    <DashboardLayout
      title="Computer Vision Dashboard"
      subtitle="Live people detection, queue visibility, and camera health."
      actions={
        <>
          <StatusBadge label={isConnected ? 'Live feed' : 'Data offline'} tone={isConnected ? 'green' : 'red'} />
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard icon={Users} label="People detected" value={data.count} detail={formatAgeSeconds(data.timestamp)} tone="blue" />
        <MetricCard icon={Activity} label="Average density" value={numberLabel(data.avg_density, 2)} detail="People density" tone="teal" />
        <MetricCard icon={BarChart3} label="Maximum density" value={numberLabel(data.max_density, 2)} detail="Peak density" tone="amber" />
        <MetricCard icon={Hash} label="Active queue" value={queueState.queue_count} detail={`Next ${queueLabel(queueState.next_number)}`} tone="slate" />
        <MetricCard icon={CheckCircle2} label="Served" value={queueState.total_served} detail="Completed tickets" tone="green" />
        <MetricCard icon={Database} label="Backend" value={health?.db ? 'Ready' : 'Check'} detail={health?.snapshot ? 'Snapshot active' : 'No snapshot'} tone={health?.db ? 'green' : 'red'} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.8fr)_minmax(360px,0.9fr)]">
        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">Annotated Camera Stream</h2>
                <p className="text-sm text-slate-500">Last people update: {formatTimestamp(data.timestamp)}</p>
              </div>
            </div>
            {zone && (
              <StatusBadge label={`Zone ${zone.x1},${zone.y1} to ${zone.x2},${zone.y2}`} tone="blue" />
            )}
          </div>
          <div className="relative bg-slate-950">
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
            <div className="absolute left-4 top-4">
              <StatusBadge label={health?.snapshot ? 'Snapshot receiving' : 'Waiting for snapshot'} tone={health?.snapshot ? 'green' : 'amber'} />
            </div>
          </div>
        </Panel>

        <div className="grid gap-5">
          <Panel className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-950">System Health</h2>
              <StatusBadge label={health?.status === 'ok' ? 'Operational' : 'Unavailable'} tone={health?.status === 'ok' ? 'green' : 'red'} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-500">Database</span>
                <span className="font-semibold text-slate-900">{health?.db ? 'Connected' : 'Disconnected'}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-500">Snapshot</span>
                <span className="font-semibold text-slate-900">{health?.snapshot ? 'Active' : 'Waiting'}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-500">Checked</span>
                <span className="font-semibold text-slate-900">{formatDateTime(health?.timestamp)}</span>
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-950">Queue Snapshot</h2>
              <StatusBadge label={`${activeQueue.length} active`} tone="slate" />
            </div>
            {firstAlert && (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {firstAlert.queue_number} bump timer: {firstAlert.seconds_remaining}s
              </div>
            )}
            <div className="space-y-2">
              {activeQueue.slice(0, 5).map((person) => (
                <div key={person.queue_number} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white">
                      {person.queue_label}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Position {person.position_in_line}</p>
                      <p className="text-xs text-slate-500">{person.wait_time} waiting</p>
                    </div>
                  </div>
                  <StatusBadge
                    label={
                      person.status === 'missing'
                        ? 'Missing'
                        : person.counter_number != null
                        ? `Serving · C${person.counter_number}`
                        : 'Waiting'
                    }
                    tone={positionTone(person.status, person.counter_number)}
                  />
                </div>
              ))}
              {activeQueue.length === 0 && <EmptyState icon={Users} title="No active queue entries" />}
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.9fr)]">
        <Panel className="p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">People Count Trend</h2>
                <p className="text-sm text-slate-500">Rolling history from `/api/history` and live updates.</p>
              </div>
            </div>
            <button onClick={() => setSamples([])} className="btn-secondary">
              <RotateCcw className="h-4 w-4" />
              Clear
            </button>
          </div>
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-950">Active Queue</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={forceNewPerson}
                disabled={addingManual}
                title="Manually add next queue number (use when camera misses someone or for identical twins)"
                className="btn-secondary"
              >
                <UserPlus className="h-4 w-4" />
                {addingManual ? 'Adding…' : 'Manual Add'}
              </button>
              <button onClick={resetQueue} className="btn-danger">
                <RefreshCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
          {activeQueue.length === 0 ? (
            <EmptyState icon={Hash} title="Queue is clear" detail="New queue numbers appear when tracked people enter the configured zone." />
          ) : (
            <div className="space-y-3">
              {activeQueue.map((person) => (
                <div key={person.queue_number} className="rounded-lg border border-slate-200 p-4">
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
                                ? `Serving · C${person.counter_number}`
                                : 'Waiting'
                            }
                            tone={positionTone(person.status, person.counter_number)}
                          />
                        </div>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            {person.wait_time}
                          </span>
                          <span>Joined {person.joined_at}</span>
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
              ))}
            </div>
          )}
        </Panel>
      </div>

      {(queueState.completed.length > 0 || queueState.appearance_rejections.length > 0) && (
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          {queueState.completed.length > 0 && (
            <Panel className="p-5">
              <h2 className="mb-4 text-base font-semibold text-slate-950">Recently Completed</h2>
              <div className="grid gap-2">
                {queueState.completed.slice().reverse().map((person) => (
                  <div key={`${person.queue_number}-${person.completed_at}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-semibold text-slate-900">{person.queue_label}</span>
                    <span className="text-slate-500">{person.total_wait_time || person.wait_time}</span>
                    <StatusBadge label={person.bump_reason === 'no_show' ? 'No-show' : 'Served'} tone={person.bump_reason === 'no_show' ? 'amber' : 'green'} />
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {queueState.appearance_rejections.length > 0 && (
            <Panel className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
                <h2 className="text-base font-semibold text-slate-950">Appearance Rejections</h2>
              </div>
              <div className="grid gap-2">
                {queueState.appearance_rejections.slice().reverse().map((rejection, index) => (
                  <div key={`${rejection.queue_number}-${index}`} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    <span className="font-semibold">{rejection.queue_number}</span>
                    <span className="mx-2 text-amber-700">mismatch at</span>
                    <span>{rejection.at}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      )}

      {zone && (
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <MapPinned className="h-4 w-4" />
          Queue zone: x1 {zone.x1}, y1 {zone.y1}, x2 {zone.x2}, y2 {zone.y2}
          <Eye className="ml-2 h-4 w-4" />
          Stream: {API_BASE_URL}/api/crowd/video
        </div>
      )}
    </DashboardLayout>
  );
}
