const reporterApp = document.querySelector("#reporterApp");

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function byId(items, id) {
  return new Map(items.map((item) => [item.id, item])).get(id);
}

function initials(name) {
  return String(name || "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function reporterAvatar(reporter, className = "avatar") {
  const style = `background:${escapeHtml(reporter.color)}`;
  if (reporter.photoUrl) {
    return `
      <div class="${className} has-photo" style="${style}">
        <img src="${escapeHtml(reporter.photoUrl)}" alt="${escapeHtml(reporter.photoAlt || `${reporter.name} portrait`)}" loading="lazy" />
      </div>
    `;
  }
  return `<div class="${className}" style="${style}">${escapeHtml(initials(reporter.name))}</div>`;
}

function listItems(items) {
  return (items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function pillItems(items) {
  return (items || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("");
}

function storyUrl(story) {
  return `/story.html?id=${encodeURIComponent(story.id)}`;
}

function renderStoryCards(stories) {
  if (!stories.length) {
    return `<p class="muted-copy">No stories from this reporter are live yet.</p>`;
  }

  return stories
    .map(
      (story) => `
        <a class="reporter-story-card" href="${storyUrl(story)}">
          <span>${escapeHtml(story.label)} / ${escapeHtml(story.zone)}</span>
          <strong>${escapeHtml(story.title)}</strong>
          <small>${escapeHtml(story.deck)}</small>
        </a>
      `,
    )
    .join("");
}

function renderReporter(reporter, stories) {
  const recentStories = stories
    .filter((story) => story.reporterId === reporter.id)
    .sort((a, b) => b.priority - a.priority);

  document.title = `${reporter.name} | East Meets Nash`;
  reporterApp.innerHTML = `
    <section class="reporter-profile-shell">
      <section class="reporter-hero">
        ${reporterAvatar(reporter, "reporter-avatar-large")}
        <div class="reporter-identity">
          <p class="eyebrow">Reported By</p>
          <h1>${escapeHtml(reporter.name)}</h1>
          <p class="reporter-deck">${escapeHtml(reporter.tagline)}</p>
          <div class="story-meta">
            <span class="pill hot">${escapeHtml(reporter.signatureColumn)}</span>
            <span>${escapeHtml(reporter.beat)}</span>
            <span>${escapeHtml(reporter.homeBase)}</span>
          </div>
        </div>
      </section>

      <section class="reporter-profile-layout">
        <div class="reporter-profile-main">
          <section class="reporter-profile-panel">
            <p class="eyebrow">Profile</p>
            <h2>Who This Is</h2>
            <p>${escapeHtml(reporter.bio)}</p>
            <p>${escapeHtml(reporter.backstory)}</p>
          </section>

          <section class="reporter-profile-panel">
            <p class="eyebrow">Reporting Lens</p>
            <h2>How They Cover East Nashville</h2>
            <p>${escapeHtml(reporter.defaultAngle)}</p>
            <div class="reporter-detail-grid">
              <div>
                <span>Known For</span>
                <strong>${escapeHtml(reporter.knownFor)}</strong>
              </div>
              <div>
                <span>Favorite Complaint</span>
                <strong>${escapeHtml(reporter.favoriteComplaint)}</strong>
              </div>
            </div>
          </section>

          <section class="reporter-profile-panel">
            <p class="eyebrow">Recent Reporting</p>
            <h2>Stories</h2>
            <div class="reporter-story-list">
              ${renderStoryCards(recentStories)}
            </div>
          </section>
        </div>

        <aside class="reporter-profile-sidebar">
          <section class="reporter-profile-panel">
            <p class="eyebrow">Source Diet</p>
            <ul class="reporter-note-list">${listItems(reporter.sourceDiet)}</ul>
          </section>

          <section class="reporter-profile-panel">
            <p class="eyebrow">Obsessions</p>
            <div class="reporter-pill-list">${pillItems(reporter.obsessions)}</div>
          </section>

          <section class="reporter-profile-panel">
            <p class="eyebrow">Rules Of The Bit</p>
            <ul class="reporter-note-list">${listItems(reporter.coverageNotes)}</ul>
          </section>

          <section class="reporter-profile-panel reporter-tip-panel">
            <p class="eyebrow">Tip This Reporter</p>
            <h2>Got Something?</h2>
            <p>${escapeHtml(reporter.contactPrompt)}</p>
            <a class="big-link-button" href="/tips.html">Send A Tip</a>
          </section>
        </aside>
      </section>
    </section>
  `;
}

function renderMissing() {
  reporterApp.innerHTML = `
    <section class="empty-state">
      Reporter not found. The newsroom may be arguing over the byline.
    </section>
  `;
}

async function loadData() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const [reporters, stories] = await Promise.all([
    fetch("/data/reporters.json").then((res) => res.json()),
    fetch("/data/stories.json").then((res) => res.json()),
  ]);
  const reporter = byId(reporters, id) || reporters[0];

  if (!reporter) {
    renderMissing();
    return;
  }

  renderReporter(reporter, stories);
}

loadData().catch((error) => {
  console.error(error);
  renderMissing();
});
