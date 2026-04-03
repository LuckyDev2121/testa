/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_GAME_DETAILS_CHANNEL?: string;
  readonly VITE_GAME_DETAILS_EVENT?: string;
  readonly VITE_PUSHER_APP_KEY?: string;
  readonly VITE_PUSHER_HOST?: string;
  readonly VITE_PUSHER_WS_PORT?: string;
  readonly VITE_PUSHER_WSS_PORT?: string;
  readonly VITE_PUSHER_FORCE_TLS?: string;
  readonly VITE_REVERB_APP_KEY?: string;
  readonly VITE_REVERB_CHANNEL?: string;
  readonly VITE_REVERB_EVENT?: string;
  readonly VITE_REVERB_HOST?: string;
  readonly VITE_REVERB_PORT?: string;
  readonly VITE_REVERB_SCHEME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
