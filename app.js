const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const seedData = {
  unitOfMeasures: [
    { id: "UOM-UNITS", name: "Units", singular_name: "unit", plural_name: "units", abbreviation: "EA", is_active: true, sort_order: 10, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-EACH", name: "Each", singular_name: "each", plural_name: "each", abbreviation: "EA", is_active: true, sort_order: 20, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-CASES", name: "Cases", singular_name: "case", plural_name: "cases", abbreviation: "CS", is_active: true, sort_order: 30, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-ROLLS", name: "Rolls", singular_name: "roll", plural_name: "rolls", abbreviation: "RL", is_active: true, sort_order: 40, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-COILS", name: "Coils", singular_name: "coil", plural_name: "coils", abbreviation: "CO", is_active: true, sort_order: 50, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-BOXES", name: "Boxes", singular_name: "box", plural_name: "boxes", abbreviation: "BX", is_active: true, sort_order: 60, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-CARTONS", name: "Cartons", singular_name: "carton", plural_name: "cartons", abbreviation: "CT", is_active: true, sort_order: 70, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-PACKS", name: "Packs", singular_name: "pack", plural_name: "packs", abbreviation: "PK", is_active: true, sort_order: 80, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-PALLETS", name: "Pallets", singular_name: "pallet", plural_name: "pallets", abbreviation: "PL", is_active: true, sort_order: 90, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-DRUMS", name: "Drums", singular_name: "drum", plural_name: "drums", abbreviation: "DR", is_active: true, sort_order: 100, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-BAGS", name: "Bags", singular_name: "bag", plural_name: "bags", abbreviation: "BG", is_active: true, sort_order: 110, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-BUNDLES", name: "Bundles", singular_name: "bundle", plural_name: "bundles", abbreviation: "BD", is_active: true, sort_order: 120, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-SETS", name: "Sets", singular_name: "set", plural_name: "sets", abbreviation: "SET", is_active: true, sort_order: 130, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-PAIRS", name: "Pairs", singular_name: "pair", plural_name: "pairs", abbreviation: "PR", is_active: true, sort_order: 140, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-FEET", name: "Feet", singular_name: "foot", plural_name: "feet", abbreviation: "FT", is_active: true, sort_order: 150, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-POUNDS", name: "Pounds", singular_name: "pound", plural_name: "pounds", abbreviation: "LB", is_active: true, sort_order: 160, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
    { id: "UOM-GALLONS", name: "Gallons", singular_name: "gallon", plural_name: "gallons", abbreviation: "GAL", is_active: true, sort_order: 170, created_at: "2026-07-21T00:00:00.000Z", updated_at: "2026-07-21T00:00:00.000Z", created_by: "System" },
  ],
  products: [
    { id: "P-1001", sku: "GLV-NIT-8", name: "Nitrile Work Gloves, Size 8", category: "Safety", price: 12.5, stock: 420 },
    { id: "P-1002", sku: "BRG-6205", name: "6205-2RS Ball Bearing", category: "Power Transmission", price: 7.85, stock: 178 },
    { id: "P-1003", sku: "HOSE-AIR-50", name: "50 ft Reinforced Air Hose", category: "Pneumatics", price: 64.25, stock: 39 },
    { id: "P-1004", sku: "ABS-PAD-M", name: "Medium Absorbent Pads, Case", category: "Maintenance", price: 89.0, stock: 22 },
    { id: "P-1005", sku: "CUT-WHL-045", name: "4.5 in Cut-Off Wheels, 25 Pack", category: "Abrasives", price: 31.75, stock: 88 },
  ],
  customers: [
    { id: "C-2101", name: "Baxter Machine Works", account_number: "BAx-2101", contact: "Mia Turner", email: "purchasing@baxtermw.example", phone: "216-555-0184", address: "1420 Foundry Park Dr", city: "Cleveland", state: "OH", zip: "44114", promoNumber: "AIS-10", purchaseOrder: "PO-77821", terms: "Net 30" },
    { id: "C-2102", name: "North Valley Fabrication", account_number: "NVF-2102", contact: "Evan Cho", email: "orders@nvfab.example", phone: "559-555-0138", address: "88 Industrial Loop", city: "Fresno", state: "CA", zip: "93725", promoNumber: "WELD-25", purchaseOrder: "PO-44018", terms: "Net 15" },
    { id: "C-2103", name: "Westshore Packaging", account_number: "WSP-2103", contact: "Renee Patel", email: "maintenance@westshorepkg.example", phone: "253-555-0197", address: "501 Harbor Way", city: "Tacoma", state: "WA", zip: "98421", promoNumber: "MRO-05", purchaseOrder: "PO-98204", terms: "Net 45" },
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
let state = loadState();
let currentUser = loadCurrentUser();
let view = "dashboard";
let editingOrderId = null;
let editingProductId = null;
let editingCustomerId = null;
let search = "";
let statusFilter = "all";
let orderPage = 1;
let orderPageSize = 25;
let deferredInstallPrompt = null;
let returnToOrderAfterCustomerSave = false;
let stateSaveTimer = null;
let stateSyncInFlight = false;
const rememberedLoginKey = "alliedErpRememberedLogin";
const themePreferenceKey = "allied_erp_theme";
let backupStatus = null;
let backupHistory = [];
let backupLoading = false;
let loginDraftInitialized = false;
let loginDraft = { username: "", password: "" };
let currentSessionPassword = "";

removeLegacySavedPasswords();
applyThemePreference();

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

function loadState() {
  const saved = localStorage.getItem("alliedErpState");
  if (!saved) return normalizeState(structuredClone(seedData));
  try {
    const parsed = JSON.parse(saved);
    const merged = { ...structuredClone(seedData), ...parsed };
    if (!Array.isArray(merged.users) || !merged.users.length) merged.users = structuredClone(seedData.users);
    seedData.users.forEach((seedUser) => {
      if (!merged.users.some((user) => user.username === seedUser.username)) merged.users.push({ ...seedUser });
    });
    return normalizeState(merged);
  } catch {
    return normalizeState(structuredClone(seedData));
  }
}

function normalizeState(data) {
  data.settings = data.settings || {};
  delete data.settings.vapiApiKey;
  data.unitOfMeasures = normalizeUnitOfMeasures(data.unitOfMeasures);
  data.deletedCustomers = Array.isArray(data.deletedCustomers) ? data.deletedCustomers : [];
  data.deletedProducts = Array.isArray(data.deletedProducts) ? data.deletedProducts : [];
  data.deletedUsers = Array.isArray(data.deletedUsers) ? data.deletedUsers : [];
  data.deletedOrders = [];
  data.users = (data.users || []).map((user) => (user.username === "admin" ? { ...user, role: "super_admin" } : user));
  data.users = data.users.filter((user) => !data.deletedUsers.includes(user.username) || user.role === "super_admin");
  data.customers = (data.customers || [])
    .map((customer) => ({
      ...customer,
      account_number: String(customer.account_number || customer.accountNumber || "").trim(),
      deleted_at: customer.deleted_at || (data.deletedCustomers.includes(customer.id) ? new Date().toISOString() : ""),
      deleted_by: customer.deleted_by || (data.deletedCustomers.includes(customer.id) ? "Legacy delete marker" : ""),
    }));
  data.products = (data.products || []).map((product) => ({
    ...product,
    deleted_at: product.deleted_at || (data.deletedProducts.includes(product.id) ? new Date().toISOString() : ""),
    deleted_by: product.deleted_by || (data.deletedProducts.includes(product.id) ? "Legacy delete marker" : ""),
  }));
  data.orders = (data.orders || []).map((order) => {
    const status = order.status || "pending";
    const at = order.statusChangedAt || order.verification?.at || order.date || "";
    const by = order.statusChangedBy || order.verification?.verifiedBy || "";
    return {
      ...order,
      status,
      items: normalizeOrderItems(order.items, data.unitOfMeasures),
      statusChangedAt: at,
      statusChangedBy: by,
      statusHistory: Array.isArray(order.statusHistory) && order.statusHistory.length ? order.statusHistory : [{ status, label: statusLabel(status), at, by, notes: order.verification?.summary || "" }],
      verificationHistory: Array.isArray(order.verificationHistory) ? order.verificationHistory : [],
      purchase_order_number: order.purchase_order_number || order.purchaseOrderNumber || order.purchaseOrder || "",
      vapiNotes: Array.isArray(order.vapiNotes) ? order.vapiNotes : [],
      vapi_notes_count: Array.isArray(order.vapiNotes) ? order.vapiNotes.length : Number(order.vapi_notes_count || 0),
      has_vapi_changes: Boolean(order.has_vapi_changes),
      vapi_change_review_status: order.vapi_change_review_status || "",
      vapi_change_summary: order.vapi_change_summary || "",
      vapi_change_detected_at: order.vapi_change_detected_at || "",
      vapi_change_call_id: order.vapi_change_call_id || "",
      vapi_change_reviewed_by: order.vapi_change_reviewed_by || "",
      vapi_change_reviewed_at: order.vapi_change_reviewed_at || "",
      vapi_change_review_note: order.vapi_change_review_note || "",
      customerChangeRequests: Array.isArray(order.customerChangeRequests) ? order.customerChangeRequests : [],
      processedVapiCallIds: Array.isArray(order.processedVapiCallIds) ? order.processedVapiCallIds : [],
      creditHoldNotes: order.creditHoldNotes || order.verification?.creditHoldNotes || "",
      hiddenFor: Array.isArray(order.hiddenFor) ? order.hiddenFor : [],
    };
  });
  return data;
}

function normalizeUnitOfMeasures(units = []) {
  const records = new Map();
  [...seedData.unitOfMeasures, ...(Array.isArray(units) ? units : [])].forEach((unit, index) => {
    if (!unit?.id && !unit?.name) return;
    const id = unit.id || uid("UOM", [...records.values()]);
    const name = String(unit.name || unit.plural_name || unit.singular_name || "Units").trim();
    const singular = String(unit.singular_name || name.replace(/s$/i, "") || "unit").trim().toLowerCase();
    const plural = String(unit.plural_name || name || `${singular}s`).trim().toLowerCase();
    records.set(id, {
      id,
      name,
      singular_name: singular,
      plural_name: plural,
      abbreviation: String(unit.abbreviation || "").trim(),
      is_active: unit.is_active !== false,
      sort_order: Number(unit.sort_order || (index + 1) * 10),
      created_at: unit.created_at || new Date().toISOString(),
      updated_at: unit.updated_at || unit.created_at || new Date().toISOString(),
      created_by: unit.created_by || "System",
    });
  });
  return [...records.values()].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || a.name.localeCompare(b.name));
}

function defaultUnitOfMeasure() {
  return state?.unitOfMeasures?.find((unit) => unit.id === "UOM-UNITS") || state?.unitOfMeasures?.[0] || seedData.unitOfMeasures[0];
}

function unitOfMeasureById(id) {
  return state.unitOfMeasures.find((unit) => unit.id === id) || null;
}

function unitOfMeasureByName(name) {
  const target = String(name || "").trim().toLowerCase();
  if (!target) return null;
  return state.unitOfMeasures.find((unit) => [unit.name, unit.singular_name, unit.plural_name, unit.abbreviation].some((value) => String(value || "").trim().toLowerCase() === target)) || null;
}

function lineUnitOfMeasure(item = {}) {
  return unitOfMeasureById(item.unit_of_measure_id) || unitOfMeasureByName(item.unit_of_measure_snapshot?.name || item.unit_of_measure_snapshot?.plural_name || item.unit || item.uom || item.unitOfMeasure) || defaultUnitOfMeasure();
}

function unitSnapshot(unit = defaultUnitOfMeasure()) {
  return {
    id: unit.id,
    name: unit.name,
    singular_name: unit.singular_name,
    plural_name: unit.plural_name,
    abbreviation: unit.abbreviation || "",
  };
}

function normalizeOrderItems(items = [], units = state?.unitOfMeasures || seedData.unitOfMeasures) {
  return (Array.isArray(items) ? items : []).map((item) => {
    const unit = units.find((candidate) => candidate.id === item.unit_of_measure_id)
      || units.find((candidate) => [candidate.name, candidate.singular_name, candidate.plural_name, candidate.abbreviation].some((value) => String(value || "").trim().toLowerCase() === String(item.unit_of_measure_snapshot?.name || item.unit_of_measure_snapshot?.plural_name || item.unit || item.uom || item.unitOfMeasure || "").trim().toLowerCase()))
      || units.find((candidate) => candidate.id === "UOM-UNITS")
      || units[0]
      || seedData.unitOfMeasures[0];
    return {
      ...item,
      unit_of_measure_id: unit.id,
      unit_of_measure_snapshot: item.unit_of_measure_snapshot || unitSnapshot(unit),
      unit_of_measure: unitSnapshot(unit),
    };
  });
}

function activeUnitOptions(currentId = "") {
  const units = state.unitOfMeasures.filter((unit) => unit.is_active !== false || unit.id === currentId);
  if (currentId && !units.some((unit) => unit.id === currentId)) {
    const current = unitOfMeasureById(currentId);
    if (current) units.push(current);
  }
  return units.sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || a.name.localeCompare(b.name));
}

function saveState(options = {}) {
  localStorage.setItem("alliedErpState", JSON.stringify(state));
  if (!options.localOnly) scheduleServerStateSave();
}

function orderStatusDebugSnapshot(order = {}) {
  return {
    orderId: order.id || "",
    status: order.status || "",
    verificationState: order.verification?.state || "",
    verificationCallStatus: order.verification?.vapiCallStatus || "",
    displayedFieldName: "verificationStatusKey(order) reads order.status and order.verification.state",
    displayedVerificationStatus: verificationStatusLabel(verificationStatusKey(order)),
  };
}

function logFrontendOrderStatuses(stage, orders = state.orders) {
  const tracked = (Array.isArray(orders) ? orders : [])
    .filter((order) => order?.verification?.vapiCallId || order?.status === "verification_in_progress" || order?.status === "verified" || order?.status === "cancelled")
    .slice(0, 8)
    .map(orderStatusDebugSnapshot);
  console.log(`[frontend-state] ${stage}:`, tracked);
}

function applyServerState(serverState, stage = "server sync") {
  if (!serverState || !Object.keys(serverState).length) return false;
  const username = currentUser?.username;
  state = normalizeState({ ...structuredClone(seedData), ...serverState });
  currentUser = username ? state.users.find((item) => item.username === username) || null : loadCurrentUser();
  localStorage.setItem("alliedErpState", JSON.stringify(state));
  logFrontendOrderStatuses(`frontend value received from ${stage}`);
  return true;
}

function scheduleServerStateSave() {
  window.clearTimeout(stateSaveTimer);
  stateSaveTimer = window.setTimeout(pushStateToServer, 150);
}

async function pushStateToServer() {
  try {
    const response = await fetch("./api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(state),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.error || `State save failed with ${response.status}`);
    console.log("[frontend-state] API response sent to frontend after save:", result.savedAt || "");
    if (applyServerState(result.state, "save response")) render();
  } catch (error) {
    console.warn("[frontend-state] Server state save failed:", error.message);
  }
}

async function syncStateFromServer(options = {}) {
  if (stateSyncInFlight) return;
  stateSyncInFlight = true;
  try {
    const response = await fetch("./api/state", { cache: "no-store" });
    const serverState = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`State load failed with ${response.status}`);
    console.log("[frontend-state] API response received from /api/state");
    const changed = applyServerState(serverState, "api/state");
    if (changed && options.render !== false) render();
  } catch (error) {
    console.warn("[frontend-state] Server state sync failed:", error.message);
  } finally {
    stateSyncInFlight = false;
  }
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

function loadSavedLoginCredentials() {
  if (loginDraftInitialized) return loginDraft;
  loginDraftInitialized = true;
  try {
    const remembered = JSON.parse(localStorage.getItem(rememberedLoginKey) || "{}");
    loginDraft = { username: String(remembered.username || ""), password: "" };
  } catch {
    loginDraft = { username: "", password: "" };
  }
  return loginDraft;
}

function saveLoginDraftFromInputs() {
  loginDraft = {
    username: document.querySelector("#loginUsername")?.value ?? "",
    password: document.querySelector("#loginPassword")?.value ?? "",
  };
}

function syncCredentialFields() {
  saveLoginDraftFromInputs();
}

function clearLoginFields() {
  loginDraft = { username: "", password: "" };
  const usernameInput = document.querySelector("#loginUsername");
  const passwordInput = document.querySelector("#loginPassword");
  if (usernameInput) usernameInput.value = "";
  if (passwordInput) passwordInput.value = "";
  usernameInput?.focus();
}

function rememberLoginCredentials(username) {
  localStorage.setItem(rememberedLoginKey, JSON.stringify({ username }));
  localStorage.removeItem("alliedErpLoginDraft");
}

function currentPasswordForProtectedAction() {
  if (currentSessionPassword) return currentSessionPassword;
  const value = prompt("Enter your password to continue:");
  currentSessionPassword = value || "";
  return currentSessionPassword;
}

function removeLegacySavedPasswords() {
  const scrub = (key) => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "{}");
      if (value && Object.prototype.hasOwnProperty.call(value, "password")) {
        delete value.password;
        if (key === "alliedErpLoginDraft") localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      localStorage.removeItem(key);
    }
  };
  scrub(rememberedLoginKey);
  scrub("alliedErpLoginDraft");
}

