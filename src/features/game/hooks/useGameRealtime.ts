import { useEffect, useEffectEvent, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import {
  CONNECTION_LABELS,
  FALLBACK_REFRESH_MS,
  REALTIME_CHANNEL,
  REALTIME_EVENT,
  REALTIME_HOST,
  REALTIME_PORT,
  REVERB_KEY,
  USE_TLS,
} from "../config";
import { fetchGameById } from "../api";
import { mergeGame, normalizeRealtimePayload } from "../utils";
import type { ConnectionState, FetchGameOptions, Game, RealtimePayload } from "../types";

const windowWithPusher = window as Window & {
  Pusher?: typeof Pusher;
};

export function useGameRealtime() {
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");

  const fetchGame = useEffectEvent(
    async ({
      preserveGameOnError = false,
      showLoading = false,
    }: FetchGameOptions = {}) => {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const nextGame = await fetchGameById();
        setGame(nextGame);
      } catch {
        if (!preserveGameOnError) {
          setGame(null);
        }
      } finally {
        setIsLoading(false);
      }
    },
  );

  const handleRealtimeUpdate = useEffectEvent((payload: RealtimePayload) => {
    const nextGame = normalizeRealtimePayload(payload);

    if (!nextGame) {
      void fetchGame({ preserveGameOnError: true });
      return;
    }

    setGame((currentGame) => mergeGame(currentGame, nextGame));
    void fetchGame({ preserveGameOnError: true });
  });

  useEffect(() => {
    void fetchGame({ showLoading: true });
  }, []);

  useEffect(() => {
    windowWithPusher.Pusher = Pusher;

    const echo = new Echo({
      broadcaster: "reverb",
      key: REVERB_KEY,
      wsHost: REALTIME_HOST,
      httpHost: REALTIME_HOST,
      wsPort: REALTIME_PORT,
      httpPort: REALTIME_PORT,
      wssPort: REALTIME_PORT,
      httpsPort: REALTIME_PORT,
      forceTLS: USE_TLS,
      enabledTransports: USE_TLS ? ["wss"] : ["ws"],
      disableStats: true,
      cluster: "",
      namespace: false,
    });

    const stopListeningToConnection = echo.connector.onConnectionChange(
      (status) => {
        setConnectionState(status);
      },
    );

    const channel = echo.channel(REALTIME_CHANNEL);
    const eventName = `.${REALTIME_EVENT}`;

    channel.listen(eventName, handleRealtimeUpdate);
    channel.error(() => {
      setConnectionState("failed");
    });

    return () => {
      channel.stopListening(eventName, handleRealtimeUpdate);
      stopListeningToConnection();
      echo.leaveChannel(REALTIME_CHANNEL);
      echo.disconnect();
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

  return {
    connectionLabel: CONNECTION_LABELS[connectionState],
    connectionState,
    game,
    gameName: isLoading ? "Loading..." : game?.name || "No name",
    isLoading,
  };
}
