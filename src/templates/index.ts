/**
 * Fixed story templates. Text is final copy with `{name}` replaced by the child's name;
 * only the illustrations are generated, using each family member's cartoon avatar as a reference.
 *
 * Scene prompts refer to characters as CHILD / MOM / DAD. List every character that appears
 * in `cast` so their avatar is passed to the image model.
 */

import type { StageId } from "@/lib/stages";

export type Role = "child" | "mom" | "dad";

export const ROLE_LABEL: Record<Role, string> = { child: "宝宝", mom: "妈妈", dad: "爸爸" };
export const ROLE_TOKEN: Record<Role, string> = { child: "CHILD", mom: "MOM", dad: "DAD" };

export interface TemplatePage {
  text: string;
  scene: string;
  cast: Role[];
}

export interface StoryTemplate {
  id: string;
  title: string;
  summary: string;
  /** Which "时光" shelf the story sits on, and the ages it is written for. */
  stage: StageId;
  ages: [number, number];
  cast: Role[];
  cover: { scene: string };
  dedication: string;
  pages: TemplatePage[];
}

export const HOUSE_STYLE =
  "soft watercolor children's picture book illustration, gentle paper texture, warm pastel palette, rounded friendly shapes, cozy lighting";

export const TEMPLATES: StoryTemplate[] = [
  {
    id: "brave-feet",
    title: "{name}的勇敢小脚丫",
    summary: "第一次挑战高高的滑梯，学会害怕的时候也愿意试一试。",
    stage: "curious",
    ages: [3, 5],
    cast: ["child"],
    dedication: "愿{name}永远有试一试的勇气。",
    cover: { scene: "CHILD standing on top of a small green hill in a park at sunrise, arms raised happily, a little squirrel nearby" },
    pages: [
      {
        text: "早上，{name}穿上最喜欢的小鞋子，站在门口说：“今天，我要去探险！”",
        scene: "CHILD at the open front door of a cozy house in morning sunlight, proudly pointing outside, excited expression",
        cast: ["child"],
      },
      {
        text: "公园里的大滑梯好高好高。{name}的心怦怦跳：“我能行吗？”",
        scene: "CHILD standing at the bottom of a very tall colorful playground slide, looking up, a little nervous, hands clasped",
        cast: ["child"],
      },
      {
        text: "一只小松鼠跳上树枝，歪着头说：“别着急，一步一步来呀。”",
        scene: "a friendly squirrel on a tree branch tilting its head and talking to CHILD, who listens curiously, park background",
        cast: ["child"],
      },
      {
        text: "{name}深吸一口气，一级、两级、三级……终于爬到了最高处。",
        scene: "CHILD climbing the ladder of the tall slide with a determined face, squirrel cheering from a nearby branch",
        cast: ["child"],
      },
      {
        text: "“呼——”{name}滑了下来！风在耳边唱歌，笑声飞上了天空。",
        scene: "CHILD sliding down the tall slide laughing joyfully, hair blowing in the wind, leaves swirling around",
        cast: ["child"],
      },
      {
        text: "原来，勇敢不是不害怕，而是害怕的时候也愿意试一试。{name}的小脚丫，今天走了好远好远。",
        scene: "CHILD walking home along a park path at golden sunset holding a big autumn leaf, squirrel waving goodbye from a tree",
        cast: ["child"],
      },
    ],
  },
  {
    id: "mom-magic-hug",
    title: "妈妈的魔法拥抱",
    summary: "{name}发现妈妈的拥抱有魔法，有一天也把魔法送给了妈妈。",
    stage: "babble",
    ages: [2, 4],
    cast: ["child", "mom"],
    dedication: "送给{name}和妈妈：每一个拥抱，都是魔法。",
    cover: { scene: "MOM and CHILD hugging warmly, soft glowing sparkles floating around them, cozy home background" },
    pages: [
      {
        text: "{name}有一个小秘密：妈妈的拥抱，是有魔法的。",
        scene: "MOM hugging CHILD in a cozy living room with warm lamp light, CHILD smiling with eyes closed",
        cast: ["child", "mom"],
      },
      {
        text: "摔倒的时候，妈妈抱一抱，膝盖就没那么疼了。",
        scene: "CHILD sitting on the grass in a park with a small scrape on the knee, MOM kneeling down and hugging CHILD gently",
        cast: ["child", "mom"],
      },
      {
        text: "打雷的夜里，妈妈抱一抱，乌云就没那么可怕了。",
        scene: "bedroom at night with rain and lightning outside the window, MOM sitting on the bed holding CHILD under a soft blanket",
        cast: ["child", "mom"],
      },
      {
        text: "可是有一天，妈妈累坏了，坐在沙发上，一句话也不想说。",
        scene: "MOM looking tired on the sofa in the evening, CHILD peeking from the doorway with a worried face",
        cast: ["child", "mom"],
      },
      {
        text: "{name}想了想，踮起脚尖，张开了小小的手臂……",
        scene: "CHILD tiptoeing toward MOM on the sofa with arms wide open, MOM not yet noticing",
        cast: ["child", "mom"],
      },
      {
        text: "“妈妈，我把魔法还给你！”{name}紧紧地抱住了妈妈。",
        scene: "CHILD hugging MOM tightly on the sofa, MOM surprised and deeply touched, little sparkles appearing",
        cast: ["child", "mom"],
      },
      {
        text: "妈妈笑了：“原来，你的拥抱也有魔法。”从那天起，家里有了两个魔法师。",
        scene: "MOM and CHILD laughing together, wrapped in swirling golden sparkles, night window with stars behind them",
        cast: ["child", "mom"],
      },
    ],
  },
  {
    id: "family-beach",
    title: "我们一家去海边",
    summary: "全家去海边堆沙堡，被海浪冲塌后，一起盖了一座和海浪做朋友的城堡。",
    stage: "curious",
    ages: [3, 6],
    cast: ["child", "mom", "dad"],
    dedication: "给{name}、爸爸和妈妈：最好的风景，是我们在一起。",
    cover: { scene: "DAD, MOM and CHILD running happily along the shoreline holding hands, waves and seagulls, bright summer day" },
    pages: [
      {
        text: "周末到啦！爸爸背上大包，妈妈戴上草帽，{name}抱着小水桶：“出发去海边！”",
        scene: "DAD with a big backpack, MOM in a straw hat, and CHILD hugging a little bucket, leaving home cheerfully with beach gear",
        cast: ["child", "mom", "dad"],
      },
      {
        text: "海风咸咸的，沙子暖暖的。{name}的脚丫踩出一串小小的脚印。",
        scene: "CHILD walking barefoot on warm sand leaving tiny footprints, DAD and MOM following behind smiling, blue sea",
        cast: ["child", "mom", "dad"],
      },
      {
        text: "爸爸说：“我们来堆一座最大最大的沙堡吧！”",
        scene: "DAD and CHILD building a big sandcastle together, MOM sitting nearby taking a photo with a phone",
        cast: ["child", "mom", "dad"],
      },
      {
        text: "“哗啦——”一个大浪冲过来，沙堡塌了一半。{name}的小嘴巴扁扁的。",
        scene: "a wave washing away half of the sandcastle, CHILD pouting sadly, DAD looking surprised",
        cast: ["child", "dad"],
      },
      {
        text: "妈妈蹲下来说：“那我们就盖一座会和海浪做朋友的城堡。”",
        scene: "MOM kneeling beside CHILD, comforting and pointing at seashells on the sand, gentle expression",
        cast: ["child", "mom"],
      },
      {
        text: "一家三口捡贝壳、挖小河，让海水乖乖地流进城堡的护城河。",
        scene: "DAD, MOM and CHILD digging a moat together, seawater flowing into it, the sandcastle decorated with shells",
        cast: ["child", "mom", "dad"],
      },
      {
        text: "太阳慢慢落进大海，天空变成了橘子色。{name}坐在爸爸妈妈中间。",
        scene: "view from behind of DAD, CHILD and MOM sitting together on the beach at an orange sunset, CHILD in the middle",
        cast: ["child", "mom", "dad"],
      },
      {
        text: "回家的路上，{name}在爸爸背上睡着了，梦里还有海浪轻轻地唱歌。",
        scene: "DAD carrying sleeping CHILD on his back, MOM walking beside them on a starry evening path, a small dream bubble with waves",
        cast: ["child", "mom", "dad"],
      },
    ],
  },
];

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id);
}

export function fillName(text: string, name: string) {
  return text.replaceAll("{name}", name);
}
