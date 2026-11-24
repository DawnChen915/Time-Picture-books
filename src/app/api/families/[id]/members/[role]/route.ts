import { NextResponse } from "next/server";
import { deleteFamilyFiles, isRole, readDescription, replaceMember, savePhoto } from "@/lib/members";
import { publicFamily } from "@/lib/publicFamily";
import { loadFamily, updateFamily } from "@/lib/storage";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string; role: string }> };

/**
 * Add or update one family member (multipart: photo optional, description). The avatar is reset to
 * pending; draw it with POST .../avatars/:role. Without a new photo the current avatar is the reference.
 */
export async function PUT(req: Request, { params }: Ctx) {
  const { id, role } = await params;
  if (!isRole(role)) return NextResponse.json({ error: "无效的角色" }, { status: 400 });
  if (!(await loadFamily(id).catch(() => null))) return NextResponse.json({ error: "找不到" }, { status: 404 });
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "表单内容有误" }, { status: 400 });

  const photo = await savePhoto(id, role, form.get("photo"));
  if (typeof photo === "string") return NextResponse.json({ error: photo }, { status: 400 });

  let orphaned: string[] = [];
  const family = await updateFamily(id, (f) => {
    if (f.members[role]?.avatar.status === "generating") throw new Error("busy");
    orphaned = replaceMember(f, role, { photo, description: readDescription(form, "description") });
  }).catch((err: Error) => err);
  if (family instanceof Error) {
    if (photo) await deleteFamilyFiles(id, [photo.file]);
    return NextResponse.json({ error: family.message === "busy" ? "这个形象正在画，请等它画完再改" : "保存失败" }, { status: 409 });
  }
  await deleteFamilyFiles(id, orphaned);
  return NextResponse.json(publicFamily(family));
}
