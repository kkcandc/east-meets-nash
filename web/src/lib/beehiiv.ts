import { buildBeehiivHtml, buildBeehiivPostTitle } from "@/lib/content";

const BEEHIIV_API_BASE = "https://api.beehiiv.com/v2";

export interface BeehiivPublication {
  id: string;
  name: string;
  organization_name?: string;
  referral_program_enabled?: boolean;
  created?: number;
  stats?: Record<string, unknown>;
}

export interface BeehiivSubscriptionResponse {
  id: string;
  email: string;
  status: string;
  subscription_tier?: string;
}

export interface BeehiivPostResponse {
  id: string;
}

export interface BeehiivConfigStatus {
  configured: boolean;
  hasApiKey: boolean;
  hasPublicationId: boolean;
  publicationId?: string;
  publicationUrl?: string;
  postStatus: "draft" | "confirmed";
  sendWelcomeEmail: boolean;
}

export function getBeehiivConfig(): BeehiivConfigStatus {
  const postStatus = process.env.BEEHIIV_POST_STATUS === "confirmed" ? "confirmed" : "draft";

  return {
    configured: Boolean(process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID),
    hasApiKey: Boolean(process.env.BEEHIIV_API_KEY),
    hasPublicationId: Boolean(process.env.BEEHIIV_PUBLICATION_ID),
    publicationId: process.env.BEEHIIV_PUBLICATION_ID,
    publicationUrl: process.env.BEEHIIV_PUBLICATION_URL,
    postStatus,
    sendWelcomeEmail: process.env.BEEHIIV_SEND_WELCOME_EMAIL === "true",
  };
}

class BeehiivError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = "beehiiv_error") {
    super(message);
    this.name = "BeehiivError";
    this.status = status;
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function beehiivRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const apiKey = process.env.BEEHIIV_API_KEY;
  if (!apiKey) {
    throw new BeehiivError("BEEHIIV_API_KEY is not configured.", 503, "missing_api_key");
  }

  const response = await fetch(`${BEEHIIV_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as T | Record<string, unknown> | null;

  if (!response.ok) {
    const message =
      isRecord(data) && typeof data.message === "string"
        ? data.message
        : isRecord(data) && typeof data.error === "string"
          ? data.error
          : "beehiiv request failed.";
    throw new BeehiivError(message, response.status);
  }

  return data as T;
}

export async function listBeehiivPublications(): Promise<BeehiivPublication[]> {
  const result = await beehiivRequest<{ data: BeehiivPublication[] }>("/publications?limit=100");
  return result.data;
}

export async function getBeehiivPublication(publicationId = process.env.BEEHIIV_PUBLICATION_ID) {
  if (!publicationId) {
    throw new BeehiivError("BEEHIIV_PUBLICATION_ID is not configured.", 503, "missing_publication_id");
  }
  const result = await beehiivRequest<{ data: BeehiivPublication }>(`/publications/${publicationId}`);
  return result.data;
}

export async function createBeehiivSubscription({
  email,
  referringSite,
  utmSource = "east_meets_nash_web",
  utmMedium = "website",
  utmCampaign = "launch",
}: {
  email: string;
  referringSite?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}) {
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!publicationId) {
    throw new BeehiivError("BEEHIIV_PUBLICATION_ID is not configured.", 503, "missing_publication_id");
  }

  const result = await beehiivRequest<{ data: BeehiivSubscriptionResponse }>(
    `/publications/${publicationId}/subscriptions`,
    {
      method: "POST",
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: process.env.BEEHIIV_SEND_WELCOME_EMAIL === "true",
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        referring_site: referringSite,
      }),
    },
  );

  return result.data;
}

export async function createBeehiivDraftPost({
  storyCount = 5,
  status = getBeehiivConfig().postStatus,
}: {
  storyCount?: number;
  status?: "draft" | "confirmed";
} = {}) {
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!publicationId) {
    throw new BeehiivError("BEEHIIV_PUBLICATION_ID is not configured.", 503, "missing_publication_id");
  }

  const result = await beehiivRequest<{ data: BeehiivPostResponse }>(`/publications/${publicationId}/posts`, {
    method: "POST",
    body: JSON.stringify({
      title: buildBeehiivPostTitle(),
      subtitle: "East Nashville, with receipts.",
      status,
      body_content: buildBeehiivHtml(storyCount),
      content_tags: ["east-nashville", "morning-brief"],
      custom_link_tracking_enabled: true,
      email_capture_type_override: "none",
      web_settings: {
        display_thumbnail_on_web: false,
      },
      seo_settings: {
        meta_title: buildBeehiivPostTitle(),
        meta_description: "East Nashville local news, gossip, civic watchdog coverage, events, restaurants, and classifieds.",
      },
    }),
  });

  return result.data;
}

export function beehiivErrorResponse(error: unknown) {
  if (error instanceof BeehiivError) {
    return Response.json({ error: error.message, code: error.code }, { status: error.status });
  }
  return Response.json({ error: "Unexpected beehiiv error." }, { status: 500 });
}
