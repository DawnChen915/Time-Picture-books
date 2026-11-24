"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ageLabel } from "@/lib/stages";
import type { Book, Family, Illustration } from "@/lib/types";
import { getSlot } from "@/lib/types";
import { ROLE_LABEL, type Role } from "@/templates";
import { BookPageView, IllustrationPicture, illustrationUrl, type PageContent } from "./BookPageView";
import { Flipbook } from "./Flipbook";
import { postDraw } from "./postDraw";
import { avatarUrl } from "./useSavedFamily";

const PAGE_CONCURRENCY = 2;
/** How often the viewer re-sends a request that never reached the image step (network, server restart). */
const MAX_CLIENT_TRIES = 3;

type Json = { book: Book; family: Family };

export function BookViewer({ initialBook, initialFamily }: { initialBook: Book; initialFamily: Family }) {
  const [book, setBook] = useState(initialBook);
  const [family, setFamily] = useState(initialFamily);
  const inFlight = useRef(new Set<number>());
  const tries = useRef(new Map<number, number>());
  const avatarInFlight = useRef(new Set<Role>());
  const avatarTries = useRef(new Map<Role, number>());
  const [retryingAll, setRetryingAll] = useState(false);

  const pageCount = book.pages.length;
  const slots = useMemo(() => Array.from({ length: pageCount + 1 }, (_, i) => i), [pageCount]);
  const statusOf = (s: number) => getSlot(book, s)?.status;
  const allDone = slots.every((s) => statusOf(s) === "done");
  const doneCount = slots.filter((s) => statusOf(s) === "done").length;
  const failed = slots.filter((s) => statusOf(s) === "error");

  const avatarStatus = (r: Role) => family.members[r]?.avatar.status;
  const avatarsDone = book.cast.every((r) => avatarStatus(r) === "done");

  const refresh = useCallback(async (): Promise<Json | null> => {
    const res = await fetch(`/api/books/${book.id}`, { cache: "no-store" }).catch(() => null);
    if (!res?.ok) return null;
    const json = (await res.json()) as Json;
    setBook(json.book);
    setFamily(json.family);
    return json;
  }, [book.id]);

  const patchSlot = useCallback((slot: number, patch: Partial<Illustration>) => {
    setBook((b) => {
      const next = structuredClone(b);
      Object.assign(getSlot(next, slot)!, patch);
      return next;
    });
  }, []);

  const illustrate = useCallback(
    async (slot: number) => {
      inFlight.current.add(slot);
      tries.current.set(slot, (tries.current.get(slot) ?? 0) + 1);
      patchSlot(slot, { status: "generating", error: undefined, attempt: undefined, retryReason: undefined });
      const message = await postDraw(`/api/books/${book.id}/illustrations/${slot}`);
      inFlight.current.delete(slot);
      const json = await refresh();
      // If the server never recorded a result, say so (with a retry button) instead of spinning forever.
      const ill = json && getSlot(json.book, slot);
      if (message && (!ill || ill.status === "pending")) patchSlot(slot, { status: "error", error: message });
    },
    [book.id, refresh, patchSlot],
  );

  const drawAvatar = useCallback(
    async (role: Role) => {
      avatarInFlight.current.add(role);
      avatarTries.current.set(role, (avatarTries.current.get(role) ?? 0) + 1);
      setFamily((f) => {
        const next = structuredClone(f);
        Object.assign(next.members[role]!.avatar, { status: "generating", error: undefined, attempt: undefined, retryReason: undefined });
        return next;
      });
      const message = await postDraw(`/api/families/${family.id}/avatars/${role}`);
      avatarInFlight.current.delete(role);
      const json = await refresh();
      const avatar = json?.family.members[role]?.avatar;
      if (message && (!avatar || avatar.status === "pending")) {
        setFamily((f) => {
          const next = structuredClone(f);
          Object.assign(next.members[role]!.avatar, { status: "error", error: message });
          return next;
        });
      }
    },
    [family.id, refresh],
  );

  // Drive generation: first each person's cartoon avatar, then every page drawn from those avatars.
  useEffect(() => {
    if (allDone) return;
    if (!avatarsDone) {
      book.cast
        .filter((r) => avatarStatus(r) === "pending" && !avatarInFlight.current.has(r) && (avatarTries.current.get(r) ?? 0) < MAX_CLIENT_TRIES)
        .forEach((r) => void drawAvatar(r));
      return;
    }
    const running = slots.filter((s) => inFlight.current.has(s) || statusOf(s) === "generating").length;
    const queue = slots
      .filter((s) => statusOf(s) === "pending" && !inFlight.current.has(s) && (tries.current.get(s) ?? 0) < MAX_CLIENT_TRIES)
      .slice(0, Math.max(0, PAGE_CONCURRENCY - running));
    queue.forEach((s) => void illustrate(s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, family, illustrate, drawAvatar, slots, avatarsDone, allDone]);

  // While anything is being drawn (here or in another tab), poll so progress and retries show up.
  useEffect(() => {
    const generating = slots.some((s) => statusOf(s) === "generating") || book.cast.some((r) => avatarStatus(r) === "generating");
    if (!generating) return;
    const t = setInterval(refresh, 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, family, refresh, slots]);

  const retry = (slot: number) => {
    tries.current.delete(slot);
    void illustrate(slot);
  };

  async function retryAllFailed() {
    setRetryingAll(true);
    for (const s of failed) tries.current.delete(s);
    await fetch(`/api/books/${book.id}/retry`, { method: "POST" }).catch(() => {});
    await refresh();
    setRetryingAll(false);
  }

  const retryAvatar = (role: Role) => {
    avatarTries.current.delete(role);
    void drawAvatar(role);
  };

  const content: PageContent = {
    title: book.title,
    subtitle: `献给 ${book.childName}${book.childAge !== undefined ? ` · ${ageLabel(book.childAge)}` : ""}`,
    dedication: book.dedication,
    pages: book.pages,
  };

  const avatarErrors = !allDone ? book.cast.filter((r) => avatarStatus(r) === "error") : [];

  return (
    <Flipbook
      totalPages={pageCount + 2}
      fileName={`${book.title}.pdf`}
      canExport={allDone}
      exportHint="插图画完后就可以导出"
      back={{ href: "/books", label: "← 我的书架" }}
      status={
        <>
          {!allDone && !avatarsDone && <span>正在生成卡通形象…</span>}
          {!allDone && avatarsDone && <span>插图进度 {doneCount}/{slots.length}</span>}
          {failed.length > 0 && (
            <button
              onClick={retryAllFailed}
              disabled={retryingAll}
              className="rounded-full bg-white px-4 py-2 text-accent ring-1 ring-accent/40 hover:bg-accent/5 disabled:opacity-60"
            >
              {retryingAll ? "正在安排…" : `重画失败的 ${failed.length} 页`}
            </button>
          )}
        </>
      }
      banner={
        <>
          <div className="mb-4 flex flex-wrap justify-center gap-4">
            {book.cast.map((r) => {
              const a = family.members[r]?.avatar;
              return (
                <div key={r} className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-sm shadow-sm ring-1 ring-stone-100">
                  {a?.status === "done" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl(family, r)} alt="" className="h-9 w-9 rounded-full bg-stone-50 object-cover object-top" />
                  ) : (
                    <span className={`h-9 w-9 rounded-full bg-stone-100 ${a?.status === "error" ? "" : "animate-pulse"}`} />
                  )}
                  <span>{ROLE_LABEL[r]}</span>
                  {a?.status === "generating" && (a.attempt ?? 1) > 1 && <span className="text-xs text-stone-400">自动重试第 {a.attempt} 次</span>}
                  {a?.status === "error" && (
                    <button className="text-accent" title={a.error} onClick={() => retryAvatar(r)}>
                      重新生成
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {avatarErrors.map((r) => (
            <p key={r} className="mx-auto mb-4 w-full max-w-4xl rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {ROLE_LABEL[r]}的形象没生成成功：{family.members[r]?.avatar.error}
            </p>
          ))}
        </>
      }
      renderPage={(index, forPdf) => (
        <BookPageView
          content={content}
          index={index}
          picture={(slot) => {
            const ill = getSlot(book, slot)!;
            return <IllustrationPicture
                src={illustrationUrl(book.id, slot, ill)}
                ill={ill}
                onRetry={forPdf ? undefined : () => retry(slot)}
                queuedLabel={avatarsDone ? undefined : "等卡通形象画好后开始画…"}
              />;
          }}
        />
      )}
    />
  );
}
