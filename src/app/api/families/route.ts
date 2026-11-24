import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { publicFamily } from "@/lib/publicFamily";
import { saveFamily } from "@/lib/storage";
import { ChildInfoSchema, type Family } from "@/lib/types";

export const runtime = "nodejs";

/** Create a family profile from the child's info (JSON). Avatars are added with PUT .../members/:role. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const info = ChildInfoSchema.safeParse(body ?? {});
  if (!info.success) return NextResponse.json({ error: info.error.issues[0]?.message ?? "宝宝信息有误" }, { status: 400 });
  const now = new Date().toISOString();
  const family: Family = { id: nanoid(12), createdAt: now, updatedAt: now, members: {}, ...info.data };
  await saveFamily(family);
  return NextResponse.json(publicFamily(family));
}
