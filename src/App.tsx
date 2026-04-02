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

const GAME_ID = 5;
const API_BASE_URL = import.meta.env.DEV
  ? `/api/game/${GAME_ID}`
  : `https://funint.site/api/game/${GAME_ID}`;

function App() {
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pusherRef = useRef<Pusher | null>(null);

  const fetchGame = async () => {
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
      setGame(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchGame();
  }, []);

  useEffect(() => {
    const pusher = new Pusher("k6dbocgucm0at6gwak3y", {
      wsHost: "funint.site",
      wsPort: 8080,
      wssPort: 443,
      forceTLS: true,
      enabledTransports: ["ws", "wss"],
      disableStats: true,
      cluster: "",
    });

    pusherRef.current = pusher;

    const channel = pusher.subscribe("game-channel");

    channel.bind("game.updated", (payload: { game?: Game }) => {
      if (!payload?.game) {
        return;
      }

      setGame((currentGame) => ({
        ...(currentGame ?? {}),
        ...payload.game,
      }));
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("game-channel");
      pusher.disconnect();
      pusherRef.current = null;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="name-card">
        <div className="game-name">
          {isLoading ? "Loading..." : game?.name || "No name"}
        </div>
      </section>
    </main>
  );
}

export default App;
