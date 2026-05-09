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
