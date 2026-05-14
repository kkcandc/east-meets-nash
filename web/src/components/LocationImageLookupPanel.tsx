"use client";

import { useMemo, useState } from "react";

interface MediaSnippet {
  label: string;
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  imageAlt?: string;
  embedUrl?: string;
  credit?: string;
  provider?: string;
  sourceType?: string;
  placeId?: string;
  placeQuery?: string;
  relevance?: string;
  relevanceScore?: number;
  approvalStatus?: string;
  rightsNote?: string;
}

interface LocationImageCandidate {
  id: string;
  kind: "photo" | "map" | "streetview";
  provider: string;
  title: string;
  sourceUrl?: string;
  imageUrl?: string;
  previewImageUrl?: string;
  imageAlt?: string;
  embedUrl?: string;
  credit?: string;
  widthPx?: number;
  heightPx?: number;
  relevance: string;
  relevanceScore: number;
  approvalStatus: string;
  rightsNote?: string;
  authorAttributions?: Array<{
    displayName?: string;
    uri?: string;
    photoUri?: string;
  }>;
  mediaSnippet: MediaSnippet;
}

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
  candidates?: LocationImageCandidate[];
  mediaSnippet: MediaSnippet;
}

interface LookupState {
  status: "idle" | "loading" | "ready" | "error";
  message?: string;
  result?: LocationImageResult;
  selectedId?: string;
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

function candidateBadge(candidate: LocationImageCandidate) {
  if (candidate.relevanceScore >= 90) return "Exact";
  if (candidate.relevanceScore >= 75) return "Strong";
  if (candidate.kind === "map" || candidate.kind === "streetview") return "Context";
  return "Review";
}

export function LocationImageLookupPanel() {
  const [query, setQuery] = useState(defaultQuery);
  const [lookupState, setLookupState] = useState<LookupState>({ status: "idle" });

  const result = lookupState.result;
  const candidates = result?.candidates || [];
  const selectedCandidate =
    candidates.find((candidate) => candidate.id === lookupState.selectedId) || candidates[0];

  const snippet = useMemo(() => {
    if (selectedCandidate) return JSON.stringify(selectedCandidate.mediaSnippet, null, 2);
    if (!lookupState.result) return "";
    return JSON.stringify(lookupState.result.mediaSnippet, null, 2);
  }, [lookupState.result, selectedCandidate]);

  async function lookupLocationImage() {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setLookupState({ status: "error", message: "Add a place name, address, or both." });
      return;
    }

    setLookupState({ status: "loading", message: "Looking up exact location media..." });

    try {
      const response = await fetch(`/api/admin/location-images?q=${encodeURIComponent(trimmedQuery)}&limit=8`);
      const nextResult = (await response.json().catch(() => ({}))) as LocationImageResult & { error?: string };

      if (!response.ok && !nextResult.mediaSnippet) {
        setLookupState({ status: "error", message: nextResult.message || nextResult.error || "Location lookup failed." });
        return;
      }

      setLookupState({
        status: "ready",
        message:
          nextResult.status === "api_key_missing"
            ? "No Google key is configured, so this produced the map fallback. Add a key to review exact photo candidates."
            : nextResult.message,
        result: nextResult,
        selectedId: nextResult.candidates?.[0]?.id,
      });
    } catch (error) {
      setLookupState({
        status: "error",
        message: error instanceof Error ? error.message : "Location lookup failed.",
      });
    }
  }

  return (
    <section className="desk-panel location-image-panel">
      <div className="capture-panel-heading">
        <div>
          <p className="eyebrow">Photo Desk</p>
          <h2>Approve exact location media</h2>
          <p>
            Search a venue, address, park, intersection, or public building. Pick the most relevant candidate, then use
            the approved snippet as the story hero or supporting visual.
          </p>
        </div>
        <span className="status-chip ready">Editor Approved</span>
      </div>
      <div className="location-image-form">
        <label className="capture-field">
          Place, address, or intersection
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Party Fowl 1016 Woodland St Nashville TN"
          />
        </label>
        <div className="button-row">
          <button type="button" onClick={() => void lookupLocationImage()} disabled={lookupState.status === "loading"}>
            {lookupState.status === "loading" ? "Looking..." : "Find Photo Candidates"}
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
          <div className="location-candidate-list">
            <div className="capture-preview-header">
              <div>
                <span className={`status-chip ${statusClass(result.status)}`}>{statusLabel(result.status)}</span>
                <h3>{result.place?.displayName || result.query}</h3>
                {result.place?.formattedAddress ? <p>{result.place.formattedAddress}</p> : null}
              </div>
              <a href={result.mapsUrl}>Open source map</a>
            </div>
            {candidates.map((candidate) => (
              <button
                className={`location-candidate-card ${candidate.id === selectedCandidate?.id ? "selected" : ""}`}
                key={candidate.id}
                type="button"
                onClick={() => setLookupState((current) => ({ ...current, selectedId: candidate.id }))}
              >
                <span className="candidate-score">{candidate.relevanceScore}</span>
                <div>
                  <strong>{candidate.title}</strong>
                  <small>
                    {candidateBadge(candidate)} / {candidate.provider.replaceAll("_", " ")} / {candidate.kind}
                  </small>
                  {candidate.rightsNote ? <p>{candidate.rightsNote}</p> : null}
                </div>
              </button>
            ))}
          </div>
          <figure className="location-preview">
            <div className="capture-preview-header">
              <div>
                <span className="status-chip live">{selectedCandidate ? candidateBadge(selectedCandidate) : "Preview"}</span>
                <h3>{selectedCandidate?.title || result.place?.displayName || result.query}</h3>
                {selectedCandidate?.credit ? <p>{selectedCandidate.credit}</p> : null}
              </div>
              {selectedCandidate?.sourceUrl ? <a href={selectedCandidate.sourceUrl}>Open source</a> : null}
            </div>
            {selectedCandidate?.previewImageUrl ? (
              <>
                <img src={selectedCandidate.previewImageUrl} alt={selectedCandidate.imageAlt || selectedCandidate.title} />
                {selectedCandidate.authorAttributions?.length ? (
                  <figcaption>
                    Photo attribution:{" "}
                    {selectedCandidate.authorAttributions.map((attribution, index) => (
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
                  <figcaption>Photo attribution: Google Maps / Google Places</figcaption>
                )}
              </>
            ) : selectedCandidate?.embedUrl ? (
              <iframe
                className="location-map-frame"
                title={selectedCandidate.title}
                src={selectedCandidate.embedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : null}
          </figure>
          <div className="location-snippet">
            <h3>Approved story media snippet</h3>
            <p>
              Add this object to the story media array only after checking that the candidate is exact enough for the
              article. Generic fallbacks need a written unavailable reason.
            </p>
            <pre>{snippet}</pre>
          </div>
        </div>
      ) : null}
    </section>
  );
}
