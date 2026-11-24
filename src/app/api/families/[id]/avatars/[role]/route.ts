import { NextResponse } from "next/server";
import { drawAvatar } from "@/lib/illustrate";
import { runDraw, serveIllustration } from "@/lib/http/serveIllustration";
import { isRole } from "@/lib/members";
import { loadFamily } from "@/lib/storage";

export const runtime = "nodejs";
export const maxDuration = 800;

type Ctx = { params: Promise<{ id: string; role: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id, role } = await params;
  const family = await loadFamily(id).catch(() => null);
  return serveIllustration("families", id, isRole(role) ? family?.members[role]?.avatar : null);
}

export async function POST(_req: Request, { params }: Ctx) {
  const { id, role } = await params;
  if (!isRole(role)) return NextResponse.json({ error: "无效的角色" }, { status: 400 });
  return runDraw(() => drawAvatar(id, role));
}
