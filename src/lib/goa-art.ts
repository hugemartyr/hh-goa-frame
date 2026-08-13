/**
 * Hand-drawn style Goa illustration primitives used by the Builder ID card.
 * Everything is vector canvas so it scales to any export resolution.
 */

export const INK = "#04231A";

type Ctx = CanvasRenderingContext2D;

export function stroked(ctx: Ctx, lw: number, draw: () => void, fill?: string) {
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (fill) {
    ctx.fillStyle = fill;
    draw();
    ctx.fill();
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  draw();
  ctx.stroke();
  ctx.restore();
}

/** Chunky cartoon palm tree growing up from (x,y). */
export function palmTree(ctx: Ctx, x: number, y: number, s: number, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // trunk
  const trunk = () => {
    ctx.beginPath();
    ctx.moveTo(-0.06 * s, 0);
    ctx.quadraticCurveTo(0.02 * s, -0.55 * s, 0.26 * s, -0.95 * s);
    ctx.lineTo(0.36 * s, -0.9 * s);
    ctx.quadraticCurveTo(0.12 * s, -0.5 * s, 0.07 * s, 0);
    ctx.closePath();
  };
  stroked(ctx, s * 0.022, trunk, "#FFF6E6");

  // trunk rings
  ctx.strokeStyle = "#FFC93C";
  ctx.lineWidth = s * 0.014;
  for (let i = 1; i <= 6; i++) {
    const t = i / 7;
    const px = -0.02 * s + t * 0.28 * s;
    const py = -t * 0.92 * s;
    ctx.beginPath();
    ctx.moveTo(px - 0.035 * s, py);
    ctx.lineTo(px + 0.05 * s, py - 0.02 * s);
    ctx.stroke();
  }

  // fronds
  const frond = (a: number, len: number) => {
    ctx.save();
    ctx.translate(0.31 * s, -0.95 * s);
    ctx.rotate(a);
    const leaf = () => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(len * 0.55, -len * 0.32, len, -len * 0.02);
      ctx.quadraticCurveTo(len * 0.6, len * 0.16, 0, 0.05 * s);
      ctx.closePath();
    };
    stroked(ctx, s * 0.02, leaf, "#0C5C41");
    ctx.strokeStyle = "#FFC93C";
    ctx.lineWidth = s * 0.012;
    for (let i = 1; i <= 5; i++) {
      const t = i / 6;
      ctx.beginPath();
      ctx.moveTo(len * t, -len * 0.06 * t);
      ctx.lineTo(len * t * 0.96, -len * 0.24 * t);
      ctx.stroke();
    }
    ctx.restore();
  };

  frond(-2.55, 0.5 * s);
  frond(-1.95, 0.44 * s);
  frond(-0.75, 0.46 * s);
  frond(-0.15, 0.5 * s);
  frond(0.45, 0.4 * s);

  // coconuts
  ctx.fillStyle = "#FFC93C";
  ctx.beginPath();
  ctx.arc(0.28 * s, -0.9 * s, s * 0.032, 0, Math.PI * 2);
  ctx.arc(0.37 * s, -0.86 * s, s * 0.028, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Half sun with radiating rays. */
export function sunburst(ctx: Ctx, cx: number, cy: number, r: number, color = "#FFC93C") {
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.09;
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI + (Math.PI * i) / 10;
    const inner = r * 1.25;
    const outer = r * (i % 2 === 0 ? 1.75 : 1.52);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** Tiny pink Vespa. */
export function scooter(ctx: Ctx, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(-0.5 * s, 0);
    ctx.quadraticCurveTo(-0.55 * s, -0.42 * s, -0.16 * s, -0.46 * s);
    ctx.lineTo(0.1 * s, -0.46 * s);
    ctx.quadraticCurveTo(0.26 * s, -0.46 * s, 0.3 * s, -0.2 * s);
    ctx.lineTo(0.34 * s, 0);
    ctx.closePath();
  };
  stroked(ctx, s * 0.07, body, "#FF3D8B");
  // handlebar
  ctx.strokeStyle = INK;
  ctx.lineWidth = s * 0.07;
  ctx.beginPath();
  ctx.moveTo(0.24 * s, -0.34 * s);
  ctx.lineTo(0.46 * s, -0.62 * s);
  ctx.lineTo(0.6 * s, -0.6 * s);
  ctx.stroke();
  // wheels
  [-0.42, 0.4].forEach((wx) => {
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(wx * s, 0.04 * s, s * 0.19, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFF6E6";
    ctx.beginPath();
    ctx.arc(wx * s, 0.04 * s, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

/** Five-petal hibiscus. */
export function hibiscus(ctx: Ctx, cx: number, cy: number, r: number, color = "#FF3D8B") {
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / 5);
    const petal = () => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(r * 0.8, -r * 0.55, r, 0);
      ctx.quadraticCurveTo(r * 0.8, r * 0.55, 0, 0);
      ctx.closePath();
    };
    stroked(ctx, r * 0.09, petal, color);
    ctx.restore();
  }
  ctx.fillStyle = "#FFC93C";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Festive bunting: a slack string with alternating leaves and flowers. */
export function bunting(ctx: Ctx, x: number, y: number, w: number, sag: number) {
  const pt = (t: number) => ({
    x: x + w * t,
    y: y + Math.sin(Math.PI * t) * sag,
  });
  ctx.save();
  ctx.strokeStyle = "#FFF6E6";
  ctx.lineWidth = Math.max(1, w * 0.003);
  ctx.beginPath();
  for (let t = 0; t <= 1.001; t += 0.02) {
    const p = pt(t);
    if (t === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();

  const n = 13;
  for (let i = 1; i < n; i++) {
    const p = pt(i / n);
    const s = w * 0.028;
    if (i % 2 === 0) {
      // monstera-ish leaf
      const leaf = () => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(p.x - s, p.y + s * 1.1, p.x, p.y + s * 2);
        ctx.quadraticCurveTo(p.x + s, p.y + s * 1.1, p.x, p.y);
        ctx.closePath();
      };
      stroked(ctx, w * 0.0022, leaf, "#0C5C41");
    } else {
      hibiscus(ctx, p.x, p.y + s * 1.2, s * 0.8, i % 3 === 0 ? "#FFC93C" : "#FF3D8B");
    }
  }
  ctx.restore();
}

/** Wavy sea band with a sand strip below it. */
export function seaBand(ctx: Ctx, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.strokeStyle = "#FFF6E6";
  ctx.lineWidth = h * 0.055;
  ctx.lineCap = "round";
  for (let row = 0; row < 3; row++) {
    const yy = y + h * (0.22 + row * 0.26);
    ctx.beginPath();
    for (let i = 0; i <= w; i += 2) {
      const yv = yy + Math.sin((i / w) * Math.PI * 18 + row) * h * 0.08;
      if (i === 0) ctx.moveTo(x + i, yv);
      else ctx.lineTo(x + i, yv);
    }
    ctx.stroke();
  }
  ctx.fillStyle = "#FFF6E6";
  ctx.fillRect(x, y + h, w, h * 0.45);
  ctx.fillStyle = "rgba(4,35,26,0.35)";
  for (let i = 0; i < 60; i++) {
    const px = x + ((i * 97.3) % w);
    const py = y + h + ((i * 53.7) % (h * 0.45));
    ctx.fillRect(px, py, h * 0.03, h * 0.03);
  }
  ctx.restore();
}

/** Deterministic pseudo-QR block. */
export function qrBlock(ctx: Ctx, x: number, y: number, size: number, seed: number) {
  const n = 11;
  const c = size / n;
  ctx.save();
  ctx.fillStyle = "#FFF6E6";
  ctx.fillRect(x - c * 0.6, y - c * 0.6, size + c * 1.2, size + c * 1.2);
  ctx.fillStyle = "#04231A";
  let s = seed || 7;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (rnd() > 0.52) ctx.fillRect(x + i * c, y + j * c, c, c);
    }
  }
  // finder patterns
  const finder = (fx: number, fy: number) => {
    ctx.fillStyle = "#FFF6E6";
    ctx.fillRect(fx, fy, c * 3.4, c * 3.4);
    ctx.fillStyle = "#04231A";
    ctx.fillRect(fx, fy, c * 3, c * 3);
    ctx.fillStyle = "#FFF6E6";
    ctx.fillRect(fx + c * 0.6, fy + c * 0.6, c * 1.8, c * 1.8);
    ctx.fillStyle = "#04231A";
    ctx.fillRect(fx + c * 1.1, fy + c * 1.1, c * 0.8, c * 0.8);
  };
  finder(x, y);
  finder(x + size - c * 3, y);
  finder(x, y + size - c * 3);
  ctx.restore();
}

/** Fake barcode. */
export function barcode(ctx: Ctx, x: number, y: number, w: number, h: number, seed: number) {
  ctx.save();
  ctx.fillStyle = "#FFF6E6";
  let s = seed || 3;
  let cx = x;
  while (cx < x + w) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const bw = (s % 5) + 1;
    if ((s >> 4) % 2 === 0) ctx.fillRect(cx, y, bw, h);
    cx += bw + 3;
  }
  ctx.restore();
}

export function seedFrom(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Ornate scalloped arch frame (the photo window). */
export function archPath(ctx: Ctx, x: number, y: number, w: number, h: number) {
  const r = w / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, 0);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}
