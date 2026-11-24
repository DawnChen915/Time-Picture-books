/* Ready-made geometry books for 1–3 year olds: one shape per book, one short line per page. */
import { useId } from "react";
import {
  Bubble,
  Bunting,
  C,
  CircleBuddy,
  Cloud,
  Face,
  Ground,
  INK,
  NightSky,
  outline,
  r1,
  Scene,
  Sparkle,
  SquareBuddy,
  Star,
  Sun,
  TriangleBuddy,
} from "./art";
import type { LibraryBook } from "./index";

const NIGHT_STARS: [number, number, number][] = [
  [120, 90, 18], [260, 200, 12], [380, 70, 14], [840, 90, 16], [1000, 200, 20], [1100, 70, 12],
  [160, 420, 12], [1060, 430, 14], [950, 560, 10], [230, 560, 10], [720, 40, 10], [480, 560, 8],
];

// ——————————————————— 圆圆，圆圆 ———————————————————

function Ball({ x, y, r }: { x: number; y: number; r: number }) {
  const id = useId();
  return (
    <g>
      <clipPath id={id}>
        <circle cx={x} cy={y} r={r} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <rect x={x - r} y={y - r} width={r * 2} height={r * 2} fill={C.blue} />
        <ellipse cx={x} cy={y} rx={r * 0.72} ry={r * 1.1} fill="#fff" />
        <ellipse cx={x} cy={y} rx={r * 0.36} ry={r * 1.1} fill={C.red} />
      </g>
      <circle cx={x} cy={y} r={r} fill="none" {...outline} />
      <circle cx={x - r * 0.45} cy={y - r * 0.5} r={r * 0.12} fill="#fff" opacity={0.8} />
    </g>
  );
}

