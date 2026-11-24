import { ROLE_LABEL, type Role } from "@/templates";
import { deleteAsset, saveAsset } from "./storage";
import type { Family, Member } from "./types";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export const ROLES: Role[] = ["child", "mom", "dad"];
export const isRole = (r: string): r is Role => (ROLES as string[]).includes(r);

export interface PhotoUpload {
  file: string;
  mimeType: string;
}

/** Validate and store an uploaded photo. Returns null when no photo was sent, or an error message. */
export async function savePhoto(familyId: string, role: Role, photo: FormDataEntryValue | null): Promise<PhotoUpload | null | string> {
  if (!(photo instanceof File) || photo.size === 0) return null;
  const ext = PHOTO_TYPES[photo.type];
  if (!ext) return `${ROLE_LABEL[role]}的照片请用 JPG、PNG 或 WebP`;
  if (photo.size > MAX_PHOTO_BYTES) return `${ROLE_LABEL[role]}的照片太大了，请小于 10MB`;
  const file = `photo-${role}-${Date.now()}.${ext}`;
  await saveAsset("families", familyId, file, Buffer.from(await photo.arrayBuffer()));
  return { file, mimeType: photo.type };
}

/**
 * Replace a member's avatar with a new pending one (mutates `family`). The old avatar is kept as
 * `baseAvatarFile` until the new one is drawn, so without a new photo it becomes the reference and
 * the character keeps its look. Returns files that are no longer referenced and can be deleted.
 */
export function replaceMember(family: Family, role: Role, input: { photo: PhotoUpload | null; description: string }): string[] {
  const current = family.members[role];
  const orphaned: string[] = [];

  let base: Pick<Member, "baseAvatarFile" | "baseAvatarMimeType"> = {
    baseAvatarFile: current?.baseAvatarFile,
    baseAvatarMimeType: current?.baseAvatarMimeType,
  };
  if (current?.avatar.status === "done" && current.avatar.file) {
    if (base.baseAvatarFile) orphaned.push(base.baseAvatarFile);
    base = { baseAvatarFile: current.avatar.file, baseAvatarMimeType: current.avatar.mimeType };
  } else if (current?.avatar.file) {
    orphaned.push(current.avatar.file);
  }

  // An earlier photo that was never turned into an avatar is still the best reference, unless a new one came in.
  let photo = current?.photoFile ? { file: current.photoFile, mimeType: current.photoMimeType ?? "image/jpeg" } : null;
  if (input.photo) {
    if (photo) orphaned.push(photo.file);
    photo = input.photo;
  }

  family.members[role] = {
    role,
    description: input.description,
    photoFile: photo?.file,
    photoMimeType: photo?.mimeType,
    ...base,
    avatar: { status: "pending", prompt: "" },
  };
  family.updatedAt = new Date().toISOString();
  return orphaned;
}

export async function deleteFamilyFiles(familyId: string, files: string[]) {
  await Promise.all(files.map((f) => deleteAsset("families", familyId, f).catch(() => {})));
}

export function readDescription(form: FormData, field: string) {
  return String(form.get(field) ?? "").trim().slice(0, 200);
}
