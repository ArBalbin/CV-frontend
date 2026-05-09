import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Database,
  Eye,
  LogOut,
  RefreshCcw,
  Server,
  ShieldCheck,
  UserCircle,
  Video,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { MetricCard, Panel, StatusBadge } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL, apiClient } from '../config/api';
import { HealthStatus, UserProfileResponse } from '../types/api';
import { formatDateTime } from '../utils/format';

const dashboardAccess = [
  {
    label: 'Computer Vision',
    path: '/computer-vision',
    icon: Eye,
    detail: 'Live camera stream and queue zone monitoring',
  },
  {
    label: 'Queue Flow',
    path: '/queueflow',
    icon: Activity,
    detail: 'Queue operations, counters, and no-show settings',
  },
  {
    label: 'Queue Analytics',
    path: '/queue-analytics',
    icon: BarChart3,
    detail: 'Read-only forecasts and performance trends',
  },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfileResponse['user'] | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [lastError, setLastError] = useState('');

  const displayUser = currentUser || user;
  const username = String(displayUser?.username || 'Staff');
  const userId = String(displayUser?.id || displayUser?.userId || '1');
  const displayName = String(currentUser?.full_name || currentUser?.name || username);
  const isActive = currentUser?.is_active;
  const initial = username.charAt(0).toUpperCase();
  const profileFields = currentUser
    ? Object.entries(currentUser).filter(([key]) => !key.toLowerCase().includes('password'))
    : [];

  const refreshProfile = async () => {
    try {
      const [profileResponse, healthResponse] = await Promise.all([
        apiClient.get<UserProfileResponse>('/api/auth/profile'),
        apiClient.get<HealthStatus>('/health'),
      ]);
      setCurrentUser(profileResponse.data.user);
      setHealth(healthResponse.data);
      setLastError('');
    } catch {
      setLastError('Could not refresh the current profile/session details.');
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <DashboardLayout
      title="Profile"
      subtitle="Current staff account, session state, and dashboard access."
      eyebrow="Current User"
      actions={
        <>
          <StatusBadge label={health?.status === 'ok' ? 'Session active' : 'Checking session'} tone={health?.status === 'ok' ? 'green' : 'amber'} />
          <button onClick={refreshProfile} className="btn-secondary">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button onClick={handleLogout} className="btn-danger">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </>
      }
    >
      {lastError && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {lastError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(420px,0.8fr)_minmax(0,1.2fr)]">
        <Panel className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-950 text-4xl font-semibold text-white">
              {initial}
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-slate-950">{displayName}</h2>
            {displayName !== username && <p className="mt-1 text-sm font-semibold text-slate-600">@{username}</p>}
            <p className="mt-1 text-sm text-slate-500">Authenticated staff account</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <StatusBadge label={`User ID ${userId}`} tone="slate" />
              <StatusBadge label={String(displayUser?.role || 'Staff')} tone="blue" />
              {isActive !== undefined && (
                <StatusBadge label={isActive ? 'Active user' : 'Disabled'} tone={isActive ? 'green' : 'red'} />
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="text-slate-500">Username</span>
              <span className="font-semibold text-slate-950">{username}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="text-slate-500">Session</span>
              <span className="font-semibold text-emerald-700">Active</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="text-slate-500">Backend</span>
              <span className="max-w-52 truncate font-semibold text-slate-950">{API_BASE_URL}</span>
            </div>
          </div>
        </Panel>

        <div className="grid gap-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard icon={ShieldCheck} label="Auth status" value="Active" detail="Protected dashboard session" tone="green" />
            <MetricCard icon={Database} label="Database" value={health?.db ? 'Online' : 'Check'} detail="Backend health check" tone={health?.db ? 'green' : 'red'} />
            <MetricCard icon={Video} label="Snapshot" value={health?.snapshot ? 'Active' : 'Waiting'} detail="Detector stream state" tone={health?.snapshot ? 'green' : 'amber'} />
          </div>

          <Panel className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-blue-700" />
              <h2 className="text-base font-semibold text-slate-950">Account Details</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current user endpoint</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">GET /api/auth/profile</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Last health check</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{formatDateTime(health?.timestamp)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Backend status</p>
                <p className="mt-2 text-sm font-semibold text-slate-950">{health?.status || 'No response'}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Frontend API base</p>
                <p className="mt-2 break-all text-sm font-semibold text-slate-950">{API_BASE_URL}</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {profileFields.length > 0 && (
        <Panel className="mt-5 p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-blue-700" />
            <h2 className="text-base font-semibold text-slate-950">Profile Fields From Backend</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {profileFields.map(([key, value]) => (
              <div key={key} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{key.replace(/_/g, ' ')}</p>
                <p className="mt-2 break-words text-sm font-semibold text-slate-950">
                  {value === null || value === undefined || value === '' ? 'No data' : String(value)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel className="mt-5 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Server className="h-5 w-5 text-slate-700" />
          <h2 className="text-base font-semibold text-slate-950">Dashboard Access</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {dashboardAccess.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
              >
                <Icon className="h-5 w-5 text-blue-700" />
                <p className="mt-3 text-sm font-semibold text-slate-950">{item.label}</p>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
              </button>
            );
          })}
        </div>
      </Panel>
    </DashboardLayout>
  );
}
