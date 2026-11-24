"use client";

import Link from "next/link";
import { LIBRARY } from "@/library";
import { ageLabel, rangeLabel, STAGES, stageAgeLabel, stageForAge } from "@/lib/stages";
import { ROLE_LABEL, TEMPLATES } from "@/templates";
import { useSavedFamily } from "./useSavedFamily";

/**
 * Home: every book laid out along the "时光" timeline of childhood stages. The child's current
 * stage is marked, so parents see at a glance what fits now and what comes next.
 */
export function Catalog() {
  const { family } = useSavedFamily();
  const current = family ? stageForAge(family.childAge) : null;
  const childName = family?.childName ?? "宝宝";
  const fill = (s: string) => s.replaceAll("{name}", childName);

  return (
    <div>
      <section className="mb-12 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-wide sm:text-5xl">时光绘本</h1>
        <p className="mt-4 text-stone-500">每一段时光，都有一本属于 TA 的书。</p>
        {family && current && (
          <p className="mt-3 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm text-accent">
            {family.childName} {ageLabel(family.childAge)}，正在「{current.name}」
          </p>
        )}
      </section>

      <ol className="relative space-y-12 border-l-2 border-dashed border-stone-200 pl-6 sm:pl-10">
        {STAGES.map((stage) => {
          const library = LIBRARY.filter((b) => b.stage === stage.id);
          const templates = TEMPLATES.filter((t) => t.stage === stage.id);
          const isCurrent = current?.id === stage.id;
          return (
            <li key={stage.id} id={stage.id} className="relative scroll-mt-20">
              <span
                className={`absolute -left-[calc(1.5rem+9px)] top-1.5 h-4 w-4 rounded-full ring-4 ring-background sm:-left-[calc(2.5rem+9px)] ${
                  isCurrent ? "bg-accent" : "bg-stone-300"
                }`}
              />
              <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="font-serif text-2xl font-bold">{stage.name}</h2>
                <span className="text-stone-500">{stageAgeLabel(stage)}</span>
                {isCurrent && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-white">{childName}在这里</span>}
              </div>
              <p className="mb-5 text-sm text-stone-500">{stage.tagline}</p>

              {library.length === 0 && templates.length === 0 && (
                <p className="rounded-2xl bg-white/60 px-5 py-6 text-sm text-stone-400 ring-1 ring-stone-100">这一段时光的绘本正在准备中，敬请期待。</p>
              )}

              {library.length > 0 && (
                <>
                  <h3 className="mb-3 text-sm font-medium text-stone-600">现成绘本 · 免费读</h3>
                  <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {library.map((b) => {
                      const Cover = b.cover;
                      return (
                        <Link key={b.id} href={`/library/${b.id}`} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-100 transition hover:-translate-y-0.5 hover:shadow-md">
                          <div className="aspect-[4/3] overflow-hidden">
                            <Cover />
                          </div>
                          <div className="p-3">
                            <div className="font-serif font-bold group-hover:text-accent">{b.title}</div>
                            <div className="mt-0.5 text-xs text-stone-400">
                              {rangeLabel(b.ages)} · {b.pages.length} 页
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}

              {templates.length > 0 && (
                <>
                  <h3 className="mb-3 text-sm font-medium text-stone-600">定制绘本 · 主角是{childName}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {templates.map((t) => (
                      <Link
                        key={t.id}
                        href={`/create/${t.id}`}
                        className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100 transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="font-serif text-lg font-bold group-hover:text-accent">{fill(t.title)}</div>
                        <p className="mt-1 text-sm text-stone-500">{fill(t.summary)}</p>
                        <p className="mt-3 text-xs text-stone-400">
                          {rangeLabel(t.ages)} · {t.pages.length} 页 · 主角：{t.cast.map((r) => ROLE_LABEL[r]).join("、")}
                        </p>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
