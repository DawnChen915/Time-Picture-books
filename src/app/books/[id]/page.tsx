import { notFound } from "next/navigation";
import { BookViewer } from "@/components/BookViewer";
import { publicFamily } from "@/lib/publicFamily";
import { loadBook, loadFamily } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await loadBook(id).catch(() => null);
  const family = book && (await loadFamily(book.familyId));
  if (!book || !family) notFound();
  return <BookViewer initialBook={book} initialFamily={publicFamily(family)} />;
}
