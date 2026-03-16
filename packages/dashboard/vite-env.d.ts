/// <reference types="vite/client" />

// Fallback: augment ImportMeta.env for builds where vite/client.d.ts is absent
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  [key: string]: unknown;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
