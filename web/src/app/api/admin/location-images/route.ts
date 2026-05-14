import { NextResponse } from "next/server";

type LookupStatus = "api_key_missing" | "google_ok" | "google_error" | "missing_query" | "no_results";
type CandidateKind = "photo" | "map" | "streetview";

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

function apiKey() {
  return process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
}

function mapsEmbedKey() {
  return process.env.GOOGLE_MAPS_EMBED_KEY;
}

function mapsSearchUrl(query: string, placeId?: string) {
  const placeParam = placeId ? `&query_place_id=${encodeURIComponent(placeId)}` : "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}${placeParam}`;
}

function mapsEmbedUrl(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

function streetViewEmbedUrl(place: GooglePlace, key?: string) {
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  if (!key || lat === undefined || lng === undefined) return undefined;
  const params = new URLSearchParams({
    key,
    location: `${lat},${lng}`,
    source: "outdoor",
    fov: "75",
    pitch: "0",
  });
  return `https://www.google.com/maps/embed/v1/streetview?${params.toString()}`;
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

  if (!names.length) return "Photo: Google Maps / Google Places.";
  return `Photo: Google Maps / Google Places; contributor attribution: ${names.join(", ")}.`;
}

function normalizedAttributions(attributions?: PlacePhoto["authorAttributions"]) {
  return (attributions || []).map((attribution) => ({
    displayName: attribution.displayName,
    uri: normalizeAttributionUri(attribution.uri),
    photoUri: normalizeAttributionUri(attribution.photoUri),
  }));
}

function fallbackPayload(query: string, status: LookupStatus, message?: string) {
  const mapsUrl = mapsSearchUrl(query);
  const embedUrl = mapsEmbedUrl(query);
  return {
    query,
    status,
    message,
    mapsUrl,
    embedUrl,
    candidates: [
      {
        id: "map-fallback",
        kind: "map" satisfies CandidateKind,
        provider: "google_maps_embed",
        title: `${query} map`,
        sourceUrl: mapsUrl,
        embedUrl,
        relevance: "strong",
        relevanceScore: 60,
        approvalStatus: "needs_review",
        rightsNote: "Google Maps embed fallback. Use when no exact approved photo is available.",
        mediaSnippet: {
          label: "Location Map",
          title: `${query} map`,
          description: "Maps embed fallback until an exact approved photo is selected.",
          url: mapsUrl,
          embedUrl,
          provider: "google_maps_embed",
          relevance: "strong",
          relevanceScore: 60,
          approvalStatus: "needs_review",
          rightsNote: "Google Maps embed fallback. Use when no exact approved photo is available.",
        },
      },
    ],
    mediaSnippet: {
      label: "Location Map",
      title: `${query} map`,
      description: "Maps embed fallback until an exact approved photo is selected.",
      url: mapsUrl,
      embedUrl,
      provider: "google_maps_embed",
      relevance: "strong",
      relevanceScore: 60,
      approvalStatus: "needs_review",
      rightsNote: "Google Maps embed fallback. Use when no exact approved photo is available.",
    },
  };
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

async function fetchPhotoUri(photo: PlacePhoto, key: string) {
  if (!photo.name) return undefined;
  const response = await fetch(photoMediaUrl(photo.name, key), {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) return undefined;
  const data = (await response.json().catch(() => ({}))) as GooglePhotoResponse;
  return data.photoUri;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() || "";
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 8), 1), 10);

  if (!query) {
    return NextResponse.json(fallbackPayload("East Nashville TN", "missing_query", "Add a place or address query."), {
      status: 400,
    });
  }

  const key = apiKey();
  if (!key) {
    return NextResponse.json(
      fallbackPayload(
        query,
        "api_key_missing",
        "Add GOOGLE_MAPS_API_KEY or GOOGLE_PLACES_API_KEY to return exact Google Places photo candidates.",
      ),
    );
  }

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.photos",
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 3,
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

    const places = data.places || [];
    if (!places.length) {
      return NextResponse.json(fallbackPayload(query, "no_results", "Google Places did not return a match."));
    }

    const candidates = [];
    for (const [placeIndex, place] of places.entries()) {
      const placeTitle = place.displayName?.text || query;
      const address = place.formattedAddress || placeTitle;
      const mapsUrl = mapsSearchUrl(address, place.id);
      const embedUrl = mapsEmbedUrl(address);
      const placeBoost = placeIndex === 0 ? 0 : -10;
      const photos = (place.photos || []).slice(0, limit);

      for (const [photoIndex, photo] of photos.entries()) {
        const photoUri = await fetchPhotoUri(photo, key);
        if (!photoUri) continue;
        const imageUrl = `/api/media/location-photo?placeId=${encodeURIComponent(place.id || "")}&photoIndex=${photoIndex}&q=${encodeURIComponent(
          address,
        )}`;
        const attributions = normalizedAttributions(photo.authorAttributions);
        const relevanceScore = Math.max(72, 98 + placeBoost - photoIndex * 3);
        candidates.push({
          id: `place-${placeIndex}-photo-${photoIndex}`,
          kind: "photo" satisfies CandidateKind,
          provider: "google_places",
          title: `${placeTitle} photo ${photoIndex + 1}`,
          sourceUrl: mapsUrl,
          imageUrl,
          previewImageUrl: photoUri,
          imageAlt: `${placeTitle} location photo.`,
          credit: attributionCredit(photo.authorAttributions),
          widthPx: photo.widthPx,
          heightPx: photo.heightPx,
          authorAttributions: attributions,
          place: {
            id: place.id,
            displayName: placeTitle,
            formattedAddress: place.formattedAddress,
            location: place.location,
          },
          relevance: placeIndex === 0 ? "exact" : "strong",
          relevanceScore,
          approvalStatus: "needs_review",
          rightsNote:
            "Google Maps Platform photo. Store the place ID, refetch media dynamically, and display Google Maps plus contributor attribution.",
          mediaSnippet: {
            label: "Location Photo",
            title: placeTitle,
            description: place.formattedAddress || "Exact Google Places photo candidate selected by the Photo Desk.",
            url: mapsUrl,
            imageUrl,
            imageAlt: `${placeTitle} location photo.`,
            credit: attributionCredit(photo.authorAttributions),
            provider: "google_places",
            sourceType: "api_photo",
            placeId: place.id,
            placeQuery: address,
            relevance: placeIndex === 0 ? "exact" : "strong",
            relevanceScore,
            approvalStatus: "needs_review",
            rightsNote:
              "Google Maps Platform photo. Store the place ID, refetch media dynamically, and display Google Maps plus contributor attribution.",
          },
        });

        if (candidates.length >= limit) break;
      }

      if (candidates.length >= limit) break;
    }

    const firstPlace = places[0];
    const firstTitle = firstPlace.displayName?.text || query;
    const firstAddress = firstPlace.formattedAddress || firstTitle;
    const firstMapsUrl = mapsSearchUrl(firstAddress, firstPlace.id);
    const firstEmbedUrl = mapsEmbedUrl(firstAddress);
    const streetViewUrl = streetViewEmbedUrl(firstPlace, mapsEmbedKey());

    if (streetViewUrl) {
      candidates.push({
        id: "streetview-exact",
        kind: "streetview" satisfies CandidateKind,
        provider: "google_maps_embed",
        title: `${firstTitle} Street View`,
        sourceUrl: firstMapsUrl,
        embedUrl: streetViewUrl,
        place: {
          id: firstPlace.id,
          displayName: firstTitle,
          formattedAddress: firstPlace.formattedAddress,
          location: firstPlace.location,
        },
        relevance: "exact",
        relevanceScore: 86,
        approvalStatus: "needs_review",
        rightsNote: "Google Maps Street View embed. Keep Google Maps attribution visible.",
        mediaSnippet: {
          label: "Street View",
          title: `${firstTitle} Street View`,
          description: firstPlace.formattedAddress || "Exact street-level context from Google Maps Embed API.",
          url: firstMapsUrl,
          embedUrl: streetViewUrl,
          provider: "google_maps_embed",
          sourceType: "streetview_embed",
          placeId: firstPlace.id,
          placeQuery: firstAddress,
          relevance: "exact",
          relevanceScore: 86,
          approvalStatus: "needs_review",
          rightsNote: "Google Maps Street View embed. Keep Google Maps attribution visible.",
        },
      });
    }

    candidates.push({
      id: "map-exact",
      kind: "map" satisfies CandidateKind,
      provider: "google_maps_embed",
      title: `${firstTitle} map`,
      sourceUrl: firstMapsUrl,
      embedUrl: firstEmbedUrl,
      place: {
        id: firstPlace.id,
        displayName: firstTitle,
        formattedAddress: firstPlace.formattedAddress,
        location: firstPlace.location,
      },
      relevance: "strong",
      relevanceScore: 62,
      approvalStatus: "needs_review",
      rightsNote: "Google Maps embed fallback. Use when no exact approved photo is available.",
      mediaSnippet: {
        label: "Location Map",
        title: `${firstTitle} map`,
        description: firstPlace.formattedAddress || "Map context from Google Maps.",
        url: firstMapsUrl,
        embedUrl: firstEmbedUrl,
        provider: "google_maps_embed",
        sourceType: "map_embed",
        placeId: firstPlace.id,
        placeQuery: firstAddress,
        relevance: "strong",
        relevanceScore: 62,
        approvalStatus: "needs_review",
        rightsNote: "Google Maps embed fallback. Use when no exact approved photo is available.",
      },
    });

    const preferred = candidates.find((candidate) => candidate.kind === "photo") || candidates[0];

    return NextResponse.json({
      query,
      status: "google_ok" satisfies LookupStatus,
      mapsUrl: firstMapsUrl,
      embedUrl: firstEmbedUrl,
      place: {
        id: firstPlace.id,
        displayName: firstTitle,
        formattedAddress: firstPlace.formattedAddress,
        location: firstPlace.location,
      },
      candidates,
      mediaSnippet: preferred.mediaSnippet,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Location image lookup failed.";
    return NextResponse.json(fallbackPayload(query, "google_error", message), { status: 502 });
  }
}
