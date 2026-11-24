"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Page-turning shell shared by custom and ready-made books: arrows, keyboard, page dots and PDF
 * export. `renderPage(i, forPdf)` draws page i; the PDF copy hides interactive bits like retry buttons.
 */
export function Flipbook({
  totalPages,
  renderPage,
  fileName,
  canExport,
  exportHint,
  status,
  banner,
  back = { href: "/", label: "← 返回" },
}: {
  totalPages: number;
  renderPage: (index: number, forPdf: boolean) => ReactNode;
  fileName: string;
  canExport: boolean;
  exportHint?: string;
  /** Short progress text next to the export button. */
  status?: ReactNode;
  /** Shown between the toolbar and the page (avatars, errors…). */
  banner?: ReactNode;
  back?: { href: string; label: string };
}) {
  const [index, setIndex] = useState(0);
  const [exporting, setExporting] = useState(false);
  const exportRoot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
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
      await exportBookPdf(exportRoot.current, fileName);
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={back.href} className="text-sm text-stone-500 hover:text-stone-800">
          {back.label}
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
          {status}
          <button
            onClick={onExport}
            disabled={!canExport || exporting}
            className="rounded-full bg-accent px-5 py-2 font-medium text-white disabled:opacity-50"
            title={canExport ? "" : exportHint}
          >
            {exporting ? "正在导出…" : "导出 PDF"}
          </button>
        </div>
      </div>

      {banner}

      <div className="relative mx-auto w-full max-w-4xl">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl ring-1 ring-stone-200" style={{ containerType: "inline-size" }}>
          <div key={index} className="h-full w-full animate-[fadein_.35s_ease]">
            {renderPage(index, false)}
          </div>
        </div>
        <button
          aria-label="上一页"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="absolute left-0 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white text-xl shadow-md ring-1 ring-stone-200 disabled:opacity-0 xl:-translate-x-[130%]"
        >
          ‹
        </button>
        <button
          aria-label="下一页"
          onClick={() => setIndex((i) => Math.min(totalPages - 1, i + 1))}
          disabled={index === totalPages - 1}
          className="absolute right-0 top-1/2 h-11 w-11 -translate-y-1/2 translate-x-1/2 rounded-full bg-white text-xl shadow-md ring-1 ring-stone-200 disabled:opacity-0 xl:translate-x-[130%]"
        >
          ›
        </button>
      </div>

      <div className="mt-5 flex justify-center gap-1.5">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            aria-label={i === 0 ? "封面" : `第 ${i} 页`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-accent" : "w-2 bg-stone-300"}`}
          />
        ))}
      </div>

      {/* Off-screen copy of every page at a fixed size, used for PDF export. */}
      <div ref={exportRoot} aria-hidden className="pointer-events-none fixed left-[-20000px] top-0">
        {Array.from({ length: totalPages }, (_, i) => (
          <div key={i} data-pdf-page className="h-[900px] w-[1200px] overflow-hidden" style={{ containerType: "inline-size" }}>
            {renderPage(i, true)}
          </div>
        ))}
      </div>
    </main>
  );
}
