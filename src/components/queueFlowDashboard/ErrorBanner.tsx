import { AlertTriangle } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4 rounded-sm border border-red-700 bg-red-600 px-4 py-3 text-sm text-red-100 shadow-sm">
      <div className="flex items-center gap-2.5 font-medium">
        <AlertTriangle className="h-4 w-4 text-red-100 shrink-0" />
        <span>{message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="rounded bg-white px-2.5 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100 border border-red-200"
      >
        Dismiss
      </button>
    </div>
  );
}
