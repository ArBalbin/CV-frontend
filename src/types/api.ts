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
  seconds_missing?: number;
  joined_at: string;
  joined_at_full: string;
  joined_at_iso?: string;
  bbox?: [number, number, number, number];
  counter_number?: number | null;
  // Seconds at their window, for the Now serving cards; null while waiting.
  seconds_at_counter?: number | null;
  // From the student's join form in the app; null for walk-ins.
  payment_type?: string | null;
  payment_amount?: number | null;
  payment_note?: string | null;
  // Each line of the Payment Slip with its own amount; absent after a restart.
  payment_items?: Array<{ type: string; amount: number; detail: string | null }> | null;
}

// GET /api/queue/windows: the windows and which staff account holds each.
export interface WindowOverview {
  call_mode: "staff" | "auto";
  num_counters: number;
  my_window: number | null;
  windows: Array<{ counter_number: number; claimed_by: string | null }>;
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


export interface OnWayNotification {
  id: string;
  queue_number: number;
  queue_label: string;
  created_at: string;
  created_at_display: string;
  message: string;
}

// A person the camera has confirmed present in the queue zone but hasn't
// linked to a real (kiosk-printed or face-only-minted) number yet.
export interface PendingPerson {
  track_id: number;
  identity_status: 'pending_link';
  has_face_embedding: boolean;
  bbox?: [number, number, number, number];
}

export interface PendingLinkAlert {
  track_id: number;
  seconds_waiting: number;
  has_face_embedding: boolean;
}

export interface PendingQueueResponse {
  pending_queue: PendingPerson[];
  pending_count: number;
  pending_link_alerts: PendingLinkAlert[];
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
  pending_count: number;
  // Only present on staff-only endpoints (/api/queue/data) — the public
  // /api/queue/list strips these two for privacy.
  pending_queue?: PendingPerson[];
  pending_link_alerts?: PendingLinkAlert[];
  total_served: number;
  completed: CompletedQueuePerson[];
  on_way_notifications: OnWayNotification[];
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

// GET /api/queue/prediction_accuracy: logged estimates scored against the
// real waits of served tickets.
export interface PredictionAccuracy {
  available: boolean;
  tickets_checked: number;
  days_covered: number;
  lookback_days: number;
  close_enough_minutes: number;
  fixed_guess_minutes: number;
  average_miss_minutes: number | null;
  close_enough_percent: number | null;
  fixed_guess_average_miss_minutes: number | null;
  typical_direction: "too_low" | "too_high" | "even" | null;
  typical_miss_minutes: number | null;
  recent: Array<{
    queue_number: number;
    service_date: string;
    predicted_minutes: number;
    actual_minutes: number;
  }>;
}

export interface QueuePrediction {
  queue_length: number;
  active_counters: number;
  avg_service_time_min: number;
  // The current average service time, as students see it in the app.
  avg_service_seconds?: number;
  avg_service_label?: string;
  avg_service_basis?: string;
  service_time_source: 'live' | 'usual pace' | string;
  arrival_rate_per_min: number;
  system_utilization: number;
  data_age_seconds: number;
  data_status: 'live' | 'stale' | string;
  wait_estimator?: string;
  counters_closed_until?: string | null;
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
    pending_count: number;
    total_assigned: number;
    total_completed: number;
    total_served: number;
    total_no_show: number;
    completion_rate_percent: number;
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

export interface RetentionStudent {
  student_id: number;
  school_id: string;
  full_name: string | null;
  last_activity: string | null;
  archived_at: string | null;
}

export interface RetentionRunReport {
  ran_at: string;
  actor: string;
  dry_run: boolean;
  due_for_archive: number;
  due_for_deletion: number;
  archived: number;
  deleted: number;
}

export interface RetentionOverview {
  policy: {
    enabled: boolean;
    archive_after_days: number;
    delete_after_days: number;
    interval_hours: number;
  };
  counts: {
    total?: number;
    active?: number;
    archived?: number;
    with_face_data?: number;
    without_consent?: number;
    due_for_archive?: number;
    due_for_deletion?: number;
  };
  due_for_archive: RetentionStudent[];
  due_for_deletion: RetentionStudent[];
  last_run: RetentionRunReport | null;
}

/** One ticket on the Queue Records page (GET /api/queue/records). Times are
 *  already on the school's clock, e.g. "02:30:00 PM". */
export interface QueueRecord {
  id: number;
  queue_number: number;
  queue_label: string;
  status: "waiting" | "served" | "no_show" | "expired" | string;
  status_label: string;
  joined_at: string | null;
  joined_at_iso: string | null;
  called_at: string | null;
  finished_at: string | null;
  wait_seconds: number | null;
  service_seconds: number | null;
  cashier_window: number | null;
  payment_type: string | null;
  payment_amount: number | null;
  payment_note: string | null;
  student_name: string | null;
  student_school_id: string | null;
  walk_in: boolean;
  linked_via: string | null;
  estimated_wait_seconds: number | null;
  people_ahead_at_issue: number | null;
  served_by: string | null;
}

export interface QueueRecordsPage {
  date: string;
  is_today: boolean;
  status: string;
  search: string;
  page: number;
  page_size: number;
  total: number;
  pages: number;
  summary: {
    tickets: number;
    served: number;
    skipped: number;
    waiting: number;
    avg_wait_seconds: number | null;
    avg_service_seconds: number | null;
    served_amount: number;
  };
  records: QueueRecord[];
}
