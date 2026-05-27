import type { Metadata } from "next";
import Link from "next/link";
import { getEvergreenGuides, getReporter } from "@/lib/content";

export const metadata: Metadata = {
  title: "East Nashville Guides",
  description:
    "Evergreen East Nashville guides for restaurants, parks, playgrounds, family plans, patios, and practical neighborhood decisions.",
  alternates: {
    canonical: "/guides",
  },
};

export default function GuidesPage() {
  const guides = getEvergreenGuides();

  return (
    <main>
      <section className="guide-hero">
        <div>
          <p className="eyebrow">Evergreen Guides</p>
          <h1>The East Nashville Answers People Actually Search For</h1>
          <p>
            Daily news catches what happened today. These living guides capture the durable searches: where to eat, where
            to take kids, what to do this weekend, and which local decision needs a resident-tested answer.
          </p>
        </div>
      </section>

      <section className="guide-index">
        {guides.map((guide) => {
          const reporter = getReporter(guide.reporterId);
          return (
            <Link key={guide.id} className="guide-card" href={`/guides/${guide.slug}`}>
              <div>
                <p className="eyebrow">{guide.heroLabel}</p>
                <h2>{guide.title}</h2>
                <p>{guide.deck}</p>
              </div>
              <div className="guide-card-meta">
                <span>{guide.beat}</span>
                <span>{guide.zone}</span>
                <span>Filed by {reporter.name}</span>
                <span>Updated {guide.updated}</span>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
