# Automation Plan

The goal is to let agents run the operation with Kenny mostly handling access, exceptions, sponsor approvals, and taste checks.

## Core Agents

1. Source Desk
   - Monitors RSS, web, X, Instagram, Facebook exports/browser sessions, Nextdoor, civic sources, permits, restaurant accounts, and event calendars.
   - Normalizes each lead into a source item with links, screenshots, timestamp, zone, beat, and confidence.

2. Assignment Editor
   - Ranks leads by East Nashville relevance, shareability, usefulness, freshness, and risk.
   - Assigns a reporter, angle, format, confidence label, and publish surface.

3. Writer Desk
   - Drafts quick hits, full stories, briefs, newsletters, social captions, X threads, and title cards.
   - Uses reporter voices from `docs/reporters.md`.
   - Includes source links and internal source notes.

4. Standards Desk
   - Checks for source presence, rumor labeling, accusation risk, swearing, unsupported claims, private sensitive data, and cruelty without humor.
   - Auto-approves normal posts.
   - Escalates only high-risk items.

5. Publisher
   - Publishes web posts immediately.
   - Schedules beehiiv daily and weekly issues.
   - Publishes social variants.
   - Updates sitemap and search metadata.

6. Video Desk
   - Creates per-story vertical scripts.
   - Generates or selects reporter character visuals.
   - Uses Higgsfield for character-led clips when story priority justifies the credits.

7. Sponsor Ops
   - Maintains self-serve sponsor inventory.
   - Generates sponsor copy, placements, confirmation emails, and receipts.
   - Reports unsold inventory.

8. Analytics Desk
   - Tracks story performance, source performance, revenue, email growth, shares, reactions, search queries, and sponsor conversion.
   - Recommends what to publish more of.

## Daily Loop

Morning:

- Pull overnight source items.
- Publish morning brief to beehiiv and web.
- Generate social queue for the morning stories.

Midday:

- Publish quick hits, events, restaurant notes, civic updates, and group chatter.
- Refresh "what people are mad about" if the neighborhood is having a moment.

Evening:

- Push social recap.
- Draft next morning brief.
- Build weekly issue candidates.

Weekly:

- Publish flagship issue.
- Review top posts, top sources, sponsor revenue, comments, tips, and editorial misses.
- Update source list and reporter prompts.

## Escalation Rules

Escalate to Kenny when:

- A private citizen is accused of serious misconduct.
- A takedown request arrives.
- A sponsor wants a nonstandard deal.
- The system needs private platform re-authentication.
- A story is hilarious but risky enough that taste matters.

## Running More Without Kenny

The biggest unlocks are access, not questions:

- A shared publishing account for the site CMS.
- beehiiv API key and publication id.
- Social account credentials or scheduler access.
- ATXP OIDC/client details for the domain.
- Approved way to read Facebook group content from Kenny's access.
- Instagram/X/Nextdoor access.
- Tips email.
- Sponsor payment path.
- Analytics accounts.

Once those exist, agents can source, draft, label, publish, post socials, create video prompts, and summarize exceptions daily.
