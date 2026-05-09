import { BeehiivAdminPanel } from "@/components/BeehiivAdminPanel";
import {
  buildBeehiivExport,
  buildSocialPack,
  getLaunchIssueSlots,
  getReporter,
  getSponsorProducts,
  getStories,
} from "@/lib/content";

export const metadata = {
  title: "Issue Builder",
};

function statusClass(status: string): string {
  return status.toLowerCase().replaceAll(" ", "-");
}

export default function IssueBuilderPage() {
  const stories = getStories().slice(0, 5);
  const exportText = buildBeehiivExport(5);
  const slots = getLaunchIssueSlots();
  const sponsors = getSponsorProducts();
  const socialPack = stories[0] ? buildSocialPack(stories[0]) : [];

  return (
    <main>
      <section className="issue-hero">
        <div>
          <p className="eyebrow">beehiiv + Web</p>
          <h1>Build the morning brief before the first patio opinion lands.</h1>
          <p>This route renders the issue package server-side and exposes the same content at `/api/beehiiv/export`.</p>
        </div>
      </section>
      <section className="issue-layout">
        <div className="desk-panel">
          <p className="eyebrow">Launch Lineup</p>
          <h2>Issue slots</h2>
          <div className="issue-slot-grid">
            {slots.map((slot) => {
              const sponsor = slot.sponsorProductId
                ? sponsors.find((product) => product.id === slot.sponsorProductId)
                : undefined;
              return (
                <article key={slot.id} className="issue-slot">
                  <span className={`status-chip ${statusClass(slot.status)}`}>{slot.status}</span>
                  <h3>{slot.name}</h3>
                  <p>{slot.description}</p>
                  <small>{sponsor ? `${sponsor.name}: $${sponsor.price.toLocaleString()}` : slot.note}</small>
                </article>
              );
            })}
          </div>
        </div>
        <div className="desk-panel">
          <p className="eyebrow">Preview</p>
          <h2>Five Things Before The Coffee Gets Weird</h2>
          <div className="issue-preview">
            {stories.map((story, index) => (
              <article key={story.id} className="issue-item">
                <span>{index + 1}</span>
                <div>
                  <h3>{story.title}</h3>
                  <p>{story.deck}</p>
                  <small>
                    {story.label} / {story.zone} / {getReporter(story.reporterId).name}
                  </small>
                </div>
              </article>
            ))}
          </div>
        </div>
        <aside className="desk-panel">
          <p className="eyebrow">Copy</p>
          <h2>beehiiv Export</h2>
          <pre className="copy-box">{exportText}</pre>
        </aside>
        <section className="desk-panel">
          <p className="eyebrow">Distribution</p>
          <h2>Top story social cuts</h2>
          <div className="social-pack-list">
            {socialPack.map((item) => (
              <article key={item.channel} className="social-pack-card">
                <span>{item.channel}</span>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>
        <BeehiivAdminPanel />
      </section>
    </main>
  );
}
