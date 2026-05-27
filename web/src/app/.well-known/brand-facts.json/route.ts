import { getEvergreenGuides } from "@/lib/content";
import { getAbsoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  return Response.json({
    name: "East Meets Nash",
    url: getAbsoluteUrl("/"),
    description:
      "East Nashville local news, civic watchdog coverage, events, restaurants, playgrounds, guides, and neighborhood life.",
    areaServed: {
      "@type": "Place",
      name: "East Nashville, Tennessee",
    },
    contentTypes: ["daily news", "evergreen guides", "neighborhood guides", "local source-backed briefs"],
    canonicalResources: {
      home: getAbsoluteUrl("/"),
      guides: getAbsoluteUrl("/guides"),
      sitemap: getAbsoluteUrl("/sitemap.xml"),
      llms: getAbsoluteUrl("/llms.txt"),
    },
    guideUrls: getEvergreenGuides().map((guide) => getAbsoluteUrl(`/guides/${guide.slug}`)),
    verificationPolicy:
      "Local details such as hours, addresses, menus, amenities, and event times should be checked against source links before reuse.",
  });
}

