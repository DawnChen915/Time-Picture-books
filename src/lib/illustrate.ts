import { HOUSE_STYLE, ROLE_TOKEN, type Role } from "@/templates";
import { getImageProvider } from "./images";
import { deleteAsset, loadFamily, readAsset, saveAsset, updateBook, updateFamily } from "./storage";
import { getSlot, type Family, type Illustration } from "./types";

const STALE_MS = 5 * 60 * 1000;

export class IllustrationBusyError extends Error {}

function describeRole(family: Family, role: Role) {
  const gender = family.childGender === "boy" ? "boy" : family.childGender === "girl" ? "girl" : "child";
  if (role === "child") return `a ${family.childAge}-year-old ${gender}`;
  return role === "mom" ? "the child's mother, an adult woman" : "the child's father, an adult man";
}

export function avatarPrompt(family: Family, role: Role, hasPhoto: boolean) {
  const member = family.members[role]!;
  return [
    hasPhoto
      ? `Turn the person in the reference photo into a cartoon character for a children's picture book. Keep them clearly recognizable: face shape, hairstyle, hair color, skin tone, glasses or other distinctive features.`
      : `Design a cartoon character for a children's picture book.`,
    `The character is ${describeRole(family, role)}.`,
    member.description && `Notes from the family: ${member.description}`,
    `Style: ${HOUSE_STYLE}.`,
    "Full body, standing, facing the viewer, friendly smile, simple everyday outfit, plain white background.",
    "No text, letters or captions anywhere in the image.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function scenePrompt(family: Family, cast: Role[], scene: string) {
  const refs = cast.map((r, i) => `Reference image ${i + 1} is ${ROLE_TOKEN[r]} (${describeRole(family, r)}).`);
  return [
    ...refs,
    "Draw these exact characters: keep each one's face, hairstyle, skin tone and outfit identical to their reference.",
    `Style: ${HOUSE_STYLE}.`,
    `Scene: ${scene}`,
    "Absolutely no text, letters, words or captions anywhere in the image.",
  ].join("\n");
}

/**
 * Shared claim → generate → save flow. `claim` marks the illustration as generating
 * (or reports it is already done / busy); `run` produces the image; `finish` records the result.
 */
async function runIllustration(opts: {
  claim: (mark: (ill: Illustration) => "go" | "done" | "busy") => Promise<{ state: "go" | "done" | "busy"; ill: Illustration }>;
  run: () => Promise<{ data: Buffer; mimeType: string; ext: string }>;
  save: (file: string, data: Buffer) => Promise<void>;
  finish: (update: (ill: Illustration) => void) => Promise<Illustration>;
  label: string;
}) {
  const { state, ill } = await opts.claim((ill) => {
    const busy = ill.status === "generating" && ill.startedAt && Date.now() - Date.parse(ill.startedAt) < STALE_MS;
    if (ill.status === "done") return "done";
    if (busy) return "busy";
    ill.status = "generating";
    ill.startedAt = new Date().toISOString();
    ill.error = undefined;
    return "go";
  });
  if (state === "done") return ill;
  if (state === "busy") throw new IllustrationBusyError("正在画");

  try {
    const image = await opts.run();
    const file = `${opts.label}-${Date.now()}.${image.ext}`;
    await opts.save(file, image.data);
    return await opts.finish((i) => {
      i.status = "done";
      i.file = file;
      i.mimeType = image.mimeType;
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`illustration ${opts.label} failed:`, err);
    await opts.finish((i) => {
      i.status = "error";
      i.error = message;
    });
    throw err;
  }
}

/** Draw one family member's cartoon avatar from their photo (or description). */
export async function drawAvatar(familyId: string, role: Role) {
  let family: Family | null = null;
  return runIllustration({
    label: `avatar-${role}`,
    claim: async (mark) => {
      let state: "go" | "done" | "busy" = "go";
      family = await updateFamily(familyId, (f) => {
        const m = f.members[role];
        if (!m) throw new Error("没有这个家庭成员");
        state = mark(m.avatar);
        if (state === "go") m.avatar.prompt = avatarPrompt(f, role, Boolean(m.photoFile));
      });
      return { state, ill: family.members[role]!.avatar };
    },
    run: async () => {
      const f = family!;
      const m = f.members[role]!;
      const references = m.photoFile
        ? [{ data: await readAsset("families", familyId, m.photoFile), mimeType: m.photoMimeType ?? "image/jpeg" }]
        : [];
      return getImageProvider().generate({ prompt: m.avatar.prompt, references, orientation: "portrait" });
    },
    save: (file, data) => saveAsset("families", familyId, file, data),
    finish: async (fn) => {
      let photoToDelete: string | undefined;
      const f = await updateFamily(familyId, (f) => {
        const m = f.members[role]!;
        fn(m.avatar);
        // Privacy: drop the original photo once the avatar exists.
        if (m.avatar.status === "done" && m.photoFile) {
          photoToDelete = m.photoFile;
          m.photoFile = undefined;
          m.photoMimeType = undefined;
        }
      });
      if (photoToDelete) await deleteAsset("families", familyId, photoToDelete);
      return f.members[role]!.avatar;
    },
  });
}

/** Draw the cover (slot 0) or a page (slot n) of a book, using the cast's avatars as references. */
export async function drawBookSlot(bookId: string, slot: number) {
  let cast: Role[] = [];
  let prompt = "";
  let familyId = "";
  return runIllustration({
    label: `slot-${slot}`,
    claim: async (mark) => {
      let state: "go" | "done" | "busy" = "go";
      const book = await updateBook(bookId, (b) => {
        const ill = getSlot(b, slot);
        if (!ill) throw new Error("没有这一页");
        state = mark(ill);
      });
      cast = slot === 0 ? book.cast : book.pages[slot - 1].cast;
      prompt = getSlot(book, slot)!.prompt;
      familyId = book.familyId;
      return { state, ill: getSlot(book, slot)! };
    },
    run: async () => {
      const family = await loadFamily(familyId);
      if (!family) throw new Error("找不到家庭形象");
      const references: { data: Buffer; mimeType: string }[] = [];
      for (const role of cast) {
        const avatar = family.members[role]?.avatar;
        if (avatar?.status !== "done" || !avatar.file) throw new Error(`${role} 的形象还没画好`);
        if (avatar.mimeType === "image/svg+xml") continue; // placeholder avatars can't be used as references
        references.push({ data: await readAsset("families", familyId, avatar.file), mimeType: avatar.mimeType! });
      }
      return getImageProvider().generate({ prompt: scenePrompt(family, cast, prompt), references });
    },
    save: (file, data) => saveAsset("books", bookId, file, data),
    finish: async (fn) => {
      const book = await updateBook(bookId, (b) => fn(getSlot(b, slot)!));
      return getSlot(book, slot)!;
    },
  });
}
