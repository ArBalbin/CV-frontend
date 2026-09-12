import { AlertTriangle } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4 rounded-sm border border-red-500/40 bg-red-950/60 px-4 py-3 text-sm text-red-200 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2.5 font-medium">
        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
        <span>{message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="rounded bg-red-900/40 px-2.5 py-1 text-xs font-semibold text-red-200 transition hover:bg-red-900/70 border border-red-700/50"
      >
        Dismiss
      </button>
    </div>
  );
}
