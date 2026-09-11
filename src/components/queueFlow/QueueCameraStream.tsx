import { Panel, StatusBadge } from "../../components/ui";
import { API_BASE_URL } from "../../config/api";
import { HealthStatus, QueueData } from "../../types/api";
import { formatTimestamp } from "../../utils/format";
import { FaVideoSlash } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa";

interface QueueCameraStreamProps {
  data: QueueData;
  health: HealthStatus | null;
  streamError: boolean;
  streamKey: number;
  onRetryStream: () => void;
  onStreamError: () => void;
}

export function QueueCameraStream({
  data,
  health,
  streamError,
  streamKey,
  onRetryStream,
  onStreamError,
}: QueueCameraStreamProps) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-zinc-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded border border-zinc-800 p-2 text-zinc-400">
            <FaVideo className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Queue Camera
            </h2>
            <p className="font-mono text-xs text-zinc-500">
              Updated {formatTimestamp(data.timestamp)}
            </p>
          </div>
        </div>

        <StatusBadge
          label={health?.snapshot ? "Streaming" : "Waiting"}
          tone={health?.snapshot ? "green" : "amber"}
        />
      </div>
      <div className="relative bg-zinc-950">
        <div className="aspect-video">
          {!streamError ? (
            <img
              key={streamKey}
              src={`${API_BASE_URL}/api/crowd/video`}
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
                  Retrying in 5 s…
                </p>
                <button
                  onClick={onRetryStream}
                  className="mt-4 rounded bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900"
                >
                  Retry now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
