import { Panel, StatusBadge } from "../ui";
import { HealthStatus, QueueZone } from "../../types/api";
import { formatTimestamp } from "../../utils/format";
import { FaVideo } from "react-icons/fa";
import { FaVideoSlash } from "react-icons/fa6";

interface CameraStreamPanelProps {
  timestamp: string | number;
  zone: QueueZone | null;
  health: HealthStatus | null;
  streamError: boolean;
  streamKey: number;
  videoUrl: string;
  onStreamError: () => void;
  onRetry: () => void;
}

export function CameraStreamPanel({
  timestamp,
  zone,
  health,
  streamError,
  streamKey,
  videoUrl,
  onStreamError,
  onRetry,
}: CameraStreamPanelProps) {
  return (
    <Panel className="overflow-hidden pb-10 h-fit">
      <div className="flex flex-col gap-3 border-b border-zinc-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded border border-zinc-800 p-2 text-zinc-400">
            <FaVideo className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Annotated camera stream
            </h2>
            <p className="font-mono text-xs text-zinc-500">
              last update {formatTimestamp(timestamp)}
            </p>
          </div>
        </div>
        {zone && (
          <StatusBadge
            label={`Zone ${zone.x1},${zone.y1} to ${zone.x2},${zone.y2}`}
            tone="blue"
          />
        )}
      </div>
      <div className="relative bg-zinc-950">
        <div className="aspect-video">
          {!streamError ? (
            <img
              key={streamKey}
              src={videoUrl}
              alt="Live annotated queue camera stream"
              className="h-full w-full object-contain"
              onError={onStreamError}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-zinc-400">
              <div>
                <FaVideoSlash
                  className="mx-auto h-9 w-9 text-zinc-600"
                  strokeWidth={1.5}
                />
                <p className="mt-3 text-sm font-medium text-zinc-100">
                  Video stream unavailable
                </p>
                <p className="mt-1 font-mono text-xs text-zinc-500">
                  retrying in 5s
                </p>
                <button
                  onClick={onRetry}
                  className="mt-4 rounded bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900"
                >
                  Retry now
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="absolute left-4 top-4">
          <StatusBadge
            label={
              health?.snapshot ? "Snapshot receiving" : "Waiting for snapshot"
            }
            tone={health?.snapshot ? "green" : "amber"}
          />
        </div>
      </div>
    </Panel>
  );
}