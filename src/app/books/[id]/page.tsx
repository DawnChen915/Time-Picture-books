import { notFound } from "next/navigation";
import { BookViewer } from "@/components/BookViewer";
import { loadBook } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await loadBook(id).catch(() => null);
  if (!book) notFound();
  return <BookViewer initialBook={book} />;
}
