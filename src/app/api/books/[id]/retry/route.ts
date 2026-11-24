import { NextResponse } from "next/server";
import { updateBook } from "@/lib/storage";
import { getSlot } from "@/lib/types";

export const runtime = "nodejs";

/** Put every failed illustration back in the queue; the viewer then redraws them a few at a time. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    let count = 0;
    await updateBook(id, (b) => {
      for (let s = 0; s <= b.pages.length; s++) {
        const ill = getSlot(b, s)!;
        if (ill.status === "error") {
          ill.status = "pending";
          ill.error = undefined;
          count++;
        }
      }
    });
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: "找不到这本绘本" }, { status: 404 });
  }
}
