import { notFound } from "next/navigation";
import { BookForm } from "@/components/BookForm";
import { getTemplate } from "@/templates";

export default async function CreatePage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;
  const t = getTemplate(templateId);
  if (!t) notFound();
  const template = { id: t.id, title: t.title, summary: t.summary, cast: t.cast, pageCount: t.pages.length, ages: t.ages };
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <BookForm template={template} />
    </main>
  );
}
