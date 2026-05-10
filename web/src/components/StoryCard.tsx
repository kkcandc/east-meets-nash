import Link from "next/link";
import type { Story } from "@/lib/types";

export function StoryCard({ story, lead = false }: { story: Story; lead?: boolean }) {
  return (
    <article className={`story-card ${lead ? "lead-card" : ""}`}>
      <div className={`story-art art-${story.imageStyle}`} />
      <div className="story-content">
        <div className="story-meta">
          <span className="pill hot">{story.label}</span>
          <span>{story.zone}</span>
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
