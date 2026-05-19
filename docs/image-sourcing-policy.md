# Image Sourcing Policy

Real images add local value only when they are specific, lawful, credited, and honest about what they show. Every story should try to use an exact visual before falling back to contextual art.

## Preferred Order

1. Original East Meets Nash photo or reader-submitted photo with explicit permission.
2. Official venue, business, Metro, library, park, school, agency, or event press image with source link, credit, and usable rights.
3. Google Places photo through official Google Maps Platform APIs, with Google Maps and author attribution. Store the place ID, not expiring photo names.
4. Google Maps or Street View embed through official Google embed/API routes when the exact visual context is a location, road, intersection, corridor, or site.
5. Wikimedia Commons, Openverse, Flickr Creative Commons, public-domain, or other licensed repository image with verified source page, author, license, and license URL.
6. Public social embed from the original public account when embedding is allowed and the post itself is part of the story.
7. Source screenshot/capture when it adds authenticity, texture, or evidence, edited only as needed under the screenshot rules below.
8. East Meets Nash custom art when no real image is available yet.

Do not publish source receipt cards as story images. Use source links, embeds, maps, screenshots, or real photos instead.

## Photo Desk Rule

Before publish, every story needs one of these:

- `exact_photo_approved`: original, official, Google Places, Street View, or verified licensed image directly tied to the article.
- `sensitive_map_only`: used for deaths, crashes, safety incidents, private citizens, or other cases where a photo would be invasive.
- `contextual_photo_needs_upgrade`: allowed only with a written `photoUnavailableReason` and a clear follow-up need.

Generic neighborhood photos are allowed as temporary context, not as the default hero for final reported work.

Inline images must be intentionally selected for the article, not auto-filled from every available asset. Use an inline image only when it clarifies the reported fact, place, person, object, scene, or public record. For restaurant openings, prefer exterior, sign, storefront, construction, line, ribbon-cutting, mural, patio, street, or map context. Menu and food photos belong in menu, review, dining, or dish-specific stories, not in a location/opening story unless the food itself is the news.

## Relevance Score

Use this scale in story media metadata:

- `90-100`: exact place, exact event, exact business, original/source photo, or exact Google Places/Street View candidate.
- `75-89`: strong location context, same corridor/block/site, official public agency context, or exact map/streetview where photo use is not appropriate.
- `50-74`: neighborhood or category context that helps but is not the actual place.
- `0-49`: generic fallback, custom art, or visual placeholder.

## Google And Maps Rules

- Use Google Maps Platform APIs or embeds, not scraped Google Images or screenshots of Maps.
- Store stable place IDs where possible. Do not store Google photo names as durable data because they can expire.
- Refetch Google Places photo media dynamically through the server endpoint.
- Include required Google Maps and contributor attribution wherever a Google Places/Maps/Street View image appears.
- If a real Google location photo cannot be used safely, embed the map or Street View frame instead of downloading an image.
- Keep the Places API key server-side, restrict it to the needed Google Maps Platform APIs, and use a separate browser-restricted `GOOGLE_MAPS_EMBED_KEY` if Street View embeds are enabled.

## Licensed Repository Rules

- Wikimedia Commons media should use the file page as `url`, direct file/rendered URL as `imageUrl`, and include author plus license.
- Verify Commons metadata with Imageinfo/extmetadata when possible.
- Openverse can discover candidates, but license information must be verified at the source page before publish.
- Unsplash API images must use returned image URLs and attribute Unsplash plus the photographer when displayed through the API.

## Private And Social Rules

- Screenshots are first-class story artifacts when they make the story more real, local, or legible. Prefer a real screenshot over generic art when the screenshot is the texture of the story.
- For public sources, business posts, venue posts, official pages, public flyers, menus, calendars, public social posts, and public agency pages, keep identifying context visible unless it creates a specific harm.
- For Facebook, Nextdoor, reader tips, DMs, and private-citizen screenshots, default to crop-with-taste rather than full redaction. Keep enough visible to feel authentic: platform, timestamp when useful, public group/page context, post text, event/business/org names, and non-sensitive comments.
- Hard-redact children, medical details, financial details, private home addresses, personal phone numbers, license plates, and anything that identifies a private person as the target of an unverified accusation.
- Do not use screenshots as proof of crimes, scams, harassment, abuse, or misconduct without public records, a named source willing to stand behind it, or multiple credible confirmations.
- Use public social embeds or direct business/venue posts for public-facing visuals when the platform and source allow it.

## Story Requirement

Before publishing, attach:

- Approved hero image with provider, source URL, credit, license/rights note, relevance score, and approval status.
- Real location/source image, API image, embed, or redacted screenshot when available and directly relevant.
- Written unavailable reason if the hero is contextual or generic.
- Source trail with the original link, embed, map, or screenshot when useful.
- Map or location embed when the story has a place, route, meeting, venue, or address.
- X/Threads cut, Instagram caption, and short video prompt.
