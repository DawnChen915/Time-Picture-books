import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { saveBook } from "@/lib/storage";
import { generateStory } from "@/lib/story";
import { BookInputSchema, type Book } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const parsed = BookInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "表单内容有误" }, { status: 400 });
  }
  const input = parsed.data;

  try {
    const story = await generateStory(input);
    const book: Book = {
      id: nanoid(12),
      createdAt: new Date().toISOString(),
      input,
      title: story.title,
      dedication: story.dedication,
      characterSheet: story.characterSheet,
      cover: { status: "pending", prompt: story.coverPrompt },
      pages: story.pages.map((p) => ({ text: p.text, illustration: { status: "pending", prompt: p.illustrationPrompt } })),
    };
    await saveBook(book);
    return NextResponse.json({ id: book.id });
  } catch (err) {
    console.error("story generation failed:", err);
    const message = err instanceof Error ? err.message : "故事生成失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
