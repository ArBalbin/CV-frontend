import { CheckCircle2, Megaphone, UserX } from "lucide-react";
import { Panel } from "../ui";
import { QueuePerson } from "../../types/api";
import { formatAway } from "./utils";
import { StaffWindow } from "./useStaffWindow";

interface NowServingPanelProps {
  staffWindow: StaffWindow;
  assignments: QueuePerson[];
  line: QueuePerson[];
  activeCounters: number;
  closedUntil: string | null;
  markingDone: number | null;
  onMarkDone: (queueNumber: number) => void;
  markingNoShow: number | null;
  onMarkNoShow: (queueNumber: number) => void;
}

function clockTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function FinishButtons({
  person,
  markingDone,
  onMarkDone,
  markingNoShow,
  onMarkNoShow,
}: {
  person: QueuePerson;
  markingDone: number | null;
  onMarkDone: (queueNumber: number) => void;
  markingNoShow: number | null;
  onMarkNoShow: (queueNumber: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onMarkDone(person.queue_number)}
        disabled={markingDone === person.queue_number}
        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100 disabled:opacity-50"
      >
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        {markingDone === person.queue_number ? "Saving" : "Done"}
      </button>
      <button
        onClick={() => onMarkNoShow(person.queue_number)}
        disabled={markingNoShow === person.queue_number}
        title="The student whose number was called has not come"
        className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3.5 py-1.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100 disabled:opacity-50"
      >
        <UserX className="h-4 w-4 text-amber-600" />
        {markingNoShow === person.queue_number ? "Saving" : "No-show"}
      </button>
    </div>
  );
}

