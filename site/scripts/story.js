const articleMain = document.querySelector("#articleMain");
const articleRail = document.querySelector("#articleRail");
const saveButton = document.querySelector("#storySaveButton");

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

function reactionButtons(reactions) {
  return Object.entries(reactions || {})
    .map(
      ([name, count]) =>
        `<button class="reaction-button" type="button" data-reaction="${escapeHtml(name)}" data-count="${count}">${escapeHtml(name)} ${count}</button>`,
    )
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

function renderStory(story, reporter) {
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
      <div class="story-art art-${escapeHtml(story.imageStyle || "street")}"></div>
      <div class="article-body">
        <p>${escapeHtml(story.body)}</p>
        <p>This seed article demonstrates the production format: confidence label, source trail, reporter byline, local reactions, comments, and social/video outputs. Live articles will replace prototype notes with real source-backed reporting.</p>
      </div>
      <section class="article-section">
        <h2>Sources</h2>
        <ul class="source-links">${sourceList(story)}</ul>
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
    <section class="rail-card">
      <p class="eyebrow">React</p>
      <div class="reaction-row">${reactionButtons(story.reactions)}</div>
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
      const reaction = button.dataset.reaction;
      const count = Number(button.dataset.count || 0) + 1;
      button.dataset.count = String(count);
      button.textContent = `${reaction} ${count}`;
    });
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
  saveButton.textContent = saveButton.textContent === "Save" ? "Saved" : "Save";
});

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
