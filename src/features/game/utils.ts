import type { Game, RealtimePayload } from "./types";

function isGameRecord(value: unknown): value is Game {
  return typeof value === "object" && value !== null;
}

export function normalizeRealtimePayload(payload: RealtimePayload): Game | null {
  if (!payload) {
    return null;
  }

  if (typeof payload === "string") {
    try {
      return normalizeRealtimePayload(JSON.parse(payload) as RealtimePayload);
    } catch {
      return null;
    }
  }

  if ("game" in payload && isGameRecord(payload.game)) {
    return payload.game;
  }

  if ("data" in payload && isGameRecord(payload.data)) {
    return payload.data;
  }

  return isGameRecord(payload) ? payload : null;
}

export function mergeGame(currentGame: Game | null, nextGame: Game): Game {
  return {
    ...(currentGame ?? {}),
    ...nextGame,
  };
}
