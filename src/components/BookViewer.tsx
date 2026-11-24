"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Book } from "@/lib/types";
import { getSlot } from "@/lib/types";
import { BookPageView } from "./BookPageView";

const PAGE_CONCURRENCY = 2;

export function BookViewer({ initialBook }: { initialBook: Book }) {
  const [book, setBook] = useState(initialBook);
  const [index, setIndex] = useState(0);
  const [exporting, setExporting] = useState(false);
  const started = useRef(new Set<number>());
  const exportRoot = useRef<HTMLDivElement>(null);

  const totalPages = book.pages.length + 2; // cover + story pages + back page
  const pageCount = book.pages.length;
  const slots = useMemo(() => Array.from({ length: pageCount + 1 }, (_, i) => i), [pageCount]);
  const allDone = slots.every((s) => getSlot(book, s)?.status === "done");
  const doneCount = slots.filter((s) => getSlot(book, s)?.status === "done").length;

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/books/${book.id}`, { cache: "no-store" });
    if (res.ok) setBook(await res.json());
  }, [book.id]);

  const illustrate = useCallback(
    async (slot: number) => {
      started.current.add(slot);
      setBook((b) => {
        const next = structuredClone(b);
        getSlot(next, slot)!.status = "generating";
        return next;
      });
      await fetch(`/api/books/${book.id}/illustrations/${slot}`, { method: "POST" }).catch(() => {});
      await refresh();
    },
    [book.id, refresh],
  );

  // Drive illustration generation: cover first (it becomes the character reference), then pages.
  useEffect(() => {
    const pending = (s: number) => getSlot(book, s)?.status === "pending" && !started.current.has(s);
    if (book.cover.status !== "done") {
      if (pending(0)) void illustrate(0);
      return;
    }
    const inFlight = slots.filter((s) => getSlot(book, s)?.status === "generating").length;
    const queue = slots.filter(pending).slice(0, Math.max(0, PAGE_CONCURRENCY - inFlight));
    queue.forEach((s) => void illustrate(s));
  }, [book, illustrate, slots]);

  // If the page is reopened while the server is still drawing, poll until it finishes.
  useEffect(() => {
    const generating = slots.some((s) => getSlot(book, s)?.status === "generating");
    if (!generating) return;
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
  }, [book, refresh, slots]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => Math.min(totalPages - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [totalPages]);

  async function onExport() {
    if (!exportRoot.current) return;
    setExporting(true);
    try {
      const { exportBookPdf } = await import("./exportPdf");
      await exportBookPdf(exportRoot.current, `${book.title}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  const retry = (slot: number) => {
    started.current.delete(slot);
    void illustrate(slot);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-800">← 再做一本</Link>
        <div className="flex items-center gap-3 text-sm text-stone-500">
          {!allDone && <span>插图进度 {doneCount}/{slots.length}</span>}
          <button
            onClick={onExport}
            disabled={!allDone || exporting}
            className="rounded-full bg-accent px-5 py-2 font-medium text-white disabled:opacity-50"
            title={allDone ? "" : "插图画完后就可以导出"}
          >
            {exporting ? "正在导出…" : "导出 PDF"}
          </button>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-4xl">
        <div className="@container aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl ring-1 ring-stone-200" style={{ containerType: "inline-size" }}>
          <div key={index} className="h-full w-full animate-[fadein_.35s_ease]">
            <BookPageView book={book} index={index} onRetry={retry} />
          </div>
        </div>
        <button
          aria-label="上一页"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-md ring-1 ring-stone-200 disabled:opacity-0 sm:-translate-x-[130%]"
        >
          ‹
        </button>
        <button
          aria-label="下一页"
          onClick={() => setIndex((i) => Math.min(totalPages - 1, i + 1))}
          disabled={index === totalPages - 1}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-white p-3 shadow-md ring-1 ring-stone-200 disabled:opacity-0 sm:translate-x-[130%]"
        >
          ›
        </button>
      </div>

      <div className="mt-5 flex justify-center gap-1.5">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            aria-label={`第 ${i} 页`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-accent" : "w-2 bg-stone-300"}`}
          />
        ))}
      </div>

      {/* Off-screen copy of every page at a fixed size, used for PDF export. */}
      <div ref={exportRoot} aria-hidden className="pointer-events-none fixed left-[-20000px] top-0">
        {Array.from({ length: totalPages }, (_, i) => (
          <div key={i} data-pdf-page className="h-[900px] w-[1200px] overflow-hidden" style={{ containerType: "inline-size" }}>
            <BookPageView book={book} index={i} />
          </div>
        ))}
      </div>
    </main>
  );
}