const circleBook: LibraryBook = {
  id: "circle",
  title: "圆圆，圆圆",
  summary: "太阳、皮球、泡泡、月亮……原来圆圆就在身边。",
  stage: "babble",
  ages: [1, 2],
  accent: C.yellow,
  dedication: "送给正在认识世界的小小的你：\n圆圆的世界，圆圆的笑脸。",
  cover: () => (
    <Scene bg={C.cream} cover>
      {[
        [220, 160, 46, C.red], [980, 190, 60, C.teal], [160, 470, 30, C.purple], [1040, 480, 38, C.pink],
        [330, 80, 20, C.blue], [880, 70, 26, C.green], [1090, 340, 18, C.orange], [120, 300, 16, C.green],
      ].map(([x, y, r, f], i) => (
        <circle key={i} cx={x as number} cy={y as number} r={r as number} fill={f as string} {...outline} strokeWidth={6} />
      ))}
      <CircleBuddy cx={600} cy={320} r={200} fill={C.yellow} />
      <Sparkle x={800} y={110} r={26} />
      <Sparkle x={380} y={560} r={20} fill={C.orange} />
    </Scene>
  ),
  pages: [
    {
      text: "这是圆圆。\n圆圆，圆圆，转一圈。",
      art: () => (
        <Scene bg={C.lav}>
          <circle cx={600} cy={320} r={240} fill="none" stroke={INK} strokeWidth={7} strokeDasharray="34 30" strokeLinecap="round" opacity={0.35} />
          <CircleBuddy cx={600} cy={320} r={170} fill={C.red} />
          <circle cx={600} cy={80} r={18} fill={C.yellow} {...outline} strokeWidth={5} />
          <circle cx={840} cy={320} r={14} fill={C.teal} {...outline} strokeWidth={5} />
          <circle cx={360} cy={320} r={14} fill={C.green} {...outline} strokeWidth={5} />
          <Sparkle x={180} y={150} r={30} />
          <Sparkle x={1030} y={480} r={26} fill={C.pink} />
        </Scene>
      ),
    },
    {
      text: "太阳公公圆圆的，\n暖暖的。",
      art: () => (
        <Scene bg={C.sky}>
          <Cloud x={190} y={470} s={1.1} />
          <Cloud x={1010} y={150} s={0.8} />
          <Cloud x={1040} y={500} s={0.6} />
          <Sun cx={600} cy={305} r={145} face />
        </Scene>
      ),
    },
    {
      text: "皮球圆圆的，\n拍一拍，嘭、嘭、嘭！",
      art: () => (
        <Scene bg={C.mint}>
          <Ground y={525} fill="#BFE5C5" />
          <path d="M 120 510 Q 230 170 340 500 Q 420 290 500 470" fill="none" stroke={INK} strokeWidth={6} strokeDasharray="4 22" strokeLinecap="round" opacity={0.45} />
          <ellipse cx={660} cy={548} rx={110} ry={16} fill={INK} opacity={0.15} />
          <Ball x={660} y={320} r={130} />
          {[-40, 0, 40].map((dx) => (
            <line key={dx} x1={660 + dx} y1={480} x2={660 + dx * 1.3} y2={505} stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
          ))}
          <Sparkle x={930} y={170} r={28} />
        </Scene>
      ),
    },
    {
      text: "泡泡圆圆的，\n吹一吹，飞呀飞。",
      art: () => (
        <Scene bg="#E6F0FB">
          {[
            [250, 200, 90, C.teal], [330, 480, 55, C.purple], [900, 180, 100, C.pink], [990, 440, 70, C.teal],
            [770, 530, 40, C.blue], [150, 420, 35, C.pink], [1100, 270, 30, C.purple], [470, 110, 40, C.blue],
          ].map(([x, y, r, s], i) => (
            <Bubble key={i} x={x as number} y={y as number} r={r as number} stroke={s as string} />
          ))}
          <Bubble x={600} y={310} r={150} stroke={C.purple} />
          <Face x={600} y={318} s={1.4} />
        </Scene>
      ),
    },
    {
      text: "橙子切开，也是圆圆的，\n酸酸甜甜。",
      art: () => (
        <Scene bg={C.blush}>
          <circle cx={500} cy={320} r={165} fill={C.orange} {...outline} />
          <circle cx={500} cy={320} r={138} fill="#FFC873" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (Math.PI / 4) * i;
            return <line key={i} x1={r1(500 + Math.cos(a) * 22)} y1={r1(320 + Math.sin(a) * 22)} x2={r1(500 + Math.cos(a) * 130)} y2={r1(320 + Math.sin(a) * 130)} stroke="#fff" strokeWidth={10} strokeLinecap="round" />;
          })}
          <circle cx={500} cy={320} r={18} fill="#fff" />
          <circle cx={880} cy={390} r={105} fill={C.orange} {...outline} />
          <path d="M 880 285 q -10 -30 5 -50" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
          <ellipse cx={925} cy={262} rx={42} ry={18} transform="rotate(-25 925 262)" fill={C.green} {...outline} strokeWidth={6} />
          <circle cx={845} cy={350} r={14} fill="#fff" opacity={0.6} />
          <Sparkle x={700} y={140} r={24} />
          <Sparkle x={250} y={540} r={20} fill={C.orange} />
        </Scene>
      ),
    },
    {
      text: "月亮也变圆啦。\n圆圆，晚安！",
      art: () => (
        <Scene bg={C.night}>
          <NightSky stars={NIGHT_STARS} />
          <circle cx={600} cy={300} r={160} fill="#FFE7A3" stroke="#E9C46A" strokeWidth={8} />
          <circle cx={530} cy={220} r={26} fill="#F6D88A" />
          <circle cx={700} cy={390} r={20} fill="#F6D88A" />
          <circle cx={705} cy={230} r={14} fill="#F6D88A" />
          <Face x={600} y={315} s={1.7} mood="sleep" />
          <Cloud x={330} y={540} s={0.9} fill="#47548A" />
          <Cloud x={900} y={560} s={1.1} fill="#47548A" />
        </Scene>
      ),
    },
  ],
};

// ——————————————————— 尖尖三角形 ———————————————————

function Mountain({ x, top, half, base, fill }: { x: number; top: number; half: number; base: number; fill: string }) {
  const d = 70; // snow cap depth
  const w = (d * half) / (base - top);
  return (
    <g>
      <polygon points={`${x},${top} ${x - half},${base} ${x + half},${base}`} fill={fill} {...outline} />
      <polygon
        points={`${x},${top} ${x - w},${top + d} ${x - w / 2},${top + d - 16} ${x},${top + d} ${x + w / 2},${top + d - 16} ${x + w},${top + d}`}
        fill="#fff"
        {...outline}
        strokeWidth={6}
      />
    </g>
  );
}

function Watermelon({ face }: { face?: boolean }) {
  return (
    <g>
      <path d="M -260 -170 Q 0 -235 260 -170 L 0 220 Z" fill={C.green} {...outline} />
      <path d="M -232 -152 Q 0 -210 232 -152 L 0 192 Z" fill="#DDF3C9" />
      <path d="M -214 -138 Q 0 -192 214 -138 L 0 172 Z" fill="#F56C6C" />
      {[
        [-110, -100], [0, -120], [110, -100], [-55, -30], [55, -30], [0, 50],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={9} ry={15} fill={INK} transform={`rotate(${x / 6} ${x} ${y})`} />
      ))}
      {face && <Face x={0} y={-60} s={0.9} />}
    </g>
  );
}

