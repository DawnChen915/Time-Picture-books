import { BookForm } from "@/components/BookForm";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="font-serif text-4xl font-bold tracking-wide">时光绘本</h1>
        <p className="mt-3 text-stone-500">写下关于孩子的几件小事，生成一本以 TA 为主角的绘本。</p>
      </header>
      <BookForm />
    </main>
  );
}
