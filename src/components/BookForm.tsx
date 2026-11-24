"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Family } from "@/lib/types";
import { ROLE_LABEL, type Role } from "@/templates";

export interface TemplateSummary {
  id: string;
  title: string;
  summary: string;
  cast: Role[];
  pageCount: number;
}

const FAMILY_KEY = "tpb.familyId";
const field = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";
const label = "mb-1.5 block text-sm font-medium text-stone-600";

function readFamilyId() {
  try {
    return localStorage.getItem(FAMILY_KEY);
  } catch {
    return null;
  }
}

export function BookForm({ templates }: { templates: TemplateSummary[] }) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState(templates[0].id);
  const [family, setFamily] = useState<Family | null>(null);
  const [reuse, setReuse] = useState<Partial<Record<Role, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const template = templates.find((t) => t.id === templateId)!;

  // Load avatars this browser made before, so they can be reused.
  useEffect(() => {
    const id = readFamilyId();
    if (!id) return;
    fetch(`/api/families/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((f: Family | null) => {
        if (!f) return;
        setFamily(f);
        const r: Partial<Record<Role, boolean>> = {};
        for (const role of Object.keys(f.members) as Role[]) r[role] = f.members[role]?.avatar.status === "done";
        setReuse(r);
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    data.set("templateId", templateId);
    if (family) data.set("familyId", family.id);
    for (const role of template.cast) if (reuse[role] && hasAvatar(role)) data.set(`reuse_${role}`, "1");
    try {
      const res = await fetch("/api/books", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "创建失败");
      try {
        localStorage.setItem(FAMILY_KEY, json.familyId);
      } catch {}
      router.push(`/books/${json.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败");
      setSubmitting(false);
    }
  }

  const hasAvatar = (role: Role) => family?.members[role]?.avatar.status === "done";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section>
        <h2 className="mb-3 font-medium text-stone-700">1. 选一个故事</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {templates.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className={`rounded-2xl p-4 text-left ring-1 transition ${
                t.id === templateId ? "bg-white ring-2 ring-accent" : "bg-white/60 ring-stone-200 hover:bg-white"
              }`}
            >
              <div className="font-serif text-lg font-bold">{t.title.replaceAll("{name}", "宝宝")}</div>
              <p className="mt-1 text-sm text-stone-500">{t.summary.replaceAll("{name}", "宝宝")}</p>
              <p className="mt-2 text-xs text-stone-400">
                {t.pageCount} 页 · 主角：{t.cast.map((r) => ROLE_LABEL[r]).join("、")}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-stone-100 sm:p-8">
        <h2 className="font-medium text-stone-700">2. 关于宝宝</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className={label} htmlFor="childName">名字（会写进故事里）</label>
            <input id="childName" name="childName" required maxLength={20} defaultValue={family?.childName} key={family?.id} placeholder="小米" className={field} />
          </div>
          <div>
            <label className={label} htmlFor="childAge">年龄</label>
            <select id="childAge" name="childAge" defaultValue={family?.childAge ?? 4} key={family?.id} className={field}>
              {Array.from({ length: 13 }, (_, i) => i).map((n) => (
                <option key={n} value={n}>{n === 0 ? "不满 1 岁" : `${n} 岁`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="childGender">性别</label>
            <select id="childGender" name="childGender" defaultValue={family?.childGender ?? "unspecified"} key={family?.id} className={field}>
              <option value="girl">女孩</option>
              <option value="boy">男孩</option>
              <option value="unspecified">不指定</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-stone-100 sm:p-8">
        <div>
          <h2 className="font-medium text-stone-700">3. 上传照片，生成卡通形象</h2>
          <p className="mt-1 text-sm text-stone-500">每人一张正脸清晰的照片。形象生成后会保存下来，下次做绘本可以直接用；原始照片在形象生成后就会删除。</p>
        </div>
        {template.cast.map((role) => (
          <div key={role} className="rounded-2xl bg-white p-4 ring-1 ring-stone-100">
            <div className="mb-3 font-medium">{ROLE_LABEL[role]}</div>
            {hasAvatar(role) && (
              <label className="mb-3 flex items-center gap-3 text-sm">
                <input type="checkbox" checked={!!reuse[role]} onChange={(e) => setReuse((r) => ({ ...r, [role]: e.target.checked }))} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/families/${family!.id}/avatars/${role}?v=${encodeURIComponent(family!.members[role]!.avatar.file ?? "")}`}
                  alt=""
                  className="h-16 w-16 rounded-xl bg-stone-50 object-contain ring-1 ring-stone-100"
                />
                用上次生成的形象
              </label>
            )}
            {!(hasAvatar(role) && reuse[role]) && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={label} htmlFor={`photo_${role}`}>照片</label>
                  <input id={`photo_${role}`} name={`photo_${role}`} type="file" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent/10 file:px-4 file:py-2 file:text-accent" />
                </div>
                <div>
                  <label className={label} htmlFor={`desc_${role}`}>补充描述（可选）</label>
                  <input id={`desc_${role}`} name={`desc_${role}`} maxLength={200} placeholder={role === "child" ? "喜欢穿黄色背带裤" : "戴眼镜，长头发"} className={field} />
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-accent py-3 text-lg font-medium text-white transition hover:brightness-105 disabled:opacity-60"
      >
        {submitting ? "正在上传…" : "生成绘本"}
      </button>
    </form>
  );
}