function themePreference() {
  return localStorage.getItem(themePreferenceKey) || "system";
}

function resolvedTheme(preference = themePreference()) {
  if (preference === "dark" || preference === "light") return preference;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}

function applyThemePreference(preference = themePreference()) {
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = resolvedTheme(preference);
}

function setThemePreference(preference) {
  localStorage.setItem(themePreferenceKey, preference);
  applyThemePreference(preference);
  render();
  toast(`Theme set to ${preference === "system" ? "system default" : preference}.`);
}

window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener?.("change", () => {
  if (themePreference() === "system") applyThemePreference("system");
});

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

function isProductionApp() {
  return String(appConfig.environmentName || "").toLowerCase() === "production";
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
    callback_requested: "Callback Requested",
    partial_ship: "Partial Ship",
    sent_to_shipping: "Sent to Shipping",
    order_shipped: "Order Shipped",
    completed: "Completed",
    cancelled: "Cancelled",
    archived: "Archived",
  };
}

function statusLabel(status) {
  return statusLabels()[status] || status || "";
}

function visibleOrders() {
  const notHidden = (order) => !isSoftDeleted(order) && !(order.hiddenFor || []).includes(currentUser?.username);
  if (isAdmin()) return state.orders.filter(notHidden);
  if (isCredit()) return state.orders.filter((order) => notHidden(order) && (["verified", "pending_ap", "credit_hold", "kickback_pending", "sent_to_shipping", "order_shipped", "completed"].includes(order.status) || (order.status === "cancelled" && orderHadAnyStatus(order, ["verified", "pending_ap", "credit_hold", "kickback_pending", "sent_to_shipping"]))));
  if (isShipping()) return state.orders.filter((order) => notHidden(order) && order.status === "sent_to_shipping");
  return state.orders.filter((order) => notHidden(order) && order.rep === currentUser?.name);
}

