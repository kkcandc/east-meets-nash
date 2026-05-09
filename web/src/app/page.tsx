import Link from "next/link";
import { ReporterBadge } from "@/components/ReporterBadge";
import { SubscribeForm } from "@/components/SubscribeForm";
import { StoryCard } from "@/components/StoryCard";
import { getReporters, getStories } from "@/lib/content";

export default function HomePage() {
  const stories = getStories();
  const [lead, ...rest] = stories;
  const reporters = getReporters();

  return (
    <main>
      <section className="front-layout home-front">
        <div>
          <div className="section-heading front-page-heading">
            <p className="eyebrow">Latest East Nashville</p>
            <h1>What East Nashville Is Talking About</h1>
            <p>Openings, traffic pain, permits, neighborhood drama, and anything else with local fingerprints on it.</p>
          </div>
          {lead ? <StoryCard story={lead} lead /> : null}
          <div className="story-grid">
            {rest.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
        <aside className="side-rail">
          <section className="brief-panel">
            <p className="eyebrow">Morning Brief</p>
            <h2>Five Things Before The Coffee Gets Weird</h2>
            <ol>
              {stories.slice(0, 5).map((story) => (
                <li key={story.id}>{story.title}</li>
              ))}
            </ol>
            <Link className="big-link-button" href="/admin/issues">
              Build Issue
            </Link>
            <SubscribeForm surface="homepage_brief" />
          </section>
          <section className="desk-panel">
            <p className="eyebrow">Bureau</p>
            <h2>The Reporters</h2>
            <div className="reporter-list">
              {reporters.map((reporter) => (
                <ReporterBadge key={reporter.id} reporter={reporter} />
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
