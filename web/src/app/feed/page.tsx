import { StoryCard } from "@/components/StoryCard";
import { getBeats, getStories, getZones } from "@/lib/content";

export const metadata = {
  title: "Feed",
};

export default function FeedPage() {
  const stories = getStories();

  return (
    <main>
      <section className="feed-hero">
        <div>
          <p className="eyebrow">ATXP Account Preview</p>
          <h1>Your East Nashville, sorted by what you actually care about.</h1>
          <p>
            This production route is ready for ATXP-backed preferences. Until auth is connected, it renders a tuned
            editorial feed from seed data.
          </p>
        </div>
        <aside className="feed-account">
          <span>Mock balance</span>
          <strong>$18.40</strong>
          <small>Credits eventually power classifieds, sponsor spots, vouchers, tickets, and merch.</small>
        </aside>
      </section>
      <section className="feed-layout">
        <aside className="desk-panel">
          <p className="eyebrow">Preferences</p>
          <h2>Ready To Persist</h2>
          <h3>Zones</h3>
          <p>{getZones().join(", ")}</p>
          <h3>Beats</h3>
          <p>{getBeats().join(", ")}</p>
        </aside>
        <section>
          <div className="story-grid one-column">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
