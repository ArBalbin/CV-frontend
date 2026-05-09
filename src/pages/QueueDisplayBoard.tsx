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
      className={`flex flex-col items-center justify-center rounded-2xl border-2 p-6 transition-all duration-500 ${
        person
          ? 'border-teal-400 bg-teal-50 shadow-lg shadow-teal-100'
          : 'border-slate-200 bg-white'
      }`}
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
        {counterLabel(counter)}
      </p>
      {person ? (
        <>
          <p className="mt-3 text-7xl font-black tracking-tight text-teal-700">
            {person.queue_label}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-sm font-semibold text-teal-800">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
            Now Serving
          </span>
        </>
      ) : (
        <p className="mt-4 text-4xl font-bold text-slate-300">—</p>
      )}
    </div>
  );
}

export default function QueueDisplayBoard() {
  const [data, setData] = useState<QueueDisplayData | null>(null);
  const [error, setError] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceUnlocked, setVoiceUnlocked] = useState(false);

  // These refs let callbacks always read the latest state without re-subscribing
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
      // Small gap between announcements
      setTimeout(speakNext, 800);
    };
    utterance.onerror = () => {
      speakingRef.current = false;
      setTimeout(speakNext, 800);
    };
    window.speechSynthesis.speak(utterance);
  }

  // Activate voice with a user gesture — required by all modern browsers
  function activateVoice() {
    if (!('speechSynthesis' in window)) return;
    // Speak a zero-volume utterance to unlock the speech engine
    const unlock = new SpeechSynthesisUtterance(' ');
    unlock.volume = 0;
    unlock.onend = () => {
      setVoiceUnlocked(true);
      // Drain any announcements that queued up while waiting for activation
      setTimeout(speakNext, 200);
    };
    window.speechSynthesis.speak(unlock);
  }

  // Watch counter_assignments: announce any new number that just reached a counter
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

  // Waiting list: people beyond counter capacity (position > num_counters)
  const waiting = (data?.active_queue ?? []).filter(
    (p) => p.counter_number == null,
  );

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">

      {/* Voice activation overlay — must click once to unlock TTS */}
      {!voiceUnlocked && (
        <div
          className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={activateVoice}
        >
          <div className="rounded-2xl border border-teal-500/30 bg-slate-900 px-12 py-10 text-center shadow-2xl">
            <Volume2 className="mx-auto mb-5 h-16 w-16 text-teal-400" />
            <p className="text-3xl font-bold text-white">Tap to Activate</p>
            <p className="mt-3 text-base text-slate-400">
              Voice announcements will play automatically
            </p>
            <p className="mt-1 text-sm text-slate-500">
              e.g. "Customer number 3, please proceed to Counter 1"
            </p>
            <div className="mt-6 animate-pulse rounded-full bg-teal-500/20 px-6 py-2 text-sm font-semibold text-teal-300">
              Click anywhere to continue
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-500/10 p-2">
            <Monitor className="h-6 w-6 text-teal-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Queue Display Board</h1>
            <p className="text-xs text-slate-400">Live service status</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {data && (
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {data.queue_count} in queue
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
                {data.total_served} served today
              </span>
            </div>
          )}
          <button
            onClick={() => setVoiceEnabled((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              voiceEnabled && voiceUnlocked
                ? 'bg-teal-500/20 text-teal-300 hover:bg-teal-500/30'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {voiceEnabled ? 'Voice On' : 'Voice Off'}
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 rounded-lg border border-red-800 bg-red-900/30 px-4 py-3 text-sm text-red-300">
          Unable to reach backend. Retrying…
        </div>
      )}

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Now Serving */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
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

        {/* Waiting list */}
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Hash className="h-4 w-4 text-slate-400" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Waiting Queue
            </h2>
          </div>

          {waiting.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 py-12 text-center text-slate-500">
              {data?.queue_count ? 'All customers are currently at a counter' : 'No one waiting'}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {waiting.map((p) => (
                <div
                  key={p.queue_number}
                  className={`rounded-xl border px-4 py-4 text-center transition-colors ${
                    p.status === 'missing'
                      ? 'border-amber-700 bg-amber-900/20'
                      : 'border-slate-700 bg-slate-800'
                  }`}
                >
                  <p className="text-2xl font-bold text-white">{p.queue_label}</p>
                  <p className="mt-1 text-xs text-slate-400">Position {p.position_in_line}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{p.wait_time}</p>
                  {p.status === 'missing' && (
                    <span className="mt-1.5 inline-block rounded-full bg-amber-600/30 px-2 py-0.5 text-xs font-medium text-amber-300">
                      Not detected
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-10 rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-center text-xs text-slate-500">
          Check your queue status on the mobile app · Your position is shown above · Updates every{' '}
          {POLL_MS / 1000} seconds
        </footer>
      </main>
    </div>
  );
}
