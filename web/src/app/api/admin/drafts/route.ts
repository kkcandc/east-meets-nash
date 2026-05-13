import { NextResponse } from "next/server";
import { createDraft, listDrafts, replaceDrafts } from "@/lib/local-store";
import type { DraftInput } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ drafts: await listDrafts() });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<DraftInput> | null;
  if (!body?.title || !body.deck || !body.zone || !body.beat || !body.confidence || !body.body) {
    return NextResponse.json({ error: "Missing required draft fields" }, { status: 400 });
  }
  const draft = await createDraft({
    title: body.title,
    deck: body.deck,
    zone: body.zone,
    beat: body.beat,
    confidence: body.confidence,
    sourceUrl: body.sourceUrl,
    sourceNote: body.sourceNote,
    verificationNote: body.verificationNote,
    internalNote: body.internalNote,
    risk: body.risk,
    visualTitle: body.visualTitle,
    visualSummary: body.visualSummary,
    visualItems: body.visualItems,
    body: body.body,
  });
  return NextResponse.json({ draft }, { status: 201 });
}

export async function DELETE() {
  await replaceDrafts([]);
  return NextResponse.json({ drafts: [] });
}