function visibleCustomers() {
  const customers = state.customers.filter((customer) => !isSoftDeleted(customer));
  if (isAdmin() || isCredit() || isShipping()) return customers;
  const allowedIds = new Set(visibleOrders().map((order) => order.customerId));
  return customers.filter((customer) => allowedIds.has(customer.id) || customer.owner === currentUser?.name);
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

function latestCallbackNote(order = {}) {
  return order.verification?.callbackNotes
    || vapiNotesForOrder(order).find((note) => note.callback_notes)?.callback_notes
    || "";
}

function isSoftDeleted(record = {}) {
  return Boolean(record.deleted_at || record.archived_at);
}

function auditAction(action, recordType, recordId, reason = "") {
  if (!Array.isArray(state.auditLog)) state.auditLog = [];
  state.auditLog.push({
    id: uid("AUDIT", state.auditLog),
    action,
    record_type: recordType,
    record_id: recordId,
    reason,
    employee: currentUser?.name || "",
    user: currentUser?.username || "",
    at: new Date().toISOString(),
  });
}

function orderSortValue(order = {}) {
  const parsed = Date.parse(order.createdAt || order.updatedAt || order.statusChangedAt || order.date || "");
  const numericId = Number(String(order.id || "").replace(/\D/g, ""));
  return (Number.isFinite(parsed) ? parsed : 0) * 100000 + (Number.isFinite(numericId) ? numericId : 0);
}

function newestOrdersFirst(orders = []) {
  return [...orders].sort((a, b) => orderSortValue(b) - orderSortValue(a) || String(b.id || "").localeCompare(String(a.id || "")));
}

function statusFilterControl() {
  const statuses = [["all", "All Statuses"], ...Object.entries(statusLabels())];
  return `<select class="status-filter" title="Filter by status" onchange="statusFilter=this.value;orderPage=1;render()">${statuses.map(([value, label]) => `<option value="${value}" ${statusFilter === value ? "selected" : ""}>${label}</option>`).join("")}</select>`;
}

function callbacksFilterButton() {
  return `<button class="btn ${statusFilter === "callback_requested" ? "warn" : ""}" type="button" onclick="statusFilter='callback_requested';orderPage=1;render()">Callbacks</button>`;
}

function uid(prefix, existing) {
  const deletedIdsByPrefix = {
    C: state.deletedCustomers || [],
    P: state.deletedProducts || [],
    SO: state.deletedOrders || [],
  };
  const nums = [...existing, ...(deletedIdsByPrefix[prefix] || []).map((id) => ({ id }))]
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
  return state.products.filter((product) => !isSoftDeleted(product) && canAccessProduct(product));
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

function purchaseOrderNumber(order = {}) {
  return String(order.purchase_order_number || order.purchaseOrderNumber || order.purchaseOrder || "").trim();
}

function customerAccountNumber(customer = {}) {
  return String(customer?.account_number || customer?.accountNumber || "").trim();
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
  if (view === "settings" && isSuperAdmin() && !backupStatus && !backupLoading) loadBackupSettings({ render: false });
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
  const savedLogin = loadSavedLoginCredentials();
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
        <form class="login-form" autocomplete="on" onsubmit="login(event)" onanimationstart="syncCredentialFields()">
          <div class="field">
            <label for="loginUsername">Username</label>
            <input id="loginUsername" name="username" autocomplete="username" value="${html(savedLogin.username)}" onfocus="syncCredentialFields()" oninput="syncCredentialFields()" onchange="syncCredentialFields()" onanimationstart="syncCredentialFields()" required />
          </div>
          <div class="field">
            <label for="loginPassword">Password</label>
            <input id="loginPassword" name="password" type="password" autocomplete="current-password" value="${html(savedLogin.password)}" onfocus="syncCredentialFields()" oninput="syncCredentialFields()" onchange="syncCredentialFields()" onanimationstart="syncCredentialFields()" required />
          </div>
          <button class="btn primary" type="submit">→ Log In</button>
          <button class="btn" type="button" onclick="clearLoginFields()">Use another account</button>
        </form>
        <div class="login-help">
          <span>Ask admin for forgot password</span>
        </div>
      </section>
    </main>
  `;
}

function login(event) {
  event.preventDefault();
  syncCredentialFields();
  const username = document.querySelector("#loginUsername").value.trim().toLowerCase();
  const password = document.querySelector("#loginPassword").value;
  const user = state.users.find((item) => item.username === username && item.password === password);
  if (!user) {
    loginDraft.password = "";
    const passwordInput = document.querySelector("#loginPassword");
    if (passwordInput) passwordInput.value = "";
    passwordInput?.focus();
    toast("Login failed. Check the username and password.");
    return;
  }
  currentSessionPassword = password;
  rememberLoginCredentials(username);
  saveCurrentUser(user);
  view = "dashboard";
  search = "";
  render();
}

function logout() {
  currentUser = null;
  currentSessionPassword = "";
  loginDraftInitialized = false;
  loginDraft = { username: "", password: "" };
  localStorage.removeItem("alliedErpUser");
  view = "dashboard";
  render();
}

function render() {
  if (!currentUser) {
    if (document.querySelector(".login-screen")) return;
    renderLogin();
    return;
  }

  const titles = {
    dashboard: ["Operations Dashboard", "Sales activity, order risk, and inventory signals."],
    orders: ["Customer Orders", "Enter customer orders and submit them for assistant verification."],
    products: ["Products", "Maintain catalog products and pricing."],
    customers: ["Customers", "Manage customer contacts and payment terms."],
    users: ["Users", "Add sales reps and manage app logins."],
    settings: ["Settings", "Manage appearance, preferences, and protected system tools."],
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
          ${navButton("settings", "S", "Settings")}
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
  return `<button class="${view === target ? "active" : ""}" onclick="setView('${target}')"><span class="ico">${icon}</span><span>${label}</span></button>`;
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
  return account;
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
  const toShip = orders.filter((order) => order.status === "sent_to_shipping").length;
  const recent = newestOrdersFirst(orders).slice(0, 5);

  return `
    <div class="grid metrics">
      ${isShipping() ? `${metric("Orders Sent to Shipping", toShip, "Ready for shipping")}` : `${metric("Open Orders", openOrders, "Need verification or follow-up")}${metric("Order Value", money.format(revenue), "Across saved orders")}${metric("Follow Ups", orders.filter((order) => order.followUp?.date).length, "Scheduled order follow-ups")}${metric("Verified", verified, "Passed assistant verification")}`}
    </div>
    <div class="section split">
      <div class="panel">
        <div class="panel-head"><h2 class="panel-title">Recent Customer Orders</h2><div class="toolbar">${statusFilterControl()}${callbacksFilterButton()}<button class="btn" onclick="setView('orders')">View All</button></div></div>
        <div class="table-wrap">${ordersTable(recent, false, { showVerificationBadge: false })}</div>
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
  const rows = newestOrdersFirst(filteredOrders(visibleOrders()).filter((order) => {
    const customer = customerById(order.customerId);
    return `${order.id} ${customer?.name} ${order.rep} ${order.status} ${order.notes || ""} ${displayOrderNumber(order)}`.toLowerCase().includes(query);
  }));
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / orderPageSize));
  if (orderPage > totalPages) orderPage = totalPages;
  if (orderPage < 1) orderPage = 1;
  const start = total ? (orderPage - 1) * orderPageSize : 0;
  const pageRows = rows.slice(start, start + orderPageSize);
  const showingStart = total ? start + 1 : 0;
  const showingEnd = Math.min(start + orderPageSize, total);
  return `
    <div class="panel">
      <div class="panel-head">
        <h2 class="panel-title">Customer Order List</h2>
        <div class="toolbar">${statusFilterControl()}${callbacksFilterButton()}<label class="compact-select">Show <select onchange="orderPageSize=Number(this.value);orderPage=1;render()">${[25, 50, 100].map((size) => `<option value="${size}" ${orderPageSize === size ? "selected" : ""}>${size}</option>`).join("")}</select></label><button class="btn" onclick="toggleAll('.order-select', true)">Select All</button><button class="btn danger" onclick="deleteSelectedOrders()">Delete Selected</button><input class="search" placeholder="Search orders" value="${html(search)}" oninput="search=this.value;orderPage=1;render()" /></div>
      </div>
      <div class="pagination-bar">
        <span>Showing ${showingStart}-${showingEnd} of ${total} orders</span>
        <div class="pagination-actions">
          <button class="btn" onclick="orderPage=Math.max(1,orderPage-1);render()" ${orderPage <= 1 ? "disabled" : ""}>Previous</button>
          <span>Page ${orderPage} of ${totalPages}</span>
          <button class="btn" onclick="orderPage=Math.min(${totalPages},orderPage+1);render()" ${orderPage >= totalPages ? "disabled" : ""}>Next</button>
        </div>
      </div>
      <div class="table-wrap">${ordersTable(pageRows, true)}</div>
    </div>
  `;
}

