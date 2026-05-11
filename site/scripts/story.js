import { bindAccountButtons, bindSignupForms, isLoggedIn, setLoggedIn, updateAccountButtons } from "./session.js";

const articleMain = document.querySelector("#articleMain");
const articleRail = document.querySelector("#articleRail");
const storyReactionKey = "east-meets-nash:story-reactions";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function byId(items, id) {
  return new Map(items.map((item) => [item.id, item])).get(id);
}

function reactionLabel(name) {
  if (name === "Love") return "❤️";
  if (name === "Side-Eye") return "👀";
  return name;
}

function readReactionStore() {
  try {
    return JSON.parse(localStorage.getItem(storyReactionKey) || "{}");
  } catch {
    return {};
  }
}

function selectedReaction(storyId) {
  return readReactionStore()[storyId] || null;
}

function saveReaction(storyId, reaction) {
  const reactions = readReactionStore();
  reactions[storyId] = reaction;
  localStorage.setItem(storyReactionKey, JSON.stringify(reactions));
}

function reactionStatus(story) {
  if (!isLoggedIn()) return "";
  if (selectedReaction(story.id)) return "";
  return "";
}

function reactionAuthPrompt() {
  return `
    <span>Log in or sign up to count your reaction.</span>
    <button class="reaction-auth-button" type="button" id="reactionInlineLoginButton">Log in</button>
    <a class="reaction-auth-link" href="/feed.html">Sign up</a>
  `;
}

function bindReactionAuthPrompt(story, reporter) {
  document.querySelector("#reactionInlineLoginButton")?.addEventListener("click", () => {
    setLoggedIn(true);
    renderStory(story, reporter);
  });
}

function reactionButtons(story) {
  const selected = selectedReaction(story.id);
  return Object.entries(story.reactions || {})
    .map(([name, count]) => {
      const isSelected = selected === name;
      const selectedClass = isSelected ? " selected" : "";
      const displayCount = Number(count) + (isSelected ? 1 : 0);
      return `<button class="reaction-button${selectedClass}" type="button" aria-pressed="${isSelected}" data-story="${escapeHtml(story.id)}" data-reaction="${escapeHtml(name)}">${escapeHtml(reactionLabel(name))} <strong>${displayCount}</strong></button>`;
    })
    .join("");
}

function sourceList(story) {
  return (story.sources || [])
    .map(
      (source) =>
        `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.name)}</a><span>${escapeHtml(source.type)}</span></li>`,
    )
    .join("");
}

function commentList(story) {
  return (story.comments || [])
    .map(
      (comment) =>
        `<li><strong>${escapeHtml(comment.author)}</strong><p>${escapeHtml(comment.text)}</p></li>`,
    )
    .join("");
}

function imageMedia(story) {
  return (story.media || []).filter((item) => item.imageUrl);
}

function mapMedia(story) {
  return (story.media || []).filter((item) => item.embedUrl);
}

function linkMedia(story) {
  return (story.media || []).filter((item) => item.url && !item.imageUrl && !item.embedUrl && item.label !== "Hero Art");
}

function inlineMediaFigures(story) {
  return imageMedia(story)
    .map(
      (item) => {
        const caption = item.credit || item.title;
        return `
          <figure class="article-inline-media">
            ${item.url ? `<a href="${escapeHtml(item.url)}">` : ""}
              <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.imageAlt || item.title)}" loading="lazy" />
            ${item.url ? "</a>" : ""}
            ${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}
          </figure>
        `;
      },
    )
    .join("");
}

function inlineMapEmbeds(story) {
  return mapMedia(story)
    .map(
      (item) => `
        <figure class="article-inline-map">
          <iframe
            title="${escapeHtml(item.title)}"
            src="${escapeHtml(item.embedUrl)}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
          <figcaption>
            <strong>${escapeHtml(item.title)}</strong>
            ${item.url ? `<a href="${escapeHtml(item.url)}">Open in Google Maps</a>` : ""}
          </figcaption>
        </figure>
      `,
    )
    .join("");
}

function inlineMediaLinks(story) {
  const links = linkMedia(story);
  if (!links.length) return "";
  return `
    <aside class="article-inline-links" aria-label="Related source and location links">
      ${links
        .map(
          (item) => `
            <a class="article-inline-link" href="${escapeHtml(item.url)}">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.title)}</strong>
              <small>${escapeHtml(item.description)}</small>
            </a>
          `,
        )
        .join("")}
    </aside>
  `;
}

function articleParagraphs(story) {
  const paragraphs = String(story.body || "").split("\n\n");
  return paragraphs
    .map((paragraph, index) => {
      const media = index === 0 ? inlineMediaFigures(story) : "";
      const map = index === 1 ? inlineMapEmbeds(story) : "";
      const links = index === 1 ? inlineMediaLinks(story) : "";
      return `<p>${escapeHtml(paragraph)}</p>${media}${map}${links}`;
    })
    .join("");
}

