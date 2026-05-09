# ATXP Integration Notes

East Meets Nash should use ATXP as the account and money engine, not as a bolt-on wallet.

## Existing Pattern From ATXP Music

The ATXP Music app uses:

- Next.js with ATXP OIDC.
- OIDC scope: `openid profile email atxp.connection_token`.
- A `connection_token` cookie for authenticated API routes.
- Accounts API balance reads via Basic auth using the connection token.
- Accounts API `/api/funding/payment-link` for one-time Stripe checkout links.
- Shared ATXP balance across products.

This is the right pattern to copy when the production app is scaffolded.

## East Meets Nash Account Model

Logged-out users can:

- Read articles.
- Search.
- Browse categories.
- See sponsor offers.
- Subscribe to the beehiiv newsletter.

Logged-in ATXP users can:

- Personalize the feed.
- Comment and react.
- Save stories.
- Buy classified placements.
- Buy sponsor placements.
- Buy event tickets, vouchers, and merch.
- Top up credits.
- Eventually receive credits for referrals, tips, contests, and promotions.

## Credit Uses

Initial credit-backed actions:

- `$100` sponsor placement.
- `$1,000` sponsored post.
- Classified ad purchase.
- Event ticket purchase.
- Restaurant voucher purchase.
- Merch purchase.

Future credit-backed actions:

- Boost a comment or question.
- Tip bounty for a source lead.
- Paid perk tier.
- Neighborhood deal drops.

## Production API Sketch

- `GET /api/me` - return ATXP profile, account id, and local preferences.
- `GET /api/balance` - proxy Accounts balance using `connection_token`.
- `POST /api/top-up/payment-link` - create Accounts payment link for selected amount.
- `POST /api/classifieds` - charge account, create pending/auto-approved listing.
- `POST /api/sponsor-placements` - charge account and reserve inventory.
- `POST /api/reactions` - record story reaction.
- `POST /api/comments` - create comment under user account.
- `POST /api/preferences` - save zones, beats, reporters, and notification settings.

## Data Model

Local database should store:

- ATXP account id.
- Email and display name from OIDC profile.
- Preferences.
- Comments and reactions.
- Purchases linked to ATXP account id.
- Sponsor placement status.
- Classified status.
- Beehiiv subscription id when available.

Do not store raw connection tokens in long-lived tables unless unavoidable. Prefer secure HTTP-only cookies and short-lived server-side use.

## Brand-Specific Wallet Copy

Avoid generic wallet education. Use product-native labels:

- "East Nash credits"
- "Add credits"
- "Run a classified"
- "Sponsor the morning brief"
- "Grab the voucher"
- "Keep your balance ready for local nonsense"

## Open Dependency

Before production implementation, confirm the current ATXP Accounts OIDC app/client setup for this domain and whether the direct payment-link endpoint can carry product attribution like `east_meets_nash`, amount, source surface, and return URL.
