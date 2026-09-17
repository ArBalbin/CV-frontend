import { useEffect, useRef, useState } from "react";
import {
  Monitor,
  Users,
  CheckCircle2,
  Hash,
  Volume2,
  VolumeX,
} from "lucide-react";
import { apiClient } from "../config/api";
import { QueueDisplayData, QueuePerson } from "../types/api";
import Logo from "../assets/img/Logo.png";
import { MdError } from "react-icons/md";

const POLL_MS = 3000;

function counterLabel(n: number) {
  return `Counter ${n}`;
}

function CounterCard({
  counter,
  person,
}: {
  counter: number;
  person?: QueuePerson;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-sm border py-6 transition-all duration-200 ${
        person
          ? "border-emerald-400 bg-white shadow-md shadow-emerald-100"
          : "border-emerald-600 bg-emerald-700"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
        {counterLabel(counter)}
      </p>
      <div className="h-px bg-zinc-400 w-full mt-4" />
      {person ? (
        <>
          <p className="mt-3 text-6xl font-black tracking-tight text-emerald-100 font-mono">
            {person.queue_label}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-100">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Now Serving
          </span>
        </>
      ) : (
        <p className="mt-4 text-3xl font-bold text-emerald-100">—</p>
      )}
    </div>
  );
}

export default function QueueDisplayBoard() {
  const [data, setData] = useState<QueueDisplayData | null>(null);
  const [error, setError] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceUnlocked, setVoiceUnlocked] = useState(false);

  const voiceEnabledRef = useRef(true);
  const voiceUnlockedRef = useRef(false);
  const announcedRef = useRef<Set<string>>(new Set());
  const pendingRef = useRef<
    Array<{ queueNumber: number; counterNumber: number }>
  >([]);
  const speakingRef = useRef(false);

  voiceEnabledRef.current = voiceEnabled;
  voiceUnlockedRef.current = voiceUnlocked;

  function speakNext() {
    if (speakingRef.current) return;
    if (pendingRef.current.length === 0) return;
    if (!voiceEnabledRef.current || !voiceUnlockedRef.current) return;

    const next = pendingRef.current.shift()!;
    speakingRef.current = true;

    const utterance = new SpeechSynthesisUtterance(
      `Customer number ${next.queueNumber}, please proceed to ${counterLabel(next.counterNumber)}.`,
    );
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => {
      speakingRef.current = false;
      setTimeout(speakNext, 800);
    };
    utterance.onerror = () => {
      speakingRef.current = false;
      setTimeout(speakNext, 800);
    };
    window.speechSynthesis.speak(utterance);
  }

  function activateVoice() {
    if (!("speechSynthesis" in window)) return;
    const unlock = new SpeechSynthesisUtterance(" ");
    unlock.volume = 0;
    unlock.onend = () => {
      setVoiceUnlocked(true);
      setTimeout(speakNext, 200);
    };
    window.speechSynthesis.speak(unlock);
  }

  useEffect(() => {
    if (!data) return;
    let added = false;
    data.counter_assignments.forEach((p) => {
      if (!p.counter_number) return;
      const key = `${p.queue_number}-${p.counter_number}`;
      if (announcedRef.current.has(key)) return;
      announcedRef.current.add(key);
      pendingRef.current.push({
        queueNumber: p.queue_number,
        counterNumber: p.counter_number,
      });
      added = true;
    });
    if (added && voiceUnlockedRef.current) speakNext();
  }, [data]);

  const fetchDisplay = async () => {
    try {
      const res = await apiClient.get<QueueDisplayData>("/api/queue/display");
      setData(res.data);
      setError(false);
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    fetchDisplay();
    const id = window.setInterval(fetchDisplay, POLL_MS);
    return () => {
      window.clearInterval(id);
      window.speechSynthesis?.cancel();
    };
  }, []);

  const numCounters = data?.active_counters ?? data?.num_counters ?? 3;
  const counters = Array.from({ length: numCounters }, (_, i) => i + 1);

  function personAt(counter: number): QueuePerson | undefined {
    return data?.counter_assignments.find((p) => p.counter_number === counter);
  }

  const waiting = (data?.active_queue ?? []).filter(
    (p) => p.counter_number == null,
  );

  return (
    <div className="relative min-h-screen flex flex-col bg-zinc-100 text-emerald-950">
      {!voiceUnlocked && (
        <div
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={activateVoice}
        >
          <div className="rounded-lg border border-emerald-200 bg-white px-10 py-8 text-center shadow-2xl">
            <Volume2 className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
            <p className="text-xl font-semibold text-emerald-950">
              Click to Initialize Display Audio
            </p>
            <p className="mt-2 text-xs text-emerald-600">
              Browser policy requires user interaction to enable synthesized
              voice alerts.
            </p>
            <div className="mt-5 inline-flex items-center rounded border border-emerald-300 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700">
              Click anywhere to start
            </div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between border-b border-emerald-200 bg-emerald-700 px-8 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded border border-emerald-200 bg-emerald-50 p-2">
            <Monitor className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-base font-semibold uppercase font-mono text-zinc-100">
              Queue Display Board
            </h1>
            <p className="text-xs text-zinc-200">
              Live service status & active counters
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {data && (
            <div className="flex items-center gap-4 text-xs font-medium text-emerald-700">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-600" />
                {data.queue_count} in queue
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {data.total_served} served today
              </span>
            </div>
          )}
          <button
            onClick={() => setVoiceEnabled((v) => !v)}
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold transition-colors ${
              voiceEnabled && voiceUnlocked
                ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-emerald-200 bg-white text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            {voiceEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
            {voiceEnabled ? "Voice On" : "Voice Off"}
          </button>
        </div>
      </header>

      {error && (
        <div className="mt-4 w-fit mx-auto flex items-center gap-2 rounded border border-red-700 bg-red-600 px-4 py-2 text-xs font-medium text-zinc-100 shadow-sm">
          <span className="relative inline-flex h-5 w-5 shrink-0">
            <MdError
              size={20}
              className="absolute inset-0 animate-ping text-red-300 opacity-75"
            />
            <MdError size={20} className="relative animate-pulse text-white" />
          </span>
          Unable to reach backend. Retrying connection...
        </div>
      )}

      <main className="mx-auto max-w-7xl w-full flex-1 px-6 py-6">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-900">
            Now Serving
          </h2>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${Math.min(numCounters, 4)}, minmax(0, 1fr))`,
            }}
          >
            {counters.map((c) => (
              <CounterCard key={c} counter={c} person={personAt(c)} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <Hash className="h-4 w-4 text-emerald-900" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Waiting Queue
            </h2>
          </div>

          {waiting.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-emerald-600 bg-emerald-50/60 py-10 text-center  text-emerald-800">
              <span className="animate-pulse text-lg uppercase">
                {data?.queue_count
                  ? "All customers are currently assigned to a counter"
                  : "No customers currently waiting"}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {waiting.map((p) => (
                <div
                  key={p.queue_number}
                  className={`rounded border px-4 py-3 text-center transition-colors ${
                    p.status === "missing"
                      ? "border-amber-300 bg-amber-50"
                      : "border-emerald-200 bg-white"
                  }`}
                >
                  <p className="text-xl font-bold text-emerald-950 font-mono">
                    {p.queue_label}
                  </p>
                  <p className="mt-1 text-xs text-emerald-600">
                    Position {p.position_in_line}
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-500 font-mono">
                    {p.wait_time}
                  </p>
                  {p.status === "missing" && (
                    <span className="mt-1.5 inline-block rounded border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      Not detected
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="mt-8 border border-emerald-500 w-[50%] justify-self-center bg-white px-5 py-3 text-center text-xs text-emerald-600 shadow-sm">
          Monitor your queue status via the mobile app · Data updates
          automatically every {POLL_MS / 1000}s
        </div>
      </main>

      <footer className="py-4 px-8 mt-auto bg-emerald-700 text-xs text-zinc-300">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={Logo}
              alt="QueueFlow Logo"
              className="h-5 w-auto opacity-80 object-contain grayscale"
            />
            <span>
              &copy; {new Date().getFullYear()} QueueEx. NCF. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
