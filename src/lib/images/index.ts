import { openaiProvider, TIMEOUT_MS } from "./openai";
import { placeholderProvider } from "./placeholder";
import { ImageError } from "./errors";

export { ImageError };

export interface GeneratedImage {
  data: Buffer;
  mimeType: string;
  ext: string;
}

export interface ImageRequest {
  prompt: string;
  /** Earlier illustrations (e.g. the cover) to keep the character consistent. */
  references?: { data: Buffer; mimeType: string }[];
  /** Page illustrations are landscape; avatars are portrait. Defaults to landscape. */
  orientation?: "landscape" | "portrait";
}

export interface ImageProvider {
  name: string;
  generate(req: ImageRequest): Promise<GeneratedImage>;
}

/** How many times one image is attempted before it is marked as failed. */
export const MAX_ATTEMPTS = Math.max(1, Number(process.env.IMAGE_MAX_ATTEMPTS ?? 3));
const BACKOFF_MS = [3_000, 10_000, 20_000];

/** Longest one generateImage call can take, used to tell a stuck job from a slow one. */
export const MAX_GENERATION_MS = MAX_ATTEMPTS * TIMEOUT_MS + BACKOFF_MS.slice(0, MAX_ATTEMPTS - 1).reduce((a, b) => a + b, 0) + 60_000;

/**
 * Pick the image backend. Set IMAGE_PROVIDER=placeholder to develop without an
 * image API key; it is also used automatically when OPENAI_API_KEY is missing.
 */
export function getImageProvider(): ImageProvider {
  const choice = process.env.IMAGE_PROVIDER ?? (process.env.OPENAI_API_KEY ? "openai" : "placeholder");
  return choice === "openai" ? openaiProvider : placeholderProvider;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Generate with automatic retries for temporary failures (timeouts, network errors, rate limits,
 * server errors). Errors that won't go away on their own, such as a bad key or an invalid
 * parameter, fail immediately. `onRetry` lets the caller show "retrying (2/3)" in the UI.
 */
export async function generateImage(
  label: string,
  req: ImageRequest,
  onRetry?: (nextAttempt: number, error: Error) => Promise<void> | void,
): Promise<GeneratedImage> {
  const provider = getImageProvider();
  const refs = req.references?.length ?? 0;
  for (let attempt = 1; ; attempt++) {
    const started = Date.now();
    console.log(`[images] ${label}: start attempt ${attempt}/${MAX_ATTEMPTS} (provider=${provider.name}, references=${refs})`);
    try {
      const image = await provider.generate(req);
      console.log(`[images] ${label}: done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
      return image;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const retryable = !(error instanceof ImageError) || error.retryable;
      const secs = ((Date.now() - started) / 1000).toFixed(1);
      console.error(`[images] ${label}: attempt ${attempt} failed after ${secs}s${retryable ? "" : " (not retryable)"}:`, error.message);
      if (!retryable || attempt >= MAX_ATTEMPTS) throw error;
      await onRetry?.(attempt + 1, error);
      await sleep(BACKOFF_MS[attempt - 1] ?? 20_000);
    }
  }
}
