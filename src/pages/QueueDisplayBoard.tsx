import { useEffect, useRef, useState } from 'react';
import { Monitor, Users, CheckCircle2, Hash, Volume2, VolumeX } from 'lucide-react';
import { apiClient } from '../config/api';
import { QueueDisplayData, QueuePerson } from '../types/api';

const POLL_MS = 3000;

function counterLabel(n: number) {
  return `Counter ${n}`;
}

function CounterCard({ counter, person }: { counter: number; person?: QueuePerson }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-sm border p-6 transition-all duration-200 ${
        person
          ? 'border-emerald-400/80 bg-[#303e4d] shadow-xl shadow-black/40'
          : 'border-zinc-600/70 bg-[#414853]'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
        {counterLabel(counter)}
      </p>
      <div className="h-px bg-zinc-400 w-full mt-2"/>
      {person ? (
        <>
          <p className="mt-3 text-6xl font-black tracking-tight text-emerald-300 font-mono">
            {person.queue_label}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded border border-emerald-400/40 bg-emerald-950/80 px-2.5 py-1 text-xs font-semibold text-emerald-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
            Now Serving
          </span>
        </>
      ) : (
        <p className="mt-4 text-3xl font-bold text-zinc-400">—</p>
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
  const pendingRef = useRef<Array<{ queueNumber: number; counterNumber: number }>>([]);
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
    if (!('speechSynthesis' in window)) return;
    const unlock = new SpeechSynthesisUtterance(' ');
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
      pendingRef.current.push({ queueNumber: p.queue_number, counterNumber: p.counter_number });
      added = true;
    });
    if (added && voiceUnlockedRef.current) speakNext();
  }, [data]);

  const fetchDisplay = async () => {
    try {
      const res = await apiClient.get<QueueDisplayData>('/api/queue/display');
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
    <div className="relative min-h-screen bg-[#1c2431] text-zinc-100">
      {!voiceUnlocked && (
        <div
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={activateVoice}
        >
          <div className="rounded-lg border border-zinc-500/80 bg-[#222b38] px-10 py-8 text-center shadow-2xl">
            <Volume2 className="mx-auto mb-4 h-12 w-12 text-emerald-400" />
            <p className="text-xl font-semibold text-zinc-100">Click to Initialize Display Audio</p>
            <p className="mt-2 text-xs text-zinc-300">
              Browser policy requires user interaction to enable synthesized voice alerts.
            </p>
            <div className="mt-5 inline-flex items-center rounded border border-emerald-400/50 bg-emerald-950/80 px-4 py-1.5 text-xs font-semibold text-emerald-200">
              Click anywhere to start
            </div>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between border-b border-zinc-600/70 bg-[#222b38] px-8 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="rounded border border-zinc-500/70 bg-[#2d3848] p-2">
            <Monitor className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-100">Queue Display Board</h1>
            <p className="text-xs text-zinc-300">Live service status & active counters</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {data && (
            <div className="flex items-center gap-4 text-xs font-medium text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-zinc-300" />
                {data.queue_count} in queue
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                {data.total_served} served today
              </span>
            </div>
          )}
          <button
            onClick={() => setVoiceEnabled((v) => !v)}
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold transition-colors ${
              voiceEnabled && voiceUnlocked
                ? 'border-emerald-400/50 bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900/50'
                : 'border-zinc-600 bg-zinc-700 text-zinc-200 hover:bg-zinc-600'
            }`}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {voiceEnabled ? 'Voice On' : 'Voice Off'}
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 rounded border border-red-400/50 bg-red-950/80 px-4 py-3 text-xs text-red-200">
          Unable to reach backend. Retrying connection...
        </div>
      )}

      <main className="mx-auto max-w-7xl px-6 py-6">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Now Serving
          </h2>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${Math.min(numCounters, 4)}, minmax(0, 1fr))` }}
          >
            {counters.map((c) => (
              <CounterCard key={c} counter={c} person={personAt(c)} />
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <Hash className="h-4 w-4 text-zinc-300" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Waiting Queue
            </h2>
          </div>

          {waiting.length === 0 ? (
            <div className="rounded-lg border border-zinc-600/70 bg-[#4148538c] py-10 text-center text-xs text-zinc-400">
              {data?.queue_count ? 'All customers are currently assigned to a counter.' : 'No customers currently waiting.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {waiting.map((p) => (
                <div
                  key={p.queue_number}
                  className={`rounded border px-4 py-3 text-center transition-colors ${
                    p.status === 'missing'
                      ? 'border-amber-400/50 bg-amber-950/50'
                      : 'border-zinc-600/70 bg-[#222b38]'
                  }`}
                >
                  <p className="text-xl font-bold text-zinc-100 font-mono">{p.queue_label}</p>
                  <p className="mt-1 text-xs text-zinc-300">Position {p.position_in_line}</p>
                  <p className="mt-0.5 text-xs text-zinc-400 font-mono">{p.wait_time}</p>
                  {p.status === 'missing' && (
                    <span className="mt-1.5 inline-block rounded border border-amber-400/40 bg-amber-900/50 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                      Not detected
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-8 rounded-lg border border-zinc-600/70 bg-[#222b38] px-5 py-3 text-center text-xs text-zinc-400 shadow-sm">
          Monitor your queue status via the mobile app · Data updates automatically every {POLL_MS / 1000}s
        </footer>
      </main>
    </div>
  );
}