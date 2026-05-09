import Link from "next/link";
import { getBeats, getStoriesForTopic, getZones } from "@/lib/content";

export const metadata = {
  title: "Topics",
};

function TopicCard({ kind, value }: { kind: "zone" | "beat"; value: string }) {
  const count = getStoriesForTopic(kind, value).length;
  return (
    <article className="topic-card">
      <span>{count} stories</span>
      <h2>{value}</h2>
      <p>Browse East Nashville coverage by {kind === "zone" ? "neighborhood zone" : "editorial beat"}.</p>
      <Link href={`/topics/${kind}/${encodeURIComponent(value)}`}>Open topic</Link>
    </article>
  );
}

export default function TopicsPage() {
  return (
    <main>
      <section className="topic-hero">
        <p className="eyebrow">Browse</p>
        <h1>Every beat, zone, and recurring local obsession.</h1>
      </section>
      <section className="topic-layout">
        <div className="desk-panel">
          <p className="eyebrow">Zones</p>
          <div className="topic-grid">
            {getZones().map((zone) => (
              <TopicCard key={zone} kind="zone" value={zone} />
            ))}
          </div>
        </div>
        <aside className="desk-panel">
          <p className="eyebrow">Beats</p>
          <div className="topic-grid single">
            {getBeats().map((beat) => (
              <TopicCard key={beat} kind="beat" value={beat} />
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
