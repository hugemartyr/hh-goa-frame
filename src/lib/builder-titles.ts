export const BUILDER_TITLES = [
  "THE TERMINAL WIZARD",
  "AI-NATIVE BUILDER",
  "PIXEL PUSHER",
  "PROTOCOL ARCHITECT",
  "SERIAL SHIPPER",
  "LATENCY HUNTER",
  "MIDNIGHT COMMITTER",
  "THE PROMPT SMITH",
  "EDGE CASE SLAYER",
  "DEMO DAY MENACE",
  "ZERO-TO-ONE OPERATOR",
  "THE REFACTOR MONK",
  "GPU WHISPERER",
  "FULL-STACK NOMAD",
  "THE SHIP-IT SAINT",
  "BUG BOUNTY BANDIT",
  "SCHEMA SURGEON",
  "VIBE COMPILER",
  "THE UPTIME ORACLE",
  "ROADMAP RENEGADE",
];

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Deterministic title from a seed (name + stack), shifted by `nudge` on shuffle. */
export function pickBuilderTitle(seed: string, nudge = 0) {
  const base = seed.trim().length ? hash(seed.toLowerCase()) : 7;
  return BUILDER_TITLES[(base + nudge) % BUILDER_TITLES.length];
}
