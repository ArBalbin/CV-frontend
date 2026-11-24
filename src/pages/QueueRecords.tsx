import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  Download,
  Hourglass,
  RefreshCcw,
  Search,
  SkipForward,
  Ticket,
  Timer,
  Wallet,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { EmptyState, MetricCard, Panel, StatusBadge } from "../components/ui";
import { formatPeso } from "../components/queueFlowDashboard/utils";
import { apiClient } from "../config/api";
import { QueueRecord, QueueRecordsPage } from "../types/api";

const PAGE_SIZE = 50;
const REFRESH_TODAY_MS = 15000;

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "served", label: "Served" },
  { value: "no_show", label: "Skipped" },
  { value: "waiting", label: "Waiting" },
];

/** "2:15" from seconds; "—" when unknown. */
function clockLabel(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "—";
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rest = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${rest}` : `${m}:${rest}`;
}

/** Today on the school's clock (Naga, UTC+8), as YYYY-MM-DD. */
function schoolToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
}

/** A YYYY-MM-DD day moved by whole days, without time-zone drift. */
function shiftDay(day: string, days: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function longDay(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function statusTone(record: QueueRecord): "green" | "amber" | "blue" | "slate" {
  if (record.status === "served") return "green";
  if (record.status === "no_show") return "amber";
  if (record.status === "waiting" && record.status_label === "Waiting") return "blue";
  return "slate";
}

function csvCell(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows: QueueRecord[]): string {
  const header = [
    "Queue number", "Student", "School ID", "Walk-in", "Joined", "Called", "Finished",
    "Waited (s)", "Estimate shown (s)", "At window (s)", "Window", "Payment",
    "Amount", "Note", "Status", "Staff",
  ];
  const lines = rows.map((r) =>
    [
      r.queue_label, r.student_name, r.student_school_id, r.walk_in ? "yes" : "no",
      r.joined_at, r.called_at, r.finished_at, r.wait_seconds, r.estimated_wait_seconds,
      r.service_seconds, r.cashier_window, r.payment_type, r.payment_amount,
      r.payment_note, r.status_label, r.served_by,
    ].map(csvCell).join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export default function QueueRecords() {
  const [day, setDay] = useState<string>(schoolToday);
  const [status, setStatus] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [data, setData] = useState<QueueRecordsPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const params = useCallback(
    (page: number, pageSize: number) => ({
      ...(day ? { date: day } : {}),
      ...(status !== "all" ? { status } : {}),
      ...(search ? { q: search } : {}),
      page,
      page_size: pageSize,
    }),
    [day, status, search],
  );

  const load = useCallback(
    async (quiet = false) => {
      if (!quiet) setLoading(true);
      try {
        const response = await apiClient.get<QueueRecordsPage>("/api/queue/records", {
          params: params(pageNo, PAGE_SIZE),
        });
        setData(response.data);
        setError("");
      } catch {
        setError("Could not load the queue records. Check that you are still signed in.");
      } finally {
        if (!quiet) setLoading(false);
      }
    },
    [params, pageNo],
  );

  useEffect(() => {
    load();
  }, [load]);

  // Today's records keep changing as numbers are issued and served.
  useEffect(() => {
    if (!data?.is_today) return;
    const timer = window.setInterval(() => load(true), REFRESH_TODAY_MS);
    return () => window.clearInterval(timer);
  }, [data?.is_today, load]);

  const chooseDay = (next: string) => {
    setDay(next);
    setPageNo(1);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setSearch(searchText.trim());
    setPageNo(1);
  };

  const download = async () => {
    setDownloading(true);
    try {
      const all: QueueRecord[] = [];
      for (let page = 1; page <= 20; page += 1) {
        const response = await apiClient.get<QueueRecordsPage>("/api/queue/records", {
          params: params(page, 200),
        });
        all.push(...response.data.records);
        if (page >= response.data.pages) break;
      }
      const blob = new Blob([toCsv(all)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `queuex_records_${data?.date ?? "today"}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not download the records.");
    } finally {
      setDownloading(false);
    }
  };

  const summary = data?.summary;
  const records = data?.records ?? [];
  const first = data && data.total > 0 ? (data.page - 1) * data.page_size + 1 : 0;
  const last = data ? Math.min(data.total, data.page * data.page_size) : 0;

  return (
    <DashboardLayout
      title="Queue Records"
      subtitle="Every queue number issued: when it joined, was called and finished, and what was paid."
      eyebrow="Records"
      actions={
        <>
          {data?.is_today && <StatusBadge label="Updates every 15 s" tone="green" />}
          <button
            onClick={download}
            disabled={downloading || !data || data.total === 0}
            className="btn-secondary"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Preparing…" : "Download CSV"}
          </button>
          <button onClick={() => load()} className="btn-secondary" aria-label="Refresh">
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-5 rounded-sm border border-red-700 bg-red-600 px-4 py-3 text-sm text-red-100 shadow-sm">
          {error}
        </div>
      )}

      <Panel className="mb-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn-secondary px-3"
              aria-label="Previous day"
              disabled={!day}
              onClick={() => day && chooseDay(shiftDay(day, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <input
              type="date"
              className="field w-auto"
              value={day}
              onChange={(e) => e.target.value && chooseDay(e.target.value)}
              aria-label="Day"
            />
            <button
              className="btn-secondary px-3"
              aria-label="Next day"
              disabled={!day || data?.is_today}
              onClick={() => day && chooseDay(shiftDay(day, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {!data?.is_today && (
              <button className="btn-secondary" onClick={() => chooseDay(schoolToday())}>
                Today
              </button>
            )}
            <span className="ml-1 text-sm text-zinc-500">
              {data ? longDay(data.date) : ""}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex border border-zinc-200 bg-white shadow-sm" role="group" aria-label="Status">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    setStatus(f.value);
                    setPageNo(1);
                  }}
                  className={`px-3 py-2 text-sm font-medium transition ${
                    status === f.value
                      ? "bg-emerald-600 text-white"
                      : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                  aria-pressed={status === f.value}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <form onSubmit={submitSearch} className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                className="field w-72 pl-9"
                placeholder="Queue number, school ID or name"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onBlur={() => {
                  if (searchText.trim() !== search) {
                    setSearch(searchText.trim());
                    setPageNo(1);
                  }
                }}
                aria-label="Search records"
              />
            </form>
          </div>
        </div>
      </Panel>

      <div className="mb-5 grid grid-cols-2 divide-x divide-y divide-zinc-200/60 overflow-hidden rounded-sm border border-zinc-200/80 bg-white shadow-sm md:grid-cols-4 md:divide-y-0 xl:grid-cols-7">
        <MetricCard icon={Ticket} label="Numbers issued" value={summary?.tickets ?? "—"} detail="On this day" tone="blue" />
        <MetricCard icon={CheckCircle2} label="Served" value={summary?.served ?? "—"} detail="Called and done" tone="green" />
        <MetricCard icon={SkipForward} label="Skipped" value={summary?.skipped ?? "—"} detail="Did not come" tone="amber" />
        <MetricCard
          icon={Hourglass}
          label={data?.is_today ? "Waiting" : "Not finished"}
          value={summary?.waiting ?? "—"}
          detail={data?.is_today ? "Not called yet" : "Never finished"}
          tone="slate"
        />
        <MetricCard
          icon={Clock3}
          label="Average wait"
          value={clockLabel(summary?.avg_wait_seconds)}
          detail="Join to call"
          tone="teal"
        />
        <MetricCard
          icon={Timer}
          label="Average at window"
          value={clockLabel(summary?.avg_service_seconds)}
          detail="Call to Done"
          tone="teal"
        />
        <MetricCard
          icon={Wallet}
          label="Payments served"
          value={summary ? formatPeso(summary.served_amount) : "—"}
          detail="Declared amounts"
          tone="green"
        />
      </div>

      <Panel className="p-0">
        {records.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={ClipboardList}
              title={loading ? "Loading records…" : "No queue numbers match"}
              detail={
                loading
                  ? undefined
                  : search || status !== "all"
                    ? "Try another search or status, or choose another day."
                    : "No queue numbers were issued on this day."
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-3 py-3">Number</th>
                    <th className="px-3 py-3">Student</th>
                    <th className="px-3 py-3">Joined</th>
                    <th className="px-3 py-3">Called</th>
                    <th className="px-3 py-3">Finished</th>
                    <th className="px-3 py-3 text-right">Waited</th>
                    <th className="px-3 py-3 text-right">At window</th>
                    <th className="px-3 py-3">Window</th>
                    <th className="px-3 py-3">Payment</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {records.map((r) => (
                    <tr key={r.id} className="align-top hover:bg-zinc-50">
                      <td className="whitespace-nowrap px-3 py-3 font-mono font-semibold tabular-nums text-zinc-900">
                        {r.queue_label}
                      </td>
                      <td className="px-3 py-3">
                        {r.student_school_id ? (
                          <>
                            <div className="whitespace-nowrap font-medium text-zinc-900">{r.student_name || "—"}</div>
                            <div className="font-mono text-xs text-zinc-500">{r.student_school_id}</div>
                          </>
                        ) : (
                          <span className="text-zinc-500">{r.walk_in ? "Walk-in" : "—"}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums">{r.joined_at ?? "—"}</td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums">{r.called_at ?? "—"}</td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums">{r.finished_at ?? "—"}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums">
                        <div>{clockLabel(r.wait_seconds)}</div>
                        {r.estimated_wait_seconds !== null && (
                          <div className="text-xs text-zinc-500" title="The estimate the student was shown on joining">
                            est. {clockLabel(r.estimated_wait_seconds)}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums">{clockLabel(r.service_seconds)}</td>
                      <td className="px-3 py-3 tabular-nums">{r.cashier_window ?? "—"}</td>
                      <td className="px-3 py-3">
                        {r.payment_type ? (
                          <>
                            <div className="text-zinc-900">{r.payment_type}</div>
                            <div className="text-xs text-zinc-500 tabular-nums">
                              {r.payment_amount !== null ? formatPeso(r.payment_amount) : ""}
                              {r.payment_note ? ` · ${r.payment_note}` : ""}
                            </div>
                          </>
                        ) : (
                          <span className="text-zinc-500">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <StatusBadge label={r.status_label} tone={statusTone(r)} />
                      </td>
                      <td className="px-3 py-3 text-zinc-600">{r.served_by ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3 text-sm text-zinc-600">
              <span className="tabular-nums">
                Showing {first}–{last} of {data?.total ?? 0}
              </span>
              <div className="flex gap-2">
                <button
                  className="btn-secondary px-3 py-2"
                  disabled={!data || data.page <= 1}
                  onClick={() => setPageNo((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                <button
                  className="btn-secondary px-3 py-2"
                  disabled={!data || data.page >= data.pages}
                  onClick={() => setPageNo((p) => p + 1)}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </Panel>
    </DashboardLayout>
  );
}
