import { NextResponse } from "next/server";
import { getStoryBySlug } from "@/lib/content";
import { isRoundupStory, renderIssueCoverSvg } from "@/lib/story-images";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const story = id ? getStoryBySlug(id) : undefined;

  if (!story || !isRoundupStory(story)) {
    return new NextResponse("Issue cover not found", { status: 404 });
  }

  return new NextResponse(renderIssueCoverSvg(story), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "image/svg+xml; charset=utf-8",
    },
  });
}
