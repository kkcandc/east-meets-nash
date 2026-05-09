import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { LocalDraft } from "@/lib/types";

const dataRoot = join(process.cwd(), ".local-data");

async function readJson<T>(filename: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(join(dataRoot, filename), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(filename: string, data: T): Promise<void> {
  const filePath = join(dataRoot, filename);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function listDrafts(): Promise<LocalDraft[]> {
  return readJson<LocalDraft[]>("drafts.json", []);
}

export async function createDraft(input: Omit<LocalDraft, "id" | "createdAt" | "status">): Promise<LocalDraft> {
  const drafts = await listDrafts();
  const draft: LocalDraft = {
    ...input,
    id: `draft_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "draft",
  };
  await writeJson("drafts.json", [draft, ...drafts]);
  return draft;
}

export async function replaceDrafts(drafts: LocalDraft[]): Promise<void> {
  await writeJson("drafts.json", drafts);
}
