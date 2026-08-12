import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, IdCard, Sparkles } from "lucide-react";
import { FrameStudio } from "@/components/FrameStudio";
import { FramePreview } from "@/components/FramePreview";
import { loadPhotoFromUrl, type LoadedPhoto } from "@/lib/image";
import type { Format } from "@/lib/render";
import demoBuilder from "@/assets/demo-builder.jpg";

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
  const [format, setFormat] = useState<Format>("card");
  const [demo, setDemo] = useState<LoadedPhoto | null>(null);

  useEffect(() => {
    let alive = true;
    void loadPhotoFromUrl(demoBuilder).then((p) => alive && setDemo(p));
    return () => {
      alive = false;
    };
  }, []);

  const jump = (f: Format) => {
    setFormat(f);
    document.getElementById("studio")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <span className="text-display text-lg text-gold">
          HH GOA <span className="text-pink">2026</span>
        </span>
        <span className="tracking-wider-caps hidden text-[0.6rem] text-cream/60 sm:block">
          #FrameInGoa
        </span>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-6 pt-4 md:grid-cols-2 md:gap-14 md:pt-10">
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
            Drop a photo. Get a high-res Builder ID or PFP frame in seconds. Everything renders
            in your browser — nothing is uploaded.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => jump("card")}
              className="tracking-wider-caps inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-4 text-xs text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              <IdCard className="size-4" />
              Make my card
            </button>
            <button
              onClick={() => jump("pfp")}
              className="tracking-wider-caps inline-flex items-center justify-center gap-2 rounded-full border border-gold/50 px-7 py-4 text-xs text-cream transition-colors hover:border-gold hover:text-gold"
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
                photos: [demo],
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

      <FrameStudio format={format} onFormatChange={setFormat} />

      <footer className="mx-auto max-w-6xl px-5 pb-12 text-center">
        <div className="scallop-band mb-5 rotate-180" />
        <p className="tracking-wider-caps text-[0.6rem] text-cream/45">
          Hacker House Goa 2026 · Where builders come to ship
        </p>
      </footer>
    </main>
  );
}
