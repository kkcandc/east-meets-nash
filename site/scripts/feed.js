const preferenceKey = "east-meets-nash:preferences";
const reactionKey = "east-meets-nash:feed-reactions";

const preferenceControls = document.querySelector("#preferenceControls");
const personalFeed = document.querySelector("#personalFeed");
const feedSignals = document.querySelector("#feedSignals");
const feedTitle = document.querySelector("#feedTitle");
const resetPreferences = document.querySelector("#resetPreferences");
const feedLoginButton = document.querySelector("#feedLoginButton");

let stories = [];
let reporters = new Map();
let preferences = {
  zones: [],
  beats: [],
  reporters: [],
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function unique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function loadPreferences() {
  try {
    return { ...preferences, ...JSON.parse(localStorage.getItem(preferenceKey) || "{}") };
  } catch {
    return preferences;
  }
}

function savePreferences() {
  localStorage.setItem(preferenceKey, JSON.stringify(preferences));
}

function reactionStore() {
  try {
    return JSON.parse(localStorage.getItem(reactionKey) || "{}");
  } catch {
    return {};
  }
}

function saveReactions(reactions) {
  localStorage.setItem(reactionKey, JSON.stringify(reactions));
}

function reporterFor(story) {
  return reporters.get(story.reporterId) || {
    name: "East Meets Nash Desk",
    color: "#1f1b18",
  };
}

function selected(type, value) {
  return preferences[type].includes(value);
}

function toggle(type, value) {
  const values = new Set(preferences[type]);
  if (values.has(value)) values.delete(value);
  else values.add(value);
  preferences[type] = [...values];
  savePreferences();
  renderAll();
}

function renderPreferenceGroup(title, type, values) {
  return `
    <section>
      <h3>${escapeHtml(title)}</h3>
      <div class="chip-grid">
        ${values
          .map(
            (value) =>
              `<button type="button" class="${selected(type, value) ? "selected" : ""}" data-type="${escapeHtml(type)}" data-value="${escapeHtml(value)}">${escapeHtml(value)}</button>`,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderPreferences() {
  const zones = unique(stories.map((story) => story.zone));
  const beats = unique(stories.map((story) => story.beat));
  const names = [...reporters.values()].map((reporter) => reporter.name);

  preferenceControls.innerHTML = [
    renderPreferenceGroup("Zones", "zones", zones),
    renderPreferenceGroup("Beats", "beats", beats),
    renderPreferenceGroup("Reporters", "reporters", names),
  ].join("");

  preferenceControls.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => toggle(button.dataset.type, button.dataset.value));
  });
}

function scoreStory(story) {
  let score = story.priority;
  const reporter = reporterFor(story);
  if (preferences.zones.includes(story.zone)) score += 35;
  if (preferences.beats.includes(story.beat)) score += 30;
  if (preferences.reporters.includes(reporter.name)) score += 25;
  return score;
}

function filteredStories() {
  return stories
    .slice()
    .map((story) => ({ story, score: scoreStory(story) }))
    .sort((a, b) => b.score - a.score);
}

function renderFeed() {
  const items = filteredStories();
  const preferenceCount =
    preferences.zones.length + preferences.beats.length + preferences.reporters.length;

  feedTitle.textContent = preferenceCount
    ? `The Feed, Tuned ${preferenceCount} Ways`
    : "The Feed, Currently Unhinged By Default";

  personalFeed.innerHTML = items
    .map(({ story, score }) => {
      const reporter = reporterFor(story);
      const reactions = reactionStore()[story.id] || {};
      const reactionCount = Object.values(story.reactions || {}).reduce((total, value) => total + value, 0);
      return `
        <article class="feed-item">
          <div class="feed-rank">${score}</div>
          <div>
            <div class="story-meta">
              <span class="pill hot">${escapeHtml(story.label)}</span>
              <span>${escapeHtml(story.zone)}</span>
              <span>${escapeHtml(story.beat)}</span>
              <span>${escapeHtml(reporter.name)}</span>
            </div>
            <h3><a href="/story.html?id=${escapeHtml(story.id)}">${escapeHtml(story.title)}</a></h3>
            <p>${escapeHtml(story.deck)}</p>
            <div class="feed-actions">
              <button type="button" data-story="${escapeHtml(story.id)}" data-action="save">${reactions.save ? "Saved" : "Save"}</button>
              <button type="button" data-story="${escapeHtml(story.id)}" data-action="hide">${reactions.hide ? "Hidden" : "Hide"}</button>
              <span>${reactionCount} public reactions</span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  personalFeed.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const reactions = reactionStore();
      const storyReactions = reactions[button.dataset.story] || {};
      storyReactions[button.dataset.action] = !storyReactions[button.dataset.action];
      reactions[button.dataset.story] = storyReactions;
      saveReactions(reactions);
      renderFeed();
      renderSignals();
    });
  });
}

function renderSignals() {
  const items = filteredStories();
  const saved = Object.values(reactionStore()).filter((item) => item.save).length;
  const hidden = Object.values(reactionStore()).filter((item) => item.hide).length;
  const topZone = items[0]?.story.zone || "East Nashville";
  const topBeat = items[0]?.story.beat || "Gossip";

  feedSignals.innerHTML = `
    <article><strong>${escapeHtml(topZone)}</strong><span>Top zone right now.</span></article>
    <article><strong>${escapeHtml(topBeat)}</strong><span>Highest-ranked beat.</span></article>
    <article><strong>${saved}</strong><span>Saved stories in this browser.</span></article>
    <article><strong>${hidden}</strong><span>Hidden stories in this browser.</span></article>
    <article><strong>Morning Brief</strong><span>Would personalize from these same signals.</span></article>
  `;
}

function renderAll() {
  renderPreferences();
  renderFeed();
  renderSignals();
}

resetPreferences.addEventListener("click", () => {
  preferences = { zones: [], beats: [], reporters: [] };
  savePreferences();
  renderAll();
});

feedLoginButton.addEventListener("click", () => {
  feedLoginButton.textContent = feedLoginButton.textContent === "Login" ? "Logged In" : "Login";
});

async function loadData() {
  const [storyData, reporterData] = await Promise.all([
    fetch("/data/stories.json").then((res) => res.json()),
    fetch("/data/reporters.json").then((res) => res.json()),
  ]);
  stories = storyData;
  reporters = new Map(reporterData.map((reporter) => [reporter.id, reporter]));
  preferences = loadPreferences();
  renderAll();
}

loadData().catch((error) => {
  console.error(error);
  personalFeed.innerHTML = '<div class="empty-state">Feed data did not load.</div>';
});
