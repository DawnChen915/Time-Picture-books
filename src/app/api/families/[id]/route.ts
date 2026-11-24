import { NextResponse } from "next/server";
import { publicFamily } from "@/lib/publicFamily";
import { loadFamily, updateFamily } from "@/lib/storage";
import { ChildInfoSchema } from "@/lib/types";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const family = await loadFamily(id).catch(() => null);
  if (!family) return NextResponse.json({ error: "找不到" }, { status: 404 });
  return NextResponse.json(publicFamily(family));
}

/**
 * Update the child's name, age and gender. Avatars are left alone: redrawing costs money,
 * so the family decides when a new look is worth it (PUT .../members/:role).
 */
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const info = ChildInfoSchema.safeParse((await req.json().catch(() => null)) ?? {});
  if (!info.success) return NextResponse.json({ error: info.error.issues[0]?.message ?? "宝宝信息有误" }, { status: 400 });
  try {
    const family = await updateFamily(id, (f) => {
      Object.assign(f, info.data);
      f.updatedAt = new Date().toISOString();
    });
    return NextResponse.json(publicFamily(family));
  } catch {
    return NextResponse.json({ error: "找不到" }, { status: 404 });
  }
}
