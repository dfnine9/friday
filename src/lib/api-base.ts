/**
 * API base URL — routes to sidecar when running in Tauri, stays relative on Vercel.
 * The sidecar runs on port 3141 alongside the Tauri desktop app.
 */
export const API_BASE = typeof window !== "undefined" && (window as any).__TAURI__
  ? "http://localhost:3141"
  : "";
