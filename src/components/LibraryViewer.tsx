"use client";

import { getLibraryBook } from "@/library";
import { rangeLabel } from "@/lib/stages";
import { BookPageView, type PageContent } from "./BookPageView";
import { Flipbook } from "./Flipbook";
import { useSavedFamily } from "./useSavedFamily";

/** Reader for the ready-made books. Pictures are SVG drawn in the page, so there is nothing to wait for. */
export function LibraryViewer({ id }: { id: string }) {
  const book = getLibraryBook(id)!;
  const { family } = useSavedFamily();

  const content: PageContent = {
    title: book.title,
    subtitle: family ? `读给 ${family.childName} 听 · 适合 ${rangeLabel(book.ages)}` : `时光绘本 · 适合 ${rangeLabel(book.ages)}`,
    dedication: book.dedication,
    pages: book.pages,
    large: true,
  };

  return (
    <Flipbook
      totalPages={book.pages.length + 2}
      fileName={`${book.title}.pdf`}
      canExport
      back={{ href: "/", label: "← 选绘本" }}
      status={<span>免费阅读 · {book.pages.length} 页</span>}
      renderPage={(index) => (
        <BookPageView
          content={content}
          index={index}
          picture={(slot) => {
            const Art = slot === 0 ? book.cover : book.pages[slot - 1].art;
            return <Art />;
          }}
        />
      )}
    />
  );
}
