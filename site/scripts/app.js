const state = {
  stories: [],
  reporters: new Map(),
  filtered: [],
};

const leadStory = document.querySelector("#leadStory");
const secondaryPackage = document.querySelector("#secondaryPackage");
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

function reporterFor(story) {
  return state.reporters.get(story.reporterId) || {
    name: "East Meets Nash Desk",
    color: "#1f1b18",
  };
}

function isSeriousStory(story) {
  return ["Safety", "Crime", "Public Safety"].includes(story.beat) || story.title.includes("No Jokes");
}

function storyUrl(story) {
  return `/story.html?id=${encodeURIComponent(story.id)}`;
}

function featuredImage(story) {
  return story.heroImage || `/assets/stories/fallback-${story.imageStyle || "street"}.svg`;
}

function featuredAlt(story) {
  return story.heroAlt || `${story.beat} featured image for ${story.title}`;
}

function renderStory(story, variant = "standard") {
  const node = storyTemplate.content.firstElementChild.cloneNode(true);
  const art = node.querySelector(".story-art");
  const meta = node.querySelector(".story-meta");
  const title = node.querySelector("h3");
  const deck = node.querySelector(".deck");
  const reactions = node.querySelector(".reaction-row");
  const footer = node.querySelector(".story-footer");

  if (variant === "lead") node.classList.add("lead-card");
  if (variant === "package") node.classList.add("package-card");
  if (isSeriousStory(story)) node.classList.add("serious-card");
  const image = document.createElement("img");
  image.className = "story-art story-image";
  image.src = featuredImage(story);
  image.alt = featuredAlt(story);
  art.replaceWith(image);

  meta.innerHTML = `
    <span class="pill ${isSeriousStory(story) ? "serious" : "hot"}">${escapeHtml(story.label)}</span>
    <span>${escapeHtml(story.beat)}</span>
    <span>${escapeHtml(story.time)}</span>
  `;
  title.innerHTML = `<a href="${storyUrl(story)}">${escapeHtml(story.title)}</a>`;
  deck.textContent = story.deck;

  reactions.remove();
  footer.innerHTML = `<a class="story-read-link" href="${storyUrl(story)}">Read story</a>`;

  node.addEventListener("click", (event) => {
    if (event.target.closest("button") || event.target.closest("a")) return;
    window.location.href = storyUrl(story);
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
  const imageMedia = (story.media || []).filter((item) => item.imageUrl);
  const mapMedia = (story.media || []).filter((item) => item.embedUrl);
  const linkMedia = (story.media || []).filter((item) => item.url && !item.imageUrl && !item.embedUrl && item.label !== "Hero Art");
  const figures = imageMedia
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
  const maps = mapMedia
    .map(
      (item) => `
        <figure class="article-inline-map">
          <iframe title="${escapeHtml(item.title)}" src="${escapeHtml(item.embedUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          <figcaption>
            <strong>${escapeHtml(item.title)}</strong>
            ${item.url ? `<a href="${escapeHtml(item.url)}">Open in Google Maps</a>` : ""}
          </figcaption>
        </figure>
      `,
    )
    .join("");
  const mediaLinks = linkMedia.length
    ? `
      <aside class="article-inline-links">
        ${linkMedia
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
    `
    : "";
  const paragraphs = String(story.body || "")
    .split("\n\n")
    .map((paragraph, index) => `<p>${escapeHtml(paragraph)}</p>${index === 0 ? figures : ""}${index === 1 ? maps : ""}${index === 1 ? mediaLinks : ""}`)
    .join("");
  const factBox = (story.factBox || [])
    .map((fact) => `<div><dt>${escapeHtml(fact.label)}</dt><dd>${escapeHtml(fact.value)}</dd></div>`)
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
    ${paragraphs}
    ${factBox ? `<section><h3>Fast Facts</h3><dl class="fact-box">${factBox}</dl></section>` : ""}
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
    <footer>Reported by ${escapeHtml(reporter.name)}. This is prototype seed content until live sources are connected.</footer>
  `;
  document.body.append(detail);
  detail.addEventListener("close", () => detail.remove());
  detail.showModal();
}

function sortHomepageStories() {
  state.filtered = state.stories.slice().sort((a, b) => b.priority - a.priority);
  renderFeed();
}

function renderFeed() {
  leadStory.innerHTML = "";
  secondaryPackage.innerHTML = "";
  storyGrid.innerHTML = "";

  if (!state.filtered.length) {
    leadStory.innerHTML = '<div class="empty-state">No stories are loaded yet.</div>';
    return;
  }

  const packageIds = [
    "party-fowl-five-points-opening",
    "gallatin-main-safety-project",
    "east-trinity-gallatin-pedestrian-death",
  ];
  const packageStories = packageIds
    .map((id) => state.filtered.find((story) => story.id === id))
    .filter(Boolean);
  const fallbackStories = state.filtered.filter((story) => !packageStories.includes(story));
  const topStories = [...packageStories, ...fallbackStories].slice(0, 3);
  const topStoryIds = new Set(topStories.map((story) => story.id));

  leadStory.append(renderStory(topStories[0], "lead"));
  topStories.slice(1).forEach((story) => secondaryPackage.append(renderStory(story, "package")));
  state.filtered
    .filter((story) => !topStoryIds.has(story.id))
    .forEach((story) => storyGrid.append(renderStory(story)));
}

function renderBrief() {
  briefList.innerHTML = "";
  state.stories
    .slice()
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 7)
    .forEach((story) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="${storyUrl(story)}">${escapeHtml(story.title)}</a>
        <span>${escapeHtml(story.zone)} / ${escapeHtml(story.beat)}</span>
      `;
      briefList.append(li);
    });
}

function renderReporters() {
  if (!reporterList) return;
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

  renderBrief();
  renderReporters();
  sortHomepageStories();
}

document.querySelectorAll(".signup-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    if (!input?.value.trim()) return;
    input.value = "";
    if (button) {
      const label = button.textContent;
      button.textContent = "Joined";
      setTimeout(() => {
        button.textContent = label;
      }, 1800);
    }
  });
});

loginButton.addEventListener("click", () => {
  loginButton.textContent = loginButton.textContent === "Login" ? "Logged In" : "Login";
});

loadData().catch((error) => {
  console.error(error);
  leadStory.innerHTML =
    '<div class="empty-state">The prototype data did not load. Check the local server.</div>';
});
