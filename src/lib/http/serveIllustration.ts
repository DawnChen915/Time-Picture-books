import { NextResponse } from "next/server";
import { IllustrationBusyError } from "@/lib/illustrate";
import { readAsset } from "@/lib/storage";
import type { Illustration } from "@/lib/types";

export async function serveIllustration(kind: "books" | "families", id: string, ill: Illustration | undefined | null) {
  if (!ill || ill.status !== "done" || !ill.file) return new NextResponse("not found", { status: 404 });
  const data = await readAsset(kind, id, ill.file);
  return new NextResponse(new Uint8Array(data), {
    headers: { "Content-Type": ill.mimeType ?? "application/octet-stream", "Cache-Control": "private, max-age=31536000, immutable" },
  });
}

export async function runDraw(fn: () => Promise<Illustration>) {
  try {
    return NextResponse.json(await fn());
  } catch (err) {
    if (err instanceof IllustrationBusyError) return NextResponse.json({ error: err.message }, { status: 409 });
    return NextResponse.json({ error: err instanceof Error ? err.message : "插图生成失败" }, { status: 500 });
  }
}
