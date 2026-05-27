import type { MetadataRoute } from "next";
import { getBeats, getEvergreenGuides, getStories, getZones } from "@/lib/content";
import { getAbsoluteUrl } from "@/lib/site";

function sitemapEntry(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]) {
  return {
    url: getAbsoluteUrl(path),
    lastModified: new Date(),
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const stories = getStories()
    .filter((story) => story.label !== "Seed Item")
    .map((story) => sitemapEntry(`/story/${story.slug}`, 0.85, "daily"));
  const guides = getEvergreenGuides().map((guide) => sitemapEntry(`/guides/${guide.slug}`, 0.8, "weekly"));
  const zones = getZones().map((zone) => sitemapEntry(`/topics/zone/${encodeURIComponent(zone)}`, 0.55, "weekly"));
  const beats = getBeats().map((beat) => sitemapEntry(`/topics/beat/${encodeURIComponent(beat)}`, 0.55, "weekly"));

  return [
    sitemapEntry("/", 1, "daily"),
    sitemapEntry("/guides", 0.85, "weekly"),
    sitemapEntry("/topics", 0.65, "weekly"),
    sitemapEntry("/llms.txt", 0.2, "weekly"),
    sitemapEntry("/.well-known/brand-facts.json", 0.2, "weekly"),
    sitemapEntry("/.well-known/ai-manifest.json", 0.2, "weekly"),
    ...stories,
    ...guides,
    ...zones,
    ...beats,
  ];
}
