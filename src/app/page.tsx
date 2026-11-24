import { BookForm } from "@/components/BookForm";
import { TEMPLATES } from "@/templates";

export default function Home() {
  const templates = TEMPLATES.map(({ id, title, summary, cast, pages }) => ({ id, title, summary, cast, pageCount: pages.length }));
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-wide">时光绘本</h1>
        <p className="mt-3 text-stone-500">选一个故事，上传宝宝和爸爸妈妈的照片，做一本你们一家当主角的绘本。</p>
      </header>
      <BookForm templates={templates} />
    </main>
  );
}
