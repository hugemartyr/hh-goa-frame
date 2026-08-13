import { useEffect, useRef, useState } from "react";
import { renderToCanvas, type CardData, type Format } from "@/lib/render";

type Props = {
  format: Format;
  data: CardData;
  className?: string;
};

/** Live canvas preview, re-rendered on every data change. */
export function FramePreview({ format, data, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const renderSeq = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    const validPhotos = (data?.photos || []).filter(Boolean);
    if (!canvas || !validPhotos.length) {
      setReady(false);
      return;
    }

    const currentSeq = ++renderSeq.current;
    setReady(false);

    const dpr =
      typeof window !== "undefined" ? Math.max(1, Math.min(3, window.devicePixelRatio || 1)) : 1;
    const scale = 0.6 * dpr;

    void renderToCanvas(canvas, format, data, scale).then(() => {
      if (!cancelled && currentSeq === renderSeq.current) {
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [format, data]);

  const aspectClass = format === "pfp" ? "aspect-square" : "aspect-[4/5]";

  return (
    <div className={className}>
      <div
        className={`relative overflow-hidden rounded-xl border-2 border-gold/40 ${aspectClass}`}
        style={{ boxShadow: "var(--shadow-frame)" }}
      >
        <canvas ref={canvasRef} className="block h-auto w-full" />
        {!ready && (
          <div className="absolute inset-0 grid place-items-center bg-background/80 backdrop-blur-sm">
            <p className="tracking-wider-caps animate-pulse text-xs text-gold">
              Building your card...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
