import { QueueData, QueueState } from "../../types/api";

export interface QueueChartSample {
  label: string;
  queue: number;
  wait: number;
}

export interface PeopleChartSample {
  label: string;
  count: number;
}

export const initialQueueState: QueueState = {
  active_queue: [],
  queue_count: 0,
  pending_count: 0,
  pending_queue: [],
  pending_link_alerts: [],
  total_served: 0,
  completed: [],
  noshow_alerts: [],
  on_way_notifications: [],
  counter_assignments: [],
  newly_called: [],
  num_counters: 3,
};

export const initialQueueData: QueueData = {
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

export function queueLabel(number: number) {
  return `Q${String(number).padStart(3, "0")}`;
}

export function extractQueueState(data: QueueData): QueueState {
  return {
    active_queue: data.active_queue || [],
    queue_count: data.queue_count || data.queue_length || 0,
    pending_count: data.pending_count || 0,
    pending_queue: data.pending_queue || [],
    pending_link_alerts: data.pending_link_alerts || [],
    total_served: data.total_served || 0,
    completed: data.completed || [],
    noshow_alerts: data.noshow_alerts || [],
    on_way_notifications: data.on_way_notifications || [],
    counter_assignments: data.counter_assignments || [],
    newly_called: data.newly_called || [],
    num_counters: data.num_counters ?? 3,
  };
}

export function positionTone(
  status: string,
  counterNumber?: number | null,
): "green" | "amber" | "blue" | "slate" {
  if (status === "missing") return "amber";
  if (counterNumber != null) return "green";
  return "slate";
}

export function utilizationTone(
  utilization: number,
): "green" | "amber" | "red" {
  if (utilization >= 0.9) return "red";
  if (utilization >= 0.7) return "amber";
  return "green";
}
