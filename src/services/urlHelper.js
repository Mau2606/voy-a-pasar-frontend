/**
 * Resolves a backend file path (e.g. /uploads/manuals/file.pdf)
 * to a full URL using the configured API backend URL.
 * 
 * In development (VITE_API_URL is empty), returns the path as-is
 * because Vite's proxy handles it.
 * 
 * In production, prepends the backend URL so the browser
 * fetches the file from the correct server.
 */
export function resolveBackendUrl(path) {
  if (!path) return path;
  // If it's already a full URL, return as-is
  if (path.startsWith('http')) return path;
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return `${apiUrl}${path}`;
}
