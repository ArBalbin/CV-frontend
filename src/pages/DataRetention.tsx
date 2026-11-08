import { useEffect, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  RefreshCcw,
  ScanFace,
  ShieldAlert,
  Trash2,
  Users,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { EmptyState, MetricCard, Panel, StatusBadge } from "../components/ui";
import { apiClient } from "../config/api";
import {
  RetentionOverview,
  RetentionRunReport,
  RetentionStudent,
} from "../types/api";
import { formatDateTime } from "../utils/format";

type Action = "archive" | "delete";

function parseSchoolIds(text: string): string[] {
  return text
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function StudentTable({
  rows,
  dateLabel,
  dateOf,
  selected,
  onToggle,
}: {
  rows: RetentionStudent[];
  dateLabel: string;
  dateOf: (r: RetentionStudent) => string | null;
  selected: Set<number>;
  onToggle: (id: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500">
          <tr>
            <th className="w-10 py-2" />
            <th className="py-2 pr-4">School ID</th>
            <th className="py-2 pr-4">Name</th>
            <th className="py-2">{dateLabel}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {rows.map((r) => (
            <tr key={r.student_id} className="hover:bg-zinc-50">
              <td className="py-2">
                <input
                  type="checkbox"
                  aria-label={`Select ${r.school_id}`}
                  checked={selected.has(r.student_id)}
                  onChange={() => onToggle(r.student_id)}
                />
              </td>
              <td className="py-2 pr-4 font-mono tabular-nums">{r.school_id}</td>
              <td className="py-2 pr-4">{r.full_name || "—"}</td>
              <td className="py-2 tabular-nums">{formatDateTime(dateOf(r) || undefined)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DataRetention() {
  const [data, setData] = useState<RetentionOverview | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  // Shown beside the Preview and Apply buttons, where the staff member is
  // looking; the page-top notice was off screen when they clicked.
  const [policyResult, setPolicyResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [graduates, setGraduates] = useState("");
  const [archiveSel, setArchiveSel] = useState<Set<number>>(new Set());
  const [deleteSel, setDeleteSel] = useState<Set<number>>(new Set());

  const refresh = async () => {
    try {
      const response = await apiClient.get<RetentionOverview>("/api/retention");
      setData(response.data);
      setError("");
    } catch {
      setError("Could not load the data-retention overview.");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const toggle = (set: Set<number>, update: (s: Set<number>) => void) => (id: number) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update(next);
  };

  const act = async (
    action: Action,
    body: { student_ids?: number[]; school_ids?: string[] },
    count: number,
  ) => {
    const verb = action === "archive" ? "Archive" : "Permanently delete";
    const consequence =
      action === "archive"
        ? "Their face data is erased now; the accounts are deleted after the archive period."
        : "Their accounts and face data are removed and cannot be recovered.";
    if (!window.confirm(`${verb} ${count} student account(s)?\n\n${consequence}`)) return;
    setBusy(true);
    try {
      const response = await apiClient.post<{
        archived?: number[];
        deleted?: number[];
        not_found: string[];
      }>(`/api/retention/${action}`, body);
      const done = (response.data.archived || response.data.deleted || []).length;
      const missing = response.data.not_found;
      setNotice(
        `${action === "archive" ? "Archived" : "Deleted"} ${done} account(s).` +
          (missing.length ? ` Not found: ${missing.join(", ")}.` : ""),
      );
      setArchiveSel(new Set());
      setDeleteSel(new Set());
      setGraduates("");
      await refresh();
    } catch {
      setError(`Could not ${action} the selected accounts.`);
    } finally {
      setBusy(false);
    }
  };

  const runPolicy = async (dryRun: boolean) => {
    if (!dryRun && !window.confirm("Archive and delete every account that is due now?")) return;
    setBusy(true);
    setPolicyResult("");
    try {
      const response = await apiClient.post<RetentionRunReport>("/api/retention/run", {
        dry_run: dryRun,
      });
      const r = response.data;
      setPolicyResult(
        dryRun
          ? `Preview only, nothing was changed: ${r.due_for_archive} account(s) would be archived and ${r.due_for_deletion} deleted.`
          : `Policy applied: ${r.archived} account(s) archived and ${r.deleted} deleted.`,
      );
      await refresh();
    } catch {
      setPolicyResult("Could not run the retention policy. Check that you are still signed in.");
    } finally {
      setBusy(false);
    }
  };

  const counts = data?.counts || {};
  const policy = data?.policy;
  const gradIds = parseSchoolIds(graduates);

  return (
    <DashboardLayout
      title="Data Retention"
      subtitle="Archive and delete student accounts that no longer use QueuEx, so personal and face data are not kept longer than needed."
      eyebrow="Data Privacy"
      actions={
        <>
          <StatusBadge
            label={policy?.enabled ? "Policy runs daily" : "Automatic runs off"}
            tone={policy?.enabled ? "green" : "amber"}
          />
          <button onClick={refresh} className="btn-secondary" aria-label="Refresh">
            <RefreshCcw className="h-4 w-4" />
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-5 rounded-sm border border-red-700 bg-red-600 px-4 py-3 text-sm text-red-100 shadow-sm">
          {error}
        </div>
      )}
      {notice && (
        <div className="mb-5 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
          {notice}
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 divide-x divide-y divide-zinc-200/60 overflow-hidden rounded-sm border border-zinc-200/80 bg-white shadow-sm md:grid-cols-3 md:divide-y-0 xl:grid-cols-6">
        <MetricCard icon={Users} label="Active accounts" value={counts.active ?? "—"} tone="blue" />
        <MetricCard icon={ScanFace} label="With face data" value={counts.with_face_data ?? "—"} tone="teal" />
        <MetricCard icon={ShieldAlert} label="No consent yet" value={counts.without_consent ?? "—"} detail="Asked at next sign-in" tone="amber" />
        <MetricCard icon={Archive} label="Due for archive" value={counts.due_for_archive ?? "—"} tone="amber" />
        <MetricCard icon={ArchiveRestore} label="Archived" value={counts.archived ?? "—"} tone="slate" />
        <MetricCard icon={Trash2} label="Due for deletion" value={counts.due_for_deletion ?? "—"} tone="red" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="grid content-start gap-5">
          <Panel>
            <h2 className="text-sm font-semibold text-zinc-900">Retention policy</h2>
            {policy ? (
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700">
                <li>
                  An account with no sign-in or queue request for{" "}
                  <strong>{policy.archive_after_days} days</strong> is archived: it is
                  deactivated and its face data is erased.
                </li>
                <li>
                  An account archived for <strong>{policy.delete_after_days} more days</strong>{" "}
                  is deleted. Queue history is kept without the student's identity.
                </li>
                <li>A student who signs in while archived is restored and registers their face again.</li>
              </ol>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">Loading…</p>
            )}
            <p className="mt-4 text-xs text-zinc-500">
              Last run:{" "}
              {data?.last_run
                ? `${formatDateTime(data.last_run.ran_at)}, ${
                    data.last_run.actor === "scheduler" ? "automatic" : `by ${data.last_run.actor}`
                  } (${data.last_run.archived} archived, ${data.last_run.deleted} deleted)`
                : "not yet since the server started"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={busy} onClick={() => runPolicy(true)} className="btn-secondary">
                Check who is due
              </button>
              <button disabled={busy} onClick={() => runPolicy(false)} className="btn-primary">
                Run cleanup now
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              <strong>Check who is due</strong> only counts the accounts and changes nothing.{" "}
              <strong>Run cleanup now</strong> archives and deletes them at once instead of
              waiting for the daily run.
            </p>
            {policyResult && (
              <p className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {policyResult}
              </p>
            )}
          </Panel>

          <Panel>
            <h2 className="text-sm font-semibold text-zinc-900">Graduates</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Paste the school IDs of graduating students, one per line or separated by commas.
            </p>
            <textarea
              value={graduates}
              onChange={(e) => setGraduates(e.target.value)}
              rows={6}
              placeholder={"21-1234\n21-5678"}
              className="mt-3 w-full rounded-sm border border-zinc-300 p-2 font-mono text-sm focus:border-zinc-500 focus:outline-none"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                disabled={busy || gradIds.length === 0}
                onClick={() => act("archive", { school_ids: gradIds }, gradIds.length)}
                className="btn-secondary"
              >
                <Archive className="h-4 w-4" /> Archive {gradIds.length || ""}
              </button>
              <button
                disabled={busy || gradIds.length === 0}
                onClick={() => act("delete", { school_ids: gradIds }, gradIds.length)}
                className="btn-danger"
              >
                <Trash2 className="h-4 w-4" /> Delete {gradIds.length || ""}
              </button>
            </div>
          </Panel>
        </div>

        <div className="grid content-start gap-5">
          <Panel>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-zinc-900">
                Inactive for {policy?.archive_after_days ?? "…"} days or more
              </h2>
              <button
                disabled={busy || archiveSel.size === 0}
                onClick={() => act("archive", { student_ids: [...archiveSel] }, archiveSel.size)}
                className="btn-secondary"
              >
                <Archive className="h-4 w-4" /> Archive selected
              </button>
            </div>
            <div className="mt-3">
              {data && data.due_for_archive.length > 0 ? (
                <StudentTable
                  rows={data.due_for_archive}
                  dateLabel="Last activity"
                  dateOf={(r) => r.last_activity}
                  selected={archiveSel}
                  onToggle={toggle(archiveSel, setArchiveSel)}
                />
              ) : (
                <EmptyState icon={Archive} title="No inactive accounts" detail="Every account has been used within the policy period." />
              )}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-zinc-900">
                Archived for {policy?.delete_after_days ?? "…"} days or more
              </h2>
              <button
                disabled={busy || deleteSel.size === 0}
                onClick={() => act("delete", { student_ids: [...deleteSel] }, deleteSel.size)}
                className="btn-danger"
              >
                <Trash2 className="h-4 w-4" /> Delete selected
              </button>
            </div>
            <div className="mt-3">
              {data && data.due_for_deletion.length > 0 ? (
                <StudentTable
                  rows={data.due_for_deletion}
                  dateLabel="Archived on"
                  dateOf={(r) => r.archived_at}
                  selected={deleteSel}
                  onToggle={toggle(deleteSel, setDeleteSel)}
                />
              ) : (
                <EmptyState icon={Trash2} title="Nothing due for deletion" />
              )}
            </div>
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}
