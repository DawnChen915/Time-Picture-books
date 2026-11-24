import { ImageError } from "./errors";
import type { ImageProvider } from "./index";

// For trying the flow locally: PLACEHOLDER_DELAY_MS makes each image take a while,
// PLACEHOLDER_FAIL_RATE (0–1) makes some attempts fail so retries can be seen.
const DELAY_MS = Number(process.env.PLACEHOLDER_DELAY_MS ?? 0);
const FAIL_RATE = Number(process.env.PLACEHOLDER_FAIL_RATE ?? 0);

const PALETTES = [
  ["#fde2e4", "#fad2e1"],
  ["#e2ece9", "#bee1e6"],
  ["#fff1e6", "#fde2c4"],
  ["#dfe7fd", "#cddafd"],
  ["#f0efeb", "#e2ece9"],
];

function escape(s: string) {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);
}

/** Offline stand-in so the whole flow can be tried without an image API key. */
export const placeholderProvider: ImageProvider = {
  name: "placeholder",
  async generate({ prompt, orientation = "landscape" }) {
    if (DELAY_MS > 0) await new Promise((r) => setTimeout(r, DELAY_MS));
    if (Math.random() < FAIL_RATE) throw new ImageError("模拟的生成失败（PLACEHOLDER_FAIL_RATE）", true);
    const [w, h] = orientation === "portrait" ? [1024, 1536] : [1536, 1024];
    let hash = 0;
    for (const ch of prompt) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    const [a, b] = PALETTES[hash % PALETTES.length];
    const words = prompt.split(/\s+/).slice(0, 60);
    const lines: string[] = [];
    const per = orientation === "portrait" ? 6 : 10;
    for (let i = 0; i < words.length && lines.length < 8; i += per) lines.push(words.slice(i, i + per).join(" "));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <circle cx="${w - 280}" cy="230" r="110" fill="#fff" opacity="0.6"/>
  <text x="${w / 2}" y="${h / 2 - 130}" text-anchor="middle" font-family="sans-serif" font-size="56" fill="#7a6f6f">插图占位</text>
  ${lines.map((l, i) => `<text x="${w / 2}" y="${h / 2 - 30 + i * 44}" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#8d8585">${escape(l)}</text>`).join("\n  ")}
</svg>`;
    return { data: Buffer.from(svg), mimeType: "image/svg+xml", ext: "svg" };
  },
};
