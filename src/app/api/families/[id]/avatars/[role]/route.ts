import { NextResponse } from "next/server";
import { drawAvatar } from "@/lib/illustrate";
import { runDraw, serveIllustration } from "@/lib/http/serveIllustration";
import { loadFamily } from "@/lib/storage";
import type { Role } from "@/templates";

export const runtime = "nodejs";
export const maxDuration = 300;

type Ctx = { params: Promise<{ id: string; role: string }> };
const ROLES = new Set(["child", "mom", "dad"]);

export async function GET(_req: Request, { params }: Ctx) {
  const { id, role } = await params;
  const family = await loadFamily(id).catch(() => null);
  return serveIllustration("families", id, ROLES.has(role) ? family?.members[role as Role]?.avatar : null);
}

export async function POST(_req: Request, { params }: Ctx) {
  const { id, role } = await params;
  if (!ROLES.has(role)) return NextResponse.json({ error: "无效的角色" }, { status: 400 });
  return runDraw(() => drawAvatar(id, role as Role));
}
