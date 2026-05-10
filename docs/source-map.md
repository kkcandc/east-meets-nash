# Source Map

The deeper operating workflow now lives in `docs/source-operating-system.md`. The implementation data lives in:

- `data/sources.json` for monitored source streams.
- `data/source-items.json` for story leads generated from those streams.

## Priority Sources

1. East Nashville private Facebook group
   - URL: `https://www.facebook.com/share/g/1CnRbtni2c/`
   - Status: Kenny has access, automation still needs an approved way to read it.
   - Use: chatter, tips, neighborhood complaints, events, openings, rumors, lost-and-found, civic mood.

2. General web and RSS
   - Query terms: `East Nashville`, `Five Points Nashville`, `Gallatin Pike`, `Shelby Park`, `Inglewood Nashville`, `Lockeland Springs`, `Cleveland Park Nashville`, `Riverside Village`, `McFerrin Park`, `East Bank Nashville`.
   - Use: confirmed stories, source links, SEO article discovery.

3. Instagram
   - Monitor Nashville news accounts, restaurants, bars, venues, pop-ups, real estate, neighborhood orgs, council members, and event producers.
   - Use: openings, menus, closures, events, visual source material, trend detection.

4. X / Twitter
   - Monitor East Nashville terms, local reporters, city officials, transit, police/fire, development, food writers, and high-signal Nashville accounts.
   - Use: breaking chatter, links, civic complaints, public official statements.

5. Nextdoor
   - Use: resident complaints, crime chatter, lost pets, traffic, services, and hyperlocal temperature checks.
   - Treat as: community chatter unless independently confirmed.

6. Official and civic sources
   - Metro Nashville Council agendas and minutes.
   - Metro permits and planning.
   - MNPD alerts and crime maps.
   - Nashville Fire, NDOT, hubNashville, school board, parks, library, public health.
   - Use: hard facts, civic watchdog items, explainers.

7. Local businesses and venues
   - Restaurants, bars, coffee shops, music venues, gyms, salons, child-friendly places, galleries, markets.
   - Use: openings, closings, events, sponsors, reviews, lists.

## Public Sources To Wire In First

- Metro Council Office: `https://www.nashville.gov/council`
- Metro Planning Development Tracker: `https://maps.nashville.gov/DevelopmentTracker/`
- Metro Planning Department: `https://www.nashville.gov/mpc`
- Metro Codes ePermits and public permit inquiry: `https://www.nashville.gov/departments/codes/construction-and-permits/e-permits-system`
- Metro Codes public records and permit data notes: `https://www.nashville.gov/departments/codes/codes-administration/public-records-and-information`
- NDOT permits: `https://www.nashville.gov/departments/transportation/permits`
- NashvilleMaps: `https://www.nashville.gov/departments/government/maps`
- Tomato Art Fest: `https://www.tomatoartfest.com/`
- Lockeland Springs Neighborhood Association: `https://lockelandsprings.org/`
- City Cast Nashville neighborhood guides: `https://nashville.citycast.fm/neighborhood-guides/five-points-nashville`
- Nashville Scene, Axios Nashville, WSMV, Eater Nashville, Edible Nashville, Visit Music City, Nashville Go, and MyNashville Magazine.

## Local Accounts And Businesses To Track Early

- Tomato Art Fest and Good Neighbor Festivals.
- Lost and Found / Fortunate Sun / Birdie's / Pizza Lolo on Gallatin.
- No Quarter on Main.
- Reunion in Five Points.
- Woodland Play Cafe in Five Points for family coverage.
- Crieve Hall Bagel Co. Inglewood location.
- Party Fowl East Nashville reopening coverage at 1016 Woodland St.
- Margot Cafe and Bar closure coverage through June 2026.

These should be treated as a starting list, not the full beat. The source desk should grow this into a monitored account database with platform handles, RSS where possible, owner/business names, zone, beat, and last-seen timestamp.

## Zones

Primary filters for launch:

- Five Points
- Gallatin
- Shelby
- Inglewood
- Lockeland
- Cleveland Park
- Riverside
- McFerrin Park
- East Bank

## Source Scoring

Each source item should get:

- `locality`: how East Nashville-specific it is.
- `source_confidence`: official, direct, reported, social, tip, rumor.
- `shareability`: likelihood someone forwards it.
- `usefulness`: whether it helps a resident decide, attend, avoid, buy, complain, or laugh.
- `risk`: legal, privacy, personal accusation, sensitive info, or low evidence.
- `follow_up`: whether it needs a source check, public record search, business DM, or Kenny review.

## Private Platform Note

For Facebook and Nextdoor, the cleanest launch path is supervised collection from Kenny's logged-in browser or approved exports. Do not ask users for passwords. Do not bypass platform controls. The operating workflow should keep source notes internal and publish only the transformed article, summary, or clearly attributed community-chatter reference.
