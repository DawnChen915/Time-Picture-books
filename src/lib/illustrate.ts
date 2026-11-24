import { HOUSE_STYLE, ROLE_TOKEN, type Role } from "@/templates";
import { generateImage, MAX_GENERATION_MS } from "./images";
import { deleteAsset, loadFamily, readAsset, saveAsset, updateBook, updateFamily } from "./storage";
import { getSlot, type Family, type Illustration } from "./types";

// A job still marked "generating" after this long was interrupted (server restart, crash) and can be restarted.
const STALE_MS = MAX_GENERATION_MS;

export class IllustrationBusyError extends Error {}

function describeRole(family: Family, role: Role) {
  const gender = family.childGender === "boy" ? "boy" : family.childGender === "girl" ? "girl" : "child";
  if (role === "child") return `a ${family.childAge}-year-old ${gender}`;
  return role === "mom" ? "the child's mother, an adult woman" : "the child's father, an adult man";
}

export function avatarPrompt(family: Family, role: Role, reference: "photo" | "avatar" | "none") {
  const member = family.members[role]!;
  const intro = {
    photo: `Turn the person in the reference photo into a cartoon character for a children's picture book. Keep them clearly recognizable: face shape, hairstyle, hair color, skin tone, glasses or other distinctive features.`,
    avatar: `The reference image is an existing cartoon character from a children's picture book. Redraw the same character so they stay clearly recognizable, applying only the changes described below.`,
    none: `Design a cartoon character for a children's picture book.`,
  }[reference];
  return [
    intro,
    `The character is ${describeRole(family, role)}.`,
    member.description && `${reference === "avatar" ? "Changes" : "Notes from the family"}: ${member.description}`,
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

type Update = (ill: Illustration) => void;

/**
 * Shared claim → generate → save flow. `claim` marks the illustration as generating
 * (or reports it is already done / busy); `run` produces the image, retrying temporary failures
 * and reporting each retry through `update`; `finish` records the result.
 */
async function runIllustration(opts: {
  claim: (mark: (ill: Illustration) => "go" | "done" | "busy") => Promise<{ state: "go" | "done" | "busy"; ill: Illustration }>;
  run: (onRetry: (attempt: number, error: Error) => Promise<void>) => Promise<{ data: Buffer; mimeType: string; ext: string }>;
  save: (file: string, data: Buffer) => Promise<void>;
  update: (fn: Update) => Promise<Illustration>;
  label: string;
}) {
  const { state, ill } = await opts.claim((ill) => {
    const busy = ill.status === "generating" && ill.startedAt && Date.now() - Date.parse(ill.startedAt) < STALE_MS;
    if (ill.status === "done") return "done";
    if (busy) return "busy";
    ill.status = "generating";
    ill.startedAt = new Date().toISOString();
    ill.error = undefined;
    ill.attempt = 1;
    ill.retryReason = undefined;
    return "go";
  });
  if (state === "done") return ill;
  if (state === "busy") throw new IllustrationBusyError("正在画");

  const onRetry = async (attempt: number, error: Error) => {
    await opts
      .update((i) => {
        i.attempt = attempt;
        i.retryReason = error.message;
        // Keep the job from looking stale while it waits between attempts.
        i.startedAt = new Date().toISOString();
      })
      .catch(() => {});
  };

  try {
    const image = await opts.run(onRetry);
    const file = `${opts.label}-${Date.now()}.${image.ext}`;
    await opts.save(file, image.data);
    return await opts.update((i) => {
      i.status = "done";
      i.file = file;
      i.mimeType = image.mimeType;
      i.attempt = undefined;
      i.retryReason = undefined;
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await opts.update((i) => {
      i.status = "error";
      i.error = (i.attempt ?? 1) > 1 ? `${message}（已自动重试 ${i.attempt! - 1} 次）` : message;
      i.attempt = undefined;
      i.retryReason = undefined;
    });
    throw err;
  }
}

/**
 * Draw one family member's cartoon avatar. The reference is, in order of preference:
 * a newly uploaded photo, the avatar being replaced (to tweak it by description), or nothing.
 */
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
        const reference = m.photoFile ? "photo" : m.baseAvatarFile ? "avatar" : "none";
        if (state === "go") m.avatar.prompt = avatarPrompt(f, role, reference);
      });
      return { state, ill: family.members[role]!.avatar };
    },
    run: async (onRetry) => {
      const f = family!;
      const m = f.members[role]!;
      const references = m.photoFile
        ? [{ data: await readAsset("families", familyId, m.photoFile), mimeType: m.photoMimeType ?? "image/jpeg" }]
        : m.baseAvatarFile && m.baseAvatarMimeType !== "image/svg+xml"
          ? [{ data: await readAsset("families", familyId, m.baseAvatarFile), mimeType: m.baseAvatarMimeType ?? "image/jpeg" }]
          : [];
      return generateImage(`family ${familyId} avatar ${role}`, { prompt: m.avatar.prompt, references, orientation: "portrait" }, onRetry);
    },
    save: (file, data) => saveAsset("families", familyId, file, data),
    update: async (fn) => {
      const toDelete: string[] = [];
      const f = await updateFamily(familyId, (f) => {
        const m = f.members[role]!;
        fn(m.avatar);
        if (m.avatar.status === "done") {
          // Privacy: drop the original photo once the avatar exists. The replaced avatar is no longer needed either.
          if (m.photoFile) toDelete.push(m.photoFile);
          if (m.baseAvatarFile) toDelete.push(m.baseAvatarFile);
          m.photoFile = m.photoMimeType = m.baseAvatarFile = m.baseAvatarMimeType = undefined;
          f.updatedAt = new Date().toISOString();
        }
      });
      await Promise.all(toDelete.map((file) => deleteAsset("families", familyId, file)));
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
    run: async (onRetry) => {
      const family = await loadFamily(familyId);
      if (!family) throw new Error("找不到家庭形象");
      const references: { data: Buffer; mimeType: string }[] = [];
      for (const role of cast) {
        const avatar = family.members[role]?.avatar;
        if (avatar?.status !== "done" || !avatar.file) throw new Error(`${role} 的形象还没画好`);
        if (avatar.mimeType === "image/svg+xml") continue; // placeholder avatars can't be used as references
        references.push({ data: await readAsset("families", familyId, avatar.file), mimeType: avatar.mimeType! });
      }
      return generateImage(`book ${bookId} slot ${slot}`, { prompt: scenePrompt(family, cast, prompt), references }, onRetry);
    },
    save: (file, data) => saveAsset("books", bookId, file, data),
    update: async (fn) => {
      const book = await updateBook(bookId, (b) => fn(getSlot(b, slot)!));
      return getSlot(book, slot)!;
    },
  });
}
