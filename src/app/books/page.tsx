import { Bookshelf } from "@/components/Bookshelf";

export const metadata = { title: "我的书架 · 时光绘本" };

export default function BooksPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 font-serif text-3xl font-bold">时光书架</h1>
      <p className="mb-8 text-stone-500">每一本都记着 TA 当时的年纪，翻着翻着，就长大了。</p>
      <Bookshelf />
    </main>
  );
}
