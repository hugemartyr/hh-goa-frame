import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  IdCard,
  ImagePlus,
  Loader2,
  RefreshCw,
  Shuffle,
  Sparkles,
  Trash2,
  UploadCloud,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { FramePreview } from "@/components/FramePreview";
import { loadPhoto, type LoadedPhoto } from "@/lib/image";
import { pickBuilderTitle } from "@/lib/builder-titles";
import { renderToCanvas, type CardData, type Format } from "@/lib/render";

const SHARE_TEXT =
  "Just framed myself for Hacker House Goa 2026 🌴⚡ See you where builders come to ship. #FrameInGoa";

type Props = {
  format: Format;
  onFormatChange: (f: Format) => void;
};

export function FrameStudio({ format, onFormatChange }: Props) {
  const [photos, setPhotos] = useState<LoadedPhoto[]>([]);
  const [name, setName] = useState("");
  const [stack, setStack] = useState("");
  const [nudge, setNudge] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [exporting, setExporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const title = useMemo(() => pickBuilderTitle(`${name}|${stack}`, nudge), [name, stack, nudge]);
  const data: CardData = useMemo(
    () => ({ photos, name, stack, title }),
    [photos, name, stack, title],
  );

  const activeUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentUrls = new Set(photos.map((p) => p.previewUrl));
    for (const url of activeUrlsRef.current) {
      if (!currentUrls.has(url)) {
        URL.revokeObjectURL(url);
      }
    }
    activeUrlsRef.current = currentUrls;
  }, [photos]);

  useEffect(() => {
    return () => {
      activeUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files).filter(
      (f) => /image|hei[cf]/i.test(f.type) || /\.(heic|heif)$/i.test(f.name),
    );
    if (!list.length) {
      toast.error("Please choose a JPG, PNG or HEIC photo.");
      return;
    }
    setBusy(true);
    try {
      const loaded = await Promise.all(list.map(loadPhoto));
      setPhotos((prev) => [...prev, ...loaded].slice(0, 3));
    } catch {
      toast.error("Couldn't read that photo. Try another file.");
    } finally {
      setBusy(false);
    }
  }, []);

  const download = async () => {
    setExporting(true);
    try {
      const canvas = document.createElement("canvas");
      await renderToCanvas(canvas, format, data, 1.5);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
      if (!blob) throw new Error("render failed");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hh-goa-2026-${format === "pfp" ? "pfp-frame" : "builder-id"}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("High-res PNG downloaded 🌴");
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const shareToX = async () => {
    setExporting(true);
    try {
      const canvas = document.createElement("canvas");
      await renderToCanvas(canvas, format, data, 1.5);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
      if (!blob) throw new Error("render failed");

      const filename = `hh-goa-2026-${format === "pfp" ? "pfp-frame" : "builder-id"}.png`;
      const file = new File([blob], filename, { type: "image/png" });

      // 1. Try Native Web Share API first (Mobile OS / supported desktop browsers)
      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            title: "Hacker House Goa 2026",
            text: SHARE_TEXT,
            files: [file],
          });
          toast.success("Shared successfully! 🌴");
          return;
        } catch (err) {
          if ((err as Error)?.name === "AbortError") return;
        }
      }

      // 2. Desktop Fallback: Copy image to clipboard + download file + open X post intent
      let copiedToClipboard = false;
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof ClipboardItem !== "undefined"
      ) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          copiedToClipboard = true;
        } catch {
          /* clipboard access error fallback */
        }
      }

      // Trigger automatic image download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      // Open X post intent window
      const tweetUrl = `https://x.com/intent/post?text=${encodeURIComponent(SHARE_TEXT)}`;
      window.open(tweetUrl, "_blank", "noopener,noreferrer");

      if (copiedToClipboard) {
        toast.success(
          "Image copied to clipboard & downloaded! Paste (Cmd+V / Ctrl+V) into your post 🌴",
        );
      } else {
        toast.success("Image downloaded! Attach it to your X post 🌴");
      }
    } catch {
      toast.error("Sharing failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const hasPhoto = photos.length > 0;

  return (
    <section id="studio" className="mx-auto w-full max-w-6xl px-5 py-14 sm:py-20">
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="inline-flex rounded-full border border-gold/40 bg-jungle/70 p-1">
          {[
            { id: "pfp" as const, label: "PFP FRAME", icon: Sparkles },
            { id: "card" as const, label: "BUILDER ID", icon: IdCard },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onFormatChange(id)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs tracking-wider-caps transition-all duration-200 ${
                format === id ? "bg-gold text-primary-foreground" : "text-cream/70 hover:text-gold"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {format === "pfp"
            ? "Square 1:1 frame, tuned for X profile pictures."
            : "Event-style ID card with your name, stack and builder title."}
        </p>
      </div>

      {!hasPhoto ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            void addFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`grain-panel mx-auto flex min-h-[320px] max-w-2xl cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
            dragging ? "border-pink bg-pink/10 scale-[1.01]" : "border-gold/45 hover:border-gold"
          }`}
        >
          {busy ? (
            <>
              <Loader2 className="size-9 animate-spin text-gold" />
              <p className="tracking-wider-caps text-xs text-gold">Reading your photo...</p>
            </>
          ) : (
            <>
              <UploadCloud className="size-11 text-gold" />
              <h3 className="text-display text-2xl text-cream">DROP YOUR PHOTO</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                JPG, PNG or iPhone HEIC. We auto-crop around your face — no manual cropping, no
                uploads to any server.
              </p>
              <span className="tracking-wider-caps mt-1 rounded-full bg-gold px-5 py-2.5 text-xs text-primary-foreground">
                Tap to upload
              </span>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <FramePreview format={format} data={data} />

          <div className="flex flex-col gap-5">
            {format === "card" && (
              <div className="flex flex-col gap-4 rounded-xl border border-gold/25 bg-jungle/60 p-5">
                <label className="flex flex-col gap-2">
                  <span className="tracking-wider-caps text-[0.65rem] text-gold">Name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aarav Mehta"
                    maxLength={26}
                    className="rounded-md border border-border bg-input px-3 py-2.5 text-sm text-cream outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="tracking-wider-caps text-[0.65rem] text-gold">Stack / Role</span>
                  <input
                    value={stack}
                    onChange={(e) => setStack(e.target.value)}
                    placeholder="Rust · Solidity · Design"
                    maxLength={34}
                    className="rounded-md border border-border bg-input px-3 py-2.5 text-sm text-cream outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-gold"
                  />
                </label>
                <div className="flex items-center justify-between gap-3 rounded-md border border-pink/40 bg-pink/10 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="tracking-wider-caps text-[0.6rem] text-pink">Builder title</p>
                    <p className="text-display truncate text-base text-cream">{title}</p>
                  </div>
                  <button
                    onClick={() => setNudge((n) => n + 1)}
                    aria-label="Shuffle builder title"
                    className="shrink-0 rounded-full bg-pink p-2 text-secondary-foreground transition-transform hover:rotate-180 duration-300"
                  >
                    <Shuffle className="size-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-gold/25 bg-jungle/60 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="tracking-wider-caps text-[0.65rem] text-gold">
                  Photos ({photos.length}/3)
                </span>
                {photos.length < 3 && (
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-xs text-pink hover:text-gold"
                  >
                    <UserPlus className="size-3.5" /> Add teammate
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {photos.map((p, i) => (
                  <div key={p.previewUrl} className="group relative">
                    <img
                      src={p.previewUrl}
                      alt={`Selected photo ${i + 1}`}
                      className="size-16 rounded-md border border-gold/40 object-cover"
                    />
                    <button
                      onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                      aria-label="Remove photo"
                      className="absolute -right-1.5 -top-1.5 rounded-full bg-pink p-1 text-secondary-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 3 && (
                  <button
                    onClick={() => inputRef.current?.click()}
                    aria-label="Add another photo"
                    className="grid size-16 place-items-center rounded-md border border-dashed border-gold/40 text-gold hover:border-gold"
                  >
                    {busy ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <ImagePlus className="size-5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={download}
                disabled={exporting}
                className="tracking-wider-caps inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-xs text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-70"
              >
                {exporting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Download image
              </button>
              <button
                onClick={shareToX}
                disabled={exporting}
                className="tracking-wider-caps inline-flex items-center justify-center gap-2 rounded-full bg-pink px-6 py-3.5 text-xs text-secondary-foreground transition-transform hover:scale-[1.02] disabled:opacity-70"
              >
                {exporting ? <Loader2 className="size-4 animate-spin" /> : null}
                Share to X
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => onFormatChange(format === "pfp" ? "card" : "pfp")}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gold/40 px-4 py-2.5 text-xs text-cream/80 hover:text-gold"
                >
                  <RefreshCw className="size-3.5" />
                  Switch format
                </button>
                <button
                  onClick={() => setPhotos([])}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs text-muted-foreground hover:text-pink"
                >
                  <Trash2 className="size-3.5" />
                  Start over
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) void addFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </section>
  );
}