function PineTree({ x, base, s = 1 }: { x: number; base: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${base}) scale(${s})`}>
      <rect x={-30} y={-110} width={60} height={110} rx={8} fill={C.brown} {...outline} />
      <polygon points="0,-300 -210,-90 210,-90" fill="#5FB27A" {...outline} />
      <polygon points="0,-390 -170,-200 170,-200" fill={C.green} {...outline} />
      <polygon points="0,-470 -130,-300 130,-300" fill="#9AD6A4" {...outline} />
    </g>
  );
}

const triangleBook: LibraryBook = {
  id: "triangle",
  title: "尖尖三角形",
  summary: "一、二、三，三个尖尖角。高山、小帆船、西瓜和大树都藏着三角形。",
  stage: "babble",
  ages: [2, 3],
  accent: C.green,
  dedication: "送给爱数“一、二、三”的你：\n每一个尖尖角，都是新发现。",
  cover: () => (
    <Scene bg={C.mint} cover>
      <Bunting y={30} sag={22} n={9} />
      <TriangleBuddy cx={600} cy={400} size={400} fill={C.green} />
      <Sparkle x={230} y={330} r={30} />
      <Sparkle x={980} y={400} r={26} fill={C.orange} />
      <polygon points="150,560 190,490 230,560" fill={C.teal} {...outline} strokeWidth={6} />
      <polygon points="1000,250 1040,180 1080,250" fill={C.purple} {...outline} strokeWidth={6} />
    </Scene>
  ),
  pages: [
    {
      text: "这是三角形。\n一、二、三，三个尖尖角。",
      art: () => (
        <Scene bg={C.cream}>
          <TriangleBuddy cx={600} cy={350} size={430} fill={C.teal} />
          <Star x={600} y={62} r={36} fill={C.red} stroke />
          <Star x={350} y={520} r={36} fill={C.yellow} stroke />
          <Star x={850} y={520} r={36} fill={C.blue} stroke />
        </Scene>
      ),
    },
    {
      text: "高高的山，\n是三角形。",
      art: () => (
        <Scene bg={C.sky}>
          <Sun cx={1020} cy={120} r={50} rays={10} />
          <Cloud x={180} y={120} s={0.8} />
          <Mountain x={620} top={90} half={330} base={560} fill={C.purple} />
          <Mountain x={330} top={240} half={260} base={560} fill={C.teal} />
          <Mountain x={920} top={220} half={270} base={560} fill={C.green} />
          <Ground y={540} fill="#BFE5C5" />
        </Scene>
      ),
    },
    {
      text: "小船的帆是三角形，\n呼——风吹来啦！",
      art: () => (
        <Scene bg={C.sky}>
          <Cloud x={980} y={130} s={0.9} />
          <path d="M 300 110 q 20 -22 40 0 q 20 -22 40 0" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
          {[180, 260, 340].map((y, i) => (
            <path key={y} d={`M ${90 + i * 30} ${y} q 60 -28 120 0 t 120 0`} stroke="#fff" strokeWidth={9} fill="none" strokeLinecap="round" />
          ))}
          <line x1={600} y1={430} x2={600} y2={100} stroke={INK} strokeWidth={10} strokeLinecap="round" />
          <polygon points="600,100 600,140 650,120" fill={C.red} {...outline} strokeWidth={5} />
          <polygon points="615,150 615,410 830,410" fill="#fff" {...outline} />
          <polygon points="585,170 585,410 440,410" fill={C.yellow} {...outline} />
          <polygon points="430,430 770,430 715,505 485,505" fill={C.red} {...outline} />
          <path d="M 0 500 Q 75 470 150 500 T 300 500 T 450 500 T 600 500 T 750 500 T 900 500 T 1050 500 T 1200 500 L 1200 630 L 0 630 Z" fill={C.blue} />
          <path d="M 0 555 Q 75 530 150 555 T 300 555 T 450 555 T 600 555 T 750 555 T 900 555 T 1050 555 T 1200 555 L 1200 630 L 0 630 Z" fill="#8FB8EB" />
        </Scene>
      ),
    },
    {
      text: "西瓜切一块，也是三角形，\n咔嚓咔嚓！",
      art: () => (
        <Scene bg={C.blush}>
          <g transform="translate(600 300)">
            <Watermelon face />
          </g>
          <g transform="translate(190 430) rotate(-18) scale(0.38)">
            <Watermelon />
          </g>
          <g transform="translate(1010 420) rotate(16) scale(0.32)">
            <Watermelon />
          </g>
          <Sparkle x={960} y={130} r={26} />
          <Sparkle x={240} y={130} r={20} fill={C.green} />
        </Scene>
      ),
    },
    {
      text: "生日帽是三角形，\n祝你生日快乐！",
      art: () => {
        const confetti: [number, number, string, number][] = [
          [180, 260, C.red, 20], [300, 450, C.teal, -30], [960, 280, C.yellow, 40], [1050, 480, C.pink, 10],
          [860, 520, C.green, -15], [250, 560, C.purple, 35], [1100, 180, C.blue, -40], [120, 400, C.orange, 25],
        ];
        return (
          <Scene bg={C.lav}>
            <Bunting y={12} sag={18} n={11} />
            {confetti.map(([x, y, f, r], i) => (
              <rect key={i} x={x - 12} y={y - 7} width={24} height={14} rx={4} fill={f} transform={`rotate(${r} ${x} ${y})`} />
            ))}
            <polygon points="600,170 455,530 745,530" fill={C.purple} {...outline} strokeWidth={10} />
            {[
              [600, 260, C.yellow], [565, 350, "#fff"], [640, 380, C.yellow], [540, 460, C.yellow], [650, 470, "#fff"], [600, 430, C.pink],
            ].map(([x, y, f], i) => (
              <circle key={i} cx={x as number} cy={y as number} r={15} fill={f as string} />
            ))}
            <rect x={440} y={515} width={320} height={34} rx={17} fill={C.pink} {...outline} strokeWidth={6} />
            <circle cx={600} cy={160} r={36} fill={C.yellow} {...outline} />
          </Scene>
        );
      },
    },
    {
      text: "大树也像三角形，\n一层、两层、三层。",
      art: () => (
        <Scene bg={C.sky}>
          <Cloud x={220} y={110} s={0.8} />
          <Cloud x={1000} y={90} s={0.6} />
          <Ground y={520} fill="#BFE5C5" />
          <PineTree x={230} base={540} s={0.55} />
          <PineTree x={980} base={545} s={0.62} />
          <PineTree x={600} base={575} s={1.1} />
          <Star x={600} y={40} r={30} stroke />
        </Scene>
      ),
    },
  ],
};

// ——————————————————— 方方正正 ———————————————————

function Block({ x, y, size, fill, mark, rotate = 0 }: { x: number; y: number; size: number; fill: string; mark: "circle" | "triangle" | "star" | "square"; rotate?: number }) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const m = size * 0.26;
  return (
    <g transform={`rotate(${rotate} ${cx} ${cy})`}>
      <rect x={x} y={y} width={size} height={size} rx={size * 0.08} fill={fill} {...outline} />
      {mark === "circle" && <circle cx={cx} cy={cy} r={m} fill="#fff" />}
      {mark === "square" && <rect x={cx - m} y={cy - m} width={m * 2} height={m * 2} rx={6} fill="#fff" />}
      {mark === "triangle" && <polygon points={`${cx},${cy - m * 1.1} ${cx - m * 1.1},${cy + m * 0.8} ${cx + m * 1.1},${cy + m * 0.8}`} fill="#fff" strokeLinejoin="round" />}
      {mark === "star" && <Star x={cx} y={cy + 3} r={m * 1.15} fill="#fff" />}
    </g>
  );
}

function Cracker() {
  const id = useId();
  return (
    <g>
      <mask id={id}>
        <rect width="1200" height="630" fill="#fff" />
        <circle cx={800} cy={135} r={62} fill="#000" />
        <circle cx={835} cy={215} r={46} fill="#000" />
        <circle cx={735} cy={105} r={44} fill="#000" />
      </mask>
      <g mask={`url(#${id})`}>
        <rect x={410} y={125} width={390} height={390} rx={26} fill="#EDBB71" {...outline} />
        <rect x={440} y={155} width={330} height={330} rx={14} fill="none" stroke="#D9A157" strokeWidth={6} strokeDasharray="14 14" />
        {[495, 605, 715].flatMap((x) => [210, 320, 430].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={11} fill="#C98F4A" />))}
      </g>
      {[
        [880, 300, 18], [915, 250, 12], [870, 370, 10], [940, 330, 8],
      ].map(([x, y, s], i) => (
        <rect key={i} x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill="#EDBB71" stroke={INK} strokeWidth={3} transform={`rotate(${i * 25} ${x} ${y})`} />
      ))}
    </g>
  );
}

