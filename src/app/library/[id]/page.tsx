import { notFound } from "next/navigation";
import { LibraryViewer } from "@/components/LibraryViewer";
import { getLibraryBook, LIBRARY } from "@/library";

export function generateStaticParams() {
  return LIBRARY.map((b) => ({ id: b.id }));
}

export default async function LibraryBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getLibraryBook(id)) notFound();
  return <LibraryViewer id={id} />;
}
