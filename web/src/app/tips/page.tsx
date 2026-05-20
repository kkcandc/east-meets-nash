import Link from "next/link";
import { TipForm } from "@/components/TipForm";

export const metadata = {
  title: "Tips",
};

export default function TipsPage() {
  return (
    <main>
      <section className="topic-hero tips-hero">
        <p className="eyebrow">Tip Line</p>
        <h1>Send the thing East Nashville should not miss.</h1>
        <p>Openings, closures, weird signs, meeting notes, road problems, screenshots, permits, and gossip with receipts.</p>
      </section>
      <section className="tips-layout">
        <article className="desk-panel tips-form-panel">
          <p className="eyebrow">Source Desk</p>
          <h2>Submit A Lead</h2>
          <p>
            Tips become editor drafts first. Anonymous tips are leads, not proof, and anything sensitive gets verified
            before it becomes a story.
          </p>
          <TipForm />
        </article>
        <aside className="side-rail">
          <section className="rail-card">
            <p className="eyebrow">Best Tips</p>
            <h2>Receipts Help</h2>
            <ul className="tip-rule-list">
              <li>Photo, screenshot, flyer, public link, or meeting agenda.</li>
              <li>Exact place, date, and why neighbors should care.</li>
              <li>What is known, what is rumor, and who can confirm it.</li>
            </ul>
          </section>
          <section className="rail-card">
            <p className="eyebrow">Guardrails</p>
            <h2>What We Slow Down</h2>
            <ul className="tip-rule-list">
              <li>Kids, medical details, financial hardship, private addresses, plates, and phone numbers.</li>
              <li>Accusations against private people without records or named confirmation.</li>
              <li>Anything that needs redaction before readers see it.</li>
            </ul>
          </section>
          <section className="rail-card">
            <p className="eyebrow">Browse First</p>
            <h2>Maybe We Already Have It</h2>
            <p>Search the archive before sending a follow-up or correction.</p>
            <Link className="big-link-button" href="/search">
              Search Stories
            </Link>
          </section>
        </aside>
      </section>
    </main>
  );
}
