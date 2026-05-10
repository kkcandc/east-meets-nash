import Link from "next/link";
import type { Story } from "@/lib/types";

function isSeriousStory(story: Story) {
  return ["Safety", "Crime", "Public Safety"].includes(story.beat) || story.title.includes("No Jokes");
}

export function StoryCard({
  story,
  lead = false,
  variant = "standard",
}: {
  story: Story;
  lead?: boolean;
  variant?: "standard" | "package";
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
    <article className={className}>
      {story.heroImage ? (
        <img className="story-art story-image" src={story.heroImage} alt={story.heroAlt || ""} />
      ) : (
        <div className={`story-art art-${story.imageStyle}`} />
      )}
      <div className="story-content">
        <div className="story-meta">
          <span className={`pill ${serious ? "serious" : "hot"}`}>{story.label}</span>
          <span>{story.zone}</span>
          <span>{story.beat}</span>
        </div>
        <h2>
          <Link href={`/story/${story.slug}`}>{story.title}</Link>
        </h2>
        <p>{story.deck}</p>
        <Link className="story-read-link" href={`/story/${story.slug}`}>
          Read story
        </Link>
      </div>
    </article>
  );
}
