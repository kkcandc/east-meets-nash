# beehiiv Integration

The app is wired for beehiiv v2 in mock-safe mode. It never sends email by default.

## Environment

Copy `.env.example` to `.env.local` and fill:

```env
BEEHIIV_API_KEY=
BEEHIIV_PUBLICATION_ID=
BEEHIIV_PUBLICATION_URL=
BEEHIIV_POST_STATUS=draft
BEEHIIV_SEND_WELCOME_EMAIL=false
```

Do not commit `.env.local`.

`BEEHIIV_PUBLICATION_ID` may be pasted either as `pub_...` or as the bare UUID shown under API V1. The app normalizes the bare UUID to the v2 `pub_...` format internally.

Current East Meets Nash values:

```env
BEEHIIV_PUBLICATION_ID=pub_94c99936-e02c-4450-9355-616159a7755a
BEEHIIV_PUBLICATION_URL=https://east-meets-nash.beehiiv.com/
```

## Routes

- `GET /api/beehiiv/status`
  - If only the API key is present, lists available publications so you can find the publication id.
  - If both key and publication id are present, checks the selected publication.

- `POST /api/beehiiv/subscribe`
  - Body: `{ "email": "neighbor@example.com" }`
  - Creates a subscription when configured.
  - Returns mock success when credentials are missing.

- `GET /api/beehiiv/export`
  - Returns plain-text issue copy.

- `POST /api/beehiiv/create-draft`
  - Creates a beehiiv post using `body_content`.
  - Defaults to `status: "draft"`.

## Safety Defaults

- `BEEHIIV_POST_STATUS=draft`
- `BEEHIIV_SEND_WELCOME_EMAIL=false`
- The issue builder creates draft posts only unless the env or request explicitly asks for `confirmed`.

## Access Needed

- API key.
- Publication ID.
- Publication URL.
- Sending domain status.
- Confirmation that welcome emails should stay off during testing.
