"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ageLabel } from "@/lib/stages";
import type { Family } from "@/lib/types";
import { ROLE_LABEL, type Role } from "@/templates";
import { ChildInfoFields } from "./ChildInfoFields";
import { postDraw } from "./postDraw";
import { card, DESC_PLACEHOLDER, field, fileInput, GENDER_LABEL, label, primaryButton, secondaryButton } from "./formStyles";
import { avatarUrl, rememberFamily, useSavedFamily } from "./useSavedFamily";

const ROLES: Role[] = ["child", "mom", "dad"];

async function readError(res: Response, fallback: string) {
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  return json.error ?? fallback;
}

/**
 * The family profile: the child's info and everyone's cartoon avatar, filled in once and reused by
 * every book. Info can be edited any time; an avatar is only redrawn when the family asks for it.
 */
export function FamilyEditor() {
  const { family, setFamily, loaded, reload } = useSavedFamily();
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const drawing = useRef(new Set<Role>());

  const tries = useRef(new Map<Role, number>());

  const draw = useCallback(
    async (f: Family, role: Role) => {
      drawing.current.add(role);
      tries.current.set(role, (tries.current.get(role) ?? 0) + 1);
      const patch = (status: "generating" | "error", error?: string) =>
        setFamily((cur) => {
          if (!cur?.members[role]) return cur;
          const next = structuredClone(cur);
          Object.assign(next.members[role]!.avatar, { status, error, attempt: undefined, retryReason: undefined });
          return next;
        });
      patch("generating");
      const message = await postDraw(`/api/families/${f.id}/avatars/${role}`);
      drawing.current.delete(role);
      const fresh = await reload();
      // The request never reached the image step: show why, instead of retrying in a loop.
      if (message && (!fresh || fresh.members[role]?.avatar.status === "pending")) patch("error", message);
    },
    [reload, setFamily],
  );

  // Avatars waiting to be drawn (e.g. saved here but the page was closed) start automatically.
  useEffect(() => {
    if (!family) return;
    for (const r of ROLES) {
      const pending = family.members[r]?.avatar.status === "pending";
      if (pending && !drawing.current.has(r) && (tries.current.get(r) ?? 0) < 2) void draw(family, r);
    }
  }, [family, draw]);

  // Poll while something is being drawn, so retries and results show up.
  useEffect(() => {
    if (!family || !ROLES.some((r) => family.members[r]?.avatar.status === "generating")) return;
    const t = setInterval(reload, 4000);
    return () => clearInterval(t);
  }, [family, reload]);

  async function saveInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMessage(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch(family ? `/api/families/${family.id}` : "/api/families", {
      method: family ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => null);
    if (res?.ok) {
      const f = (await res.json()) as Family;
      rememberFamily(f.id);
      setFamily(f);
      setInfoMessage({ ok: true, text: "已保存，下次做绘本会直接用这些信息" });
    } else {
      setInfoMessage({ ok: false, text: res ? await readError(res, "保存失败") : "连不上服务器" });
    }
    setSavingInfo(false);
  }

  if (!loaded) return <div className="h-64 animate-pulse rounded-3xl bg-white/60" />;

  return (
    <div className="space-y-8">
      <form onSubmit={saveInfo} className={`${card} space-y-5`} key={family?.updatedAt ?? "new"}>
        <div>
          <h2 className="font-medium text-stone-700">关于宝宝</h2>
          <p className="mt-1 text-sm text-stone-500">
            {family ? "宝宝长大了，随时来改一下年龄；以后的绘本都会用新的信息。" : "先建一个宝宝的档案，之后做每一本绘本都不用再填。"}
          </p>
        </div>
        <ChildInfoFields family={family} />
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={savingInfo} className={primaryButton}>
            {savingInfo ? "正在保存…" : family ? "保存修改" : "建立档案"}
          </button>
          {infoMessage && <span className={`text-sm ${infoMessage.ok ? "text-emerald-600" : "text-red-600"}`}>{infoMessage.text}</span>}
        </div>
      </form>

      {family && (
        <section className={`${card} space-y-4`}>
          <div>
            <h2 className="font-medium text-stone-700">家人的卡通形象</h2>
            <p className="mt-1 text-sm text-stone-500">每人生成一次，所有绘本都用同一个形象。原始照片在形象画好后就会删除。</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {ROLES.map((r) => (
              <MemberCard key={`${r}-${family.members[r]?.avatar.file ?? family.members[r]?.avatar.status ?? "none"}`} family={family} role={r} onSaved={(f) => { tries.current.delete(r); setFamily(f); }} onRetry={() => { tries.current.delete(r); void draw(family, r); }} />
            ))}
          </div>
          <p className="text-sm text-stone-500">
            形象都准备好了？去 <Link href="/" className="text-accent underline-offset-2 hover:underline">选一本绘本</Link>。
          </p>
        </section>
      )}
    </div>
  );
}

function MemberCard({ family, role, onSaved, onRetry }: { family: Family; role: Role; onSaved: (f: Family) => void; onRetry: () => void }) {
  const member = family.members[role];
  const avatar = member?.avatar;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = role === "child" ? family.childName : ROLE_LABEL[role];
  const hasAvatar = avatar?.status === "done";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/families/${family.id}/members/${role}`, { method: "PUT", body: new FormData(e.currentTarget) }).catch(() => null);
    setSaving(false);
    if (!res?.ok) {
      setError(res ? await readError(res, "保存失败") : "连不上服务器");
      return;
    }
    setEditing(false);
    onSaved((await res.json()) as Family);
  }

  return (
    <div className="flex flex-col rounded-2xl bg-white p-4 ring-1 ring-stone-100">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="font-medium">{ROLE_LABEL[role]}</span>
        {role === "child" && (
          <span className="text-xs text-stone-400">
            {name} · {ageLabel(family.childAge)} · {GENDER_LABEL[family.childGender]}
          </span>
        )}
      </div>

      <div className="mb-3 flex aspect-[2/3] items-center justify-center overflow-hidden rounded-xl bg-stone-50">
        {hasAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl(family, role)} alt={`${name}的卡通形象`} className="h-full w-full object-contain" />
        ) : avatar?.status === "generating" || avatar?.status === "pending" ? (
          <div className="flex flex-col items-center gap-2 px-3 text-center text-sm text-stone-500">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-stone-300 border-t-accent" />
            {(avatar.attempt ?? 1) > 1 ? `正在自动重试（第 ${avatar.attempt} 次）…` : "正在画形象…"}
          </div>
        ) : avatar?.status === "error" ? (
          <div className="flex flex-col items-center gap-2 px-3 text-center text-sm text-red-600">
            <span>没画好：{avatar.error}</span>
            <button onClick={onRetry} className={secondaryButton}>
              重新生成
            </button>
          </div>
        ) : (
          <span className="text-sm text-stone-400">还没有形象</span>
        )}
      </div>

      {member?.description && !editing && <p className="mb-3 text-xs text-stone-500">描述：{member.description}</p>}

      {editing ? (
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className={label} htmlFor={`photo-${role}`}>{hasAvatar ? "新照片（可选）" : "照片"}</label>
            <input id={`photo-${role}`} name="photo" type="file" accept="image/jpeg,image/png,image/webp" className={fileInput} />
          </div>
          <div>
            <label className={label} htmlFor={`desc-${role}`}>{hasAvatar ? "想改哪里" : "补充描述（可选）"}</label>
            <input
              id={`desc-${role}`}
              name="description"
              maxLength={200}
              defaultValue={member?.description}
              placeholder={hasAvatar ? "比如：换成短头发、穿红色外套" : DESC_PLACEHOLDER[role]}
              className={field}
            />
          </div>
          {hasAvatar && <p className="text-xs text-stone-400">不传新照片时，会在现在的形象上按描述修改，人物还是同一个人。</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className={primaryButton + " px-4 py-2 text-sm"}>
              {saving ? "正在上传…" : "生成新形象"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className={secondaryButton}>
              取消
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setEditing(true)}
          disabled={avatar?.status === "generating"}
          className={`${secondaryButton} mt-auto`}
        >
          {member ? "更新形象" : `添加${ROLE_LABEL[role]}`}
        </button>
      )}
    </div>
  );
}
