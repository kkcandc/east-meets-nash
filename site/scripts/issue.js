const issueType = document.querySelector("#issueType");
const issueCount = document.querySelector("#issueCount");
const issueTitle = document.querySelector("#issueTitle");
const issuePreview = document.querySelector("#issuePreview");
const issueCopy = document.querySelector("#issueCopy");
const copyIssueButton = document.querySelector("#copyIssueButton");

let stories = [];
let reporters = new Map();

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function reporterName(story) {
  return reporters.get(story.reporterId)?.name || "East Meets Nash Desk";
}

function selectedStories() {
  return stories
    .slice()
    .sort((a, b) => b.priority - a.priority)
    .slice(0, Number(issueCount.value || 5));
}

function subjectFor(type) {
  if (type === "weekly") return "East Nashville Woke Up And Chose Receipts";
  if (type === "social") return "East Nashville, Please Explain Yourself";
  return "Five Things Before The Coffee Gets Weird";
}

function introFor(type) {
  if (type === "weekly") {
    return "The weekly issue: one main story, a fistful of quick hits, and the neighborhood mood board nobody asked for but everyone deserves.";
  }
  if (type === "social") {
    return "A short social-first recap built for Instagram, Threads, X, and the person who swears they are not online that much.";
  }
  return "Good morning. Here is what East Nashville needs before traffic, lunch plans, and the first patio opinion of the day.";
}

function buildCopy(type, items) {
  const blocks = items
    .map(
      (story, index) =>
        `${index + 1}. ${story.title}\n${story.deck}\nLabel: ${story.label}. Filed by ${reporterName(story)}.\nLink: /story.html?id=${story.id}`,
    )
    .join("\n\n");

  return `Subject: ${subjectFor(type)}\nPreheader: ${introFor(type)}\n\n${introFor(type)}\n\n${blocks}\n\nSponsor note: Founding sponsor spots are open. $1,500 gets 20 placements, 1 sponsored post, a founding badge, and first right on a category.\n\nTip line: Send the thing everyone is whispering about. Receipts appreciated.`;
}

function renderIssue() {
  const type = issueType.value;
  const items = selectedStories();
  issueTitle.textContent = subjectFor(type);
  issuePreview.innerHTML = `
    <article class="issue-cover">
      <p class="eyebrow">${escapeHtml(type === "weekly" ? "Weekly Flagship" : type === "social" ? "Social Recap" : "Morning Brief")}</p>
      <h2>${escapeHtml(subjectFor(type))}</h2>
      <p>${escapeHtml(introFor(type))}</p>
    </article>
    ${items
      .map(
        (story, index) => `
          <article class="issue-item">
            <span>${index + 1}</span>
            <div>
              <h3><a href="/story.html?id=${escapeHtml(story.id)}">${escapeHtml(story.title)}</a></h3>
              <p>${escapeHtml(story.deck)}</p>
              <small>${escapeHtml(story.label)} / ${escapeHtml(story.zone)} / ${escapeHtml(reporterName(story))}</small>
            </div>
          </article>
        `,
      )
      .join("")}
  `;
  issueCopy.value = buildCopy(type, items);
}

copyIssueButton.addEventListener("click", async () => {
  issueCopy.select();
  try {
    await navigator.clipboard.writeText(issueCopy.value);
    copyIssueButton.textContent = "Copied";
  } catch {
    copyIssueButton.textContent = "Selected";
  }
  setTimeout(() => {
    copyIssueButton.textContent = "Copy Brief";
  }, 1600);
});

issueType.addEventListener("change", renderIssue);
issueCount.addEventListener("input", renderIssue);

async function loadData() {
  const [storyData, reporterData] = await Promise.all([
    fetch("/data/stories.json").then((res) => res.json()),
    fetch("/data/reporters.json").then((res) => res.json()),
  ]);
  stories = storyData;
  reporters = new Map(reporterData.map((reporter) => [reporter.id, reporter]));
  renderIssue();
}

loadData().catch((error) => {
  console.error(error);
  issuePreview.innerHTML = '<div class="empty-state">Issue data did not load.</div>';
});
