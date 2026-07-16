const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const seedData = {
  products: [
    { id: "P-1001", sku: "GLV-NIT-8", name: "Nitrile Work Gloves, Size 8", category: "Safety", price: 12.5, stock: 420 },
    { id: "P-1002", sku: "BRG-6205", name: "6205-2RS Ball Bearing", category: "Power Transmission", price: 7.85, stock: 178 },
    { id: "P-1003", sku: "HOSE-AIR-50", name: "50 ft Reinforced Air Hose", category: "Pneumatics", price: 64.25, stock: 39 },
    { id: "P-1004", sku: "ABS-PAD-M", name: "Medium Absorbent Pads, Case", category: "Maintenance", price: 89.0, stock: 22 },
    { id: "P-1005", sku: "CUT-WHL-045", name: "4.5 in Cut-Off Wheels, 25 Pack", category: "Abrasives", price: 31.75, stock: 88 },
  ],
  customers: [
    { id: "C-2101", name: "Baxter Machine Works", contact: "Mia Turner", email: "purchasing@baxtermw.example", phone: "216-555-0184", address: "1420 Foundry Park Dr", city: "Cleveland", state: "OH", zip: "44114", promoNumber: "AIS-10", purchaseOrder: "PO-77821", terms: "Net 30" },
    { id: "C-2102", name: "North Valley Fabrication", contact: "Evan Cho", email: "orders@nvfab.example", phone: "559-555-0138", address: "88 Industrial Loop", city: "Fresno", state: "CA", zip: "93725", promoNumber: "WELD-25", purchaseOrder: "PO-44018", terms: "Net 15" },
    { id: "C-2103", name: "Westshore Packaging", contact: "Renee Patel", email: "maintenance@westshorepkg.example", phone: "253-555-0197", address: "501 Harbor Way", city: "Tacoma", state: "WA", zip: "98421", promoNumber: "MRO-05", purchaseOrder: "PO-98204", terms: "Net 45" },
  ],
  orders: [
    {
      id: "SO-3001",
      customerId: "C-2101",
      rep: "Jordan Lee",
      date: "2026-06-10",
      accountNumber: "BAx-2101",
      accountStatus: "old",
      address: { address: "1420 Foundry Park Dr", city: "Cleveland", state: "OH", zip: "44114" },
      phone: "216-555-0184",
      status: "verified",
      notes: "Standing monthly replenishment.",
      items: [
        { productId: "P-1001", qty: 48, price: 12.5 },
        { productId: "P-1005", qty: 12, price: 31.75 },
      ],
      verification: {
        state: "verified",
        method: "Manual",
        summary: "Customer, pricing, and payment terms passed verification.",
        at: "2026-06-10 08:45",
      },
      messages: [
        { id: "MSG-1001", author: "Jordan Lee", role: "sales", text: "Monthly replenishment verified. Please confirm if we should release today.", at: "2026-06-10 08:50" },
        { id: "MSG-1002", author: "Main Admin", role: "admin", text: "Approved for release. Keep the PO attached to the order record.", at: "2026-06-10 09:05" },
      ],
    },
    {
      id: "SO-3002",
      customerId: "C-2103",
      rep: "Avery Brooks",
      date: "2026-06-10",
      accountNumber: "WSP-2103",
      accountStatus: "old",
      address: { address: "501 Harbor Way", city: "Tacoma", state: "WA", zip: "98421" },
      phone: "253-555-0197",
      status: "pending",
      notes: "Customer requested rush shipment.",
      items: [{ productId: "P-1003", qty: 44, price: 64.25 }],
      verification: null,
      messages: [],
    },
  ],
  settings: {
    assistantId: "",
    phoneNumberId: "",
  },
  users: [
    { username: "admin", password: "", role: "super_admin", name: "Main Admin" },
    { username: "credit", password: "", role: "credit", name: "Credit Dept." },
    { username: "shipping", password: "", role: "shipping", name: "Shipping" },
    { username: "jordan", password: "", role: "sales", name: "Jordan Lee" },
    { username: "avery", password: "", role: "sales", name: "Avery Brooks" },
  ],
};

let appVersion = "1.0.0";
let appConfig = {
  companyName: "Allied Industrial Supplies, Inc.",
  website: "Alliedsupplies.net",
  supportEmail: "",
  environmentName: "Production",
  apiBaseUrl: "",
  requireHttps: false,
};
let sharedDataAvailable = false;
let sharedDataSaving = false;
let sharedDataSaveQueued = false;
let lastSharedSyncAt = 0;
let state = loadState();
let currentUser = loadCurrentUser();
let view = "dashboard";
let editingOrderId = null;
let editingProductId = null;
let editingCustomerId = null;
let search = "";
let statusFilter = "all";
let deferredInstallPrompt = null;
let returnToOrderAfterCustomerSave = false;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  render();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  toast("Allied ERP installed.");
  render();
});

async function loadRuntimeFiles() {
  const loadJson = async (path) => {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  };
  const [config, version] = await Promise.all([loadJson("./config.json"), loadJson("./version.json")]);
  if (config) appConfig = { ...appConfig, ...config };
  if (version?.version) appVersion = version.version;
}

async function loadSharedState({ rerender = false } = {}) {
  try {
    const response = await fetch("./api/state", { cache: "no-store" });
    if (!response.ok) throw new Error(`Shared data returned ${response.status}`);
    const data = await response.json();
    sharedDataAvailable = true;
    if (data && data.orders && data.customers && data.products && data.users) {
      state = normalizeState({ ...structuredClone(seedData), ...data });
      localStorage.setItem("alliedErpState", JSON.stringify(state));
      currentUser = loadCurrentUser();
      lastSharedSyncAt = Date.now();
      if (rerender) render();
      return true;
    }
    await saveSharedState();
    return true;
  } catch {
    sharedDataAvailable = false;
    return false;
  }
}

