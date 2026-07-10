import { API_BASE_URL } from "../api/config";

/**
 * Resolves a local/relative asset path to the backend server's host URL.
 * Pass-through for base64 strings and absolute HTTP/HTTPS urls.
 * @param {string} path - The relative or absolute path of the asset
 * @returns {string} - The fully resolved URL
 */
export function getAssetUrl(path) {
  if (!path) return "";
  if (path.startsWith("data:") || path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  let cleanPath = path;
  if (path.startsWith("/uploads")) {
    cleanPath = `/api${path}`;
  }
  const host = API_BASE_URL.replace(/\/api$/, "");
  return `${host}${cleanPath}`;
}
