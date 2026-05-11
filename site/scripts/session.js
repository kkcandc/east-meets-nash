export const accountSessionKey = "east-meets-nash:account-session";
export const accountEmailKey = "east-meets-nash:account-email";

export function isLoggedIn() {
  return localStorage.getItem(accountSessionKey) === "true";
}

export function getAccountEmail() {
  return localStorage.getItem(accountEmailKey) || "";
}

export function setLoggedIn(active, email = "") {
  localStorage.setItem(accountSessionKey, active ? "true" : "false");
  if (email) localStorage.setItem(accountEmailKey, email);
  updateAccountButtons();
  window.dispatchEvent(new CustomEvent("east-meets-nash:session-change"));
}

export function updateAccountButtons(selector = "[data-account-button]") {
  document.querySelectorAll(selector).forEach((button) => {
    button.textContent = isLoggedIn() ? "Account" : "Login";
    button.setAttribute("aria-pressed", String(isLoggedIn()));
  });
}

export function bindAccountButtons(selector = "[data-account-button]") {
  document.querySelectorAll(selector).forEach((button) => {
    if (button.dataset.sessionBound === "true") return;
    button.dataset.sessionBound = "true";
    button.addEventListener("click", () => {
      if (isLoggedIn()) {
        window.location.href = "/feed.html";
        return;
      }
      setLoggedIn(true);
    });
  });
}

export function bindSignupForms(root = document) {
  root.querySelectorAll(".signup-form").forEach((form) => {
    if (form.dataset.sessionBound === "true") return;
    form.dataset.sessionBound = "true";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const button = form.querySelector('button[type="submit"]');
      const email = input?.value.trim();
      if (!email) return;

      setLoggedIn(true, email);
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
}
