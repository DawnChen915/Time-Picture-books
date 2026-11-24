import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { loadFamily, saveAsset, saveBook, saveFamily } from "@/lib/storage";
import { ChildInfoSchema, type Book, type Family, type Member } from "@/lib/types";
import { fillName, getTemplate, ROLE_LABEL } from "@/templates";

export const runtime = "nodejs";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

/**
 * Create a book from a template. Multipart form fields:
 * templateId, childName, childAge, childGender, familyId (optional, to reuse avatars),
 * and per role in the template's cast: photo_<role> (file), desc_<role>, reuse_<role>=1.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return bad("表单内容有误");

  const template = getTemplate(String(form.get("templateId") ?? ""));
  if (!template) return bad("请选择一个故事");

  const child = ChildInfoSchema.safeParse({
    childName: form.get("childName"),
    childAge: form.get("childAge"),
    childGender: form.get("childGender"),
  });
  if (!child.success) return bad(child.error.issues[0]?.message ?? "宝宝信息有误");

  const existingId = String(form.get("familyId") ?? "");
  const existing = existingId ? await loadFamily(existingId).catch(() => null) : null;
  const family: Family = existing ?? { id: nanoid(12), createdAt: new Date().toISOString(), members: {}, ...child.data };
  // Avatars depend on the child's age and gender, so redraw the child if those changed.
  const childChanged = existing && (existing.childAge !== child.data.childAge || existing.childGender !== child.data.childGender);
  Object.assign(family, child.data);

  for (const role of template.cast) {
    const current = family.members[role];
    const photo = form.get(`photo_${role}`);
    const description = String(form.get(`desc_${role}`) ?? "").trim().slice(0, 200);
    const reuse = form.get(`reuse_${role}`) === "1" && current?.avatar.status === "done" && !(role === "child" && childChanged);
    if (reuse) continue;

    const member: Member = { role, description, avatar: { status: "pending", prompt: "" } };
    if (photo instanceof File && photo.size > 0) {
      const ext = PHOTO_TYPES[photo.type];
      if (!ext) return bad(`${ROLE_LABEL[role]}的照片请用 JPG、PNG 或 WebP`);
      if (photo.size > MAX_PHOTO_BYTES) return bad(`${ROLE_LABEL[role]}的照片太大了，请小于 10MB`);
      member.photoFile = `photo-${role}-${Date.now()}.${ext}`;
      member.photoMimeType = photo.type;
      await saveAsset("families", family.id, member.photoFile, Buffer.from(await photo.arrayBuffer()));
    }
    family.members[role] = member;
  }
  await saveFamily(family);

  const name = family.childName;
  const book: Book = {
    id: nanoid(12),
    createdAt: new Date().toISOString(),
    familyId: family.id,
    templateId: template.id,
    childName: name,
    title: fillName(template.title, name),
    dedication: fillName(template.dedication, name),
    cast: template.cast,
    cover: { status: "pending", prompt: template.cover.scene },
    pages: template.pages.map((p) => ({
      text: fillName(p.text, name),
      cast: p.cast,
      illustration: { status: "pending", prompt: p.scene },
    })),
  };
  await saveBook(book);
  return NextResponse.json({ id: book.id, familyId: family.id });
}
