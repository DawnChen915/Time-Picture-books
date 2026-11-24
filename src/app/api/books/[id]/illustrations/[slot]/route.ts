import { NextResponse } from "next/server";
import { IllustrationBusyError, illustrateSlot } from "@/lib/illustrate";
import { loadBook, readAsset } from "@/lib/storage";
import { getSlot } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

type Ctx = { params: Promise<{ id: string; slot: string }> };

/** Serve the stored illustration image. */
export async function GET(_req: Request, { params }: Ctx) {
  const { id, slot } = await params;
  const book = await loadBook(id).catch(() => null);
  const ill = book && getSlot(book, Number(slot));
  if (!ill || ill.status !== "done" || !ill.file) return new NextResponse("not found", { status: 404 });
  const data = await readAsset(id, ill.file);
  return new NextResponse(new Uint8Array(data), {
    headers: { "Content-Type": ill.mimeType ?? "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}

/** Generate the illustration for this slot (0 = cover). */
export async function POST(_req: Request, { params }: Ctx) {
  const { id, slot } = await params;
  const n = Number(slot);
  if (!Number.isInteger(n) || n < 0) return NextResponse.json({ error: "无效的页码" }, { status: 400 });
  try {
    const ill = await illustrateSlot(id, n);
    return NextResponse.json(ill);
  } catch (err) {
    if (err instanceof IllustrationBusyError) return NextResponse.json({ error: err.message }, { status: 409 });
    const message = err instanceof Error ? err.message : "插图生成失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
