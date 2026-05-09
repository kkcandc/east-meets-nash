import { getReporter, getSourceItems } from "@/lib/content";

export const metadata = {
  title: "Source Desk",
};

export default function SourceDeskPage() {
  const items = getSourceItems();

  return (
    <main>
      <section className="desk-hero">
        <div>
          <p className="eyebrow">Source Desk</p>
          <h1>Rank the neighborhood noise before it becomes copy.</h1>
          <p>Every lead gets locality, confidence, risk, suggested reporter, and next format.</p>
        </div>
      </section>
      <section className="page-band">
        <div className="source-list">
          {items.map((item) => {
            const reporter = getReporter(item.suggestedReporter);
            return (
              <article key={item.id} className="source-card">
                <span className="source-score">{item.score}</span>
                <div>
                  <div className="story-meta">
                    <span className="pill hot">{item.suggestedLabel}</span>
                    <span>{item.zone}</span>
                    <span>{item.beat}</span>
                    <span>{item.risk} risk</span>
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.suggestedAngle}</p>
                  <dl>
                    <div>
                      <dt>Source</dt>
                      <dd>
                        <a href={item.url}>{item.source}</a>
                      </dd>
                    </div>
                    <div>
                      <dt>Reporter</dt>
                      <dd>{reporter.name}</dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{item.status}</dd>
                    </div>
                    <div>
                      <dt>Format</dt>
                      <dd>{item.publishFormat}</dd>
                    </div>
                  </dl>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
