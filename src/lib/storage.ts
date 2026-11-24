import { promises as fs } from "node:fs";
import path from "node:path";
import type { Book } from "./types";

// MVP storage: one folder per book on local disk. Swap for a DB + object storage later.
const DATA_DIR = process.env.BOOKS_DATA_DIR ?? path.join(process.cwd(), ".data", "books");

const ID_RE = /^[A-Za-z0-9_-]{6,40}$/;

function bookDir(id: string) {
  if (!ID_RE.test(id)) throw new Error("invalid book id");
  return path.join(DATA_DIR, id);
}

export async function saveBook(book: Book) {
  const dir = bookDir(book.id);
  await fs.mkdir(dir, { recursive: true });
  const tmp = path.join(dir, `book.json.${process.pid}.${Date.now()}.tmp`);
  await fs.writeFile(tmp, JSON.stringify(book, null, 2));
  await fs.rename(tmp, path.join(dir, "book.json"));
}

export async function loadBook(id: string): Promise<Book | null> {
  try {
    const raw = await fs.readFile(path.join(bookDir(id), "book.json"), "utf8");
    return JSON.parse(raw) as Book;
  } catch {
    return null;
  }
}

export async function saveAsset(id: string, name: string, data: Buffer) {
  const dir = bookDir(id);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, path.basename(name)), data);
}

export async function readAsset(id: string, name: string): Promise<Buffer> {
  return fs.readFile(path.join(bookDir(id), path.basename(name)));
}

// Serialize read-modify-write per book so parallel requests don't clobber each other.
const locks = new Map<string, Promise<unknown>>();
export async function updateBook(id: string, fn: (book: Book) => void | Promise<void>): Promise<Book> {
  const prev = locks.get(id) ?? Promise.resolve();
  const next = prev.then(async () => {
    const book = await loadBook(id);
    if (!book) throw new Error("book not found");
    await fn(book);
    await saveBook(book);
    return book;
  });
  locks.set(id, next.catch(() => {}));
  return next;
}
