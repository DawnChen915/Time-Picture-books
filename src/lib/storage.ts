import { promises as fs } from "node:fs";
import path from "node:path";
import type { Book, Family } from "./types";

// MVP storage: one folder per record on local disk. Swap for a DB + object storage later.
const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), ".data");

type Kind = "books" | "families";
const ID_RE = /^[A-Za-z0-9_-]{6,40}$/;

function dir(kind: Kind, id: string) {
  if (!ID_RE.test(id)) throw new Error("invalid id");
  return path.join(DATA_DIR, kind, id);
}

async function save(kind: Kind, id: string, record: unknown) {
  const d = dir(kind, id);
  await fs.mkdir(d, { recursive: true });
  const tmp = path.join(d, `record.json.${process.pid}.${Date.now()}.tmp`);
  await fs.writeFile(tmp, JSON.stringify(record, null, 2));
  await fs.rename(tmp, path.join(d, "record.json"));
}

async function load<T>(kind: Kind, id: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(path.join(dir(kind, id), "record.json"), "utf8")) as T;
  } catch {
    return null;
  }
}

export async function saveAsset(kind: Kind, id: string, name: string, data: Buffer) {
  const d = dir(kind, id);
  await fs.mkdir(d, { recursive: true });
  await fs.writeFile(path.join(d, path.basename(name)), data);
}

export async function readAsset(kind: Kind, id: string, name: string) {
  return fs.readFile(path.join(dir(kind, id), path.basename(name)));
}

export async function deleteAsset(kind: Kind, id: string, name: string) {
  await fs.rm(path.join(dir(kind, id), path.basename(name)), { force: true });
}

// Serialize read-modify-write per record so parallel requests don't clobber each other.
const locks = new Map<string, Promise<unknown>>();
async function update<T>(kind: Kind, id: string, fn: (r: T) => void | Promise<void>): Promise<T> {
  const key = `${kind}/${id}`;
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.then(async () => {
    const r = await load<T>(kind, id);
    if (!r) throw new Error("not found");
    await fn(r);
    await save(kind, id, r);
    return r;
  });
  locks.set(key, next.catch(() => {}));
  return next;
}

export const saveBook = (b: Book) => save("books", b.id, b);
export const loadBook = (id: string) => load<Book>("books", id);
export const updateBook = (id: string, fn: (b: Book) => void | Promise<void>) => update<Book>("books", id, fn);

export const saveFamily = (f: Family) => save("families", f.id, f);
export const loadFamily = (id: string) => load<Family>("families", id);
export const updateFamily = (id: string, fn: (f: Family) => void | Promise<void>) => update<Family>("families", id, fn);
