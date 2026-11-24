/**
 * Shared drawing kit for the ready-made toddler books: flat, high-contrast shapes with a soft
 * outline, which suits 1–3 year olds. Story pages are 1200×630 (the picture area of a 4:3 page),
 * covers are 1200×900 with the title band over the bottom third.
 */
import type { ReactNode } from "react";

export const INK = "#4A3F3A";
export const C = {
  red: "#F0735A",
  orange: "#F7A541",
  yellow: "#FFD25A",
  green: "#7CC68D",
  teal: "#5BB8C9",
  blue: "#6C9FE0",
  purple: "#A98BDB",
  pink: "#F5A3B5",
  brown: "#B98552",
  white: "#FFFFFF",
  // backgrounds
  cream: "#FFF4E0",
  sky: "#DDF1FA",
  mint: "#E4F5E8",
  blush: "#FDE7EA",
  lav: "#EEE8FA",
  night: "#2F3B6B",
};

/** Round computed coordinates so server and browser render identical SVG (trig results can differ in the last digit). */
export const r1 = (n: number) => Math.round(n * 10) / 10;

export const outline = { stroke: INK, strokeWidth: 8, strokeLinejoin: "round", strokeLinecap: "round" } as const;

export function Scene({ bg, cover, children }: { bg: string; cover?: boolean; children: ReactNode }) {
  const h = cover ? 900 : 630;
  return (
    <svg viewBox={`0 0 1200 ${h}`} preserveAspectRatio="xMidYMid slice" className="block h-full w-full" aria-hidden>
      <rect width="1200" height={h} fill={bg} />
      {children}
    </svg>
  );
}

export type Mood = "smile" | "sleep" | "wow";

