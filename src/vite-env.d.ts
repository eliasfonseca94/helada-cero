/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base de la API del backend (Spring Boot). Ver .env.example. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
