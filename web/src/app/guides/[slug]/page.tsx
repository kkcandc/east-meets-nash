import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvergreenGuideBySlug, getEvergreenGuides, getReporter, getStoryBySlug } from "@/lib/content";
import { getAbsoluteUrl } from "@/lib/site";
import type { Story } from "@/lib/types";

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getEvergreenGuides().map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getEvergreenGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.deck,
    keywords: guide.seoKeywords,
    alternates: {
      canonical: `/guides/${guide.slug}`,
    },
    openGraph: {
      title: guide.title,
      description: guide.deck,
      type: "article",
      url: `/guides/${guide.slug}`,
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getEvergreenGuideBySlug(slug);
  if (!guide) notFound();
  const reporter = getReporter(guide.reporterId);
  const relatedStories = guide.relatedStorySlugs
    .map((storySlug: string) => getStoryBySlug(storySlug))
    .filter((story): story is Story => Boolean(story));

  const guideUrl = getAbsoluteUrl(`/guides/${guide.slug}`);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: guide.title,
      description: guide.deck,
      url: guideUrl,
      dateModified: guide.updated,
      itemListElement: guide.picks.map((pick, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: pick.name,
        description: pick.why,
        url: pick.sourceUrl,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "East Meets Nash",
          item: getAbsoluteUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Guides",
          item: getAbsoluteUrl("/guides"),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: guide.title,
          item: guideUrl,
        },
      ],
    },
  ];

  return (
    <main className="guide-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c") }}
      />
      <article className="guide-main">
        <div className="story-meta">
          <span className="pill hot">{guide.heroLabel}</span>
          <span>{guide.zone}</span>
          <span>{guide.beat}</span>
          <span>Updated {guide.updated}</span>
        </div>
        <h1>{guide.title}</h1>
        <p className="article-deck">{guide.deck}</p>
        <section className="guide-summary">
          <h2>The Useful Answer</h2>
          <p>{guide.summary}</p>
        </section>

        <section className="guide-picks">
          <h2>Start Here</h2>
          {guide.picks.map((pick, index) => (
            <article key={pick.name} className="guide-pick">
              <div className="pick-number">{index + 1}</div>
              <div>
                <p className="eyebrow">{pick.category}</p>
                <h3>{pick.name}</h3>
                <p>{pick.why}</p>
                <dl>
                  <div>
                    <dt>Best for</dt>
                    <dd>{pick.bestFor}</dd>
                  </div>
                  {pick.kidNote ? (
                    <div>
                      <dt>Kid note</dt>
                      <dd>{pick.kidNote}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Verify next</dt>
                    <dd>{pick.verify}</dd>
                  </div>
                </dl>
                <a href={pick.sourceUrl}>{pick.sourceName}</a>
              </div>
            </article>
          ))}
        </section>

        <section className="article-section">
          <h2>How We Keep This Fresh</h2>
          {guide.sections.map((section) => (
            <div key={section.heading} className="guide-rule">
              <h3>{section.heading}</h3>
              <p>{section.body}</p>
            </div>
          ))}
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
          <p className="eyebrow">Search Intent</p>
          <p>{guide.searchIntent}</p>
        </section>
        <section className="rail-card">
          <p className="eyebrow">Sources</p>
          <ul className="source-list">
            {guide.sources.map((source) => (
              <li key={`${source.name}-${source.url}`}>
                <a href={source.url}>{source.name}</a>
                <span>{source.type}</span>
              </li>
            ))}
          </ul>
        </section>
        {relatedStories.length ? (
          <section className="rail-card">
            <p className="eyebrow">Related News</p>
            {relatedStories.map((story) => (
              <Link key={story.id} className="rail-link" href={`/story/${story.slug}`}>
                {story.title}
              </Link>
            ))}
          </section>
        ) : null}
      </aside>
    </main>
  );
}
