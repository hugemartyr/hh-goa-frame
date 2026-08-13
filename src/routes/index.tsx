import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, Sparkles, UploadCloud } from "lucide-react";
import { FrameStudio } from "@/components/FrameStudio";
import { FramePreview } from "@/components/FramePreview";
import { loadPhoto, loadPhotoFromUrl, type LoadedPhoto } from "@/lib/image";
import type { Format } from "@/lib/render";
import demoBuilder from "@/assets/demo-builder.jpg";
import { toast } from "sonner";

const TITLE = "HH Goa 2026 Frame & Builder ID Generator";
const DESC =
  "Upload any photo and instantly generate a branded Hacker House Goa 2026 PFP frame or Builder ID card. Free, no signup, rendered in your browser.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [step, setStep] = useState<"landing" | "studio">("landing");
  const [format, setFormat] = useState<Format>("card");
  const [demo, setDemo] = useState<LoadedPhoto | null>(null);
  const [landingPhotos, setLandingPhotos] = useState<LoadedPhoto[]>([]);
  const heroInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    void loadPhotoFromUrl(demoBuilder).then((p) => alive && setDemo(p));
    return () => {
      alive = false;
    };
  }, []);

  const handleHeroFiles = useCallback(async (files: FileList | File[], targetFormat?: Format) => {
    const list = Array.from(files).filter(
      (f) => /image|hei[cf]/i.test(f.type) || /\.(heic|heif)$/i.test(f.name),
    );
    if (!list.length) {
      toast.error("Please choose a JPG, PNG or HEIC photo.");
      return;
    }
    try {
      if (targetFormat) setFormat(targetFormat);
      const loaded = await Promise.all(list.map(loadPhoto));
      setLandingPhotos(loaded);
      setStep("studio");
      toast.success("Photo uploaded! Customize your card below 🌴");
    } catch {
      toast.error("Couldn't read that photo. Try another file.");
    }
  }, []);

  const triggerUpload = (f: Format = "card") => {
    setFormat(f);
    heroInputRef.current?.click();
  };

  const handleStartOver = () => {
    setLandingPhotos([]);
    setStep("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <button
          onClick={handleStartOver}
          className="text-display text-lg text-gold transition-opacity hover:opacity-80"
        >
          HH GOA <span className="text-pink">2026</span>
        </button>
        <span className="tracking-wider-caps hidden text-[0.6rem] text-cream/60 sm:block">
          #FrameInGoa
        </span>
      </header>

      {step === "landing" ? (
        /* View 1: Landing Page Hero Only */
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-4 md:grid-cols-2 md:gap-14 md:pt-10">
          <div>
            <p className="tracking-wider-caps mb-5 inline-block rounded-full border border-pink/50 bg-pink/10 px-3 py-1.5 text-[0.6rem] text-pink">
              Hacker House Goa · 2026
            </p>
            <h1 className="text-display text-[3.1rem] leading-[0.9] text-cream sm:text-7xl">
              FRAME
              <br />
              YOURSELF
              <br />
              <span className="text-gold">FOR GOA</span>
            </h1>
            <p className="mt-5 max-w-md text-sm text-muted-foreground sm:text-base">
              Drop a photo. Get a high-res Builder ID or PFP frame in seconds. Everything renders in
              your browser — nothing is uploaded.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Primary Devanagari CTA button */}
              <button
                onClick={() => triggerUpload("card")}
                className="group relative inline-flex flex-col items-center justify-center gap-1 rounded-2xl bg-gold px-8 py-4 text-primary-foreground shadow-lg transition-transform hover:scale-[1.03]"
              >
                <span className="tracking-wider-caps rounded-full bg-primary-foreground/15 px-2.5 py-0.5 text-[0.55rem] font-semibold text-primary-foreground">
                  BUILDER ID · GOA 2026
                </span>
                <div className="inline-flex items-center gap-2">
                  <UploadCloud className="size-6 text-primary-foreground" />
                  <span className="text-2xl font-bold tracking-wide">अपलोड</span>
                </div>
              </button>

              {/* Secondary PFP Frame CTA button */}
              <button
                onClick={() => triggerUpload("pfp")}
                className="tracking-wider-caps inline-flex items-center justify-center gap-2 rounded-2xl border border-gold/50 px-6 py-5 text-xs text-cream transition-colors hover:border-gold hover:text-gold"
              >
                <Sparkles className="size-4" />
                Create a PFP frame
              </button>
            </div>
            <p className="tracking-wider-caps mt-6 flex items-center gap-2 text-[0.6rem] text-cream/45">
              <ArrowDown className="size-3" /> JPG · PNG · HEIC · auto face crop
            </p>
          </div>

          <div className="relative">
            <div className="scallop-band mb-3" />
            {demo ? (
              <FramePreview
                format="card"
                data={{
                  photos: demo ? [demo] : [],
                  name: "Aarav Mehta",
                  stack: "Rust · Solidity · Design",
                  title: "THE TERMINAL WIZARD",
                }}
                className="mx-auto max-w-sm"
              />
            ) : (
              <div className="mx-auto aspect-[4/5] max-w-sm animate-pulse rounded-xl border-2 border-gold/25 bg-jungle/60" />
            )}
          </div>
        </section>
      ) : (
        /* View 2: Studio Editor Only */
        <FrameStudio
          format={format}
          onFormatChange={setFormat}
          externalPhotos={landingPhotos}
          onStartOver={handleStartOver}
        />
      )}

      <input
        ref={heroInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) void handleHeroFiles(e.target.files, format);
          e.target.value = "";
        }}
      />

      <footer className="mx-auto max-w-6xl px-5 pb-12 text-center">
        <div className="scallop-band mb-5 rotate-180" />
        <p className="tracking-wider-caps text-[0.6rem] text-cream/45">
          Hacker House Goa 2026 · Where builders come to ship
        </p>
      </footer>
    </main>
  );
}
