import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { IoPerson } from "react-icons/io5";
import {
  Activity,
  BarChart3,
  ExternalLink,
  LogOut,
  MonitorPlay,
  UserCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../assets/img/Logo.png";
import LogoutModal from "../components/modals/LogoutModal";

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
}

const navItems = [
  {
    label: "QueuEx Dashboard",
    path: "/queueflow",
    icon: Activity,
  },
  {
    label: "Queue Analytics",
    path: "/queue-analytics",
    icon: BarChart3,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: UserCircle,
  },
];

export default function DashboardLayout({
  title,
  children,
  actions,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openLogout, setOpenLogout] = useState(false);

  const handleLogout = async () => {
    await logout();
    setOpenLogout(false);
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-inner">
          <div className="flex justify-center items-center py-6">
            <img src={Logo} className="h-20 w-auto" />
          </div>

          <div className="sidebar-section">
            <p className="sidebar-label">Workspace</p>

            <nav className="sidebar-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`nav-item ${active ? "active" : ""}`}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="sidebar-bottom">
            <a
              href="/queue-display"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 flex w-full items-center justify-between gap-2 border border-zinc-200 bg-zinc-300 px-3 py-2 text-[13px] font-medium text-zinc-900 transition hover:bg-zinc-100 hover:text-zinc-900"
            >
              <span className="inline-flex items-center gap-2">
                <MonitorPlay className="h-4 w-4" />
                Display Board
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-zinc-900" />
            </a>

            <div className="h-px bg-zinc-400 -mx-4 my-2" />

            <div className="flex items-center gap-2">
              <div className="account-avatar">
                <IoPerson className="h-4 w-4" />
              </div>
              <div className="account-copy">
                <span className="account-name">
                  {user?.username || "Staff"}
                </span>
                <span className="account-role">Authenticated session</span>
              </div>
            </div>

            <div className="h-px bg-zinc-400 -mx-4 my-2" />
            <button
              onClick={() => setOpenLogout(true)}
              className="flex items-center gap-4 p-2 text-zinc-100 hover:text-zinc-900 hover:bg-zinc-100/40 justify-start w-full"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-inner">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="page-heading">
                <h1>{title}</h1>
              </div>

              {actions && <div className="topbar-actions">{actions}</div>}
            </div>

            <div className="mobile-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`mobile-nav-item ${active ? "active" : ""}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <button onClick={handleLogout} className="mobile-nav-item">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
      <LogoutModal
        isOpen={openLogout}
        onClose={() => setOpenLogout(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
