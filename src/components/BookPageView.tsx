import type { ReactNode } from "react";
import type { Illustration } from "@/lib/types";

export interface PageContent {
  title: string;
  /** Under the title on the cover, e.g. "献给 小米". */
  subtitle: string;
  /** Last page. \n starts a new line. */
  dedication: string;
  pages: { text: string }[];
  /** Bigger, shorter text for toddler books. */
  large?: boolean;
}

export function illustrationUrl(bookId: string, slot: number, ill: Illustration) {
  return `/api/books/${bookId}/illustrations/${slot}?v=${encodeURIComponent(ill.file ?? "")}`;
}

/** A generated illustration, or its progress / error state with a retry button. */
export function IllustrationPicture({ src, ill, onRetry, queuedLabel = "排队等待画插图…" }: { src: string; ill: Illustration; onRetry?: () => void; queuedLabel?: string }) {
  if (ill.status === "done") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="h-full w-full object-cover" />;
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-stone-100 px-[8%] text-center text-stone-500">
      {ill.status === "error" ? (
        <>
          <span className="text-2xl">🖍️</span>
          <span className="max-w-xl text-sm">这张插图没画好：{ill.error}</span>
          {onRetry && (
            <button onClick={onRetry} className="rounded-full bg-white px-4 py-1.5 text-sm text-accent shadow-sm ring-1 ring-stone-200 hover:bg-accent hover:text-white">
              重新画这一页
            </button>
          )}
        </>
      ) : (
        <>
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-stone-300 border-t-accent" />
          <span>{ill.status === "generating" ? ((ill.attempt ?? 1) > 1 ? `上次没画好，正在自动重试（第 ${ill.attempt} 次）…` : "正在画插图…") : queuedLabel}</span>
          {ill.status === "generating" && ill.retryReason && <span className="max-w-xl text-xs text-stone-400">上次的原因：{ill.retryReason}</span>}
        </>
      )}
    </div>
  );
}

/**
 * One page of a book at a fixed 4:3 ratio. index 0 = cover, 1..n = story pages,
 * n+1 = back page. Sized by its container so the same markup is used on screen and in the PDF.
 */
export function BookPageView({ content, index, picture }: { content: PageContent; index: number; picture: (slot: number) => ReactNode }) {
  if (index === 0) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-white">
        {picture(0)}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent px-[6%] pb-[5%] pt-[12%] text-white">
          <h1 className="font-serif text-[clamp(1.5rem,5cqw,3.5rem)] font-bold leading-tight drop-shadow">{content.title}</h1>
          <p className="mt-[1%] text-[clamp(0.8rem,1.8cqw,1.25rem)] opacity-90">{content.subtitle}</p>
        </div>
      </div>
    );
  }

  if (index > content.pages.length) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-[3%] bg-[#fbf3e8] px-[10%] text-center">
        <p className="whitespace-pre-line font-serif text-[clamp(1rem,2.6cqw,1.9rem)] leading-relaxed">{content.dedication}</p>
        <p className="font-serif text-[clamp(1.5rem,5cqw,3rem)]">完</p>
      </div>
    );
  }

  const page = content.pages[index - 1];
  return (
    <div className="flex h-full w-full flex-col bg-white">
      <div className="h-[70%] w-full overflow-hidden">{picture(index)}</div>
      <div className="relative flex flex-1 items-center justify-center px-[7%]">
        <p
          className={`whitespace-pre-line text-center font-serif leading-relaxed ${
            content.large ? "text-[clamp(1.1rem,3.3cqw,2.4rem)] font-bold tracking-wider" : "text-[clamp(0.9rem,2.3cqw,1.6rem)]"
          }`}
        >
          {page.text}
        </p>
        <span className="absolute bottom-[6%] right-[4%] text-[clamp(0.6rem,1.2cqw,0.9rem)] text-stone-400">{index}</span>
      </div>
    </div>
  );
}
