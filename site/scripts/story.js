const articleMain = document.querySelector("#articleMain");
const articleRail = document.querySelector("#articleRail");
const saveButton = document.querySelector("#storySaveButton");
const accountSessionKey = "east-meets-nash:account-session";
const storyReactionKey = "east-meets-nash:story-reactions";

let currentStory = null;
let currentReporter = null;

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
  if (name === "Love") return "❤️ Love";
  if (name === "Side-Eye") return "👀 Side-Eye";
  return name;
}

function readReactionStore() {
  try {
    return JSON.parse(localStorage.getItem(storyReactionKey) || "{}");
  } catch {
    return {};
  }
}

function isLoggedIn() {
  return localStorage.getItem(accountSessionKey) === "true";
}

function setLoggedIn(active) {
  localStorage.setItem(accountSessionKey, active ? "true" : "false");
  updateSessionButton();
}

function updateSessionButton() {
  saveButton.textContent = isLoggedIn() ? "Logged In" : "Login";
  saveButton.setAttribute("aria-pressed", String(isLoggedIn()));
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
  if (!isLoggedIn()) return "Log in to react. One reaction per article.";
  if (selectedReaction(story.id)) return "Your reaction is saved. You can switch it, but it only counts once.";
  return "Pick one reaction. One per article.";
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
      (item) => `
        <figure class="article-inline-media">
          ${item.url ? `<a href="${escapeHtml(item.url)}">` : ""}
            <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.imageAlt || item.title)}" loading="lazy" />
          ${item.url ? "</a>" : ""}
          <figcaption>
            <strong>${escapeHtml(item.title)}</strong>
            ${escapeHtml(item.description)}
            ${item.credit ? `<small>${escapeHtml(item.credit)}</small>` : ""}
          </figcaption>
        </figure>
      `,
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
            ${escapeHtml(item.description)}
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

function storyHero(story) {
  if (story.heroImage) {
    return `<img class="story-art story-image article-hero-image" src="${escapeHtml(story.heroImage)}" alt="${escapeHtml(story.heroAlt || "")}" />`;
  }
  return `<div class="story-art art-${escapeHtml(story.imageStyle || "street")}"></div>`;
}

function renderStory(story, reporter) {
  currentStory = story;
  currentReporter = reporter;
  updateSessionButton();
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
    <section class="rail-card reporter-bio">
      <p class="eyebrow">Filed By</p>
      <div class="avatar" style="background:${escapeHtml(reporter.color)}">${escapeHtml(reporter.name.split(" ").map((part) => part[0]).join("").slice(0, 2))}</div>
      <h2>${escapeHtml(reporter.name)}</h2>
      <p>${escapeHtml(reporter.tagline)}</p>
      <small>${escapeHtml(reporter.beat)}</small>
    </section>
    <section class="rail-card reaction-card">
      <p class="eyebrow">React</p>
      <div class="reaction-row">${reactionButtons(story)}</div>
      <p class="reaction-note" id="reactionNote">${escapeHtml(reactionStatus(story))}</p>
      ${isLoggedIn() ? "" : `<button class="reaction-login-button" type="button" id="reactionLoginButton">Login to react</button>`}
    </section>
    <section class="rail-card">
      <p class="eyebrow">Social Kit</p>
      <h2>X</h2>
      <p>${escapeHtml(story.social?.x || "")}</p>
      <h2>Instagram</h2>
      <p>${escapeHtml(story.social?.instagram || "")}</p>
      <h2>Video</h2>
      <p>${escapeHtml(story.social?.video || "")}</p>
    </section>
    <section class="rail-card">
      <p class="eyebrow">Sponsor Slot</p>
      <h2>Want the neighborhood to notice?</h2>
      <p>Self-serve placements start at $100.</p>
      <a class="big-link-button" href="/commerce.html">Buy Placement</a>
    </section>
  `;

  document.querySelectorAll(".reaction-button").forEach((button) => {
    button.addEventListener("click", () => {
      const storyId = button.dataset.story;
      const reaction = button.dataset.reaction;
      const note = document.querySelector("#reactionNote");

      if (!isLoggedIn()) {
        note.textContent = "Log in first, then your reaction will count once.";
        return;
      }

      if (selectedReaction(storyId) === reaction) {
        note.textContent = "Already counted for this article.";
        return;
      }

      saveReaction(storyId, reaction);
      renderStory(story, reporter);
    });
  });

  document.querySelector("#reactionLoginButton")?.addEventListener("click", () => {
    setLoggedIn(true);
    renderStory(story, reporter);
  });
}

function renderMissing() {
  articleMain.innerHTML = `
    <div class="empty-state">
      Story not found. The group text may have moved on.
    </div>
  `;
}

saveButton.addEventListener("click", () => {
  setLoggedIn(!isLoggedIn());
  if (currentStory && currentReporter) renderStory(currentStory, currentReporter);
});

updateSessionButton();

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
