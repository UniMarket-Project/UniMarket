/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_API_PROXY_TARGET?: string;
  readonly VITE_FRONTEND_URL?: string;
  readonly VITE_PORT?: string;
  readonly VITE_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
