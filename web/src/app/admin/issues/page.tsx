import { BeehiivAdminPanel } from "@/components/BeehiivAdminPanel";
import { buildBeehiivExport, getReporter, getStories } from "@/lib/content";

export const metadata = {
  title: "Issue Builder",
};

export default function IssueBuilderPage() {
  const stories = getStories().slice(0, 5);
  const exportText = buildBeehiivExport(5);

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
        <BeehiivAdminPanel />
      </section>
    </main>
  );
}
