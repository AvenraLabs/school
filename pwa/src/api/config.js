const rawBase = (import.meta.env.VITE_API_BASE_URL || "https://app.avenra.org/api").replace(/\/$/, "");

// If the base ends with /api, strip it for sockets (which mount at root).
const derivedSocket =
  rawBase?.replace(/\/api$/, "") || rawBase || undefined;

export const API_BASE_URL = rawBase || "/api";
export const SOCKET_BASE_URL =
  (import.meta.env.VITE_SOCKET_URL || "").replace(/\/$/, "") ||
  derivedSocket ||
  API_BASE_URL;

export const DEFAULT_PAGE_SIZE = 20;
