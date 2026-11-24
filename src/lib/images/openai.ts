import OpenAI, { APIConnectionError, APIConnectionTimeoutError, AuthenticationError, toFile } from "openai";
import { ProxyAgent } from "undici";
import { ImageError } from "./errors";
import type { ImageProvider } from "./index";

const MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2";
const QUALITY = (process.env.OPENAI_IMAGE_QUALITY ?? "medium") as "low" | "medium" | "high";
// One image can take 1-2 minutes; fail loudly instead of hanging for the SDK's 10-minute default.
export const TIMEOUT_MS = Number(process.env.OPENAI_TIMEOUT_MS ?? 240_000);

export function proxyUrl() {
  return process.env.OPENAI_PROXY || process.env.HTTPS_PROXY || process.env.https_proxy || process.env.ALL_PROXY || process.env.all_proxy;
}

/** Node's fetch ignores system proxy settings, so route through the proxy explicitly when one is set. */
export function createOpenAIClient() {
  const proxy = proxyUrl();
  return new OpenAI({
    timeout: TIMEOUT_MS,
    // Retries are handled in generateImage so every provider gets the same behaviour and logging.
    maxRetries: 0,
    ...(proxy
      ? {
          // Node's built-in fetch accepts an undici dispatcher.
          fetchOptions: { dispatcher: new ProxyAgent(proxy) } as Record<string, unknown>,
        }
      : {}),
  });
}

/** Turn SDK errors into messages a person can act on, and say whether trying again could help. */
export function explainOpenAIError(err: unknown): Error {
  if (err instanceof APIConnectionTimeoutError) {
    return new ImageError(`连接 OpenAI 超时（${Math.round(TIMEOUT_MS / 1000)} 秒）。如果在国内，请在 .env.local 里设置 HTTPS_PROXY 指向你的代理。`, true);
  }
  if (err instanceof APIConnectionError) {
    return new ImageError(`连不上 OpenAI${proxyUrl() ? "，请检查代理是否可用" : "。如果在国内，请在 .env.local 里设置 HTTPS_PROXY 指向你的代理"}。`, true);
  }
  if (err instanceof AuthenticationError) return new ImageError("OpenAI key 无效，请检查 .env.local 里的 OPENAI_API_KEY。", false);
  if (err instanceof OpenAI.APIError) {
    const status = err.status ?? 0;
    // Out of credit also comes back as 429, but waiting won't fix it.
    const noQuota = err.code === "insufficient_quota";
    if (noQuota) return new ImageError("OpenAI 账户额度用完了，请到 OpenAI 后台充值后再试。", false);
    // The safety system sometimes rejects a prompt or reference; a fresh attempt often passes.
    const moderation = err.code === "moderation_blocked" || /safety system/i.test(err.message);
    const retryable = moderation || status === 408 || status === 409 || status === 429 || status >= 500;
    return new ImageError(`OpenAI 返回错误（${status}）：${err.message}`, retryable);
  }
  return err instanceof Error ? err : new Error(String(err));
}

export const openaiProvider: ImageProvider = {
  name: "openai",
  async generate({ prompt, references, orientation = "landscape" }) {
    const client = createOpenAIClient();
    const common = {
      model: MODEL,
      prompt,
      size: orientation === "portrait" ? "1024x1536" : "1536x1024",
      quality: QUALITY,
      output_format: "jpeg" as const,
      output_compression: 90,
      n: 1,
    };

    try {
      const result = references?.length
        ? await client.images.edit({
            ...common,
            // Reference images keep the characters looking the same on every page.
            image: await Promise.all(
              references.map((r, i) => toFile(r.data, `reference-${i}.${r.mimeType.split("/")[1] ?? "png"}`, { type: r.mimeType })),
            ),
            // gpt-image-2 always uses high fidelity and rejects this parameter; only gpt-image-1.x accepts it.
            ...(MODEL.startsWith("gpt-image-1") ? { input_fidelity: "high" as const } : {}),
          })
        : await client.images.generate(common);

      const b64 = result.data?.[0]?.b64_json;
      if (!b64) throw new ImageError("图像服务没有返回图片", true);
      return { data: Buffer.from(b64, "base64"), mimeType: "image/jpeg", ext: "jpg" };
    } catch (err) {
      throw err instanceof ImageError ? err : explainOpenAIError(err);
    }
  },
};
