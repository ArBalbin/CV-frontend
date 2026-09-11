export function queueLabel(number: number) {
  return `Q${String(number).padStart(3, "0")}`;
}

export function positionTone(
  status: string,
  counterNumber?: number | null,
): "green" | "amber" | "blue" | "slate" {
  if (status === "missing") return "amber";
  if (counterNumber != null) return "green";
  return "slate";
}
