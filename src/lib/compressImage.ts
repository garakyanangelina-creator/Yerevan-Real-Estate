/**
 * Client-side image compression using Canvas API.
 * - Fixes EXIF orientation (portrait phone photos appear correctly)
 * - Resizes to a max dimension (default 1920px)
 * - Exports as JPEG at configurable quality
 * - Safe fallback: returns original if canvas fails
 */

const MAX_DIMENSION = 1920;
const QUALITY = 0.85;

/** Read EXIF orientation tag from a JPEG file (returns 1–8, default 1). */
async function getOrientation(file: File): Promise<number> {
  try {
    const buf = await file.slice(0, 65536).arrayBuffer();
    const view = new DataView(buf);
    if (view.getUint16(0) !== 0xffd8) return 1; // not JPEG
    let offset = 2;
    while (offset < view.byteLength - 4) {
      const marker = view.getUint16(offset);
      const size = view.getUint16(offset + 2);
      if (marker === 0xffe1) {
        // APP1 — may contain EXIF
        if (view.getUint32(offset + 4) === 0x45786966) {
          const little = view.getUint16(offset + 10) === 0x4949;
          const ifdOffset = view.getUint32(offset + 14, little) + offset + 10;
          const entries = view.getUint16(ifdOffset, little);
          for (let i = 0; i < entries; i++) {
            const tag = view.getUint16(ifdOffset + 2 + i * 12, little);
            if (tag === 0x0112) {
              return view.getUint16(ifdOffset + 2 + i * 12 + 8, little);
            }
          }
        }
      }
      offset += 2 + size;
    }
  } catch {}
  return 1;
}

function orientCanvas(
  ctx: CanvasRenderingContext2D,
  orientation: number,
  width: number,
  height: number
) {
  switch (orientation) {
    case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
    case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
    case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
    case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
    case 7: ctx.transform(0, -1, -1, 0, height, width); break;
    case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
  }
}

export async function compressImage(
  file: File,
  maxDim = MAX_DIMENSION,
  quality = QUALITY
): Promise<File> {
  // Only process images
  if (!file.type.startsWith("image/")) return file;

  try {
    const orientation = await getOrientation(file);
    const swapped = orientation >= 5 && orientation <= 8;

    const bitmap = await createImageBitmap(file);
    const srcW = bitmap.width;
    const srcH = bitmap.height;

    // Dimensions after applying orientation
    const logicalW = swapped ? srcH : srcW;
    const logicalH = swapped ? srcW : srcH;

    // Scale down if needed
    const scale = Math.min(1, maxDim / Math.max(logicalW, logicalH));
    const outW = Math.round(logicalW * scale);
    const outH = Math.round(logicalH * scale);

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // Apply orientation transform then draw scaled image
    ctx.save();
    orientCanvas(ctx, orientation, outW, outH);
    const drawW = swapped ? outH * scale : outW;
    const drawH = swapped ? outW * scale : outH;
    ctx.drawImage(bitmap, 0, 0, drawW, drawH);
    ctx.restore();

    bitmap.close();

    // Prefer WebP if supported, fall back to JPEG
    const mimeType = canvas.toDataURL("image/webp").startsWith("data:image/webp")
      ? "image/webp"
      : "image/jpeg";

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
        mimeType,
        quality
      );
    });

    const ext = mimeType === "image/webp" ? "webp" : "jpg";
    const name = file.name.replace(/\.[^.]+$/, `.${ext}`);
    return new File([blob], name, { type: mimeType });
  } catch {
    // Canvas failed — return original
    return file;
  }
}
