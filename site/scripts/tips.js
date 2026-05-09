const storageKey = "east-meets-nash:tips";
const tipForm = document.querySelector("#tipForm");
const tipList = document.querySelector("#tipList");
const clearTipsButton = document.querySelector("#clearTipsButton");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadTips() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function saveTips(tips) {
  localStorage.setItem(storageKey, JSON.stringify(tips));
}

function labelFor(tip) {
  if (tip.type === "Correction") return "Correction";
  if (tip.type === "Takedown Request") return "Escalate";
  if (tip.type === "Rumor") return "Allegedly";
  if (tip.type === "What People Are Mad About") return "Group Chat Says";
  return "Tip Line";
}

function nextStep(tip) {
  if (tip.type === "Correction" || tip.type === "Takedown Request") {
    return "Escalate to Kenny before publishing or changing anything.";
  }
  if (tip.sourceUrl) return "Open source link, capture note, assign reporter, draft with label.";
  return "Ask for receipts or treat only as community chatter.";
}

function renderTips() {
  const tips = loadTips();
  if (!tips.length) {
    tipList.innerHTML =
      '<div class="empty-state">No local tips yet. The neighborhood is briefly pretending to behave.</div>';
    return;
  }

  tipList.innerHTML = tips
    .map(
      (tip, index) => `
        <article class="tip-card">
          <div class="story-meta">
            <span class="pill hot">${escapeHtml(labelFor(tip))}</span>
            <span>${escapeHtml(tip.type)}</span>
            <span>${escapeHtml(tip.zone)}</span>
          </div>
          <h3>${escapeHtml(tip.subject)}</h3>
          <p>${escapeHtml(tip.details)}</p>
          <dl>
            <div><dt>Source</dt><dd>${tip.sourceUrl ? `<a href="${escapeHtml(tip.sourceUrl)}">${escapeHtml(tip.sourceUrl)}</a>` : "No link yet"}</dd></div>
            <div><dt>Contact</dt><dd>${escapeHtml(tip.contact || "Anonymous")}</dd></div>
            <div><dt>Next</dt><dd>${escapeHtml(nextStep(tip))}</dd></div>
          </dl>
          <button type="button" data-index="${index}">Remove</button>
        </article>
      `,
    )
    .join("");

  tipList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const next = loadTips();
      next.splice(Number(button.dataset.index), 1);
      saveTips(next);
      renderTips();
    });
  });
}

tipForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const tip = Object.fromEntries(new FormData(tipForm).entries());
  tip.id = `tip-${Date.now()}`;
  tip.createdAt = new Date().toISOString();
  const tips = loadTips();
  tips.unshift(tip);
  saveTips(tips);
  tipForm.reset();
  renderTips();
});

clearTipsButton.addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  renderTips();
});

renderTips();
