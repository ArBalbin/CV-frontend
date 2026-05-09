import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, Eye, EyeOff, LockKeyhole, Server, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL, apiClient } from '../config/api';
import { HealthStatus } from '../types/api';
import { StatusBadge } from '../components/ui';
import { formatDateTime } from '../utils/format';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchHealth = async () => {
      try {
        const response = await apiClient.get<HealthStatus>('/health');
        if (!cancelled) setHealth(response.data);
      } catch {
        if (!cancelled) setHealth(null);
      } finally {
        if (!cancelled) setHealthLoading(false);
      }
    };

    fetchHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/computer-vision');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const apiTone = health ? 'green' : healthLoading ? 'slate' : 'red';
  const apiLabel = health ? 'API online' : healthLoading ? 'Checking API' : 'API offline';

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[1fr_440px]">
        <section className="hidden border-r border-slate-200 bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="flex flex-1 flex-col justify-center">
            <div className="mx-auto max-w-sm text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-950/30">
                <Activity className="h-12 w-12" />
              </div>
              <h1 className="mt-7 text-4xl font-semibold tracking-normal">QUEUE FLOW</h1>
              <p className="mt-3 text-base text-slate-300">Operations console</p>
            </div>
          </div>

          <div>
            <div className="grid gap-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Backend</span>
                  <StatusBadge label={apiLabel} tone={apiTone} />
                </div>
                <p className="mt-3 break-all text-sm text-slate-400">{API_BASE_URL}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <Server className="h-5 w-5 text-blue-300" />
                  <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">Database</p>
                  <p className="mt-1 text-sm font-semibold">{health?.db ? 'Connected' : 'Unavailable'}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                  <p className="mt-3 text-xs uppercase tracking-wide text-slate-400">Snapshot</p>
                  <p className="mt-1 text-sm font-semibold">{health?.snapshot ? 'Receiving' : 'Waiting'}</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-400">
            Last API check: {health ? formatDateTime(health.timestamp) : 'No response'}
          </p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Staff sign in</h2>
              <p className="mt-2 text-sm text-slate-500">Access the Queue Flow dashboards.</p>
            </div>

            <div className="mb-5 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Server className="h-4 w-4" />
                Backend status
              </div>
              <StatusBadge label={apiLabel} tone={apiTone} />
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-semibold text-slate-700">
                  Username
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="field pl-10"
                    placeholder="Staff username"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="field px-10"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
