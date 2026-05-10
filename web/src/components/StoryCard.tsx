import Link from "next/link";
import { formatReactionLabel, getReporter } from "@/lib/content";
import type { Story } from "@/lib/types";

export function StoryCard({ story, lead = false }: { story: Story; lead?: boolean }) {
  const reporter = getReporter(story.reporterId);

  return (
    <article className={`story-card ${lead ? "lead-card" : ""}`}>
      <div className={`story-art art-${story.imageStyle}`} />
      <div className="story-content">
        <div className="story-meta">
          <span className="pill hot">{story.label}</span>
          <span>{story.zone}</span>
          <span>{story.beat}</span>
          <span>{reporter.name}</span>
        </div>
        <h2>
          <Link href={`/story/${story.slug}`}>{story.title}</Link>
        </h2>
        <p>{story.deck}</p>
        <div className="reaction-row">
          {Object.entries(story.reactions).slice(0, 3).map(([name, count]) => (
            <span key={name} className="reaction-chip">
              {formatReactionLabel(name)} <strong>{count}</strong>
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
