import type { ConnectionState } from "./types";

export const GAME_ID = 5;

function getRuntimeOrigin(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return "https://funint.site";
}

const RUNTIME_ORIGIN = getRuntimeOrigin();
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "/api" : `${RUNTIME_ORIGIN}/api`);

export const GAME_API_URL = `${API_BASE_URL.replace(/\/$/, "")}/game/${GAME_ID}`;

export const REVERB_KEY =
  import.meta.env.VITE_REVERB_APP_KEY || "k6dbocgucm0at6gwak3y";
export const REALTIME_HOST =
  import.meta.env.VITE_REVERB_HOST || new URL(RUNTIME_ORIGIN).hostname;
export const REALTIME_CHANNEL =
  import.meta.env.VITE_REVERB_CHANNEL || "game-channel";
export const REALTIME_EVENT = import.meta.env.VITE_REVERB_EVENT || "game.updated";
export const REALTIME_SCHEME =
  import.meta.env.VITE_REVERB_SCHEME || new URL(RUNTIME_ORIGIN).protocol.replace(":", "");
export const USE_TLS = REALTIME_SCHEME === "https";
export const REALTIME_PORT = Number(
  import.meta.env.VITE_REVERB_PORT || (USE_TLS ? 443 : 8080),
);
export const FALLBACK_REFRESH_MS = 5_000;

export const CONNECTION_LABELS: Record<ConnectionState, string> = {
  connecting: "Connecting",
  connected: "Live",
  reconnecting: "Reconnecting",
  disconnected: "Disconnected",
  unavailable: "Unavailable",
  failed: "Failed",
};
