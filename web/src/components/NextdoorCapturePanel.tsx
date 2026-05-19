"use client";

import { useMemo, useState } from "react";
import type { ConfidenceLabel } from "@/lib/types";

type RiskLevel = "Low" | "Medium" | "High";

interface CapturePreview {
  key: string;
  note: string;
  title: string;
  deck: string;
  zone: string;
  beat: string;
  risk: RiskLevel;
  sourceUrl: string;
  verification: string;
  sourceNote: string;
  internalNote: string;
  visualTitle: string;
  visualSummary: string;
  visualItems: string[];
  body: string;
}

interface CaptureResult {
  status: "idle" | "creating" | "created" | "error";
  message?: string;
}

const CONFIDENCE: ConfidenceLabel = "Group Chat Says";

const beatRules: Array<{
  beat: string;
  risk: RiskLevel;
  verification: string;
  keywords: string[];
}> = [
  {
    beat: "Safety",
    risk: "High",
    verification: "Check MNPD, Metro dispatch, public records, or a named official/source before making a factual claim.",
    keywords: [
      "break-in",
      "break in",
      "stolen",
      "theft",
      "robbery",
      "police",
      "shots",
      "gun",
      "suspicious",
      "scam",
      "porch pirate",
      "assault",
    ],
  },
  {
    beat: "Lost and Found",
    risk: "Medium",
    verification: "Confirm the item/pet status before publishing, and avoid private resident names unless they volunteered to be contacted.",
    keywords: ["lost dog", "lost cat", "found dog", "found cat", "missing dog", "missing cat", "pet", "collar"],
  },
  {
    beat: "Traffic",
    risk: "Medium",
    verification: "Check NDOT, hubNashville, school or event notices, and a fresh visual/source note before publishing impact.",
    keywords: [
      "traffic",
      "parking",
      "lane",
      "road",
      "sidewalk",
      "crosswalk",
      "school pickup",
      "bus",
      "construction",
      "detour",
      "speeding",
      "bike lane",
    ],
  },
  {
    beat: "Family",
    risk: "Low",
    verification: "Confirm any school, camp, childcare, or public-space facts with the direct organization before publishing.",
    keywords: ["school", "kids", "childcare", "playground", "stroller", "family", "camp", "daycare"],
  },
  {
    beat: "Services",
    risk: "Low",
    verification: "Check hubNashville, Metro department pages, utility notices, or direct observations before publishing a service claim.",
    keywords: [
      "trash",
      "pothole",
      "streetlight",
      "street light",
      "water",
      "power",
      "outage",
      "311",
      "hubnashville",
      "utility",
      "recycling",
    ],
  },
  {
    beat: "Restaurants",
    risk: "Low",
    verification: "Confirm openings, closings, menus, hours, or hiring through the business or public permit/social sources.",
    keywords: ["restaurant", "bar", "coffee", "menu", "patio", "opening", "closed", "closing", "soft launch"],
  },
  {
    beat: "Events",
    risk: "Low",
    verification: "Confirm dates, location, age details, and cancellations through the official event or venue source.",
    keywords: ["event", "market", "festival", "yard sale", "garage sale", "concert", "library", "park"],
  },
];

const deckByBeat: Record<string, string> = {
  Community: "A selected Nextdoor note is useful only if it becomes a pattern, a reader question, or a verified follow-up.",
  Events: "A Nextdoor thread may point to an event worth confirming before it becomes a guide item.",
  Family: "A family-logistics complaint becomes useful when it points readers toward a confirmed next step.",
  "Lost and Found": "Repeated lost-and-found chatter can become a practical neighborhood bulletin, not a private pile-on.",
  Restaurants: "A restaurant rumor becomes publishable when a direct business source, permit, or public post backs it up.",
  Safety: "Porch-package anxiety is everywhere; the publishable version needs verification, not doorbell-video panic.",
  Services: "A service complaint becomes useful when it points to a Metro check, utility notice, or repeatable reader action.",
  Traffic: "A traffic complaint is useful when it becomes a specific impact check instead of a generic car sermon.",
};

function splitNotes(rawNotes: string): string[] {
  const normalized = rawNotes.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const delimiter = normalized.includes("\n---") ? /\n\s*---+\s*\n/g : /\n{2,}/g;
  return normalized
    .split(delimiter)
    .map((note) => note.trim())
    .filter((note) => note.length > 10);
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function firstLine(note: string): string {
  const line = note
    .split("\n")
    .map((part) => part.trim())
    .find(Boolean);
  return normalizeWhitespace(line || note)
    .replace(/^[-*0-9.)\s]+/, "")
    .replace(/https?:\/\/\S+/g, "")
    .trim();
}

