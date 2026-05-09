export interface HealthStatus {
  status: string;
  db: boolean;
  snapshot: boolean;
  timestamp: string;
}

export interface CrowdData {
  count: number;
  avg_density: number;
  max_density: number;
  timestamp: number | string;
}

export interface HistoryPoint {
  count: number;
  timestamp: number | string;
}

export interface HistoryResponse {
  history: HistoryPoint[];
}

export interface QueuePerson {
  queue_number: number;
  queue_label: string;
  track_id?: number;
  status: 'waiting' | 'missing' | string;
  position_in_line: number;
  wait_time: string;
  wait_time_seconds: number;
  joined_at: string;
  joined_at_full: string;
  joined_at_iso?: string;
  bbox?: [number, number, number, number];
  counter_number?: number | null;
}

export interface NewlyCalled {
  queue_number: number;
  queue_label: string;
  counter_number: number;
}

export interface QueueDisplayData {
  counter_assignments: QueuePerson[];
  active_queue: QueuePerson[];
  newly_called: NewlyCalled[];
  num_counters: number;
  queue_count: number;
  total_served: number;
  active_counters: number;
}

export interface NoshowAlert {
  queue_number: string;
  queue_number_int: number;
  seconds_remaining: number;
  status: 'warning' | 'critical';
}

export interface OnWayNotification {
  id: string;
  queue_number: number;
  queue_label: string;
  created_at: string;
  created_at_display: string;
  message: string;
}

export interface AppearanceRejection {
  queue_number: string;
  at: string;
  reason: string;
}

export interface CompletedQueuePerson extends QueuePerson {
  completed_at?: string;
  completed_at_full?: string;
  total_wait_time?: string;
  bump_reason?: 'served' | 'no_show' | string;
}

export interface QueueState {
  active_queue: QueuePerson[];
  queue_count: number;
  next_number: number;
  total_served: number;
  completed: CompletedQueuePerson[];
  noshow_alerts: NoshowAlert[];
  on_way_notifications: OnWayNotification[];
  appearance_rejections: AppearanceRejection[];
  counter_assignments: QueuePerson[];
  newly_called: NewlyCalled[];
  num_counters: number;
}

export interface QueueData extends CrowdData, QueueState {
  queue_length: number;
  estimated_wait_time: number;
  active_counters: number;
  arrival_rate: number;
  system_utilization: number;
  predicted_wait_5min: number;
  predicted_wait_15min: number;
  predicted_wait_30min: number;
}

export interface QueueZone {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ForecastItem {
  horizon_minutes: number;
  estimated_wait_time: number;
  estimated_wait_time_minutes: number;
  estimated_wait_time_label: string;
}

export interface QueuePrediction {
  queue_length: number;
  active_counters: number;
  avg_service_time_min: number;
  service_time_source: 'measured' | 'default' | string;
  arrival_rate_per_min: number;
  system_utilization: number;
  data_age_seconds: number;
  data_status: 'live' | 'stale' | string;
  new_arrival: {
    position: number;
    estimated_wait_time: number;
    estimated_wait_time_minutes: number;
    estimated_wait_time_label: string;
    estimated_service_start_at: string;
  };
  forecast: {
    now: ForecastItem;
    in_5min: ForecastItem;
    in_15min: ForecastItem;
    in_30min: ForecastItem;
  };
  active_queue: Array<{
    queue_number: number;
    queue_label: string;
    status: string;
    position: number;
    estimated_wait_time_label: string;
  }>;
}

export interface QueueAnalytics {
  generated_at: string;
  overview: {
    queue_length: number;
    waiting: number;
    missing: number;
    active_counters: number;
    avg_service_time_min: number;
    next_number: number;
    total_assigned: number;
    total_completed: number;
    total_served: number;
    total_no_show: number;
    completion_rate_percent: number;
    no_show_rate_percent: number;
    data_status: 'live' | 'stale' | string;
    data_age_seconds: number;
  };
  wait_times: {
    active_average_wait_seconds: number;
    active_average_wait_label: string;
    active_max_wait_seconds: number;
    active_max_wait_label: string;
    completed_average_wait_seconds: number;
    completed_average_wait_label: string;
  };
  throughput: {
    recent_completed_count: number;
    recent_served_count: number;
    recent_no_show_count: number;
  };
  live_crowd: QueueData;
  new_arrival: QueuePrediction['new_arrival'];
  forecast: QueuePrediction['forecast'];
  charts: {
    forecast_wait: Array<{
      label: string;
      horizon_minutes: number;
      wait_minutes: number;
    }>;
    status_breakdown: Array<{
      label: string;
      count: number;
    }>;
    wait_bands: Array<{
      label: string;
      count: number;
    }>;
  };
  active_queue: QueuePrediction['active_queue'];
  recent_completed: CompletedQueuePerson[];
  noshow_alerts: NoshowAlert[];
  appearance_rejections: AppearanceRejection[];
  zone: QueueZone;
  recommendation: string;
}

export interface UserProfileResponse {
  user: Record<string, unknown> & {
    id?: string | number;
    userId?: string | number;
    username?: string;
    full_name?: string;
    name?: string;
    role?: string;
    is_active?: boolean;
    last_login?: string;
    created_at?: string;
  };
}
