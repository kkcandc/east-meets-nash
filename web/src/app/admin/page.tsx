import Link from "next/link";
import { listDrafts } from "@/lib/local-store";

export const metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const drafts = await listDrafts();

  return (
    <main>
      <section className="admin-hero">
        <p className="eyebrow">Local CMS</p>
        <h1>Draft room, source queue, and issue builder.</h1>
        <p>Until Postgres is connected, drafts are stored in `web/.local-data/` through local API routes.</p>
      </section>
      <section className="dashboard-grid">
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
          <span>ATXP Placeholder</span>
          <strong>Check mock/live balance route</strong>
        </a>
      </section>
      <section className="page-band">
        <div className="desk-panel">
          <p className="eyebrow">Drafts</p>
          <h2>{drafts.length} local drafts</h2>
          {drafts.length ? (
            <ul className="admin-list">
              {drafts.map((draft) => (
                <li key={draft.id}>
                  <strong>{draft.title}</strong>
                  <span>
                    {draft.zone} / {draft.beat} / {draft.confidence}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No local drafts yet. POST to `/api/admin/drafts` or connect the production CMS form.</p>
          )}
        </div>
      </section>
    </main>
  );
}
