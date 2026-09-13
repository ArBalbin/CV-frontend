import { Panel, StatusBadge } from "../ui";
import { API_BASE_URL } from "../../config/api";
import { HealthStatus, QueueData } from "../../types/api";
import { formatTimestamp } from "../../utils/format";
import { FaVideoSlash } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";

interface CameraPanelProps {
  data: QueueData;
  health: HealthStatus | null;
  streamError: boolean;
  streamKey: number;
  onStreamError: () => void;
  onRetry: () => void;
}

export default function CameraPanel({
  data,
  health,
  streamError,
  streamKey,
  onStreamError,
  onRetry,
}: CameraPanelProps) {
  return (
    <Panel className="overflow-hidden border border-zinc-200/80 bg-white shadow-sm rounded-sm">
      <div className="flex items-center justify-between pb-2 bg-white">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-zinc-100/60 p-2.5 text-emerald-600 shadow-inner">
            <FaVideo className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900">
              Queue Camera
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Updated {formatTimestamp(data.timestamp)}
            </p>
          </div>
        </div>
        <StatusBadge
          label={health?.snapshot ? "Streaming" : "Waiting"}
          tone={health?.snapshot ? "green" : "amber"}
        />
      </div>
      <div className="h-px bg-zinc-300 mb-4 -mx-5" />

      <div className="bg-zinc-50">
        <div className="aspect-video overflow-hidden rounded-md border border-zinc-100/60 bg-black/85">
          {!streamError ? (
            <img
              key={streamKey}
              src={`${API_BASE_URL}/api/crowd/video`}
              alt="Live annotated queue camera stream"
              className="h-full w-full object-contain"
              onError={onStreamError}
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-zinc-500">
              <div>
                <FaVideoSlash className="mx-auto h-10 w-10 text-zinc-100" />
                <p className="mt-3 text-sm font-semibold text-zinc-100">
                  Video stream unavailable
                </p>
                <p className="mt-1 text-xs text-zinc-200">Retrying in 5 s…</p>
                <button
                  onClick={onRetry}
                  className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-zinc-100 transition hover:bg-emerald-700 shadow-md"
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
