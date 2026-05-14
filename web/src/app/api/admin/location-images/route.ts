import { NextResponse } from "next/server";

type LookupStatus = "api_key_missing" | "google_ok" | "google_error" | "missing_query" | "no_results";

interface PlacePhoto {
  name?: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: Array<{
    displayName?: string;
    uri?: string;
    photoUri?: string;
  }>;
}

interface GooglePlace {
  id?: string;
  displayName?: {
    text?: string;
    languageCode?: string;
  };
  formattedAddress?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  photos?: PlacePhoto[];
}

interface GoogleSearchResponse {
  places?: GooglePlace[];
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

interface GooglePhotoResponse {
  name?: string;
  photoUri?: string;
}

function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function mapsEmbedUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

function normalizeAttributionUri(uri?: string) {
  if (!uri) return undefined;
  if (uri.startsWith("//")) return `https:${uri}`;
  return uri;
}

function attributionCredit(attributions?: PlacePhoto["authorAttributions"]) {
  const names = (attributions || [])
    .map((attribution) => attribution.displayName?.trim())
    .filter((name): name is string => Boolean(name));

  if (!names.length) return "Google Places";
  return `Google Places photo: ${names.join(", ")}`;
}

function fallbackPayload(query: string, status: LookupStatus, message?: string) {
  return {
    query,
    status,
    message,
    mapsUrl: mapsSearchUrl(query),
    embedUrl: mapsEmbedUrl(query),
    mediaSnippet: {
      label: "Location Map",
      title: `${query} map`,
      description: "Maps embed fallback until a licensed location photo is selected.",
      url: mapsSearchUrl(query),
      embedUrl: mapsEmbedUrl(query),
    },
  };
}

async function fetchPhotoUri(photo: PlacePhoto, apiKey: string) {
  if (!photo.name) return undefined;

  const photoPath = photo.name
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const photoUrl = `https://places.googleapis.com/v1/${photoPath}/media?maxWidthPx=1200&skipHttpRedirect=true&key=${encodeURIComponent(
    apiKey,
  )}`;
  const response = await fetch(photoUrl, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) return undefined;
  const data = (await response.json()) as GooglePhotoResponse;
  return data.photoUri;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() || "";

  if (!query) {
    return NextResponse.json(fallbackPayload("East Nashville TN", "missing_query", "Add a place or address query."), {
      status: 400,
    });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      fallbackPayload(
        query,
        "api_key_missing",
        "Add GOOGLE_MAPS_API_KEY or GOOGLE_PLACES_API_KEY to return Google Places photo candidates.",
      ),
    );
  }

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.photos",
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 1,
      }),
      next: { revalidate: 0 },
    });

    const data = (await response.json().catch(() => ({}))) as GoogleSearchResponse;
    if (!response.ok) {
      return NextResponse.json(
        fallbackPayload(query, "google_error", data.error?.message || "Google Places request failed."),
        { status: 502 },
      );
    }

    const place = data.places?.[0];
    if (!place) {
      return NextResponse.json(fallbackPayload(query, "no_results", "Google Places did not return a match."));
    }

    const firstPhoto = place.photos?.[0];
    const photoUri = firstPhoto ? await fetchPhotoUri(firstPhoto, apiKey) : undefined;
    const placeTitle = place.displayName?.text || query;
    const attributions = (firstPhoto?.authorAttributions || []).map((attribution) => ({
      displayName: attribution.displayName,
      uri: normalizeAttributionUri(attribution.uri),
      photoUri: normalizeAttributionUri(attribution.photoUri),
    }));
    const mapsUrl = mapsSearchUrl(place.formattedAddress || placeTitle);
    const embedUrl = mapsEmbedUrl(place.formattedAddress || placeTitle);
    const imageUrl = `/api/media/location-photo?q=${encodeURIComponent(place.formattedAddress || placeTitle)}`;
    const credit = attributionCredit(attributions);

    return NextResponse.json({
      query,
      status: "google_ok" satisfies LookupStatus,
      mapsUrl,
      embedUrl,
      place: {
        id: place.id,
        displayName: placeTitle,
        formattedAddress: place.formattedAddress,
        location: place.location,
      },
      photo: photoUri
        ? {
            photoUri,
            widthPx: firstPhoto?.widthPx,
            heightPx: firstPhoto?.heightPx,
            authorAttributions: attributions,
          }
        : undefined,
      mediaSnippet: photoUri
        ? {
            label: "Location Photo",
            title: placeTitle,
            description: place.formattedAddress || "Location photo candidate from Google Places.",
            url: mapsUrl,
            imageUrl,
            imageAlt: `${placeTitle} location photo.`,
            credit,
          }
        : {
            label: "Location Map",
            title: `${placeTitle} map`,
            description: place.formattedAddress || "Maps embed fallback until a licensed location photo is selected.",
            url: mapsUrl,
            embedUrl,
          },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Location image lookup failed.";
    return NextResponse.json(fallbackPayload(query, "google_error", message), { status: 502 });
  }
}
