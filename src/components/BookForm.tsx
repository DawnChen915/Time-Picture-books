"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ageLabel, rangeLabel } from "@/lib/stages";
import { ROLE_LABEL, type Role } from "@/templates";
import { ChildInfoFields } from "./ChildInfoFields";
import { card, DESC_PLACEHOLDER, field, fileInput, GENDER_LABEL, label, secondaryButton } from "./formStyles";
import { avatarUrl, rememberFamily, useSavedFamily } from "./useSavedFamily";

export interface TemplateSummary {
  id: string;
  title: string;
  summary: string;
  cast: Role[];
  pageCount: number;
  ages: [number, number];
}

function PhotoFields({ role, description }: { role: Role; description?: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className={label} htmlFor={`photo_${role}`}>照片</label>
        <input id={`photo_${role}`} name={`photo_${role}`} type="file" accept="image/jpeg,image/png,image/webp" className={fileInput} />
      </div>
      <div>
        <label className={label} htmlFor={`desc_${role}`}>补充描述（可选）</label>
        <input id={`desc_${role}`} name={`desc_${role}`} maxLength={200} defaultValue={description} placeholder={DESC_PLACEHOLDER[role]} className={field} />
      </div>
    </div>
  );
}

/**
 * Make a book from one template. With a saved family profile there is nothing to fill in:
 * the child's info and avatars are reused, and either can be changed right here if needed.
 */
export function BookForm({ template }: { template: TemplateSummary }) {
  const router = useRouter();
  const { family, loaded } = useSavedFamily();
  const [editInfo, setEditInfo] = useState(false);
  const [replace, setReplace] = useState<Partial<Record<Role, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = (s: string) => s.replaceAll("{name}", family?.childName ?? "宝宝");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    data.set("templateId", template.id);
    if (family) data.set("familyId", family.id);
    for (const role of template.cast) if (replace[role]) data.set(`replace_${role}`, "1");
    try {
      const res = await fetch("/api/books", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "创建失败");
      rememberFamily(json.familyId);
      router.push(`/books/${json.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
      setSubmitting(false);
    }
  }

  if (!loaded) return <div className="h-72 animate-pulse rounded-3xl bg-white/60" />;

  const showInfoFields = !family || editInfo;
  const missing = template.cast.filter((r) => !family?.members[r]);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-100">
        <div>
          <div className="font-serif text-2xl font-bold">{name(template.title)}</div>
          <p className="mt-1 text-stone-500">{name(template.summary)}</p>
          <p className="mt-2 text-xs text-stone-400">
            适合 {rangeLabel(template.ages)} · {template.pageCount} 页 · 主角：{template.cast.map((r) => ROLE_LABEL[r]).join("、")}
          </p>
        </div>
        <Link href="/" className={secondaryButton}>换一个故事</Link>
      </section>

      <section className={`${card} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-medium text-stone-700">关于宝宝</h2>
          {family && !editInfo && (
            <button type="button" onClick={() => setEditInfo(true)} className="text-sm text-accent">
              修改
            </button>
          )}
        </div>
        {showInfoFields ? (
          <>
            <ChildInfoFields family={family} />
            {family && <p className="text-xs text-stone-400">修改会保存到家人档案，以后的绘本也会用新的信息。</p>}
          </>
        ) : (
          <p className="text-lg">
            {family!.childName}
            <span className="ml-3 text-sm text-stone-500">
              {ageLabel(family!.childAge)} · {GENDER_LABEL[family!.childGender]}
            </span>
          </p>
        )}
      </section>

      <section className={`${card} space-y-4`}>
        <div>
          <h2 className="font-medium text-stone-700">主角的卡通形象</h2>
          <p className="mt-1 text-sm text-stone-500">
            {missing.length === 0
              ? "都用家人档案里保存的形象，不用再上传照片。"
              : "第一次出场的家人，请上传一张正脸清晰的照片。形象生成后会保存到家人档案，原始照片随即删除。"}
          </p>
        </div>
        {template.cast.map((role) => {
          const member = family?.members[role];
          const avatar = member?.avatar;
          return (
            <div key={role} className="rounded-2xl bg-white p-4 ring-1 ring-stone-100">
              <div className="flex items-center gap-4">
                {avatar?.status === "done" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl(family!, role)} alt="" className="h-16 w-16 rounded-xl bg-stone-50 object-contain ring-1 ring-stone-100" />
                ) : (
                  <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-stone-50 text-xs text-stone-400 ring-1 ring-stone-100">
                    {member ? (avatar?.status === "error" ? "没画好" : "待生成") : "新"}
                  </span>
                )}
                <div className="flex-1">
                  <div className="font-medium">{role === "child" && family ? family.childName : ROLE_LABEL[role]}</div>
                  <div className="text-sm text-stone-500">
                    {!member
                      ? "上传照片，或只写一句描述"
                      : replace[role]
                        ? "将生成新形象"
                        : avatar?.status === "done"
                          ? "使用保存的形象"
                          : avatar?.status === "error"
                            ? "上次没画好，做绘本时会重新画"
                            : "做绘本时会先画好形象"}
                  </div>
                </div>
                {member && (
                  <button type="button" className="text-sm text-accent" onClick={() => setReplace((r) => ({ ...r, [role]: !r[role] }))}>
                    {replace[role] ? "还是用原来的" : "换形象"}
                  </button>
                )}
              </div>
              {(!member || replace[role]) && (
                <div className="mt-4">
                  <PhotoFields role={role} description={member?.description} />
                  {member && avatar?.status === "done" && (
                    <p className="mt-2 text-xs text-stone-400">不传新照片时，会在现在的形象上按描述修改。</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-accent py-3 text-lg font-medium text-white transition hover:brightness-105 disabled:opacity-60"
      >
        {submitting ? "正在准备…" : "生成绘本"}
      </button>
    </form>
  );
}
