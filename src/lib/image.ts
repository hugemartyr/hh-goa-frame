export type LoadedPhoto = {
  bitmap: ImageBitmap | HTMLImageElement;
  width: number;
  height: number;
  /** Normalized focal point (0-1) used for smart cropping. */
  focus: { x: number; y: number };
  previewUrl: string;
};

const HEIC_RE = /\.(heic|heif)$/i;

async function toDecodableBlob(file: File): Promise<Blob> {
  const isHeic = HEIC_RE.test(file.name) || /hei[cf]/i.test(file.type);
  if (!isHeic) return file;
  const { heicTo } = await import("heic-to");
  return (await heicTo({ blob: file, type: "image/jpeg", quality: 0.94 })) as Blob;
}

/** createImageBitmap handles EXIF orientation natively with imageOrientation: "from-image". */
async function decode(blob: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(blob, { imageOrientation: "from-image" });
    } catch {
      /* fall through */
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}

/** Uses the native FaceDetector when present, otherwise a portrait-biased center point. */
async function detectFocus(
  source: ImageBitmap | HTMLImageElement,
  width: number,
  height: number,
): Promise<{ x: number; y: number }> {
  const fallback = { x: 0.5, y: height > width ? 0.38 : 0.44 };
  const FD = (globalThis as unknown as { FaceDetector?: new (o?: unknown) => unknown })
    .FaceDetector;
  if (!FD) return fallback;
  try {
    const detector = new FD({ fastMode: true, maxDetectedFaces: 5 }) as {
      detect: (s: unknown) => Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
    };
    const faces = await detector.detect(source);
    if (!faces?.length) return fallback;
    let cx = 0;
    let cy = 0;
    for (const f of faces) {
      cx += f.boundingBox.x + f.boundingBox.width / 2;
      cy += f.boundingBox.y + f.boundingBox.height / 2;
    }
    return {
      x: Math.min(0.85, Math.max(0.15, cx / faces.length / width)),
      y: Math.min(0.85, Math.max(0.12, cy / faces.length / height)),
    };
  } catch {
    return fallback;
  }
}

export async function loadPhoto(file: File): Promise<LoadedPhoto> {
  const blob = await toDecodableBlob(file);
  const bitmap = await decode(blob);
  const width = "width" in bitmap ? bitmap.width : 0;
  const height = "height" in bitmap ? bitmap.height : 0;
  const focus = await detectFocus(bitmap, width, height);
  return { bitmap, width, height, focus, previewUrl: URL.createObjectURL(blob) };
}

/**
 * Draws the photo to fill the target rect, scaling up/down as needed and
 * anchoring the crop around the detected focal point. Works for portrait,
 * landscape, square and panoramic sources.
 */
export function drawPhotoCover(
  ctx: CanvasRenderingContext2D,
  photo: LoadedPhoto,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / photo.width, h / photo.height);
  const dw = photo.width * scale;
  const dh = photo.height * scale;
  const dx = x + w / 2 - dw * photo.focus.x;
  const dy = y + h / 2 - dh * photo.focus.y;
  const clampedX = Math.min(x, Math.max(x + w - dw, dx));
  const clampedY = Math.min(y, Math.max(y + h - dh, dy));
  ctx.drawImage(photo.bitmap as CanvasImageSource, clampedX, clampedY, dw, dh);
}
