import { PeopleChartSample, QueueChartSample } from "./utils";

export function buildQueueChartData(samples: QueueChartSample[]) {
  return {
    labels: samples.map((sample) => sample.label),
    datasets: [
      {
        label: "Queue length",
        data: samples.map((sample) => sample.queue),
        borderColor: "#0E7C86",
        backgroundColor: "rgba(14, 124, 134, 0.12)",
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        yAxisID: "y",
      },
      {
        label: "Wait time",
        data: samples.map((sample) => sample.wait),
        borderColor: "#B8791B",
        backgroundColor: "rgba(184, 121, 27, 0.12)",
        borderWidth: 2,
        fill: false,
        tension: 0.35,
        pointRadius: 0,
        yAxisID: "y1",
      },
    ],
  };
}

export const queueChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index" as const, intersect: false },
  plugins: {
    legend: {
      display: true,
      position: "top" as const,
      labels: { color: "#4B515C", usePointStyle: true },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#8A909B", maxTicksLimit: 8 },
    },
    y: {
      type: "linear" as const,
      position: "left" as const,
      beginAtZero: true,
      grid: { color: "rgba(222, 220, 211, 0.6)" },
      ticks: { color: "#8A909B", precision: 0 },
    },
    y1: {
      type: "linear" as const,
      position: "right" as const,
      beginAtZero: true,
      grid: { drawOnChartArea: false },
      ticks: { color: "#8A909B" },
    },
  },
};

export function buildPeopleChartData(samples: PeopleChartSample[]) {
  return {
    labels: samples.map((sample) => sample.label),
    datasets: [
      {
        label: "People detected",
        data: samples.map((sample) => sample.count),
        borderColor: "#0E7C86",
        backgroundColor: "rgba(14, 124, 134, 0.12)",
        borderWidth: 2,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };
}

export const peopleChartOptions = {
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
      ticks: { color: "#8A909B", maxTicksLimit: 8 },
    },
    y: {
      beginAtZero: true,
      grid: { color: "rgba(222, 220, 211, 0.6)" },
      ticks: { color: "#8A909B", precision: 0 },
    },
  },
};
