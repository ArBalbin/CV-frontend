import { ReactNode } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Activity, BarChart3, Eye, LogOut, User, UserCircle } from "./icons";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../assets/img/Logo.png";
import LogoutModal from "../components/modals/LogoutModal";

interface DashboardLayoutProps {
  title: string;
  children: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
}

const navItems = [
  {
    label: "Computer Vision",
    path: "/computer-vision",
    icon: Eye,
  },
  {
    label: "Queue Flow",
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
      <aside className="sidebar border-r border-zinc-600">
        <div className="sidebar-inner">
          <div className=" flex mt-5 items-center justify-center">
            <img
              src={Logo}
              alt="QueueEx"
              className="h-[80px]  w-auto object-contain"
            />
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
            <div className="flex items-center px-2 gap-3">
              <User size={20} />

              <div className="account-copy">
                <span className="account-name">
                  {user?.username || "Staff"}
                </span>
              </div>
            </div>
            <div className="h-px bg-zinc-700/70 -mx-3 my-2" />

            <button
              onClick={() => setOpenLogout(true)}
              className="flex items-center text-zinc-400 py-1 text-sm hover:bg-zinc-800 hover:text-zinc-200 w-full px-2 gap-3"
            >
              <LogOut size={15} />
              <span className=" ">Log out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-inner">
            <div className="page-heading">
              <h1 className="font-mono uppercase">{title}</h1>
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
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
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