function ordersTable(orders, actions = false, options = {}) {
  const showVerificationBadge = options.showVerificationBadge !== false;
  if (!orders.length) return `<div class="empty">No customer orders found.</div>`;
  return `<table>
    <thead><tr>${actions ? "<th></th>" : ""}<th>Order</th><th>Customer</th><th>Rep</th><th>Date</th><th>Total</th><th>Status</th>${actions ? "<th>Actions</th>" : ""}</tr></thead>
    <tbody>
      ${orders
        .map((order) => {
          const customer = customerById(order.customerId);
          const adminFollowUpNotes = isAdmin() && !actions && order.followUp?.notes ? `<div class="metric-note">Follow Up: ${html(order.followUp.notes)}</div>` : "";
          const customerCell = `${html(customer?.name || "Unknown customer")}${vapiChangeBadge(order)}${adminFollowUpNotes}`;
          const vapiNoteCount = vapiNotesForOrder(order).length || Number(order.vapi_notes_count || 0);
          const notesWarn = pendingVapiChange(order) ? " warn" : "";
          const callbackNote = order.status === "callback_requested" ? latestCallbackNote(order) : "";
          return `<tr>
            ${actions ? `<td><input class="order-select" type="checkbox" value="${html(order.id)}" /></td>` : ""}
            <td><strong>${html(displayOrderNumber(order))}</strong><div class="metric-note">${orderPartLabel(order)}${order.notes ? ` ${html(order.notes)}` : ""}</div></td>
            <td>${customerCell}<div class="metric-note">${html(statusLabel(order.status))}${order.statusChangedAt ? ` · ${html(order.statusChangedAt)}` : ""}</div>${callbackNote ? `<div class="metric-note warning-note" title="${html(callbackNote)}">Callback: ${html(callbackNote.length > 90 ? `${callbackNote.slice(0, 87)}...` : callbackNote)}</div>` : ""}</td>
            <td>${html(order.rep)}</td>
            <td>${html(order.date)}</td>
            <td>${money.format(orderTotal(order))}</td>
            <td>${statusCell(order, { showVerificationBadge })}</td>
            ${actions ? `<td><div class="row-actions">
              <button class="icon-btn" title="Edit order" onclick="openOrderForm('${order.id}')">✎</button>
              <button class="btn mini-btn${notesWarn}" type="button" onclick="openVapiNotes('${order.id}')" aria-label="Open Vapi notes for ${html(displayOrderNumber(order))}">Vapi Notes (${vapiNoteCount})</button>
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

function hasAssistantVerification(order) {
  return Boolean(
    order.status === "verification_in_progress"
      || order.verification?.method === "Assistant"
      || order.verification?.vapiCallId
      || (Array.isArray(order.verificationHistory) && order.verificationHistory.some((entry) => entry.callId || entry.outcome))
  );
}

function verificationStatusKey(order) {
  const state = String(order.verification?.state || "").toLowerCase();
  if (order.status === "verification_in_progress" || state === "verification_in_progress") return "calling";
  if (order.status === "verified" || state === "verified") return "verified";
  if (order.status === "cancelled" || state === "cancelled") return "cancelled";
  if (state === "voicemail") return "voicemail";
  if (state === "callback_requested") return "callback_requested";
  if (state === "issue" || order.verification?.outcome === "callback_requested") return "issue";
  if (state === "no_answer") return "no_answer";
  if (state === "failed" || order.status === "issue") return "failed";
  if (state === "needs_review" || state === "unknown") return "needs_review";
  return "pending";
}

function verificationStatusLabel(key) {
  return {
    pending: "Pending",
    calling: "Calling",
    verified: "Verified",
    cancelled: "Cancelled",
    issue: "Issue",
    voicemail: "Voicemail",
    callback_requested: "Callback Requested",
    no_answer: "No Answer",
    failed: "Failed",
    needs_review: "Needs Review",
  }[key] || "Pending";
}

function verificationStatusBadge(order) {
  if (!hasAssistantVerification(order)) return "";
  const key = verificationStatusKey(order);
  console.log("[frontend-state] field name displayed in Sales Order screen:", orderStatusDebugSnapshot(order));
  return `<span class="status verification-status ${key}">Verification: ${verificationStatusLabel(key)}</span>`;
}

function pendingVapiChange(order) {
  return Boolean(order?.has_vapi_changes && (order.vapi_change_review_status || "Pending Review") === "Pending Review");
}

function vapiChangeBadge(order) {
  if (!pendingVapiChange(order)) return "";
  return `<div class="change-flag" role="status" aria-label="Customer change reported during Vapi verification">⚠ Customer Change Reported</div>`;
}

function vapiNotesForOrder(order) {
  return (Array.isArray(order?.vapiNotes) ? order.vapiNotes : []).slice().sort((a, b) => Date.parse(b.created_at || b.call_ended_at || "") - Date.parse(a.created_at || a.call_ended_at || ""));
}

function vapiChangeAlert(order) {
  if (!order?.has_vapi_changes) return "";
  const pending = pendingVapiChange(order);
  const corrections = customerCorrectionsForOrder(order);
  return `<div class="change-alert ${pending ? "pending" : ""}" role="alert">
    <strong>Customer information changes were reported during the Vapi verification call.</strong>
    <div class="note-grid">
      <div><span>Change Summary</span><p>${html(order.vapi_change_summary || "No summary was provided.")}</p></div>
      <div><span>Call Date</span><p>${html(order.vapi_change_detected_at || "Not available")}</p></div>
      <div><span>Call ID</span><p>${html(order.vapi_change_call_id || "Not available")}</p></div>
      <div><span>Review Status</span><p>${html(order.vapi_change_review_status || "Pending Review")}</p></div>
    </div>
    ${corrections.length ? `<div class="corrections-list">${corrections.map(correctionCard).join("")}</div>` : ""}
    <div class="inline-actions">
      <button class="btn mini-btn" type="button" onclick="openVapiNotes('${order.id}')">Review Changes</button>
      ${pending ? `<button class="btn mini-btn primary" type="button" onclick="setVapiChangeReviewStatus('${order.id}', 'Reviewed')">Mark Reviewed</button>` : ""}
    </div>
  </div>`;
}

function customerCorrectionsForOrder(order = {}) {
  return Array.isArray(order.customerChangeRequests) ? order.customerChangeRequests : [];
}

function correctionCard(change) {
  return `<div class="correction-card">
    <div><strong>${html(change.label || change.field || "Customer Correction")}</strong><span class="status verification-status issue">${html(change.status || "Pending Review")}</span></div>
    <div class="note-grid">
      ${change.product_name ? `<div><span>Product</span><p>${html(change.product_name)}</p></div>` : ""}
      <div><span>Current Value</span><p>${html(change.current_value || "Not provided")}</p></div>
      <div><span>Customer Stated</span><p>${html(change.customer_value || "Not provided")}</p></div>
    </div>
    ${change.status === "Pending Review" ? `<div class="inline-actions"><button class="btn mini-btn primary" type="button" onclick="resolveCustomerCorrection('${html(change.order_id)}', '${html(change.id)}', 'Accepted')">Accept Change</button><button class="btn mini-btn" type="button" onclick="resolveCustomerCorrection('${html(change.order_id)}', '${html(change.id)}', 'Rejected')">Reject Change</button></div>` : ""}
  </div>`;
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

function statusCell(order, options = {}) {
  const showVerificationBadge = options.showVerificationBadge !== false;
  const verificationKey = verificationStatusKey(order);
  const replaceInProgressStatus = showVerificationBadge && order.status === "verification_in_progress" && hasAssistantVerification(order) && !["calling", "pending"].includes(verificationKey);
  return `
    <div class="status-cell">
      ${replaceInProgressStatus ? "" : statusBadge(order.status)}
      ${showVerificationBadge ? verificationStatusBadge(order) : ""}
      ${pendingVapiChange(order) ? `<div class="metric-note warning-note" aria-label="Customer change review pending">⚠ Customer change review pending</div>` : ""}
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
    ["verified", "Verified"],
    ["issue", "Issue"],
    ["credit_hold", "Credit Hold"],
    ["kickback_pending", "Kickback Pending"],
    ["callback_requested", "Callback Requested"],
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
    ["callback_requested", "Callback Requested"],
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
  if (["verified", "pending_ap", "issue", "callback_requested", "cancelled", "credit_hold", "kickback_pending", "partial_ship", "sent_to_shipping", "order_shipped", "completed"].includes(status)) {
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

function openVapiNotes(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!canAccessOrder(order)) return toast("You can only view notes for orders you can access.");
  const notes = vapiNotesForOrder(order);
  const customer = customerById(order.customerId);
  openModal(`
    <div class="modal-head"><h2>Vapi Notes · ${html(displayOrderNumber(order))}</h2><button class="icon-btn" title="Close" onclick="closeModal()">×</button></div>
    <div class="panel-body">
      <div class="chat-context">
        <strong>${html(customer?.name || "Unknown customer")}</strong>
        <span>Source: Vapi Verification Call · ${notes.length} ${notes.length === 1 ? "note" : "notes"}</span>
      </div>
      ${vapiChangeAlert(order)}
      <div class="vapi-notes-list">
        ${notes.length ? notes.map((note) => vapiNoteCard(order, note)).join("") : `<div class="empty">No Vapi call notes have been saved for this order yet.</div>`}
      </div>
    </div>
  `);
}

function vapiNoteCard(order, note) {
  const outcome = String(note.verification_outcome || "UNKNOWN").toLowerCase();
  const date = note.call_ended_at || note.created_at || "";
  const pending = note.change_review_status === "Pending Review";
  return `<article class="vapi-note-card ${pending ? "pending" : ""}">
    <div class="vapi-note-head">
      <div>
        <span class="status verification-status ${outcome}">${html(verificationStatusLabel(outcome))}</span>
        <strong>${html(date || "No call date")}</strong>
      </div>
      <button class="btn mini-btn" type="button" onclick="copyVapiNote('${order.id}', '${html(note.id)}')">Copy Notes</button>
    </div>
    <div class="note-grid">
      <div><span>Summary</span><p>${html(note.summary || "No summary was provided.")}</p></div>
      ${note.cancellation_reason ? `<div><span>Cancellation Reason</span><p>${html(note.cancellation_reason)}</p></div>` : ""}
      ${note.callback_notes ? `<div><span>Callback Notes</span><p>${html(note.callback_notes)}</p></div>` : ""}
      ${note.verified_items ? `<div><span>Verified Items</span><p>${html(note.verified_items)}</p></div>` : ""}
      ${note.purchase_order_note ? `<div><span>Purchase Order Number</span><p>${html(note.purchase_order_note)}</p></div>` : ""}
      ${note.unit_classification_changes ? `<div><span>Unit Classification Changes</span><p>${html(note.unit_classification_changes)}</p></div>` : ""}
      ${note.change_summary ? `<div><span>Change Summary</span><p>${html(note.change_summary)}</p></div>` : ""}
      <div><span>Review Status</span><p>${html(note.change_review_status || "No changes reported")}</p></div>
      <div><span>Call Duration</span><p>${html(note.call_duration || "Not available")}</p></div>
      <div><span>Phone Number</span><p>${html(note.phone_number || "Not available")}</p></div>
      <div><span>Call ID</span><p>${html(note.vapi_call_id || "Not available")}</p></div>
    </div>
    <div class="inline-actions">
      ${pending ? `<button class="btn mini-btn primary" type="button" onclick="setVapiChangeReviewStatus('${order.id}', 'Reviewed')">Mark Reviewed</button><button class="btn mini-btn" type="button" onclick="setVapiChangeReviewStatus('${order.id}', 'Accepted')">Accept</button><button class="btn mini-btn" type="button" onclick="setVapiChangeReviewStatus('${order.id}', 'Rejected')">Reject</button>` : ""}
    </div>
    <details class="transcript-toggle">
      <summary>Show Transcript</summary>
      <pre>${html(note.transcript || "No transcript was saved for this call.")}</pre>
    </details>
  </article>`;
}

function copyVapiNote(orderId, noteId) {
  const order = state.orders.find((item) => item.id === orderId);
  const note = vapiNotesForOrder(order).find((item) => item.id === noteId);
  if (!note) return toast("Vapi note was not found.");
  const text = [
    `Order: ${displayOrderNumber(order)}`,
    `Outcome: ${note.verification_outcome || ""}`,
    `Summary: ${note.summary || ""}`,
    note.cancellation_reason ? `Cancellation reason: ${note.cancellation_reason}` : "",
    note.callback_notes ? `Callback notes: ${note.callback_notes}` : "",
    note.verified_items ? `Verified items: ${note.verified_items}` : "",
    note.purchase_order_note ? `Purchase order number: ${note.purchase_order_note}` : "",
    note.unit_classification_changes ? `Unit classification changes: ${note.unit_classification_changes}` : "",
    note.change_summary ? `Change summary: ${note.change_summary}` : "",
    `Review status: ${note.change_review_status || ""}`,
    `Call ID: ${note.vapi_call_id || ""}`,
  ].filter(Boolean).join("\n");
  navigator.clipboard?.writeText(text).then(() => toast("Vapi notes copied."), () => toast(text));
}

function setVapiChangeReviewStatus(orderId, status) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!canAccessOrder(order)) return toast("You can only review changes for orders you can access.");
  const note = window.prompt("Optional review note:") || "";
  const previous = order.vapi_change_review_status || "Pending Review";
  order.vapi_change_review_status = status;
  order.vapi_change_reviewed_by = currentUser?.name || "";
  order.vapi_change_reviewed_at = timestamp();
  order.vapi_change_review_note = note.trim();
  if (Array.isArray(order.vapiNotes)) {
    order.vapiNotes = order.vapiNotes.map((item) => item.change_review_status === "Pending Review" ? { ...item, change_review_status: status, reviewed_by: order.vapi_change_reviewed_by, reviewed_at: order.vapi_change_reviewed_at, review_note: order.vapi_change_review_note } : item);
  }
  if (!Array.isArray(order.auditLog)) order.auditLog = [];
  order.auditLog.push({
    action: status === "Reviewed" ? "Change reviewed" : `Change ${status.toLowerCase()}`,
    order_number: order.id,
    vapi_call_id: order.vapi_change_call_id || "",
    employee: currentUser?.name || "",
    timestamp: new Date().toISOString(),
    previous_status: previous,
    new_status: status,
    note: order.vapi_change_review_note,
  });
  saveState();
  render();
  openVapiNotes(orderId);
  toast(`Vapi change marked ${status}.`);
}

