import Link from "next/link";
import type { Story } from "@/lib/types";

function isSeriousStory(story: Story) {
  return ["Safety", "Crime", "Public Safety"].includes(story.beat) || story.title.includes("No Jokes");
}

function featuredImage(story: Story) {
  return story.heroImage || `/assets/stories/fallback-${story.imageStyle || "street"}.svg`;
}

function featuredAlt(story: Story) {
  return story.heroAlt || `${story.beat} featured image for ${story.title}`;
}

export function StoryCard({
  story,
  lead = false,
  variant = "standard",
  showZone = true,
}: {
  story: Story;
  lead?: boolean;
  variant?: "standard" | "package";
  showZone?: boolean;
}) {
  const serious = isSeriousStory(story);
  const className = [
    "story-card",
    lead ? "lead-card" : "",
    variant === "package" ? "package-card" : "",
    serious ? "serious-card" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link className={className} href={`/story/${story.slug}`} aria-label={`Read ${story.title}`}>
      <img className="story-art story-image" src={featuredImage(story)} alt={featuredAlt(story)} />
      <div className="story-content">
        <div className="story-meta">
          <span className={`pill ${serious ? "serious" : "hot"}`}>{story.label}</span>
          {showZone ? <span>{story.zone}</span> : null}
          <span>{story.beat}</span>
          <span>{story.time}</span>
        </div>
        <h2>{story.title}</h2>
        <p>{story.deck}</p>
        <span className="story-read-link">Read story</span>
      </div>
    </Link>
  );
}
