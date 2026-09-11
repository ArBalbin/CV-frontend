import { StatusBadge } from "../ui";
import { API_BASE_URL } from "../../config/api";

interface ProfileCardProps {
  displayUser: any;
  username: string;
  userId: string;
  displayName: string;
  isActive?: boolean;
  initial: string;
}

export function ProfileCard({
  displayUser,
  username,
  userId,
  displayName,
  isActive,
  initial,
}: ProfileCardProps) {
  return (
    <div className="rounded-[4px] border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-950/60 border border-emerald-900/40 text-4xl font-semibold text-emerald-400 shadow-inner">
          {initial}
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-zinc-100">
          {displayName}
        </h2>
        {displayName !== username && (
          <p className="mt-1 text-sm font-semibold text-zinc-400">
            @{username}
          </p>
        )}
        <p className="mt-1 text-sm text-zinc-500">
          Authenticated staff account
        </p>
        <div className="mt-4 flex flex-wrap justify-center">
          <StatusBadge label={`User ID ${userId}`} tone="slate" />
          <StatusBadge
            label={String(displayUser?.role || "Staff")}
            tone="blue"
          />
          {isActive !== undefined && (
            <StatusBadge
              label={isActive ? "Active user" : "Disabled"}
              tone={isActive ? "green" : "red"}
            />
          )}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between rounded-sm bg-zinc-900/80 border border-zinc-800/80 px-4 py-3 text-sm">
          <span className="text-zinc-400">Username</span>
          <span className="font-semibold text-zinc-200">{username}</span>
        </div>
        <div className="flex items-center justify-between rounded-sm bg-zinc-900/80 border border-zinc-800/80 px-4 py-3 text-sm">
          <span className="text-zinc-400">Session</span>
          <span className="font-semibold text-emerald-400">Active</span>
        </div>
        <div className="flex items-center justify-between rounded-sm bg-zinc-900/80 border border-zinc-800/80 px-4 py-3 text-sm">
          <span className="text-zinc-400">Backend</span>
          <span className="max-w-[200px] truncate font-semibold text-zinc-200 font-mono text-xs">
            {API_BASE_URL}
          </span>
        </div>
      </div>
    </div>
  );
}
