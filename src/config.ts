declare global {
  interface Window {
    __APP_CONFIG__?: { apiBaseUrl?: string; apiKey?: string };
  }
}

const runtime = typeof window !== "undefined" ? window.__APP_CONFIG__ ?? {} : {};

export const config = {
  apiBaseUrl:
    runtime.apiBaseUrl ?? import.meta.env.VITE_API_BASE_URL ?? "/api",
  apiKey: runtime.apiKey ?? import.meta.env.VITE_API_KEY ?? "",
};
