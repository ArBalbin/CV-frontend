import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Database,
  LogOut,
  RefreshCcw,
  Server,
  ShieldCheck,
  UserCircle,
  Video,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { MetricCard, Panel, StatusBadge } from "../components/ui";
import ProfileIdentityCard from "../components/profile/ProfileIdentityCard";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL, apiClient } from "../config/api";
import { HealthStatus, UserProfileResponse } from "../types/api";
import { formatDateTime } from "../utils/format";
import LogoutModal from "../components/modals/LogoutModal";

const dashboardAccess = [
  {
    label: "QueuEx",
    path: "/queueflow",
    icon: Activity,
    detail: "Queue operations, counters, camera feed, and no-show settings",
  },
  {
    label: "Queue Analytics",
    path: "/queue-analytics",
    icon: BarChart3,
    detail: "Read-only forecasts and performance trends",
  },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<
    UserProfileResponse["user"] | null
  >(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [lastError, setLastError] = useState("");
  const [openLogout, setOpenLogout] = useState(false);

  const displayUser = currentUser || user;
  const username = String(displayUser?.username || "Staff");
  const userId = String(displayUser?.id || displayUser?.userId || "1");
  const displayName = String(
    currentUser?.full_name || currentUser?.name || username,
  );
  const isActive = currentUser?.is_active;
  const initial = username.charAt(0).toUpperCase();
  const profileFields = currentUser
    ? Object.entries(currentUser).filter(
        ([key]) => !key.toLowerCase().includes("password"),
      )
    : [];

  const refreshProfile = async () => {
    try {
      const [profileResponse, healthResponse] = await Promise.all([
        apiClient.get<UserProfileResponse>("/api/auth/profile"),
        apiClient.get<HealthStatus>("/health"),
      ]);
      setCurrentUser(profileResponse.data.user);
      setHealth(healthResponse.data);
      setLastError("");
    } catch {
      setLastError("Could not refresh the current profile/session details.");
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    setOpenLogout(false);
    navigate("/login");
  };

  return (
    <DashboardLayout
      title="Profile"
      subtitle="Current staff account, session state, and dashboard access."
      eyebrow="Current User"
      actions={
        <>
          <StatusBadge
            label={
              health?.status === "ok" ? "Session active" : "Checking session"
            }
            tone={health?.status === "ok" ? "green" : "amber"}
          />
          <button onClick={refreshProfile} className="btn-secondary">
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button onClick={() => setOpenLogout(true)} className="btn-danger">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </>
      }
    >
      {lastError && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-sm border border-red-500/40 bg-red-950/60 px-4 py-3 text-sm text-red-200 shadow-lg backdrop-blur">
          {lastError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(420px,0.8fr)_minmax(0,1.2fr)]">
        <ProfileIdentityCard
          initial={initial}
          displayName={displayName}
          username={username}
          userId={userId}
          role={String(displayUser?.role || "Staff")}
          isActive={isActive}
        />

        <div className="grid gap-5">
          <div className="grid grid-cols-3 divide-x divide-zinc-600/60 rounded-sm border border-zinc-600/80 bg-[#212833] shadow-lg shadow-black/25 overflow-hidden mb-5">
            <MetricCard
              icon={ShieldCheck}
              label="Auth status"
              value="Active"
              detail="Protected dashboard session"
              tone="green"
            />
            <MetricCard
              icon={Database}
              label="Database"
              value={health?.db ? "Online" : "Check"}
              detail="Backend health check"
              tone={health?.db ? "green" : "red"}
            />
            <MetricCard
              icon={Video}
              label="Snapshot"
              value={health?.snapshot ? "Active" : "Waiting"}
              detail="Detector stream state"
              tone={health?.snapshot ? "green" : "amber"}
            />
          </div>

          <Panel className="border-zinc-600/80 bg-[#212833] p-5 shadow-lg shadow-black/25">
            <div className="mb-4 flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-zinc-100">
                Account Details
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded border border-zinc-600/60 bg-[#181d24] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Current user endpoint
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-100 font-mono">
                  GET /api/auth/profile
                </p>
              </div>
              <div className="rounded border border-zinc-600/60 bg-[#181d24] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Last health check
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-100 font-mono">
                  {formatDateTime(health?.timestamp)}
                </p>
              </div>
              <div className="rounded border border-zinc-600/60 bg-[#181d24] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Backend status
                </p>
                <p className="mt-2 text-sm font-semibold text-zinc-100 font-mono">
                  {health?.status || "No response"}
                </p>
              </div>
              <div className="rounded border border-zinc-600/60 bg-[#181d24] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Frontend API base
                </p>
                <p className="mt-2 break-all text-sm font-semibold text-zinc-100 font-mono">
                  {API_BASE_URL}
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {profileFields.length > 0 && (
        <Panel className="mt-5 border-zinc-600/80 bg-[#212833] p-5 shadow-lg shadow-black/25">
          <div className="mb-4 flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-zinc-100">
              Profile Fields From Backend
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {profileFields.map(([key, value]) => (
              <div
                key={key}
                className="rounded border border-zinc-600/60 bg-[#181d24] p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="mt-2 break-words text-sm font-semibold text-zinc-100 font-mono">
                  {value === null || value === undefined || value === ""
                    ? "No data"
                    : String(value)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel className="mt-5 border-zinc-600/80 bg-[#212833] p-5 shadow-lg shadow-black/25">
        <div className="mb-4 flex items-center gap-2">
          <Server className="h-5 w-5 text-zinc-300" />
          <h2 className="text-base font-semibold text-zinc-100">
            Dashboard Access
          </h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {dashboardAccess.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="rounded border border-zinc-600/60 bg-[#181d24] p-4 text-left transition hover:border-emerald-500 hover:bg-[#283140]/40"
              >
                <Icon className="h-5 w-5 text-emerald-400" />
                <p className="mt-3 text-sm font-semibold text-zinc-100">
                  {item.label}
                </p>
                <p className="mt-1 text-sm text-zinc-400">{item.detail}</p>
              </button>
            );
          })}
        </div>
      </Panel>

      <LogoutModal
        isOpen={openLogout}
        onClose={() => setOpenLogout(false)}
        onConfirm={handleLogout}
      />
    </DashboardLayout>
  );
}
