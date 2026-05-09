# Integration Checklist For Access Day

## ATXP

- Create OIDC app/client for the domain.
- Set callback URL: `/api/auth/callback` once auth routes are added.
- Add `OPENID_CLIENT_ID`, `OPENID_CLIENT_SECRET`, `OPENID_ISSUER`.
- Confirm Accounts API URL.
- Confirm `/api/funding/payment-link` supports product attribution:
  - `product=east_meets_nash`
  - `source_surface`
  - `return_url`
  - selected `amount`

## beehiiv

- Add `BEEHIIV_API_KEY`.
- Add `BEEHIIV_PUBLICATION_ID`.
- Replace `/api/beehiiv/export` text response with:
  - draft post creation
  - subscriber sync
  - morning brief template blocks

## Database

- Provision Postgres.
- Run `migrations/001_initial_schema.sql`.
- Replace `web/.local-data` helpers with database queries.

## Social

- Create or connect Instagram, TikTok, X, and Threads handles.
- Decide whether scheduling runs through native APIs, a scheduler, or manual exports at launch.

## Private Sources

- Decide the supervised capture workflow for the private Facebook group.
- Decide the Nextdoor capture workflow.
- Store screenshots/source notes internally, but publish only transformed, labeled story summaries.
