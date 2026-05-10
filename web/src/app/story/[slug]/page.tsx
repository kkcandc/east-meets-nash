import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatReactionLabel, getReporter, getStories, getStoryBySlug } from "@/lib/content";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getStories().map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) return {};
  return {
    title: story.title,
    description: story.deck,
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) notFound();
  const reporter = getReporter(story.reporterId);

  return (
    <main className="article-shell">
      <article className="article-main">
        <div className="story-meta">
          <span className="pill hot">{story.label}</span>
          <span>{story.zone}</span>
          <span>{story.beat}</span>
          <span>{story.time}</span>
        </div>
        <h1>{story.title}</h1>
        <p className="article-deck">{story.deck}</p>
        <div className={`story-art art-${story.imageStyle}`} />
        <div className="article-body">
          <p>{story.body}</p>
          <p>
            This is the production article shape: confidence label, source trail, reporter byline, reactions, comments,
            and social/video outputs. Live stories will replace prototype notes with real source-backed reporting.
          </p>
        </div>
        <section className="article-section">
          <h2>Sources</h2>
          <ul>
            {story.sources.map((source) => (
              <li key={`${source.name}-${source.url}`}>
                <a href={source.url}>{source.name}</a> <span>{source.type}</span>
              </li>
            ))}
          </ul>
        </section>
      </article>

      <aside className="article-rail">
        <section className="rail-card">
          <p className="eyebrow">Filed By</p>
          <h2>{reporter.name}</h2>
          <p>{reporter.tagline}</p>
          <small>{reporter.beat}</small>
        </section>
        <section className="rail-card">
          <p className="eyebrow">React</p>
          <div className="reaction-row">
            {Object.entries(story.reactions).map(([name, count]) => (
              <span key={name} className="reaction-chip">
                {formatReactionLabel(name)} <strong>{count}</strong>
              </span>
            ))}
          </div>
        </section>
        <section className="rail-card">
          <p className="eyebrow">Social Kit</p>
          <h2>X</h2>
          <p>{story.social.x}</p>
          <h2>Instagram</h2>
          <p>{story.social.instagram}</p>
          <h2>Video</h2>
          <p>{story.social.video}</p>
        </section>
      </aside>
    </main>
  );
}