function factBox(story) {
  const facts = (story.factBox || [])
    .map((fact) => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value)}</dd></div>`)
    .join("");
  if (!facts) return "";
  return `
    <section class="article-section fact-box">
      <h2>Fast Facts</h2>
      <dl>${facts}</dl>
    </section>
  `;
}

function railFactBox(story) {
  const facts = (story.factBox || [])
    .slice(0, 3)
    .map((fact) => `<li><strong>${escapeHtml(fact.label)}</strong><span>${escapeHtml(fact.value)}</span></li>`)
    .join("");
  if (!facts) return "";
  return `
    <section class="rail-card rail-facts-card">
      <p class="eyebrow">Need To Know</p>
      <ul class="rail-fact-list">${facts}</ul>
    </section>
  `;
}

function storyHero(story) {
  const image = story.heroImage || `/assets/stories/fallback-${story.imageStyle || "street"}.svg`;
  const alt = story.heroAlt || `${story.beat} featured image for ${story.title}`;
  return `<img class="story-art story-image article-hero-image" src="${escapeHtml(image)}" alt="${escapeHtml(alt)}" />`;
}

function renderStory(story, reporter) {
  updateAccountButtons();
  document.title = `${story.title} | East Meets Nash`;

  articleMain.innerHTML = `
    <article class="article-main">
      <div class="article-kicker">
        <span class="pill hot">${escapeHtml(story.label)}</span>
        <span>${escapeHtml(story.zone)}</span>
        <span>${escapeHtml(story.beat)}</span>
        <span>${escapeHtml(story.time)}</span>
      </div>
      <h1>${escapeHtml(story.title)}</h1>
      <p class="article-deck">${escapeHtml(story.deck)}</p>
      <section class="article-reactions" aria-label="Story reactions">
        <div class="reaction-row">${reactionButtons(story)}</div>
        <div class="reaction-note" id="reactionNote" aria-live="polite">${escapeHtml(reactionStatus(story))}</div>
      </section>
      ${storyHero(story)}
      <div class="article-body">
        ${articleParagraphs(story)}
      </div>
      ${factBox(story)}
      <section class="article-section">
        <h2>Sources</h2>
        <ul class="source-links">${sourceList(story)}</ul>
        ${story.sourceNote ? `<p class="source-note">${escapeHtml(story.sourceNote)}</p>` : ""}
      </section>
      <section class="article-section">
        <h2>Comments</h2>
        <ul class="comment-list">${commentList(story)}</ul>
      </section>
    </article>
  `;

  articleRail.innerHTML = `
    <section class="rail-card capture-rail-card">
      <p class="eyebrow">Get The Brief</p>
      <h2>Like this kind of local trouble?</h2>
      <p>Get the morning brief and unlock comments, saves, and personal feed signals as the account layer opens.</p>
      <form class="signup-form">
        <label for="storyEmailInput">Email</label>
        <div>
          <input id="storyEmailInput" type="email" placeholder="neighbor@example.com" required />
          <button type="submit">Join free</button>
        </div>
      </form>
    </section>
    ${railFactBox(story)}
    <section class="rail-card reporter-bio">
      <p class="eyebrow">Reported By</p>
      <a class="reporter-profile-link" href="/reporter.html?id=${escapeHtml(reporter.id)}">
        <div class="avatar" style="background:${escapeHtml(reporter.color)}">${escapeHtml(reporter.name.split(" ").map((part) => part[0]).join("").slice(0, 2))}</div>
        <h2>${escapeHtml(reporter.name)}</h2>
        <p>${escapeHtml(reporter.tagline)}</p>
        <small>${escapeHtml(reporter.beat)}</small>
        <span class="story-read-link">Read Profile</span>
      </a>
    </section>
    <section class="rail-card">
      <p class="eyebrow">Local Sponsors</p>
      <h2>Want the neighborhood to notice?</h2>
      <p>Self-serve placements start at $100.</p>
      <a class="big-link-button" href="/commerce.html">Buy Placement</a>
    </section>
    <section class="rail-card story-actions-card">
      <p class="eyebrow">Add Receipts</p>
      <h2>Know the part everyone is missing?</h2>
      <p>Send the tip, photo, link, or overheard-detail-with-context.</p>
      <a class="big-link-button" href="/tips.html">Send A Tip</a>
    </section>
  `;

  document.querySelectorAll(".reaction-button").forEach((button) => {
    button.addEventListener("click", () => {
      const storyId = button.dataset.story;
      const reaction = button.dataset.reaction;
      const note = document.querySelector("#reactionNote");

      if (!isLoggedIn()) {
        note.innerHTML = reactionAuthPrompt();
        bindReactionAuthPrompt(story, reporter);
        return;
      }

      if (selectedReaction(storyId) === reaction) {
        note.innerHTML = "";
        return;
      }

      saveReaction(storyId, reaction);
      renderStory(story, reporter);
    });
  });

  bindSignupForms(articleRail);
}

function renderMissing() {
  articleMain.innerHTML = `
    <div class="empty-state">
      Story not found. The group text may have moved on.
    </div>
  `;
}

bindAccountButtons();
updateAccountButtons();

async function loadData() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const [stories, reporters] = await Promise.all([
    fetch("/data/stories.json").then((res) => res.json()),
    fetch("/data/reporters.json").then((res) => res.json()),
  ]);

  const story = byId(stories, id) || stories[0];
  if (!story) {
    renderMissing();
    return;
  }
  const reporter = byId(reporters, story.reporterId) || reporters[0];
  renderStory(story, reporter);
}

loadData().catch((error) => {
  console.error(error);
  renderMissing();
});
