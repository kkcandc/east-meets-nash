import {
  beehiivErrorResponse,
  getBeehiivConfig,
  getBeehiivPublication,
  listBeehiivPublications,
} from "@/lib/beehiiv";

export async function GET() {
  const config = getBeehiivConfig();

  if (!config.hasApiKey) {
    return Response.json({
      config,
      mode: "mock",
      publications: [],
      note: "Add BEEHIIV_API_KEY to enable live beehiiv checks.",
    });
  }

  try {
    if (config.hasPublicationId) {
      const publication = await getBeehiivPublication();
      return Response.json({ config, mode: "live", publication });
    }

    const publications = await listBeehiivPublications();
    return Response.json({
      config,
      mode: "needs_publication_id",
      publications,
      note: "Set BEEHIIV_PUBLICATION_ID to one of these publication ids.",
    });
  } catch (error) {
    return beehiivErrorResponse(error);
  }
}
