import { useCallback, useEffect, useRef, useState } from "react";
import { Panel, StatusBadge } from "../ui";
import { API_BASE_URL } from "../../config/api";
import { getSessionToken } from "../../contexts/AuthContext";
import { HealthStatus, QueueData } from "../../types/api";
import { formatTimestamp } from "../../utils/format";
import { FaVideoSlash } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";

// The detector serves the camera on the computer it runs on. When this
// dashboard is open on that same computer, the picture comes straight from
// there instead of making a round trip through the cloud server, which put it
// one to two seconds behind. Set VITE_LOCAL_CAMERA_URL to "" to turn this off.
const LOCAL_CAMERA_URL = (
  (import.meta.env.VITE_LOCAL_CAMERA_URL as string | undefined) ?? "http://127.0.0.1:8765"
).replace(/\/$/, "");
const PING_TIMEOUT_MS = 2500;
// Chrome may hold the first check while it asks the staff member to allow
// access to this computer; look again shortly after, once they have answered.
const RECHECK_AFTER_PROMPT_MS = 10_000;
const PREFER_SERVER_KEY = "queuex.camera.preferServer";

type Source = "local" | "server";

function readPreferServer(): boolean {
  try {
    return localStorage.getItem(PREFER_SERVER_KEY) === "1";
  } catch {
    return false;
  }
}

function writePreferServer(value: boolean) {
  try {
    if (value) localStorage.setItem(PREFER_SERVER_KEY, "1");
    else localStorage.removeItem(PREFER_SERVER_KEY);
  } catch {
    // Storage blocked: the choice simply lasts until the page is reloaded.
  }
}

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
  const [source, setSource] = useState<Source>("server");
  const [preferServer, setPreferServer] = useState(readPreferServer);
  const [checkCount, setCheckCount] = useState(0);
  const recheckTimer = useRef<number | undefined>(undefined);

  // Is the detector running on this computer? Asked on load, on Retry, and
  // when the staff member switches back to the direct view.
  useEffect(() => {
    if (!LOCAL_CAMERA_URL || preferServer) {
      setSource("server");
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    fetch(`${LOCAL_CAMERA_URL}/ping`, { cache: "no-store", signal: controller.signal })
      .then((response) => setSource(response.ok ? "local" : "server"))
      .catch((error: unknown) => {
        setSource("server");
        // A timeout usually means Chrome is still showing its permission prompt.
        if (error instanceof DOMException && error.name === "AbortError") {
          recheckTimer.current = window.setTimeout(
            () => setCheckCount((n) => n + 1),
            RECHECK_AFTER_PROMPT_MS,
          );
        }
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
      window.clearTimeout(recheckTimer.current);
    };
  }, [streamKey, preferServer, checkCount]);

  const switchToServerFeed = useCallback(() => {
    writePreferServer(true);
    setPreferServer(true);
  }, []);

  const switchToDirectFeed = useCallback(() => {
    writePreferServer(false);
    setPreferServer(false);
    setCheckCount((n) => n + 1);
  }, []);

  const local = source === "local";
  const imageSrc = local
    ? `${LOCAL_CAMERA_URL}/video?k=${streamKey}`
    : // The server stream needs a staff session; an <img> cannot send the
      // session header, so the token goes in the URL.
      `${API_BASE_URL}/api/crowd/video?token=${encodeURIComponent(getSessionToken() ?? "")}`;

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
          label={local ? "Live" : health?.snapshot ? "Streaming" : "Waiting"}
          tone={local || health?.snapshot ? "green" : "amber"}
        />
      </div>
      <div className="h-px bg-zinc-300 mb-4 -mx-5" />

      <div className="bg-zinc-50">
        <div className="aspect-video overflow-hidden rounded-md border border-zinc-100/60 bg-black/85">
          {local || !streamError ? (
            <img
              key={`${source}-${streamKey}`}
              src={imageSrc}
              referrerPolicy="origin"
              alt="Live annotated queue camera stream"
              className="h-full w-full object-contain"
              // If the direct view drops (detector stopped), fall back to the
              // server instead of showing an error.
              onError={local ? () => setSource("server") : onStreamError}
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

      {LOCAL_CAMERA_URL && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
          <span>
            {local
              ? "Direct from the camera on this computer."
              : "Through the server; this can run a second or two behind."}
          </span>
          {local ? (
            <button onClick={switchToServerFeed} className="font-medium text-zinc-700 underline hover:text-zinc-900">
              Use the server feed
            </button>
          ) : (
            <button onClick={switchToDirectFeed} className="font-medium text-emerald-700 underline hover:text-emerald-800">
              Try the direct feed
            </button>
          )}
        </div>
      )}
    </Panel>
  );
}
