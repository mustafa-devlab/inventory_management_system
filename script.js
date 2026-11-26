const STORAGE_KEY = "inventoryProducts";
const LOW_STOCK_LIMIT = 10;
const CURRENCY = "$";

const sampleProducts = [
  { id: "P001", name: "Notebook A4", category: "Stationery", quantity: 48, price: 2.5 },
  { id: "P002", name: "Blue Pen (Box of 12)", category: "Stationery", quantity: 8, price: 4.2 },
  { id: "P003", name: "Orange Juice 250ml", category: "Beverages", quantity: 30, price: 1.1 },
  { id: "P004", name: "Cheese Sandwich", category: "Food", quantity: 0, price: 2.75 },
  { id: "P005", name: "Whiteboard Marker", category: "Stationery", quantity: 22, price: 1.4 }
];

const $ = id => document.getElementById(id);
const [searchInput, categoryFilter, lowOnly] = ["search", "category-filter", "low-only"].map($);
const [idInput, nameInput, categoryInput, quantityInput, priceInput] =
  ["product-id", "product-name", "product-category", "product-quantity", "product-price"].map($);

let products = loadProducts();
let editingId = null;
let toastTimer;

function loadProducts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? sampleProducts;
  } catch {
    return [];
  }
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function findProduct(id) {
  return products.find(product => product.id === id);
}

function suggestNextId() {
  const numbers = products.map(product => parseInt(product.id.replace(/\D/g, ""), 10) || 0);
  return "P" + String(Math.max(0, ...numbers) + 1).padStart(3, "0");
}

function openForm(product) {
  const item = product || { id: suggestNextId(), name: "", category: "", quantity: "", price: "" };
  editingId = product ? product.id : null;

  $("form-error").hidden = true;
  $("dialog-title").textContent = product ? "Edit product" : "Add product";
  idInput.disabled = Boolean(product);
  idInput.value = item.id;
  nameInput.value = item.name;
  categoryInput.value = item.category;
  quantityInput.value = item.quantity;
  priceInput.value = item.price;
  $("product-dialog").showModal();
}

function validateForm() {
  const id = idInput.value.trim();
  const quantity = quantityInput.value;
  const price = priceInput.value;

  if (!id || !nameInput.value.trim() || !categoryInput.value.trim() || quantity === "" || price === "") {
    return "Please fill in all the fields.";
  }
  if (!Number.isInteger(Number(quantity)) || Number(quantity) < 0) {
    return "Quantity must be a whole number, 0 or more.";
  }
  if (Number(price) < 0) {
    return "Price cannot be negative.";
  }
  if (products.some(p => p.id.toLowerCase() === id.toLowerCase() && p.id !== editingId)) {
    return "That Product ID is already in use.";
  }
  return "";
}

function saveProductFromForm(event) {
  event.preventDefault();

  const message = validateForm();
  if (message) {
    $("form-error").textContent = message;
    $("form-error").hidden = false;
    return;
  }

  const product = {
    id: idInput.value.trim(),
    name: nameInput.value.trim(),
    category: categoryInput.value.trim(),
    quantity: Number(quantityInput.value),
    price: Number(priceInput.value)
  };

  if (editingId) {
    products[products.findIndex(item => item.id === editingId)] = product;
    showToast("Product updated");
  } else {
    products.push(product);
    showToast("Product added");
  }

  saveProducts();
  $("product-dialog").close();
  render();
}

function deleteProduct(id) {
  if (!confirm("Delete " + findProduct(id).name + "?")) {
    return;
  }
  products = products.filter(item => item.id !== id);
  saveProducts();
  render();
  showToast("Product deleted");
}

function changeQuantity(id, amount) {
  const product = findProduct(id);
  product.quantity = Math.max(0, product.quantity + amount);
  saveProducts();
  render();
}

function getStatus(product) {
  if (product.quantity === 0) {
    return "out";
  }
  return product.quantity <= LOW_STOCK_LIMIT ? "low" : "ok";
}

function getFilteredProducts() {
  const term = searchInput.value.trim().toLowerCase();

  return products.filter(product =>
    [product.name, product.id, product.category].some(text => text.toLowerCase().includes(term)) &&
    (categoryFilter.value === "" || product.category === categoryFilter.value) &&
    (!lowOnly.checked || getStatus(product) !== "ok")
  );
}

function formatMoney(amount) {
  return CURRENCY + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderTable(list) {
  const labels = { ok: "In stock", low: "Low stock", out: "Out of stock" };

  $("product-list").innerHTML = list.map(product => {
    const status = getStatus(product);
    const id = escapeHtml(product.id);
    return `
      <tr class="${status === "ok" ? "" : status}">
        <td>${id}</td>
        <td>${escapeHtml(product.name)}</td>
        <td>${escapeHtml(product.category)}</td>
        <td class="num">
          <span class="qty">
            <button class="icon-btn" data-action="minus" data-id="${id}" aria-label="Decrease quantity">-</button>
            ${product.quantity}
            <button class="icon-btn" data-action="plus" data-id="${id}" aria-label="Increase quantity">+</button>
          </span>
        </td>
        <td class="num">${formatMoney(product.price)}</td>
        <td class="num">${formatMoney(product.quantity * product.price)}</td>
        <td><span class="badge badge-${status}">${labels[status]}</span></td>
        <td class="row-actions">
          <button class="link-btn" data-action="edit" data-id="${id}">Edit</button>
          <button class="link-btn danger" data-action="delete" data-id="${id}">Delete</button>
        </td>
      </tr>`;
  }).join("");

  $("empty-message").hidden = list.length > 0;
  $("empty-message").textContent = products.length === 0
    ? "No products yet. Click Add product to create your first one."
    : "No products match your search or filters.";
}

function renderStats() {
  const totalValue = products.reduce((sum, product) => sum + product.quantity * product.price, 0);

  $("stat-products").textContent = products.length;
  $("stat-units").textContent = products.reduce((sum, product) => sum + product.quantity, 0);
  $("stat-value").textContent = formatMoney(totalValue);
  $("stat-low").textContent = products.filter(product => getStatus(product) !== "ok").length;
}

function renderCategories() {
  const selected = categoryFilter.value;
  const categories = [...new Set(products.map(product => product.category))].sort();

  categoryFilter.innerHTML = "<option value=''>All categories</option>" +
    categories.map(name => `<option>${escapeHtml(name)}</option>`).join("");
  categoryFilter.value = categories.includes(selected) ? selected : "";
  $("category-list").innerHTML = categories.map(name => `<option value="${escapeHtml(name)}">`).join("");
}

function render() {
  renderCategories();
  renderTable(getFilteredProducts());
  renderStats();
}

function showToast(message) {
  $("toast").textContent = message;
  $("toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").hidden = true, 2200);
}

$("add-btn").addEventListener("click", () => openForm(null));
$("cancel-btn").addEventListener("click", () => $("product-dialog").close());
$("product-form").addEventListener("submit", saveProductFromForm);
[searchInput, categoryFilter, lowOnly].forEach(control => control.addEventListener("input", render));

$("product-list").addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }
  const { action, id } = button.dataset;

  if (action === "edit") {
    openForm(findProduct(id));
  } else if (action === "delete") {
    deleteProduct(id);
  } else {
    changeQuantity(id, action === "plus" ? 1 : -1);
  }
});

render();
