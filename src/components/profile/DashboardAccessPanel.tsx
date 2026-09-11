import { useNavigate } from "react-router-dom";
import { Server, Eye, Activity, BarChart3, LucideIcon } from "lucide-react";
import { Panel } from "../ui";

interface DashboardItem {
  label: string;
  path: string;
  icon: LucideIcon;
  detail: string;
}

const dashboardAccess: DashboardItem[] = [
  {
    label: "Computer Vision",
    path: "/computer-vision",
    icon: Eye,
    detail: "Live camera stream and queue zone monitoring",
  },
  {
    label: "Queue Flow",
    path: "/queueflow",
    icon: Activity,
    detail: "Queue operations, counters, and no-show settings",
  },
  {
    label: "Queue Analytics",
    path: "/queue-analytics",
    icon: BarChart3,
    detail: "Read-only forecasts and performance trends",
  },
];

export function DashboardAccessPanel() {
  const navigate = useNavigate();

  return (
    <Panel className="mt-5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Server className="h-5 w-5 text-zinc-400" />
        <h2 className="text-base font-semibold text-zinc-100">
          Dashboard Access
        </h2>
      </div>
      <div className="h-px bg-zinc-600 -mx-5 mb-4" />

      <div className="grid gap-3 md:grid-cols-3">
        {dashboardAccess.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="group rounded-sm border border-zinc-800 bg-zinc-900/40 p-4 text-left transition-all hover:border-emerald-500/50 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-black/20"
            >
              <div className="rounded-sm bg-emerald-950/40 border border-emerald-900/30 p-2.5 w-fit text-emerald-400 group-hover:scale-105 transition-transform">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                {item.label}
              </p>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                {item.detail}
              </p>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