function resolveCustomerCorrection(orderId, correctionId, status) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!canAccessOrder(order)) return toast("You can only review changes for orders you can access.");
  const change = customerCorrectionsForOrder(order).find((item) => item.id === correctionId);
  if (!change) return toast("Customer correction was not found.");
  const previous = change.status || "Pending Review";
  if (status === "Accepted" && change.field === "purchase_order_number") {
    order.purchase_order_number = change.customer_value || "";
  }
  if (status === "Accepted" && change.field === "unit_of_measure") {
    const unit = unitOfMeasureById(change.requested_unit_of_measure_id) || unitOfMeasureByName(change.customer_value);
    const lineIndex = Number(change.line_index);
    if (unit && Number.isInteger(lineIndex) && order.items?.[lineIndex]) {
      order.items[lineIndex].unit_of_measure_id = unit.id;
      order.items[lineIndex].unit_of_measure_snapshot = unitSnapshot(unit);
    }
  }
  change.status = status;
  change.reviewed_by = currentUser?.name || "";
  change.reviewed_at = timestamp();
  if (Array.isArray(order.vapiNotes)) {
    order.vapiNotes = order.vapiNotes.map((note) => note.vapi_call_id === change.vapi_call_id ? { ...note, change_review_status: status } : note);
  }
  if (!order.customerChangeRequests.some((item) => item.status === "Pending Review")) {
    order.vapi_change_review_status = status;
    order.vapi_change_reviewed_by = change.reviewed_by;
    order.vapi_change_reviewed_at = change.reviewed_at;
  }
  if (!Array.isArray(order.auditLog)) order.auditLog = [];
  order.auditLog.push({
    action: status === "Accepted" ? "Change accepted" : "Change rejected",
    order_number: order.id,
    vapi_call_id: change.vapi_call_id || "",
    employee: currentUser?.name || "",
    timestamp: new Date().toISOString(),
    previous_status: previous,
    new_status: status,
    field: change.field,
    old_value: change.current_value || "",
    new_value: change.customer_value || "",
  });
  saveState();
  render();
  openVapiNotes(orderId);
  toast(status === "Accepted" ? `${change.label || "Customer correction"} updated.` : `${change.label || "Customer correction"} rejected.`);
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
      const unit = lineUnitOfMeasure(item);
      return `<tr>
        <td>${html(product.sku || "")}</td>
        <td>${html(product.name || "")}</td>
        <td>${html(item.qty)}</td>
        <td>${html(Number(item.qty) === 1 ? unit.singular_name : unit.plural_name)}</td>
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
          <div class="row"><span>Purchase Order Number</span><strong>${html(purchaseOrderNumber(order) || "Not provided")}</strong></div>
          <div class="row"><span>Account Type</span><strong>${html(accountStatusLabel(order.accountStatus || "old"))}</strong></div>
          <div class="row"><span>Ship Date</span><strong>${html(order.shipDate || "")}</strong></div>
          <div class="row"><span>Tracking</span><strong>${html(order.trackingInfo || "")}</strong></div>
          <div class="row"><span>Customer Card PO</span><strong>${html(customer.purchaseOrder || "Not provided")}</strong></div>
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
        <thead><tr><th>SKU</th><th>Product</th><th>Qty</th><th>Unit</th><th>Unit Price</th><th>Line Total</th></tr></thead>
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
    const unit = lineUnitOfMeasure(item);
    return `<tr><td>${html(product.sku || "")}</td><td>${html(product.name || "")}</td><td>${html(item.qty)}</td><td>${html(Number(item.qty) === 1 ? unit.singular_name : unit.plural_name)}</td><td></td><td></td></tr>`;
  }).join("");
  return `<!doctype html><html><head><meta charset="UTF-8" /><title>${html(displayOrderNumber(order))} - Packing List</title><style>body{font-family:Arial,sans-serif;color:#17212b}.doc{max-width:850px;margin:0 auto;padding:32px}.head{display:flex;justify-content:space-between;border-bottom:2px solid #17212b;padding-bottom:14px}.muted{color:#5b6673;font-size:13px;line-height:1.5}table{width:100%;border-collapse:collapse;margin-top:22px}th,td{border-bottom:1px solid #d8dee6;padding:10px;text-align:left}th{background:#f4f6f8}.box{border:1px solid #d8dee6;border-radius:8px;padding:14px;margin-top:18px}.footer{border-top:1px solid #d8dee6;margin-top:24px;padding-top:14px;text-align:center;font-size:12px;color:#5b6673}.print-actions{text-align:right;margin-bottom:12px}button{background:#176f73;color:#fff;border:0;border-radius:6px;padding:8px 12px}@media print{.print-actions{display:none}.doc{padding:0}}</style></head><body><main class="doc"><div class="print-actions"><button onclick="window.print()">Print</button></div><section class="head"><div><h1>Packing List</h1><div class="muted">Allied Industrial Supplies, Inc.</div><div class="muted">Alliedsupplies.net</div></div><div><strong>Order # ${html(displayOrderNumber(order))}</strong>${order.partNumber ? `<div class="muted">${orderPartLabel(order)}</div>` : ""}<div class="muted">Ship Date: ${html(order.shipDate || "")}</div><div class="muted">Tracking: ${html(order.trackingInfo || "")}</div></div></section><section class="box"><strong>${html(customer.name || "")}</strong><div class="muted">${html(address.address)}</div><div class="muted">${html(address.city)} ${html(address.state)} ${html(address.zip)}</div></section><table><thead><tr><th>SKU</th><th>Product</th><th>Qty Ordered</th><th>Unit</th><th>Qty Packed</th><th>Back Ordered</th></tr></thead><tbody>${lines}</tbody></table><section class="box"><div>Picked By: ____________________</div><br><div>Checked By: ____________________</div></section><footer class="footer"><strong>Alliedsupplies.net</strong><br>No Returns without prior Authorization</footer></main></body></html>`;
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
  const historyRows = (order.verificationHistory || []).map((entry) => `
    <tr>
      <td>${html([entry.date, entry.time].filter(Boolean).join(" "))}</td>
      <td>${html(entry.outcome || "")}</td>
      <td>${html(entry.callId || "")}</td>
      <td>${html(entry.duration || "")}</td>
      <td>${html(entry.phoneNumber || "")}</td>
      <td>${html(entry.summary || "")}</td>
      <td>${html(entry.user || entry.assistantName || "")}</td>
    </tr>
    ${entry.transcript ? `<tr><td colspan="6"><strong>Transcript:</strong> <span class="muted">${html(entry.transcript)}</span></td></tr>` : ""}
  `).join("");
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
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border-bottom: 1px solid #eef2f5; padding: 8px; text-align: left; font-size: 12px; vertical-align: top; }
      th { color: #5b6673; text-transform: uppercase; font-size: 11px; background: #f8fafb; }
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
      ${historyRows ? `<section class="box"><h2>Verification History</h2><table><thead><tr><th>Date/Time</th><th>Outcome</th><th>Call ID</th><th>Duration</th><th>Phone</th><th>Summary</th><th>User</th></tr></thead><tbody>${historyRows}</tbody></table></section>` : ""}
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
    `${customer.name} ${customerAccountNumber(customer)} ${customer.contact} ${customer.email} ${customer.phone} ${customer.address} ${customer.city} ${customer.state} ${customer.zip} ${customer.promoNumber} ${customer.purchaseOrder} ${customer.terms}`.toLowerCase().includes(query)
  );
  return `
    <div class="panel">
      <div class="panel-head">
        <h2 class="panel-title">Customer Accounts</h2>
        <div class="toolbar"><button class="btn" onclick="toggleAll('.customer-select', true)">Select All</button><button class="btn danger" onclick="deleteSelectedCustomers()">Delete Selected</button><input class="search" placeholder="Search customers" value="${html(search)}" oninput="search=this.value;render()" /></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th></th><th>Customer</th><th>Account #</th><th>Contact</th><th>Address</th><th>Promo #</th><th>Purchase Order</th><th>Terms</th><th>Actions</th></tr></thead>
          <tbody>${rows
            .map(
              (customer) => `<tr>
                <td><input class="customer-select" type="checkbox" value="${html(customer.id)}" /></td>
                <td><strong>${html(customer.name)}</strong></td>
                <td>${html(customerAccountNumber(customer) || "Not provided")}</td>
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
  const deletedCustomers = state.customers.filter((customer) => isSoftDeleted(customer));
  const deletedProducts = state.products.filter((product) => isSoftDeleted(product));
  const preference = themePreference();
  const dataSection = isSuperAdmin() ? dataBackupsSection(deletedCustomers, deletedProducts) : "";
  return `
    <div class="split">
      <div class="panel">
        <div class="panel-head"><h2 class="panel-title">Appearance</h2></div>
        <div class="panel-body form-grid">
          <div class="field full"><div class="callout">Choose the ERP theme for this browser. The setting is saved and applied before the app renders.</div></div>
          <div class="field">
            <label><input type="radio" name="themePreference" value="light" ${preference === "light" ? "checked" : ""} onchange="setThemePreference(this.value)" /> Light Mode</label>
          </div>
          <div class="field">
            <label><input type="radio" name="themePreference" value="dark" ${preference === "dark" ? "checked" : ""} onchange="setThemePreference(this.value)" /> Dark Mode</label>
          </div>
          <div class="field">
            <label><input type="radio" name="themePreference" value="system" ${preference === "system" ? "checked" : ""} onchange="setThemePreference(this.value)" /> Use System Theme</label>
          </div>
        </div>
      </div>
      ${isSuperAdmin() ? `<div class="panel">
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
      </div>` : ""}
      <div class="panel">
        <div class="panel-head"><h2 class="panel-title">Unit of Measure Classifications</h2><div class="toolbar">${isAdmin() ? `<button class="btn" onclick="addUnitOfMeasure()">+ Add</button>` : ""}</div></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Display</th><th>Singular</th><th>Plural</th><th>Abbrev.</th><th>Status</th><th>Sort</th><th>Actions</th></tr></thead>
            <tbody>${state.unitOfMeasures.map((unit) => `<tr>
              <td><strong>${html(unit.name)}</strong></td>
              <td>${html(unit.singular_name)}</td>
              <td>${html(unit.plural_name)}</td>
              <td>${html(unit.abbreviation || "")}</td>
              <td>${unit.is_active === false ? "Inactive" : "Active"}</td>
              <td>${html(unit.sort_order || "")}</td>
              <td><div class="row-actions">${isAdmin() ? `<button class="icon-btn" title="Edit classification" onclick="editUnitOfMeasure('${unit.id}')">✎</button><button class="btn mini-btn" onclick="toggleUnitOfMeasure('${unit.id}')">${unit.is_active === false ? "Activate" : "Deactivate"}</button><button class="icon-btn" title="Move up" onclick="moveUnitOfMeasure('${unit.id}', -1)">↑</button><button class="icon-btn" title="Move down" onclick="moveUnitOfMeasure('${unit.id}', 1)">↓</button>` : ""}</div></td>
            </tr>`).join("")}</tbody>
          </table>
        </div>
      </div>
      ${dataSection}
    </div>
  `;
}

