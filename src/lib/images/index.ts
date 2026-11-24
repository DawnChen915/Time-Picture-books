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
