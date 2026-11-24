"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "选绘本" },
  { href: "/books", label: "我的书架" },
  { href: "/family", label: "家人档案" },
];

export function SiteHeader() {
  const path = usePathname();
  const active = (href: string) => (href === "/" ? path === "/" || path.startsWith("/create") || path.startsWith("/library") : path.startsWith(href));
  return (
    <header className="border-b border-stone-200/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-serif text-xl font-bold tracking-wide">
          时光绘本
        </Link>
        <nav className="flex gap-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-1.5 transition ${active(l.href) ? "bg-accent/10 font-medium text-accent" : "text-stone-500 hover:text-stone-800"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
