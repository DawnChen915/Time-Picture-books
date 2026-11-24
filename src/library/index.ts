/**
 * Ready-made books that need no characters: free to read, no image generation. Illustrations are
 * drawn in SVG (see art.tsx), so they stay crisp in the PDF and cost nothing.
 */
import type { ComponentType } from "react";
import type { StageId } from "@/lib/stages";
import { GEOMETRY_BOOKS } from "./geometry";

export interface LibraryBook {
  id: string;
  title: string;
  summary: string;
  stage: StageId;
  ages: [number, number];
  /** Card colour on the catalog. */
  accent: string;
  /** Shown on the last page. Use \n for line breaks. */
  dedication: string;
  cover: ComponentType;
  /** Keep text to one or two short lines; \n starts a new line. */
  pages: { text: string; art: ComponentType }[];
}

export const LIBRARY: LibraryBook[] = [...GEOMETRY_BOOKS];

export function getLibraryBook(id: string) {
  return LIBRARY.find((b) => b.id === id);
}
