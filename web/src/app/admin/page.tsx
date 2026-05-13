import Link from "next/link";
import { BeehiivAdminPanel } from "@/components/BeehiivAdminPanel";
import { SourceToDraftPanel } from "@/components/SourceToDraftPanel";
import {
  buildBeehiivPostTitle,
  buildSocialPack,
  getLaunchIssueSlots,
  getLaunchTasks,
  getSourceItems,
  getSponsorProducts,
  getStories,
} from "@/lib/content";
import { listDrafts } from "@/lib/local-store";
import type { LaunchIssueSlot } from "@/lib/types";

export const metadata = {
  title: "Launch Desk",
};

function statusClass(status: string): string {
  return status.toLowerCase().replaceAll(" ", "-");
}

export default async function AdminPage() {
  const drafts = await listDrafts();
  const stories = getStories();
  const sourceItems = getSourceItems();
  const sponsorProducts = getSponsorProducts();
  const issueSlots = getLaunchIssueSlots();
  const launchTasks = getLaunchTasks();
  const leadStory = stories[0];
  const socialPack = leadStory ? buildSocialPack(leadStory) : [];

  const slotDetails = issueSlots.map((slot: LaunchIssueSlot) => ({
    ...slot,
    story: slot.storyId ? stories.find((story) => story.id === slot.storyId) : undefined,
    source: slot.sourceItemId ? sourceItems.find((item) => item.id === slot.sourceItemId) : undefined,
    sponsor: slot.sponsorProductId ? sponsorProducts.find((product) => product.id === slot.sponsorProductId) : undefined,
  }));

  return (
    <main>
      <section className="admin-hero launch-hero">
        <div>
          <p className="eyebrow">Launch Desk</p>
          <h1>Run the first East Meets Nash issue from one very nosy command center.</h1>
          <p>
            Assemble the morning brief, convert source leads into drafts, prep social cuts, watch beehiiv, and keep the
            sponsor shelf warm until checkout is wired.
          </p>
        </div>
        <div className="launch-kpis" aria-label="Launch metrics">
          <div>
            <span>{stories.length}</span>
            <strong>seed stories</strong>
          </div>
          <div>
            <span>{sourceItems.length}</span>
            <strong>source leads</strong>
          </div>
          <div>
            <span>{drafts.length}</span>
            <strong>local drafts</strong>
          </div>
          <div>
            <span>{sponsorProducts.length}</span>
            <strong>ad products</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-grid launch-shortcuts" aria-label="Desk shortcuts">
        <Link className="dashboard-card" href="/admin/sources">
          <span>Source Desk</span>
          <strong>Rank leads and assign reporters</strong>
        </Link>
        <Link className="dashboard-card" href="/admin/issues">
          <span>Issue Builder</span>
          <strong>Generate beehiiv export copy</strong>
        </Link>
        <a className="dashboard-card" href="/api/beehiiv/export">
          <span>beehiiv Export</span>
          <strong>Open plain-text issue package</strong>
        </a>
        <a className="dashboard-card" href="/api/beehiiv/status">
          <span>beehiiv Status</span>
          <strong>Check publication/API configuration</strong>
        </a>
        <a className="dashboard-card" href="/api/atxp/balance">
          <span>Account Balance</span>
          <strong>Check mock/live credit route</strong>
        </a>
      </section>

      <section className="launch-layout">
        <section className="desk-panel launch-board">
          <div className="section-heading">
            <p className="eyebrow">First Issue Builder</p>
            <h2>{buildBeehiivPostTitle()}</h2>
            <p>Six launch slots: one signature story, useful pain, restaurant whisper, watchdog hit, events, sponsor.</p>
          </div>
          <div className="issue-slot-grid">
            {slotDetails.map((slot) => (
              <article key={slot.id} className="issue-slot">
                <div className="story-meta">
                  <span className={`status-chip ${statusClass(slot.status)}`}>{slot.status}</span>
                  {slot.story ? <span>{slot.story.zone}</span> : null}
                  {slot.source ? <span>{slot.source.source}</span> : null}
                </div>
                <h3>{slot.name}</h3>
                <p>{slot.description}</p>
                {slot.story ? (
                  <Link href={`/story/${slot.story.slug}`}>
                    <strong>{slot.story.title}</strong>
                  </Link>
                ) : slot.sponsor ? (
                  <strong>
                    {slot.sponsor.name}: ${slot.sponsor.price.toLocaleString()}
                  </strong>
                ) : (
                  <strong>Waiting on source feed</strong>
                )}
                <small>{slot.note}</small>
              </article>
            ))}
          </div>
          <div className="button-row">
            <Link className="big-link-button" href="/admin/issues">
              Open Issue Builder
            </Link>
            <a className="big-link-button" href="/api/beehiiv/export">
              Open Export
            </a>
          </div>
        </section>

        <aside className="launch-rail">
          <BeehiivAdminPanel />
          <section className="desk-panel">
            <p className="eyebrow">Launch Readiness</p>
            <h2>What is live, next, blocked</h2>
            <div className="task-list">
              {launchTasks.map((task) => (
                <article key={task.id} className="task-item">
                  <span className={`status-chip ${statusClass(task.status)}`}>{task.status}</span>
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.detail}</p>
                    <small>Owner: {task.owner}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section className="launch-layout compact">
        <SourceToDraftPanel items={sourceItems} />

        <section className="desk-panel">
          <p className="eyebrow">Social Pack</p>
          <h2>{leadStory?.title}</h2>
          <p>Launch copy for the top story, ready to paste into the channel scheduler or hand to a video worker.</p>
          <div className="social-pack-list">
            {socialPack.map((item) => (
              <article key={item.channel} className="social-pack-card">
                <span>{item.channel}</span>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="launch-layout compact">
        <section className="desk-panel">
          <p className="eyebrow">Sponsor Shelf</p>
          <h2>Self-serve ads, waiting on checkout</h2>
          <div className="sponsor-shelf">
            {sponsorProducts.map((product) => (
              <article key={product.id} className="sponsor-card">
                <span>${product.price.toLocaleString()}</span>
                <h3>{product.name}</h3>
                <p>{product.checkoutCopy}</p>
                <small>{product.inventory} launch slots available</small>
              </article>
            ))}
          </div>
        </section>

        <div className="desk-panel">
          <p className="eyebrow">Drafts</p>
          <h2>{drafts.length} local drafts</h2>
          {drafts.length ? (
            <ul className="admin-list">
              {drafts.map((draft) => (
                <li key={draft.id}>
                  <Link href={`/admin/drafts/${draft.id}`}>
                    <strong>{draft.title}</strong>
                  </Link>
                  <span>
                    {draft.zone} / {draft.beat} / {draft.confidence}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No local drafts yet. Use the source-to-story buttons to make the first batch.</p>
          )}
        </div>
      </section>
    </main>
  );
}
