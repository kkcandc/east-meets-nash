import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReactionPanel } from "@/components/ReactionPanel";
import { SubscribeForm } from "@/components/SubscribeForm";
import { getReporter, getStories, getStoryBySlug } from "@/lib/content";

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
        {story.heroImage ? (
          <img className="story-art story-image article-hero-image" src={story.heroImage} alt={story.heroAlt || ""} />
        ) : (
          <div className={`story-art art-${story.imageStyle}`} />
        )}
        <div className="article-body">
          {story.body.split("\n\n").map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {story.factBox?.length ? (
          <section className="article-section fact-box">
            <h2>Fast Facts</h2>
            <dl>
              {story.factBox.map((fact) => (
                <div key={`${fact.label}-${fact.value}`}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
        {story.media?.length ? (
          <section className="article-section media-section">
            <h2>Media Package</h2>
            <div className="media-grid">
              {story.media.map((item) => (
                <article key={`${item.label}-${item.title}`} className="media-card">
                  {item.imageUrl ? (
                    <img className="media-image" src={item.imageUrl} alt={item.imageAlt || item.title} loading="lazy" />
                  ) : null}
                  <span>{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  {item.credit ? <small>{item.credit}</small> : null}
                  {item.url ? <a href={item.url}>Open source</a> : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}
        <section className="article-section">
          <h2>Sources</h2>
          <ul>
            {story.sources.map((source) => (
              <li key={`${source.name}-${source.url}`}>
                <a href={source.url}>{source.name}</a> <span>{source.type}</span>
              </li>
            ))}
          </ul>
          {story.sourceNote ? <p className="source-note">{story.sourceNote}</p> : null}
        </section>
      </article>

      <aside className="article-rail">
        <section className="rail-card capture-rail-card">
          <p className="eyebrow">Get The Brief</p>
          <h2>Like this kind of local trouble?</h2>
          <p>Get the morning brief and create an account when personalization opens.</p>
          <SubscribeForm
            surface={`story_${story.id}`}
            label="Email"
            buttonLabel="Join free"
            placeholder="neighbor@example.com"
          />
        </section>
        <section className="rail-card">
          <p className="eyebrow">Filed By</p>
          <h2>{reporter.name}</h2>
          <p>{reporter.tagline}</p>
          <small>{reporter.beat}</small>
        </section>
        <ReactionPanel reactions={story.reactions} storyId={story.id} />
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
