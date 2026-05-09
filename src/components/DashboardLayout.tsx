import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, Eye, LayoutDashboard, LogOut, ShieldCheck, User, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
}

const navItems = [
  {
    label: 'Computer Vision',
    path: '/computer-vision',
    icon: Eye,
  },
  {
    label: 'Queue Flow',
    path: '/queueflow',
    icon: Activity,
  },
  {
    label: 'Queue Analytics',
    path: '/queue-analytics',
    icon: BarChart3,
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: UserCircle,
  },
];

export default function DashboardLayout({ title, subtitle, children, eyebrow = 'Operations Console', actions }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-slate-950 text-white lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">QUEUE FLOW</p>
                <p className="text-xs text-slate-400">Thesis Prototype</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                    active
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <button
              onClick={() => navigate('/profile')}
              className="mb-3 flex w-full items-center gap-3 rounded-lg bg-white/5 p-3 text-left transition hover:bg-white/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.username || 'Staff'}</p>
                <p className="text-xs text-slate-400">Authenticated session</p>
              </div>
            </button>
            <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  {eyebrow}
                </div>
                <h1 className="text-2xl font-semibold tracking-normal text-slate-950 md:text-3xl">{title}</h1>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
              </div>
              {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>

            <div className="flex gap-2 overflow-x-auto lg:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? 'bg-slate-950 text-white'
                        : 'border border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
              <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