async function saveSharedState() {
  if (sharedDataSaving) {
    sharedDataSaveQueued = true;
    return;
  }
  sharedDataSaving = true;
  try {
    const response = await fetch("./api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    sharedDataAvailable = response.ok;
    if (response.ok) {
      const result = await response.json().catch(() => ({}));
      if (result.state?.orders && result.state?.customers && result.state?.products && result.state?.users) {
        state = normalizeState({ ...structuredClone(seedData), ...result.state });
        localStorage.setItem("alliedErpState", JSON.stringify(state));
      }
      lastSharedSyncAt = Date.now();
    }
  } catch {
    sharedDataAvailable = false;
  } finally {
    sharedDataSaving = false;
    if (sharedDataSaveQueued) {
      sharedDataSaveQueued = false;
      saveSharedState();
    }
  }
}

function shouldRefreshSharedState() {
  return Boolean(currentUser) && sharedDataAvailable && !sharedDataSaving && !sharedDataSaveQueued && !document.querySelector(".modal-backdrop.open") && Date.now() - lastSharedSyncAt > 5000;
}

function loadState() {
  const saved = localStorage.getItem("alliedErpState");
  if (!saved) return normalizeState(structuredClone(seedData));
  try {
    const parsed = JSON.parse(saved);
    const merged = { ...structuredClone(seedData), ...parsed };
    if (!Array.isArray(merged.users) || !merged.users.length) merged.users = structuredClone(seedData.users);
    return normalizeState(merged);
  } catch {
    return normalizeState(structuredClone(seedData));
  }
}

function ensureStarterUsers(data) {
  if (!Array.isArray(data.users)) data.users = [];
  seedData.users.forEach((seedUser) => {
    const user = data.users.find((item) => item.username === seedUser.username);
    if (!user) {
      data.users.push({ ...seedUser });
      return;
    }
    user.role = seedUser.username === "admin" ? "super_admin" : user.role || seedUser.role;
    user.name = user.name || seedUser.name;
    if (!user.password && seedUser.password) user.password = seedUser.password;
  });
  return data;
}

function normalizeState(data) {
  ensureStarterUsers(data);
  data.settings = data.settings || {};
  delete data.settings.vapiApiKey;
  data.deletedCustomers = Array.isArray(data.deletedCustomers) ? data.deletedCustomers : [];
  data.deletedProducts = Array.isArray(data.deletedProducts) ? data.deletedProducts : [];
  data.deletedUsers = Array.isArray(data.deletedUsers) ? data.deletedUsers : [];
  data.deletedOrders = Array.isArray(data.deletedOrders) ? data.deletedOrders : [];
  data.users = (data.users || []).map((user) => (user.username === "admin" ? { ...user, role: "super_admin" } : user));
  data.users = data.users.filter((user) => !data.deletedUsers.includes(user.username) || user.role === "super_admin");
  data.customers = (data.customers || []).filter((customer) => !data.deletedCustomers.includes(customer.id));
  data.products = (data.products || []).filter((product) => !data.deletedProducts.includes(product.id));
  data.orders = (data.orders || []).filter((order) => !data.deletedOrders.includes(order.id)).map((order) => {
    const status = order.status || "pending";
    const at = order.statusChangedAt || order.verification?.at || order.date || "";
    const by = order.statusChangedBy || order.verification?.verifiedBy || "";
    return {
      ...order,
      status,
      statusChangedAt: at,
      statusChangedBy: by,
      statusHistory: Array.isArray(order.statusHistory) && order.statusHistory.length ? order.statusHistory : [{ status, label: statusLabel(status), at, by, notes: order.verification?.summary || "" }],
      creditHoldNotes: order.creditHoldNotes || order.verification?.creditHoldNotes || "",
      hiddenFor: Array.isArray(order.hiddenFor) ? order.hiddenFor : [],
    };
  });
  return data;
}

function rememberDeleted(type, id) {
  const key = `deleted${type}`;
  if (!Array.isArray(state[key])) state[key] = [];
  if (id && !state[key].includes(id)) state[key].push(id);
}

function saveState() {
  localStorage.setItem("alliedErpState", JSON.stringify(state));
  saveSharedState();
}

function loadCurrentUser() {
  const saved = localStorage.getItem("alliedErpUser");
  if (!saved) return null;
  try {
    const user = JSON.parse(saved);
    return state.users.find((item) => item.username === user.username) || null;
  } catch {
    return null;
  }
}

function saveCurrentUser(user) {
  currentUser = user;
  localStorage.setItem("alliedErpUser", JSON.stringify({ username: user.username }));
}

function isAdmin() {
  return currentUser?.role === "admin" || currentUser?.role === "super_admin";
}

function isSuperAdmin() {
  return currentUser?.role === "super_admin";
}

function isCredit() {
  return currentUser?.role === "credit";
}

function isShipping() {
  return currentUser?.role === "shipping";
}

function roleLabel(role = currentUser?.role) {
  const labels = { super_admin: "Super Admin", admin: "Admin", sales: "Sales", credit: "Credit Dept.", shipping: "Shipping" };
  return labels[role] || role || "";
}

function statusLabels() {
  return {
    pending: "Pending",
    pending_ap: "Pending AP",
    verification_in_progress: "Verification In Progress",
    verified: "Verified",
    issue: "Issue",
    credit_hold: "Credit Hold",
    kickback_pending: "Kickback Pending",
    partial_ship: "Partial Ship",
    sent_to_shipping: "Sent to Shipping",
    order_shipped: "Order Shipped",
    completed: "Completed",
    cancelled: "Cancelled",
  };
}

function statusLabel(status) {
  return statusLabels()[status] || status || "";
}

function visibleOrders() {
  const notHidden = (order) => !(order.hiddenFor || []).includes(currentUser?.username);
  if (isAdmin()) return state.orders.filter(notHidden);
  if (isCredit()) return state.orders.filter((order) => notHidden(order) && (["verified", "pending_ap", "credit_hold", "kickback_pending", "sent_to_shipping", "order_shipped", "completed"].includes(order.status) || (order.status === "cancelled" && orderHadAnyStatus(order, ["verified", "pending_ap", "credit_hold", "kickback_pending", "sent_to_shipping"]))));
  if (isShipping()) return state.orders.filter((order) => notHidden(order) && (["sent_to_shipping", "partial_ship", "order_shipped", "completed"].includes(order.status) || (order.status === "cancelled" && orderHadAnyStatus(order, ["sent_to_shipping", "partial_ship"]))));
  return state.orders.filter((order) => notHidden(order) && order.rep === currentUser?.name);
}

function visibleCustomers() {
  if (isAdmin() || isCredit() || isShipping()) return state.customers;
  const allowedIds = new Set(visibleOrders().map((order) => order.customerId));
  return state.customers.filter((customer) => allowedIds.has(customer.id) || customer.owner === currentUser?.name);
}

function canAccessCustomer(customerId) {
  return isAdmin() || isCredit() || isShipping() || visibleCustomers().some((customer) => customer.id === customerId);
}

function orderHadAnyStatus(order, statuses) {
  return (order.statusHistory || []).some((entry) => statuses.includes(entry.status));
}

function filteredOrders(orders) {
  if (statusFilter === "all") return orders;
  return orders.filter((order) => order.status === statusFilter);
}

function statusFilterControl() {
  const statuses = [["all", "All Statuses"], ...Object.entries(statusLabels())];
  return `<select class="status-filter" title="Filter by status" onchange="statusFilter=this.value;render()">${statuses.map(([value, label]) => `<option value="${value}" ${statusFilter === value ? "selected" : ""}>${label}</option>`).join("")}</select>`;
}

function uid(prefix, existing) {
  const nums = existing
    .map((item) => Number(String(item.id).replace(/\D/g, "")))
    .filter(Boolean);
  return `${prefix}-${Math.max(1000, ...nums) + 1}`;
}

function productById(id) {
  return state.products.find((product) => product.id === id);
}

function productOwner(product) {
  return product?.owner || "shared";
}

function canAccessProduct(product) {
  return !!product && (productOwner(product) === "shared" || productOwner(product) === currentUser?.username);
}

function visibleProducts() {
  return state.products.filter((product) => canAccessProduct(product));
}

function selectableProducts(selectedProductId = "") {
  const products = visibleProducts();
  const selected = productById(selectedProductId);
  if (selected && !products.some((product) => product.id === selected.id)) return [selected, ...products];
  return products;
}

function customerById(id) {
  return state.customers.find((customer) => customer.id === id);
}

function customerAddress(customer) {
  return {
    address: customer?.address || "",
    city: customer?.city || "",
    state: customer?.state || "",
    zip: customer?.zip || "",
  };
}

function orderBuyerName(order) {
  return order?.buyerName || customerById(order?.customerId)?.contact || "";
}

function orderPartLabel(order) {
  return order?.partNumber ? `Part ${html(order.partNumber)}` : "";
}

function orderAddress(order) {
  return order?.address || customerAddress(customerById(order?.customerId));
}

function orderPhone(order) {
  return order?.phone || customerById(order?.customerId)?.phone || "";
}

function orderCellPhone(order) {
  return order?.cellPhone || customerById(order?.customerId)?.cellPhone || "";
}

function preferredVerificationPhone(order) {
  const preferred = order?.preferredPhone || customerById(order?.customerId)?.preferredPhone || "phone";
  return preferred === "cell" ? orderCellPhone(order) || orderPhone(order) : orderPhone(order) || orderCellPhone(order);
}

function displayOrderNumber(order) {
  return order.creditOrderNumber || String(order.id || "").replace(/^SO-/, "");
}

function canPrintDownloadOrder(order) {
  return !!order && (isAdmin() || isCredit() || order.rep === currentUser?.name);
}

function canUseAssistantVerification(order = null) {
  if (isCredit() || isShipping()) return false;
  if (!order) return true;
  return (order.accountStatus || "old") === "old";
}

function canUseManualVerification(order) {
  return isAdmin() && !!order;
}

function accountStatusLabel(value = "old") {
  const labels = { new: "New", old: "Old", rehash: "Rehash" };
  return labels[value] || value || "";
}

function creditCardInfo(order) {
  const card = order?.creditCard;
  if (card && typeof card === "object") {
    return {
      name: card.name || "",
      number: card.number || (card.last4 ? `**** ${card.last4}` : ""),
      last4: card.last4 || String(card.number || "").replace(/\D/g, "").slice(-4),
      expiration: card.expiration || "",
      ccv: card.ccv || "",
      ccvReceived: Boolean(card.ccvReceived || card.ccv),
    };
  }
  const digits = String(card || "").replace(/\D/g, "");
  return {
    name: "",
    number: typeof card === "string" ? card : "",
    last4: digits.slice(-4),
    expiration: "",
    ccv: "",
    ccvReceived: false,
  };
}

function maskCardNumber(number) {
  const value = String(number || "").trim();
  if (!value) return "";
  const digits = value.replace(/\D/g, "");
  const last4 = digits.slice(-4) || value.slice(-4);
  return `Saved ending ${last4}`;
}

function collectCreditCardInfo() {
  const existing = state.orders.find((item) => item.id === document.querySelector("#orderId")?.value);
  const existingCard = creditCardInfo(existing);
  const number = document.querySelector("#cardNumber").value.trim();
  const digits = number.replace(/\D/g, "");
  return {
    name: document.querySelector("#cardName").value.trim(),
    last4: digits.slice(-4) || existingCard.last4 || "",
    expiration: document.querySelector("#cardExpiration").value.trim(),
    ccvReceived: Boolean(document.querySelector("#cardCcv").value.trim()) || existingCard.ccvReceived,
  };
}

function orderTotal(order) {
  return order.items.reduce((sum, item) => sum + Number(item.qty) * Number(item.price), 0);
}

function html(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setView(nextView) {
  view = nextView;
  search = "";
  editingOrderId = null;
  editingProductId = null;
  editingCustomerId = null;
  render();
}

function toast(message) {
  let node = document.querySelector(".toast");
  if (!node) {
    node = document.createElement("div");
    node.className = "toast";
    document.body.appendChild(node);
  }
  node.textContent = message;
  node.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => node.classList.remove("show"), 2600);
}

function renderLogin() {
  document.querySelector("#app").innerHTML = `
    <main class="login-screen">
      <section class="login-panel">
        <div class="brand login-brand">
          <img class="brand-logo" src="./allied-logo.jpg" alt="Allied Industrial Supplies logo" />
          <div>
            <div class="brand-name">Allied Industrial Supplies</div>
            <div class="brand-sub">ERP sign in</div>
          </div>
        </div>
        <form class="login-form" onsubmit="login(event)">
          <div class="field">
            <label for="loginUsername">Username</label>
            <input id="loginUsername" autocomplete="username" required />
          </div>
          <div class="field">
            <label for="loginPassword">Password</label>
            <input id="loginPassword" type="password" autocomplete="current-password" required />
          </div>
          <button class="btn primary" type="submit">→ Log In</button>
        </form>
        <div class="login-help">
          <span>Ask admin for forgot password</span>
          <button class="link-button" type="button" onclick="resetLoginCache()">Reset login cache</button>
        </div>
      </section>
    </main>
  `;
}

function resetLoginCache() {
  currentUser = null;
  state = normalizeState(structuredClone(seedData));
  localStorage.removeItem("alliedErpUser");
  localStorage.setItem("alliedErpState", JSON.stringify(state));
  sessionStorage.setItem("alliedErpSkipSharedStateOnce", "1");
  renderLogin();
  toast("Login cache reset. Try signing in again.");
}

async function serverLogin(username, password) {
  try {
    const response = await fetch("./api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.user || null;
  } catch {
    return null;
  }
}

function rememberServerUser(user) {
  if (!user?.username) return null;
  const existing = state.users.find((item) => item.username === user.username);
  const merged = {
    ...(existing || {}),
    ...user,
    password: existing?.password || "",
  };
  if (!merged.name) merged.name = user.username;
  if (!merged.role) merged.role = "sales";
  if (existing) Object.assign(existing, merged);
  else state.users.push(merged);
  localStorage.setItem("alliedErpState", JSON.stringify(state));
  return merged;
}

async function login(event) {
  event.preventDefault();
  const username = document.querySelector("#loginUsername").value.trim().toLowerCase();
  const password = document.querySelector("#loginPassword").value.trim();
  const submitButton = event.submitter;
  if (submitButton) submitButton.disabled = true;
  const serverUser = await serverLogin(username, password);
  const user = rememberServerUser(serverUser) || state.users.find((item) => item.username === username && item.password && item.password === password);
  if (submitButton) submitButton.disabled = false;
  if (!user) {
    toast("Login failed. Check the username and password.");
    return;
  }
  saveCurrentUser(user);
  view = "dashboard";
  search = "";
  render();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("alliedErpUser");
  view = "dashboard";
  render();
}

function render() {
  if (!currentUser) {
    renderLogin();
    return;
  }

  const titles = {
    dashboard: ["Operations Dashboard", "Sales activity, order risk, and inventory signals."],
    orders: ["Customer Orders", "Enter customer orders and submit them for assistant verification."],
    products: ["Products", "Maintain catalog products and pricing."],
    customers: ["Customers", "Manage customer contacts and payment terms."],
    users: ["Users", "Add sales reps and manage app logins."],
    settings: ["Assistant Verification", "Connect the ERP order workflow to an assistant."],
  };
  if (view === "users" && !isAdmin()) view = "dashboard";

  document.querySelector("#app").innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <img class="brand-logo" src="./allied-logo.jpg" alt="Allied Industrial Supplies logo" />
          <div>
            <div class="brand-name">${html(appConfig.companyName || "Allied Industrial Supplies")}</div>
            <div class="brand-sub">${html(appConfig.environmentName || "Internal ERP")} - v${html(appVersion)}</div>
          </div>
        </div>
        <nav class="nav" aria-label="Primary">
          ${navButton("dashboard", "⌂", "Dashboard")}
          ${navButton("orders", "▤", "Orders")}
          ${navButton("products", "◇", "Products")}
          ${navButton("customers", "◉", "Customers")}
          ${isAdmin() ? navButton("users", "♙", "Users") : ""}
          ${navButton("settings", "⚙", "Vapi")}
        </nav>
        <div class="sidebar-foot">Signed in as ${html(currentUser.name)}. ${html(roleLabel())} view is filtered to your workflow.</div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div>
            <h1 class="page-title">${titles[view][0]}</h1>
            <div class="page-subtitle">${titles[view][1]}</div>
          </div>
          <div class="top-actions">${topActions()}</div>
        </header>
        <section class="content">${renderView()}</section>
      </main>
    </div>
  `;
}

function navButton(target, icon, label) {
  const displayLabel = target === "settings" ? "Assistant" : label;
  return `<button class="${view === target ? "active" : ""}" onclick="setView('${target}')"><span class="ico">${icon}</span><span>${displayLabel}</span></button>`;
}

function topActions() {
  const install = deferredInstallPrompt ? `<button class="btn" onclick="installApp()">⬇ Install App</button>` : "";
  const notifications = notificationItems();
  const notificationButton = `<button class="icon-btn notification-btn" title="Notifications" onclick="openNotifications()">🔔${notifications.length ? `<span class="badge">${notifications.length}</span>` : ""}</button>`;
  const account = `${install}${notificationButton}<span class="user-pill">${html(currentUser.name)} · ${html(roleLabel())}</span><button class="btn" onclick="logout()">⇥ Log Out</button>`;
  if (view === "orders") return `<button class="btn primary" onclick="openOrderForm()">＋ New Order</button>${account}`;
  if (view === "products") return `<button class="btn primary" onclick="openProductForm()">＋ New Product</button>${account}`;
  if (view === "customers") return `<button class="btn primary" onclick="openCustomerForm()">＋ New Customer</button>${account}`;
  if (view === "users" && isAdmin()) return `<button class="btn primary" onclick="openUserForm()">＋ New User</button>${account}`;
  if (view === "dashboard") return `<button class="btn primary" onclick="setView('orders')">＋ Enter Order</button>${account}`;
  return `<button class="btn" onclick="resetDemoData()">↻ Reset Demo Data</button>${account}`;
}

function notificationItems() {
  const items = [];
  visibleOrders().forEach((order) => {
    const customer = customerById(order.customerId);
    (order.messages || [])
      .filter((message) => message.author !== currentUser.name)
      .slice(-2)
      .forEach((message) => {
        items.push({
          type: "chat",
          orderId: order.id,
          title: `${order.id} chat`,
          detail: `${message.author}: ${message.text}`,
          meta: `${customer?.name || "Unknown customer"} · ${message.at}`,
        });
      });
    if (order.status === "pending") {
      items.push({
        type: "pending",
        orderId: order.id,
        title: `${order.id} needs verification`,
        detail: `${customer?.name || "Unknown customer"} is waiting for order verification.`,
        meta: `${order.rep} · ${money.format(orderTotal(order))}`,
      });
    }
    if (order.status === "issue") {
      items.push({
        type: "issue",
        orderId: order.id,
        title: `${order.id} has a verification issue`,
        detail: order.verification?.summary || "Verification needs attention.",
        meta: `${customer?.name || "Unknown customer"} · ${order.verification?.at || ""}`,
      });
    }
  });
  return items.slice(-12).reverse();
}

function openNotifications() {
  const items = notificationItems();
  openModal(`
    <div class="modal-head"><h2>Notifications</h2><button class="icon-btn" title="Close" onclick="closeModal()">×</button></div>
    <div class="panel-body">
      <div class="notification-list">
        ${items.length ? items.map(notificationHtml).join("") : `<div class="empty">No notifications right now.</div>`}
      </div>
    </div>
  `);
}

function notificationHtml(item) {
  const action = item.type === "chat" ? `openOrderChat('${item.orderId}')` : `closeModal();setView('orders')`;
  return `<button class="notification-item" type="button" onclick="${action}">
    <span class="notification-icon">${item.type === "chat" ? "💬" : item.type === "issue" ? "!" : "✓"}</span>
    <span>
      <strong>${html(item.title)}</strong>
      <em>${html(item.detail)}</em>
      <small>${html(item.meta)}</small>
    </span>
  </button>`;
}

async function installApp() {
  if (!deferredInstallPrompt) {
    toast("Use your browser menu to install Allied ERP.");
    return;
  }
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  render();
  if (choice.outcome === "accepted") toast("Allied ERP installation started.");
}

function renderView() {
  if (view === "orders") return ordersView();
  if (view === "products") return productsView();
  if (view === "customers") return customersView();
  if (view === "users" && isAdmin()) return usersView();
  if (view === "settings") return settingsView();
  return dashboardView();
}

function dashboardView() {
  const orders = filteredOrders(visibleOrders());
  const openOrders = orders.filter((order) => !["verified", "cancelled", "order_shipped", "completed"].includes(order.status)).length;
  const revenue = orders.reduce((sum, order) => sum + orderTotal(order), 0);
  const verified = orders.filter((order) => order.status === "verified").length;
  const toShip = orders.filter((order) => ["sent_to_shipping", "partial_ship"].includes(order.status)).length;
  const shipped = orders.filter((order) => ["order_shipped", "completed"].includes(order.status)).length;
  const recent = [...orders].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);

  return `
    <div class="grid metrics">
      ${isShipping() ? `${metric("Orders to be Shipped", toShip, "Ready for shipping")}${metric("Orders Shipped", shipped, "Shipped or completed")}` : `${metric("Open Orders", openOrders, "Need verification or follow-up")}${metric("Order Value", money.format(revenue), "Across saved orders")}${metric("Follow Ups", orders.filter((order) => order.followUp?.date).length, "Scheduled order follow-ups")}${metric("Verified", verified, "Passed assistant verification")}`}
    </div>
    <div class="section split">
      <div class="panel">
        <div class="panel-head"><h2 class="panel-title">Recent Customer Orders</h2><div class="toolbar">${statusFilterControl()}<button class="btn" onclick="setView('orders')">View All</button></div></div>
        <div class="table-wrap">${ordersTable(recent)}</div>
      </div>
      ${isCredit() || isShipping() ? "" : `<div class="panel">
        <div class="panel-head"><h2 class="panel-title">Verification Queue</h2></div>
        <div class="panel-body">${verificationQueue()}</div>
      </div>`}
    </div>
  `;
}

function metric(label, value, note) {
  return `<article class="metric"><div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></article>`;
}

function verificationQueue() {
  const pending = filteredOrders(visibleOrders()).filter((order) => ["pending", "issue"].includes(order.status));
  if (!pending.length) return `<div class="empty">No orders are waiting for verification.</div>`;
  return `<div class="verification-log">${pending
    .map((order) => {
      const customer = customerById(order.customerId);
      return `<div class="log-item">
        <div class="log-top"><div class="log-title">${order.id}</div>${statusCell(order)}</div>
        <div class="log-copy">${html(customer?.name)} · ${money.format(orderTotal(order))}</div>
        <button class="btn warn" style="margin-top:10px" onclick="openVerificationOptions('${order.id}')">▶ Verify</button>
      </div>`;
    })
    .join("")}</div>`;
}

function ordersView() {
  const query = search.toLowerCase();
  const rows = filteredOrders(visibleOrders()).filter((order) => {
    const customer = customerById(order.customerId);
    return `${order.id} ${customer?.name} ${order.rep} ${order.status}`.toLowerCase().includes(query);
  });
  return `
    <div class="panel">
      <div class="panel-head">
        <h2 class="panel-title">Customer Order List</h2>
        <div class="toolbar">${statusFilterControl()}<button class="btn" onclick="toggleAll('.order-select', true)">Select All</button><button class="btn danger" onclick="deleteSelectedOrders()">Delete Selected</button><input class="search" placeholder="Search orders" value="${html(search)}" oninput="search=this.value;render()" /></div>
      </div>
      <div class="table-wrap">${ordersTable(rows, true)}</div>
    </div>
  `;
}

function ordersTable(orders, actions = false) {
  if (!orders.length) return `<div class="empty">No customer orders found.</div>`;
  return `<table>
    <thead><tr>${actions ? "<th></th>" : ""}<th>Order</th><th>Customer</th><th>Rep</th><th>Date</th><th>Total</th><th>Status</th>${actions ? "<th>Actions</th>" : ""}</tr></thead>
    <tbody>
      ${orders
        .map((order) => {
          const customer = customerById(order.customerId);
          const adminFollowUpNotes = isAdmin() && !actions && order.followUp?.notes ? `<div class="metric-note">Follow Up: ${html(order.followUp.notes)}</div>` : "";
          const customerCell = `${html(customer?.name || "Unknown customer")}${adminFollowUpNotes}`;
          return `<tr>
            ${actions ? `<td><input class="order-select" type="checkbox" value="${html(order.id)}" /></td>` : ""}
            <td><strong>${html(displayOrderNumber(order))}</strong><div class="metric-note">${orderPartLabel(order)}${order.notes ? ` ${html(order.notes)}` : ""}</div></td>
            <td>${customerCell}<div class="metric-note">${html(statusLabel(order.status))}${order.statusChangedAt ? ` · ${html(order.statusChangedAt)}` : ""}</div></td>
            <td>${html(order.rep)}</td>
            <td>${html(order.date)}</td>
            <td>${money.format(orderTotal(order))}</td>
            <td>${statusCell(order)}</td>
            ${actions ? `<td><div class="row-actions">
              <button class="icon-btn" title="Edit order" onclick="openOrderForm('${order.id}')">✎</button>
              <button class="icon-btn chat-icon" title="Order chat" onclick="openOrderChat('${order.id}')">💬${order.messages?.length ? `<span class="badge">${order.messages.length}</span>` : ""}</button>
              <button class="icon-btn" title="Verify order" onclick="openVerificationOptions('${order.id}')">▶</button>
              <button class="icon-btn danger-icon" title="Delete order" onclick="deleteOrder('${order.id}')">×</button>
              ${isAdmin() ? `<button class="icon-btn" title="Print sales order" onclick="printSalesOrder('${order.id}')">⎙</button>${order.verification ? `<button class="icon-btn" title="Print verification record" onclick="printVerificationRecord('${order.id}')">▣</button>` : `<button class="icon-btn disabled" title="Verification record available after verification or cancellation" disabled>▣</button>`}` : ""}
              ${order.status === "verified" ? `<button class="icon-btn" title="Download verified order" onclick="downloadOrder('${order.id}')">⇩</button><button class="icon-btn" title="Print verified order" onclick="printOrder('${order.id}')">⎙</button>${order.verification?.recordingUrl ? `<button class="icon-btn" title="Download verification MP3" onclick="downloadVerificationAudio('${order.id}')">♫</button>` : `<button class="icon-btn disabled" title="MP3 available when Vapi returns a recording" disabled>♫</button>`}` : `<button class="icon-btn disabled" title="Download available after verification" disabled>⇩</button><button class="icon-btn disabled" title="Print available after verification" disabled>⎙</button><button class="icon-btn disabled" title="MP3 available after Vapi recording" disabled>♫</button>`}
            </div></td>` : ""}
          </tr>`;
        })
        .join("")}
    </tbody>
  </table>`;
}

function statusBadge(status) {
  return `<span class="status ${status}">${statusLabel(status)}</span>`;
}

function kickbackLabel(order) {
  const status = order.verification?.kickbackStatus || order.kickbackStatus || "None";
  if (!status || status === "None") return "";
  return `<div class="metric-note">Kickback: ${html(status)}</div>`;
}

function statusChangedLabel(order) {
  const at = order.statusChangedAt || order.verification?.at || "";
  if (!at) return "";
  const by = order.statusChangedBy || order.verification?.verifiedBy || "";
  return `<div class="metric-note">Status changed: ${html(at)}${by ? ` by ${html(by)}` : ""}</div>`;
}

function recordStatusChange(order, status, notes = "") {
  const at = timestamp();
  order.status = status;
  order.statusChangedAt = at;
  order.statusChangedBy = currentUser?.name || "";
  if (!Array.isArray(order.statusHistory)) order.statusHistory = [];
  order.statusHistory.push({ status, label: statusLabel(status), at, by: order.statusChangedBy, notes });
}

function statusCell(order) {
  return `
    <div class="status-cell">
      ${statusBadge(order.status)}
      ${statusChangedLabel(order)}
      ${order.status === "verified" && order.verification?.verifiedBy ? `<div class="metric-note">Verified by ${html(order.verification.verifiedBy)}</div>` : ""}
      ${order.creditHoldNotes ? `<div class="metric-note">Credit Hold: ${html(order.creditHoldNotes)}</div>` : ""}
      ${isCredit() ? `<button class="btn mini-btn" type="button" onclick="assignCreditOrderNumber('${order.id}')">Assign #</button>` : ""}
      ${isCredit() ? `<button class="btn mini-btn" type="button" onclick="downloadOrder('${order.id}')">Download</button><button class="btn mini-btn" type="button" onclick="printSalesOrder('${order.id}')">Print</button>` : ""}
      ${isShipping() ? `<button class="btn mini-btn" type="button" onclick="printPackingList('${order.id}')">Packing List</button>` : ""}
      ${canChangeOrderStatus(order) ? orderStatusSelect(order) : ""}
    </div>
  `;
}

function statusOptionsForOrder(order) {
  if (isAdmin()) return [
    ["pending", "Pending"],
    ["pending_ap", "Pending AP"],
    ["verification_in_progress", "Verification In Progress"],
    ["verified", "Verified"],
    ["issue", "Issue"],
    ["credit_hold", "Credit Hold"],
    ["kickback_pending", "Kickback Pending"],
    ["sent_to_shipping", "Sent to Shipping"],
    ["order_shipped", "Order Shipped"],
    ["completed", "Completed"],
    ["cancelled", "Cancelled"],
  ];
  if (isCredit()) return [
    ["verified", "Verified"],
    ["pending_ap", "Pending AP"],
    ["credit_hold", "Credit Hold"],
    ["kickback_pending", "Kickback Pending"],
    ["sent_to_shipping", "Sent to Shipping"],
    ["completed", "Completed"],
    ["cancelled", "Cancelled"],
  ];
  if (isShipping()) return [
    ["sent_to_shipping", "Sent to Shipping"],
    ["partial_ship", "Partial Ship"],
    ["order_shipped", "Order Shipped"],
    ["completed", "Completed"],
    ["cancelled", "Cancelled"],
  ];
  return [];
}

function canChangeOrderStatus(order) {
  return isAdmin() || (isCredit() && canAccessOrder(order)) || (isShipping() && ["sent_to_shipping", "partial_ship", "order_shipped", "completed"].includes(order.status));
}

function orderStatusSelect(order) {
  const options = statusOptionsForOrder(order);
  return `<select class="status-control" title="Order status" onchange="changeOrderStatus('${order.id}', this.value)">${options.map(([value, label]) => `<option value="${value}" ${order.status === value ? "selected" : ""}>${label}</option>`).join("")}</select>`;
}

function dashboardKickbackSelect(order) {
  const value = order.verification?.kickbackStatus || order.kickbackStatus || "None";
  const options = ["None", "Pending"];
  return `<select class="status-control" title="Kickback status" onchange="saveDashboardKickbackStatus('${order.id}', this.value)">${options.map((status) => `<option value="${status}" ${status === value ? "selected" : ""}>Kickback: ${status}</option>`).join("")}</select>`;
}

function localDateKey() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function nextDailyOrderNumber(excludeOrderId = "") {
  const today = localDateKey();
  const used = new Set(
    state.orders
      .filter((order) => order.id !== excludeOrderId && order.creditOrderDate === today)
      .map((order) => Number(order.creditOrderNumber))
      .filter((number) => number >= 1 && number <= 10000000)
  );
  for (let number = 1; number <= 10000000; number += 1) {
    if (!used.has(number)) return number;
  }
  return null;
}

function assignCreditOrderNumber(orderId) {
  if (!isCredit()) return toast("Only Credit Dept. can assign order numbers.");
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return toast("Order was not found.");
  const today = localDateKey();
  const suggested = order.creditOrderDate === today && order.creditOrderNumber ? order.creditOrderNumber : nextDailyOrderNumber(order.id);
  if (!suggested) return toast("All daily order numbers from 1 to 10,000,000 are already assigned.");
  const value = prompt("Enter today's order number (1-10,000,000):", suggested);
  if (!value || !value.trim()) return;
  const number = Number(value.trim());
  if (!Number.isInteger(number) || number < 1 || number > 10000000) return toast("Order number must be between 1 and 10,000,000.");
  const duplicate = state.orders.find((item) => item.id !== order.id && item.creditOrderDate === today && Number(item.creditOrderNumber) === number);
  if (duplicate) return toast("That order number is already assigned today.");
  order.creditOrderNumber = String(number);
  order.creditOrderDate = today;
  saveState();
  render();
  toast(`Order number ${number} assigned.`);
}

function changeOrderStatus(orderId, status) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return toast("Sales order was not found.");
  if (status === "partial_ship" && !isShipping()) return toast("Only Shipping can mark an order Partial Ship.");
  if (!canChangeOrderStatus(order)) return toast("You cannot change this order status.");
  let notes = "";
  if (status === "credit_hold") {
    const entry = prompt("Enter credit hold notes:", order.creditHoldNotes || "");
    if (!entry || !entry.trim()) {
      render();
      toast("Credit hold notes are required.");
      return;
    }
    notes = entry.trim();
    order.creditHoldNotes = notes.trim();
  }
  if (["sent_to_shipping", "partial_ship", "order_shipped", "completed"].includes(status)) order.creditHoldNotes = "";
  recordStatusChange(order, status, notes);
  if (["verified", "verification_in_progress", "pending_ap", "issue", "cancelled", "credit_hold", "kickback_pending", "partial_ship", "sent_to_shipping", "order_shipped", "completed"].includes(status)) {
    order.verification = {
      ...(order.verification || {}),
      state: status,
      method: order.verification?.method || "Admin Status",
      summary: `Status manually changed to ${statusLabel(status)}.${notes ? ` Credit hold notes: ${notes}` : ""}`,
      at: order.statusChangedAt,
      verifiedBy: currentUser.name,
      creditHoldNotes: order.creditHoldNotes || "",
    };
  }
  statusFilter = "all";
  saveState();
  render();
  toast(`${order.id} status changed to ${statusLabel(status)}.`);
}

function saveDashboardKickbackStatus(orderId, status) {
  if (!isAdmin()) return toast("Only admins can change kickback status.");
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return toast("Sales order was not found.");
  order.kickbackStatus = status;
  if (order.verification) order.verification.kickbackStatus = status;
  saveState();
  render();
  toast(`Kickback status changed to ${status}.`);
}

function canAccessOrder(order) {
  return !!order && (isAdmin() || (isCredit() && visibleOrders().some((item) => item.id === order.id)) || (isShipping() && visibleOrders().some((item) => item.id === order.id)) || order.rep === currentUser?.name);
}

function openOrderChat(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!canAccessOrder(order)) {
    toast("You can only chat about orders you can access.");
    return;
  }
  const customer = customerById(order.customerId);
  const messages = order.messages || [];
  openModal(`
    <div class="modal-head"><h2>Order Chat · ${html(order.id)}</h2><button class="icon-btn" title="Close" onclick="closeModal()">×</button></div>
    <div class="panel-body">
      <div class="chat-context">
        <strong>${html(customer?.name || "Unknown customer")}</strong>
        <span>${html(order.rep)} · ${money.format(orderTotal(order))} · ${html(order.status)}</span>
      </div>
      <div class="chat-thread">
        ${messages.length ? messages.map(chatMessageHtml).join("") : `<div class="empty">No messages yet. Start the conversation about this order.</div>`}
      </div>
      <form class="chat-compose" onsubmit="sendOrderMessage(event, '${order.id}')">
        <textarea id="chatMessage" placeholder="Type a message about this customer order" required></textarea>
        <button class="btn primary" type="submit">Send</button>
      </form>
    </div>
  `);
}

function chatMessageHtml(message) {
  const own = message.author === currentUser?.name;
  return `<div class="chat-message ${own ? "own" : ""}">
    <div class="chat-meta"><strong>${html(message.author)}</strong><span>${html(message.role === "admin" ? "Admin" : "Sales")} · ${html(message.at)}</span></div>
    <div class="chat-bubble">${html(message.text)}</div>
  </div>`;
}

function sendOrderMessage(event, orderId) {
  event.preventDefault();
  const order = state.orders.find((item) => item.id === orderId);
  if (!canAccessOrder(order)) return toast("You can only chat about orders you can access.");
  const input = document.querySelector("#chatMessage");
  const text = input.value.trim();
  if (!text) return;
  if (!Array.isArray(order.messages)) order.messages = [];
  order.messages.push({
    id: uid("MSG", order.messages),
    author: currentUser.name,
    role: currentUser.role,
    text,
    at: timestamp(),
  });
  saveState();
  openOrderChat(orderId);
  toast("Message sent.");
}

function openVerificationOptions(orderId) {
  if (isCredit() || isShipping()) {
    toast("Assistant Verification is not available for Credit Dept. or Shipping.");
    return;
  }
  const order = state.orders.find((item) => item.id === orderId);
  if (!canAccessOrder(order)) {
    toast("You can only verify orders you can access.");
    return;
  }
  const customer = customerById(order.customerId);
  const manualAllowed = canUseManualVerification(order);
  const assistantAllowed = canUseAssistantVerification(order);
  openModal(`
    <div class="modal-head"><h2>Verify ${html(order.id)}</h2><button class="icon-btn" title="Close" onclick="closeModal()">×</button></div>
    <div class="panel-body">
      <div class="chat-context">
        <strong>${html(customer?.name || "Unknown customer")}</strong>
        <span>${html(order.rep)} · ${money.format(orderTotal(order))} · Current status: ${html(order.status)}</span>
      </div>
      <div class="verify-options">
        ${manualAllowed ? `<button class="verify-card" type="button" onclick="showManualVerification('${order.id}')">
          <strong>Manual Verification</strong>
          <span>Admin users can mark the order verified after review.</span>
        </button>` : `<button class="verify-card disabled-card" type="button" disabled>
          <strong>Manual Verification</strong>
          <span>Manual verification is available to admin users only.</span>
        </button>`}
        ${assistantAllowed ? `<button class="verify-card" type="button" onclick="verifyOrderWithVapi('${order.id}')">
          <strong>Assistant Verification</strong>
          <span>Assistant Verification is used for Old account types.</span>
        </button>` : `<button class="verify-card disabled-card" type="button" disabled>
          <strong>Assistant Verification</strong>
          <span>Assistant Verification is only for Old account types.</span>
        </button>`}
        <button class="verify-card cancel-card" type="button" onclick="showCancelVerification('${order.id}')">
          <strong>Customer Cancelled</strong>
          <span>Mark the order cancelled when the customer cancels during verification.</span>
        </button>
      </div>
    </div>
  `);
}

function verificationKickback() {
  return {
    kickbackStatus: document.querySelector("#kickbackStatus")?.value || "None",
    kickbackNotes: document.querySelector("#kickbackNotes")?.value.trim() || "",
  };
}

function captureKickback(order) {
  const kickback = verificationKickback();
  order._kickbackStatus = kickback.kickbackStatus;
  order._kickbackNotes = kickback.kickbackNotes;
  order.kickbackStatus = kickback.kickbackStatus;
  order.kickbackNotes = kickback.kickbackNotes;
  return kickback;
}

function orderKickback(order) {
  return {
    kickbackStatus: order._kickbackStatus || order.verification?.kickbackStatus || order.kickbackStatus || "None",
    kickbackNotes: order._kickbackNotes || order.verification?.kickbackNotes || order.kickbackNotes || "",
  };
}

function saveKickbackStatus(orderId) {
  if (!isAdmin()) return toast("Only admins can change kickback status.");
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return toast("Sales order was not found.");
  const kickback = verificationKickback();
  order.kickbackStatus = kickback.kickbackStatus;
  order.kickbackNotes = kickback.kickbackNotes;
  if (order.verification) {
    order.verification = {
      ...order.verification,
      kickbackStatus: kickback.kickbackStatus,
      kickbackNotes: kickback.kickbackNotes,
    };
  }
  saveState();
  toast(`Kickback status changed to ${kickback.kickbackStatus}.`);
}

function showCancelVerification(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!canAccessOrder(order)) return toast("You can only update orders you can access.");
  captureKickback(order);
  openModal(`
    <div class="modal-head"><h2>Cancel Order · ${html(order.id)}</h2><button class="icon-btn" title="Close" onclick="closeModal()">×</button></div>
    <form onsubmit="cancelOrderVerification(event, '${order.id}')">
      <div class="panel-body form-grid">
        <div class="field full">
          <label>Cancellation Reason</label>
          <textarea id="cancelVerificationReason" required placeholder="Example: Customer cancelled the order during verification call."></textarea>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn" type="button" onclick="openVerificationOptions('${order.id}')">Back</button>
        <button class="btn danger" type="submit">Cancel Order</button>
      </div>
    </form>
  `);
}

function filterOrderCustomerOptions(selectedCustomerId = "") {
  if (isAdmin() || isCredit() || isShipping()) return;
  const select = document.querySelector("#orderCustomer");
  if (!select) return;
  const allowedIds = new Set(visibleCustomers().map((customer) => customer.id));
  [...select.options].forEach((option) => {
    if (option.value !== "__add_new__" && option.value !== selectedCustomerId && !allowedIds.has(option.value)) option.remove();
  });
}

function cancelOrderVerification(event, orderId) {
  event.preventDefault();
  const order = state.orders.find((item) => item.id === orderId);
  if (!canAccessOrder(order)) return toast("You can only update orders you can access.");
  const reason = document.querySelector("#cancelVerificationReason").value.trim();
  const kickback = orderKickback(order);
  recordStatusChange(order, "cancelled", reason);
  order.verification = {
    state: "cancelled",
    method: "Customer Cancellation",
    summary: reason,
    at: order.statusChangedAt,
    verifiedBy: currentUser.name,
    recordingUrl: order.verification?.recordingUrl || "",
    ...kickback,
  };
  saveState();
  closeModal();
  render();
  toast(`${order.id} marked cancelled.`);
}

function showManualVerification(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!canAccessOrder(order)) return toast("You can only verify orders you can access.");
  if (!canUseManualVerification(order)) return toast("Manual verification is available to admin users only.");
  captureKickback(order);
  openModal(`
    <div class="modal-head"><h2>Manual Verification · ${html(order.id)}</h2><button class="icon-btn" title="Close" onclick="closeModal()">×</button></div>
    <form onsubmit="manualVerifyOrder(event, '${order.id}')">
      <div class="panel-body form-grid">
        <div class="field full">
          <label>Verification Notes</label>
          <textarea id="manualVerificationNotes" placeholder="Example: Customer PO reviewed, pricing checked, approved to release."></textarea>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn" type="button" onclick="openVerificationOptions('${order.id}')">Back</button>
        <button class="btn primary" type="submit">✓ Mark Verified</button>
      </div>
    </form>
  `);
}

function manualVerifyOrder(event, orderId) {
  event.preventDefault();
  const order = state.orders.find((item) => item.id === orderId);
  if (!canAccessOrder(order)) return toast("You can only verify orders you can access.");
  if (!canUseManualVerification(order)) return toast("Manual verification is available to admin users only.");
  const notes = document.querySelector("#manualVerificationNotes").value.trim();
  const kickback = orderKickback(order);
  recordStatusChange(order, "verified", notes);
  order.verification = {
    state: "verified",
    method: "Manual",
    summary: notes,
    at: order.statusChangedAt,
    verifiedBy: currentUser.name,
    recordingUrl: "",
    ...kickback,
  };
  saveState();
  closeModal();
  render();
  toast(`${order.id} manually verified.`);
}

function ensureVerifiedOrder(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) {
    toast("Sales order was not found.");
    return null;
  }
  if (!canPrintDownloadOrder(order)) {
    toast("You can only access orders available to your role.");
    return null;
  }
  if (!isAdmin() && !isCredit() && order.status !== "verified") {
    toast("Download and print are available after verification is completed.");
    return null;
  }
  return order;
}

function orderDocumentHtml(order) {
  const customer = customerById(order.customerId) || {};
  const address = orderAddress(order);
  const phone = orderPhone(order);
  const followUp = order.followUp || {};
  const card = creditCardInfo(order);
  const maskedCard = card.last4 ? `Saved ending ${card.last4}` : maskCardNumber(card.number);
  const promo = order.promoTicket || {};
  const lines = order.items
    .map((item) => {
      const product = productById(item.productId) || {};
      const lineTotal = Number(item.qty) * Number(item.price);
      return `<tr>
        <td>${html(product.sku || "")}</td>
        <td>${html(product.name || "")}</td>
        <td>${html(item.qty)}</td>
        <td>${money.format(Number(item.price))}</td>
        <td>${money.format(lineTotal)}</td>
      </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${html(order.id)} - Allied Customer Order</title>
    <style>
      body { margin: 0; color: #17212b; font-family: Arial, Helvetica, sans-serif; background: #fff; }
      .doc { max-width: 900px; margin: 0 auto; padding: 36px; }
      .head { display: flex; justify-content: space-between; gap: 24px; border-bottom: 2px solid #17212b; padding-bottom: 18px; }
      .brand { font-size: 22px; font-weight: 800; }
      .muted { color: #5b6673; font-size: 13px; line-height: 1.5; }
      h1 { margin: 18px 0 6px; font-size: 24px; }
      .part-label { font-weight: 800; font-size: 14px; margin-bottom: 6px; }
      h2 { margin: 0 0 8px; font-size: 15px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 22px 0; }
      .box { border: 1px solid #d8dee6; border-radius: 8px; padding: 14px; }
      .row { display: flex; justify-content: space-between; gap: 12px; margin: 5px 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 18px; }
      th, td { border-bottom: 1px solid #d8dee6; padding: 10px; text-align: left; font-size: 13px; }
      th { background: #f4f6f8; color: #5b6673; text-transform: uppercase; font-size: 11px; }
      .total { display: flex; justify-content: flex-end; margin-top: 14px; font-size: 18px; font-weight: 800; }
      .verified { display: inline-block; margin-top: 14px; padding: 6px 10px; border-radius: 999px; background: #ddf3e2; color: #137333; font-weight: 800; font-size: 12px; }
      .promo-sheet { break-before: page; page-break-before: always; }
      .print-actions { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 14px; }
      button { min-height: 38px; border: 1px solid #d8dee6; border-radius: 6px; background: #176f73; color: #fff; padding: 8px 12px; cursor: pointer; }
      @media print { .print-actions { display: none; } .doc { padding: 0; } }
    </style>
  </head>
  <body>
    <main class="doc">
      <div class="print-actions"><button onclick="window.print()">Print</button></div>
      <section class="head">
        <div>
          <div class="brand">Allied Industrial Supplies, Inc.</div>
          <div class="muted">Internal ERP customer order record</div>
        </div>
        <div>
          <h1>${html(displayOrderNumber(order))}</h1>
          ${order.partNumber ? `<div class="part-label">${orderPartLabel(order)}</div>` : ""}
          <div class="muted">Order Date: ${html(order.date)}</div>
          <div class="muted">Sales Rep: ${html(order.rep)}</div>
          <span class="verified">${html(statusLabel(order.status))}</span>
          <div class="muted">Status Changed: ${html(order.statusChangedAt || order.verification?.at || "")}</div>
        </div>
      </section>
      <section class="grid">
        <div class="box">
          <h2>Customer</h2>
          <strong>${html(customer.name || "")}</strong>
          <div class="muted">${html(customer.contact || "")}</div>
          <div class="muted">Buyer: ${html(orderBuyerName(order))}</div>
          <div class="muted">${html(customer.email || "")}</div>
          <div class="muted">${html(phone)}</div>
          <div class="muted">${html(address.address)}</div>
          <div class="muted">${html(address.city)} ${html(address.state)} ${html(address.zip)}</div>
        </div>
        <div class="box">
          <h2>Order Details</h2>
          <div class="row"><span>Account Number</span><strong>${html(order.accountNumber || "")}</strong></div>
          <div class="row"><span>Account Type</span><strong>${html(accountStatusLabel(order.accountStatus || "old"))}</strong></div>
          <div class="row"><span>Ship Date</span><strong>${html(order.shipDate || "")}</strong></div>
          <div class="row"><span>Tracking</span><strong>${html(order.trackingInfo || "")}</strong></div>
          <div class="row"><span>Purchase Order</span><strong>${html(customer.purchaseOrder || "")}</strong></div>
          <div class="row"><span>Promo Number</span><strong>${html(customer.promoNumber || "")}</strong></div>
          <div class="row"><span>Terms</span><strong>${html(customer.terms || "")}</strong></div>
          <div class="row"><span>Bill To</span><strong>${html(order.billTo || "")}</strong></div>
          <div class="row"><span>Name on Card</span><strong>${html(card.name)}</strong></div>
          <div class="row"><span>Card #</span><strong>${html(maskedCard)}</strong></div>
          <div class="row"><span>Expiration</span><strong>${html(card.expiration)}</strong></div>
          <div class="row"><span>CCV #</span><strong>${html(card.ccvReceived ? "Received" : "")}</strong></div>
          <div class="row"><span>Follow Up</span><strong>${html([followUp.date, followUp.time].filter(Boolean).join(" "))}</strong></div>
          <div class="row"><span>Verification Method</span><strong>${html(order.verification?.method || "Not completed")}</strong></div>
          <div class="row"><span>Verified By</span><strong>${html(order.verification?.verifiedBy || "")}</strong></div>
          <div class="row"><span>Verified At</span><strong>${html(order.verification?.at || "")}</strong></div>
          <div class="row"><span>Status Changed</span><strong>${html(order.statusChangedAt || order.verification?.at || "")}</strong></div>
          <div class="row"><span>Status Changed By</span><strong>${html(order.statusChangedBy || order.verification?.verifiedBy || "")}</strong></div>
        </div>
      </section>
      <table>
        <thead><tr><th>SKU</th><th>Product</th><th>Qty</th><th>Unit Price</th><th>Line Total</th></tr></thead>
        <tbody>${lines}</tbody>
      </table>
      <div class="total">Total: ${money.format(orderTotal(order))}</div>
      <section class="box" style="margin-top: 20px;">
        <h2>Verification Summary</h2>
        <div class="muted">${html(order.verification?.summary || "Order verification has not been completed.")}</div>
      </section>
      ${order.creditHoldNotes || order.verification?.creditHoldNotes ? `<section class="box" style="margin-top: 14px;"><h2>Credit Hold Notes</h2><div class="muted">${html(order.creditHoldNotes || order.verification?.creditHoldNotes)}</div></section>` : ""}
      ${followUp.notes ? `<section class="box" style="margin-top: 14px;"><h2>Follow Up Notes</h2><div class="muted">${html(followUp.notes)}</div></section>` : ""}
      ${order.notes ? `<section class="box" style="margin-top: 14px;"><h2>Notes</h2><div class="muted">${html(order.notes)}</div></section>` : ""}
      ${promo.enabled ? `<section class="box promo-sheet" style="margin-top: 22px;">
        <h2>Promo Ticket</h2>
        <div class="row"><span>Company Name</span><strong>${html(promo.companyName || "")}</strong></div>
        <div class="row"><span>Account #</span><strong>${html(promo.accountNumber || "")}</strong></div>
        <div class="row"><span>Rep #</span><strong>${html(promo.repNumber || "")}</strong></div>
        <div class="row"><span>Promo #</span><strong>${html(promo.promoNumber || "")}</strong></div>
        <div class="row"><span>Name</span><strong>${html(promo.name || "")}</strong></div>
        <div class="row"><span>Address</span><strong>${html(promo.address || "")}</strong></div>
        <div class="row"><span>City/State/Zip</span><strong>${html([promo.city, promo.state, promo.zip].filter(Boolean).join(" "))}</strong></div>
        <div class="row"><span>Type</span><strong>${html(promo.locationType || "")}</strong></div>
        ${promo.notes ? `<div class="row"><span>Notes</span><strong>${html(promo.notes)}</strong></div>` : ""}
      </section>` : ""}
    </main>
  </body>
</html>`;
}

function downloadOrder(orderId) {
  const order = ensureVerifiedOrder(orderId);
  if (!order) return;
  const blob = new Blob([orderDocumentHtml(order)], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${order.id}-verified-sales-order.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`${order.id} downloaded.`);
}

function printOrder(orderId) {
  const order = ensureVerifiedOrder(orderId);
  if (!order) return;
  printHtml(orderDocumentHtml(order), "Allow popups to print the verified order.");
}

function printSalesOrder(orderId) {
  if (!isAdmin() && !isCredit()) return toast("Only admins and Credit Dept. can print orders from this action.");
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return toast("Sales order was not found.");
  if (!canAccessOrder(order)) return toast("You can only print orders available to your role.");
  printHtml(orderDocumentHtml(order), "Allow popups to print the customer order.");
}

function packingListHtml(order) {
  const customer = customerById(order.customerId) || {};
  const address = orderAddress(order);
  const lines = order.items.map((item) => {
    const product = productById(item.productId) || {};
    return `<tr><td>${html(product.sku || "")}</td><td>${html(product.name || "")}</td><td>${html(item.qty)}</td><td></td><td></td></tr>`;
  }).join("");
  return `<!doctype html><html><head><meta charset="UTF-8" /><title>${html(displayOrderNumber(order))} - Packing List</title><style>body{font-family:Arial,sans-serif;color:#17212b}.doc{max-width:850px;margin:0 auto;padding:32px}.head{display:flex;justify-content:space-between;border-bottom:2px solid #17212b;padding-bottom:14px}.muted{color:#5b6673;font-size:13px;line-height:1.5}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{border-bottom:1px solid #d8dee6;padding:10px;text-align:left}th{background:#f4f6f8}.box{border:1px solid #d8dee6;border-radius:8px;padding:14px;margin-top:18px}.footer{border-top:1px solid #d8dee6;margin-top:24px;padding-top:14px;text-align:center;font-size:12px;color:#5b6673}.print-actions{text-align:right;margin-bottom:12px}button{background:#176f73;color:#fff;border:0;border-radius:6px;padding:8px 12px}@media print{.print-actions{display:none}.doc{padding:0}}</style></head><body><main class="doc"><div class="print-actions"><button onclick="window.print()">Print</button></div><section class="head"><div><h1>Packing List</h1><div class="muted">Allied Industrial Supplies, Inc.</div><div class="muted">Alliedsupplies.net</div></div><div><strong>Order # ${html(displayOrderNumber(order))}</strong>${order.partNumber ? `<div class="muted">${orderPartLabel(order)}</div>` : ""}<div class="muted">Ship Date: ${html(order.shipDate || "")}</div><div class="muted">Tracking: ${html(order.trackingInfo || "")}</div></div></section><section class="box"><strong>${html(customer.name || "")}</strong><div class="muted">${html(address.address)}</div><div class="muted">${html(address.city)} ${html(address.state)} ${html(address.zip)}</div></section><table><thead><tr><th>SKU</th><th>Product</th><th>Qty Ordered</th><th>Qty Packed</th><th>Back Ordered</th></tr></thead><tbody>${lines}</tbody></table><section class="box"><div>Picked By: ____________________</div><br><div>Checked By: ____________________</div></section><footer class="footer"><strong>Alliedsupplies.net</strong><br>No Returns without prior Authorization</footer></main></body></html>`;
}

function printPackingList(orderId) {
  if (!isShipping()) return toast("Only Shipping can print packing lists.");
  const order = state.orders.find((item) => item.id === orderId);
  if (!canAccessOrder(order)) return toast("You can only print packing lists for orders available to your role.");
  printHtml(packingListHtml(order), "Allow popups to print the packing list.");
}

function verificationRecordHtml(order) {
  const customer = customerById(order.customerId) || {};
  const followUp = order.followUp || {};
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${html(order.id)} - Verification Record</title>
    <style>
      body { margin: 0; color: #17212b; font-family: Arial, Helvetica, sans-serif; background: #fff; }
      .doc { max-width: 760px; margin: 0 auto; padding: 36px; }
      .head { border-bottom: 2px solid #17212b; padding-bottom: 16px; margin-bottom: 18px; }
      h1 { margin: 0 0 6px; font-size: 24px; }
      h2 { margin: 20px 0 8px; font-size: 15px; }
      .muted { color: #5b6673; font-size: 13px; line-height: 1.5; }
      .box { border: 1px solid #d8dee6; border-radius: 8px; padding: 14px; margin-top: 14px; }
      .row { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px solid #eef2f5; }
      .row:last-child { border-bottom: 0; }
      .print-actions { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 14px; }
      button { min-height: 38px; border: 1px solid #d8dee6; border-radius: 6px; background: #176f73; color: #fff; padding: 8px 12px; cursor: pointer; }
      @media print { .print-actions { display: none; } .doc { padding: 0; } }
    </style>
  </head>
  <body>
    <main class="doc">
      <div class="print-actions"><button onclick="window.print()">Print</button></div>
      <section class="head">
        <h1>Verification Record</h1>
        <div class="muted">Allied Industrial Supplies, Inc.</div>
      </section>
      <section class="box">
        <div class="row"><span>Order</span><strong>${html(displayOrderNumber(order))}</strong></div>
        <div class="row"><span>Customer</span><strong>${html(customer.name || "Unknown customer")}</strong></div>
        <div class="row"><span>Sales Rep</span><strong>${html(order.rep)}</strong></div>
        <div class="row"><span>Status</span><strong>${html(statusLabel(order.status))}</strong></div>
        <div class="row"><span>Method</span><strong>${html(order.verification?.method || "")}</strong></div>
        <div class="row"><span>Recorded By</span><strong>${html(order.verification?.verifiedBy || "")}</strong></div>
        <div class="row"><span>Recorded At</span><strong>${html(order.verification?.at || "")}</strong></div>
        <div class="row"><span>Status Changed</span><strong>${html(order.statusChangedAt || order.verification?.at || "")}</strong></div>
        <div class="row"><span>Status Changed By</span><strong>${html(order.statusChangedBy || order.verification?.verifiedBy || "")}</strong></div>
        <div class="row"><span>Follow Up</span><strong>${html([followUp.date, followUp.time].filter(Boolean).join(" "))}</strong></div>
      </section>
      <section class="box">
        <h2>Verification Notes</h2>
        <div class="muted">${html(order.verification?.summary || "No verification notes recorded.")}</div>
      </section>
      ${order.verification?.kickbackNotes || order.kickbackNotes ? `<section class="box"><h2>Kickback Notes</h2><div class="muted">${html(order.verification?.kickbackNotes || order.kickbackNotes)}</div></section>` : ""}
      ${order.creditHoldNotes || order.verification?.creditHoldNotes ? `<section class="box"><h2>Credit Hold Notes</h2><div class="muted">${html(order.creditHoldNotes || order.verification?.creditHoldNotes)}</div></section>` : ""}
      ${followUp.notes ? `<section class="box"><h2>Follow Up Notes</h2><div class="muted">${html(followUp.notes)}</div></section>` : ""}
    </main>
  </body>
</html>`;
}

function printVerificationRecord(orderId) {
  if (!isAdmin()) return toast("Only admins can print verification records.");
  const order = state.orders.find((item) => item.id === orderId);
  if (!order?.verification) return toast("No verification record is available for this order.");
  printHtml(verificationRecordHtml(order), "Allow popups to print the verification record.");
}

function printHtml(markup, popupMessage) {
  const printWindow = window.open("", "_blank", "width=960,height=720");
  if (!printWindow) {
    toast(popupMessage);
    return;
  }
  printWindow.document.open();
  printWindow.document.write(markup);
  printWindow.document.close();
  printWindow.focus();
  printWindow.setTimeout(() => printWindow.print(), 250);
}

async function downloadVerificationAudio(orderId) {
  const order = ensureVerifiedOrder(orderId);
  if (!order) return;
  const recordingUrl = order.verification?.recordingUrl;
  if (!recordingUrl) {
    toast("No Vapi MP3 recording is attached to this verification.");
    return;
  }
  try {
    const response = await fetch(recordingUrl);
    if (!response.ok) throw new Error("Recording download failed.");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${order.id}-verification.mp3`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`${order.id} verification MP3 downloaded.`);
  } catch {
    const link = document.createElement("a");
    link.href = recordingUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.download = `${order.id}-verification.mp3`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Opened the Vapi recording link.");
  }
}

function productsView() {
  const query = search.toLowerCase();
  const rows = visibleProducts().filter((product) => `${product.sku} ${product.name} ${product.category}`.toLowerCase().includes(query));
  return `
    <div class="panel">
      <div class="panel-head">
        <h2 class="panel-title">Product Catalog</h2>
        <div class="toolbar"><input class="search" placeholder="Search products" value="${html(search)}" oninput="search=this.value;render()" /></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Unit Price</th><th>Actions</th></tr></thead>
          <tbody>${rows
            .map(
              (product) => `<tr>
                <td><strong>${html(product.sku)}</strong></td>
                <td>${html(product.name)}</td>
                <td>${html(product.category)}</td>
                <td>${money.format(Number(product.price))}</td>
                <td><div class="row-actions"><button class="icon-btn" title="Edit product" onclick="openProductForm('${product.id}')">✎</button><button class="icon-btn danger-icon" title="Delete product" onclick="deleteProduct('${product.id}')">×</button></div></td>
              </tr>`
            )
            .join("")}</tbody>
        </table>
      </div>
    </div>
  `;
}

function customersView() {
  const query = search.toLowerCase();
  const rows = visibleCustomers().filter((customer) =>
    `${customer.name} ${customer.contact} ${customer.email} ${customer.phone} ${customer.address} ${customer.city} ${customer.state} ${customer.zip} ${customer.promoNumber} ${customer.purchaseOrder} ${customer.terms}`.toLowerCase().includes(query)
  );
  return `
    <div class="panel">
      <div class="panel-head">
        <h2 class="panel-title">Customer Accounts</h2>
        <div class="toolbar"><button class="btn" onclick="toggleAll('.customer-select', true)">Select All</button><button class="btn danger" onclick="deleteSelectedCustomers()">Delete Selected</button><input class="search" placeholder="Search customers" value="${html(search)}" oninput="search=this.value;render()" /></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th></th><th>Customer</th><th>Contact</th><th>Address</th><th>Promo #</th><th>Purchase Order</th><th>Terms</th><th>Actions</th></tr></thead>
          <tbody>${rows
            .map(
              (customer) => `<tr>
                <td><input class="customer-select" type="checkbox" value="${html(customer.id)}" /></td>
                <td><strong>${html(customer.name)}</strong></td>
                <td>${html(customer.contact)}<div class="metric-note">${html(customer.email)}</div><div class="metric-note">${html(customer.phone || "")}</div><div class="metric-note">${html(customer.cellPhone || "")}</div></td>
                <td>${html(customer.address)}<div class="metric-note">${html(customer.city)} ${html(customer.state || "")} ${html(customer.zip)}</div></td>
                <td>${html(customer.promoNumber || "")}</td>
                <td>${html(customer.purchaseOrder || "")}</td>
                <td>${html(customer.terms)}</td>
                <td><div class="row-actions"><button class="icon-btn" title="Edit customer" onclick="openCustomerForm('${customer.id}')">✎</button><button class="icon-btn danger-icon" title="Delete customer" onclick="deleteCustomer('${customer.id}')">×</button></div></td>
              </tr>`
            )
            .join("")}</tbody>
        </table>
      </div>
    </div>
  `;
}

function usersView() {
  const query = search.toLowerCase();
  const rows = state.users.filter((user) => `${user.name} ${user.username} ${user.role}`.toLowerCase().includes(query));
  const passwordCell = (user) => {
    if (isSuperAdmin()) return user.password ? html(user.password) : "<span class=\"metric-note\">No password set</span>";
    return user.role === "super_admin" ? "Protected" : "Hidden";
  };
  return `
    <div class="panel">
      <div class="panel-head">
        <h2 class="panel-title">App Users</h2>
        <div class="toolbar"><input class="search" placeholder="Search users" value="${html(search)}" oninput="search=this.value;render()" /></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Password</th><th>Actions</th></tr></thead>
          <tbody>${rows
            .map(
              (user) => `<tr>
                <td><strong>${html(user.name)}</strong></td>
                <td>${html(user.username)}</td>
                <td>${html(roleLabel(user.role))}</td>
                <td>${passwordCell(user)}</td>
                <td><button class="icon-btn" title="Edit user" onclick="openUserForm('${user.username}')">✎</button></td>
              </tr>`
            )
            .join("")}</tbody>
        </table>
      </div>
    </div>
  `;
}

function settingsView() {
  return `
    <div class="split">
      <div class="panel">
        <div class="panel-head"><h2 class="panel-title">Assistant Connection</h2></div>
        <div class="panel-body form-grid">
          <div class="field full"><div class="callout">Assistant Verification is configured securely on Render with VAPI_API_KEY, VAPI_ASSISTANT_ID, and VAPI_PHONE_NUMBER_ID. The API key is never saved in the browser.</div></div>
          <div class="field full">
            <label>ERP Verification Endpoint</label>
            <input value="/api/vapi/calls" disabled />
          </div>
          <div class="field full">
            <label>Vapi Webhook URL</label>
            <input value="/api/vapi/webhook" disabled />
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2 class="panel-title">Verification Payload</h2></div>
        <div class="panel-body">
          <div class="callout">Orders can be verified manually with internal notes or sent to Assistant Verification from the Orders screen. Assistant Verification starts an outbound Vapi call, then marks the order verified only after Vapi sends a successful completion webhook.</div>
        </div>
      </div>
    </div>
  `;
}

function openUserForm(username = null) {
  if (!isAdmin()) {
    toast("Only admins can manage users.");
    return;
  }
  const user = username
    ? state.users.find((item) => item.username === username)
    : { username: "", password: "", role: "sales", name: "" };
  if (!user) return toast("User was not found.");
  if (user.role === "super_admin" && !isSuperAdmin()) {
    toast("Only Super Admin can edit Super Admin users.");
    return;
  }
  const isEditingSuperAdmin = user.role === "super_admin";
  const superAdminOption = isSuperAdmin() || user.role === "super_admin" ? `<option value="super_admin" ${user.role === "super_admin" ? "selected" : ""}>Super Admin</option>` : "";
  const canSeePassword = isSuperAdmin();
  const passwordValue = canSeePassword ? user.password : "";
  const passwordPlaceholder = username && !canSeePassword ? "Enter a new password to reset" : "";
  const passwordRequired = !username || canSeePassword ? "required" : "";
  openModal(`
    <div class="modal-head"><h2>${username ? "Edit" : "New"} Sales Rep Login</h2><button class="icon-btn" title="Close" onclick="closeModal()">×</button></div>
    <form onsubmit="saveUser(event)">
      <div class="panel-body form-grid">
        <input id="originalUsername" type="hidden" value="${html(username || "")}" />
        <div class="field full"><label>User Name</label><input id="userName" value="${html(user.name)}" required ${isEditingSuperAdmin ? "readonly" : ""} /></div>
        <div class="field"><label>Username</label><input id="userUsername" value="${html(user.username)}" required ${username ? "readonly" : ""} /></div>
        <div class="field"><label>Password</label><input id="userPassword" type="${canSeePassword ? "text" : "password"}" value="${html(passwordValue)}" placeholder="${html(passwordPlaceholder)}" ${passwordRequired} /></div>
        <div class="field"><label>Role</label><select id="userRole" ${isEditingSuperAdmin ? "disabled" : ""}><option value="sales" ${user.role === "sales" ? "selected" : ""}>Sales Rep</option><option value="credit" ${user.role === "credit" ? "selected" : ""}>Credit Dept.</option><option value="shipping" ${user.role === "shipping" ? "selected" : ""}>Shipping</option><option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>${superAdminOption}</select></div>
        <div class="field full"><div class="callout">Sales reps see their own orders. Credit Dept. sees verified orders. Shipping sees orders sent to shipping. Admin users can see all submitted orders. Super Admin can access all app features.</div></div>
      </div>
      <div class="modal-actions">
        ${username && !isEditingSuperAdmin ? `<button class="btn danger" type="button" onclick="deleteUser('${html(user.username)}')">Delete</button>` : ""}
        <button class="btn" type="button" onclick="closeModal()">Cancel</button>
        <button class="btn primary" type="submit">✓ Save User</button>
      </div>
    </form>
  `);
}

function saveUser(event) {
  event.preventDefault();
  if (!isAdmin()) return toast("Only admins can manage users.");
  const originalUsername = document.querySelector("#originalUsername").value;
  const username = document.querySelector("#userUsername").value.trim().toLowerCase();
  const password = document.querySelector("#userPassword").value.trim();
  const existing = state.users.find((user) => user.username === username);
  if (!originalUsername && existing) return toast("That username already exists.");
  const previous = originalUsername ? state.users.find((user) => user.username === originalUsername) : null;
  const resolvedPassword = password || previous?.password || "";
  if (!username || !resolvedPassword) return toast("Username and password are required.");
  const selectedRole = previous?.role === "super_admin" ? "super_admin" : document.querySelector("#userRole").value;
  if (selectedRole === "super_admin" && !isSuperAdmin()) return toast("Only Super Admin can assign Super Admin users.");
  const user = {
    username,
    password: resolvedPassword,
    role: selectedRole,
    name: document.querySelector("#userName").value.trim(),
  };
  const index = state.users.findIndex((item) => item.username === (originalUsername || username));
  if (index >= 0) state.users[index] = user;
  else state.users.push(user);
  if (currentUser.username === user.username) saveCurrentUser(user);
  saveState();
  closeModal();
  render();
  toast("User saved.");
}

function deleteUser(username) {
  if (!isAdmin()) return toast("Only admins can manage users.");
  const user = state.users.find((item) => item.username === username);
  if (!user || user.role === "super_admin") return toast("Super Admin users cannot be deleted in this MVP.");
  const hasOrders = state.orders.some((order) => order.rep === user.name);
  if (hasOrders && !confirm(`${user.name} has sales orders. Delete this login anyway? Orders will remain assigned to that rep name.`)) return;
  rememberDeleted("Users", username);
  state.users = state.users.filter((item) => item.username !== username);
  saveState();
  closeModal();
  render();
  toast("User deleted.");
}

function openOrderForm(id = null) {
  editingOrderId = id;
  const firstCustomer = visibleCustomers()[0] || state.customers[0];
  const firstProduct = visibleProducts()[0] || state.products[0];
  const order = id
    ? state.orders.find((item) => item.id === id)
    : { id: uid("SO", state.orders), customerId: firstCustomer?.id, rep: isAdmin() ? "" : currentUser.name, date: new Date().toISOString().slice(0, 10), status: "pending", partNumber: "", notes: "", items: [{ productId: firstProduct?.id, qty: 1, price: firstProduct?.price || 0 }] };
  openOrderFormFromDraft(order, id);
}

function openOrderFormFromDraft(order, id = null) {
  if (id && !canAccessOrder(order)) {
    toast("You can only open your own sales orders.");
    return;
  }
  const address = orderAddress(order);
  const phone = orderPhone(order);
  const cellPhone = orderCellPhone(order);
  const accountStatus = order.accountStatus || "old";
  const followUp = order.followUp || { date: "", time: "", notes: "" };
  const card = creditCardInfo(order);
  const promo = order.promoTicket || {};
  const promoLocationType = promo.locationType || "";
  const canAddNextPart = Number(order.partNumber || 0) < 10;

  openModal(`
    <div class="modal-head"><h2>${id ? "Edit" : "New"} Sales Order</h2><button class="icon-btn" title="Close" onclick="closeModal()">×</button></div>
    <form onsubmit="saveOrder(event)">
      <div class="panel-body form-grid">
        <input id="orderId" type="hidden" value="${html(order.id)}" />
        <input id="orderPartNumber" type="hidden" value="${html(order.partNumber || "")}" />
        <div class="field"><label>Date</label><input id="orderDate" type="date" value="${html(order.date)}" required /></div>
        <div class="field"><label>Customer</label><select id="orderCustomer" onchange="handleOrderCustomerChange()"><option value="__add_new__">＋ Add New Customer</option>${state.customers.map((customer) => `<option value="${customer.id}" ${customer.id === order.customerId ? "selected" : ""}>${html(customer.name)}</option>`).join("")}</select></div>
        <div class="field"><label>Sales Rep</label><input id="orderRep" value="${html(order.rep)}" ${isAdmin() ? "" : "readonly"} required /></div>
        <div class="field"><label>Account Number (Optional)</label><input id="accountNumber" value="${html(order.accountNumber || "")}" /></div>
        <div class="field"><label>Ship Date (Optional)</label><input id="shipDate" type="date" value="${html(order.shipDate || "")}" /></div>
        <div class="field">
          <label>Account Type</label>
          <div class="check-row">
            <label class="check-field"><input name="accountStatus" type="checkbox" value="new" ${accountStatus === "new" ? "checked" : ""} onchange="setAccountStatus(this)" /> New</label>
            <label class="check-field"><input name="accountStatus" type="checkbox" value="old" ${accountStatus === "old" ? "checked" : ""} onchange="setAccountStatus(this)" /> Old</label>
            <label class="check-field"><input name="accountStatus" type="checkbox" value="rehash" ${accountStatus === "rehash" ? "checked" : ""} onchange="setAccountStatus(this)" /> Rehash</label>
          </div>
        </div>
        <div class="field"><label>Customer Phone</label><input id="orderPhone" value="${html(phone)}" placeholder="Phone number for assistant verification" required /></div>
        <div class="field"><label>Cell Phone</label><input id="orderCellPhone" value="${html(cellPhone)}" placeholder="Cell phone number" /></div>
        <div class="field"><label>Preferred Verification Number</label><select id="preferredPhone"><option value="phone" ${(order.preferredPhone || "phone") === "phone" ? "selected" : ""}>Phone</option><option value="cell" ${order.preferredPhone === "cell" ? "selected" : ""}>Cell Phone</option></select></div>
        <div class="field full"><label>Full Address</label><input id="orderAddress" value="${html(address.address)}" required /></div>
        <div class="field"><label>City</label><input id="orderCity" value="${html(address.city)}" required /></div>
        <div class="field"><label>State</label><input id="orderState" value="${html(address.state)}" maxlength="2" required /></div>
        <div class="field"><label>Zip Code</label><input id="orderZip" value="${html(address.zip)}" required /></div>
        <div class="field full"><label>Bill To (Optional)</label><textarea id="billTo" placeholder="Billing name and address, if different from customer">${html(order.billTo || "")}</textarea></div>
        <div class="field full"><label>Tracking Information (Optional)</label><input id="trackingInfo" value="${html(order.trackingInfo || "")}" placeholder="Carrier, tracking number, or delivery note" /></div>
        <div class="field full"><label>Name on Card</label><input id="cardName" value="${html(card.name)}" placeholder="Name on card" /></div>
        <div class="field"><label>Card #</label><input id="cardNumber" value="${html(card.number)}" placeholder="Card number" /></div>
        <div class="field"><label>Expiration</label><input id="cardExpiration" value="${html(card.expiration)}" placeholder="MM/YY" /></div>
        <div class="field"><label>CCV #</label><input id="cardCcv" value="${html(card.ccv)}" placeholder="CCV" /></div>
        <div class="field"><label>Follow Up Date</label><input id="followUpDate" type="date" value="${html(followUp.date || "")}" /></div>
        <div class="field"><label>Follow Up Time</label><input id="followUpTime" type="time" value="${html(followUp.time || "")}" /></div>
        <div class="field full"><label>Follow Up Notes</label><textarea id="followUpNotes" placeholder="Notes for the follow-up">${html(followUp.notes || "")}</textarea></div>
        <label class="check-field full"><input id="saveAddressBook" type="checkbox" /> Add or update this phone and address in the customer address book</label>
        <div class="field full"><label>Notes</label><textarea id="orderNotes">${html(order.notes)}</textarea></div>
        <div class="field full">
          <label>Line Items</label>
          <div class="line-items" id="lineItems">${order.items.map(lineItemHtml).join("")}</div>
          <button class="btn" type="button" onclick="addLineItem()">＋ Add Item</button>
          <button class="btn" type="button" onclick="addProductFromOrder()">＋ Add New Product</button>
        </div>
        <div class="field">
          <label>Promo Ticket (Optional)</label>
          <select id="promoTicketEnabled">
            <option value="no" ${!promo.enabled ? "selected" : ""}>No Promo Ticket</option>
            <option value="yes" ${promo.enabled ? "selected" : ""}>Add Promo Ticket</option>
          </select>
        </div>
        <div class="field"><label>Promo Company Name</label><input id="promoCompanyName" value="${html(promo.companyName || "")}" /></div>
        <div class="field"><label>Promo Account # (Optional)</label><input id="promoAccountNumber" value="${html(promo.accountNumber || "")}" /></div>
        <div class="field"><label>Rep #</label><input id="promoRepNumber" value="${html(promo.repNumber || "")}" /></div>
        <div class="field"><label>Promo #</label><input id="promoNumberTicket" value="${html(promo.promoNumber || "")}" /></div>
        <div class="field"><label>Promo Name</label><input id="promoName" value="${html(promo.name || "")}" /></div>
        <div class="field full"><label>Promo Address</label><input id="promoAddress" value="${html(promo.address || "")}" /></div>
        <div class="field"><label>Promo City</label><input id="promoCity" value="${html(promo.city || "")}" /></div>
        <div class="field"><label>Promo State</label><input id="promoState" value="${html(promo.state || "")}" maxlength="2" /></div>
        <div class="field"><label>Promo Zip Code</label><input id="promoZip" value="${html(promo.zip || "")}" /></div>
        <div class="field">
          <label>Promo Address Type</label>
          <div class="check-row">
            <label class="check-field"><input name="promoLocationType" type="checkbox" value="residential" ${promoLocationType === "residential" ? "checked" : ""} onchange="setPromoLocationType(this)" /> Residential</label>
            <label class="check-field"><input name="promoLocationType" type="checkbox" value="business" ${promoLocationType === "business" ? "checked" : ""} onchange="setPromoLocationType(this)" /> Business</label>
          </div>
        </div>
        <div class="field full"><label>Promo Ticket Notes</label><textarea id="promoNotes" placeholder="Additional promo ticket notes">${html(promo.notes || "")}</textarea></div>
      </div>
      <div class="modal-actions">
        <button class="btn" type="button" onclick="closeModal()">Cancel</button>
        <button class="btn" type="submit" name="saveAction" value="addPart" ${canAddNextPart ? "" : "disabled"}>${canAddNextPart ? "Save and Add Part" : "Part 10 Maximum"}</button>
        <button class="btn primary" type="submit">Save and Close</button>
      </div>
    </form>
  `);
  filterOrderCustomerOptions(order.customerId);
}

function lineItemHtml(item) {
  const products = selectableProducts(item.productId);
  const product = productById(item.productId) || products[0];
  return `<div class="line-item">
    <div class="field"><label>Product</label><select class="line-product" onchange="syncLinePrice(this)">${products.map((p) => `<option value="${p.id}" data-price="${p.price}" ${p.id === item.productId ? "selected" : ""}>${html(p.sku)} · ${html(p.name)}</option>`).join("")}</select></div>
    <div class="field"><label>Qty</label><input class="line-qty" type="number" min="1" value="${html(item.qty)}" /></div>
    <div class="field"><label>Price</label><input class="line-price" type="number" min="0" step="0.01" value="${html(item.price || product?.price || 0)}" /></div>
    <button class="icon-btn" title="Remove item" type="button" onclick="this.closest('.line-item').remove()">×</button>
  </div>`;
}

function syncLinePrice(select) {
  const price = select.selectedOptions[0].dataset.price;
  select.closest(".line-item").querySelector(".line-price").value = price;
}

function addLineItem() {
  const product = visibleProducts()[0] || state.products[0];
  document.querySelector("#lineItems").insertAdjacentHTML("beforeend", lineItemHtml({ productId: product?.id, qty: 1, price: product?.price || 0 }));
}

function addProductFromOrder() {
  const sku = prompt("Enter product SKU:");
  if (!sku || !sku.trim()) return;
  const name = prompt("Enter product name:");
  if (!name || !name.trim()) return;
  const category = prompt("Enter product category:", "Custom");
  const priceText = prompt("Enter unit price:", "0.00");
  const price = Number(priceText || 0);
  if (Number.isNaN(price) || price < 0) return toast("Unit price must be a valid number.");
  const product = {
    id: uid("P", state.products),
    sku: sku.trim(),
    name: name.trim(),
    category: (category || "Custom").trim(),
    price,
    stock: 0,
    owner: currentUser?.username || currentUser?.name || "shared",
  };
  state.products.unshift(product);
  saveState();
  document.querySelector("#lineItems").insertAdjacentHTML("beforeend", lineItemHtml({ productId: product.id, qty: 1, price: product.price }));
  toast(`${product.sku} added to your product catalog and this order.`);
}

function handleOrderCustomerChange() {
  const selected = document.querySelector("#orderCustomer").value;
  if (selected === "__add_new__") {
    returnToOrderAfterCustomerSave = true;
    openCustomerForm();
    return;
  }
  loadCustomerAddress();
}

function loadCustomerAddress() {
  const customer = customerById(document.querySelector("#orderCustomer").value);
  const address = customerAddress(customer);
  document.querySelector("#orderAddress").value = address.address;
  document.querySelector("#orderCity").value = address.city;
  document.querySelector("#orderState").value = address.state;
  document.querySelector("#orderZip").value = address.zip;
  document.querySelector("#orderPhone").value = customer?.phone || "";
  document.querySelector("#orderCellPhone").value = customer?.cellPhone || "";
  document.querySelector("#preferredPhone").value = customer?.preferredPhone || "phone";
}

function setAccountStatus(checkbox) {
  document.querySelectorAll('input[name="accountStatus"]').forEach((input) => {
    input.checked = input === checkbox;
  });
}

function setPromoLocationType(checkbox) {
  document.querySelectorAll('input[name="promoLocationType"]').forEach((input) => {
    input.checked = input === checkbox;
  });
}

function saveOrder(event) {
  event.preventDefault();
  const saveAction = event.submitter?.value || "close";
  const items = [...document.querySelectorAll(".line-item")].map((row) => ({
    productId: row.querySelector(".line-product").value,
    qty: Number(row.querySelector(".line-qty").value),
    price: Number(row.querySelector(".line-price").value),
  }));
  if (!items.length) return toast("Add at least one line item.");

  const orderId = document.querySelector("#orderId").value;
  const existingOrder = state.orders.find((item) => item.id === orderId);
  const selectedCustomer = customerById(document.querySelector("#orderCustomer").value);
  const formPartNumber = Number(document.querySelector("#orderPartNumber")?.value || 0);
  const savedPartNumber = saveAction === "addPart" && !formPartNumber ? 1 : formPartNumber || existingOrder?.partNumber || "";
  const order = {
    id: orderId,
    customerId: document.querySelector("#orderCustomer").value,
    rep: isAdmin() ? document.querySelector("#orderRep").value.trim() : existingOrder?.rep || currentUser.name,
    buyerName: selectedCustomer?.contact || "",
    partNumber: savedPartNumber,
    date: document.querySelector("#orderDate").value,
    accountNumber: document.querySelector("#accountNumber").value.trim(),
    shipDate: document.querySelector("#shipDate").value,
    trackingInfo: document.querySelector("#trackingInfo").value.trim(),
    accountStatus: document.querySelector('input[name="accountStatus"]:checked')?.value || "old",
    billTo: document.querySelector("#billTo").value.trim(),
    promoTicket: {
      enabled: document.querySelector("#promoTicketEnabled").value === "yes",
      companyName: document.querySelector("#promoCompanyName").value.trim(),
      accountNumber: document.querySelector("#promoAccountNumber").value.trim(),
      repNumber: document.querySelector("#promoRepNumber").value.trim(),
      promoNumber: document.querySelector("#promoNumberTicket").value.trim(),
      name: document.querySelector("#promoName").value.trim(),
      address: document.querySelector("#promoAddress").value.trim(),
      city: document.querySelector("#promoCity").value.trim(),
      state: document.querySelector("#promoState").value.trim().toUpperCase(),
      zip: document.querySelector("#promoZip").value.trim(),
      locationType: document.querySelector('input[name="promoLocationType"]:checked')?.value || "",
      notes: document.querySelector("#promoNotes").value.trim(),
    },
    creditCard: collectCreditCardInfo(),
    followUp: {
      date: document.querySelector("#followUpDate").value,
      time: document.querySelector("#followUpTime").value,
      notes: document.querySelector("#followUpNotes").value.trim(),
    },
    phone: document.querySelector("#orderPhone").value.trim(),
    cellPhone: document.querySelector("#orderCellPhone").value.trim(),
    preferredPhone: document.querySelector("#preferredPhone").value,
    address: {
      address: document.querySelector("#orderAddress").value.trim(),
      city: document.querySelector("#orderCity").value.trim(),
      state: document.querySelector("#orderState").value.trim().toUpperCase(),
      zip: document.querySelector("#orderZip").value.trim(),
    },
    status: existingOrder?.status || "pending",
    notes: document.querySelector("#orderNotes").value.trim(),
    items,
    verification: existingOrder?.verification || null,
    kickbackStatus: existingOrder?.kickbackStatus || existingOrder?.verification?.kickbackStatus || "None",
    kickbackNotes: existingOrder?.kickbackNotes || existingOrder?.verification?.kickbackNotes || "",
    creditHoldNotes: existingOrder?.creditHoldNotes || existingOrder?.verification?.creditHoldNotes || "",
    creditOrderNumber: existingOrder?.creditOrderNumber || "",
    creditOrderDate: existingOrder?.creditOrderDate || "",
    statusChangedAt: existingOrder?.statusChangedAt || "",
    statusChangedBy: existingOrder?.statusChangedBy || "",
    statusHistory: existingOrder?.statusHistory || [],
  };
  if (!existingOrder) recordStatusChange(order, "pending", "Order saved and queued for verification.");
  if (document.querySelector("#saveAddressBook").checked) {
    const customer = customerById(order.customerId);
    if (customer) {
      customer.address = order.address.address;
      customer.city = order.address.city;
      customer.state = order.address.state;
      customer.zip = order.address.zip;
      customer.phone = order.phone;
      customer.cellPhone = order.cellPhone;
      customer.preferredPhone = order.preferredPhone;
    }
  }
  if (!isAdmin() && !isCredit() && !isShipping()) {
    const customer = customerById(order.customerId);
    if (customer && !customer.owner) customer.owner = currentUser.name;
  }
  const index = state.orders.findIndex((item) => item.id === order.id);
  if (index >= 0) state.orders[index] = { ...state.orders[index], ...order };
  else state.orders.unshift(order);
  saveState();
  closeModal();
  setView("orders");
  render();
  if (saveAction === "addPart") {
    const nextPartNumber = Number(order.partNumber || 1) + 1;
    if (nextPartNumber > 10) {
      toast(`${order.id} saved. Part 10 is the maximum.`);
      return;
    }
    const firstProduct = visibleProducts()[0] || state.products[0];
    openOrderFormFromDraft({
      id: uid("SO", state.orders),
      customerId: order.customerId,
      rep: order.rep,
      buyerName: order.buyerName,
      date: new Date().toISOString().slice(0, 10),
      status: "pending",
      partNumber: nextPartNumber,
      phone: order.phone,
      cellPhone: order.cellPhone,
      preferredPhone: order.preferredPhone,
      address: order.address,
      accountNumber: order.accountNumber,
      accountStatus: order.accountStatus,
      billTo: order.billTo,
      promoTicket: order.promoTicket,
      notes: "",
      items: [{ productId: firstProduct?.id, qty: 1, price: firstProduct?.price || 0 }],
    });
    toast(`${order.id} saved. Add the next part order.`);
    return;
  }
  toast(`${order.id} saved and closed.`);
}

function deleteOrder(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!canAccessOrder(order)) return toast("You can only delete orders you can access.");
  if (!confirm(`Permanently delete sales order ${order.id}? This will remove it for all users and cannot be undone.`)) return;
  if (!isAdmin() && !isCredit() && !isShipping()) {
    const customer = customerById(order.customerId);
    if (customer && !customer.owner) customer.owner = currentUser.name;
  }
  rememberDeleted("Orders", orderId);
  state.orders = state.orders.filter((item) => item.id !== orderId);
  saveState();
  render();
  toast(`${order.id} permanently deleted.`);
}

function toggleAll(selector, checked) {
  document.querySelectorAll(selector).forEach((input) => {
    input.checked = checked;
  });
}

function deleteSelectedOrders() {
  const ids = [...document.querySelectorAll(".order-select:checked")].map((input) => input.value);
  if (!ids.length) return toast("Select at least one order.");
  const allowed = ids.filter((id) => canAccessOrder(state.orders.find((order) => order.id === id)));
  if (!allowed.length) return toast("No selected orders can be deleted.");
  if (!confirm(`Permanently delete ${allowed.length} selected order${allowed.length === 1 ? "" : "s"} for all users? This cannot be undone.`)) return;
  allowed.forEach((id) => {
    const order = state.orders.find((item) => item.id === id);
    if (order && !isAdmin() && !isCredit() && !isShipping()) {
      const customer = customerById(order.customerId);
      if (customer && !customer.owner) customer.owner = currentUser.name;
    }
    rememberDeleted("Orders", id);
  });
  state.orders = state.orders.filter((order) => !allowed.includes(order.id));
  saveState();
  render();
  toast("Selected orders permanently deleted.");
}

function openProductForm(id = null) {
  const product = id ? productById(id) : { id: uid("P", state.products), sku: "", name: "", category: "", price: 0, stock: 0 };
  if (id && !canAccessProduct(product)) return toast("You can only edit products in your own catalog.");
  openModal(`
    <div class="modal-head"><h2>${id ? "Edit" : "New"} Product</h2><button class="icon-btn" title="Close" onclick="closeModal()">×</button></div>
    <form onsubmit="saveProduct(event)">
      <div class="panel-body form-grid">
        <input id="productId" type="hidden" value="${html(product.id)}" />
        <div class="field"><label>SKU</label><input id="productSku" value="${html(product.sku)}" required /></div>
        <div class="field"><label>Category</label><input id="productCategory" value="${html(product.category)}" required /></div>
        <div class="field full"><label>Product Name</label><input id="productName" value="${html(product.name)}" required /></div>
        <div class="field"><label>Unit Price</label><input id="productPrice" type="number" min="0" step="0.01" value="${html(product.price)}" required /></div>
        <input id="productStock" type="hidden" value="${html(product.stock)}" />
      </div>
      <div class="modal-actions"><button class="btn" type="button" onclick="closeModal()">Cancel</button><button class="btn primary" type="submit">✓ Save Product</button></div>
    </form>
  `);
}

function saveProduct(event) {
  event.preventDefault();
  const productId = document.querySelector("#productId").value;
  const existingProduct = productById(productId);
  if (existingProduct && !canAccessProduct(existingProduct)) return toast("You can only save products in your own catalog.");
  const product = {
    id: productId,
    sku: document.querySelector("#productSku").value.trim(),
    name: document.querySelector("#productName").value.trim(),
    category: document.querySelector("#productCategory").value.trim(),
    price: Number(document.querySelector("#productPrice").value),
    stock: Number(document.querySelector("#productStock").value),
    owner: existingProduct ? productOwner(existingProduct) : currentUser?.username || "shared",
  };
  const index = state.products.findIndex((item) => item.id === product.id);
  if (index >= 0) state.products[index] = product;
  else state.products.unshift(product);
  saveState();
  closeModal();
  render();
  toast("Product saved.");
}

function deleteProduct(productId) {
  const product = productById(productId);
  if (!product) return toast("Product was not found.");
  if (!canAccessProduct(product)) return toast("You can only delete products in your own catalog.");
  const orderCount = state.orders.filter((order) => (order.items || []).some((item) => item.productId === productId)).length;
  const message = orderCount
    ? `${product.sku} is used on ${orderCount} order${orderCount === 1 ? "" : "s"}. Delete it from the product catalog anyway? Existing orders will keep the line but show a missing product name.`
    : `Delete product ${product.sku}? This cannot be undone.`;
  if (!confirm(message)) return;
  rememberDeleted("Products", productId);
  state.products = state.products.filter((item) => item.id !== productId);
  saveState();
  render();
  toast("Product deleted.");
}

function openCustomerForm(id = null) {
  const customer = id ? customerById(id) : { id: uid("C", state.customers), name: "", contact: "", email: "", phone: "", cellPhone: "", preferredPhone: "phone", address: "", city: "", state: "", zip: "", promoNumber: "", purchaseOrder: "", terms: "Net 30" };
  if (id && !canAccessCustomer(id)) {
    toast("You can only open customers assigned to your sales account.");
    return;
  }
  openModal(`
    <div class="modal-head"><h2>${id ? "Edit" : "New"} Customer</h2><button class="icon-btn" title="Close" onclick="closeModal()">×</button></div>
    <form onsubmit="saveCustomer(event)">
      <div class="panel-body form-grid">
        <input id="customerId" type="hidden" value="${html(customer.id)}" />
        <div class="field full"><label>Company Name</label><input id="customerName" value="${html(customer.name)}" required /></div>
        <div class="field"><label>Contact</label><input id="customerContact" value="${html(customer.contact)}" required /></div>
        <div class="field"><label>Email (Optional)</label><input id="customerEmail" type="email" value="${html(customer.email)}" /></div>
        <div class="field"><label>Phone</label><input id="customerPhone" value="${html(customer.phone || "")}" required /></div>
        <div class="field"><label>Cell Phone</label><input id="customerCellPhone" value="${html(customer.cellPhone || "")}" /></div>
        <div class="field"><label>Preferred Verification Number</label><select id="customerPreferredPhone"><option value="phone" ${(customer.preferredPhone || "phone") === "phone" ? "selected" : ""}>Phone</option><option value="cell" ${customer.preferredPhone === "cell" ? "selected" : ""}>Cell Phone</option></select></div>
        <div class="field full"><label>Full Address</label><input id="customerAddress" value="${html(customer.address || "")}" required /></div>
        <div class="field"><label>City</label><input id="customerCity" value="${html(customer.city || "")}" required /></div>
        <div class="field"><label>State</label><input id="customerState" value="${html(customer.state || "")}" maxlength="2" required /></div>
        <div class="field"><label>Zip Code</label><input id="customerZip" value="${html(customer.zip || "")}" required /></div>
        <div class="field"><label>Promo Number (Optional)</label><input id="customerPromoNumber" value="${html(customer.promoNumber || "")}" /></div>
        <div class="field"><label>Purchase Order</label><input id="customerPurchaseOrder" value="${html(customer.purchaseOrder || "")}" /></div>
        <div class="field"><label>Terms</label><select id="customerTerms">${["Due on Receipt", "Net 15", "Net 30", "Net 45", "Net 60"].map((term) => `<option ${term === customer.terms ? "selected" : ""}>${term}</option>`).join("")}</select></div>
      </div>
      <div class="modal-actions"><button class="btn" type="button" onclick="closeModal()">Cancel</button><button class="btn primary" type="submit">✓ Save Customer</button></div>
    </form>
  `);
}

function saveCustomer(event) {
  event.preventDefault();
  const customerId = document.querySelector("#customerId").value;
  const existingCustomer = customerById(customerId);
  if (existingCustomer && !canAccessCustomer(customerId)) return toast("You can only save customers assigned to your sales account.");
  const customer = {
    id: customerId,
    name: document.querySelector("#customerName").value.trim(),
    contact: document.querySelector("#customerContact").value.trim(),
    email: document.querySelector("#customerEmail").value.trim(),
    phone: document.querySelector("#customerPhone").value.trim(),
    cellPhone: document.querySelector("#customerCellPhone").value.trim(),
    preferredPhone: document.querySelector("#customerPreferredPhone").value,
    address: document.querySelector("#customerAddress").value.trim(),
    city: document.querySelector("#customerCity").value.trim(),
    state: document.querySelector("#customerState").value.trim().toUpperCase(),
    zip: document.querySelector("#customerZip").value.trim(),
    promoNumber: document.querySelector("#customerPromoNumber").value.trim(),
    purchaseOrder: document.querySelector("#customerPurchaseOrder").value.trim(),
    terms: document.querySelector("#customerTerms").value,
    owner: existingCustomer?.owner || (isAdmin() || isCredit() || isShipping() ? "" : currentUser.name),
  };
  const index = state.customers.findIndex((item) => item.id === customer.id);
  if (index >= 0) state.customers[index] = customer;
  else state.customers.unshift(customer);
  saveState();
  closeModal();
  if (returnToOrderAfterCustomerSave) {
    returnToOrderAfterCustomerSave = false;
    view = "orders";
    render();
    openOrderFormForCustomer(customer.id);
    toast("Customer saved. Continue the sales order.");
    return;
  }
  render();
  toast("Customer saved.");
}

function openOrderFormForCustomer(customerId) {
  const customer = customerById(customerId);
  const firstProduct = visibleProducts()[0] || state.products[0];
  const order = {
    id: uid("SO", state.orders),
    customerId,
    rep: isAdmin() ? "" : currentUser.name,
    date: new Date().toISOString().slice(0, 10),
    status: "pending",
    partNumber: "",
    notes: "",
    shipDate: "",
    billTo: "",
    creditCard: { name: "", last4: "", expiration: "", ccvReceived: false },
    followUp: { date: "", time: "", notes: "" },
    phone: customer?.phone || "",
    cellPhone: customer?.cellPhone || "",
    preferredPhone: customer?.preferredPhone || "phone",
    address: customerAddress(customer),
    items: [{ productId: firstProduct?.id, qty: 1, price: firstProduct?.price || 0 }],
  };
  openOrderFormFromDraft(order);
}

function deleteCustomer(customerId) {
  const customer = customerById(customerId);
  if (!customer) return toast("Customer was not found.");
  if (!canAccessCustomer(customerId)) return toast("You can only delete customers assigned to your sales account.");
  const orderCount = state.orders.filter((order) => order.customerId === customerId).length;
  if (orderCount && !confirm(`${customer.name} is linked to ${orderCount} sales order${orderCount === 1 ? "" : "s"}. Delete the customer anyway? Existing orders will show Unknown customer.`)) return;
  if (!orderCount && !confirm(`Delete customer ${customer.name}? This cannot be undone.`)) return;
  rememberDeleted("Customers", customerId);
  state.customers = state.customers.filter((item) => item.id !== customerId);
  saveState();
  render();
  toast("Customer deleted.");
}

function deleteSelectedCustomers() {
  const ids = [...document.querySelectorAll(".customer-select:checked")].map((input) => input.value);
  if (!ids.length) return toast("Select at least one customer.");
  const allowed = ids.filter((id) => canAccessCustomer(id));
  if (!allowed.length) return toast("No selected customers can be deleted.");
  if (!confirm(`Delete ${allowed.length} selected customer${allowed.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
  allowed.forEach((id) => rememberDeleted("Customers", id));
  state.customers = state.customers.filter((customer) => !allowed.includes(customer.id));
  saveState();
  render();
  toast("Selected customers deleted.");
}

function saveSettings(event) {
  event.preventDefault();
  toast("Assistant Verification is configured in Render environment variables.");
}

async function verifyOrderWithVapi(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  if (!canAccessOrder(order)) {
    toast("You can only verify your own sales orders.");
    return;
  }
  if (!canUseAssistantVerification(order)) {
    toast("Assistant Verification is only for Old account types.");
    return;
  }
  const customerPhoneNumber = preferredVerificationPhone(order);
  if (!customerPhoneNumber) {
    toast("Add a phone number or cell phone number before using Assistant Verification.");
    return;
  }
  const kickback = captureKickback(order);
  closeModal();
  toast(`Sending ${order.id} to Assistant Verification...`);
  const payload = buildVerificationPayload(order);
  try {
    const response = await fetch("./api/vapi/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        customerPhoneNumber,
        order: payload,
      }),
    });
    const responseText = await response.text();
    let result = {};
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      result = {};
    }
    if (!response.ok || !result.ok) throw new Error(result.error || `Vapi returned ${response.status}`);
    recordStatusChange(order, "verification_in_progress", `Assistant Verification call started. Vapi call ID: ${result.callId || "pending"}.`);
    order.verification = {
      state: "verification_in_progress",
      method: "Assistant",
      summary: "Assistant Verification call is in progress. The order will be marked verified after Vapi confirms the completed call.",
      at: order.statusChangedAt,
      verifiedBy: "",
      vapiCallId: result.callId || "",
      vapiCallStatus: result.callStatus || "scheduled",
      ...kickback,
    };
    saveState();
    render();
    toast(`${order.id} Assistant Verification call started.`);
  } catch (error) {
    recordStatusChange(order, "issue", error.message);
    order.verification = { state: "issue", method: "Assistant", summary: error.message, at: order.statusChangedAt, verifiedBy: currentUser.name, ...kickback };
    saveState();
    render();
    toast(`Verification issue: ${error.message}`);
  }
}

function extractRecordingUrl(value) {
  if (!value || typeof value !== "object") return "";
  const candidates = [
    value.recordingUrl,
    value.recording_url,
    value.recording?.url,
    value.artifact?.recordingUrl,
    value.artifact?.recording_url,
    value.call?.recordingUrl,
    value.call?.artifact?.recordingUrl,
    value.data?.recordingUrl,
    value.data?.artifact?.recordingUrl,
  ];
  const direct = candidates.find((item) => typeof item === "string" && item);
  if (direct) return direct;
  for (const item of Object.values(value)) {
    const nested = extractRecordingUrl(item);
    if (nested) return nested;
  }
  return "";
}

function buildVerificationPayload(order) {
  const customer = customerById(order.customerId);
  const card = creditCardInfo(order);
  return {
    assistantId: state.settings.assistantId,
    phoneNumberId: state.settings.phoneNumberId,
    order: {
      id: order.id,
      date: order.date,
      salesRep: order.rep,
      buyerName: orderBuyerName(order),
      customer,
      accountNumber: order.accountNumber || "",
      accountStatus: order.accountStatus || "old",
      shipDate: order.shipDate || "",
      trackingInfo: order.trackingInfo || "",
      billTo: order.billTo || "",
      promoTicket: order.promoTicket || { enabled: false },
      creditCardOnFile: Boolean(card.name || card.last4 || card.expiration),
      followUp: order.followUp || { date: "", time: "", notes: "" },
      customerPhone: preferredVerificationPhone(order),
      customerCellPhone: orderCellPhone(order),
      preferredPhone: order.preferredPhone || customer?.preferredPhone || "phone",
      call: {
        customerName: customer?.contact || customer?.name || "",
        phoneNumber: preferredVerificationPhone(order),
      },
      address: orderAddress(order),
      notes: order.notes,
      total: orderTotal(order),
      items: order.items.map((item) => {
        const product = productById(item.productId);
        return { sku: product?.sku, name: product?.name, category: product?.category, orderedQty: item.qty, unitPrice: item.price };
      }),
    },
  };
}

function runLocalVerification(order) {
  const issues = [];
  if (!customerById(order.customerId)) issues.push("Customer account was not found.");
  order.items.forEach((item) => {
    const product = productById(item.productId);
    if (!product) issues.push("A line item references a missing product.");
    if (product && Math.abs(Number(item.price) - Number(product.price)) > 0.01) issues.push(`${product.sku} price differs from catalog price.`);
  });
  if (orderTotal(order) > 5000 && !order.notes.toLowerCase().includes("approved")) issues.push("Orders over $5,000 need approval notes.");
  if (issues.length) return { state: "issue", summary: issues.join(" ") };
  return { state: "verified", summary: "Demo checks passed: account, catalog pricing, and approval rules look good." };
}

function openModal(content) {
  let backdrop = document.querySelector(".modal-backdrop");
  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";
    backdrop.innerHTML = `<div class="modal"></div>`;
    document.body.appendChild(backdrop);
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closeModal();
    });
  }
  backdrop.querySelector(".modal").innerHTML = content;
  backdrop.classList.add("open");
}

function closeModal() {
  document.querySelector(".modal-backdrop")?.classList.remove("open");
}

function timestamp() {
  return new Date().toLocaleString([], { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function resetDemoData() {
  state = structuredClone(seedData);
  saveState();
  render();
  toast("Demo data reset.");
}

async function startApp() {
  await loadRuntimeFiles();
  const skipSharedStateOnce = sessionStorage.getItem("alliedErpSkipSharedStateOnce") === "1";
  if (skipSharedStateOnce) {
    sessionStorage.removeItem("alliedErpSkipSharedStateOnce");
  } else {
    await loadSharedState();
  }
  render();
  window.setInterval(() => {
    if (shouldRefreshSharedState()) loadSharedState({ rerender: true });
  }, 5000);
}

startApp();
