import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getReporterById, getReporters, getStoriesByReporter } from "@/lib/content";

interface ReporterPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return getReporters().map((reporter) => ({ id: reporter.id }));
}

export async function generateMetadata({ params }: ReporterPageProps): Promise<Metadata> {
  const { id } = await params;
  const reporter = getReporterById(id);
  if (!reporter) return {};

  return {
    title: `${reporter.name} | East Meets Nash`,
    description: reporter.bio,
  };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export default async function ReporterPage({ params }: ReporterPageProps) {
  const { id } = await params;
  const reporter = getReporterById(id);
  if (!reporter) notFound();

  const stories = getStoriesByReporter(reporter.id);

  return (
    <main className="reporter-profile-shell">
      <section className="reporter-hero">
        <div className="reporter-avatar-large" style={{ backgroundColor: reporter.color }}>
          {initials(reporter.name)}
        </div>
        <div className="reporter-identity">
          <p className="eyebrow">Reported By</p>
          <h1>{reporter.name}</h1>
          <p className="reporter-deck">{reporter.tagline}</p>
          <div className="story-meta">
            <span className="pill hot">{reporter.signatureColumn}</span>
            <span>{reporter.beat}</span>
            <span>{reporter.homeBase}</span>
          </div>
        </div>
      </section>

      <section className="reporter-profile-layout">
        <div className="reporter-profile-main">
          <section className="reporter-profile-panel">
            <p className="eyebrow">Profile</p>
            <h2>Who This Is</h2>
            <p>{reporter.bio}</p>
            <p>{reporter.backstory}</p>
          </section>

          <section className="reporter-profile-panel">
            <p className="eyebrow">Reporting Lens</p>
            <h2>How They Cover East Nashville</h2>
            <p>{reporter.defaultAngle}</p>
            <div className="reporter-detail-grid">
              <div>
                <span>Known For</span>
                <strong>{reporter.knownFor}</strong>
              </div>
              <div>
                <span>Favorite Complaint</span>
                <strong>{reporter.favoriteComplaint}</strong>
              </div>
            </div>
          </section>

          <section className="reporter-profile-panel">
            <p className="eyebrow">Recent Reporting</p>
            <h2>Stories</h2>
            <div className="reporter-story-list">
              {stories.length ? (
                stories.map((story) => (
                  <Link className="reporter-story-card" href={`/story/${story.slug}`} key={story.id}>
                    <span>
                      {story.label} / {story.zone}
                    </span>
                    <strong>{story.title}</strong>
                    <small>{story.deck}</small>
                  </Link>
                ))
              ) : (
                <p className="muted-copy">No stories from this reporter are live yet.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="reporter-profile-sidebar">
          <section className="reporter-profile-panel">
            <p className="eyebrow">Source Diet</p>
            <ul className="reporter-note-list">
              {reporter.sourceDiet.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </section>

          <section className="reporter-profile-panel">
            <p className="eyebrow">Obsessions</p>
            <div className="reporter-pill-list">
              {reporter.obsessions.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>

          <section className="reporter-profile-panel">
            <p className="eyebrow">Rules Of The Bit</p>
            <ul className="reporter-note-list">
              {reporter.coverageNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>

          <section className="reporter-profile-panel reporter-tip-panel">
            <p className="eyebrow">Tip This Reporter</p>
            <h2>Got Something?</h2>
            <p>{reporter.contactPrompt}</p>
            <Link className="big-link-button" href="/tips">
              Send A Tip
            </Link>
          </section>
        </aside>
      </section>
    </main>
  );
}