const squareBook: LibraryBook = {
  id: "square",
  title: "方方正正",
  summary: "四条边，一样长。积木、窗户、礼物盒和饼干，都是方方的。",
  stage: "babble",
  ages: [2, 3],
  accent: C.blue,
  dedication: "送给爱搭积木的你：\n一块一块，慢慢搭高，慢慢长大。",
  cover: () => (
    <Scene bg={C.sky} cover>
      {[
        [190, 170, 60, C.yellow, 12], [960, 140, 70, C.red, -10], [130, 470, 44, C.green, 20], [1040, 450, 54, C.purple, -18],
        [360, 70, 30, C.pink, 30], [820, 560, 34, C.teal, 8], [320, 560, 26, C.orange, -25],
      ].map(([x, y, s, f, r], i) => (
        <rect key={i} x={(x as number) - (s as number) / 2} y={(y as number) - (s as number) / 2} width={s as number} height={s as number} rx={6} fill={f as string} {...outline} strokeWidth={6} transform={`rotate(${r} ${x} ${y})`} />
      ))}
      <SquareBuddy cx={600} cy={330} size={340} fill={C.blue} />
    </Scene>
  ),
  pages: [
    {
      text: "这是正方形。\n四条边，一样长。",
      art: () => (
        <Scene bg={C.cream}>
          <rect x={430} y={145} width={340} height={340} rx={10} fill="#F9B49F" />
          <line x1={430} y1={145} x2={770} y2={145} stroke={C.yellow} strokeWidth={22} strokeLinecap="round" />
          <line x1={770} y1={145} x2={770} y2={485} stroke={C.green} strokeWidth={22} strokeLinecap="round" />
          <line x1={770} y1={485} x2={430} y2={485} stroke={C.blue} strokeWidth={22} strokeLinecap="round" />
          <line x1={430} y1={485} x2={430} y2={145} stroke={C.purple} strokeWidth={22} strokeLinecap="round" />
          <Face x={600} y={325} s={1.5} />
          <Sparkle x={250} y={170} r={28} />
          <Sparkle x={960} y={460} r={24} fill={C.pink} />
        </Scene>
      ),
    },
    {
      text: "积木方方的，\n一块，一块，搭高高！",
      art: () => (
        <Scene bg={C.mint}>
          <Ground y={540} fill="#BFE5C5" />
          <Block x={475} y={415} size={125} fill={C.yellow} mark="circle" />
          <Block x={485} y={290} size={125} fill={C.red} mark="triangle" rotate={3} />
          <Block x={470} y={165} size={125} fill={C.blue} mark="star" rotate={-4} />
          <Block x={482} y={40} size={125} fill={C.purple} mark="square" rotate={5} />
          <Block x={790} y={435} size={110} fill={C.green} mark="circle" rotate={-8} />
          <Block x={930} y={460} size={85} fill={C.pink} mark="triangle" rotate={12} />
          <Block x={220} y={450} size={95} fill={C.teal} mark="star" rotate={-12} />
        </Scene>
      ),
    },
    {
      text: "窗户方方的，\n看，外面有小鸟。",
      art: () => {
        const id = "win";
        return (
          <Scene bg="#F6E3C8">
            <line x1={260} y1={70} x2={940} y2={70} stroke={C.brown} strokeWidth={12} strokeLinecap="round" />
            <clipPath id={id}>
              <rect x={410} y={120} width={380} height={380} />
            </clipPath>
            <rect x={380} y={90} width={440} height={440} rx={12} fill="#fff" {...outline} strokeWidth={10} />
            <rect x={410} y={120} width={380} height={380} fill={C.sky} />
            <g clipPath={`url(#${id})`}>
              <Cloud x={500} y={400} s={0.7} />
              <Sun cx={720} cy={190} r={40} rays={8} />
            </g>
            <rect x={590} y={120} width={20} height={380} fill="#fff" />
            <rect x={410} y={300} width={380} height={20} fill="#fff" />
            <rect x={410} y={120} width={380} height={380} fill="none" {...outline} strokeWidth={6} />
            <path d="M 280 70 Q 360 250 300 520 L 260 520 L 260 70 Z" fill={C.pink} {...outline} strokeWidth={6} />
            <path d="M 920 70 Q 840 250 900 520 L 940 520 L 940 70 Z" fill={C.pink} {...outline} strokeWidth={6} />
            <rect x={340} y={525} width={520} height={34} rx={8} fill={C.brown} {...outline} strokeWidth={6} />
            <g>
              <ellipse cx={690} cy={488} rx={46} ry={36} fill={C.yellow} {...outline} strokeWidth={6} />
              <circle cx={728} cy={452} r={27} fill={C.yellow} {...outline} strokeWidth={6} />
              <polygon points="752,446 778,456 752,464" fill={C.orange} {...outline} strokeWidth={4} />
              <circle cx={734} cy={447} r={5} fill={INK} />
              <path d="M 660 478 q 25 25 55 5" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            </g>
          </Scene>
        );
      },
    },
    {
      text: "礼物盒方方的，\n里面会是什么呢？",
      art: () => (
        <Scene bg={C.blush}>
          <rect x={430} y={240} width={340} height={300} rx={14} fill={C.red} {...outline} />
          <rect x={580} y={240} width={40} height={300} fill={C.yellow} {...outline} strokeWidth={6} />
          <rect x={410} y={190} width={380} height={72} rx={14} fill="#F48A73" {...outline} />
          <rect x={580} y={190} width={40} height={72} fill={C.yellow} {...outline} strokeWidth={6} />
          <ellipse cx={548} cy={160} rx={58} ry={32} transform="rotate(-18 548 160)" fill={C.yellow} {...outline} strokeWidth={7} />
          <ellipse cx={652} cy={160} rx={58} ry={32} transform="rotate(18 652 160)" fill={C.yellow} {...outline} strokeWidth={7} />
          <circle cx={600} cy={178} r={20} fill={C.orange} {...outline} strokeWidth={6} />
          <Sparkle x={300} y={180} r={32} />
          <Sparkle x={910} y={150} r={26} fill={C.purple} />
          <Sparkle x={890} y={430} r={22} />
          <Sparkle x={320} y={460} r={20} fill={C.teal} />
        </Scene>
      ),
    },
    {
      text: "饼干方方的，\n咬一口，咔嚓！",
      art: () => (
        <Scene bg={C.cream}>
          <Cracker />
          <Sparkle x={250} y={160} r={24} fill={C.orange} />
        </Scene>
      ),
    },
    {
      text: "方方的被子盖好啦。\n晚安，方方。",
      art: () => {
        const colors = [C.yellow, C.teal, C.pink, C.green, C.purple];
        return (
          <Scene bg={C.night}>
            <NightSky stars={NIGHT_STARS} />
            <rect x={300} y={170} width={600} height={210} rx={34} fill={C.brown} {...outline} />
            <circle cx={1040} cy={120} r={60} fill="#FFE7A3" />
            <circle cx={1068} cy={102} r={56} fill={C.night} />
            <ellipse cx={450} cy={318} rx={120} ry={46} fill="#fff" {...outline} strokeWidth={6} />
            <SquareBuddy cx={450} cy={250} size={160} fill={C.blue} mood="sleep" />
            {Array.from({ length: 10 }, (_, i) => {
              const col = i % 5;
              const row = Math.floor(i / 5);
              return <rect key={i} x={330 + col * 108} y={335 + row * 108} width={108} height={108} fill={colors[(i + row * 2) % 5]} stroke={INK} strokeWidth={5} />;
            })}
            <rect x={330} y={335} width={540} height={216} rx={6} fill="none" {...outline} />
            <rect x={310} y={551} width={30} height={50} rx={6} fill={C.brown} {...outline} strokeWidth={6} />
            <rect x={860} y={551} width={30} height={50} rx={6} fill={C.brown} {...outline} strokeWidth={6} />
          </Scene>
        );
      },
    },
  ],
};

