const state = {
  sources: [],
  sourceCatalog: [],
  reporters: new Map(),
  sponsors: [],
  classifieds: [],
  calendar: [],
  selected: null,
};

const sourceBeatFilter = document.querySelector("#sourceBeatFilter");
const sourceRiskFilter = document.querySelector("#sourceRiskFilter");
const sourceCatalog = document.querySelector("#sourceCatalog");
const sourceCoverage = document.querySelector("#sourceCoverage");
const sourceList = document.querySelector("#sourceList");
const assignmentTitle = document.querySelector("#assignmentTitle");
const assignmentDetail = document.querySelector("#assignmentDetail");
const socialKit = document.querySelector("#socialKit");
const deskMetrics = document.querySelector("#deskMetrics");
const calendarList = document.querySelector("#calendarList");
const commerceGrid = document.querySelector("#commerceGrid");
const deskRunButton = document.querySelector("#deskRunButton");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function unique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function fillSelect(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function reporterFor(id) {
  return state.reporters.get(id) || {
    name: "East Meets Nash Desk",
    tagline: "The group text got a press pass.",
    voice: "Local, sharp, useful.",
  };
}

function publicStatus(source) {
  return !source.status.toLowerCase().includes("needs") && !source.status.toLowerCase().includes("parked");
}

function filteredSources() {
  const beat = sourceBeatFilter.value;
  const risk = sourceRiskFilter.value;
  return state.sources
    .filter((item) => beat === "all" || item.beat === beat)
    .filter((item) => risk === "all" || item.risk === risk)
    .sort((a, b) => b.score - a.score);
}

function renderMetrics() {
  const ready = state.sources.filter((item) => !item.status.toLowerCase().includes("blocked")).length;
  const blocked = state.sources.length - ready;
  const publicSources = state.sourceCatalog.filter(publicStatus).length;
  const inventory = state.sponsors.reduce((total, product) => total + product.inventory, 0);
  const revenue = state.sponsors.reduce((total, product) => total + product.price * product.inventory, 0);

  deskMetrics.innerHTML = `
    <article><span>${state.sources.length}</span><strong>Leads</strong></article>
    <article><span>${ready}</span><strong>Ready</strong></article>
    <article><span>${blocked}</span><strong>Blocked</strong></article>
    <article><span>${publicSources}</span><strong>Public source streams</strong></article>
    <article><span>${money(revenue)}</span><strong>Mock inventory</strong></article>
  `;
}

function renderSourceCatalog() {
  const tiers = ["Anchor", "Daily", "Weekly", "Later"];
  const tierCounts = tiers.map((tier) => ({
    count: state.sourceCatalog.filter((source) => source.tier === tier).length,
    tier,
  }));
  const readyCount = state.sourceCatalog.filter(publicStatus).length;
  const beatCount = unique(state.sourceCatalog.flatMap((source) => source.beats || [])).length;
  const zoneCount = unique(state.sourceCatalog.flatMap((source) => source.zones || [])).length;

  sourceCoverage.innerHTML = `
    <article><span>${state.sourceCatalog.length}</span><strong>Monitored sources</strong></article>
    <article><span>${readyCount}</span><strong>Usable without access</strong></article>
    <article><span>${beatCount}</span><strong>Beats covered</strong></article>
    <article><span>${zoneCount}</span><strong>Zones/areas covered</strong></article>
  `;

  sourceCatalog.innerHTML = tierCounts
    .map(({ tier, count }) => {
      const sources = state.sourceCatalog.filter((source) => source.tier === tier);
      if (!sources.length) return "";
      return `
        <section class="source-tier-card">
          <div class="source-tier-heading">
            <span>${count}</span>
            <div>
              <p class="eyebrow">${escapeHtml(tier)} Sources</p>
              <h3>${escapeHtml(sourceTierTitle(tier))}</h3>
            </div>
          </div>
          <div class="source-catalog-list">
            ${sources
              .map(
                (source) => `
                  <article>
                    <div>
                      <strong>${escapeHtml(source.name)}</strong>
                      <small>${escapeHtml(source.type)} / ${escapeHtml(source.status)} / ${escapeHtml(source.cadence)}</small>
                    </div>
                    <p>${escapeHtml(source.publishUse)}</p>
                    <dl>
                      <div><dt>Beats</dt><dd>${(source.beats || []).map(escapeHtml).join(" / ")}</dd></div>
                      <div><dt>Next</dt><dd>${escapeHtml(source.nextStep)}</dd></div>
                    </dl>
                    <a href="${escapeHtml(source.url)}">Open source</a>
                  </article>
                `,
              )
              .join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function sourceTierTitle(tier) {
  if (tier === "Anchor") return "Daily story engines";
  if (tier === "Daily") return "Fast recurring scans";
  if (tier === "Weekly") return "Depth and community texture";
  return "Worth having, not worth blocking launch";
}

function renderSources() {
  const items = filteredSources();
  sourceList.innerHTML = "";

  if (!items.length) {
    sourceList.innerHTML = '<div class="empty-state">No leads match those filters.</div>';
    return;
  }

  items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "source-item";
    if (state.selected?.id === item.id) button.classList.add("selected");
    button.innerHTML = `
      <span class="source-score">${item.score}</span>
      <span>
        <strong>${escapeHtml(item.title)}</strong>
        <small>${escapeHtml(item.zone)} / ${escapeHtml(item.beat)} / ${escapeHtml(item.confidence)} / ${escapeHtml(item.risk)} risk</small>
      </span>
    `;
    button.addEventListener("click", () => {
      state.selected = item;
      renderSources();
      renderAssignment();
      renderSocialKit();
    });
    sourceList.append(button);
  });
}

function renderAssignment() {
  const item = state.selected || filteredSources()[0];
  state.selected = item;
  if (!item) return;

  const reporter = reporterFor(item.suggestedReporter);
  assignmentTitle.textContent = item.title;
  assignmentDetail.innerHTML = `
    <dl>
      <div><dt>Source</dt><dd><a href="${escapeHtml(item.url)}">${escapeHtml(item.source)}</a></dd></div>
      <div><dt>Status</dt><dd>${escapeHtml(item.status)}</dd></div>
      <div><dt>Cadence</dt><dd>${escapeHtml(item.cadence || "As needed")}</dd></div>
      <div><dt>Reporter</dt><dd>${escapeHtml(reporter.name)}</dd></div>
      <div><dt>Label</dt><dd>${escapeHtml(item.suggestedLabel)}</dd></div>
      <div><dt>Format</dt><dd>${escapeHtml(item.publishFormat)}</dd></div>
    </dl>
    <h3>Suggested Angle</h3>
    <p>${escapeHtml(item.suggestedAngle)}</p>
    <h3>Verification Rule</h3>
    <p>${escapeHtml(item.verificationRule || "Attach the source trail before publishing.")}</p>
    <h3>Draft Headline</h3>
    <p class="draft-headline">${escapeHtml(makeHeadline(item, reporter))}</p>
    <h3>Next Step</h3>
    <p>${escapeHtml(nextStep(item))}</p>
  `;
}

function makeHeadline(item, reporter) {
  if (item.beat === "Development") return "The Permit File Is Trying To Tell Us Something Again";
  if (item.beat === "Events") return "Your Weekend Calendar Is Already Acting Booked";
  if (item.beat === "Gossip") return "What People Are Mad About This Week, Labeled Before Anyone Gets Sued";
  if (item.beat === "Traffic") return "Cone Watch: Where East Nashville Movement Gets Expensive";
  if (item.beat === "Restaurants") return "Soft Launch Watch Has Entered The Chat";
  return `${reporter.name} Has A Lead And A Problem`;
}

function nextStep(item) {
  if (item.status.toLowerCase().includes("blocked")) {
    return "Wait for access workflow, then capture screenshots/source notes before drafting.";
  }
  if (item.status.toLowerCase().includes("needs")) {
    return `${item.status}. Build the missing input, then rerun this lead.`;
  }
  if (item.confidence === "Official") {
    return "Pull the public record, summarize the document, attach source link, then auto-publish as a confirmed item.";
  }
  if (item.confidence.includes("Direct")) {
    return "Capture the original post/page, write the brief, include the public source link, and add social versions.";
  }
  return "Draft as community chatter with a confidence label and avoid unsupported factual claims.";
}

function renderSocialKit() {
  const item = state.selected || filteredSources()[0];
  const reporter = reporterFor(item.suggestedReporter);
  const headline = makeHeadline(item, reporter);
  socialKit.innerHTML = `
    <article>
      <strong>X</strong>
      <p>${escapeHtml(headline)} Source: ${escapeHtml(item.source)}.</p>
    </article>
    <article>
      <strong>Threads</strong>
      <p>${escapeHtml(item.zone)} update: ${escapeHtml(item.suggestedAngle)}</p>
    </article>
    <article>
      <strong>Instagram</strong>
      <p>${escapeHtml(headline)} Filed by ${escapeHtml(reporter.name)}. Save this before the comments become a second location.</p>
    </article>
    <article>
      <strong>Video Script</strong>
      <p>${escapeHtml(reporter.name)} opens with: "East Nashville, gather around. ${escapeHtml(item.title)}." Then one fact, one source note, one joke, and the seal end card.</p>
    </article>
    <article>
      <strong>Newsletter Block</strong>
      <p><b>${escapeHtml(headline)}</b> ${escapeHtml(item.suggestedAngle)} Source label: ${escapeHtml(item.suggestedLabel)}.</p>
    </article>
    <article>
      <strong>Higgsfield Prompt</strong>
      <p>Vertical 9:16 local news short. ${escapeHtml(reporter.name)}, ${escapeHtml(reporter.look || reporter.tagline)}, delivers a fast East Nashville update in a ${escapeHtml(item.zone)}-inspired setting. Polished but scrappy civic-parody style, expressive timing, no text on screen.</p>
    </article>
  `;
}

function renderCalendar() {
  calendarList.innerHTML = state.calendar
    .map(
      (day) => `
        <article>
          <time>${escapeHtml(day.date)}</time>
          <div>
            <strong>${escapeHtml(day.theme)}</strong>
            <p>${escapeHtml(day.publishingGoal)}</p>
            <small>${day.mustHave.map(escapeHtml).join(" / ")}</small>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderCommerce() {
  const products = state.sponsors
    .map(
      (product) => `
        <article>
          <span>${money(product.price)}</span>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.checkoutCopy)}</p>
          <small>${product.inventory} slots / ${product.deliverables.map(escapeHtml).join(" / ")}</small>
        </article>
      `,
    )
    .join("");

  const classifieds = state.classifieds
    .map(
      (item) => `
        <article>
          <span>${money(item.price)}</span>
          <h3>${escapeHtml(item.category)}</h3>
          <p>${escapeHtml(item.title)}</p>
          <small>${escapeHtml(item.status)}</small>
        </article>
      `,
    )
    .join("");

  commerceGrid.innerHTML = products + classifieds;
}

async function loadData() {
  const [sources, sourceCatalogData, reporters, sponsors, classifieds, calendar] = await Promise.all([
    fetch("/data/source-items.json").then((res) => res.json()),
    fetch("/data/sources.json").then((res) => res.json()),
    fetch("/data/reporters.json").then((res) => res.json()),
    fetch("/data/sponsor-products.json").then((res) => res.json()),
    fetch("/data/classifieds.json").then((res) => res.json()),
    fetch("/data/content-calendar.json").then((res) => res.json()),
  ]);

  state.sources = sources;
  state.sourceCatalog = sourceCatalogData;
  state.reporters = new Map(reporters.map((reporter) => [reporter.id, reporter]));
  state.sponsors = sponsors;
  state.classifieds = classifieds;
  state.calendar = calendar;
  state.selected = state.sources.slice().sort((a, b) => b.score - a.score)[0];

  fillSelect(sourceBeatFilter, unique(state.sources.map((item) => item.beat)));
  fillSelect(sourceRiskFilter, unique(state.sources.map((item) => item.risk)));

  renderMetrics();
  renderSourceCatalog();
  renderSources();
  renderAssignment();
  renderSocialKit();
  renderCalendar();
  renderCommerce();
}

sourceBeatFilter.addEventListener("change", () => {
  state.selected = filteredSources()[0] || null;
  renderSources();
  renderAssignment();
  renderSocialKit();
});

sourceRiskFilter.addEventListener("change", () => {
  state.selected = filteredSources()[0] || null;
  renderSources();
  renderAssignment();
  renderSocialKit();
});

deskRunButton.addEventListener("click", () => {
  deskRunButton.textContent = "Desk Queued";
  setTimeout(() => {
    deskRunButton.textContent = "Run Desk";
  }, 1600);
});

loadData().catch((error) => {
  console.error(error);
  sourceList.innerHTML = '<div class="empty-state">Desk data did not load.</div>';
});
