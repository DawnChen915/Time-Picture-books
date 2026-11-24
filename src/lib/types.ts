import { z } from "zod";

export const ART_STYLES = {
  watercolor: { label: "温柔水彩", prompt: "soft watercolor children's picture book illustration, gentle textures, warm pastel palette" },
  crayon: { label: "童趣蜡笔", prompt: "hand-drawn crayon and colored pencil children's book illustration, playful strokes, bright colors" },
  flat: { label: "扁平插画", prompt: "modern flat vector children's book illustration, clean shapes, cheerful limited palette" },
  cartoon3d: { label: "3D 卡通", prompt: "cute 3D cartoon render for a children's book, soft lighting, rounded shapes, vibrant colors" },
} as const;

export type ArtStyle = keyof typeof ART_STYLES;

export const BookInputSchema = z.object({
  childName: z.string().trim().min(1, "请填写孩子的名字").max(20),
  age: z.coerce.number().int().min(1).max(12),
  gender: z.enum(["boy", "girl", "unspecified"]),
  appearance: z.string().trim().max(200).default(""),
  interests: z.string().trim().max(200).default(""),
  theme: z.string().trim().min(1, "请写一下故事主题").max(300),
  artStyle: z.enum(Object.keys(ART_STYLES) as [ArtStyle, ...ArtStyle[]]),
  pageCount: z.coerce.number().int().min(6).max(8),
  extra: z.string().trim().max(300).default(""),
});

export type BookInput = z.infer<typeof BookInputSchema>;

export type IllustrationStatus = "pending" | "generating" | "done" | "error";

export interface Illustration {
  status: IllustrationStatus;
  prompt: string;
  file?: string;
  mimeType?: string;
  error?: string;
  startedAt?: string;
}

export interface BookPage {
  text: string;
  illustration: Illustration;
}

export interface Book {
  id: string;
  createdAt: string;
  input: BookInput;
  title: string;
  dedication: string;
  characterSheet: string;
  /** slot 0 = cover */
  cover: Illustration;
  pages: BookPage[];
}

/** Slot 0 is the cover, slot n (1..pages.length) is page n. */
export function getSlot(book: Book, slot: number): Illustration | undefined {
  if (slot === 0) return book.cover;
  return book.pages[slot - 1]?.illustration;
}
