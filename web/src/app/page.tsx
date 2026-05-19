import Link from "next/link";
import { SubscribeForm } from "@/components/SubscribeForm";
import { StoryCard } from "@/components/StoryCard";
import { getStories } from "@/lib/content";

export default function HomePage() {
  const stories = getStories();
  const packageIds = [
    "may-19-source-pass-east-nashville",
    "facebook-new-posts-notebook-may-19-2026",
    "nashville-super-bowl-east-bank-2030-may-19-2026",
    "metro-council-gallatin-shelby-nes-may-19-2026",
    "nes-tree-trimming-moratorium-watch-may-19-2026",
    "east-nashville-farmers-market-rain-check-may-19-2026",
    "may-15-source-pass-east-nashville",
    "hawkers-main-street-reopens-may-15-2026",
    "eastside-rockin-rumble-may-15-2026",
    "party-fowl-five-points-opening",
    "gallatin-main-safety-project",
    "east-trinity-gallatin-pedestrian-death",
  ];
  const packageStories = packageIds
    .map((id) => stories.find((story) => story.id === id))
    .filter((story): story is (typeof stories)[number] => Boolean(story));
  const fallbackStories = stories.filter((story) => !packageStories.includes(story));
  const topStories = [...packageStories, ...fallbackStories].slice(0, 3);
  const topStoryIds = new Set(topStories.map((story) => story.id));
  const moreStories = stories.filter((story) => !topStoryIds.has(story.id));
  const lead = topStories[0];

  return (
    <main>
      <section className="front-layout home-front">
        <div>
          <div className="section-heading front-page-heading">
            <p className="eyebrow">East Nashville Today</p>
            <h1>The News Before The Group Chat Gets To It</h1>
            <p>Restaurants, roads, civic mess, weekend plans, and the neighborhood details worth forwarding.</p>
          </div>
          <section className="front-package" aria-label="Top stories">
            {lead ? <StoryCard story={lead} lead showZone={false} /> : null}
            <div className="package-stack">
              {topStories.slice(1).map((story) => (
                <StoryCard key={story.id} story={story} variant="package" showZone={false} />
              ))}
            </div>
          </section>
          <section className="capture-panel front-capture">
            <div>
              <p className="eyebrow">Get Tomorrow&apos;s Brief</p>
              <h2>The useful stuff, the weird stuff, and what people are mad about.</h2>
              <p>One very East Nashville email. Free, fast, and only a little too interested in permits.</p>
            </div>
            <SubscribeForm
              surface="homepage_inline_capture"
              label="Your email"
              buttonLabel="Send me the brief"
              placeholder="neighbor@example.com"
            />
          </section>
          <section className="news-river" aria-label="More East Nashville stories">
            <div className="section-heading compact-heading">
              <p className="eyebrow">More From Today</p>
              <h2>Keep Going</h2>
            </div>
            <div className="story-grid">
              {moreStories.map((story) => (
                <StoryCard key={story.id} story={story} showZone={false} />
              ))}
            </div>
          </section>
        </div>
        <aside className="side-rail">
          <section className="brief-panel">
            <p className="eyebrow">Today&apos;s Brief</p>
            <h2>Seven Things Worth Knowing</h2>
            <ol>
              {stories.slice(0, 7).map((story) => (
                <li key={story.id}>
                  <Link href={`/story/${story.slug}`}>{story.title}</Link>
                  <span>
                    {story.zone} / {story.beat}
                  </span>
                </li>
              ))}
            </ol>
            <SubscribeForm surface="homepage_brief" />
            <Link className="big-link-button" href="/feed">
              Create Account
            </Link>
          </section>
          <section className="tip-panel">
            <p className="eyebrow">Tip Line</p>
            <h2>Know Something East Nashville Should Be Nosy About?</h2>
            <p>Send openings, closures, weird signs, permit drama, meeting notes, and gossip with receipts.</p>
            <Link className="big-link-button" href="/tips">
              Send A Tip
            </Link>
          </section>
        </aside>
      </section>
    </main>
  );
}
