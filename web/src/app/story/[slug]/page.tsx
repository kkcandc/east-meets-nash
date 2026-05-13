import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactionPanel } from "@/components/ReactionPanel";
import { ReporterAvatar } from "@/components/ReporterAvatar";
import { SubscribeForm } from "@/components/SubscribeForm";
import { getReporter, getStories, getStoryBySlug } from "@/lib/content";

interface StoryPageProps {
  params: Promise<{ slug: string }>;
}

function featuredImage(story: NonNullable<ReturnType<typeof getStoryBySlug>>) {
  return story.heroImage || `/assets/stories/fallback-${story.imageStyle || "street"}.svg`;
}

function featuredAlt(story: NonNullable<ReturnType<typeof getStoryBySlug>>) {
  return story.heroAlt || `${story.beat} featured image for ${story.title}`;
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
  const featureMedia = story.media?.find((item) => item.imageUrl && item.label === "Comment Signals");
  const imageMedia = story.media?.filter((item) => item.imageUrl && item.label !== "Comment Signals") || [];
  const mapMedia = story.media?.filter((item) => item.embedUrl) || [];
  const linkMedia = story.media?.filter((item) => item.url && !item.imageUrl && !item.embedUrl && item.label !== "Hero Art") || [];
  const socialCuts = [
    { label: "X / Threads", copy: story.social.x },
    { label: "Instagram", copy: story.social.instagram },
    { label: "Video Prompt", copy: story.social.video },
  ];

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
        {featureMedia ? (
          <figure className="article-inline-media article-feature-media">
            {featureMedia.url ? (
              <a href={featureMedia.url}>
                <img src={featureMedia.imageUrl} alt={featureMedia.imageAlt || featureMedia.title} />
              </a>
            ) : (
              <img src={featureMedia.imageUrl} alt={featureMedia.imageAlt || featureMedia.title} />
            )}
            <figcaption>{featureMedia.credit || featureMedia.title}</figcaption>
          </figure>
        ) : null}
        <ReactionPanel reactions={story.reactions} storyId={story.id} />
        <img className="story-art story-image article-hero-image" src={featuredImage(story)} alt={featuredAlt(story)} />
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
        <section className="article-section story-social-section">
          <h2>Social Cuts</h2>
          <div className="story-social-grid">
            {socialCuts.map((cut) => (
              <article key={cut.label}>
                <span>{cut.label}</span>
                <p>{cut.copy}</p>
              </article>
            ))}
          </div>
        </section>
      </article>

      <aside className="article-rail">
        <section className="rail-card capture-rail-card">
          <p className="eyebrow">Get The Brief</p>
          <h2>Like this kind of local trouble?</h2>
          <p>Get the morning brief and unlock comments, saves, and personal feed signals as the account layer opens.</p>
          <SubscribeForm
            surface={`story_${story.id}`}
            label="Email"
            buttonLabel="Join free"
            placeholder="neighbor@example.com"
          />
        </section>
        {story.factBox?.length ? (
          <section className="rail-card rail-facts-card">
            <p className="eyebrow">Need To Know</p>
            <ul className="rail-fact-list">
              {story.factBox.slice(0, 3).map((fact) => (
                <li key={`${fact.label}-${fact.value}`}>
                  <strong>{fact.label}</strong>
                  <span>{fact.value}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        <section className="rail-card reporter-bio">
          <p className="eyebrow">Reported By</p>
          <Link className="reporter-profile-link" href={`/reporters/${reporter.id}`}>
            <ReporterAvatar reporter={reporter} />
            <h2>{reporter.name}</h2>
            <p>{reporter.tagline}</p>
            <small>{reporter.beat}</small>
            <span className="story-read-link">Read Profile</span>
          </Link>
        </section>
        <section className="rail-card">
          <p className="eyebrow">Local Sponsors</p>
          <h2>Want the neighborhood to notice?</h2>
          <p>Self-serve placements start at $100.</p>
          <Link className="big-link-button" href="/commerce">
            Buy Placement
          </Link>
        </section>
        <section className="rail-card story-actions-card">
          <p className="eyebrow">Add Receipts</p>
          <h2>Know the part everyone is missing?</h2>
          <p>Send the tip, photo, link, or overheard-detail-with-context.</p>
          <Link className="big-link-button" href="/tips">
            Send A Tip
          </Link>
        </section>
      </aside>
    </main>
  );
}
