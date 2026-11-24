import { NextResponse } from "next/server";
import { drawBookSlot } from "@/lib/illustrate";
import { runDraw, serveIllustration } from "@/lib/http/serveIllustration";
import { loadBook } from "@/lib/storage";
import { getSlot } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

type Ctx = { params: Promise<{ id: string; slot: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id, slot } = await params;
  const book = await loadBook(id).catch(() => null);
  return serveIllustration("books", id, book && getSlot(book, Number(slot)));
}

/** Draw the cover (slot 0) or page n. */
export async function POST(_req: Request, { params }: Ctx) {
  const { id, slot } = await params;
  const n = Number(slot);
  if (!Number.isInteger(n) || n < 0) return NextResponse.json({ error: "无效的页码" }, { status: 400 });
  return runDraw(() => drawBookSlot(id, n));
}
