# Source Engine Blueprint

This is the working plan for making East Meets Nash good every day. The whole product depends on turning noisy local inputs into ranked, source-backed story candidates.

## Operating Principle

Public and official sources should become fully automated first. Private-community sources should start as supervised capture. That gives us a daily publishing machine without depending on brittle or risky access to closed platforms.

## Platform Reality

### Facebook group

The East Nashville Facebook group is high-value, but it should not be treated like a normal API source.

Meta removed third-party Facebook Groups API access in 2024, including the permissions many tools used to fetch or publish group content. The practical path is supervised capture from Kenny's already-authorized account, not an unattended scraper.

Best launch workflow:

1. Kenny opens the group while logged in.
2. He captures selected posts into our source desk with a screenshot, post link, post time, author type, exact claim, and notes.
3. The source engine turns those into internal source notes.
4. We publish only transformed coverage: patterns, questions, recurring complaints, rumor-labeled items, and follow-ups.

Rules:

- No passwords.
- No silent scraping.
- No publishing private accusations as news without public records, named sources, or multiple credible confirmations.
- Use `Group Chat Says` unless independently verified.

### Nextdoor

Nextdoor is probably useful, but it is not launch-critical.

Nextdoor developer access exists for sharing/displaying local content and keyword/local data workflows, but approval is required and we should not assume it gives a clean private neighborhood feed. Until approved, Nextdoor belongs in the Source Desk manual capture panel only.

Best launch workflow:

1. Apply for developer access.
2. If approved, test what Display Content can actually return for East Nashville.
3. Until then, capture only patterns through the manual panel: lost pets, family logistics, service complaints, public safety chatter, and recurring resident questions.
4. Use screenshots when they make the source texture clearer, but hard-redact children, medical/financial details, private addresses, phones, plates, and unverified private-person accusations.

## Source Lanes

### Lane 1: Confirmed official sources

- Metro Planning Development Tracker
- Metro Codes/ePermits
- NDOT permits and closures
- Metro Council agendas and legislation
- hubNashville 311/service requests
- MNPD dashboards and East Precinct public data
- Parks, library, public health, and school-board pages

Output:

- Confirmed quick hits
- Permit File
- Cone Watch
- Civic explainers
- Safety trend briefs
- Public-record verification for rumors

### Lane 2: Direct public sources

- Restaurant, bar, coffee, venue, festival, and neighborhood-org websites
- Public Instagram posts/reels
- Public event calendars
- Business pages and hiring posts

Output:

- Soft Launch Watch
- Openings/closings
- Weekend agenda
- Event guides
- Business briefs

### Lane 3: Reported sources

- Axios Nashville
- Nashville Scene
- WSMV
- Eater Nashville
- Tennessean
- Nashville Business Journal
- City Cast Nashville
- Local newsletters and blogs

Output:

- Link briefs
- Local-angle explainers
- Follow-up questions
- Source triangulation

### Lane 4: Community chatter

- Facebook group selected captures
- Nextdoor manual notes or approved data
- Comments
- Reader tips
- X posts from non-official accounts

Output:

- What People Are Mad About
- Rumor Radar
- Reader questions
- Pattern briefs
- Follow-up assignments

## Data Pipeline

1. `SourceStream`
   - A monitored source: Metro Codes, Facebook group, Instagram watchlist, etc.

2. `RawSourceRecord`
   - The raw thing found: post, permit, event, article, dashboard row, tip, screenshot, or saved query result.

3. `CandidateLead`
   - Normalized editorial object with zone, beat, source confidence, risk, locality, utility, shareability, and next action.

4. `Assignment`
   - Reporter, format, headline angle, source label, verification rule, publish surface.

5. `Draft`
   - Web story, brief item, newsletter block, social copy, and video prompt.

6. `PublishedStory`
   - Public story with source links, source note, media, and confidence label.

## Scoring Formula

Start every lead at zero:

- Locality: 0-25
- Freshness: 0-15
- Source confidence: 0-15
- Usefulness: 0-15
- Shareability: 0-15
- Media richness: 0-10
- Revenue/SEO potential: 0-5
- Risk penalty: 0 to -25

Publish thresholds:

- `85+`: front-page candidate
- `70-84`: daily story or newsletter item
- `55-69`: brief, social, or watchlist follow-up
- `<55`: park unless it confirms a larger pattern

## Access Matrix

The implementation source of truth is `data/source-access-matrix.json`.

The important decisions:

- Official civic/data sources: automate first.
- Local web/RSS/newsletters: automate first.
- Instagram watchlist: semi-automate with handle list and source capture.
- X: saved search/API decision.
- Facebook group: supervised capture only.
- Nextdoor: manual capture panel live; developer access optional.
- Reader tips: automate immediately.

## Build Order

1. Source access matrix and Source Desk UI.
2. Source capture form for Facebook/Nextdoor/manual posts.
3. Watchlists for official records, corridors, addresses, local accounts, and outlets.
4. Daily runner that creates source items from public sources.
5. Scoring worker that ranks candidates.
6. Draft worker that turns approved candidates into stories, beehiiv blocks, social copy, and video prompts.
7. Source audit trail on every story.

## What We Need From Kenny

- Permission to store internal screenshots/source notes for selected Facebook/Nextdoor/community posts.
- A decision on whether to apply for Nextdoor developer access now or wait until after launch.
- First handle list for Instagram if he has favorites; otherwise we build a starter list.
- tips@ email or forwarding target.
- Optional: ask Facebook group admins whether East Meets Nash can periodically invite tips or clarify source use.

## Reference Links

- Meta official Graph/Marketing API v19 announcement: `https://developers.facebook.com/blog/post/2024/01/23/introducing-facebook-graph-and-marketing-api-v19/`
- Sprinklr summary of Meta's Facebook Groups API deprecation: `https://www.sprinklr.com/help/articles/getting-started/meta-deprecates-facebook-groups-api/66229eb25f9dd9599d632712`
- Nextdoor Displaying Content overview: `https://developer.nextdoor.com/docs/displaying-overview`
- Nextdoor content data types: `https://developer.nextdoor.com/reference/displaying-data-types`
- Nextdoor developer overview: `https://developer.nextdoor.com/docs`
