const storageKey = "east-meets-nash:drafts";
const draftForm = document.querySelector("#draftForm");
const draftList = document.querySelector("#draftList");
const clearDraftsButton = document.querySelector("#clearDraftsButton");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadDrafts() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function saveDrafts(drafts) {
  localStorage.setItem(storageKey, JSON.stringify(drafts));
}

function reporterForBeat(beat) {
  if (beat === "Restaurants" || beat === "Gossip") return "Mabel Pearl Calhoun";
  if (beat === "Development" || beat === "Civic") return "June Parcel";
  if (beat === "Events") return "Lila Neon";
  if (beat === "Family") return "Parker Mae Stroller";
  return "Riff Darnell";
}

function socialLine(draft) {
  if (draft.confidence === "Group Chat Says") {
    return `${draft.zone} chatter: ${draft.title}. Labeled before everyone starts acting like a comment is a court document.`;
  }
  return `${draft.zone}: ${draft.title}. ${draft.deck}`;
}

function renderDrafts() {
  const drafts = loadDrafts();
  if (!drafts.length) {
    draftList.innerHTML = '<div class="empty-state">No local drafts yet. Feed it a rumor, a link, or a civic PDF.</div>';
    return;
  }

  draftList.innerHTML = drafts
    .map(
      (draft, index) => `
        <article class="draft-card">
          <div class="story-meta">
            <span class="pill hot">${escapeHtml(draft.confidence)}</span>
            <span>${escapeHtml(draft.zone)}</span>
            <span>${escapeHtml(draft.beat)}</span>
          </div>
          <h3>${escapeHtml(draft.title)}</h3>
          <p>${escapeHtml(draft.deck)}</p>
          <dl>
            <div><dt>Reporter</dt><dd>${escapeHtml(reporterForBeat(draft.beat))}</dd></div>
            <div><dt>Source</dt><dd>${draft.sourceUrl ? `<a href="${escapeHtml(draft.sourceUrl)}">${escapeHtml(draft.sourceUrl)}</a>` : "Internal source note needed"}</dd></div>
            <div><dt>Social</dt><dd>${escapeHtml(socialLine(draft))}</dd></div>
          </dl>
          <button type="button" data-index="${index}">Delete</button>
        </article>
      `,
    )
    .join("");

  draftList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const next = loadDrafts();
      next.splice(Number(button.dataset.index), 1);
      saveDrafts(next);
      renderDrafts();
    });
  });
}

draftForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(draftForm);
  const draft = Object.fromEntries(formData.entries());
  draft.id = `local-${Date.now()}`;
  draft.createdAt = new Date().toISOString();
  const drafts = loadDrafts();
  drafts.unshift(draft);
  saveDrafts(drafts);
  draftForm.reset();
  renderDrafts();
});

clearDraftsButton.addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  renderDrafts();
});

renderDrafts();
