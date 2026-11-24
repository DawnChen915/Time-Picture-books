import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { deleteFamilyFiles, readDescription, replaceMember, savePhoto, type PhotoUpload } from "@/lib/members";
import { listBooks, loadFamily, saveBook, saveFamily, updateFamily } from "@/lib/storage";
import { ChildInfoSchema, getSlot, type Book, type BookSummary, type Family } from "@/lib/types";
import { fillName, getTemplate, type Role } from "@/templates";

export const runtime = "nodejs";

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

/** List a family's books, newest first: GET /api/books?familyId=... */
export async function GET(req: Request) {
  const familyId = new URL(req.url).searchParams.get("familyId");
  if (!familyId) return NextResponse.json([]);
  const family = await loadFamily(familyId).catch(() => null);
  if (!family) return NextResponse.json([]);
  const books = (await listBooks()).filter((b) => b.familyId === familyId);
  const summaries: BookSummary[] = books
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((b) => {
      const slots = Array.from({ length: b.pages.length + 1 }, (_, i) => getSlot(b, i)!);
      return {
        id: b.id,
        title: b.title,
        templateId: b.templateId,
        createdAt: b.createdAt,
        childName: b.childName,
        childAge: b.childAge ?? family.childAge,
        coverFile: b.cover.status === "done" ? b.cover.file : undefined,
        done: slots.filter((s) => s.status === "done").length,
        failed: slots.filter((s) => s.status === "error").length,
        total: slots.length,
      };
    });
  return NextResponse.json(summaries);
}

/**
 * Create a book from a template. Multipart form fields:
 * - templateId
 * - familyId: the saved family profile to reuse. Without it a new profile is created.
 * - childName, childAge, childGender: required for a new family, optional updates for a saved one.
 * - per role in the template's cast: photo_<role> (file), desc_<role>, replace_<role>=1.
 *   A saved member is reused as-is unless a photo or replace_<role> is sent.
 */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return bad("表单内容有误");

  const template = getTemplate(String(form.get("templateId") ?? ""));
  if (!template) return bad("请选择一个故事");

  const existingId = String(form.get("familyId") ?? "");
  const existing = existingId ? await loadFamily(existingId).catch(() => null) : null;

  const hasInfo = form.has("childName");
  const info = ChildInfoSchema.safeParse({
    childName: form.get("childName"),
    childAge: form.get("childAge"),
    childGender: form.get("childGender"),
  });
  if ((hasInfo || !existing) && !info.success) return bad(info.error?.issues[0]?.message ?? "宝宝信息有误");

  const now = new Date().toISOString();
  const familyId = existing?.id ?? nanoid(12);

  // Store new photos first (outside the record lock), then apply all changes in one update.
  const uploads: Partial<Record<Role, { photo: PhotoUpload | null; description: string }>> = {};
  for (const role of template.cast) {
    const photo = await savePhoto(familyId, role, form.get(`photo_${role}`));
    if (typeof photo === "string") return bad(photo);
    const saved = existing?.members[role];
    if (!saved || photo || form.get(`replace_${role}`) === "1") {
      uploads[role] = { photo, description: readDescription(form, `desc_${role}`) };
    }
  }

  const orphaned: string[] = [];
  const apply = (f: Family) => {
    if (info.success) Object.assign(f, info.data);
    for (const [role, input] of Object.entries(uploads) as [Role, NonNullable<(typeof uploads)[Role]>][]) {
      if (f.members[role]?.avatar.status === "generating") continue; // being redrawn right now; keep that one
      orphaned.push(...replaceMember(f, role, input));
    }
    f.updatedAt = now;
  };

  let family: Family;
  if (existing) {
    family = await updateFamily(familyId, apply);
  } else {
    family = { id: familyId, createdAt: now, members: {}, ...(info.data as NonNullable<typeof info.data>) };
    apply(family);
    await saveFamily(family);
  }
  await deleteFamilyFiles(familyId, orphaned);

  const name = family.childName;
  const book: Book = {
    id: nanoid(12),
    createdAt: now,
    familyId: family.id,
    templateId: template.id,
    childName: name,
    childAge: family.childAge,
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