function shorten(value: string, maxLength: number): string {
  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 3).trim()}...`;
}

function promoteRisk(risk: RiskLevel, note: string): RiskLevel {
  if (risk === "High") return risk;
  const lower = note.toLowerCase();
  const personalRiskTerms = ["address", "license plate", "doorbell", "camera footage", "video of", "accused", "named"];
  if (personalRiskTerms.some((term) => lower.includes(term))) return "High";
  return risk;
}

function classifyNote(note: string): Pick<CapturePreview, "beat" | "risk" | "verification"> {
  const lower = note.toLowerCase();
  const rule = beatRules.find((candidate) => candidate.keywords.some((keyword) => lower.includes(keyword)));
  if (!rule) {
    return {
      beat: "Community",
      risk: promoteRisk("Medium", note),
      verification: "Look for a public record, direct source, business/org confirmation, or multiple independent notes before publishing.",
    };
  }

  return {
    beat: rule.beat,
    risk: promoteRisk(rule.risk, note),
    verification: rule.verification,
  };
}

function draftTitleFor(note: string, beat: string): string {
  const lower = note.toLowerCase();
  if (beat === "Safety" && lower.includes("package")) return "Porch Package Anxiety Has Entered The Eastland Chat";
  if (beat === "Traffic" && lower.includes("bike lane")) return "The Lockeland Pickup Line Has Entered The Bike Lane Chat";
  if (beat === "Lost and Found" && lower.includes("lost dog")) return "Shelby Park's Lost-Dog Chatter Wants A Better Bulletin Board";
  if (beat === "Services" && lower.includes("pothole")) return "The 311 Irritation Index Has A New Candidate";
  if (beat === "Restaurants") return "The Restaurant Rumor Radar Has A New Blip";
  if (beat === "Events") return "The Neighborhood Calendar Has Entered The Chat";
  if (beat === "Family") return "East Nashville Family Logistics Have Entered The Group Chat";

  const lead = shorten(firstLine(note), 64);
  return lead ? `The Nextdoor Thread Is Asking About ${lead}` : `The Nextdoor ${beat} Lead Needs A Real Check`;
}

function draftBodyFor(preview: Omit<CapturePreview, "body">): string {
  if (preview.beat === "Safety") {
    return [
      "The Nextdoor version of the group chat is doing what it does best: turning a very specific porch worry into a neighborhood-wide temperature check. This one centers on package-theft chatter around Eastland and Riverside, with at least one mention of doorbell footage and a possible license plate.",
      "That is useful, but it is not yet a confirmed crime trend. The publishable version is not the video, the plate, or the name someone thinks they saw. The publishable version is the pattern: are multiple blocks reporting the same problem, has MNPD logged related reports, and is there a practical way for residents to respond without turning the comments into amateur surveillance court?",
      "The useful reader service is straightforward. Check whether there are public reports, ask MNPD or a named source what they can confirm, and look for repeat locations or timing before calling it a wave. Until then, this stays in the safer lane: neighbors say porch-package anxiety is up, and the next step is verification.",
      "Our ruling: start a Package Watch item only if the records or named confirmations hold up. If they do, make it practical: where the chatter is concentrated, what residents should report, and what not to post. East Nashville can be alert without becoming a blurry screenshot trial.",
    ].join("\n\n");
  }

  if (preview.beat === "Traffic") {
    return [
      "The neighborhood complaint machine has found a very specific afternoon villain: the school pickup line near Lockeland, which neighbors say is drifting into bike-lane territory when the weather and timing get rude.",
      "That is exactly the kind of Nextdoor thread that can become useful if it gets one more layer of reporting. The complaint itself is not the story. The story is whether the pickup pattern is blocking a route, whether the school or NDOT knows about it, and what families or riders are supposed to do when the curb math stops working.",
      "The better version is narrow and practical: use a screenshot if it shows the real pickup pattern or source texture, but avoid parent-shaming, kid details, private plates, and vague war-on-cars fog. Just the practical question hiding under the irritation.",
      "Our ruling: turn this into a small Cone Watch or School Pickup Watch if the school, NDOT, or fresh observation confirms it. East Nashville does not need another argument about traffic in the abstract. It needs to know which block gets weird, when, and who can actually fix it.",
    ].join("\n\n");
  }

  if (preview.beat === "Lost and Found") {
    return [
      "Shelby Park has produced the gentlest kind of neighborhood panic: repeated lost-dog chatter and the familiar question of where a missing-pet post actually goes when everyone needs to see it quickly.",
      "The thread is not really about one animal. It is about neighborhood logistics. East Nashville has parks, porches, runners, dog walkers, school routes, and a lot of people who will absolutely become a search party if they know where to look. The problem is that the information scatters across Nextdoor, Facebook, flyers, texts, and the one neighbor who somehow knows every dog by name.",
      "The useful version would confirm whether there is a repeat cluster near Shelby Park and then build a tiny lost-pet playbook: where to post, who to call, what details help, and how to update the neighborhood when the search ends.",
      "Our ruling: this wants to become a recurring Lost And Found Desk, not a one-off panic post. If the pattern holds, give readers the bulletin-board version and keep private owner details out unless someone explicitly wants to be contacted.",
    ].join("\n\n");
  }

  return [
    "The Nextdoor chatter is useful because it points at a small, specific neighborhood question. That does not make it confirmed, but it does make it worth sorting before the same complaint shows up three more places.",
    `The working lead: ${firstLine(preview.note)}`,
    "The next step is to turn the private note into public value. That means paraphrasing the chatter, checking a direct source or public record, and deciding whether this is a pattern, a service item, a reader question, or a no-publish source note.",
    "Our ruling: keep the raw post internal, verify the useful claim, and publish only the part that helps East Nashville understand what to do next.",
  ].join("\n\n");
}

function visualFor(preview: {
  beat: string;
  risk: RiskLevel;
  verification: string;
  note: string;
}): Pick<CapturePreview, "visualItems" | "visualSummary" | "visualTitle"> {
  if (preview.beat === "Safety") {
    return {
      visualTitle: "Nextdoor Signal: Package Watch",
      visualSummary: "Porch-theft chatter around Eastland and Riverside, held for verification before publication.",
      visualItems: ["Private chatter paraphrased", "Doorbell footage mentioned", "Check MNPD or public records"],
    };
  }

  if (preview.beat === "Traffic") {
    return {
      visualTitle: "Nextdoor Signal: Pickup Line",
      visualSummary: "A school traffic complaint worth checking against NDOT, school guidance, or fresh observation.",
      visualItems: ["Bike-lane blockage claim", "Rainy afternoon timing", "Confirm with school or NDOT"],
    };
  }

  if (preview.beat === "Lost and Found") {
    return {
      visualTitle: "Nextdoor Signal: Lost And Found",
      visualSummary: "Repeated pet-search chatter that may need a practical neighborhood bulletin.",
      visualItems: ["Shelby Park area", "Private owner details withheld", "Confirm status before posting"],
    };
  }

  return {
    visualTitle: `Nextdoor Signal: ${preview.beat}`,
    visualSummary: "Selected community chatter, paraphrased into a lead and held for verification.",
    visualItems: ["Private note withheld", `${preview.risk} risk`, preview.verification],
  };
}

function buildPreview(note: string, index: number, zone: string, sourceUrl: string): CapturePreview {
  const classification = classifyNote(note);
  const visual = visualFor({ ...classification, note });
  const preview = {
    key: `${index}-${note.slice(0, 16)}`,
    note,
    title: draftTitleFor(note, classification.beat),
    deck: deckByBeat[classification.beat] || deckByBeat.Community,
    zone,
    beat: classification.beat,
    risk: classification.risk,
    sourceUrl,
    verification: classification.verification,
    sourceNote:
      "Private Nextdoor details are paraphrased unless a screenshot adds clear value. Hard-redact children, medical/financial details, private home addresses, phone numbers, license plates, and unverified private-person accusations.",
    internalNote: note,
    ...visual,
  };

  return {
    ...preview,
    body: draftBodyFor(preview),
  };
}

export function NextdoorCapturePanel() {
  const [rawNotes, setRawNotes] = useState("");
  const [zone, setZone] = useState("East Nashville");
  const [sourceUrl, setSourceUrl] = useState("https://nextdoor.com/");
  const [result, setResult] = useState<CaptureResult>({ status: "idle" });

  const previews = useMemo(
    () => splitNotes(rawNotes).map((note, index) => buildPreview(note, index, zone, sourceUrl)),
    [rawNotes, sourceUrl, zone],
  );

  async function createDrafts() {
    if (!previews.length) return;
    setResult({ status: "creating", message: `Creating ${previews.length} draft${previews.length === 1 ? "" : "s"}...` });

    try {
      const createdIds: string[] = [];
      for (const preview of previews) {
        const response = await fetch("/api/admin/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: preview.title,
            deck: preview.deck,
            zone: preview.zone,
            beat: preview.beat,
            confidence: CONFIDENCE,
            sourceUrl: preview.sourceUrl,
            sourceNote: preview.sourceNote,
            verificationNote: preview.verification,
            internalNote: preview.internalNote,
            risk: preview.risk,
            visualTitle: preview.visualTitle,
            visualSummary: preview.visualSummary,
            visualItems: preview.visualItems,
            body: preview.body,
          }),
        });
        const data = (await response.json().catch(() => ({}))) as { draft?: { id: string }; error?: string };
        if (!response.ok) throw new Error(data.error || "Could not create draft.");
        createdIds.push(data.draft?.id || preview.title);
      }

      setResult({
        status: "created",
        message: `Created ${createdIds.length} Nextdoor draft${createdIds.length === 1 ? "" : "s"}.`,
      });
    } catch (error) {
      setResult({
        status: "error",
        message: error instanceof Error ? error.message : "Could not create Nextdoor drafts.",
      });
    }
  }

  return (
    <section className="desk-panel nextdoor-capture-panel">
      <div className="capture-panel-heading">
        <div>
          <p className="eyebrow">Nextdoor Capture</p>
          <h2>Turn selected notes into guarded drafts</h2>
        </div>
        <span className="status-chip blocked">Manual only</span>
      </div>
      <p>
        Selected Nextdoor notes become local draft leads with the Group Chat Says label, risk triage, and verification
        checks attached.
      </p>

      <div className="capture-grid">
        <label className="capture-field" htmlFor="nextdoor-notes">
          <span>Source notes</span>
          <textarea
            id="nextdoor-notes"
            value={rawNotes}
            onChange={(event) => {
              setRawNotes(event.target.value);
              setResult({ status: "idle" });
            }}
            placeholder="Lost dog posts around Shelby Park are repeating this week..."
          />
        </label>
        <div className="capture-settings">
          <label className="capture-field" htmlFor="nextdoor-zone">
            <span>Default zone</span>
            <input
              id="nextdoor-zone"
              value={zone}
              onChange={(event) => {
                setZone(event.target.value);
                setResult({ status: "idle" });
              }}
            />
          </label>
          <label className="capture-field" htmlFor="nextdoor-source-url">
            <span>Source link</span>
            <input
              id="nextdoor-source-url"
              value={sourceUrl}
              onChange={(event) => {
                setSourceUrl(event.target.value);
                setResult({ status: "idle" });
              }}
            />
          </label>
          <div className="privacy-rule-card">
            <strong>Private-platform rules</strong>
            <span>No unattended scraping.</span>
            <span>Screenshots are allowed when they add real texture.</span>
            <span>Hard-redact kids, medical/financial details, private home addresses, phones, plates, and unverified private-person accusations.</span>
            <span>Accusations need independent confirmation.</span>
          </div>
        </div>
      </div>

      <div className="capture-preview-header">
        <h3>Draft queue</h3>
        <span>
          {previews.length} lead{previews.length === 1 ? "" : "s"}
        </span>
      </div>
      {previews.length ? (
        <div className="capture-preview-list">
          {previews.map((preview) => (
            <article key={preview.key} className="capture-preview-card">
              <div className="story-meta">
                <span className="pill hot">{CONFIDENCE}</span>
                <span>{preview.beat}</span>
                <span>{preview.risk} risk</span>
              </div>
              <h4>{preview.title}</h4>
              <p>{preview.deck}</p>
              <small>{preview.verification}</small>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-capture-state">Paste selected Nextdoor notes to build the queue.</p>
      )}
      <div className="button-row">
        <button
          type="button"
          onClick={() => void createDrafts()}
          disabled={!previews.length || result.status === "creating" || result.status === "created"}
        >
          {result.status === "creating"
            ? "Creating..."
            : result.status === "created"
              ? "Drafts Created"
              : previews.length
                ? `Create ${previews.length} Drafts`
                : "Create Drafts"}
        </button>
      </div>
      {result.message ? <p className={`action-note ${result.status}`}>{result.message}</p> : null}
    </section>
  );
}
