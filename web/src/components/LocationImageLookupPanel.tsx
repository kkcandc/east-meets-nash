"use client";

import { useMemo, useState } from "react";

interface LocationImageResult {
  query: string;
  status: "api_key_missing" | "google_ok" | "google_error" | "missing_query" | "no_results";
  message?: string;
  mapsUrl: string;
  embedUrl: string;
  place?: {
    id?: string;
    displayName?: string;
    formattedAddress?: string;
    location?: {
      latitude?: number;
      longitude?: number;
    };
  };
  photo?: {
    photoUri: string;
    widthPx?: number;
    heightPx?: number;
    authorAttributions?: Array<{
      displayName?: string;
      uri?: string;
      photoUri?: string;
    }>;
  };
  mediaSnippet: {
    label: string;
    title: string;
    description: string;
    url?: string;
    imageUrl?: string;
    imageAlt?: string;
    embedUrl?: string;
    credit?: string;
  };
}

interface LookupState {
  status: "idle" | "loading" | "ready" | "error";
  message?: string;
  result?: LocationImageResult;
}

const defaultQuery = "The Basement East 917 Woodland St Nashville TN";

function statusLabel(status: LocationImageResult["status"]) {
  if (status === "google_ok") return "Google Places";
  if (status === "api_key_missing") return "Needs API Key";
  if (status === "no_results") return "No Match";
  if (status === "missing_query") return "Missing Query";
  return "Lookup Error";
}

function statusClass(status: LocationImageResult["status"]) {
  if (status === "google_ok") return "live";
  if (status === "api_key_missing" || status === "missing_query") return "needs-source";
  if (status === "no_results") return "drafting";
  return "blocked";
}

export function LocationImageLookupPanel() {
  const [query, setQuery] = useState(defaultQuery);
  const [lookupState, setLookupState] = useState<LookupState>({ status: "idle" });

  const snippet = useMemo(() => {
    if (!lookupState.result) return "";
    return JSON.stringify(lookupState.result.mediaSnippet, null, 2);
  }, [lookupState.result]);

  async function lookupLocationImage() {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setLookupState({ status: "error", message: "Add a place name, address, or both." });
      return;
    }

    setLookupState({ status: "loading", message: "Looking up location media..." });

    try {
      const response = await fetch(`/api/admin/location-images?q=${encodeURIComponent(trimmedQuery)}`);
      const result = (await response.json().catch(() => ({}))) as LocationImageResult & { error?: string };

      if (!response.ok && !result.mediaSnippet) {
        setLookupState({ status: "error", message: result.message || result.error || "Location lookup failed." });
        return;
      }

      setLookupState({
        status: "ready",
        message:
          result.status === "api_key_missing"
            ? "No Google key is configured, so this produced the map/source fallback."
            : result.message,
        result,
      });
    } catch (error) {
      setLookupState({
        status: "error",
        message: error instanceof Error ? error.message : "Location lookup failed.",
      });
    }
  }

  const result = lookupState.result;

  return (
    <section className="desk-panel location-image-panel">
      <div className="capture-panel-heading">
        <div>
          <p className="eyebrow">Real Image Helper</p>
          <h2>Find location media for a story</h2>
          <p>
            Paste a venue, business, park, intersection, or address. The tool returns a story-ready media block with a
            map fallback now, and a server-side Google Places photo endpoint when the key is configured.
          </p>
        </div>
        <span className="status-chip ready">Story Media</span>
      </div>
      <div className="location-image-form">
        <label className="capture-field">
          Place or address
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Five Points Pizza 1012 Woodland St Nashville TN"
          />
        </label>
        <div className="button-row">
          <button type="button" onClick={() => void lookupLocationImage()} disabled={lookupState.status === "loading"}>
            {lookupState.status === "loading" ? "Looking..." : "Lookup Media"}
          </button>
        </div>
      </div>
      {lookupState.message ? (
        <p className={`action-note ${lookupState.status === "error" ? "error" : ""}`} aria-live="polite">
          {lookupState.message}
        </p>
      ) : null}
      {result ? (
        <div className="location-image-grid">
          <figure className="location-preview">
            <div className="capture-preview-header">
              <div>
                <span className={`status-chip ${statusClass(result.status)}`}>{statusLabel(result.status)}</span>
                <h3>{result.place?.displayName || result.query}</h3>
                {result.place?.formattedAddress ? <p>{result.place.formattedAddress}</p> : null}
              </div>
              <a href={result.mapsUrl}>Open source map</a>
            </div>
            {result.photo?.photoUri ? (
              <>
                <img src={result.photo.photoUri} alt={`${result.place?.displayName || result.query} location`} />
                {result.photo.authorAttributions?.length ? (
                  <figcaption>
                    Photo attribution:{" "}
                    {result.photo.authorAttributions.map((attribution, index) => (
                      <span key={`${attribution.displayName || "Google Places"}-${index}`}>
                        {attribution.uri ? (
                          <a href={attribution.uri}>{attribution.displayName || "Google Places contributor"}</a>
                        ) : (
                          attribution.displayName || "Google Places contributor"
                        )}
                      </span>
                    ))}
                  </figcaption>
                ) : (
                  <figcaption>Photo attribution: Google Places</figcaption>
                )}
              </>
            ) : (
              <iframe
                className="location-map-frame"
                title={`${result.query} map`}
                src={result.embedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </figure>
          <div className="location-snippet">
            <h3>Story media snippet</h3>
            <p>Add this object to the story&apos;s <code>media</code> array after the editor approves the source.</p>
            <pre>{snippet}</pre>
          </div>
        </div>
      ) : null}
    </section>
  );
}
