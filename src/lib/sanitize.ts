/**
 * Sanitizes a filename to prevent path traversal and remove dangerous characters.
 * Extracts the base name if a path was passed, then cleans invalid characters.
 */
export function sanitizeFilename(name: string): string {
  if (!name) return "unnamed_file";

  // If a path was provided, extract the last segment
  const normalized = name.replace(/\\/g, "/");
  const segments = normalized.split("/").filter(Boolean);
  const base = segments.length > 0 ? segments[segments.length - 1] : "";

  // Remove control characters, invalid chars (: * ? " < > |)
  let clean = base.replace(/[\x00-\x1f\x80-\x9f:*?"<>|]/g, "_").trim();

  // Strip leading and trailing dots and underscores
  clean = clean.replace(/^[\._]+/, "").replace(/[\._]+$/, "");

  return clean || "unnamed_file";
}

/**
 * Validates and sanitizes a folder path.
 */
export function sanitizeFolderPath(path: string): string {
  if (!path) return "Organized";
  // Disallow parent traversal (..)
  let clean = path.replace(/\.\./g, "").replace(/^[\\\/]+/, "").replace(/[\\\/]+$/, "");
  // Replace backslashes with standard forward slashes
  clean = clean.replace(/\\/g, "/");
  // Clean double slashes
  clean = clean.replace(/\/+/g, "/");
  return clean || "Organized";
}

/**
 * Truncates text safely to max length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}
