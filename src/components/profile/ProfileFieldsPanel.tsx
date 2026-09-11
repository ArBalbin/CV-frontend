import { UserCircle } from "lucide-react";
import { Panel } from "../ui";

interface ProfileFieldsPanelProps {
  profileFields: Array<[string, unknown]>;
}

export function ProfileFieldsPanel({ profileFields }: ProfileFieldsPanelProps) {
  if (profileFields.length === 0) return null;

  return (
    <Panel className="mt-5 p-5">
      <div className="mb-4 flex items-center gap-2">
        <UserCircle className="h-5 w-5 text-emerald-400" />
        <h2 className="text-base font-semibold text-zinc-100">
          Profile Fields From Backend
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {profileFields.map(([key, value]) => (
          <div
            key={key}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              {key.replace(/_/g, " ")}
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-zinc-100">
              {value === null || value === undefined || value === ""
                ? "No data"
                : String(value)}
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
