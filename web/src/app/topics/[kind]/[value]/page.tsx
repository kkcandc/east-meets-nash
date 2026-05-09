import { notFound } from "next/navigation";
import { StoryCard } from "@/components/StoryCard";
import { getStoriesForTopic } from "@/lib/content";

interface TopicPageProps {
  params: Promise<{ kind: string; value: string }>;
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { kind, value } = await params;
  if (kind !== "zone" && kind !== "beat") notFound();
  const decoded = decodeURIComponent(value);
  const stories = getStoriesForTopic(kind, decoded);

  return (
    <main>
      <section className="topic-hero">
        <p className="eyebrow">{kind}</p>
        <h1>{decoded}</h1>
      </section>
      <section className="page-band">
        <div className="story-grid">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>
    </main>
  );
}
