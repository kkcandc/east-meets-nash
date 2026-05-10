"use client";

import { useState } from "react";
import type { SourceItem } from "@/lib/types";

interface DraftResult {
  status: "idle" | "creating" | "created" | "error";
  message?: string;
}

function draftTitleFor(item: SourceItem): string {
  if (item.id === "src-facebook-group") {
    return "What The Group Chat Is Already Mad About";
  }
  if (item.id === "src-ndot-permits") {
    return "Cone Watch Has Entered The Morning";
  }
  if (item.id === "src-dev-tracker-gallatin") {
    return "The Gallatin Development Tracker Is Doing Its Little Dance";
  }
  return item.title;
}

function draftBodyFor(item: SourceItem): string {
  return [
    item.suggestedAngle,
    "",
    `Source to verify: ${item.source}`,
    `Source URL: ${item.url}`,
    `Risk: ${item.risk}. Confidence: ${item.confidence}.`,
    item.cadence ? `Cadence: ${item.cadence}.` : "",
    item.verificationRule ? `Verification rule: ${item.verificationRule}` : "",
    "",
    "Drafting notes: lead with the useful fact, label the sourcing clearly, then let the joke land after the reader knows what actually happened.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function SourceToDraftPanel({ items }: { items: SourceItem[] }) {
  const [results, setResults] = useState<Record<string, DraftResult>>({});

  async function createDraft(item: SourceItem) {
    setResults((current) => ({
      ...current,
      [item.id]: { status: "creating", message: "Creating draft..." },
    }));

    const response = await fetch("/api/admin/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draftTitleFor(item),
        deck: item.suggestedAngle,
        zone: item.zone,
        beat: item.beat,
        confidence: item.suggestedLabel,
        sourceUrl: item.url,
        body: draftBodyFor(item),
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { draft?: { id: string }; error?: string };

    setResults((current) => ({
      ...current,
      [item.id]: response.ok
        ? { status: "created", message: `Draft created: ${data.draft?.id || "local draft"}` }
        : { status: "error", message: data.error || "Could not create draft." },
    }));
  }

  return (
    <section className="desk-panel launch-source-panel">
      <p className="eyebrow">Source To Story</p>
      <h2>Turn leads into local drafts</h2>
      <p>
        These buttons use the local draft API now. Later they can call the full AI drafting worker with the same source
        payload.
      </p>
      <div className="launch-source-list">
        {items.map((item) => {
          const result = results[item.id] || { status: "idle" };
          const isBusy = result.status === "creating";
          const isCreated = result.status === "created";
          return (
            <article key={item.id} className="launch-source-card">
              <div>
                <span className="pill hot">{item.suggestedLabel}</span>
                <h3>{draftTitleFor(item)}</h3>
                <p>{item.suggestedAngle}</p>
                <small>
                  {item.source} / {item.zone} / {item.risk} risk{item.cadence ? ` / ${item.cadence}` : ""}
                </small>
              </div>
              <div className="button-row">
                <button type="button" onClick={() => void createDraft(item)} disabled={isBusy || isCreated}>
                  {isBusy ? "Creating..." : isCreated ? "Draft Created" : "Create Draft"}
                </button>
              </div>
              {result.message ? <p className={`action-note ${result.status}`}>{result.message}</p> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
