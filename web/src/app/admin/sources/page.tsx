import { SourceToDraftPanel } from "@/components/SourceToDraftPanel";
import { getDailySourcePass, getReporter, getSourceAccessPlans, getSourceCatalog, getSourceItems } from "@/lib/content";

export const metadata = {
  title: "Source Desk",
};

export default function SourceDeskPage() {
  const items = getSourceItems();
  const accessPlans = getSourceAccessPlans();
  const sourceCatalog = getSourceCatalog();
  const dailyPass = getDailySourcePass();
  const readyAccess = accessPlans.filter((plan) => plan.status.toLowerCase().includes("ready")).length;
  const supervisedAccess = accessPlans.filter((plan) => plan.status.toLowerCase().includes("supervised")).length;

  return (
    <main>
      <section className="desk-hero">
        <div>
          <p className="eyebrow">Source Desk</p>
          <h1>Master the source engine before the group chat gets a vote.</h1>
          <p>
            Public sources get automated first. Facebook and Nextdoor become supervised source capture with confidence
            labels, audit notes, and no mystery scraping.
          </p>
        </div>
        <div className="desk-metrics">
          <article>
            <span>{accessPlans.length}</span>
            <strong>Access lanes</strong>
          </article>
          <article>
            <span>{readyAccess}</span>
            <strong>Ready now</strong>
          </article>
          <article>
            <span>{supervisedAccess}</span>
            <strong>Supervised</strong>
          </article>
          <article>
            <span>{sourceCatalog.length}</span>
            <strong>Source streams</strong>
          </article>
        </div>
      </section>
      <section className="page-band">
        <div className="section-heading">
          <p className="eyebrow">{dailyPass.date}</p>
          <h2>{dailyPass.title}</h2>
          <p>{dailyPass.summary}</p>
        </div>
        <div className="daily-pass-grid">
          {dailyPass.stages.map((stage) => (
            <article key={stage.name} className="daily-pass-card">
              <span>{stage.time}</span>
              <h3>{stage.name}</h3>
              <p>{stage.goal}</p>
              <small>{stage.output}</small>
              <div className="mini-list">
                {stage.sourceIds.map((sourceId) => {
                  const source = items.find((item) => item.id === sourceId);
                  return source ? <span key={sourceId}>{source.title}</span> : null;
                })}
              </div>
            </article>
          ))}
        </div>
        <div className="publish-queue">
          {dailyPass.publishQueue.map((queueItem) => {
            const source = items.find((item) => item.id === queueItem.sourceId);
            return (
              <article key={`${queueItem.sourceId}-${queueItem.slot}`}>
                <div className="story-meta">
                  <span className="pill hot">{queueItem.slot}</span>
                  {source ? <span>{source.risk} risk</span> : null}
                </div>
                <h3>{source?.title || queueItem.sourceId}</h3>
                <p>{queueItem.decision}</p>
                <small>{queueItem.why}</small>
              </article>
            );
          })}
        </div>
        <div className="access-lane-list">
          {dailyPass.accessNeeds.map((need) => (
            <article key={need.name}>
              <strong>{need.name}</strong>
              <span>{need.status}</span>
              <p>{need.today}</p>
              <small>{need.guardrail}</small>
            </article>
          ))}
        </div>
      </section>
      <section className="page-band">
        <div className="section-heading">
          <p className="eyebrow">Access Strategy</p>
          <h2>What we can automate, what needs permission, and what stays supervised</h2>
        </div>
        <div className="source-access-grid">
          {accessPlans.map((plan) => (
            <article key={plan.id} className="source-access-card">
              <div className="story-meta">
                <span className="pill hot">{plan.priority}</span>
                <span>{plan.status}</span>
                <span>{plan.risk} risk</span>
              </div>
              <h3>{plan.name}</h3>
              <p>{plan.currentReality}</p>
              <dl>
                <div>
                  <dt>Access</dt>
                  <dd>{plan.accessMode}</dd>
                </div>
                <div>
                  <dt>Ready</dt>
                  <dd>{plan.automationReadiness}</dd>
                </div>
                <div>
                  <dt>Label</dt>
                  <dd>{plan.sourceLabel}</dd>
                </div>
                <div>
                  <dt>Workflow</dt>
                  <dd>{plan.firstWorkflow}</dd>
                </div>
              </dl>
              <div className="mini-list">
                {plan.whatWeCanDoNow.slice(0, 3).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="page-band">
        <div className="section-heading">
          <p className="eyebrow">Monitored Streams</p>
          <h2>The daily source map</h2>
        </div>
        <div className="source-catalog-grid">
          {sourceCatalog.map((source) => (
            <article key={source.id} className="source-tier-card">
              <div className="story-meta">
                <span className="pill hot">{source.tier}</span>
                <span>{source.status}</span>
                <span>{source.cadence}</span>
              </div>
              <h3>{source.name}</h3>
              <p>{source.publishUse}</p>
              <dl>
                <div>
                  <dt>Automation</dt>
                  <dd>{source.automation}</dd>
                </div>
                <div>
                  <dt>Next</dt>
                  <dd>{source.nextStep}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
      <section className="page-band">
        <SourceToDraftPanel items={items} />
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
                    {item.cadence ? (
                      <div>
                        <dt>Cadence</dt>
                        <dd>{item.cadence}</dd>
                      </div>
                    ) : null}
                    {item.automation ? (
                      <div>
                        <dt>Collection</dt>
                        <dd>{item.automation}</dd>
                      </div>
                    ) : null}
                    {item.verificationRule ? (
                      <div>
                        <dt>Verify</dt>
                        <dd>{item.verificationRule}</dd>
                      </div>
                    ) : null}
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