function dataBackupsSection(deletedCustomers, deletedProducts) {
  const status = backupStatus;
  const dataFile = status?.data_file || {};
  const counts = status?.record_counts || {};
  const storage = status?.storage_usage || {};
  return `
    <div class="panel">
      <div class="panel-head"><h2 class="panel-title">Data & Backups</h2><div class="toolbar"><button class="btn" onclick="loadBackupSettings()">Refresh</button><button class="btn primary" onclick="createBackupNow()" ${backupLoading ? "disabled" : ""}>Backup Now</button><button class="btn" onclick="downloadCurrentBackup()">Download Current</button></div></div>
      <div class="panel-body">
        <div class="callout">Super Admin only. Allied ERP is currently using JSON-file persistence stored in ALLIED_ERP_DATA_DIR, not PostgreSQL.</div>
        <div class="grid metrics">
          ${metric("ERP Data File Size", dataFile.size_label || "Unknown", dataFile.modified_at ? `Modified ${dataFile.modified_at}` : "shared-state.json")}
          ${metric("Orders", counts.orders ?? "-", "Saved sales orders")}
          ${metric("Customers", counts.customers ?? "-", "Saved customers")}
          ${metric("Products", counts.products ?? "-", "Saved products")}
          ${metric("Backups", storage.backups_count ?? "-", storage.backups_size ? `${formatClientBytes(storage.backups_size)} stored` : "Backup history")}
          ${metric("ERP Storage", storage.total_erp_managed_size_label || "Unknown", storage.disk_capacity_label || "Disk capacity unavailable")}
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Backup File</th><th>Created</th><th>Size</th><th>Type</th><th>Actions</th></tr></thead>
          <tbody>${backupHistory.map((backup) => `<tr>
            <td><strong>${html(backup.filename)}</strong></td>
            <td>${html(backup.modified_at || backup.created_at || "")}</td>
            <td>${html(backup.size_label || formatClientBytes(backup.size))}</td>
            <td>${html(backup.type || "Automatic")}</td>
            <td><button class="btn mini-btn" onclick="downloadBackup('${html(backup.filename)}')">Download</button><button class="btn mini-btn danger" onclick="confirmRestoreBackup('${html(backup.filename)}')">Restore</button></td>
          </tr>`).join("") || `<tr><td colspan="5"><div class="empty">No backups found.</div></td></tr>`}</tbody>
        </table>
      </div>
    </div>
    <div class="panel">
      <div class="panel-head"><h2 class="panel-title">Deleted Records</h2></div>
      <div class="panel-body">
        <div class="callout">Deleted production records are hidden from normal lists but retained here for recovery.</div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Type</th><th>Name</th><th>Deleted At</th><th>Deleted By</th><th>Actions</th></tr></thead>
          <tbody>${[...deletedCustomers.map((customer) => ({ type: "Customer", id: customer.id, name: customer.name, at: customer.deleted_at, by: customer.deleted_by })), ...deletedProducts.map((product) => ({ type: "Product", id: product.id, name: product.name || product.sku, at: product.deleted_at, by: product.deleted_by }))].map((record) => `<tr>
            <td>${html(record.type)}</td>
            <td><strong>${html(record.name || record.id)}</strong></td>
            <td>${html(record.at || "")}</td>
            <td>${html(record.by || "")}</td>
            <td><button class="btn mini-btn" onclick="restoreDeletedRecord('${record.type.toLowerCase()}', '${html(record.id)}')">Restore</button></td>
          </tr>`).join("") || `<tr><td colspan="5"><div class="empty">No deleted customer or product records.</div></td></tr>`}</tbody>
        </table>
      </div>
    </div>
  `;
}

function formatClientBytes(bytes = 0) {
  const value = Number(bytes) || 0;
  if (value >= 1024 * 1024 * 1024) return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`;
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(2)} MB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${value} B`;
}

function backupAuthHeaders() {
  return {
    "X-Allied-Username": currentUser?.username || "",
    "X-Allied-Password": currentPasswordForProtectedAction(),
  };
}

async function settingsApi(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...backupAuthHeaders(),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok || body.ok === false) throw new Error(body.error || `Request failed with ${response.status}`);
  return body;
}

async function loadBackupSettings(options = {}) {
  if (!isSuperAdmin()) return;
  backupLoading = true;
  if (options.render !== false) render();
  try {
    const [statusResult, backupsResult] = await Promise.all([
      settingsApi("./api/settings/data-status"),
      settingsApi("./api/settings/backups"),
    ]);
    backupStatus = statusResult.status;
    backupHistory = backupsResult.backups || [];
  } catch (error) {
    toast(`Backup settings error: ${error.message}`);
  } finally {
    backupLoading = false;
    if (options.render !== false) render();
  }
}

async function createBackupNow() {
  if (!isSuperAdmin()) return toast("Only Super Admin can create backups.");
  backupLoading = true;
  render();
  try {
    const result = await settingsApi("./api/settings/backups", { method: "POST", body: "{}" });
    toast(`Backup created: ${result.backup?.filename || "success"}`);
    await loadBackupSettings({ render: false });
  } catch (error) {
    toast(`Backup failed: ${error.message}`);
  } finally {
    backupLoading = false;
    render();
  }
}

async function downloadWithAuth(url, fallbackName = "allied-erp-backup.json") {
  try {
    const response = await fetch(url, { headers: backupAuthHeaders(), cache: "no-store" });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || `Download failed with ${response.status}`);
    }
    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition") || "";
    const filename = disposition.match(/filename="([^"]+)"/)?.[1] || fallbackName;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    toast(`Download failed: ${error.message}`);
  }
}

function downloadCurrentBackup() {
  if (!isSuperAdmin()) return toast("Only Super Admin can download backups.");
  downloadWithAuth("./api/settings/backups/current/download", "shared-state-current.json");
}

function downloadBackup(filename) {
  if (!isSuperAdmin()) return toast("Only Super Admin can download backups.");
  downloadWithAuth(`./api/settings/backups/${encodeURIComponent(filename)}/download`, filename);
}

