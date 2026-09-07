# QueuEx Staff Dashboard — Developer & UI Reference

React + TypeScript + Vite dashboard for **staff**. Students use a separate
Flutter app (documented in `MOBILE_APP_DOCUMENTATION.md` in that repo).

Written for someone picking up UI work without having built this. Covers
what each page does, the design system, and the constraints an enhancement
shouldn't break.

---

## 1. What this dashboard is for

Front-desk staff use it to run the queue. Most of the queue fills itself —
the camera recognises registered students and issues their numbers — so
staff mainly handle **exceptions**:

- Adding walk-ins (people with a printed kiosk ticket and no account)
- Marking people served or no-show
- Linking someone the camera saw but couldn't identify
- Adjusting counters and no-show timing

**Design consequence:** the primary user is a busy clerk, not an engineer.
Anything requiring CV knowledge to interpret is a defect, not a feature.
The dashboard should answer *"who's next and what needs my attention?"* at
a glance.

---

## 2. Stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Routing | React Router v6 |
| Styling | Tailwind (stock config, no custom palette) |
| Charts | Chart.js via `react-chartjs-2` |
| Icons | `lucide-react` |
| HTTP | `axios` (`src/config/api.ts`) |

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run typecheck  # keep clean
```

Backend URL resolves from `VITE_API_URL`, else the cloud backend in
production, else `http://<current-hostname>:5000` in dev. Using the
hostname rather than `localhost` means the dashboard works from another
device on the same network.

---

## 3. Routes and navigation

```
/login              public    Staff sign-in
/queue-display      public    Lobby "Now Serving" board (big screen)
/queueflow          protected Main operational dashboard  ← default
/queue-analytics    protected Reporting
/profile            protected Staff account
/computer-vision    →         redirects to /queueflow (legacy link)
/  and  *           →         redirect to /queueflow
```

`ProtectedRoute` in `App.tsx` checks `useAuth().isAuthenticated` and
redirects to `/login`.

**Sidebar has 3 items:** QueuEx, Queue Analytics, Profile — plus an "Open
Display Board ↗" link that opens `/queue-display` in a new tab.

There used to be a separate "Computer Vision" page showing the camera feed
and detection metrics. It duplicated what the main dashboard already
showed, so it was merged in as a collapsible section and its route now
redirects. Don't reintroduce it as a nav item.

`/login` and `/queue-display` deliberately **do not** use `DashboardLayout`
— one is pre-auth, the other is a full-bleed lobby screen.

---

## 4. Pages

### `/queueflow` — QueuEx Dashboard (`QueueFlowDashboard.tsx`)
The main screen; everything operational lives here. Polls every 3s, with a
Pause control.

**Header:** live/offline badge, Refresh, Pause/Resume.

**Alert banners** (conditional, top of page):
- **No-show alerts** — "Q### absent at the first position. Auto-bump in Ns." with a *Bump now* button
- **On-way notifications** — a student tapped "I'm on my way" in their app

**Metric cards** (8): Queue length, Pending link, Current wait, Counters,
Avg service time, Utilization, Arrival rate, Served.

Grid is `grid-cols-2 sm:3 lg:5 2xl:9`. It was previously forced to 9 across
at `xl`, which squeezed labels onto three lines — don't reintroduce a fixed
high column count.

**Wait-Time Forecast** — now / 5 / 15 / 30 min, plus utilisation bar.

**Queue Camera** — live MJPEG stream from `/api/crowd/video`, auto-retries
after 5s on error.

**Queue Tracker** — the core list. Per person: queue label, position,
status (Waiting / Missing / Serving · Counter N), wait time, joined-at, and
a **Done** button. Header has a Ticket # input + **Manual Add** (this is how
walk-ins get in) and a confirm-gated **Reset**.

**Service Controls** — active counters stepper (1–10), no-show window
(30–300s).

**Camera & Detection** — collapsible. People count, density, system health,
detection trend chart. Collapsed by default since it's diagnostic, not
operational.

**Exceptions panel** — two subsections:
- **Pending link** — camera confirmed someone present but couldn't identify them. Shows whether a face was detected, seconds waiting, and a Ticket # + **Link** action.
- **Recently completed** — with Served / No-show badges.

### `/queue-analytics` — Analytics (`QueueAnalytics.tsx`)
Read-only. Metric cards, forecast summary, current queue estimates, and two
trend charts. No mutating actions — safe to leave open on a second monitor.

