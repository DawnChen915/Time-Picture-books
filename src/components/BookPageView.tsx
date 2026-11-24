import type { Book, Illustration } from "@/lib/types";

export function illustrationUrl(bookId: string, slot: number, ill: Illustration) {
  return `/api/books/${bookId}/illustrations/${slot}?v=${encodeURIComponent(ill.file ?? "")}`;
}

function Picture({ book, slot, ill, onRetry }: { book: Book; slot: number; ill: Illustration; onRetry?: (slot: number) => void }) {
  if (ill.status === "done") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={illustrationUrl(book.id, slot, ill)} alt="" className="h-full w-full object-cover" />;
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-stone-100 text-stone-500">
      {ill.status === "error" ? (
        <>
          <span>这张插图没画好：{ill.error}</span>
          {onRetry && (
            <button onClick={() => onRetry(slot)} className="rounded-full bg-white px-4 py-1.5 text-sm shadow-sm ring-1 ring-stone-200">
              重新画
            </button>
          )}
        </>
      ) : (
        <>
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-stone-300 border-t-accent" />
          <span>{ill.status === "generating" ? "正在画插图…" : "排队等待画插图…"}</span>
        </>
      )}
    </div>
  );
}

/**
 * One page of the book at a fixed 4:3 ratio. index 0 = cover, 1..n = story pages,
 * n+1 = back page. Sized by its container so the same markup is used on screen and in the PDF.
 */
export function BookPageView({ book, index, onRetry }: { book: Book; index: number; onRetry?: (slot: number) => void }) {
  if (index === 0) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-white">
        <Picture book={book} slot={0} ill={book.cover} onRetry={onRetry} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent px-[6%] pb-[5%] pt-[12%] text-white">
          <h1 className="font-serif text-[clamp(1.5rem,5cqw,3.5rem)] font-bold leading-tight drop-shadow">{book.title}</h1>
          <p className="mt-[1%] text-[clamp(0.8rem,1.8cqw,1.25rem)] opacity-90">献给 {book.childName}</p>
        </div>
      </div>
    );
  }

  if (index > book.pages.length) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-[3%] bg-[#fbf3e8] px-[10%] text-center">
        <p className="font-serif text-[clamp(1rem,2.6cqw,1.9rem)] leading-relaxed">{book.dedication}</p>
        <p className="font-serif text-[clamp(1.5rem,5cqw,3rem)]">完</p>
      </div>
    );
  }

  const page = book.pages[index - 1];
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="h-[70%] w-full overflow-hidden">
        <Picture book={book} slot={index} ill={page.illustration} onRetry={onRetry} />
      </div>
      <div className="relative flex flex-1 items-center justify-center px-[7%]">
        <p className="text-center font-serif text-[clamp(0.9rem,2.3cqw,1.6rem)] leading-relaxed">{page.text}</p>
        <span className="absolute bottom-[6%] right-[4%] text-[clamp(0.6rem,1.2cqw,0.9rem)] text-stone-400">{index}</span>
      </div>
    </div>
  );
}
