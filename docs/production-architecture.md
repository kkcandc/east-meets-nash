# Production Architecture

## Recommended Stack

Start with a Next.js app, because the ATXP Music repo already proves the local pattern:

- Next.js App Router.
- TypeScript.
- Tailwind or a lightweight CSS system based on the prototype.
- PostgreSQL.
- ATXP OIDC.
- beehiiv API for email subscription and publishing.
- Object storage for source screenshots, generated images, and video assets.
- PostHog and GA4.

## Core Services

Web App:

- Public pages, article pages, category pages, search, comments, reactions, sponsor pages, classifieds, account settings.

Editorial API:

- Source items.
- Drafts.
- Stories.
- Reporter assignments.
- Confidence labels.
- Publish status.
- Source audit records.

Ingestion Workers:

- RSS/web search.
- Official civic feeds.
- Social monitoring.
- Private-platform supervised imports.
- Tip email parsing.

Publishing Workers:

- Web publish.
- beehiiv daily/weekly issue blocks.
- Social variants.
- Video prompt queue.
- Sitemap refresh.

Commerce:

- ATXP login.
- Balance check.
- Top-up payment link.
- Sponsor purchase.
- Classified purchase.
- Voucher/ticket/merch purchase.

## Initial Database Tables

- `users`
- `preferences`
- `sources`
- `source_items`
- `stories`
- `story_sources`
- `reporters`
- `comments`
- `reactions`
- `sponsors`
- `sponsor_placements`
- `classifieds`
- `purchases`
- `beehiiv_subscriptions`
- `social_posts`
- `video_jobs`
- `corrections`
- `takedown_requests`

## Build Phases

Phase 1:

- Static prototype to production Next.js scaffold.
- Real article model.
- Search and categories.
- beehiiv signup.
- Manual source entry.
- Public launch.

Phase 2:

- ATXP login, comments, reactions, preferences.
- Sponsor and classifieds checkout.
- Source ingestion workers.
- Daily brief automation.

Phase 3:

- AI reporter image/video workflow.
- Personal feed ranking.
- Full sponsor self-serve.
- Vouchers, tickets, merch.
- Paid perks tier.

## Important Production Constraint

Facebook and Nextdoor are the hard parts. Treat them as supervised source capture at first, then formalize only when there is a compliant access path. The product can launch without fully automated private-platform ingestion if the public web, official sources, social sources, and Kenny-assisted imports are running.
