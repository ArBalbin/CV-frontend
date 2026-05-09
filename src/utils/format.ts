export function formatTimestamp(value: number | string | undefined): string {
  if (value === undefined || value === '') return 'No data';
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) return 'No data';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDateTime(value: string | undefined): string {
  if (!value) return 'No data';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatAgeSeconds(value: number | string | undefined): string {
  if (value === undefined || value === '') return 'No data';
  const timestamp = typeof value === 'number' ? value * 1000 : new Date(value).getTime();
  if (Number.isNaN(timestamp)) return 'No data';
  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s ago`;
}

export function numberLabel(value: number, digits = 1): string {
  return Number.isFinite(value) ? value.toFixed(digits) : '0.0';
}
