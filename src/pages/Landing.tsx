import { useNavigate } from "react-router-dom";
import {
  PiArrowRight,
  PiChartBar,
  PiEye,
  PiRadio,
  PiUsersThree,
} from "react-icons/pi";
import Logo from "../assets/img/Logo.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#15181d] text-zinc-100 font-sans selection:bg-zinc-100 selection:text-zinc-900">
      <header className="border-b border-zinc-600/60 bg-[#15181d]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <img
              src={Logo}
              alt="QueueFlow Logo"
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-24 border-b border-zinc-600/60 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b15_1px,transparent_1px),linear-gradient(to_bottom,#18181b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-zinc-300 mb-8 font-medium">
              <PiRadio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
              <span>Capstone prototype · NCF Registrar &amp; Cashiering</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-light tracking-tight text-white mb-8 leading-[1.08]">
              Wait-time transparency for the registrar and cashiering line.
            </h1>
            <p className="text-base sm:text-lg text-justify text-zinc-300 font-normal max-w-2xl mb-12 leading-relaxed">
              Built for Naga College Foundation's Registrar and Cashiering
              offices, where most students wait 20 minutes or more with no way
              to check their status remotely. QueueFlow adds camera-based queue
              detection, wait-time estimates, and remote status checking on top
              of the display and voice announcements already in place not a
              replacement of them.
            </p>
            <div>
              <button
                onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-3 bg-zinc-100 text-zinc-900 hover:bg-white/50 px-8 py-4 text-xs font-semibold transition-all"
              >
                Sign In
                <PiArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-600/60 bg-[#15181d] py-16">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12">
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2 font-medium">
              Typical wait
            </p>
            <p className="text-3xl font-light text-white">67.5%</p>
            <p className="text-[11px] text-zinc-400 mt-1">
              wait 20+ minutes today
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2 font-medium">
              Wait-time visibility
            </p>
            <p className="text-3xl font-light text-white">0%</p>
            <p className="text-[11px] text-zinc-400 mt-1">
              get an estimated wait now
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2 font-medium">
              Registration today
            </p>
            <p className="text-3xl font-light text-white">Kiosk only</p>
            <p className="text-[11px] text-zinc-400 mt-1">
              100% use a printed ticket
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-2 font-medium">
              Most requested
            </p>
            <p className="text-3xl font-light text-white">4.80 / 5</p>
            <p className="text-[11px] text-zinc-400 mt-1">
              want a countdown timer
            </p>
          </div>
        </div>
      </section>

      <section className="py-28 border-b border-zinc-600/60">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-3 font-medium">
              Core Capabilities
            </p>
            <h2 className="text-3xl font-light tracking-tight text-white">
              What the system actually does.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-zinc-600/60 border-t border-b border-zinc-600/60">
            <div className="py-12 md:py-12 md:px-10 first:pl-0 last:pr-0 flex flex-col justify-between">
              <div>
                <div className="text-zinc-300 mb-8">
                  <PiEye className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-3">
                  Computer vision detection
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                  A YOLOv8-based detector reads the existing camera feed to
                  assign queue numbers and track multiple people in line at
                  once, without manual entry.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-zinc-600/40 text-xs text-zinc-400">
                Live Video Analysis
              </div>
            </div>

            <div className="py-12 md:py-12 md:px-10 first:pl-0 last:pr-0 flex flex-col justify-between">
              <div>
                <div className="text-zinc-300 mb-8">
                  <PiUsersThree className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-3">
                  Predictive wait time, remote status
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                  A mobile app shows queue position and an estimated wait — the
                  single most requested feature in student feedback — so no one
                  has to stay near the display.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-zinc-600/40 text-xs text-zinc-400">
                Ticket &amp; Wait Estimation
              </div>
            </div>

            <div className="py-12 md:py-12 md:px-10 first:pl-0 last:pr-0 flex flex-col justify-between">
              <div>
                <div className="text-zinc-300 mb-8">
                  <PiChartBar className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-3">
                  No-show handling and admin analytics
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed font-normal">
                  Missed turns auto-bump after a countdown, counters are
                  assigned automatically, and staff can review processing time
                  per window on the admin dashboard.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-zinc-600/40 text-xs text-zinc-400">
                Performance Analytics
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-28 bg-[#15181d] border-b border-zinc-600/60">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider mb-3 font-medium">
              Built on what's already there
            </p>
            <h2 className="text-3xl font-light tracking-tight text-white mb-6">
              Extends the current setup, doesn't replace it.
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed mb-8">
              Respondents rated the existing TV display and voice announcements
              favorably, so the system keeps both and adds the remote,
              predictive layer they said was missing.
            </p>
            <div className="space-y-4 text-xs text-zinc-300">
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 bg-zinc-200" />
                <span>
                  Keeps the TV display and voice announcements in place
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 bg-zinc-200" />
                <span>
                  Issues tickets locally if the network drops, syncing once it's
                  back
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 bg-zinc-200" />
                <span>
                  Registers queue entries by matching each student's existing ID
                  photo
                </span>
              </div>
            </div>
          </div>

          <div className="border border-zinc-600 bg-[#15181d] p-8">
            <div className="flex items-center justify-between border-b border-zinc-600 pb-4 mb-6">
              <div className="flex items-center gap-2 text-xs text-zinc-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Live Status Update</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1">
                ONLINE
              </span>
            </div>
            <div className="space-y-3 text-xs text-zinc-300 font-mono">
              <p className="text-zinc-300">
                • Camera zone active — 12 people detected
              </p>
              <p className="text-zinc-300">
                • Counter #2 assigned to ticket Q-142
              </p>
              <p className="text-zinc-300">
                • No-show alert triggered on Q-138, auto-bump pending
              </p>
              <p className="text-zinc-100 flex items-center gap-2 mt-4 pt-4 border-t border-zinc-600 font-sans">
                <span className="h-1.5 w-1.5 bg-white animate-pulse" />
                <span>Ready for your team login...</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-8 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={Logo}
              alt="QueueFlow Logo"
              className="h-5 w-auto object-contain grayscale opacity-60"
            />
            <span>
              &copy; {new Date().getFullYear()} QueueFlow. All rights reserved.
            </span>
          </div>
          <p className="text-[11px] uppercase">
            Intelligent Queue Management System for wait-time transparency ·
            Naga College Foundation
          </p>
        </div>
      </footer>
    </div>
  );
}
