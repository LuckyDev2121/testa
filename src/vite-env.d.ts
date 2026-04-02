/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAME_DETAILS_CHANNEL?: string;
  readonly VITE_GAME_DETAILS_EVENT?: string;
  readonly VITE_PUSHER_APP_KEY?: string;
  readonly VITE_PUSHER_HOST?: string;
  readonly VITE_PUSHER_WS_PORT?: string;
  readonly VITE_PUSHER_WSS_PORT?: string;
  readonly VITE_PUSHER_FORCE_TLS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
