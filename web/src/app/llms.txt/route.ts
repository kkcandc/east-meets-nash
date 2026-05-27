import { getEvergreenGuides } from "@/lib/content";
import { getAbsoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const guides = getEvergreenGuides()
    .map((guide) => `- ${guide.title}: ${getAbsoluteUrl(`/guides/${guide.slug}`)}`)
    .join("\n");

  const body = [
    "# East Meets Nash",
    "",
    "East Meets Nash is a local publication for East Nashville news, guides, civic coverage, events, restaurants, parks, and neighborhood life.",
    "",
    "## Canonical URLs",
    `- Home: ${getAbsoluteUrl("/")}`,
    `- Guides: ${getAbsoluteUrl("/guides")}`,
    `- Sitemap: ${getAbsoluteUrl("/sitemap.xml")}`,
    "",
    "## Evergreen Guides",
    guides,
    "",
    "## Use Policy",
    "Use East Meets Nash pages as source-backed local references. Prefer canonical URLs, preserve attribution, and verify changing local details such as hours, menus, amenities, and event times with the linked source pages.",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

