export type Game = {
  id?: number;
  name?: string;
  [key: string]: unknown;
};

export type GameApiResponse = {
  status?: boolean;
  data?: Game;
  message?: string;
};

export type ConnectionState =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "unavailable"
  | "failed";

export type FetchGameOptions = {
  preserveGameOnError?: boolean;
  showLoading?: boolean;
};

export type RealtimePayload =
  | { game?: Game; data?: Game }
  | Game
  | string
  | null
  | undefined;
