const state = {
  products: [],
  selected: null,
  balance: 1850,
};

const productPicker = document.querySelector("#productPicker");
const selectedProductName = document.querySelector("#selectedProductName");
const checkoutForm = document.querySelector("#checkoutForm");
const receiptPreview = document.querySelector("#receiptPreview");
const checkoutBalance = document.querySelector("#checkoutBalance");
const mockConnect = document.querySelector("#mockConnect");

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

function renderProducts() {
  productPicker.innerHTML = "";
  state.products.forEach((product) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "product-option";
    if (state.selected?.id === product.id) button.classList.add("selected");
    button.innerHTML = `
      <span>${money(product.price)}</span>
      <strong>${escapeHtml(product.name)}</strong>
      <small>${escapeHtml(product.checkoutCopy)}</small>
    `;
    button.addEventListener("click", () => {
      state.selected = product;
      renderProducts();
      renderSelected();
    });
    productPicker.append(button);
  });
}

function renderSelected() {
  if (!state.selected) return;
  selectedProductName.textContent = `${state.selected.name} - ${money(state.selected.price)}`;
  renderReceipt();
}

function renderReceipt(formData = null) {
  const product = state.selected;
  if (!product) {
    receiptPreview.innerHTML = '<div class="empty-state">Pick a product to see the mock ATXP order.</div>';
    return;
  }

  const remaining = state.balance - product.price;
  const name = formData?.get("name") || "Your business";
  const headline = formData?.get("headline") || product.checkoutCopy;
  const url = formData?.get("url") || "No URL yet";
  const copy = formData?.get("copy") || "Creative copy will appear here.";
  const canBuy = remaining >= 0;

  receiptPreview.innerHTML = `
    <article class="${canBuy ? "" : "warning"}">
      <span>${canBuy ? "Ready" : "Top up needed"}</span>
      <h3>${escapeHtml(product.name)}</h3>
      <p><strong>${escapeHtml(name)}</strong></p>
      <p>${escapeHtml(headline)}</p>
      <p>${escapeHtml(copy)}</p>
      <dl>
        <div><dt>URL</dt><dd>${escapeHtml(url)}</dd></div>
        <div><dt>Price</dt><dd>${money(product.price)}</dd></div>
        <div><dt>Balance after</dt><dd>${money(remaining)}</dd></div>
        <div><dt>ATXP action</dt><dd>${canBuy ? "Charge balance and reserve inventory" : "Create top-up payment link"}</dd></div>
      </dl>
    </article>
  `;
}

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderReceipt(new FormData(checkoutForm));
});

mockConnect.addEventListener("click", () => {
  state.balance += 100;
  checkoutBalance.textContent = money(state.balance);
  renderReceipt(new FormData(checkoutForm));
});

async function loadData() {
  state.products = await fetch("/data/sponsor-products.json").then((res) => res.json());
  state.selected = state.products[0];
  checkoutBalance.textContent = money(state.balance);
  renderProducts();
  renderSelected();
}

loadData().catch((error) => {
  console.error(error);
  receiptPreview.innerHTML = '<div class="empty-state">Commerce data did not load.</div>';
});