/** Eyes, blush and mouth centred on (x, y). At s=1 the face is about 120 wide. */
export function Face({ x, y, s = 1, mood = "smile" }: { x: number; y: number; s?: number; mood?: Mood }) {
  const eye = (dx: number) =>
    mood === "sleep" ? (
      <path d={`M ${x + dx - 11 * s} ${y - 8 * s} q ${11 * s} ${11 * s} ${22 * s} 0`} stroke={INK} strokeWidth={5 * s} fill="none" strokeLinecap="round" />
    ) : (
      <g>
        <circle cx={x + dx} cy={y - 6 * s} r={9 * s} fill={INK} />
        <circle cx={x + dx + 3 * s} cy={y - 9 * s} r={3 * s} fill="#fff" />
      </g>
    );
  return (
    <g>
      {eye(-26 * s)}
      {eye(26 * s)}
      <ellipse cx={x - 47 * s} cy={y + 14 * s} rx={13 * s} ry={8 * s} fill={C.pink} opacity={0.8} />
      <ellipse cx={x + 47 * s} cy={y + 14 * s} rx={13 * s} ry={8 * s} fill={C.pink} opacity={0.8} />
      {mood === "wow" ? (
        <ellipse cx={x} cy={y + 20 * s} rx={9 * s} ry={11 * s} fill={INK} />
      ) : (
        <path d={`M ${x - 16 * s} ${y + 12 * s} Q ${x} ${y + 30 * s} ${x + 16 * s} ${y + 12 * s}`} stroke={INK} strokeWidth={6 * s} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

// ——— the three shape friends ———

export function CircleBuddy({ cx, cy, r, fill, mood }: { cx: number; cy: number; r: number; fill: string; mood?: Mood }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} {...outline} />
      <Face x={cx} y={cy} s={r / 85} mood={mood} />
    </g>
  );
}

/** Equilateral triangle with side `size`, centred on its centroid. */
export function TriangleBuddy({ cx, cy, size, fill, mood }: { cx: number; cy: number; size: number; fill: string; mood?: Mood }) {
  const h = size * 0.866;
  const top = cy - (2 * h) / 3;
  const base = cy + h / 3;
  return (
    <g>
      <polygon points={`${cx},${top} ${cx - size / 2},${base} ${cx + size / 2},${base}`} fill={fill} {...outline} strokeWidth={10} />
      <Face x={cx} y={cy + h * 0.1} s={size / 300} mood={mood} />
    </g>
  );
}

export function SquareBuddy({ cx, cy, size, fill, mood }: { cx: number; cy: number; size: number; fill: string; mood?: Mood }) {
  return (
    <g>
      <rect x={cx - size / 2} y={cy - size / 2} width={size} height={size} rx={size * 0.07} fill={fill} {...outline} />
      <Face x={cx} y={cy + size * 0.03} s={size / 230} mood={mood} />
    </g>
  );
}

// ——— decorations ———

export function starPath(cx: number, cy: number, R: number, r: number, n = 5) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 === 0 ? R : r;
    const a = (Math.PI / n) * i - Math.PI / 2;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

export function Star({ x, y, r, fill = C.yellow, stroke }: { x: number; y: number; r: number; fill?: string; stroke?: boolean }) {
  return <path d={starPath(x, y, r, r * 0.48)} fill={fill} {...(stroke ? outline : {})} strokeWidth={stroke ? 6 : 0} strokeLinejoin="round" />;
}

/** Four-point twinkle. */
export function Sparkle({ x, y, r, fill = C.yellow }: { x: number; y: number; r: number; fill?: string }) {
  return <path d={`M ${x} ${y - r} Q ${x} ${y} ${x + r} ${y} Q ${x} ${y} ${x} ${y + r} Q ${x} ${y} ${x - r} ${y} Q ${x} ${y} ${x} ${y - r} Z`} fill={fill} />;
}

export function Cloud({ x, y, s = 1, fill = "#fff" }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <g fill={fill} transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="20" rx="110" ry="34" />
      <circle cx="-45" cy="5" r="42" />
      <circle cx="15" cy="-12" r="55" />
      <circle cx="65" cy="10" r="36" />
    </g>
  );
}

/** Ground with a gently wavy top edge, from y to the bottom of the scene. */
export function Ground({ y, fill, height = 630 }: { y: number; fill: string; height?: number }) {
  let d = `M 0 ${y}`;
  for (let x = 0; x < 1200; x += 150) d += ` Q ${x + 75} ${y - 18} ${x + 150} ${y}`;
  d += ` L 1200 ${height} L 0 ${height} Z`;
  return <path d={d} fill={fill} />;
}

export function Sun({ cx, cy, r, face, rays = 12 }: { cx: number; cy: number; r: number; face?: boolean; rays?: number }) {
  return (
    <g>
      {Array.from({ length: rays }, (_, i) => {
        const a = ((Math.PI * 2) / rays) * i;
        return (
          <line
            key={i}
            x1={r1(cx + Math.cos(a) * r * 1.2)}
            y1={r1(cy + Math.sin(a) * r * 1.2)}
            x2={r1(cx + Math.cos(a) * r * 1.55)}
            y2={r1(cy + Math.sin(a) * r * 1.55)}
            stroke={C.orange}
            strokeWidth={r * 0.13}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r} fill={C.yellow} {...outline} strokeWidth={face ? 8 : 6} />
      {face && <Face x={cx} y={cy} s={r / 85} />}
    </g>
  );
}

/** A string of triangle flags hanging in a curve across the top. */
export function Bunting({ y, sag, n = 9, colors = [C.red, C.yellow, C.teal, C.purple, C.green] }: { y: number; sag: number; n?: number; colors?: string[] }) {
  const at = (t: number) => ({ x: 1200 * t, y: y + 2 * sag * 2 * t * (1 - t) });
  return (
    <g>
      <path d={`M 0 ${y} Q 600 ${y + 2 * sag} 1200 ${y}`} stroke={INK} strokeWidth={5} fill="none" />
      {Array.from({ length: n }, (_, i) => {
        const p = at((i + 0.5) / n);
        return <polygon key={i} points={`${p.x - 38},${p.y} ${p.x + 38},${p.y} ${p.x},${p.y + 80}`} fill={colors[i % colors.length]} {...outline} strokeWidth={5} />;
      })}
    </g>
  );
}

export function Bubble({ x, y, r, stroke = C.teal }: { x: number; y: number; r: number; stroke?: string }) {
  const a1 = (210 * Math.PI) / 180;
  const a2 = (255 * Math.PI) / 180;
  const hr = r * 0.7;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#fff" fillOpacity={0.45} stroke={stroke} strokeWidth={Math.max(4, r * 0.06)} />
      <path
        d={`M ${r1(x + hr * Math.cos(a1))} ${r1(y + hr * Math.sin(a1))} A ${r1(hr)} ${r1(hr)} 0 0 1 ${r1(x + hr * Math.cos(a2))} ${r1(y + hr * Math.sin(a2))}`}
        stroke="#fff"
        strokeWidth={Math.max(4, r * 0.1)}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

export function NightSky({ stars }: { stars: [number, number, number][] }) {
  return (
    <g>
      {stars.map(([x, y, r], i) => (i % 3 === 0 ? <Sparkle key={i} x={x} y={y} r={r * 1.4} fill="#FFF3C4" /> : <Star key={i} x={x} y={y} r={r} fill="#FFE38A" />))}
    </g>
  );
}
