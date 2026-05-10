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
  const paragraphs = story.body.split("\n\n");
  const imageMedia = story.media?.filter((item) => item.imageUrl) || [];
  const mapMedia = story.media?.filter((item) => item.embedUrl) || [];
  const linkMedia = story.media?.filter((item) => item.url && !item.imageUrl && !item.embedUrl && item.label !== "Hero Art") || [];

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
        <ReactionPanel reactions={story.reactions} storyId={story.id} />
        {story.heroImage ? (
          <img className="story-art story-image article-hero-image" src={story.heroImage} alt={story.heroAlt || ""} />
        ) : (
          <div className={`story-art art-${story.imageStyle}`} />
        )}
        <div className="article-body">
          {paragraphs.map((paragraph, index) => (
            <div className="article-flow-block" key={paragraph}>
              <p>{paragraph}</p>
              {index === 0
                ? imageMedia.map((item) => (
                    <figure className="article-inline-media" key={`${item.label}-${item.title}`}>
                      {item.url ? (
                        <a href={item.url}>
                          <img src={item.imageUrl} alt={item.imageAlt || item.title} loading="lazy" />
                        </a>
                      ) : (
                        <img src={item.imageUrl} alt={item.imageAlt || item.title} loading="lazy" />
                      )}
                      <figcaption>
                        {item.credit || item.title}
                      </figcaption>
                    </figure>
                  ))
                : null}
              {index === 1 && mapMedia.length ? (
                mapMedia.map((item) => (
                  <figure className="article-inline-map" key={`${item.label}-${item.title}`}>
                    <iframe
                      title={item.title}
                      src={item.embedUrl}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <figcaption>
                      <strong>{item.title}</strong>
                      {item.url ? <a href={item.url}>Open in Google Maps</a> : null}
                    </figcaption>
                  </figure>
                ))
              ) : null}
              {index === 1 && linkMedia.length ? (
                <aside className="article-inline-links" aria-label="Related source and location links">
                  {linkMedia.map((item) => (
                    <a className="article-inline-link" href={item.url} key={`${item.label}-${item.title}`}>
                      <span>{item.label}</span>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </a>
                  ))}
                </aside>
              ) : null}
            </div>
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
          <p className="eyebrow">Reported By</p>
          <h2>{reporter.name}</h2>
          <p>{reporter.tagline}</p>
          <small>{reporter.beat}</small>
        </section>
      </aside>
    </main>
  );
}
