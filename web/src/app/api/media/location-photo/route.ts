import { NextResponse } from "next/server";

interface PlacePhoto {
  name?: string;
}

interface GoogleSearchResponse {
  places?: Array<{
    photos?: PlacePhoto[];
  }>;
  error?: {
    message?: string;
  };
}

interface GooglePhotoResponse {
  photoUri?: string;
}

function jsonError(message: string, status = 404) {
  return NextResponse.json({ error: message }, { status });
}

function photoMediaUrl(photoName: string, apiKey: string) {
  const photoPath = photoName
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `https://places.googleapis.com/v1/${photoPath}/media?maxWidthPx=1200&skipHttpRedirect=true&key=${encodeURIComponent(
    apiKey,
  )}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() || "";
  if (!query) return jsonError("Add a place or address query.", 400);

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return jsonError("Google Places photo lookup is not configured.", 404);

  const searchResponse = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.photos",
    },
    body: JSON.stringify({
      textQuery: query,
      maxResultCount: 1,
    }),
    next: { revalidate: 0 },
  });

  const searchData = (await searchResponse.json().catch(() => ({}))) as GoogleSearchResponse;
  if (!searchResponse.ok) {
    return jsonError(searchData.error?.message || "Google Places search failed.", 502);
  }

  const photoName = searchData.places?.[0]?.photos?.[0]?.name;
  if (!photoName) return jsonError("No Google Places photo was found for this query.", 404);

  const photoResponse = await fetch(photoMediaUrl(photoName, apiKey), {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });
  const photoData = (await photoResponse.json().catch(() => ({}))) as GooglePhotoResponse;

  if (!photoResponse.ok || !photoData.photoUri) {
    return jsonError("Google Places photo request failed.", 502);
  }

  const redirect = NextResponse.redirect(photoData.photoUri, 307);
  redirect.headers.set("Cache-Control", "no-store");
  return redirect;
}
