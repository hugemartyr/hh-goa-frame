import { drawPhotoCover, type LoadedPhoto } from "./image";
import {
  INK,
  archPath,
  barcode,
  bunting,
  hibiscus,
  palmTree,
  qrBlock,
  scooter,
  seaBand,
  seedFrom,
  sunburst,
} from "./goa-art";

export const PALETTE = {
  deep: "#04231A",
  green: "#083A2A",
  greenLight: "#0C5C41",
  gold: "#FFC93C",
  goldSoft: "#FFE08A",
  pink: "#FF3D8B",
  cream: "#FFF6E6",
};

const DISPLAY = '"Anton", "Arial Black", sans-serif';
const BODY = '"Space Grotesk", "Helvetica Neue", sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const DEVA = '"Baloo 2", "Noto Sans Devanagari", sans-serif';

export type CardData = {
  photos: LoadedPhoto[];
  name: string;
  stack: string;
  title: string;
};

/* ---------- primitives ---------- */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  font: string,
  minSize = 14,
) {
  let size = startSize;
  do {
    ctx.font = `${size}px ${font}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  } while (size > minSize);
  return size;
}

function backdrop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, PALETTE.green);
  g.addColorStop(0.55, PALETTE.deep);
  g.addColorStop(1, "#062C20");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // radial glow
  const rg = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.75);
  rg.addColorStop(0, "rgba(12,92,65,0.55)");
  rg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, w, h);

  // fine grid texture
  ctx.save();
  ctx.strokeStyle = "rgba(255,201,60,0.05)";
  ctx.lineWidth = Math.max(1, w / 900);
  const step = w / 22;
  for (let x = step; x < w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = step; y < h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

/** Goan/Indian-inspired scalloped arch chain along a horizontal line. */
function scallopRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  r: number,
  color: string,
  down = false,
) {
  ctx.save();
  ctx.fillStyle = color;
  const count = Math.max(3, Math.round(w / (r * 2)));
  const step = w / count;
  for (let i = 0; i < count; i++) {
    const cx = x + step * (i + 0.5);
    ctx.beginPath();
    ctx.arc(cx, y, step / 2, down ? 0 : Math.PI, down ? Math.PI : 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function diamondRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.fillStyle = color;
  const step = size * 2.6;
  for (let cx = x + step / 2; cx < x + w; cx += step) {
    ctx.beginPath();
    ctx.moveTo(cx, y - size);
    ctx.lineTo(cx + size, y);
    ctx.lineTo(cx, y + size);
    ctx.lineTo(cx - size, y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** Ornamental corner motif: nested arcs + rays, rotated into each corner. */
function cornerMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotation: number,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.lineCap = "round";

  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = size * 0.09;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI / 2);
  ctx.stroke();

  ctx.strokeStyle = PALETTE.pink;
  ctx.lineWidth = size * 0.055;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.72, 0, Math.PI / 2);
  ctx.stroke();

  ctx.strokeStyle = PALETTE.goldSoft;
  ctx.lineWidth = size * 0.035;
  for (let i = 0; i <= 4; i++) {
    const a = (Math.PI / 2) * (i / 4);
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * size * 0.28, Math.sin(a) * size * 0.28);
    ctx.lineTo(Math.cos(a) * size * 0.52, Math.sin(a) * size * 0.52);
    ctx.stroke();
  }

  ctx.fillStyle = PALETTE.gold;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, val: string) {
  if ("letterSpacing" in ctx) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = val;
  }
}

function photoBlock(
  ctx: CanvasRenderingContext2D,
  photos: LoadedPhoto[],
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  const list = (photos || []).filter((p) => Boolean(p && p.bitmap)).slice(0, 3);
  const gap = list.length > 1 ? w * 0.018 : 0;
  const cellW = list.length > 0 ? (w - gap * (list.length - 1)) / list.length : w;
  ctx.save();
  roundRect(ctx, x, y, w, h, radius);
  ctx.clip();
  ctx.fillStyle = PALETTE.deep;
  ctx.fillRect(x, y, w, h);
  list.forEach((p, i) => {
    const cx = x + i * (cellW + gap);
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx, y, cellW, h);
    ctx.clip();
    drawPhotoCover(ctx, p, cx, y, cellW, h);
    ctx.restore();
  });
  // warm bottom vignette so text always reads
  const vg = ctx.createLinearGradient(0, y + h * 0.55, 0, y + h);
  vg.addColorStop(0, "rgba(4,35,26,0)");
  vg.addColorStop(1, "rgba(4,35,26,0.75)");
  ctx.fillStyle = vg;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function tag(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  bg: string,
  fg: string,
) {
  ctx.font = `${size}px ${BODY}`;
  ctx.textBaseline = "middle";
  setLetterSpacing(ctx, `${size * 0.12}px`);
  const padX = size * 0.9;
  const w = ctx.measureText(text).width + padX * 2;
  const h = size * 2.1;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = "left";
  ctx.fillText(text, x + padX, y + h / 2 + size * 0.05);
  setLetterSpacing(ctx, "0px");
  return w;
}

/* ---------- format A: PFP frame ---------- */

export function renderPfp(ctx: CanvasRenderingContext2D, data: CardData, S: number) {
  const u = S / 1600;
  backdrop(ctx, S, S);

  // outer keylines
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 14 * u;
  ctx.strokeRect(28 * u, 28 * u, S - 56 * u, S - 56 * u);
  ctx.strokeStyle = PALETTE.pink;
  ctx.lineWidth = 5 * u;
  ctx.strokeRect(56 * u, 56 * u, S - 112 * u, S - 112 * u);

  // scallop bands
  scallopRow(ctx, 70 * u, 92 * u, S - 140 * u, 22 * u, "rgba(255,201,60,0.35)", true);
  scallopRow(ctx, 70 * u, S - 92 * u, S - 140 * u, 22 * u, "rgba(255,61,139,0.35)");

  const inset = 150 * u;
  const size = S - inset * 2;
  const photoY = inset - 18 * u;
  const photoH = size - 118 * u;

  // photo plate
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 50 * u;
  ctx.shadowOffsetY = 18 * u;
  roundRect(ctx, inset, photoY, size, photoH, 46 * u);
  ctx.fillStyle = PALETTE.deep;
  ctx.fill();
  ctx.restore();

  photoBlock(ctx, data.photos, inset, photoY, size, photoH, 46 * u);

  roundRect(ctx, inset, photoY, size, photoH, 46 * u);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 10 * u;
  ctx.stroke();

  // corner motifs
  const m = 92 * u;
  const c = 122 * u;
  cornerMotif(ctx, c, c, m, Math.PI);
  cornerMotif(ctx, S - c, c, m, -Math.PI / 2);
  cornerMotif(ctx, S - c, S - c, m, 0);
  cornerMotif(ctx, c, S - c, m, Math.PI / 2);

  // top eyebrow
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  setLetterSpacing(ctx, `${9 * u}px`);
  ctx.font = `${26 * u}px ${BODY}`;
  ctx.fillStyle = PALETTE.goldSoft;
  ctx.fillText("BUILDERS COME TO SHIP · GOA", S / 2, 118 * u);
  setLetterSpacing(ctx, "0px");

  // wordmark block
  const baseY = photoY + photoH + 66 * u;
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.cream;
  const wmSize = fitText(ctx, "HACKER HOUSE GOA", size - 40 * u, 92 * u, DISPLAY, 40);
  ctx.font = `${wmSize}px ${DISPLAY}`;
  ctx.fillText("HACKER HOUSE GOA", S / 2, baseY);

  // 2026 chip + pink rules
  const chipY = baseY + 74 * u;
  ctx.font = `${44 * u}px ${DISPLAY}`;
  setLetterSpacing(ctx, `${6 * u}px`);
  const chipW = ctx.measureText("2026").width + 56 * u;
  const chipH = 66 * u;
  roundRect(ctx, S / 2 - chipW / 2, chipY - chipH / 2, chipW, chipH, chipH / 2);
  ctx.fillStyle = PALETTE.pink;
  ctx.fill();
  ctx.fillStyle = PALETTE.cream;
  ctx.textBaseline = "middle";
  ctx.fillText("2026", S / 2, chipY + 3 * u);
  setLetterSpacing(ctx, "0px");

  const ruleW = (size - chipW) / 2 - 34 * u;
  diamondRow(ctx, inset, chipY, ruleW, 9 * u, PALETTE.gold);
  diamondRow(ctx, S - inset - ruleW, chipY, ruleW, 9 * u, PALETTE.gold);
}

/* ---------- format B: builder ID card (quirky Goa pass) ---------- */

export function renderCard(ctx: CanvasRenderingContext2D, data: CardData, W: number, H: number) {
  const u = W / 1200;
  const seed = seedFrom((data.name || "builder") + (data.stack || ""));

  // base
  ctx.fillStyle = PALETTE.green;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(255,201,60,0.05)";
  for (let i = 0; i < 260; i++) {
    const px = ((i * 173.7) % W) + ((i * 37) % 9);
    const py = ((i * 397.3) % H) + ((i * 11) % 7);
    ctx.fillRect(px, py, 3 * u, 3 * u);
  }

  // gold badge outline + lanyard slot
  ctx.save();
  roundRect(ctx, 22 * u, 22 * u, W - 44 * u, H - 44 * u, 54 * u);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 12 * u;
  ctx.stroke();
  roundRect(ctx, 44 * u, 44 * u, W - 88 * u, H - 88 * u, 40 * u);
  ctx.strokeStyle = "rgba(255,246,230,0.35)";
  ctx.lineWidth = 3 * u;
  ctx.stroke();
  ctx.restore();

  roundRect(ctx, W / 2 - 90 * u, 62 * u, 180 * u, 34 * u, 17 * u);
  ctx.fillStyle = PALETTE.cream;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4 * u;
  ctx.stroke();

  bunting(ctx, 70 * u, 118 * u, W - 140 * u, 46 * u);

  /* ---- wordmark: HACKER गोवा HOUSE ---- */
  const wmY = 300 * u;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  const wmSize = 116 * u;
  ctx.font = `${wmSize}px ${DISPLAY}`;
  const gap = 210 * u;
  const leftW = ctx.measureText("HACKER").width;
  const rightW = ctx.measureText("HOUSE").width;
  const totalW = leftW + rightW + gap;
  const startX = W / 2 - totalW / 2;

  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.fillText("HACKER", startX + 5 * u, wmY + 6 * u);
  ctx.fillText("HOUSE", startX + leftW + gap + 5 * u, wmY + 6 * u);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillText("HACKER", startX, wmY);
  ctx.fillText("HOUSE", startX + leftW + gap, wmY);

  // pink Devanagari chip
  ctx.font = `${74 * u}px ${DEVA}`;
  ctx.textAlign = "center";
  const chipCx = startX + leftW + gap / 2;
  const dW = ctx.measureText("गोवा").width + 46 * u;
  roundRect(ctx, chipCx - dW / 2, wmY - 56 * u, dW, 112 * u, 46 * u);
  ctx.fillStyle = PALETTE.pink;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6 * u;
  ctx.stroke();
  ctx.fillStyle = PALETTE.cream;
  ctx.fillText("गोवा", chipCx, wmY + 4 * u);

  // dates + tagline
  ctx.font = `${28 * u}px ${MONO}`;
  setLetterSpacing(ctx, `${6 * u}px`);
  ctx.fillStyle = PALETTE.goldSoft;
  ctx.fillText("GOA, INDIA  ·  28–31 OCT 2026", W / 2, 386 * u);
  ctx.fillStyle = "rgba(255,201,60,0.75)";
  ctx.font = `${24 * u}px ${MONO}`;
  ctx.fillText("LESS NOISE. MORE SIGNAL.", W / 2, 428 * u);
  setLetterSpacing(ctx, "0px");

  /* ---- scenery + photo arch ---- */
  const archW = 560 * u;
  const archX = W / 2 - archW / 2;
  const archY = 500 * u;
  const archH = 620 * u;

  sunburst(ctx, W / 2, archY + 30 * u, 150 * u);

  palmTree(ctx, 190 * u, 1170 * u, 420 * u);
  palmTree(ctx, W - 190 * u, 1170 * u, 420 * u, true);

  // photo window
  ctx.save();
  archPath(ctx, archX, archY, archW, archH);
  ctx.fillStyle = PALETTE.deep;
  ctx.fill();
  ctx.clip();
  const list = (data.photos || []).filter((p) => Boolean(p && p.bitmap)).slice(0, 3);
  const pgap = list.length > 1 ? archW * 0.02 : 0;
  const cellW = list.length ? (archW - pgap * (list.length - 1)) / list.length : archW;
  list.forEach((p, i) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(archX + i * (cellW + pgap), archY, cellW, archH);
    ctx.clip();
    drawPhotoCover(ctx, p, archX + i * (cellW + pgap), archY, cellW, archH);
    ctx.restore();
  });
  ctx.restore();

  // arch frame: cream band + gold keyline + ink outline
  archPath(ctx, archX - 16 * u, archY - 16 * u, archW + 32 * u, archH + 16 * u);
  ctx.strokeStyle = PALETTE.cream;
  ctx.lineWidth = 26 * u;
  ctx.stroke();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6 * u;
  ctx.stroke();
  archPath(ctx, archX, archY, archW, archH);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 7 * u;
  ctx.stroke();

  // twisted columns
  [archX - 30 * u, archX + archW + 30 * u].forEach((cx) => {
    ctx.save();
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 8 * u;
    ctx.lineCap = "round";
    for (let y = archY + archW / 2; y < archY + archH; y += 26 * u) {
      ctx.beginPath();
      ctx.moveTo(cx - 12 * u, y);
      ctx.lineTo(cx + 12 * u, y + 16 * u);
      ctx.stroke();
    }
    ctx.restore();
  });

  // scallop crown on the arch
  scallopRow(ctx, archX + 40 * u, archY + 6 * u, archW - 80 * u, 20 * u, "rgba(255,201,60,0.5)", true);

  // sea + sand under the arch, plus scooter
  seaBand(ctx, 78 * u, 1122 * u, W - 156 * u, 56 * u);
  scooter(ctx, W / 2 + 210 * u, 1196 * u, 92 * u);
  hibiscus(ctx, 120 * u, 1010 * u, 46 * u);
  hibiscus(ctx, W - 116 * u, 950 * u, 38 * u, PALETTE.gold);

  /* ---- name plate ---- */
  const plateY = 1216 * u;
  const plateH = 108 * u;
  roundRect(ctx, 90 * u, plateY, W - 180 * u, plateH, 24 * u);
  ctx.fillStyle = PALETTE.cream;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6 * u;
  ctx.stroke();

  const name = (data.name || "YOUR NAME").toUpperCase();
  ctx.textAlign = "center";
  const nSize = fitText(ctx, name, W - 260 * u, 74 * u, DISPLAY, 28);
  ctx.font = `${nSize}px ${DISPLAY}`;
  ctx.fillStyle = PALETTE.green;
  ctx.fillText(name, W / 2, plateY + plateH / 2 + 4 * u);

  // pink title ribbon
  const ribH = 74 * u;
  const ribY = plateY + plateH + 18 * u;
  roundRect(ctx, 150 * u, ribY, W - 300 * u, ribH, ribH / 2);
  ctx.fillStyle = PALETTE.pink;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5 * u;
  ctx.stroke();
  const tSize = fitText(ctx, data.title || "UNPLACED", W - 420 * u, 42 * u, DISPLAY, 20);
  ctx.font = `${tSize}px ${DISPLAY}`;
  setLetterSpacing(ctx, `${tSize * 0.05}px`);
  ctx.fillStyle = PALETTE.gold;
  ctx.fillText(data.title || "UNPLACED", W / 2, ribY + ribH / 2 + 3 * u);
  setLetterSpacing(ctx, "0px");

  /* ---- data row: stack + builder id ---- */
  const rowY = ribY + ribH + 62 * u;
  ctx.font = `${22 * u}px ${MONO}`;
  setLetterSpacing(ctx, `${4 * u}px`);
  ctx.fillStyle = "rgba(255,246,230,0.7)";
  ctx.fillText("STACK / ROLE", W * 0.31, rowY);
  ctx.fillText("BUILDER ID", W * 0.69, rowY);
  setLetterSpacing(ctx, "0px");

  ctx.strokeStyle = "rgba(255,201,60,0.5)";
  ctx.lineWidth = 2 * u;
  ctx.setLineDash([8 * u, 8 * u]);
  ctx.beginPath();
  ctx.moveTo(W * 0.31 - 170 * u, rowY + 22 * u);
  ctx.lineTo(W * 0.31 + 170 * u, rowY + 22 * u);
  ctx.moveTo(W * 0.69 - 170 * u, rowY + 22 * u);
  ctx.lineTo(W * 0.69 + 170 * u, rowY + 22 * u);
  ctx.stroke();
  ctx.setLineDash([]);

  const stack = (data.stack || "BUILDER").toUpperCase();
  ctx.fillStyle = PALETTE.gold;
  const stSize = fitText(ctx, stack, 330 * u, 36 * u, MONO, 16);
  ctx.font = `${stSize}px ${MONO}`;
  ctx.fillText(stack, W * 0.31, rowY + 58 * u);
  const idCode = `HH-GOA-${String(seed % 10000).padStart(4, "0")}`;
  ctx.font = `${34 * u}px ${MONO}`;
  ctx.fillText(idCode, W * 0.69, rowY + 58 * u);

  /* ---- footer strip ---- */
  qrBlock(ctx, 108 * u, H - 250 * u, 132 * u, seed);
  barcode(ctx, W - 350 * u, H - 236 * u, 230 * u, 76 * u, seed + 11);
  ctx.font = `${20 * u}px ${MONO}`;
  setLetterSpacing(ctx, `${5 * u}px`);
  ctx.fillStyle = PALETTE.goldSoft;
  ctx.textAlign = "center";
  ctx.fillText("★ BUILDER PASS ★", W - 235 * u, H - 258 * u);
  ctx.fillText(
    (data.photos || []).filter(Boolean).length > 1 ? "TEAM FRAME" : "VERIFIED BUILDER",
    W / 2,
    H - 250 * u,
  );
  setLetterSpacing(ctx, "0px");
  ctx.fillStyle = "rgba(255,201,60,0.85)";
  ctx.font = `${26 * u}px ${MONO}`;
  ctx.fillText("HH-GOA-2026", W / 2, H - 200 * u);

  const stripH = 76 * u;
  roundRect(ctx, 44 * u, H - stripH - 46 * u, W - 88 * u, stripH, 34 * u);
  ctx.fillStyle = PALETTE.pink;
  ctx.fill();
  ctx.font = `${24 * u}px ${MONO}`;
  setLetterSpacing(ctx, `${5 * u}px`);
  ctx.fillStyle = PALETTE.gold;
  const sy = H - 46 * u - stripH / 2 + 2 * u;
  ctx.textAlign = "left";
  ctx.fillText("HHGOA.COM", 100 * u, sy);
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.cream;
  ctx.fillText("#FRAMEINGOA", W / 2, sy);
  ctx.textAlign = "right";
  ctx.fillStyle = PALETTE.gold;
  ctx.fillText("28–31 OCT 2026", W - 100 * u, sy);
  setLetterSpacing(ctx, "0px");
  ctx.textAlign = "left";
}


export type Format = "pfp" | "card";

export async function renderToCanvas(
  canvas: HTMLCanvasElement,
  format: Format,
  data: CardData,
  scale = 1,
) {
  if (typeof document !== "undefined" && document.fonts) {
    try {
      await document.fonts.ready;
      if (document.fonts.load) {
        await Promise.all([
          document.fonts.load('400 1em "Anton"'),
          document.fonts.load('400 1em "Space Grotesk"'),
        ]);
      }
    } catch {
      /* font preloading fallback */
    }
  }
  const W = format === "pfp" ? 1600 : 1200;
  const H = format === "pfp" ? 1600 : 1500;
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.save();
  ctx.scale(scale, scale);
  if (format === "pfp") renderPfp(ctx, data, W);
  else renderCard(ctx, data, W, H);
  ctx.restore();
}
