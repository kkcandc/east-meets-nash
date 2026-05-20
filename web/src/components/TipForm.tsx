"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { DraftInput, LocalDraft } from "@/lib/types";

type SubmitState =
  | { status: "idle"; message: string; draft?: LocalDraft }
  | { status: "loading"; message: string; draft?: LocalDraft }
  | { status: "success"; message: string; draft: LocalDraft }
  | { status: "error"; message: string; draft?: LocalDraft };

const zoneOptions = ["East Nashville", "East Bank", "Five Points", "Gallatin Pike", "Inglewood", "Lockeland Springs", "Shelby Park", "Davidson County"];
const beatOptions = ["Neighborhood", "Civic", "Events", "Food", "Development", "Safety", "Local Commerce"];
const riskOptions: Array<NonNullable<DraftInput["risk"]>> = ["Low", "Medium", "High"];

function trimToDeck(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length <= 148) return normalized;
  return `${normalized.slice(0, 145).trim()}...`;
}

export function TipForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [zone, setZone] = useState(zoneOptions[0]);
  const [beat, setBeat] = useState(beatOptions[0]);
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceNote, setSourceNote] = useState("");
  const [contact, setContact] = useState("");
  const [risk, setRisk] = useState<NonNullable<DraftInput["risk"]>>("Medium");
  const [canContact, setCanContact] = useState(true);
  const [state, setState] = useState<SubmitState>({ status: "idle", message: "" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "loading", message: "Sending this to the source desk..." });

    const cleanTitle = title.trim() || `Reader tip: ${zone}`;
    const cleanBody = body.trim();
    const contactLine = contact.trim()
      ? `Contact: ${contact.trim()} (${canContact ? "can follow up" : "do not contact unless absolutely necessary"})`
      : "Contact: anonymous or not provided";
    const input: DraftInput = {
      title: cleanTitle,
      deck: trimToDeck(cleanBody),
      zone,
      beat,
      confidence: "Tip Line",
      sourceUrl: sourceUrl.trim() || undefined,
      sourceNote: sourceNote.trim() || "Reader-submitted tip from the public tip form.",
      verificationNote:
        "Treat this as a lead, not proof. Confirm with records, named sources, public pages, photos, or multiple credible tips before publishing.",
      internalNote: [contactLine, `Submitted from: public /tips form`, sourceNote.trim() ? `Reader note: ${sourceNote.trim()}` : ""]
        .filter(Boolean)
        .join("\n"),
      risk,
      visualTitle: "Reader tip submission",
      visualSummary: sourceNote.trim() || "A reader submitted a possible East Nashville lead for editor review.",
      visualItems: [zone, beat, risk].filter(Boolean),
      body: [
        cleanBody,
        "",
        sourceUrl.trim() ? `Source link: ${sourceUrl.trim()}` : "Source link: not provided",
        sourceNote.trim() ? `Receipt note: ${sourceNote.trim()}` : "Receipt note: not provided",
        contactLine,
      ].join("\n"),
    };

    const response = await fetch("/api/admin/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await response.json().catch(() => ({}))) as { draft?: LocalDraft; error?: string };

    if (!response.ok || !data.draft) {
      setState({ status: "error", message: data.error || "The tip did not save. Try again in a minute." });
      return;
    }

    setTitle("");
    setBody("");
    setSourceUrl("");
    setSourceNote("");
    setContact("");
    setCanContact(true);
    setRisk("Medium");
    setState({ status: "success", message: "Tip saved as an editor draft.", draft: data.draft });
  }

  return (
    <form className="tip-form" onSubmit={onSubmit}>
      <label>
        <span>What should we look into?</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="A headline, rumor, opening, road problem, permit weirdness..." />
      </label>
      <label className="tip-form-full">
        <span>What happened?</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Tell us what you saw, when it happened, who or what is involved, and what receipt exists."
          required
        />
      </label>
      <div className="tip-form-row">
        <label>
          <span>Zone</span>
          <select value={zone} onChange={(event) => setZone(event.target.value)}>
            {zoneOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Beat</span>
          <select value={beat} onChange={(event) => setBeat(event.target.value)}>
            {beatOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Risk</span>
          <select value={risk} onChange={(event) => setRisk(event.target.value as NonNullable<DraftInput["risk"]>)}>
            {riskOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="tip-form-full">
        <span>Link or receipt note</span>
        <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="Paste a public link if you have one" />
      </label>
      <label className="tip-form-full">
        <span>Photo, screenshot, or context note</span>
        <textarea
          value={sourceNote}
          onChange={(event) => setSourceNote(event.target.value)}
          placeholder="Describe screenshots/photos you can send, where the claim came from, or what still needs confirming."
        />
      </label>
      <label>
        <span>Your email or phone, optional</span>
        <input value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Only if we can follow up" />
      </label>
      <label className="tip-checkbox">
        <input type="checkbox" checked={canContact} onChange={(event) => setCanContact(event.target.checked)} />
        <span>East Meets Nash can contact me about this tip.</span>
      </label>
      <button type="submit" disabled={state.status === "loading"}>
        {state.status === "loading" ? "Sending..." : "Send Tip To Source Desk"}
      </button>
      {state.message ? (
        <p className={`form-note ${state.status}`}>
          {state.message} {state.status === "success" ? <a href={`/admin/drafts/${state.draft.id}`}>Open draft</a> : null}
        </p>
      ) : null}
    </form>
  );
}
