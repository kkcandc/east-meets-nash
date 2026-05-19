import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDraftById } from "@/lib/local-store";
import type { LocalDraft } from "@/lib/types";

interface DraftPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Chicago",
  }).format(new Date(value));
}

function bodyBlocks(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function isBulletBlock(block: string): boolean {
  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
  return lines.length > 1 && lines.every((line) => line.startsWith("- "));
}

function DraftBody({ draft }: { draft: LocalDraft }) {
  return (
    <div className="article-body draft-body">
      {bodyBlocks(draft.body).map((block) => {
        if (isBulletBlock(block)) {
          return (
            <ul className="draft-bullet-list" key={block}>
              {block.split("\n").map((line) => (
                <li key={line}>{line.replace(/^- /, "")}</li>
              ))}
            </ul>
          );
        }
        return <p key={block}>{block}</p>;
      })}
    </div>
  );
}

function DraftSignalCard({ draft }: { draft: LocalDraft }) {
  if (!draft.visualTitle && !draft.visualSummary && !draft.visualItems?.length) return null;

  return (
    <figure className="draft-signal-card" aria-label="Anonymized source signal">
      <p className="eyebrow">Anonymized Source Signal</p>
      {draft.visualTitle ? <h2>{draft.visualTitle}</h2> : null}
      {draft.visualSummary ? <p>{draft.visualSummary}</p> : null}
      {draft.visualItems?.length ? (
        <ul>
          {draft.visualItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      <figcaption>
        Screenshots can publish when they add source texture; hard-redact kids, medical/financial details, private
        private home addresses, phones, plates, and unverified private-person accusations.
      </figcaption>
    </figure>
  );
}

export async function generateMetadata({ params }: DraftPageProps): Promise<Metadata> {
  const { id } = await params;
  const draft = await getDraftById(id);
  if (!draft) return {};
  return {
    title: draft.title,
    description: draft.deck,
  };
}

export default async function DraftPage({ params }: DraftPageProps) {
  const { id } = await params;
  const draft = await getDraftById(id);
  if (!draft) notFound();

  return (
    <main className="article-shell">
      <article className="article-main draft-article">
        <div className="story-meta">
          <span className="pill hot">{draft.confidence}</span>
          <span>{draft.zone}</span>
          <span>{draft.beat}</span>
          {draft.risk ? <span>{draft.risk} risk</span> : null}
          <span>{draft.status}</span>
        </div>
        <h1>{draft.title}</h1>
        <p className="article-deck">{draft.deck}</p>
        <DraftSignalCard draft={draft} />
        <DraftBody draft={draft} />
        <section className="article-section">
          <h2>Source</h2>
          <p>
            {draft.sourceUrl ? <a href={draft.sourceUrl}>{draft.sourceUrl}</a> : "No source link attached yet."}
          </p>
          {draft.sourceNote ? <p className="source-note">{draft.sourceNote}</p> : null}
        </section>
      </article>

      <aside className="article-rail">
        <section className="rail-card">
          <p className="eyebrow">Draft Status</p>
          <h2>{draft.status}</h2>
          <p>Created {formatDate(draft.createdAt)}</p>
          <div className="button-row">
            <Link className="big-link-button" href="/admin">
              Launch Desk
            </Link>
            <Link className="big-link-button" href="/admin/sources">
              Source Desk
            </Link>
          </div>
        </section>
        <section className="rail-card">
          <p className="eyebrow">Editor Note</p>
          <h2>Not Published</h2>
          <p>{draft.sourceNote || "This is a local draft preview. Keep the private-platform source note internal until it is verified."}</p>
        </section>
        {draft.verificationNote ? (
          <section className="rail-card">
            <p className="eyebrow">Verification</p>
            <h2>Before Publish</h2>
            <p>{draft.verificationNote}</p>
          </section>
        ) : null}
        {draft.internalNote ? (
          <details className="rail-card draft-internal-note">
            <summary>Internal Source Note</summary>
            <p>{draft.internalNote}</p>
          </details>
        ) : null}
      </aside>
    </main>
  );
}
