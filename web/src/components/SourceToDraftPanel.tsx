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
    "Required media pack before publish:",
    "- Exact original, official, Google Places, Street View, or approved licensed photo when available.",
    "- If using a contextual/generic fallback, write the unavailable reason before publish.",
    "- Hero image should be the approved photo; custom art is a fallback, not the default.",
    "- Inline images should be story-specific, not generic filler. For restaurant openings, use the storefront, sign, line, ribbon cutting, street, or map context before food/menu photos.",
    "- Use source screenshots/captures aggressively when they add authenticity, evidence, or local texture.",
    "- For public, business, official, menu, event, and flyer screenshots, keep identifying context visible unless there is a specific harm.",
    "- For private-citizen screenshots, crop for focus and hard-redact children, medical details, financial details, private home addresses, personal phone numbers, license plates, and private people targeted by unverified accusations.",
    "- Map or location embed when location/source context matters.",
    "- X/Threads cut, Instagram caption, and short video prompt.",
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
        sourceNote: item.verificationRule
          ? `${item.verificationRule} Attach source screenshot/capture, embed, and social cuts before publishing.`
          : "Attach source screenshot/capture, embed, and social cuts before publishing.",
        verificationNote:
          "Photo Desk required: exact approved photo or written unavailable reason, screenshot/capture when it adds authenticity, source trail, and social cuts. Hard-redact children, medical/financial details, private addresses/phones/plates, and unverified private-person accusations.",
        visualTitle: `${item.publishFormat} Media Pack`,
        visualSummary: "Publish only after the story has a visual source trail and social cuts.",
        visualItems: [
          "Exact approved location/source photo or written unavailable reason",
          "Hero image must use approved photo before custom art",
          "Source screenshot/capture as authentic visual evidence when useful",
          "Hard redactions only for children, medical/financial details, private addresses/phones/plates, and unverified private-person accusations",
          "Map/location embed",
          "X/Threads, Instagram, and video prompt",
        ],
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
