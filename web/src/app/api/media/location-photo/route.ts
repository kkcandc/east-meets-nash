import { NextResponse } from "next/server";

interface PlacePhoto {
  name?: string;
}

interface GooglePlace {
  photos?: PlacePhoto[];
}

interface GoogleSearchResponse {
  places?: GooglePlace[];
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

function apiKey() {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
}

function photoMediaUrl(photoName: string, key: string) {
  const photoPath = photoName
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `https://places.googleapis.com/v1/${photoPath}/media?maxWidthPx=1200&skipHttpRedirect=true&key=${encodeURIComponent(
    key,
  )}`;
}

async function placeFromId(placeId: string, key: string) {
  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "photos",
    },
    next: { revalidate: 0 },
  });
  const data = (await response.json().catch(() => ({}))) as GooglePlace & { error?: { message?: string } };
  if (!response.ok) throw new Error(data.error?.message || "Google Places details lookup failed.");
  return data;
}

async function placeFromQuery(query: string, key: string) {
  const searchResponse = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
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
    throw new Error(searchData.error?.message || "Google Places search failed.");
  }

  return searchData.places?.[0];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() || "";
  const placeId = url.searchParams.get("placeId")?.trim() || "";
  const photoIndex = Math.max(Number(url.searchParams.get("photoIndex") || 0), 0);

  if (!query && !placeId) return jsonError("Add a place ID or place/address query.", 400);

  const key = apiKey();
  if (!key) return jsonError("Google Places photo lookup is not configured.", 404);

  try {
    const place = placeId ? await placeFromId(placeId, key) : await placeFromQuery(query, key);
    const photoName = place?.photos?.[photoIndex]?.name || place?.photos?.[0]?.name;
    if (!photoName) return jsonError("No Google Places photo was found for this query.", 404);

    const photoResponse = await fetch(photoMediaUrl(photoName, key), {
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
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Google Places photo request failed.", 502);
  }
}
