import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../config/api";
import { HealthStatus } from "../types/api";
import { LoginForm } from "../components/login/LoginForm";
import { RegisterForm } from "../components/login/RegisterForm";
import Logo from "../assets/img/GreenLogo.png";

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
    <main className="min-h-screen bg-gradient-to-br from-white via-zinc-50 to-emerald-50/40 flex flex-col items-center justify-between">
      <div className="w-full max-w-md my-auto">
        <div className="mb-10 flex items-center justify-center flex-col">
          <img src={Logo} className="w-auto h-28" alt="QueueFlow Logo" />
          <p className="mt-2 text-sm text-zinc-500">
            Queue management operations
          </p>
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/50">
          <div className="mb-6 w-28 flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${health ? "bg-emerald-500" : healthLoading ? "bg-zinc-400" : "bg-red-500"}`}
              />
              <span className="text-xs font-medium text-zinc-600">
                {apiLabel}
              </span>
            </div>
            {health && (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            )}
          </div>

          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <span className="text-sm text-emerald-700">{success}</span>
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

      <footer className="mt-8 text-center border-t w-full bg-emerald-700 text-xs py-4 border-zinc-400 text-zinc-100 space-y-1">
        <p>&copy; {currentYear} QueueEx. NCF. All rights reserved.</p>
      </footer>
    </main>
  );
}
