"use client";

import { useMemo, useState } from "react";
import { StoryCard } from "@/components/StoryCard";
import type { Story } from "@/lib/types";

interface SearchPanelProps {
  stories: Story[];
  initialQuery?: string;
}

const quickFilters = ["East Bank", "Events", "Civic", "Food", "Facebook", "Gallatin", "Shelby", "Five Points"];

function searchableText(story: Story) {
  return [
    story.title,
    story.deck,
    story.body,
    story.zone,
    story.beat,
    story.label,
    story.time,
    story.reporterId,
    story.sources.map((source) => source.name).join(" "),
  ]
    .join(" ")
    .toLowerCase();
}

export function SearchPanel({ stories, initialQuery = "" }: SearchPanelProps) {
  const [query, setQuery] = useState(initialQuery);
  const [beat, setBeat] = useState("All");
  const [zone, setZone] = useState("All");

  const beats = useMemo(() => ["All", ...Array.from(new Set(stories.map((story) => story.beat))).sort()], [stories]);
  const zones = useMemo(() => ["All", ...Array.from(new Set(stories.map((story) => story.zone))).sort()], [stories]);
  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    return stories.filter((story) => {
      const matchesQuery = !normalizedQuery || searchableText(story).includes(normalizedQuery);
      const matchesBeat = beat === "All" || story.beat === beat;
      const matchesZone = zone === "All" || story.zone === zone;
      return matchesQuery && matchesBeat && matchesZone;
    });
  }, [beat, normalizedQuery, stories, zone]);

  return (
    <section className="search-workbench" aria-label="Search East Meets Nash">
      <div className="search-controls">
        <label className="search-field">
          <span>Search stories</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="East Bank, Party Fowl, Gallatin, grocery tax..."
          />
        </label>
        <div className="search-select-row">
          <label>
            <span>Beat</span>
            <select value={beat} onChange={(event) => setBeat(event.target.value)}>
              {beats.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Zone</span>
            <select value={zone} onChange={(event) => setZone(event.target.value)}>
              {zones.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="quick-filter-row" aria-label="Quick searches">
          {quickFilters.map((filter) => (
            <button key={filter} type="button" onClick={() => setQuery(filter)}>
              {filter}
            </button>
          ))}
        </div>
      </div>
      <div className="search-results-header">
        <p className="eyebrow">Results</p>
        <h2>{results.length} stories found</h2>
      </div>
      {results.length ? (
        <div className="story-grid">
          {results.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <section className="empty-search-state">
          <p className="eyebrow">Nothing Yet</p>
          <h2>No match in the archive.</h2>
          <p>Try a corridor, venue, beat, neighborhood, or source name. The archive is already nosy; it just likes specific clues.</p>
        </section>
      )}
    </section>
  );
}
