# Source Operating System

This is the practical sourcing model for East Meets Nash. The goal is not just "find news." The goal is to create a daily machine that turns neighborhood signals into source-backed posts, newsletter blocks, social cuts, and video prompts.

The fuller build plan lives in `docs/source-engine-blueprint.md`. The source access matrix lives in `data/source-access-matrix.json`.
The image sourcing rules live in `docs/image-sourcing-policy.md`.

## Daily Collection Loop

1. Morning official scan
   - Metro open data and hubNashville.
   - NDOT permits, closures, and event impacts.
   - Metro Planning Development Tracker and Codes permit searches.
   - MNPD dashboards and East Precinct trend checks.
   - Output: confirmed civic, traffic, permit, safety, and service leads.

2. Midday local web scan
   - Local outlets and newsletters for East Nashville mentions.
   - Venue calendars, event pages, parks, libraries, and festivals.
   - Restaurant/bar/venue account posts.
   - Output: link briefs, weekend agenda candidates, opening/closing leads.

3. Afternoon social/community scan
   - Instagram watchlist.
   - X searches and official/local reporter lists.
   - Kenny-supervised Facebook group capture.
   - Nextdoor manual capture panel for selected notes only.
   - Reader tips.
   - Output: chatter leads, rumor labels, opinion columns, follow-up prompts.

4. Issue assembly
   - Rank by locality, usefulness, shareability, confidence, and risk.
   - Assign reporter voice and label.
   - Create web post, beehiiv block, X/Threads copy, Instagram caption, and video prompt.
   - Attach the media pack: hero image/custom art only as fallback, source screenshot/capture or public embed when useful, map/location embed when useful, and private-platform screenshots cropped for focus with hard redactions only where needed. Inline images must be story-specific, not generic filler; food/menu shots belong only when the food/menu is part of the reported angle. Do not publish source receipt cards as article images.

## Source Tiers

Anchor sources are the daily story engines:

- Metro Nashville Open Data.
- Metro Council agendas, legislation, and fiscal notes.
- Metro Planning Development Tracker.
- Metro Codes ePermits.
- NDOT permits and closure maps.
- MNPD dashboards and East Precinct data.
- hubNashville 311 requests.
- East Nashville private Facebook group, once captured safely.
- Nextdoor pattern review through the manual capture panel, once selected notes exist.
- Reader tips.

Daily sources keep the product lively:

- Restaurant, bar, coffee, and venue Instagram watchlist.
- Venue/event calendars and Do615-style calendars.
- Local outlets and newsletters.
- X/Twitter official accounts, reporters, and East Nashville search terms.

Weekly sources add texture:

- Neighborhood associations.
- Sponsor/classified submissions.
- Deeper local business watchlists.

## Scoring

Every source item gets:

- `locality`: East Nashville specificity.
- `confidence`: official, direct, reported, public social, private chatter, tip, rumor.
- `shareability`: will people forward it?
- `usefulness`: does it help someone decide, avoid, attend, buy, complain, or laugh?
- `risk`: legal/privacy/accusation/sensitivity risk.
- `format`: quick hit, brief item, watchdog, guide, outrage forecast, social-only, video.

## Media Pack

Every publishable story needs:

- Hero image or custom editorial art.
- Real location/source photo when available, using original photos, approved press images, official API/embed sources, or licensed image repositories.
- Source screenshot/capture when it is useful and allowed. If capture is unavailable, use the source link as text until a real screenshot, public embed, map, or photo is available.
- Source-trail card for the original link, public record, direct business page, or internal source note.
- Map or embed when location, route, venue, or public meeting context matters.
- Social cuts: X/Threads copy, Instagram caption, and a short video prompt.

Private-platform media rules:

- Treat screenshots as publishable source texture when they make the story more interesting, specific, or trustworthy.
- For public/business/official/event screenshots, keep names, handles, logos, timestamps, and visible context unless there is a specific harm.
- For Facebook/Nextdoor/private-citizen screenshots, crop for focus and hard-redact children, medical details, financial details, private home addresses, personal phone numbers, license plates, and private people targeted by unverified accusations.
- Never use a screenshot as proof of an accusation without public records, a named source, or multiple credible confirmations.

## Labels

- `Confirmed`: official source, public record, direct business/org post, or named source.
- `Reported`: credible outlet, neighborhood association, public meeting note, or public source that still needs context.
- `Seen in the Wild`: public social post, visual sighting, direct post, or event/calendar item.
- `Group Chat Says`: Facebook, Nextdoor, comments, gossip, or community temperature.
- `Tip Line`: reader-submitted lead.
- `Allegedly`: only when something is clearly unverified and worth mentioning as such.

## Private Platform Reality

Facebook group content and Nextdoor content are high-signal but access-sensitive.

- Facebook Groups should be treated as supervised capture, not unattended ingestion. Meta removed third-party Groups API access in 2024, so the launch workflow is selected post capture from Kenny's logged-in account with internal screenshots/source notes.
- Nextdoor should use the Source Desk manual capture panel or an approved application-based workflow only. Apply for developer access if we want to test approved content display/keyword workflows; do not assume it exposes a private neighborhood feed.

## Private Platform Rules

Facebook and Nextdoor should start as supervised capture, not black-box automation.

For every private-platform source note, capture:

- Original platform and group/page.
- Link if available.
- Screenshot or internal note.
- Post date/time.
- Whether the author is a private citizen, business, official, or public figure.
- Exact claim.
- What would verify or contradict it.
- Publish label.
- Publish/no-publish recommendation.

Do not publish private accusations as news without a public record, named source, or multiple credible confirmations. Chatter can still become funny, useful coverage when framed as neighborhood mood rather than fact.

Never ask for passwords. Never silently scrape private communities. The valuable product is the transformed, labeled, locally useful coverage, not the raw private post.

## Launch Workflow

Before access-heavy sources are connected, the launch issue can run on:

- Development Tracker and Codes permits.
- NDOT closure/permit scan.
- Tomato Art Fest and venue calendars.
- Local outlet search.
- Restaurant Instagram/manual watchlist.
- Lockeland Springs and neighborhood org pages.
- Reader tips page.

That is enough to publish real daily items while ATXP, Facebook capture, and deeper social automation are still coming online.
