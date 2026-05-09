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
      <section className="masthead">
        <div>
          <p className="eyebrow">Prototype To Production</p>
          <h1>East Nashville, everything you wanted to know, nothing held back.</h1>
          <p>
            Restaurants, rumors, permits, traffic pain, weekend chaos, and the group-text-level detail that makes a
            neighborhood feel like a neighborhood.
          </p>
        </div>
        <div className="seal-stage">Patios, Permits, Traffic, Gossip</div>
      </section>

      <section className="front-layout">
        <div>
          <div className="section-heading">
            <p className="eyebrow">The River Feed</p>
            <h2>What East Nashville Is Talking About</h2>
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
