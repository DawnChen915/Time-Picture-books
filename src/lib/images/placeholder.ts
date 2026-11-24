import type { ImageProvider } from "./index";

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
  async generate({ prompt }) {
    let hash = 0;
    for (const ch of prompt) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    const [a, b] = PALETTES[hash % PALETTES.length];
    const words = prompt.split(/\s+/).slice(0, 60);
    const lines: string[] = [];
    for (let i = 0; i < words.length && lines.length < 6; i += 10) lines.push(words.slice(i, i + 10).join(" "));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1536 1024">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="1536" height="1024" fill="url(#g)"/>
  <circle cx="1250" cy="230" r="110" fill="#fff" opacity="0.6"/>
  <text x="768" y="380" text-anchor="middle" font-family="sans-serif" font-size="56" fill="#7a6f6f">插图占位</text>
  ${lines.map((l, i) => `<text x="768" y="${480 + i * 44}" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#8d8585">${escape(l)}</text>`).join("\n  ")}
</svg>`;
    return { data: Buffer.from(svg), mimeType: "image/svg+xml", ext: "svg" };
  },
};
