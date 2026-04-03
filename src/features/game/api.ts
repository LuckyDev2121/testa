import { GAME_API_URL } from "./config";
import type { Game, GameApiResponse } from "./types";

export async function fetchGameById(): Promise<Game> {
  const response = await fetch(GAME_API_URL, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  const result = (await response.json()) as GameApiResponse;

  if (!result.status || !result.data) {
    throw new Error(result.message || "Game data was not returned.");
  }

  return result.data;
}
