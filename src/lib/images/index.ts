import { openaiProvider } from "./openai";
import { placeholderProvider } from "./placeholder";

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

/**
 * Pick the image backend. Set IMAGE_PROVIDER=placeholder to develop without an
 * image API key; it is also used automatically when OPENAI_API_KEY is missing.
 */
export function getImageProvider(): ImageProvider {
  const choice = process.env.IMAGE_PROVIDER ?? (process.env.OPENAI_API_KEY ? "openai" : "placeholder");
  return choice === "openai" ? openaiProvider : placeholderProvider;
}

/** Generate with server-side logging, so `npm run dev` output shows what is happening. */
export async function generateImage(label: string, req: ImageRequest): Promise<GeneratedImage> {
  const provider = getImageProvider();
  const refs = req.references?.length ?? 0;
  const started = Date.now();
  console.log(`[images] ${label}: start (provider=${provider.name}, references=${refs})`);
  try {
    const image = await provider.generate(req);
    console.log(`[images] ${label}: done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
    return image;
  } catch (err) {
    console.error(`[images] ${label}: failed after ${((Date.now() - started) / 1000).toFixed(1)}s:`, err instanceof Error ? err.message : err);
    throw err;
  }
}
