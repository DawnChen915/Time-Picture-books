import { FamilyEditor } from "@/components/FamilyEditor";

export const metadata = { title: "家人档案 · 时光绘本" };

export default function FamilyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 font-serif text-3xl font-bold">家人档案</h1>
      <p className="mb-8 text-stone-500">填一次，以后每本绘本都直接用。宝宝长大了，随时回来更新。</p>
      <FamilyEditor />
    </main>
  );
}
