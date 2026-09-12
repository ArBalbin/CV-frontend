import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../config/api";
import { HealthStatus } from "../types/api";
import { LoginForm } from "../components/login/LoginForm";
import { RegisterForm } from "../components/login/RegisterForm";
import Logo from "../assets/img/Logo.png";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [regCode, setRegCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchHealth = async () => {
      try {
        const response = await apiClient.get<HealthStatus>("/health");
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
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "login") {
      try {
        await login(username, password);
        navigate("/computer-vision");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Invalid credentials");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await apiClient.post("/api/auth/register", {
          username,
          password,
          full_name: fullName,
          registration_code: regCode,
        });
        setSuccess("Account created! You can now sign in.");
        setMode("login");
        setFullName("");
        setRegCode("");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Registration failed");
      } finally {
        setLoading(false);
      }
    }
  };

  const apiLabel = health
    ? "API online"
    : healthLoading
      ? "Checking"
      : "API offline";

  const handleToggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
    setSuccess("");
  };

  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f1117] via-[#15181d] to-[#1a1e26] flex flex-col items-center justify-between">
      <div className="w-full max-w-md my-auto">
        <div className="mb-10 flex items-center justify-center flex-col">
          <img src={Logo} className="w-auto h-28" alt="QueueFlow Logo" />
          <p className="mt-2 text-sm text-slate-400">
            Queue management operations
          </p>
        </div>

        <div className="rounded-md border border-slate-700/80 bg-[#1a1e26] p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-6 w-28 flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${health ? "bg-emerald-500" : healthLoading ? "bg-slate-500" : "bg-red-500"}`}
              />
              <span className="text-xs font-medium text-slate-300">
                {apiLabel}
              </span>
            </div>
            {health && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            )}
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
              <span className="text-sm text-red-300">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
              <span className="text-sm text-emerald-300">{success}</span>
            </div>
          )}

          {mode === "login" ? (
            <LoginForm
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              loading={loading}
              onSubmit={handleSubmit}
              onToggleMode={handleToggleMode}
            />
          ) : (
            <RegisterForm
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              fullName={fullName}
              setFullName={setFullName}
              regCode={regCode}
              setRegCode={setRegCode}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              loading={loading}
              onSubmit={handleSubmit}
              onToggleMode={handleToggleMode}
            />
          )}
        </div>
      </div>

      <footer className="mt-8 text-center border-t w-full text-xs py-4 border-zinc-600 text-slate-500 space-y-1">
        <p>&copy; {currentYear} QueueEx. All rights reserved.</p>
      </footer>
    </main>
  );
}
