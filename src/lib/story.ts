import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { ART_STYLES, type BookInput } from "./types";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";

const StorySchema = z.object({
  title: z.string().describe("绘本标题，中文，简短有童趣"),
  dedication: z.string().describe("扉页上的一句献词，中文，写给孩子"),
  characterSheet: z
    .string()
    .describe(
      "English visual description of the main character, used verbatim in every illustration prompt to keep them consistent: age, hair, skin tone, face, outfit, distinctive items",
    ),
  coverPrompt: z.string().describe("English illustration prompt for the cover: the main character in a scene that sums up the story, no text in the image"),
  pages: z
    .array(
      z.object({
        text: z.string().describe("这一页的故事文字，中文"),
        illustrationPrompt: z
          .string()
          .describe("English prompt describing only this page's scene: setting, action, mood, composition. No text in the image."),
      }),
    )
    .describe("故事的每一页，按顺序"),
});

export type GeneratedStory = z.infer<typeof StorySchema>;

const GENDER = { boy: "男孩", girl: "女孩", unspecified: "不指定性别" } as const;

function textLengthHint(age: number) {
  if (age <= 3) return "每页 1-2 句，15-30 个字，多用重复和拟声词";
  if (age <= 6) return "每页 2-4 句，30-70 个字";
  return "每页 3-5 句，60-120 个字";
}

const SYSTEM = `你是一位资深的儿童绘本作家，为家长定制以他们孩子为主角的绘本。
写作要求：
- 主角就是这个孩子，用孩子的名字称呼。故事温暖、积极、有起承转合，结尾给孩子一点力量或温柔的余味。
- 语言适合孩子的年龄，句子有节奏感，适合大声朗读。不要说教。
- 内容必须适合儿童，不出现暴力、恐怖或不安全的情节。
- 插图提示词用英文写，只描述画面，不要在画面里出现任何文字。每页的插图提示词只写这一页的场景，角色外貌统一写在 characterSheet 里，系统会自动拼接。`;

export async function generateStory(input: BookInput): Promise<GeneratedStory> {
  if (process.env.STORY_PROVIDER === "mock") return mockStory(input);
  const client = new Anthropic();

  const brief = [
    `孩子名字：${input.childName}`,
    `年龄：${input.age} 岁`,
    `性别：${GENDER[input.gender]}`,
    input.appearance && `外貌特征：${input.appearance}`,
    input.interests && `喜欢的东西：${input.interests}`,
    `故事主题 / 想传达的内容：${input.theme}`,
    `画风：${ART_STYLES[input.artStyle].label}`,
    input.extra && `其他要求：${input.extra}`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaZodOutputFormat(StorySchema) },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `请为下面这个孩子写一本 ${input.pageCount} 页的绘本（pages 数组必须正好 ${input.pageCount} 项，不含封面）。文字长度：${textLengthHint(input.age)}。\n\n${brief}`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("故事生成被拒绝了，请调整一下主题或描述再试试。");
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("故事太长被截断了，请重试。");
  }
  const story = response.parsed_output;
  if (!story) throw new Error("没能解析生成的故事，请重试。");

  if (story.pages.length < 6 || story.pages.length > 8) {
    throw new Error(`生成的页数不对（${story.pages.length} 页），请重试。`);
  }
  return story;
}

/** Fixed sample story for trying the UI without an Anthropic API key (STORY_PROVIDER=mock). */
function mockStory(input: BookInput): GeneratedStory {
  const name = input.childName;
  return {
    title: `${name}的奇妙一天`,
    dedication: `愿${name}永远好奇，永远勇敢。`,
    characterSheet: `a ${input.age}-year-old child named ${name}, ${input.appearance || "short black hair, round face, yellow raincoat"}`,
    coverPrompt: `${name} standing in a sunny meadow, looking up at the sky with wonder`,
    pages: Array.from({ length: input.pageCount }, (_, i) => ({
      text: `第 ${i + 1} 页：${name}推开门，发现今天的世界有一点不一样。风轻轻地说：“跟我来吧！”`,
      illustrationPrompt: `${name} on adventure step ${i + 1}, following a playful breeze through the town`,
    })),
  };
}
