import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import "./App.css";

type Game = {
  id?: number;
  name?: string;
  [key: string]: unknown;
};

type GameApiResponse = {
  status?: boolean;
  data?: Game;
  message?: string;
};

type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "unavailable"
  | "failed";

type RealtimePayload =
  | { game?: Game; data?: Game }
  | Game
  | string
  | null
  | undefined;

const GAME_ID = 5;
const API_BASE_URL = import.meta.env.DEV
  ? `/api/game/${GAME_ID}`
  : `https://funint.site/api/game/${GAME_ID}`;

const PUSHER_KEY = "k6dbocgucm0at6gwak3y";
const REALTIME_HOST = import.meta.env.VITE_REVERB_HOST || "funint.site";
const REALTIME_CHANNEL = "game-channel";
const REALTIME_EVENT = "game.updated";
const REALTIME_SCHEME = import.meta.env.VITE_REVERB_SCHEME || "https";
const USE_TLS = REALTIME_SCHEME === "https";
const REALTIME_PORT = Number(
  import.meta.env.VITE_REVERB_PORT || (USE_TLS ? 443 : 8080),
);
const FALLBACK_REFRESH_MS = 5000;

function isGameRecord(value: unknown): value is Game {
  return typeof value === "object" && value !== null;
}

function normalizeRealtimePayload(payload: RealtimePayload): Game | null {
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

function App() {
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const pusherRef = useRef<Pusher | null>(null);

  const fetchGame = async ({
    preserveGameOnError = false,
    showLoading = false,
  }: {
    preserveGameOnError?: boolean;
    showLoading?: boolean;
  } = {}) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const response = await fetch(API_BASE_URL, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
      }

      const result = (await response.json()) as GameApiResponse;

      if (!result?.status || !result.data) {
        throw new Error(result?.message || "Game data was not returned.");
      }

      setGame(result.data);
    } catch {
      if (!preserveGameOnError) {
        setGame(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchGame({ showLoading: true });
  }, []);

  useEffect(() => {
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: "",
      wsHost: REALTIME_HOST,
      httpHost: REALTIME_HOST,
      wsPort: REALTIME_PORT,
      httpPort: REALTIME_PORT,
      wssPort: REALTIME_PORT,
      httpsPort: REALTIME_PORT,
      forceTLS: USE_TLS,
      enabledTransports: ["ws", "wss"],
      enableStats: false,
    });

    pusherRef.current = pusher;

    const handleStateChange = (states: {
      current: ConnectionState;
      previous: ConnectionState;
    }) => {
      setConnectionState(states.current);
    };

    const handleConnectionError = () => {
      setConnectionState("failed");
    };

    pusher.connection.bind("state_change", handleStateChange);
    pusher.connection.bind("error", handleConnectionError);

    const channel = pusher.subscribe(REALTIME_CHANNEL);

    channel.bind(REALTIME_EVENT, (payload: RealtimePayload) => {
      const nextGame = normalizeRealtimePayload(payload);

      if (!nextGame) {
        void fetchGame({ preserveGameOnError: true });
        return;
      }

      setGame((currentGame) => ({
        ...(currentGame ?? {}),
        ...nextGame,
      }));

      void fetchGame({ preserveGameOnError: true });
    });

    return () => {
      pusher.connection.unbind("state_change", handleStateChange);
      pusher.connection.unbind("error", handleConnectionError);
      channel.unbind_all();
      pusher.unsubscribe(REALTIME_CHANNEL);
      pusher.disconnect();
      pusherRef.current = null;
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (connectionState !== "connected") {
        void fetchGame({ preserveGameOnError: true });
      }
    }, FALLBACK_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [connectionState]);

  return (
    <main className="app-shell">
      <section className="name-card">
        <div className="game-name">{isLoading ? "Loading..." : game?.name || "No name"}</div>
      </section>
    </main>
  );
}

export default App;
