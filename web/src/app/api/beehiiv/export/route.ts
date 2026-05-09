import { buildBeehiivExport } from "@/lib/content";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const count = Number(url.searchParams.get("count") || "5");
  return new Response(buildBeehiivExport(Number.isFinite(count) ? count : 5), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