function confirmRestoreBackup(filename) {
  if (!isSuperAdmin()) return toast("Only Super Admin can restore backups.");
  openModal(`
    <div class="modal-head"><h2>Restore Backup</h2><button class="icon-btn" title="Close" onclick="closeModal()">×</button></div>
    <form onsubmit="restoreBackup(event, '${html(filename)}')">
      <div class="form-grid">
        <div class="field full"><div class="callout danger-callout"><strong>Warning:</strong> restoring replaces the current ERP state. A safety backup will be created first.</div></div>
        <div class="field full"><label>Backup File</label><input value="${html(filename)}" disabled /></div>
        <div class="field full"><label>Type RESTORE to confirm</label><input id="restoreConfirmText" autocomplete="off" oninput="document.querySelector('#restoreSubmit').disabled=this.value.trim()!=='RESTORE'" /></div>
      </div>
      <div class="modal-actions"><button class="btn" type="button" onclick="closeModal()">Cancel</button><button id="restoreSubmit" class="btn danger" type="submit" disabled>Restore Backup</button></div>
    </form>
  `);
}

async function restoreBackup(event, filename) {
  event.preventDefault();
  const confirmation = document.querySelector("#restoreConfirmText")?.value || "";
  try {
    const result = await settingsApi(`./api/settings/backups/${encodeURIComponent(filename)}/restore`, {
      method: "POST",
      body: JSON.stringify({ confirmation }),
    });
    closeModal();
    toast(result.message || "Backup restored.");
    await syncStateFromServer();
    await loadBackupSettings({ render: false });
    render();
  } catch (error) {
    toast(`Restore failed: ${error.message}`);
  }
}

function restoreDeletedRecord(type, id) {
  if (!isSuperAdmin()) return toast("Only Super Admin can restore deleted records.");
  const collection = type === "customer" ? state.customers : type === "product" ? state.products : [];
  const record = collection.find((item) => item.id === id);
  if (!record) return toast("Record was not found.");
  delete record.deleted_at;
  delete record.deleted_by;
  delete record.deletion_reason;
  if (type === "customer") state.deletedCustomers = (state.deletedCustomers || []).filter((deletedId) => deletedId !== id);
  if (type === "product") state.deletedProducts = (state.deletedProducts || []).filter((deletedId) => deletedId !== id);
  auditAction(`Restore ${type}`, type, id, "Super Admin restored deleted record");
  saveState();
  render();
  toast(`${type === "customer" ? "Customer" : "Product"} restored.`);
}

function addUnitOfMeasure() {
  const created = promptForUnitOfMeasure();
  if (created) {
    render();
    toast(`${created.name} added.`);
  }
}

function editUnitOfMeasure(id) {
  const unit = unitOfMeasureById(id);
  if (!unit) return toast("Classification was not found.");
  const updated = promptForUnitOfMeasure(unit);
  if (updated) {
    render();
    toast(`${updated.name} updated.`);
  }
}

function toggleUnitOfMeasure(id) {
  if (!isAdmin()) return toast("Only admins can update classifications.");
  const unit = unitOfMeasureById(id);
  if (!unit) return toast("Classification was not found.");
  unit.is_active = unit.is_active === false;
  unit.updated_at = new Date().toISOString();
  saveState();
  render();
}

function moveUnitOfMeasure(id, direction) {
  if (!isAdmin()) return toast("Only admins can reorder classifications.");
  const units = state.unitOfMeasures;
  const index = units.findIndex((unit) => unit.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= units.length) return;
  const currentSort = units[index].sort_order;
  units[index].sort_order = units[nextIndex].sort_order;
  units[nextIndex].sort_order = currentSort;
  state.unitOfMeasures = normalizeUnitOfMeasures(units);
  saveState();
  render();
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
    : { id: uid("SO", state.orders), customerId: firstCustomer?.id, rep: isAdmin() ? "" : currentUser.name, date: new Date().toISOString().slice(0, 10), status: "pending", partNumber: "", accountNumber: customerAccountNumber(firstCustomer), purchase_order_number: "", notes: "", items: [{ productId: firstProduct?.id, qty: 1, unit_of_measure_id: defaultUnitOfMeasure().id, unit_of_measure_snapshot: unitSnapshot(defaultUnitOfMeasure()), price: firstProduct?.price || 0 }] };
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
      ${vapiChangeAlert(order)}
      <div class="panel-body form-grid">
        <input id="orderId" type="hidden" value="${html(order.id)}" />
        <input id="orderPartNumber" type="hidden" value="${html(order.partNumber || "")}" />
        <div class="field"><label>Date</label><input id="orderDate" type="date" value="${html(order.date)}" required /></div>
        <div class="field"><label>Customer</label><select id="orderCustomer" onchange="handleOrderCustomerChange()"><option value="__add_new__">＋ Add New Customer</option>${state.customers.map((customer) => `<option value="${customer.id}" ${customer.id === order.customerId ? "selected" : ""}>${html(customer.name)}</option>`).join("")}</select></div>
        <div class="field"><label>Sales Rep</label><input id="orderRep" value="${html(order.rep)}" ${isAdmin() ? "" : "readonly"} required /></div>
        <div class="field"><label>Account Number (Optional)</label><input id="accountNumber" value="${html(order.accountNumber || "")}" /></div>
        <div class="field"><label>Purchase Order Number (Optional)</label><input id="purchaseOrderNumber" data-testid="purchase-order-number-input" value="${html(purchaseOrderNumber(order))}" maxlength="100" placeholder="Customer PO number" /></div>
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
  const unit = lineUnitOfMeasure(item);
  const unitOptions = activeUnitOptions(unit.id);
  const price = Number(item.price || product?.price || 0);
  const qty = Number(item.qty || 1);
  return `<div class="line-item">
    <div class="field line-qty-field"><label>Quantity</label><input class="line-qty" type="number" min="1" value="${html(item.qty)}" oninput="updateLineTotal(this)" /></div>
    <div class="field"><label>Ship As / Unit of Measure</label><select class="line-uom" data-testid="line-uom-select" onchange="handleLineUomChange(this)">${unitOptions.map((uom) => `<option value="${html(uom.id)}" ${uom.id === unit.id ? "selected" : ""}>${html(uom.name)}</option>`).join("")}<option value="__add_uom__">+ Add New Classification</option></select></div>
    <div class="field line-product-field"><label>Product</label><select class="line-product" onchange="syncLinePrice(this)">${products.map((p) => `<option value="${p.id}" data-price="${p.price}" ${p.id === item.productId ? "selected" : ""}>${html(p.sku)} - ${html(p.name)}</option>`).join("")}</select></div>
    <div class="field line-price-field"><label>Unit Price</label><input class="line-price" data-testid="sales-order-unit-price-input" type="number" min="0" step="0.01" value="${html(price)}" oninput="updateLineTotal(this)" /></div>
    <div class="field line-total-field"><label>Line Total</label><output class="line-total">${money.format(qty * price)}</output></div>
    <button class="icon-btn line-remove" title="Remove item" type="button" onclick="this.closest('.line-item').remove()">x</button>
  </div>`;
}

function syncLinePrice(select) {
  const price = select.selectedOptions[0].dataset.price;
  select.closest(".line-item").querySelector(".line-price").value = price;
  updateLineTotal(select);
}

function updateLineTotal(control) {
  const row = control.closest(".line-item");
  const qty = Number(row.querySelector(".line-qty")?.value || 0);
  const price = Number(row.querySelector(".line-price")?.value || 0);
  const total = row.querySelector(".line-total");
  if (total) total.textContent = money.format(qty * price);
}
function addLineItem() {
  const product = visibleProducts()[0] || state.products[0];
  const unit = defaultUnitOfMeasure();
  document.querySelector("#lineItems").insertAdjacentHTML("beforeend", lineItemHtml({ productId: product?.id, qty: 1, price: product?.price || 0, unit_of_measure_id: unit.id, unit_of_measure_snapshot: unitSnapshot(unit) }));
}

function handleLineUomChange(select) {
  if (select.value !== "__add_uom__") return;
  const created = promptForUnitOfMeasure();
  if (created) {
    refreshLineUomSelects(select, created.id);
    select.value = created.id;
  } else {
    select.value = defaultUnitOfMeasure().id;
  }
}

function promptForUnitOfMeasure(existing = null) {
  if (existing && !isAdmin()) {
    toast("Only admins can edit shared classifications.");
    return null;
  }
  const name = window.prompt("Display Name", existing?.name || "");
  if (name === null) return null;
  const singular = window.prompt("Singular Name", existing?.singular_name || name.trim().replace(/s$/i, "").toLowerCase());
  if (singular === null) return null;
  const plural = window.prompt("Plural Name", existing?.plural_name || name.trim().toLowerCase());
  if (plural === null) return null;
  const abbreviation = window.prompt("Abbreviation (Optional)", existing?.abbreviation || "") || "";
  return saveUnitOfMeasureRecord({
    ...(existing || {}),
    name: name.trim(),
    singular_name: singular.trim().toLowerCase(),
    plural_name: plural.trim().toLowerCase(),
    abbreviation: abbreviation.trim(),
  });
}

function saveUnitOfMeasureRecord(unit) {
  const name = String(unit.name || "").trim();
  const singular = String(unit.singular_name || "").trim().toLowerCase();
  const plural = String(unit.plural_name || "").trim().toLowerCase();
  if (!name || !singular || !plural) {
    toast("Display, singular, and plural names are required.");
    return null;
  }
  const duplicate = state.unitOfMeasures.find((item) => item.id !== unit.id && item.name.trim().toLowerCase() === name.toLowerCase());
  if (duplicate) {
    toast("That classification already exists.");
    return null;
  }
  const now = new Date().toISOString();
  const record = {
    id: unit.id || uid("UOM", state.unitOfMeasures),
    name,
    singular_name: singular,
    plural_name: plural,
    abbreviation: String(unit.abbreviation || "").trim(),
    is_active: unit.is_active !== false,
    sort_order: Number(unit.sort_order || ((state.unitOfMeasures.length + 1) * 10)),
    created_at: unit.created_at || now,
    updated_at: now,
    created_by: unit.created_by || currentUser?.name || "",
  };
  const index = state.unitOfMeasures.findIndex((item) => item.id === record.id);
  if (index >= 0) state.unitOfMeasures[index] = record;
  else state.unitOfMeasures.push(record);
  state.unitOfMeasures = normalizeUnitOfMeasures(state.unitOfMeasures);
  saveState();
  return record;
}

