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

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas || !data.photos.length) return;
    setReady(false);
    void renderToCanvas(canvas, format, data, 0.6).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [format, data]);

  return (
    <div className={className}>
      <div
        className="relative overflow-hidden rounded-xl border-2 border-gold/40"
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
