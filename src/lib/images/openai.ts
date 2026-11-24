import OpenAI, { toFile } from "openai";
import type { ImageProvider } from "./index";

const MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2";
const QUALITY = (process.env.OPENAI_IMAGE_QUALITY ?? "medium") as "low" | "medium" | "high";
const SIZE = "1536x1024"; // landscape spread

export const openaiProvider: ImageProvider = {
  name: "openai",
  async generate({ prompt, references }) {
    const client = new OpenAI();
    const common = {
      model: MODEL,
      prompt,
      size: SIZE,
      quality: QUALITY,
      output_format: "jpeg" as const,
      output_compression: 90,
      n: 1,
    };

    const result = references?.length
      ? await client.images.edit({
          ...common,
          // Reference images keep the main character looking the same on every page.
          image: await Promise.all(
            references.map((r, i) => toFile(r.data, `reference-${i}.${r.mimeType.split("/")[1] ?? "png"}`, { type: r.mimeType })),
          ),
          input_fidelity: "high",
        })
      : await client.images.generate(common);

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error("图像服务没有返回图片");
    return { data: Buffer.from(b64, "base64"), mimeType: "image/jpeg", ext: "jpg" };
  },
};
