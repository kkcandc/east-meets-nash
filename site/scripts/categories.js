const topicModeButton = document.querySelector("#topicModeButton");
const topicTitle = document.querySelector("#topicTitle");
const topicGrid = document.querySelector("#topicGrid");

let mode = "zones";
let stories = [];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function groupBy(key) {
  return stories.reduce((groups, story) => {
    const value = story[key] || "East Nashville";
    groups[value] ||= [];
    groups[value].push(story);
    return groups;
  }, {});
}

function topStory(items) {
  return items.slice().sort((a, b) => b.priority - a.priority)[0];
}

function renderTopics() {
  const key = mode === "zones" ? "zone" : "beat";
  const grouped = groupBy(key);
  topicTitle.textContent = mode === "zones" ? "Zones" : "Beats";
  topicModeButton.textContent = mode === "zones" ? "Switch To Beats" : "Switch To Zones";

  topicGrid.innerHTML = Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, items]) => {
      const story = topStory(items);
      const reactions = items.reduce(
        (total, item) =>
          total + Object.values(item.reactions || {}).reduce((sum, count) => sum + count, 0),
        0,
      );
      return `
        <article class="topic-card">
          <span>${items.length} stories</span>
          <h3>${escapeHtml(name)}</h3>
          <p>${escapeHtml(story.deck)}</p>
          <div class="story-meta">
            <span>${reactions} reactions</span>
            <a href="/story.html?id=${escapeHtml(story.id)}">Top story</a>
          </div>
        </article>
      `;
    })
    .join("");
}

topicModeButton.addEventListener("click", () => {
  mode = mode === "zones" ? "beats" : "zones";
  renderTopics();
});

async function loadData() {
  stories = await fetch("/data/stories.json").then((res) => res.json());
  renderTopics();
}

loadData().catch((error) => {
  console.error(error);
  topicGrid.innerHTML = '<div class="empty-state">Topic data did not load.</div>';
});
