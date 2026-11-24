"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ageLabel, stageForAge } from "@/lib/stages";
import type { BookSummary } from "@/lib/types";
import { primaryButton } from "./formStyles";
import { useSavedFamily } from "./useSavedFamily";

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

/** "时光书架": the family's books along the child's timeline, grouped by the age they were made at. */
export function Bookshelf() {
  const { family, loaded } = useSavedFamily();
  const [books, setBooks] = useState<BookSummary[] | null>(null);

  useEffect(() => {
    if (!loaded) return;
    if (!family) {
      setBooks([]);
      return;
    }
    fetch(`/api/books?familyId=${encodeURIComponent(family.id)}`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<BookSummary[]>) : []))
      .then(setBooks)
      .catch(() => setBooks([]));
  }, [family, loaded]);

  if (!loaded || books === null) return <div className="h-64 animate-pulse rounded-3xl bg-white/60" />;

  if (books.length === 0) {
    return (
      <div className="rounded-3xl bg-white/70 px-6 py-16 text-center ring-1 ring-stone-100">
        <p className="font-serif text-xl">书架还是空的</p>
        <p className="mt-2 text-sm text-stone-500">{family ? `给${family.childName}做第一本绘本吧。` : "这个浏览器还没有做过绘本。"}</p>
        <Link href="/" className={`${primaryButton} mt-6 inline-block`}>
          去选绘本
        </Link>
      </div>
    );
  }

  const ages = [...new Set(books.map((b) => b.childAge))].sort((a, b) => b - a);

  return (
    <ol className="relative space-y-10 border-l-2 border-dashed border-stone-200 pl-6 sm:pl-10">
      {ages.map((age) => (
        <li key={age} className="relative">
          <span className="absolute -left-[calc(1.5rem+9px)] top-1.5 h-4 w-4 rounded-full bg-accent ring-4 ring-background sm:-left-[calc(2.5rem+9px)]" />
          <h2 className="mb-4 flex items-baseline gap-3">
            <span className="font-serif text-2xl font-bold">{ageLabel(age)}</span>
            <span className="text-sm text-stone-500">{stageForAge(age).name}</span>
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {books
              .filter((b) => b.childAge === age)
              .map((b) => (
                <Link key={b.id} href={`/books/${b.id}`} className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-100 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                    {b.coverFile ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/api/books/${b.id}/illustrations/0?v=${encodeURIComponent(b.coverFile)}`} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-stone-400">封面还没画好</div>
                    )}
                    {b.done < b.total && (
                      <span className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-xs ${b.failed ? "bg-red-500 text-white" : "bg-white/90 text-stone-600"}`}>
                        {b.failed ? `${b.failed} 页没画好` : `画了 ${b.done}/${b.total}`}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-serif font-bold group-hover:text-accent">{b.title}</div>
                    <div className="mt-0.5 text-xs text-stone-400">{formatDate(b.createdAt)}</div>
                  </div>
                </Link>
              ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