function refreshLineUomSelects(changedSelect = null, selectedId = "") {
  document.querySelectorAll(".line-uom").forEach((select) => {
    const current = select === changedSelect ? selectedId : select.value || defaultUnitOfMeasure().id;
    select.innerHTML = `${activeUnitOptions(current).map((uom) => `<option value="${html(uom.id)}" ${uom.id === current ? "selected" : ""}>${html(uom.name)}</option>`).join("")}<option value="__add_uom__">+ Add New Classification</option>`;
    select.value = current;
  });
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
  const accountInput = document.querySelector("#accountNumber");
  if (accountInput && !accountInput.value.trim()) accountInput.value = customerAccountNumber(customer);
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
  const items = [...document.querySelectorAll(".line-item")].map((row) => {
    const unit = unitOfMeasureById(row.querySelector(".line-uom")?.value) || defaultUnitOfMeasure();
    return {
      productId: row.querySelector(".line-product").value,
      qty: Number(row.querySelector(".line-qty").value),
      unit_of_measure_id: unit.id,
      unit_of_measure_snapshot: unitSnapshot(unit),
      price: Number(row.querySelector(".line-price").value),
    };
  });
  if (!items.length) return toast("Add at least one line item.");

  const orderId = document.querySelector("#orderId").value;
  const existingOrder = state.orders.find((item) => item.id === orderId);
  const selectedCustomer = customerById(document.querySelector("#orderCustomer").value);
  const formPartNumber = Number(document.querySelector("#orderPartNumber")?.value || 0);
  const savedPartNumber = saveAction === "addPart" && !formPartNumber ? 1 : formPartNumber || existingOrder?.partNumber || "";
  const now = new Date().toISOString();
  const order = {
    id: orderId,
    customerId: document.querySelector("#orderCustomer").value,
    rep: isAdmin() ? document.querySelector("#orderRep").value.trim() : existingOrder?.rep || currentUser.name,
    buyerName: selectedCustomer?.contact || "",
    partNumber: savedPartNumber,
    date: document.querySelector("#orderDate").value,
    accountNumber: document.querySelector("#accountNumber").value.trim(),
    purchase_order_number: document.querySelector("#purchaseOrderNumber").value.trim(),
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
    createdAt: existingOrder?.createdAt || now,
    updatedAt: now,
    notes: document.querySelector("#orderNotes").value.trim(),
    items,
    verification: existingOrder?.verification || null,
    verificationHistory: existingOrder?.verificationHistory || [],
    vapiNotes: existingOrder?.vapiNotes || [],
    vapi_notes_count: existingOrder?.vapi_notes_count || 0,
    has_vapi_changes: existingOrder?.has_vapi_changes || false,
    vapi_change_review_status: existingOrder?.vapi_change_review_status || "",
    vapi_change_summary: existingOrder?.vapi_change_summary || "",
    vapi_change_detected_at: existingOrder?.vapi_change_detected_at || "",
    vapi_change_call_id: existingOrder?.vapi_change_call_id || "",
    vapi_change_reviewed_by: existingOrder?.vapi_change_reviewed_by || "",
    vapi_change_reviewed_at: existingOrder?.vapi_change_reviewed_at || "",
    vapi_change_review_note: existingOrder?.vapi_change_review_note || "",
    customerChangeRequests: existingOrder?.customerChangeRequests || [],
    auditLog: existingOrder?.auditLog || [],
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
  else {
    state.orders.unshift(order);
    console.log(`[sales-order-create] created id=${order.id} order=${order.creditOrderNumber || order.id}`);
    console.log(`[sales-order-create] total_orders=${state.orders.length}`);
  }
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
      purchase_order_number: order.purchase_order_number,
      accountStatus: order.accountStatus,
      billTo: order.billTo,
      promoTicket: order.promoTicket,
      notes: "",
      items: [{ productId: firstProduct?.id, qty: 1, unit_of_measure_id: defaultUnitOfMeasure().id, unit_of_measure_snapshot: unitSnapshot(defaultUnitOfMeasure()), price: firstProduct?.price || 0 }],
    });
    toast(`${order.id} saved. Add the next part order.`);
    return;
  }
  toast(`${order.id} saved and closed.`);
}

function deleteOrder(orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  if (!canAccessOrder(order)) return toast("You can only delete orders you can access.");
  if (!confirm(`Remove sales order ${order.id} from your dashboard and order list? Other users will keep their copy.`)) return;
  if (!isAdmin() && !isCredit() && !isShipping()) {
    const customer = customerById(order.customerId);
    if (customer && !customer.owner) customer.owner = currentUser.name;
  }
  if (!Array.isArray(order.hiddenFor)) order.hiddenFor = [];
  if (!order.hiddenFor.includes(currentUser.username)) order.hiddenFor.push(currentUser.username);
  auditAction("Hide sales order", "sales_order", orderId, "User removed order from their dashboard");
  saveState();
  render();
  toast(`${order.id} removed from your list.`);
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
  if (!confirm(`Remove ${allowed.length} selected order${allowed.length === 1 ? "" : "s"} from your dashboard and order list? Other users will keep their copy.`)) return;
  allowed.forEach((id) => {
    const order = state.orders.find((item) => item.id === id);
    if (order && !isAdmin() && !isCredit() && !isShipping()) {
      const customer = customerById(order.customerId);
      if (customer && !customer.owner) customer.owner = currentUser.name;
    }
    if (order) {
      if (!Array.isArray(order.hiddenFor)) order.hiddenFor = [];
      if (!order.hiddenFor.includes(currentUser.username)) order.hiddenFor.push(currentUser.username);
      auditAction("Hide sales order", "sales_order", id, "Bulk order removal from dashboard");
    }
  });
  saveState();
  render();
  toast("Selected orders removed from your list.");
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
    ? `${product.sku} is used on ${orderCount} order${orderCount === 1 ? "" : "s"}. Remove it from active product lists? Existing orders will keep the product record.`
    : `Remove product ${product.sku} from active product lists?`;
  if (!confirm(message)) return;
  product.deleted_at = new Date().toISOString();
  product.deleted_by = currentUser?.name || "";
  auditAction("Soft delete product", "product", productId, orderCount ? "Product referenced by orders" : "User requested product removal");
  saveState();
  render();
  toast("Product removed from active lists.");
}

function openCustomerForm(id = null) {
  const customer = id ? customerById(id) : { id: uid("C", state.customers), name: "", account_number: "", contact: "", email: "", phone: "", cellPhone: "", preferredPhone: "phone", address: "", city: "", state: "", zip: "", promoNumber: "", purchaseOrder: "", terms: "Net 30" };
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
        <div class="field"><label>Account Number (Optional)</label><input id="customerAccountNumber" data-testid="customer-account-number-input" value="${html(customerAccountNumber(customer))}" maxlength="100" placeholder="Customer account number" /></div>
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
    account_number: document.querySelector("#customerAccountNumber").value.trim(),
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
    purchase_order_number: "",
    notes: "",
    shipDate: "",
    billTo: "",
    creditCard: { name: "", last4: "", expiration: "", ccvReceived: false },
    followUp: { date: "", time: "", notes: "" },
    phone: customer?.phone || "",
    cellPhone: customer?.cellPhone || "",
    preferredPhone: customer?.preferredPhone || "phone",
    accountNumber: customerAccountNumber(customer),
    address: customerAddress(customer),
    items: [{ productId: firstProduct?.id, qty: 1, unit_of_measure_id: defaultUnitOfMeasure().id, unit_of_measure_snapshot: unitSnapshot(defaultUnitOfMeasure()), price: firstProduct?.price || 0 }],
  };
  openOrderFormFromDraft(order);
}

function deleteCustomer(customerId) {
  const customer = customerById(customerId);
  if (!customer) return toast("Customer was not found.");
  if (!canAccessCustomer(customerId)) return toast("You can only delete customers assigned to your sales account.");
  const orderCount = state.orders.filter((order) => order.customerId === customerId).length;
  if (orderCount && !confirm(`${customer.name} is linked to ${orderCount} sales order${orderCount === 1 ? "" : "s"}. Remove the customer from active lists? Existing orders will keep the customer record.`)) return;
  if (!orderCount && !confirm(`Remove customer ${customer.name} from active lists?`)) return;
  customer.deleted_at = new Date().toISOString();
  customer.deleted_by = currentUser?.name || "";
  auditAction("Soft delete customer", "customer", customerId, orderCount ? "Customer linked to orders" : "User requested customer removal");
  saveState();
  render();
  toast("Customer removed from active lists.");
}

function deleteSelectedCustomers() {
  const ids = [...document.querySelectorAll(".customer-select:checked")].map((input) => input.value);
  if (!ids.length) return toast("Select at least one customer.");
  const allowed = ids.filter((id) => canAccessCustomer(id));
  if (!allowed.length) return toast("No selected customers can be deleted.");
  if (!confirm(`Remove ${allowed.length} selected customer${allowed.length === 1 ? "" : "s"} from active lists?`)) return;
  allowed.forEach((id) => {
    const customer = customerById(id);
    if (customer) {
      customer.deleted_at = new Date().toISOString();
      customer.deleted_by = currentUser?.name || "";
      auditAction("Soft delete customer", "customer", id, "Bulk customer removal");
    }
  });
  saveState();
  render();
  toast("Selected customers removed from active lists.");
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
      accountNumber: order.accountNumber || customerAccountNumber(customer),
      purchase_order_number: purchaseOrderNumber(order),
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
        const unit = lineUnitOfMeasure(item);
        return { sku: product?.sku, name: product?.name, category: product?.category, orderedQty: item.qty, unitPrice: item.price, unit_of_measure_id: unit.id, unit_of_measure: unitSnapshot(unit), unit: Number(item.qty) === 1 ? unit.singular_name : unit.plural_name };
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
  if (isProductionApp()) {
    toast("Production data reset is disabled.");
    return;
  }
  state = structuredClone(seedData);
  saveState();
  render();
  toast("Demo data reset.");
}

loadRuntimeFiles()
  .then(() => syncStateFromServer({ render: false }))
  .finally(() => {
    render();
    window.setInterval(() => syncStateFromServer(), 5000);
  });
