import { getImageProvider } from "./images";
import { readAsset, saveAsset, updateBook, loadBook } from "./storage";
import { ART_STYLES, getSlot, type Book, type Illustration } from "./types";

const STALE_MS = 5 * 60 * 1000;

export function buildImagePrompt(book: Book, scene: string) {
  return [
    `Style: ${ART_STYLES[book.input.artStyle].prompt}.`,
    `Main character (keep identical in every illustration): ${book.characterSheet}`,
    `Scene: ${scene}`,
    "Absolutely no text, letters, words or captions anywhere in the image.",
  ].join("\n");
}

export class IllustrationBusyError extends Error {}

/** Generate (or return the existing) illustration for one slot. Slot 0 is the cover. */
export async function illustrateSlot(bookId: string, slot: number): Promise<Illustration> {
  let current: Illustration | undefined;
  let skip = false;
  const claimed = await updateBook(bookId, (book) => {
    const ill = getSlot(book, slot);
    if (!ill) throw new Error("没有这一页");
    const busy = ill.status === "generating" && ill.startedAt && Date.now() - Date.parse(ill.startedAt) < STALE_MS;
    if (ill.status === "done" || busy) {
      skip = true;
      current = ill;
      return;
    }
    ill.status = "generating";
    ill.startedAt = new Date().toISOString();
    ill.error = undefined;
  });
  if (skip) {
    if (current?.status === "generating") throw new IllustrationBusyError("这一页正在画");
    return current!;
  }

  const target = getSlot(claimed, slot)!;
  try {
    const provider = getImageProvider();
    // Use the finished cover as a reference so every page shows the same child.
    const references: { data: Buffer; mimeType: string }[] = [];
    if (slot !== 0 && claimed.cover.status === "done" && claimed.cover.file && claimed.cover.mimeType !== "image/svg+xml") {
      references.push({ data: await readAsset(bookId, claimed.cover.file), mimeType: claimed.cover.mimeType! });
    }
    const image = await provider.generate({ prompt: buildImagePrompt(claimed, target.prompt), references });
    const file = `slot-${slot}-${Date.now()}.${image.ext}`;
    await saveAsset(bookId, file, image.data);
    const book = await updateBook(bookId, (b) => {
      const ill = getSlot(b, slot)!;
      ill.status = "done";
      ill.file = file;
      ill.mimeType = image.mimeType;
    });
    return getSlot(book, slot)!;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`illustration failed for ${bookId}#${slot}:`, err);
    await updateBook(bookId, (b) => {
      const ill = getSlot(b, slot)!;
      ill.status = "error";
      ill.error = message;
    });
    throw err;
  }
}

export { loadBook };
