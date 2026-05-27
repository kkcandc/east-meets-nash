import Link from "next/link";
import { storyCardImage } from "@/lib/story-images";
import type { Story } from "@/lib/types";

function isSeriousStory(story: Story) {
  return ["Safety", "Crime", "Public Safety"].includes(story.beat) || story.title.includes("No Jokes");
}

function sourceStatus(story: Story): { className: string; note: string } {
  if (story.label === "Confirmed") {
    return { className: "confirmed", note: "Official or public source checked" };
  }

  if (story.label === "Reported") {
    return { className: "reported", note: "Reported with source trail" };
  }

  if (story.label === "Group Chat Says") {
    return { className: "group-chat", note: "Supervised community capture" };
  }

  if (story.label === "Seen in the Wild") {
    return { className: "seen", note: "Observed lead, needs follow-up" };
  }

  if (story.label === "Tip Line") {
    return { className: "tip", note: "Reader tip under review" };
  }

  if (story.label === "Allegedly") {
    return { className: "alleged", note: "Unverified, handle carefully" };
  }

  return { className: "neutral", note: story.confidence };
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
  const image = storyCardImage(story);
  const status = sourceStatus(story);

  return (
    <Link className={className} href={`/story/${story.slug}`} aria-label={`Read ${story.title}`}>
      <img className="story-art story-image" src={image.src} alt={image.alt} />
      <div className="story-content">
        <div className="story-meta">
          <span className={`pill ${serious ? "serious" : status.className}`}>{story.label}</span>
          {showZone ? <span>{story.zone}</span> : null}
          <span>{story.beat}</span>
          <span>{story.time}</span>
        </div>
        <span className={`story-source-status ${status.className}`}>{status.note}</span>
        <h2>{story.title}</h2>
        <p>{story.deck}</p>
        <span className="story-read-link">Read story</span>
      </div>
    </Link>
  );
}