// The staff member's own window (call the next number, finish the current
// one) and, read-only, what every other window is doing. Each account works
// one window; the line itself is shared and shown below.
export default function NowServingPanel({
  staffWindow,
  assignments,
  line,
  activeCounters,
  closedUntil,
  markingDone,
  onMarkDone,
  markingNoShow,
  onMarkNoShow,
}: NowServingPanelProps) {
  const {
    overview,
    myWindow,
    error,
    message,
    calling,
    choose,
    leave,
    callNext,
    switchingMode,
    setCallMode,
  } = staffWindow;
  const autoCall = overview?.call_mode === "auto";

  const switchTo = (mode: "staff" | "auto") => {
    if (overview == null || overview.call_mode === mode) return;
    const question =
      mode === "auto"
        ? "Call numbers automatically? Every free window will take the next number at once, without Call next. This applies to all staff."
        : "Switch to Call next? Staff at each window will call the next number themselves. This applies to all staff.";
    if (window.confirm(question)) setCallMode(mode);
  };

  const byWindow = new Map<number, QueuePerson>();
  for (const person of assignments) {
    if (person.counter_number != null) byWindow.set(person.counter_number, person);
  }
  const claimedBy = new Map<number, string | null>(
    (overview?.windows ?? []).map((w) => [w.counter_number, w.claimed_by]),
  );
  const windowCount = Math.max(overview?.num_counters ?? 0, activeCounters, ...byWindow.keys(), 0);
  const windows = Array.from({ length: windowCount }, (_, i) => i + 1);
  const closed = closedUntil != null && new Date(closedUntil).getTime() > Date.now();
  const nextInLine = line.find((p) => p.counter_number == null && p.status !== "done_pending");
  const mine = myWindow != null ? byWindow.get(myWindow) : undefined;

  return (
    <Panel className="p-5 border border-zinc-200/80 bg-white shadow-sm rounded-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
        <div>
          <div className="text-sm font-semibold text-zinc-900">How numbers are called</div>
          <div className="text-xs text-zinc-500">
            {autoCall
              ? "Automatic: a free window takes the next number by itself."
              : "Call next: staff at each window call the next number."}
          </div>
        </div>
        <div role="group" aria-label="How numbers are called" className="inline-flex rounded-md border border-zinc-300 p-0.5">
          {(
            [
              ["staff", "Call next"],
              ["auto", "Automatic"],
            ] as const
          ).map(([mode, label]) => {
            const active = overview?.call_mode === mode;
            return (
              <button
                key={mode}
                onClick={() => switchTo(mode)}
                disabled={switchingMode || overview == null}
                aria-pressed={active}
                className={`rounded px-3 py-1.5 text-sm font-medium transition disabled:opacity-60 ${
                  active ? "bg-emerald-600 text-white shadow-sm" : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {autoCall && error && <p className="mb-4 text-sm text-red-700">{error}</p>}

      {!autoCall && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label htmlFor="my-window" className="text-sm font-medium text-zinc-700">
            Your window
          </label>
          <select
            id="my-window"
            value={myWindow ?? ""}
            onChange={(e) => e.target.value && choose(Number(e.target.value))}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">Choose your window…</option>
            {windows.map((w) => {
              const holder = claimedBy.get(w);
              const takenByOther = holder != null && w !== myWindow;
              return (
                <option key={w} value={w} disabled={takenByOther}>
                  Window {w}
                  {takenByOther ? ` (in use by ${holder})` : ""}
                </option>
              );
            })}
          </select>
          {myWindow != null && (
            <button onClick={leave} className="text-sm font-medium text-zinc-600 underline hover:text-zinc-900">
              Leave window
            </button>
          )}
          {error && <span className="text-sm text-red-700">{error}</span>}
        </div>
      )}

      {!autoCall && myWindow == null && (
        <p className="mb-4 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Choose the window you are at to call numbers. Each staff account works one window.
        </p>
      )}

      {!autoCall && myWindow != null && (
        <div
          className={`mb-5 flex flex-col gap-3 rounded-md border-2 p-5 shadow-sm ${
            mine ? "border-emerald-400 bg-emerald-50" : "border-zinc-300 bg-zinc-50"
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold uppercase tracking-wider text-zinc-600">
              Your window · Window {myWindow}
            </span>
            {mine?.seconds_at_counter != null && (
              <span className="text-sm tabular-nums text-zinc-600">
                Serving for {formatAway(mine.seconds_at_counter)}
              </span>
            )}
          </div>

          {mine ? (
            <>
              <div className="font-mono text-5xl font-bold tabular-nums text-zinc-900">
                {mine.queue_label}
              </div>
              <FinishButtons
                person={mine}
                markingDone={markingDone}
                onMarkDone={onMarkDone}
                markingNoShow={markingNoShow}
                onMarkNoShow={onMarkNoShow}
              />
            </>
          ) : (
            <>
              <div className="text-2xl font-semibold text-zinc-400">
                {closed && closedUntil ? `Closed until ${clockTime(closedUntil)}` : "Free"}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={callNext}
                  disabled={calling || closed || nextInLine == null}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Megaphone className="h-5 w-5" />
                  {calling ? "Calling…" : "Call next"}
                </button>
                <span className="text-sm text-zinc-600">
                  {nextInLine ? `Next in line: ${nextInLine.queue_label}` : "No one is waiting."}
                </span>
              </div>
            </>
          )}

          {message && (
            <p
              role="status"
              className={`rounded-sm border px-3 py-2 text-sm ${
                message.ok
                  ? "border-emerald-200 bg-white text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      )}

      {windows.length === 0 ? (
        <p className="text-sm text-zinc-500">No windows are open.</p>
      ) : (
        <>
          {!autoCall && (
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              All windows
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {windows.map((counter) => {
              const person = byWindow.get(counter);
              const holder = claimedBy.get(counter);
              return (
                <div
                  key={counter}
                  className={`flex flex-col gap-2 rounded-md border p-4 shadow-sm ${
                    person ? "border-emerald-300 bg-emerald-50" : "border-zinc-200 bg-zinc-50"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Window {counter}
                      {counter === myWindow ? " · you" : ""}
                    </span>
                    {!autoCall && (
                      <span className="text-xs text-zinc-500">{holder ? holder : "No staff"}</span>
                    )}
                  </div>
                  <div
                    className={`font-mono text-2xl font-bold tabular-nums ${
                      person ? "text-zinc-900" : "text-zinc-400"
                    }`}
                  >
                    {person
                      ? person.queue_label
                      : closed && closedUntil
                        ? `Closed until ${clockTime(closedUntil)}`
                        : "Free"}
                  </div>
                  {person?.seconds_at_counter != null && (
                    <span className="text-xs tabular-nums text-zinc-600">
                      Serving for {formatAway(person.seconds_at_counter)}
                    </span>
                  )}
                  {/* In auto mode there are no per-account windows, so any staff
                      member finishes any window, as before. */}
                  {autoCall && person && (
                    <FinishButtons
                      person={person}
                      markingDone={markingDone}
                      onMarkDone={onMarkDone}
                      markingNoShow={markingNoShow}
                      onMarkNoShow={onMarkNoShow}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </Panel>
  );
}
