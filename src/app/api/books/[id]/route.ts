import { NextResponse } from "next/server";
import { loadBook } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await loadBook(id).catch(() => null);
  if (!book) return NextResponse.json({ error: "找不到这本绘本" }, { status: 404 });
  return NextResponse.json(book);
}
