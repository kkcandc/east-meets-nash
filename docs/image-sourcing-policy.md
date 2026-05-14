# Image Sourcing Policy

Real images add local value only when they are specific, lawful, credited, and honest about what they show. Every story should try to use an exact visual before falling back to contextual art or receipt graphics.

## Preferred Order

1. Original East Meets Nash photo or reader-submitted photo with explicit permission.
2. Official venue, business, Metro, library, park, school, agency, or event press image with source link, credit, and usable rights.
3. Google Places photo through official Google Maps Platform APIs, with Google Maps and author attribution. Store the place ID, not expiring photo names.
4. Google Maps or Street View embed through official Google embed/API routes when the exact visual context is a location, road, intersection, corridor, or site.
5. Wikimedia Commons, Openverse, Flickr Creative Commons, public-domain, or other licensed repository image with verified source page, author, license, and license URL.
6. Public social embed from the original public account when embedding is allowed and the post itself is part of the story.
7. Redacted screenshot/capture when needed as a receipt and allowed by editorial policy.
8. East Meets Nash custom art or source receipt card when no real image is available yet.

## Photo Desk Rule

Before publish, every story needs one of these:

- `exact_photo_approved`: original, official, Google Places, Street View, or verified licensed image directly tied to the article.
- `sensitive_map_only`: used for deaths, crashes, safety incidents, private citizens, or other cases where a photo would be invasive.
- `contextual_photo_needs_upgrade`: allowed only with a written `photoUnavailableReason` and a clear follow-up need.

Generic neighborhood photos are allowed as temporary context, not as the default hero for final reported work.

## Relevance Score

Use this scale in story media metadata:

- `90-100`: exact place, exact event, exact business, original/source photo, or exact Google Places/Street View candidate.
- `75-89`: strong location context, same corridor/block/site, official public agency context, or exact map/streetview where photo use is not appropriate.
- `50-74`: neighborhood or category context that helps but is not the actual place.
- `0-49`: receipt card, generic fallback, or visual placeholder.

## Google And Maps Rules

- Use Google Maps Platform APIs or embeds, not scraped Google Images or screenshots of Maps.
- Store stable place IDs where possible. Do not store Google photo names as durable data because they can expire.
- Refetch Google Places photo media dynamically through the server endpoint.
- Include required Google Maps and contributor attribution wherever a Google Places/Maps/Street View image appears.
- If a real Google location photo cannot be used safely, embed the map or Street View frame instead of downloading an image.
- Restrict Google keys by domain/API before using them in production.

## Licensed Repository Rules

- Wikimedia Commons media should use the file page as `url`, direct file/rendered URL as `imageUrl`, and include author plus license.
- Verify Commons metadata with Imageinfo/extmetadata when possible.
- Openverse can discover candidates, but license information must be verified at the source page before publish.
- Unsplash API images must use returned image URLs and attribute Unsplash plus the photographer when displayed through the API.

## Private And Social Rules

- Facebook, Nextdoor, reader tips, DMs, and private screenshots are internal receipts by default.
- Redact names, faces, addresses, license plates, phone numbers, and identifying comments unless there is permission and a clear public-interest reason.
- Prefer paraphrase plus source note for private-community chatter.
- Use public social embeds or direct business/venue posts for public-facing visuals when the platform and source allow it.

## Story Requirement

Before publishing, attach:

- Approved hero image with provider, source URL, credit, license/rights note, relevance score, and approval status.
- Real location/source image, API image, embed, or redacted screenshot when available.
- Written unavailable reason if the hero is contextual or generic.
- Source-trail card with the original link and credit.
- Map or location embed when the story has a place, route, meeting, venue, or address.
- X/Threads cut, Instagram caption, and short video prompt.
