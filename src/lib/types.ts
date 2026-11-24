import { z } from "zod";
import type { Role } from "@/templates";

export type IllustrationStatus = "pending" | "generating" | "done" | "error";

export interface Illustration {
  status: IllustrationStatus;
  prompt: string;
  file?: string;
  mimeType?: string;
  error?: string;
  startedAt?: string;
  /** Which attempt is running while the server retries a failed generation (1-based). */
  attempt?: number;
  /** Why the previous attempt failed, shown while the next one runs. */
  retryReason?: string;
}

export interface Member {
  role: Role;
  /** Uploaded photo, deleted once the avatar is drawn. */
  photoFile?: string;
  photoMimeType?: string;
  /**
   * The avatar being replaced, kept until the new one is drawn. When there is no new photo it is
   * used as the reference, so the character can be tweaked by description ("short hair now").
   */
  baseAvatarFile?: string;
  baseAvatarMimeType?: string;
  /** Optional text description, used when there is no photo or alongside it. */
  description: string;
  avatar: Illustration;
}

/** A family keeps its members' cartoon avatars so later books can reuse them. */
export interface Family {
  id: string;
  createdAt: string;
  updatedAt?: string;
  childName: string;
  childAge: number;
  childGender: "boy" | "girl" | "unspecified";
  members: Partial<Record<Role, Member>>;
}

export interface BookPage {
  text: string;
  cast: Role[];
  illustration: Illustration;
}

export interface Book {
  id: string;
  createdAt: string;
  familyId: string;
  templateId: string;
  childName: string;
  /** The child's age when the book was made, so the bookshelf can show it as a timeline. */
  childAge?: number;
  title: string;
  dedication: string;
  cast: Role[];
  cover: Illustration;
  pages: BookPage[];
}

/** What the bookshelf shows for each book. */
export interface BookSummary {
  id: string;
  title: string;
  templateId: string;
  createdAt: string;
  childName: string;
  childAge: number;
  coverFile?: string;
  done: number;
  total: number;
  failed: number;
}

/** Slot 0 is the cover, slot n (1..pages.length) is page n. */
export function getSlot(book: Book, slot: number): Illustration | undefined {
  if (slot === 0) return book.cover;
  return book.pages[slot - 1]?.illustration;
}

export const ChildInfoSchema = z.object({
  childName: z.string().trim().min(1, "请填写宝宝的名字").max(20),
  childAge: z.coerce.number().int().min(0).max(12),
  childGender: z.enum(["boy", "girl", "unspecified"]),
});
