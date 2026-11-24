"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ART_STYLES } from "@/lib/types";

const field = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";
const label = "mb-1.5 block text-sm font-medium text-stone-600";

export function BookForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "生成失败");
      router.push(`/books/${json.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-stone-100 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className={label} htmlFor="childName">孩子的名字</label>
          <input id="childName" name="childName" required maxLength={20} placeholder="小米" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="age">年龄</label>
          <select id="age" name="age" defaultValue="5" className={field}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} 岁</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="gender">性别</label>
          <select id="gender" name="gender" defaultValue="unspecified" className={field}>
            <option value="girl">女孩</option>
            <option value="boy">男孩</option>
            <option value="unspecified">不指定</option>
          </select>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="appearance">外貌特征</label>
        <input id="appearance" name="appearance" maxLength={200} placeholder="短短的卷发，圆脸，喜欢穿黄色雨衣" className={field} />
      </div>
      <div>
        <label className={label} htmlFor="interests">喜欢的东西</label>
        <input id="interests" name="interests" maxLength={200} placeholder="恐龙、下雨天踩水坑、家里的小猫豆豆" className={field} />
      </div>
      <div>
        <label className={label} htmlFor="theme">故事主题 / 想对孩子说的话</label>
        <textarea id="theme" name="theme" required maxLength={300} rows={3} placeholder="第一次去幼儿园，有点害怕，但交到了新朋友" className={field} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="artStyle">画风</label>
          <select id="artStyle" name="artStyle" defaultValue="watercolor" className={field}>
            {Object.entries(ART_STYLES).map(([key, s]) => (
              <option key={key} value={key}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="pageCount">页数</label>
          <select id="pageCount" name="pageCount" defaultValue="6" className={field}>
            {[6, 7, 8].map((n) => (
              <option key={n} value={n}>{n} 页</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="extra">其他要求（可选）</label>
        <input id="extra" name="extra" maxLength={300} placeholder="希望出现奶奶，结尾温馨一些" className={field} />
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-accent py-3 text-lg font-medium text-white transition hover:brightness-105 disabled:opacity-60"
      >
        {submitting ? "正在写故事，大约需要半分钟…" : "生成绘本"}
      </button>
    </form>
  );
}