### `/queue-display` — Display Board (`QueueDisplayBoard.tsx`)
**Public, unauthenticated** — for a lobby screen facing students, not staff.
Large "Now Serving" cards per counter, waiting grid, and text-to-speech
announcements ("Customer number X, please proceed to Counter Y"). Polls
every 3s.

Browsers block autoplay audio until the page is interacted with, so it
requires one tap to unlock speech. Keep that prompt — without it the
announcements silently never play.

Design constraints: read from **several metres away**, runs unattended for
hours. Large type, high contrast, no hover-dependent information.

### `/login` — Staff Sign-in (`Login.tsx`)
Split screen: branding + live backend health on the left, sign-in/register
toggle on the right. Registration requires a staff registration code.
Showing backend status pre-auth is deliberate — it tells staff whether a
failure is their password or the server.

### `/profile` — Staff Profile (`Profile.tsx`)
Account details, session info, and shortcuts to the dashboards.

---

## 5. Design system

### Components — `src/components/ui.tsx`

| Component | Props | Use |
|---|---|---|
| `Panel` | `children`, `className` | White rounded card. The base container for everything |
| `MetricCard` | `icon`, `label`, `value`, `detail`, `tone` | Single stat |
| `StatusBadge` | `label`, `tone` | Small status pill |
| `EmptyState` | `icon`, `title`, `detail` | Empty list placeholder |
| `ProgressBar` | `value` (0–100), `tone` | Utilisation bars |

**Extend these rather than adding one-off styling.** They're applied
uniformly across every page, which is why the dashboard reads as one
system.

### Tone system

Six tones — `blue` `teal` `amber` `red` `slate` `green` — centralised in
`ui.tsx`. The mapping is **semantic and load-bearing**:

| Tone | Meaning |
|---|---|
| `blue` | Primary / neutral information |
| `green` | Good, served, healthy |
| `amber` | Warning, pending, needs attention |
| `red` | Critical, error, over capacity |
| `teal` | Secondary information |
| `slate` | Inactive, zero, neutral |

Several places pick a tone *from data* — e.g. utilisation is green under
70%, amber to 90%, red above. Restyling is fine; **breaking the
meaning-to-colour mapping is not**, because staff scan by colour before
reading numbers.

### Global classes — `src/index.css`
`.btn-primary`, `.btn-secondary`, `.btn-danger`, `.field`, plus base
colours and custom scrollbars.

### Layout — `src/components/DashboardLayout.tsx`
Shared shell for protected pages: fixed dark sidebar (desktop) or scrolling
nav row (mobile), page header with eyebrow / title / subtitle and an
`actions` slot, content capped at `max-w-[1800px]`.

---

## 6. Data types — `src/types/api.ts`

Every backend response shape is typed here, with comments explaining the
domain. Read this before adding UI — it's the fastest way to learn what the
system actually tracks.

Key ones: `QueueData`, `QueueState`, `QueuePerson`, `PendingPerson`,
`NoshowAlert`, `OnWayNotification`, `QueuePrediction`, `QueueAnalytics`,
`HealthStatus`.

**Keep this file in sync with the backend.** It is currently accurate — a
stale types file is worse than none, because it looks authoritative.

---

## 7. Language rules

The dashboard is used by front-desk staff, not engineers. Two examples of
what that means in practice, both already applied:

- Camera tracking IDs (`Track #47`) are internal. They're de-emphasised, not
  used as primary labels.
- "face seen" / "no face yet" became **"Face detected" / "Waiting for face"**.

**Rule:** if a label needs computer-vision knowledge to interpret, rewrite
it. Diagnostic detail belongs in the collapsible Camera & Detection section,
not in the operational flow.

---

## 8. Rules an enhancement must not break

1. **Colour tones carry meaning.** Restyle freely; don't remap semantics.
2. **Don't reintroduce Computer Vision as a nav item.** It was merged deliberately.
3. **Keep the Display Board's tap-to-enable-audio prompt** — announcements are silent without it.
4. **Manual Add and Link are load-bearing**, not legacy. They're how walk-ins and unidentified people get handled.
5. **Reset stays confirm-gated.** It clears the live queue.
6. **No CV jargon in operational UI.**
7. **Keep `npm run typecheck` clean.**
