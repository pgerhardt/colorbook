"use client";

import { useSyncExternalStore } from "react";
import { localDateKey, millisecondsToNextDay } from "./calendar";

function subscribe(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout>;
  const refresh = () => {
    clearTimeout(timer);
    onChange();
    // The minute cap also picks up clock/timezone changes in an open tab.
    timer = setTimeout(refresh, Math.min(millisecondsToNextDay(new Date()) + 30, 60_000));
  };
  const onVisibility = () => { if (document.visibilityState === "visible") refresh(); };
  refresh();
  window.addEventListener("focus", refresh);
  window.addEventListener("pageshow", refresh);
  document.addEventListener("visibilitychange", onVisibility);
  return () => {
    clearTimeout(timer);
    window.removeEventListener("focus", refresh);
    window.removeEventListener("pageshow", refresh);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

const getSnapshot = () => localDateKey(new Date());
const getServerSnapshot = () => null;

export function useLocalDate(): string | null {
  // The server and first hydration render both use null. Never present a
  // server-timezone palette as today's palette or suppress a hydration warning.
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
