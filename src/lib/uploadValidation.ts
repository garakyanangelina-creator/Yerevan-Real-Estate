/**
 * Shared upload validation — used by both employee and public submit upload routes.
 */

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"]);
const ALLOWED_MIME_PREFIXES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export interface UploadValidationError {
  error: string;
  status: number;
}

export function validateUploadFile(file: File): UploadValidationError | null {
  // Size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: "File too large. Maximum size is 20 MB.", status: 413 };
  }

  // Extension check (derive from name, ignore path traversal)
  const namePart = file.name.split("/").pop()?.split("\\").pop() ?? "";
  const ext = namePart.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { error: "Invalid file type. Only image files are allowed.", status: 415 };
  }

  // MIME type check (belt-and-suspenders — browser can lie, but filter obvious non-images)
  const mime = (file.type || "").toLowerCase();
  if (mime && !ALLOWED_MIME_PREFIXES.some((p) => mime.startsWith(p))) {
    return { error: "Invalid file type. Only image files are allowed.", status: 415 };
  }

  return null;
}

/** Returns a safe filename: timestamp + random + whitelisted extension. Strips original name. */
export function safeFilename(prefix: string, originalName: string): string {
  const namePart = originalName.split("/").pop()?.split("\\").pop() ?? "file";
  const rawExt = namePart.split(".").pop()?.toLowerCase() ?? "jpg";
  const ext = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : "jpg";
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
}
