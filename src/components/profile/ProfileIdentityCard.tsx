import { Panel, StatusBadge } from "../ui";
import { API_BASE_URL } from "../../config/api";

interface ProfileIdentityCardProps {
  initial: string;
  displayName: string;
  username: string;
  userId: string;
  role: string;
  isActive?: boolean;
}

export default function ProfileIdentityCard({
  initial,
  displayName,
  username,
  userId,
  role,
  isActive,
}: ProfileIdentityCardProps) {
  return (
    <Panel className="border-zinc-600/80 bg-[#212833] p-6 shadow-lg shadow-black/25">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-zinc-600/80 bg-[#181d24] text-2xl font-bold text-zinc-100">
          {initial}
        </div>
        <h2 className="mt-4 text-xl font-semibold text-zinc-100">
          {displayName}
        </h2>
        {displayName !== username && (
          <p className="mt-1 text-sm text-zinc-400">@{username}</p>
        )}
        <p className="mt-1 text-xs text-zinc-500">
          Authenticated staff account
        </p>
        <div className="mt-4 flex flex-wrap justify-center">
          <StatusBadge label={`User ID ${userId}`} tone="slate" />
          <StatusBadge label={role} tone="blue" />
          {isActive !== undefined && (
            <StatusBadge
              label={isActive ? "Active user" : "Disabled"}
              tone={isActive ? "green" : "red"}
            />
          )}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between rounded border border-zinc-600/60 bg-[#181d24] px-3.5 py-2.5 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Username
          </span>
          <span className="font-semibold text-zinc-100">{username}</span>
        </div>
        <div className="flex items-center justify-between rounded border border-zinc-600/60 bg-[#181d24] px-3.5 py-2.5 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Session
          </span>
          <span className="font-semibold text-emerald-400">Active</span>
        </div>
        <div className="flex items-center justify-between rounded border border-zinc-600/60 bg-[#181d24] px-3.5 py-2.5 text-sm">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Backend
          </span>
          <span className="max-w-[200px] truncate font-mono text-xs font-semibold text-zinc-300">
            {API_BASE_URL}
          </span>
        </div>
      </div>
    </Panel>
  );
}
