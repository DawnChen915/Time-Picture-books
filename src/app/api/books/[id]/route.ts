import { NextResponse } from "next/server";
import { publicFamily } from "@/lib/publicFamily";
import { loadBook, loadFamily } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await loadBook(id).catch(() => null);
  const family = book && (await loadFamily(book.familyId));
  if (!book || !family) return NextResponse.json({ error: "找不到这本绘本" }, { status: 404 });
  return NextResponse.json({ book, family: publicFamily(family) });
}
