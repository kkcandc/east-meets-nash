import { reporters, sourceItems, sponsorProducts, stories } from "@/data/seed";
import type { Reporter, SourceItem, SponsorProduct, Story } from "@/lib/types";

export function getStories(): Story[] {
  return stories.slice().sort((a, b) => b.priority - a.priority);
}

export function getStoryBySlug(slug: string): Story | undefined {
  return stories.find((story) => story.slug === slug || story.id === slug);
}

export function getReporter(id: string): Reporter {
  return reporters.find((reporter) => reporter.id === id) || reporters[0];
}

export function getReporters(): Reporter[] {
  return reporters;
}

export function getSourceItems(): SourceItem[] {
  return sourceItems.slice().sort((a, b) => b.score - a.score);
}

export function getSponsorProducts(): SponsorProduct[] {
  return sponsorProducts;
}

export function getZones(): string[] {
  return Array.from(new Set(stories.map((story) => story.zone))).sort();
}

export function getBeats(): string[] {
  return Array.from(new Set(stories.map((story) => story.beat))).sort();
}

export function getStoriesForTopic(kind: string, value: string): Story[] {
  const normalized = decodeURIComponent(value).toLowerCase();
  return getStories().filter((story) => {
    const field = kind === "beat" ? story.beat : story.zone;
    return field.toLowerCase() === normalized;
  });
}

export function buildBeehiivExport(storyCount = 5): string {
  const items = getStories().slice(0, storyCount);
  return [
    "Subject: Five Things Before The Coffee Gets Weird",
    "Preheader: East Nashville, with receipts.",
    "",
    "Good morning. Here is what East Nashville needs before traffic, lunch plans, and the first patio opinion of the day.",
    "",
    ...items.map((story, index) =>
      [
        `${index + 1}. ${story.title}`,
        story.deck,
        `Label: ${story.label}. Zone: ${story.zone}. Filed by ${getReporter(story.reporterId).name}.`,
        `Link: /story/${story.slug}`,
      ].join("\n"),
    ),
    "",
    "Sponsor note: Founding sponsor spots are open.",
    "Tip line: Send the thing everyone is whispering about. Receipts appreciated.",
  ].join("\n\n");
}

export function buildBeehiivPostTitle(): string {
  return "Five Things Before The Coffee Gets Weird";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildBeehiivHtml(storyCount = 5): string {
  const items = getStories().slice(0, storyCount);

  const storyHtml = items
    .map((story, index) => {
      const reporter = getReporter(story.reporterId);
      return `
        <div style="border-top: 2px solid #1f1b18; padding: 18px 0;">
          <p style="margin: 0 0 8px; color: #ef4d37; font-size: 12px; font-weight: 700; text-transform: uppercase;">
            ${index + 1}. ${escapeHtml(story.label)} / ${escapeHtml(story.zone)} / ${escapeHtml(story.beat)}
          </p>
          <h2 style="margin: 0 0 8px; color: #1f1b18; font-family: Georgia, serif; font-size: 24px; line-height: 1.1;">
            ${escapeHtml(story.title)}
          </h2>
          <p style="margin: 0 0 10px; color: #403830; font-size: 16px; line-height: 1.45;">
            ${escapeHtml(story.deck)}
          </p>
          <p style="margin: 0; color: #6f6258; font-size: 13px;">
            Filed by ${escapeHtml(reporter.name)}. Read: /story/${escapeHtml(story.slug)}
          </p>
        </div>
      `;
    })
    .join("");

  return `
    <div style="background: #f8f2df; color: #1f1b18; font-family: Arial, sans-serif; padding: 8px;">
      <p style="margin: 0 0 10px; color: #ef4d37; font-size: 12px; font-weight: 700; text-transform: uppercase;">
        East Meets Nash
      </p>
      <h1 style="margin: 0 0 12px; color: #1f1b18; font-family: Georgia, serif; font-size: 32px; line-height: 1;">
        ${escapeHtml(buildBeehiivPostTitle())}
      </h1>
      <p style="margin: 0 0 18px; color: #403830; font-size: 17px; line-height: 1.5;">
        Good morning. Here is what East Nashville needs before traffic, lunch plans, and the first patio opinion of the day.
      </p>
      ${storyHtml}
      <div style="border: 2px solid #1f1b18; background: #f5d35f; padding: 14px; margin-top: 18px;">
        <p style="margin: 0 0 8px; color: #1f1b18; font-weight: 700;">Founding sponsor spots are open.</p>
        <p style="margin: 0; color: #1f1b18;">$1,500 gets 20 placements, a sponsored post, a founding badge, and first right on a category.</p>
      </div>
      <p style="margin: 18px 0 0; color: #6f6258; font-size: 13px;">
        Tip line: Send the thing everyone is whispering about. Receipts appreciated.
      </p>
    </div>
  `;
}
