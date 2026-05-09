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
  Clock3,
  Gauge,
  Hash,
  RefreshCcw,
  Timer,
  TrendingUp,
  Users,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { EmptyState, MetricCard, Panel, ProgressBar, StatusBadge } from '../components/ui';
import { apiClient } from '../config/api';
import { HistoryResponse, QueueAnalytics as QueueAnalyticsResponse, QueueData, QueueState } from '../types/api';
import { formatAgeSeconds, formatTimestamp, numberLabel } from '../utils/format';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

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
  timestamp: '',
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

function utilizationTone(value: number): 'green' | 'amber' | 'red' {
  if (value >= 0.9) return 'red';
  if (value >= 0.7) return 'amber';
  return 'green';
}

function queueLabel(value: number) {
  return `Q${String(value).padStart(3, '0')}`;
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
    estimated_wait_time: analytics.new_arrival?.estimated_wait_time_minutes || forecast?.now?.estimated_wait_time_minutes || 0,
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
  const [analytics, setAnalytics] = useState<QueueAnalyticsResponse | null>(null);
  const [crowdHistory, setCrowdHistory] = useState<Array<{ label: string; count: number }>>([]);
  const [trendSamples, setTrendSamples] = useState<TrendSample[]>([]);
  const [lastError, setLastError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const [analyticsResponse, historyResponse] = await Promise.all([
        apiClient.get<QueueAnalyticsResponse>('/api/queue/analytics'),
        apiClient.get<HistoryResponse>('/api/history'),
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
            queueLength: nextQueueData.queue_length || nextQueueData.queue_count || 0,
            waitTime: nextQueueData.estimated_wait_time || 0,
          },
        ];
        return next.slice(-60);
      });
      setLastError('');
    } catch {
      setLastError('Queue analytics are unavailable. Check the backend connection and login session.');
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
          label: 'People count',
          data: crowdHistory.map((sample) => sample.count),
          borderColor: '#0f766e',
          backgroundColor: 'rgba(15, 118, 110, 0.12)',
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
          label: 'Queue length',
          data: trendSamples.map((sample) => sample.queueLength),
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
          data: trendSamples.map((sample) => sample.waitTime),
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
    [trendSamples],
  );

  const baseChartOptions = useMemo(
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
          beginAtZero: true,
          grid: { color: 'rgba(148, 163, 184, 0.24)' },
          ticks: { color: '#64748b', precision: 0 },
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
    [baseChartOptions],
  );

  const utilization = queueData.system_utilization || 0;
  const utilizationPercent = Math.min(Math.max(utilization * 100, 0), 100);
  const completionRate = analytics?.overview.completion_rate_percent || 0;

  const forecast = analytics?.forecast;
  const forecastRows = [
    { label: 'Now', value: forecast?.now.estimated_wait_time_label || `${numberLabel(queueData.estimated_wait_time)} min` },
    { label: 'In 5 min', value: forecast?.in_5min.estimated_wait_time_label || `${numberLabel(queueData.predicted_wait_5min)} min` },
    { label: 'In 15 min', value: forecast?.in_15min.estimated_wait_time_label || `${numberLabel(queueData.predicted_wait_15min)} min` },
    { label: 'In 30 min', value: forecast?.in_30min.estimated_wait_time_label || `${numberLabel(queueData.predicted_wait_30min)} min` },
  ];

  return (
    <DashboardLayout
      title="Queue Analytics"
      subtitle="Read-only performance view for wait-time forecasts, demand trends, and queue throughput."
      eyebrow="Analytics"
      actions={
        <>
          <StatusBadge label={analytics?.overview.data_status === 'stale' ? 'Stale data' : 'Live analytics'} tone={analytics?.overview.data_status === 'stale' ? 'amber' : 'green'} />
          <button onClick={fetchAnalytics} className="btn-secondary">
            <RefreshCcw className="h-4 w-4" />
            Refresh
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <MetricCard icon={Hash} label="Queue length" value={queueData.queue_count || queueData.queue_length} detail={`Next ${queueLabel(queueData.next_number)}`} tone="blue" />
        <MetricCard icon={Clock3} label="Current wait" value={`${numberLabel(queueData.estimated_wait_time)} min`} detail="Estimated wait" tone="amber" />
        <MetricCard icon={TrendingUp} label="Arrival rate" value={numberLabel(queueData.arrival_rate, 2)} detail="People per minute" tone="teal" />
        <MetricCard icon={Gauge} label="Utilization" value={`${numberLabel(utilizationPercent, 1)}%`} detail="Service load" tone={utilizationPercent >= 90 ? 'red' : utilizationPercent >= 70 ? 'amber' : 'green'} />
        <MetricCard icon={Users} label="People count" value={queueData.count} detail={formatAgeSeconds(queueData.timestamp)} tone="slate" />
        <MetricCard icon={Timer} label="New arrival" value={analytics?.new_arrival.estimated_wait_time_label || 'No data'} detail={`Position ${analytics?.new_arrival.position || queueData.queue_count + 1}`} tone="green" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(420px,0.9fr)]">
        <Panel className="p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Forecast Summary</h2>
              <p className="mt-1 text-sm text-slate-500">
                Data age: {analytics ? `${analytics.overview.data_age_seconds}s` : formatAgeSeconds(queueData.timestamp)}
              </p>
            </div>
            <StatusBadge label={analytics?.overview.data_status || 'loading'} tone={analytics?.overview.data_status === 'stale' ? 'amber' : 'green'} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {forecastRows.map((item) => (
              <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">System utilization</span>
                <span className="font-semibold text-slate-950">{numberLabel(utilizationPercent, 1)}%</span>
              </div>
              <ProgressBar value={utilizationPercent} tone={utilizationTone(utilization)} />
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">Completion share</span>
                <span className="font-semibold text-slate-950">{numberLabel(completionRate, 1)}%</span>
              </div>
              <ProgressBar value={completionRate} tone="blue" />
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-700" />
              <h2 className="text-base font-semibold text-slate-950">Current Queue Estimates</h2>
            </div>
          {analytics?.active_queue.length ? (
            <div className="space-y-2">
              {analytics.active_queue.slice(0, 8).map((person) => (
                <div key={person.queue_number} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <div>
                    <p className="font-semibold text-slate-950">{person.queue_label}</p>
                    <p className="text-xs text-slate-500">Position {person.position}</p>
                  </div>
                  <span className="font-semibold text-slate-700">{person.estimated_wait_time_label}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Hash} title={isLoading ? 'Loading queue estimates' : 'No active queue estimates'} />
          )}
        </Panel>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Panel className="p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-950">Queue Length vs Wait Time</h2>
              <p className="text-sm text-slate-500">Live samples collected while this page is open.</p>
            </div>
          </div>
          <div className="h-80">
            <Line data={queueTrendData} options={queueChartOptions} />
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2 text-teal-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-950">People History</h2>
              <p className="text-sm text-slate-500">Rolling count from `/api/history`.</p>
            </div>
          </div>
          <div className="h-80">
            <Line data={crowdChartData} options={baseChartOptions} />
          </div>
        </Panel>
      </div>
    </DashboardLayout>
  );
}
