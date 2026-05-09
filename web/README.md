# East Meets Nash Web

Production scaffold for East Meets Nash.

The static prototype remains one level up in `site/`. This `web/` app is the deployable Next.js version with:

- Real story routes.
- Topic and feed routes.
- Local admin/source APIs.
- beehiiv export API.
- ATXP auth/payment placeholders.
- SQL migrations.

## Run

```bash
npm install
npm run dev
```

Default URL: `http://localhost:4188`

## Environment Variables

Credentials are intentionally not required for local scaffold work.

- `OPENID_CLIENT_ID`
- `OPENID_CLIENT_SECRET`
- `OPENID_ISSUER`, default `https://auth.atxp.ai`
- `ACCOUNTS_API_URL`, default `https://accounts.atxp.ai`
- `BEEHIIV_API_KEY`
- `BEEHIIV_PUBLICATION_ID`
- `BEEHIIV_PUBLICATION_URL`
- `BEEHIIV_POST_STATUS`, default `draft`
- `BEEHIIV_SEND_WELCOME_EMAIL`, default `false`

## Local Data

Until a database is connected, admin API routes write to `web/.local-data/`.

## beehiiv

See `docs/beehiiv-integration.md`.
