# East Meets Nash

East Meets Nash is the working home for a 100% East Nashville local media organization: part newspaper, part gossip column, part civic watchdog, part group text that got a CMS.

The first build uses:

- A custom web product for articles, search, categories, comments, reactions, classifieds, sponsors, and logged-in personalization.
- beehiiv as the email engine for the daily morning brief and weekly flagship issue.
- ATXP as the account, wallet, top-up, credits, and commerce layer.
- AI-heavy editorial, social, image, and video workflows that can later be cloned into other neighborhoods without diluting the East Nashville brand.

## Run Locally

```bash
npm run dev
```

Then open the local URL shown in the terminal. The current prototype is static data plus client-side filtering, designed to make product direction visible before the production stack is chosen.

## Production Scaffold

The deployable Next.js app now lives in `web/`.

```bash
cd web
npm install
npm run dev
```

Default URL: `http://localhost:4188`

The current static prototype still runs from the project root at `http://localhost:4177`.

## Project Map

- `docs/strategy.md` - brand, audience, positioning, and success goals.
- `docs/editorial-policy.md` - tone, source labels, gossip handling, takedowns, and correction rules.
- `docs/reporters.md` - AI reporter cast, beats, personalities, and usage rules.
- `docs/source-map.md` - monitoring targets and access requirements.
- `docs/product-roadmap.md` - web, beehiiv, comments, personalization, classifieds, and ATXP roadmap.
- `docs/atxp-integration-notes.md` - how East Meets Nash should use ATXP accounts, balances, credits, and top-ups.
- `docs/automation-plan.md` - how agents can run sourcing, publishing, socials, video, sponsor ops, and analytics.
- `docs/revenue-plan.md` - sponsor products, founding offer, and revenue targets.
- `docs/launch-plan.md` - launch week plan for Thursday, May 14, 2026.
- `docs/access-needed.md` - concrete accounts, keys, and decisions needed from Kenny.
- `docs/brand-system.md` - voice, house lines, visual direction, reactions, and recurring franchises.
- `docs/first-issue-skeleton.md` - first beehiiv/web issue structure and launch copy.
- `docs/production-architecture.md` - recommended Next.js, ATXP, beehiiv, ingestion, and database architecture.
- `docs/reporter-prompt-pack.md` - reusable prompt ingredients for the AI reporter cast.
- `docs/social-video-workflow.md` - per-story social/video output rules and Higgsfield prompt shape.
- `docs/database-schema.md` - first-pass schema for sources, stories, comments, sponsors, classifieds, and ATXP purchases.
- `site/` - runnable prototype.
- `web/` - production Next.js scaffold with routes, APIs, migrations, and integration placeholders.

Local pages:

- `/` - reader-facing homepage.
- `/desk.html` - editorial command center.
- `/commerce.html` - self-serve sponsor/classified checkout mock.
- `/story.html?id=traffic-gallatin-ballet` - full article page with sources, reactions, comments, and social kit.
- `/issue.html` - beehiiv/web issue builder.
- `/admin.html` - local draft intake and publishing simulation.
- `/feed.html` - personalized logged-in reader feed mock.
- `/categories.html` - zone, beat, and recurring franchise browser.
- `/tips.html` - local tip, rumor, correction, and takedown intake mock.

## Non-Negotiables

- East Nashville first. Other neighborhoods can be cloned later, but this brand is not a network wrapper.
- Funny, sharp, and insider. Cruel without a punchline is off-brand.
- Every factual item gets source links or source notes.
- Rumor is allowed only when labeled as rumor, gossip, tip, or group chatter.
- No human approval required for normal publishing, but the system should keep receipts and make takedowns fast.
