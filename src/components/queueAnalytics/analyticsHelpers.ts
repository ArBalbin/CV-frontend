import { QueueAnalytics as QueueAnalyticsResponse, QueueData, QueueState } from '../../types/api';

export interface TrendSample {
  label: string;
  queueLength: number;
  waitTime: number;
}

export interface CrowdSample {
  label: string;
  count: number;
}

export const emptyQueueState: QueueState = {
  active_queue: [],
  queue_count: 0,
  pending_count: 0,
  total_served: 0,
  completed: [],
  noshow_alerts: [],
  on_way_notifications: [],
  counter_assignments: [],
  newly_called: [],
  num_counters: 3,
};

export const emptyQueueData: QueueData = {
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

export function utilizationTone(value: number): 'green' | 'amber' | 'red' {
  if (value >= 0.9) return 'red';
  if (value >= 0.7) return 'amber';
  return 'green';
}

export function analyticsToQueueData(analytics: QueueAnalyticsResponse): QueueData {
  const liveCrowd = analytics.live_crowd || emptyQueueData;
  const forecast = analytics.forecast;

  return {
    ...emptyQueueData,
    ...liveCrowd,
    queue_length: analytics.overview.queue_length,
    queue_count: analytics.overview.queue_length,
    pending_count: analytics.overview.pending_count,
    total_served: analytics.overview.total_served,
    active_counters: analytics.overview.active_counters,
    estimated_wait_time: analytics.new_arrival?.estimated_wait_time_minutes || forecast?.now?.estimated_wait_time_minutes || 0,
    predicted_wait_5min: forecast?.in_5min?.estimated_wait_time_minutes || 0,
    predicted_wait_15min: forecast?.in_15min?.estimated_wait_time_minutes || 0,
    predicted_wait_30min: forecast?.in_30min?.estimated_wait_time_minutes || 0,
    noshow_alerts: analytics.noshow_alerts || [],
    completed: analytics.recent_completed || [],
  };
}

export function buildCrowdChartData(samples: CrowdSample[]) {
  return {
    labels: samples.map((sample) => sample.label),
    datasets: [
      {
        label: 'People count',
        data: samples.map((sample) => sample.count),
        borderColor: '#0E7C86',
        backgroundColor: 'rgba(14, 124, 134, 0.12)',
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
      },
    ],
  };
}

export function buildQueueTrendData(samples: TrendSample[]) {
  return {
    labels: samples.map((sample) => sample.label),
    datasets: [
      {
        label: 'Queue length',
        data: samples.map((sample) => sample.queueLength),
        borderColor: '#0E7C86',
        backgroundColor: 'rgba(14, 124, 134, 0.12)',
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        yAxisID: 'y',
      },
      {
        label: 'Wait time',
        data: samples.map((sample) => sample.waitTime),
        borderColor: '#B8791B',
        backgroundColor: 'rgba(184, 121, 27, 0.12)',
        borderWidth: 2,
        fill: false,
        tension: 0.35,
        pointRadius: 0,
        yAxisID: 'y1',
      },
    ],
  };
}

export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index' as const, intersect: false },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      labels: { color: '#4B515C', usePointStyle: true },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#8A909B', maxTicksLimit: 8 },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(222, 220, 211, 0.6)' },
      ticks: { color: '#8A909B', precision: 0 },
    },
  },
};

export const queueChartOptions = {
  ...baseChartOptions,
  scales: {
    x: baseChartOptions.scales.x,
    y: {
      type: 'linear' as const,
      position: 'left' as const,
      beginAtZero: true,
      grid: { color: 'rgba(222, 220, 211, 0.6)' },
      ticks: { color: '#8A909B', precision: 0 },
    },
    y1: {
      type: 'linear' as const,
      position: 'right' as const,
      beginAtZero: true,
      grid: { drawOnChartArea: false },
      ticks: { color: '#8A909B' },
    },
  },
};