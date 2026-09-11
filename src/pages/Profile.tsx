import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, RefreshCcw, AlertTriangle } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { StatusBadge } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../config/api";
import { HealthStatus, UserProfileResponse } from "../types/api";
import LogoutModal from "../components/modals/LogoutModal";
import { ProfileCard } from "../components/profile/ProfileCard";
import { ProfileMetricsGrid } from "../components/profile/ProfileMetricsGrid";
import { AccountDetailsPanel } from "../components/profile/AccountDetailsPanel";
import { ProfileFieldsPanel } from "../components/profile/ProfileFieldsPanel";
import { DashboardAccessPanel } from "../components/profile/DashboardAccessPanel";

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
        <div className="mb-4 flex items-center justify-between gap-3 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {lastError}
          </div>
          <button
            onClick={() => setLastError("")}
            className="font-semibold text-red-300 hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(420px,0.8fr)_minmax(0,1.2fr)]">
        <ProfileCard
          displayUser={displayUser}
          username={username}
          userId={userId}
          displayName={displayName}
          isActive={isActive}
          initial={initial}
        />

        <div className="grid gap-5">
          <ProfileMetricsGrid health={health} />
          <AccountDetailsPanel health={health} />
        </div>
      </div>

      <ProfileFieldsPanel profileFields={profileFields} />
      <DashboardAccessPanel />

      <LogoutModal
        isOpen={openLogout}
        onClose={() => setOpenLogout(false)}
        onConfirm={handleLogout}
      />
    </DashboardLayout>
  );
}
