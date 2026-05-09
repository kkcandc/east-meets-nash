import { beehiivErrorResponse, createBeehiivDraftPost, getBeehiivConfig } from "@/lib/beehiiv";
import { buildBeehiivExport, buildBeehiivPostTitle } from "@/lib/content";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    storyCount?: number;
    status?: "draft" | "confirmed";
  };
  const storyCount = Number.isFinite(Number(body.storyCount)) ? Number(body.storyCount) : 5;
  const config = getBeehiivConfig();

  if (!config.configured) {
    return Response.json({
      mode: "mock",
      post: {
        id: "mock_beehiiv_post",
        title: buildBeehiivPostTitle(),
        status: body.status || config.postStatus,
        text: buildBeehiivExport(storyCount),
      },
      note: "beehiiv credentials are not fully configured, so no draft was created.",
    });
  }

  try {
    const post = await createBeehiivDraftPost({
      storyCount,
      status: body.status || config.postStatus,
    });
    return Response.json({ mode: "live", post }, { status: 201 });
  } catch (error) {
    return beehiivErrorResponse(error);
  }
}