// ——————————————————— 形状拼一拼 ———————————————————

function Fish({ fill }: { fill: string }) {
  return (
    <g>
      <polygon points="140,0 260,-90 260,90" fill={fill} {...outline} />
      <polygon points="-60,-100 60,-105 20,-160" fill={fill} {...outline} strokeWidth={7} />
      <ellipse cx={0} cy={0} rx={175} ry={112} fill={fill} {...outline} />
      <path d="M 30 -60 q 30 60 0 120 M 80 -50 q 25 50 0 100" fill="none" stroke={INK} strokeWidth={6} opacity={0.35} strokeLinecap="round" />
      <circle cx={-95} cy={-22} r={26} fill="#fff" {...outline} strokeWidth={6} />
      <circle cx={-100} cy={-20} r={12} fill={INK} />
      <path d="M -150 30 q 20 18 40 0" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
}

const combineBook: LibraryBook = {
  id: "shapes-together",
  title: "形状拼一拼",
  summary: "圆圆、三角和方方手拉手，拼出小房子、小汽车、雪人、小鱼和火箭。",
  stage: "babble",
  ages: [2, 3],
  accent: C.red,
  dedication: "送给爱动手的你：\n拼一拼，想一想，世界由你来创造。",
  cover: () => (
    <Scene bg={C.cream} cover>
      <CircleBuddy cx={320} cy={370} r={135} fill={C.yellow} />
      <TriangleBuddy cx={600} cy={330} size={320} fill={C.green} />
      <SquareBuddy cx={880} cy={370} size={240} fill={C.blue} />
      <Sparkle x={600} y={70} r={34} />
      <Sparkle x={150} y={150} r={24} fill={C.pink} />
      <Sparkle x={1060} y={160} r={26} fill={C.teal} />
    </Scene>
  ),
  pages: [
    {
      text: "圆圆、三角、方方，\n我们来拼一拼！",
      art: () => (
        <Scene bg={C.lav}>
          {[
            [320, 545, 120], [600, 545, 150], [880, 545, 120],
          ].map(([x, y, rx]) => (
            <ellipse key={x} cx={x} cy={y} rx={rx} ry={16} fill={INK} opacity={0.12} />
          ))}
          <CircleBuddy cx={320} cy={340} r={120} fill={C.yellow} mood="wow" />
          <TriangleBuddy cx={600} cy={330} size={300} fill={C.green} />
          <SquareBuddy cx={880} cy={350} size={220} fill={C.blue} mood="wow" />
          <Sparkle x={460} y={120} r={24} />
          <Sparkle x={750} y={110} r={22} fill={C.pink} />
        </Scene>
      ),
    },
    {
      text: "方方加上三角，\n变成了小房子。",
      art: () => (
        <Scene bg={C.sky}>
          <Sun cx={1010} cy={120} r={55} rays={10} />
          <Cloud x={180} y={120} s={0.75} />
          <Ground y={525} fill="#BFE5C5" />
          <rect x={195} y={360} width={30} height={170} rx={8} fill={C.brown} {...outline} strokeWidth={6} />
          <circle cx={210} cy={330} r={90} fill={C.green} {...outline} />
          <rect x={680} y={140} width={46} height={100} fill={C.brown} {...outline} strokeWidth={6} />
          <rect x={460} y={260} width={280} height={280} rx={6} fill={C.yellow} {...outline} />
          <polygon points="420,275 600,115 780,275" fill={C.red} {...outline} strokeWidth={10} />
          <rect x={560} y={420} width={80} height={120} rx={10} fill={C.brown} {...outline} strokeWidth={6} />
          <circle cx={622} cy={482} r={6} fill={INK} />
          {[490, 650].map((x) => (
            <g key={x}>
              <rect x={x} y={310} width={60} height={60} rx={4} fill={C.sky} {...outline} strokeWidth={6} />
              <line x1={x + 30} y1={310} x2={x + 30} y2={370} stroke={INK} strokeWidth={5} />
              <line x1={x} y1={340} x2={x + 60} y2={340} stroke={INK} strokeWidth={5} />
            </g>
          ))}
          {[880, 950, 1040].map((x, i) => (
            <g key={x}>
              <line x1={x} y1={540} x2={x} y2={500} stroke="#5FB27A" strokeWidth={6} />
              <circle cx={x} cy={492} r={14} fill={[C.pink, C.yellow, C.purple][i]} {...outline} strokeWidth={4} />
            </g>
          ))}
        </Scene>
      ),
    },
    {
      text: "长方形加两个圆圆，\n嘀嘀，小汽车开来啦！",
      art: () => (
        <Scene bg={C.mint}>
          <Sun cx={1030} cy={110} r={50} rays={10} />
          <rect x={0} y={500} width={1200} height={130} fill="#9C98A6" />
          {[60, 300, 540, 780, 1020].map((x) => (
            <rect key={x} x={x} y={558} width={120} height={14} rx={7} fill="#fff" />
          ))}
          {[[300, 330], [250, 380], [320, 430]].map(([x, y], i) => (
            <line key={i} x1={x} y1={y} x2={x - 110} y2={y} stroke={INK} strokeWidth={7} strokeLinecap="round" opacity={0.4} />
          ))}
          <rect x={470} y={235} width={260} height={120} rx={34} fill={C.blue} {...outline} />
          <rect x={495} y={258} width={98} height={78} rx={12} fill={C.sky} {...outline} strokeWidth={6} />
          <rect x={608} y={258} width={98} height={78} rx={12} fill={C.sky} {...outline} strokeWidth={6} />
          <rect x={370} y={330} width={460} height={135} rx={32} fill={C.blue} {...outline} />
          <circle cx={810} cy={375} r={16} fill={C.yellow} {...outline} strokeWidth={5} />
          {[490, 710].map((x) => (
            <g key={x}>
              <circle cx={x} cy={470} r={56} fill={INK} />
              <circle cx={x} cy={470} r={24} fill="#E8E4EE" />
            </g>
          ))}
        </Scene>
      ),
    },
    {
      text: "两个圆圆叠起来，\n变成了小雪人。",
      art: () => (
        <Scene bg="#DCEAF7">
          {[[120, 90], [300, 200], [1000, 110], [880, 260], [180, 380], [1080, 380], [760, 80], [420, 70]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 2 ? 9 : 13} fill="#fff" />
          ))}
          <path d="M 0 500 Q 300 450 600 495 T 1200 480 L 1200 630 L 0 630 Z" fill="#fff" />
          <line x1={525} y1={390} x2={410} y2={315} stroke={C.brown} strokeWidth={11} strokeLinecap="round" />
          <line x1={440} y1={335} x2={420} y2={295} stroke={C.brown} strokeWidth={9} strokeLinecap="round" />
          <line x1={675} y1={390} x2={790} y2={315} stroke={C.brown} strokeWidth={11} strokeLinecap="round" />
          <circle cx={600} cy={420} r={125} fill="#fff" {...outline} />
          <circle cx={600} cy={240} r={88} fill="#fff" {...outline} />
          {[375, 425, 475].map((y) => (
            <circle key={y} cx={600} cy={y} r={11} fill={INK} />
          ))}
          <rect x={530} y={308} width={140} height={28} rx={14} fill={C.red} {...outline} strokeWidth={6} />
          <rect x={620} y={320} width={30} height={70} rx={10} fill={C.red} {...outline} strokeWidth={6} />
          <circle cx={573} cy={222} r={9} fill={INK} />
          <circle cx={627} cy={222} r={9} fill={INK} />
          <ellipse cx={555} cy={258} rx={12} ry={7} fill={C.pink} opacity={0.8} />
          <ellipse cx={645} cy={258} rx={12} ry={7} fill={C.pink} opacity={0.8} />
          <polygon points="598,234 598,252 655,243" fill={C.orange} {...outline} strokeWidth={4} />
          <path d="M 582 270 Q 600 284 618 270" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
          <rect x={545} y={95} width={110} height={70} rx={6} fill={INK} />
          <rect x={515} y={158} width={170} height={18} rx={9} fill={INK} />
          <rect x={545} y={140} width={110} height={14} fill={C.red} />
        </Scene>
      ),
    },
    {
      text: "椭圆加三角，\n小鱼游呀游。",
      art: () => (
        <Scene bg="#D4EEF2">
          {[170, 330, 900, 1060].map((x, i) => (
            <path key={x} d={`M ${x} 630 q -30 -60 0 -120 t 0 -120${i % 2 ? "" : " t 0 -90"}`} fill="none" stroke={i % 2 ? "#5FB27A" : C.green} strokeWidth={18} strokeLinecap="round" />
          ))}
          <ellipse cx={600} cy={640} rx={700} ry={60} fill="#F3DDB0" />
          <g transform="translate(580 320)">
            <Fish fill={C.orange} />
          </g>
          <g transform="translate(960 160) scale(-0.42 0.42)">
            <Fish fill={C.purple} />
          </g>
          {[[385, 260, 14], [360, 205, 20], [380, 140, 12]].map(([x, y, r], i) => (
            <Bubble key={i} x={x} y={y} r={r} stroke="#fff" />
          ))}
        </Scene>
      ),
    },
    {
      text: "长方形加三角形，\n火箭飞上天！",
      art: () => (
        <Scene bg={C.night}>
          <NightSky stars={NIGHT_STARS} />
          <circle cx={220} cy={180} r={62} fill={C.purple} {...outline} strokeWidth={6} />
          <ellipse cx={220} cy={180} rx={105} ry={22} fill="none" stroke={C.yellow} strokeWidth={8} transform="rotate(-15 220 180)" />
          <path d="M 560 455 Q 600 640 640 455 Z" fill={C.orange} />
          <path d="M 578 455 Q 600 570 622 455 Z" fill={C.yellow} />
          <polygon points="530,350 530,455 455,480" fill={C.red} {...outline} />
          <polygon points="670,350 670,455 745,480" fill={C.red} {...outline} />
          <rect x={530} y={175} width={140} height={285} rx={40} fill="#fff" {...outline} />
          <polygon points="527,200 673,200 600,70" fill={C.red} {...outline} strokeWidth={10} />
          <circle cx={600} cy={270} r={38} fill={C.sky} {...outline} strokeWidth={8} />
          <circle cx={590} cy={260} r={9} fill="#fff" />
        </Scene>
      ),
    },
    {
      text: "你还能拼出什么呢？",
      art: () => (
        <Scene bg={C.cream}>
          <circle cx={190} cy={140} r={50} fill={C.red} {...outline} />
          <polygon points="420,70 360,180 480,180" fill={C.teal} {...outline} />
          <rect x={600} y={80} width={110} height={110} rx={8} fill={C.yellow} {...outline} transform="rotate(12 655 135)" />
          <ellipse cx={900} cy={140} rx={80} ry={48} fill={C.purple} {...outline} />
          <rect x={1020} y={250} width={130} height={70} rx={10} fill={C.pink} {...outline} transform="rotate(-10 1085 285)" />
          <Star x={120} y={330} r={44} fill={C.orange} stroke />
          <path d="M 330 300 A 60 60 0 0 1 450 300 Z" fill={C.green} {...outline} />
          <polygon points="820,290 870,250 920,290 900,350 840,350" fill={C.blue} {...outline} />
          <CircleBuddy cx={360} cy={520} r={70} fill={C.yellow} mood="wow" />
          <TriangleBuddy cx={600} cy={505} size={160} fill={C.green} mood="wow" />
          <SquareBuddy cx={840} cy={515} size={125} fill={C.blue} mood="wow" />
        </Scene>
      ),
    },
  ],
};

export const GEOMETRY_BOOKS = [circleBook, triangleBook, squareBook, combineBook];
