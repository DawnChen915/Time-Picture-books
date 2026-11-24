import { NextResponse } from "next/server";
import { publicFamily } from "@/lib/publicFamily";
import { loadFamily } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const family = await loadFamily(id).catch(() => null);
  if (!family) return NextResponse.json({ error: "找不到" }, { status: 404 });
  return NextResponse.json(publicFamily(family));
}
