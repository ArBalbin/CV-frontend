import { UserCircle } from "lucide-react";
import { Panel } from "../ui";
import { HealthStatus } from "../../types/api";
import { formatDateTime } from "../../utils/format";
import { API_BASE_URL } from "../../config/api";

interface AccountDetailsPanelProps {
  health: HealthStatus | null;
}

export function AccountDetailsPanel({ health }: AccountDetailsPanelProps) {
  return (
    <Panel className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <UserCircle className="h-5 w-5 text-emerald-400" />
        <h2 className="text-base font-semibold text-zinc-100">
          Account Details
        </h2>
      </div>
      <div className="h-px bg-zinc-600 -mx-5 mb-4" />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-sm border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Current user endpoint
          </p>
          <p className="mt-2 text-sm font-semibold text-zinc-100 font-mono">
            GET /api/auth/profile
          </p>
        </div>
        <div className="rounded-sm border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Last health check
          </p>
          <p className="mt-2 text-sm font-semibold text-zinc-100">
            {formatDateTime(health?.timestamp)}
          </p>
        </div>
        <div className="rounded-sm border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Backend status
          </p>
          <p className="mt-2 text-sm font-semibold text-zinc-100">
            {health?.status || "No response"}
          </p>
        </div>
        <div className="rounded-sm border border-zinc-800 bg-zinc-900/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Frontend API base
          </p>
          <p className="mt-2 break-all text-sm font-semibold text-zinc-100 font-mono">
            {API_BASE_URL}
          </p>
        </div>
      </div>
    </Panel>
  );
}
