import { beehiivErrorResponse, createBeehiivSubscription, getBeehiivConfig } from "@/lib/beehiiv";

function isEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        email?: unknown;
        referringSite?: string;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
      }
    | null;

  if (!isEmail(body?.email)) {
    return Response.json({ error: "A valid email is required." }, { status: 400 });
  }

  const config = getBeehiivConfig();
  if (!config.configured) {
    return Response.json({
      mode: "mock",
      email: body.email,
      status: "mock_subscribed",
      note: "beehiiv credentials are not fully configured, so no subscriber was created.",
    });
  }

  try {
    const subscription = await createBeehiivSubscription({
      email: body.email,
      referringSite: body.referringSite,
      utmSource: body.utmSource,
      utmMedium: body.utmMedium,
      utmCampaign: body.utmCampaign,
    });
    return Response.json({ mode: "live", subscription }, { status: 201 });
  } catch (error) {
    return beehiivErrorResponse(error);
  }
}
