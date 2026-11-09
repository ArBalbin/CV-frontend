import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { apiClient } from "../../config/api";
import { WindowOverview } from "../../types/api";
import { getSavedWindow, saveWindow } from "../../utils/staffWindow";

const POLL_MS = 5000;
// The server lets a claim lapse after 120 s without renewal.
const RENEW_MS = 30_000;

function detail(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const d = error.response?.data?.detail;
    if (typeof d === "string") return d;
    if (error.response === undefined) return "Could not reach the server. Check the connection.";
  }
  return fallback;
}

export interface StaffWindow {
  overview: WindowOverview | null;
  myWindow: number | null;
  error: string;
  message: { ok: boolean; text: string } | null;
  calling: boolean;
  choose: (counter: number) => Promise<void>;
  leave: () => Promise<void>;
  callNext: () => Promise<void>;
  switchingMode: boolean;
  setCallMode: (mode: "staff" | "auto") => Promise<void>;
}

// Which window this staff account works, and calling the next number to it.
export function useStaffWindow(onQueueChanged: () => Promise<unknown>): StaffWindow {
  const [overview, setOverview] = useState<WindowOverview | null>(null);
  const [wanted, setWanted] = useState<number | null>(getSavedWindow);
  const [error, setError] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [calling, setCalling] = useState(false);
  const [switchingMode, setSwitchingMode] = useState(false);

  const claim = useCallback(async (counter: number) => {
    try {
      const response = await apiClient.post<WindowOverview>("/api/queue/window/claim", {
        counter_number: counter,
      });
      setOverview(response.data);
      setError("");
    } catch (e) {
      setError(detail(e, `Could not take window ${counter}.`));
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await apiClient.get<WindowOverview>("/api/queue/windows");
      setOverview(response.data);
    } catch {
      // The next poll tries again; the panel keeps the last known state.
    }
  }, []);

  useEffect(() => {
    if (wanted != null) claim(wanted);
    else refresh();
    const poll = window.setInterval(refresh, POLL_MS);
    const renew = window.setInterval(() => {
      if (wanted != null) claim(wanted);
    }, RENEW_MS);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(renew);
    };
  }, [wanted, claim, refresh]);

  const choose = useCallback(
    async (counter: number) => {
      setMessage(null);
      saveWindow(counter);
      setWanted(counter);
      await claim(counter);
    },
    [claim],
  );

  const leave = useCallback(async () => {
    setMessage(null);
    saveWindow(null);
    setWanted(null);
    setError("");
    try {
      const response = await apiClient.post<WindowOverview>("/api/queue/window/release", {});
      setOverview(response.data);
    } catch {
      await refresh();
    }
  }, [refresh]);

  const myWindow = overview?.my_window ?? null;

  const callNext = useCallback(async () => {
    if (myWindow == null) return;
    setCalling(true);
    setMessage(null);
    try {
      const response = await apiClient.post<{ called: unknown; message: string }>(
        "/api/queue/call_next",
        { counter_number: myWindow },
      );
      setMessage({ ok: response.data.called != null, text: response.data.message });
      await onQueueChanged();
    } catch (e) {
      setMessage({ ok: false, text: detail(e, "Could not call the next number. Try again.") });
    } finally {
      setCalling(false);
    }
  }, [myWindow, onQueueChanged]);

  // For every window and every staff member, not just this account.
  const setCallMode = useCallback(
    async (mode: "staff" | "auto") => {
      setSwitchingMode(true);
      setMessage(null);
      try {
        const response = await apiClient.post<WindowOverview>("/api/queue/call_mode", { mode });
        setOverview(response.data);
        setError("");
        await onQueueChanged();
      } catch (e) {
        setError(detail(e, "Could not change how numbers are called."));
      } finally {
        setSwitchingMode(false);
      }
    },
    [onQueueChanged],
  );

  return {
    overview,
    myWindow,
    error,
    message,
    calling,
    choose,
    leave,
    callNext,
    switchingMode,
    setCallMode,
  };
}
