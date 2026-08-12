import { drawPhotoCover, type LoadedPhoto } from "./image";

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

function photoBlock(
  ctx: CanvasRenderingContext2D,
  photos: LoadedPhoto[],
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  const list = photos.slice(0, 3);
  const gap = w * 0.018;
  const cellW = (w - gap * (list.length - 1)) / list.length;
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
  ctx.letterSpacing = `${size * 0.12}px`;
  const padX = size * 0.9;
  const w = ctx.measureText(text).width + padX * 2;
  const h = size * 2.1;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = "left";
  ctx.fillText(text, x + padX, y + h / 2 + size * 0.05);
  ctx.letterSpacing = "0px";
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
  ctx.letterSpacing = `${9 * u}px`;
  ctx.font = `${26 * u}px ${BODY}`;
  ctx.fillStyle = PALETTE.goldSoft;
  ctx.fillText("BUILDERS COME TO SHIP · GOA", S / 2, 118 * u);
  ctx.letterSpacing = "0px";

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
  ctx.letterSpacing = `${6 * u}px`;
  const chipW = ctx.measureText("2026").width + 56 * u;
  const chipH = 66 * u;
  roundRect(ctx, S / 2 - chipW / 2, chipY - chipH / 2, chipW, chipH, chipH / 2);
  ctx.fillStyle = PALETTE.pink;
  ctx.fill();
  ctx.fillStyle = PALETTE.cream;
  ctx.textBaseline = "middle";
  ctx.fillText("2026", S / 2, chipY + 3 * u);
  ctx.letterSpacing = "0px";

  const ruleW = (size - chipW) / 2 - 34 * u;
  diamondRow(ctx, inset, chipY, ruleW, 9 * u, PALETTE.gold);
  diamondRow(ctx, S - inset - ruleW, chipY, ruleW, 9 * u, PALETTE.gold);
}

/* ---------- format B: builder ID card ---------- */

export function renderCard(ctx: CanvasRenderingContext2D, data: CardData, W: number, H: number) {
  const u = W / 1200;
  backdrop(ctx, W, H);

  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 12 * u;
  ctx.strokeRect(26 * u, 26 * u, W - 52 * u, H - 52 * u);
  ctx.strokeStyle = "rgba(255,61,139,0.7)";
  ctx.lineWidth = 4 * u;
  ctx.strokeRect(50 * u, 50 * u, W - 100 * u, H - 100 * u);

  const pad = 92 * u;
  const inner = W - pad * 2;

  // header
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillStyle = PALETTE.gold;
  ctx.font = `${52 * u}px ${DISPLAY}`;
  ctx.letterSpacing = `${2 * u}px`;
  ctx.fillText("HH GOA", pad, 126 * u);
  const hhW = ctx.measureText("HH GOA").width;
  ctx.fillStyle = PALETTE.pink;
  ctx.fillText("2026", pad + hhW + 16 * u, 126 * u);
  ctx.letterSpacing = "0px";

  ctx.textAlign = "right";
  ctx.font = `${24 * u}px ${BODY}`;
  ctx.letterSpacing = `${8 * u}px`;
  ctx.fillStyle = PALETTE.goldSoft;
  ctx.fillText("BUILDER ID", W - pad, 126 * u);
  ctx.letterSpacing = "0px";

  scallopRow(ctx, pad, 176 * u, inner, 16 * u, "rgba(255,201,60,0.3)", true);

  // photo
  const photoY = 216 * u;
  const photoH = 620 * u;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 40 * u;
  ctx.shadowOffsetY = 14 * u;
  roundRect(ctx, pad, photoY, inner, photoH, 36 * u);
  ctx.fillStyle = PALETTE.deep;
  ctx.fill();
  ctx.restore();
  photoBlock(ctx, data.photos, pad, photoY, inner, photoH, 36 * u);
  roundRect(ctx, pad, photoY, inner, photoH, 36 * u);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 8 * u;
  ctx.stroke();

  // title banner overlapping photo
  const bannerH = 96 * u;
  const bannerY = photoY + photoH - bannerH / 2;
  roundRect(ctx, pad + 24 * u, bannerY, inner - 48 * u, bannerH, bannerH / 2);
  ctx.fillStyle = PALETTE.gold;
  ctx.fill();
  ctx.textAlign = "center";
  ctx.fillStyle = PALETTE.deep;
  const tSize = fitText(ctx, data.title, inner - 130 * u, 46 * u, DISPLAY, 22);
  ctx.font = `${tSize}px ${DISPLAY}`;
  ctx.letterSpacing = `${tSize * 0.06}px`;
  ctx.fillText(data.title, W / 2, bannerY + bannerH / 2 + 2 * u);
  ctx.letterSpacing = "0px";

  // name
  const name = (data.name || "YOUR NAME").toUpperCase();
  ctx.textAlign = "left";
  ctx.fillStyle = PALETTE.cream;
  const nSize = fitText(ctx, name, inner, 104 * u, DISPLAY, 34);
  ctx.font = `${nSize}px ${DISPLAY}`;
  const nameY = bannerY + bannerH + 92 * u;
  ctx.fillText(name, pad, nameY);

  // stack
  ctx.fillStyle = PALETTE.pink;
  const stack = (data.stack || "BUILDER").toUpperCase();
  const sSize = fitText(ctx, stack, inner, 34 * u, BODY, 18);
  ctx.font = `${sSize}px ${BODY}`;
  ctx.letterSpacing = `${sSize * 0.16}px`;
  ctx.fillText(stack, pad, nameY + 66 * u);
  ctx.letterSpacing = "0px";

  // badges
  const badgeY = nameY + 116 * u;
  const w1 = tag(ctx, "#FRAMEINGOA", pad, badgeY, 24 * u, "rgba(255,201,60,0.16)", PALETTE.gold);
  tag(
    ctx,
    data.photos.length > 1 ? "TEAM FRAME" : "VERIFIED BUILDER",
    pad + w1 + 18 * u,
    badgeY,
    24 * u,
    "rgba(255,61,139,0.18)",
    PALETTE.pink,
  );

  // footer
  diamondRow(ctx, pad, H - 148 * u, inner, 8 * u, "rgba(255,201,60,0.55)");
  ctx.textAlign = "left";
  ctx.font = `${24 * u}px ${BODY}`;
  ctx.letterSpacing = `${6 * u}px`;
  ctx.fillStyle = PALETTE.goldSoft;
  ctx.fillText("HACKER HOUSE GOA", pad, H - 96 * u);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,246,230,0.6)";
  ctx.fillText("HHGOA.COM", W - pad, H - 96 * u);
  ctx.letterSpacing = "0px";

  cornerMotif(ctx, 110 * u, 110 * u, 52 * u, Math.PI);
  cornerMotif(ctx, W - 110 * u, H - 110 * u, 52 * u, 0);
}

export type Format = "pfp" | "card";

export async function renderToCanvas(
  canvas: HTMLCanvasElement,
  format: Format,
  data: CardData,
  scale = 1,
) {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
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
