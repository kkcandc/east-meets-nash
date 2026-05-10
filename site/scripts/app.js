const state = {
  stories: [],
  reporters: new Map(),
  filtered: [],
};

const searchInput = document.querySelector("#searchInput");
const zoneFilter = document.querySelector("#zoneFilter");
const beatFilter = document.querySelector("#beatFilter");
const resultCount = document.querySelector("#resultCount");
const leadStory = document.querySelector("#leadStory");
const storyGrid = document.querySelector("#storyGrid");
const storyTemplate = document.querySelector("#storyTemplate");
const briefList = document.querySelector("#briefList");
const reporterList = document.querySelector("#reporterList");
const loginButton = document.querySelector("#loginButton");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function uniqueValues(key) {
  return [...new Set(state.stories.map((story) => story[key]))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function fillSelect(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function reporterFor(story) {
  return state.reporters.get(story.reporterId) || {
    name: "East Meets Nash Desk",
    color: "#1f1b18",
  };
}

function reactionLabel(name) {
  if (name === "Love") return "❤️ Love";
  if (name === "Side-Eye") return "👀 Side-Eye";
  return name;
}

function renderStory(story, variant = "standard") {
  const node = storyTemplate.content.firstElementChild.cloneNode(true);
  const reporter = reporterFor(story);
  const art = node.querySelector(".story-art");
  const meta = node.querySelector(".story-meta");
  const title = node.querySelector("h3");
  const deck = node.querySelector(".deck");
  const reactions = node.querySelector(".reaction-row");
  const footer = node.querySelector(".story-footer");

  if (variant === "lead") node.classList.add("lead-card");
  art.classList.add(`art-${story.imageStyle || "street"}`);

  meta.innerHTML = `
    <span class="pill hot">${escapeHtml(story.label)}</span>
    <span>${escapeHtml(story.zone)}</span>
    <span>${escapeHtml(story.beat)}</span>
    <span>${escapeHtml(reporter.name)}</span>
  `;
  title.textContent = story.title;
  deck.textContent = story.deck;

  Object.entries(story.reactions || {}).forEach(([name, count]) => {
    const button = document.createElement("button");
    button.className = "reaction-button";
    button.type = "button";
    button.textContent = `${reactionLabel(name)} ${count}`;
    button.addEventListener("click", () => {
      const next = Number(button.dataset.count || count) + 1;
      button.dataset.count = String(next);
      button.textContent = `${reactionLabel(name)} ${next}`;
    });
    reactions.append(button);
  });

  const source = story.sources?.[0];
  footer.innerHTML = `
    <span>${escapeHtml(story.time)}</span>
    <span>${escapeHtml(story.confidence)}</span>
    <span>${escapeHtml(source?.type || "Source")}:
      <a href="${escapeHtml(source?.url || "#")}">${escapeHtml(source?.name || "Source note")}</a>
    </span>
  `;

  node.addEventListener("click", (event) => {
    if (event.target.closest("button") || event.target.closest("a")) return;
    window.location.href = `/story.html?id=${encodeURIComponent(story.id)}`;
  });

  return node;
}

function showStoryDetail(story) {
  const reporter = reporterFor(story);
  const sourceList = (story.sources || [])
    .map(
      (source) =>
        `<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.name)}</a> <span>${escapeHtml(source.type)}</span></li>`,
    )
    .join("");
  const comments = (story.comments || [])
    .map(
      (comment) =>
        `<li><strong>${escapeHtml(comment.author)}</strong><span>${escapeHtml(comment.text)}</span></li>`,
    )
    .join("");

  const detail = document.createElement("dialog");
  detail.className = "story-dialog";
  detail.innerHTML = `
    <form method="dialog">
      <button aria-label="Close">Close</button>
    </form>
    <p class="eyebrow">${escapeHtml(story.zone)} / ${escapeHtml(story.beat)}</p>
    <h2>${escapeHtml(story.title)}</h2>
    <p>${escapeHtml(story.body)}</p>
    <div class="dialog-columns">
      <section>
        <h3>Sources</h3>
        <ul>${sourceList}</ul>
      </section>
      <section>
        <h3>Comments</h3>
        <ul>${comments}</ul>
      </section>
    </div>
    <section>
      <h3>Social Kit</h3>
      <p><strong>X:</strong> ${escapeHtml(story.social?.x || "")}</p>
      <p><strong>Instagram:</strong> ${escapeHtml(story.social?.instagram || "")}</p>
      <p><strong>Video:</strong> ${escapeHtml(story.social?.video || "")}</p>
    </section>
    <footer>Filed by ${escapeHtml(reporter.name)}. This is prototype seed content until live sources are connected.</footer>
  `;
  document.body.append(detail);
  detail.addEventListener("close", () => detail.remove());
  detail.showModal();
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  const zone = zoneFilter.value;
  const beat = beatFilter.value;

  state.filtered = state.stories
    .filter((story) => zone === "all" || story.zone === zone)
    .filter((story) => beat === "all" || story.beat === beat)
    .filter((story) => {
      if (!query) return true;
      const haystack = [
        story.title,
        story.deck,
        story.body,
        story.zone,
        story.beat,
        story.label,
        reporterFor(story).name,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => b.priority - a.priority);

  renderFeed();
}

function renderFeed() {
  leadStory.innerHTML = "";
  storyGrid.innerHTML = "";
  resultCount.textContent = `${state.filtered.length} items`;

  if (!state.filtered.length) {
    leadStory.innerHTML =
      '<div class="empty-state">Nothing matches that filter yet. The neighborhood remains suspicious.</div>';
    return;
  }

  leadStory.append(renderStory(state.filtered[0], "lead"));
  state.filtered.slice(1).forEach((story) => storyGrid.append(renderStory(story)));
}

function renderBrief() {
  briefList.innerHTML = "";
  state.stories
    .slice()
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)
    .forEach((story) => {
      const li = document.createElement("li");
      li.textContent = story.title;
      briefList.append(li);
    });
}

function renderReporters() {
  reporterList.innerHTML = "";
  state.reporters.forEach((reporter) => {
    const node = document.createElement("article");
    node.className = "reporter";
    node.innerHTML = `
      <div class="avatar" style="background:${escapeHtml(reporter.color)}">${escapeHtml(initials(reporter.name))}</div>
      <div>
        <strong>${escapeHtml(reporter.name)}</strong>
        <span>${escapeHtml(reporter.tagline)}</span>
      </div>
    `;
    reporterList.append(node);
  });
}

async function loadData() {
  const [storiesResponse, reportersResponse] = await Promise.all([
    fetch("/data/stories.json"),
    fetch("/data/reporters.json"),
  ]);

  if (!storiesResponse.ok || !reportersResponse.ok) {
    throw new Error("Could not load prototype data");
  }

  const [stories, reporters] = await Promise.all([
    storiesResponse.json(),
    reportersResponse.json(),
  ]);

  state.stories = stories;
  state.reporters = new Map(reporters.map((reporter) => [reporter.id, reporter]));

  fillSelect(zoneFilter, uniqueValues("zone"));
  fillSelect(beatFilter, uniqueValues("beat"));
  renderBrief();
  renderReporters();
  applyFilters();
}

searchInput.addEventListener("input", applyFilters);
zoneFilter.addEventListener("change", applyFilters);
beatFilter.addEventListener("change", applyFilters);

document.querySelector(".signup-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#emailInput");
  if (!input.value.trim()) return;
  input.value = "";
  loginButton.textContent = "Subscribed";
  setTimeout(() => {
    loginButton.textContent = "Login";
  }, 1800);
});

loginButton.addEventListener("click", () => {
  loginButton.textContent = loginButton.textContent === "Login" ? "Logged In" : "Login";
});

loadData().catch((error) => {
  console.error(error);
  leadStory.innerHTML =
    '<div class="empty-state">The prototype data did not load. Check the local server.</div>';
});
