import { FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, User } from "lucide-react";

interface LoginFormProps {
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  onSubmit: (event: FormEvent) => void;
  onToggleMode: () => void;
}

export function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  onSubmit,
  onToggleMode,
}: LoginFormProps) {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-xl uppercase font-semibold text-white">Sign In</h2>
        </div>
        <p className="text-sm text-slate-400">
          Access your queue management dashboard
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400"
          >
            Username
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-sm border border-slate-700 bg-slate-800/50 px-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              placeholder="staff_username"
              required
              autoFocus
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400"
          >
            Password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-slate-700 bg-slate-800/50 px-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm bg-blue-600 hover:bg-blue-900 disabled:bg-slate-700 disabled:cursor-not-allowed py-2.5 text-sm font-semibold text-white transition shadow-lg"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-400">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onToggleMode}
            className="font-semibold text-blue-400 hover:text-blue-300 transition"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
