import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appSource = await readFile("app.js", "utf8");
const styleSource = await readFile("styles.css", "utf8");
const serverSource = await readFile("server.js", "utf8");

test("new and edit sales order forms render the Purchase Order Number input", () => {
  assert.match(appSource, /function openOrderForm\(id = null\)/);
  assert.match(appSource, /function openOrderFormFromDraft\(order, id = null\)/);
  assert.match(appSource, /onclick="openOrderForm\(\)"/);
  assert.match(appSource, /onclick="openOrderForm\('\$\{order\.id\}'\)"/);
  assert.match(appSource, /<label>Purchase Order Number \(Optional\)<\/label><input id="purchaseOrderNumber" data-testid="purchase-order-number-input"/);
  assert.match(appSource, /<div class="field"><label>Account Number \(Optional\)<\/label><input id="accountNumber"[\s\S]*?<div class="field"><label>Purchase Order Number \(Optional\)<\/label>/);
});

test("sales order drafts initialize an empty PO number", () => {
  assert.match(appSource, /purchase_order_number: ""/);
  assert.match(appSource, /purchase_order_number: order\.purchase_order_number/);
});

test("edit sales order form loads PO number from API snake case or frontend camel case", () => {
  assert.match(appSource, /function purchaseOrderNumber\(order = \{\}\)/);
  assert.match(appSource, /order\.purchase_order_number \|\| order\.purchaseOrderNumber/);
  assert.match(appSource, /value="\$\{html\(purchaseOrderNumber\(order\)\)\}"/);
});

test("saving a sales order maps form value to canonical API field and preserves strings", () => {
  assert.match(appSource, /purchase_order_number: document\.querySelector\("#purchaseOrderNumber"\)\.value\.trim\(\)/);
  assert.doesNotMatch(appSource, /Number\(document\.querySelector\("#purchaseOrderNumber"\)/);
  assert.doesNotMatch(appSource, /parseInt\(document\.querySelector\("#purchaseOrderNumber"\)/);
});

test("production output renders the Purchase Order Number input", async () => {
  const builtSource = await readFile("dist/app.js", "utf8");
  assert.match(builtSource, /data-testid="purchase-order-number-input"/);
  assert.match(builtSource, /Purchase Order Number \(Optional\)/);
  assert.match(builtSource, /purchase_order_number: document\.querySelector\("#purchaseOrderNumber"\)\.value\.trim\(\)/);
});

test("unit of measure dropdown appears on sales order line items", () => {
  assert.match(appSource, /function lineItemHtml\(item\)/);
  assert.match(appSource, /Ship As \/ Unit of Measure/);
  assert.match(appSource, /class="line-uom"/);
  assert.match(appSource, /data-testid="line-uom-select"/);
});

test("line items default to Units and save unit ids with snapshots", () => {
  assert.match(appSource, /defaultUnitOfMeasure\(\)\.id/);
  assert.match(appSource, /unit_of_measure_id: unit\.id/);
  assert.match(appSource, /unit_of_measure_snapshot: unitSnapshot\(unit\)/);
});

test("new classification can be added from the dropdown and duplicate names are rejected", () => {
  assert.match(appSource, /\+ Add New Classification/);
  assert.match(appSource, /function promptForUnitOfMeasure/);
  assert.match(appSource, /duplicate = state\.unitOfMeasures\.find/);
  assert.match(appSource, /toLowerCase\(\) === name\.toLowerCase\(\)/);
});

test("inactive classifications are hidden from new choices but retained for current lines", () => {
  assert.match(appSource, /unit\.is_active !== false \|\| unit\.id === currentId/);
});

test("unit correction review can accept or reject without automatic overwrite", () => {
  assert.match(appSource, /change\.field === "unit_of_measure"/);
  assert.match(appSource, /order\.items\[lineIndex\]\.unit_of_measure_id = unit\.id/);
  assert.match(appSource, /Accept Change/);
  assert.match(appSource, /Reject Change/);
});

test("customer account number appears on add and edit customer forms", () => {
  assert.match(appSource, /function openCustomerForm\(id = null\)/);
  assert.match(appSource, /Account Number \(Optional\)<\/label><input id="customerAccountNumber" data-testid="customer-account-number-input"/);
  assert.match(appSource, /value="\$\{html\(customerAccountNumber\(customer\)\)\}"/);
  assert.match(appSource, /maxlength="100" placeholder="Customer account number"/);
});

test("customer account number saves, reloads, and preserves leading zeros", () => {
  assert.match(appSource, /function customerAccountNumber\(customer = \{\}\)/);
  assert.match(appSource, /customer\?\.account_number \|\| customer\?\.accountNumber/);
  assert.match(appSource, /account_number: document\.querySelector\("#customerAccountNumber"\)\.value\.trim\(\)/);
  assert.doesNotMatch(appSource, /Number\(document\.querySelector\("#customerAccountNumber"\)/);
  assert.doesNotMatch(appSource, /parseInt\(document\.querySelector\("#customerAccountNumber"\)/);
});

test("sales order account number defaults from customer without overwriting manual values", () => {
  assert.match(appSource, /accountNumber: customerAccountNumber\(firstCustomer\)/);
  assert.match(appSource, /if \(accountInput && !accountInput\.value\.trim\(\)\) accountInput\.value = customerAccountNumber\(customer\)/);
  assert.match(appSource, /accountNumber: customerAccountNumber\(customer\)/);
});

test("sales order line item price layout exposes a usable unit price input", () => {
  assert.match(appSource, /data-testid="sales-order-unit-price-input"/);
  assert.match(appSource, /<label>Unit Price<\/label>/);
  assert.match(appSource, /class="line-total"/);
  assert.match(appSource, /function updateLineTotal\(control\)/);
});

test("line item grid keeps unit of measure and price fields from clipping", () => {
  assert.match(styleSource, /\.line-item\s*\{[\s\S]*grid-template-columns:[\s\S]*minmax\(140px, 1fr\)[\s\S]*minmax\(130px, 1fr\)/);
  assert.match(styleSource, /\.line-item > \*[\s\S]*min-width: 0/);
  assert.match(styleSource, /\.line-price\s*\{[\s\S]*min-width: 120px;[\s\S]*width: 100%/);
  assert.match(styleSource, /@media \(max-width: 980px\)[\s\S]*\.line-product-field[\s\S]*grid-column: 1 \/ -1/);
  assert.match(styleSource, /@media \(max-width: 680px\)[\s\S]*\.line-item[\s\S]*grid-template-columns: 1fr/);
});

test("sales order list paginates the full order collection instead of five records", () => {
  assert.match(appSource, /let orderPage = 1/);
  assert.match(appSource, /let orderPageSize = 25/);
  assert.match(appSource, /const recent = newestOrdersFirst\(orders\)\.slice\(0, 5\)/);
  assert.match(appSource, /const pageRows = rows\.slice\(start, start \+ orderPageSize\)/);
  assert.match(appSource, /Showing \$\{showingStart\}-\$\{showingEnd\} of \$\{total\} orders/);
  assert.match(appSource, /Page \$\{orderPage\} of \$\{totalPages\}/);
  assert.match(appSource, /orderPageSize=Number\(this\.value\);orderPage=1;render\(\)/);
});

test("login fields can be cleared and passwords are not persisted", () => {
  assert.match(appSource, /const rememberedLoginKey = "alliedErpRememberedLogin"/);
  assert.doesNotMatch(appSource, /const loginDraftKey = "alliedErpLoginDraft"/);
  assert.match(appSource, /let loginDraft = \{ username: "", password: "" \}/);
  assert.match(appSource, /if \(loginDraftInitialized\) return loginDraft/);
  assert.match(appSource, /function loadSavedLoginCredentials\(\)/);
  assert.match(appSource, /function saveLoginDraftFromInputs\(\)/);
  assert.match(appSource, /function syncCredentialFields\(\)/);
  assert.match(appSource, /function clearLoginFields\(\)/);
  assert.match(appSource, /function rememberLoginCredentials\(username\)/);
  assert.match(appSource, /<form class="login-form" autocomplete="on"[\s\S]*onsubmit="login\(event\)"[\s\S]*onanimationstart="syncCredentialFields\(\)"/);
  assert.match(appSource, /id="loginUsername" name="username" autocomplete="username"[\s\S]*value="\$\{html\(savedLogin\.username\)\}"[\s\S]*onfocus="syncCredentialFields\(\)"[\s\S]*oninput="syncCredentialFields\(\)"[\s\S]*onchange="syncCredentialFields\(\)"[\s\S]*onanimationstart="syncCredentialFields\(\)"/);
  assert.match(appSource, /id="loginPassword" name="password" type="password" autocomplete="current-password"[\s\S]*value="\$\{html\(savedLogin\.password\)\}"[\s\S]*onfocus="syncCredentialFields\(\)"[\s\S]*oninput="syncCredentialFields\(\)"[\s\S]*onchange="syncCredentialFields\(\)"[\s\S]*onanimationstart="syncCredentialFields\(\)"/);
  assert.match(appSource, /Use another account/);
  assert.match(appSource, /usernameInput\.value = ""/);
  assert.match(appSource, /passwordInput\.value = ""/);
  assert.doesNotMatch(appSource, /draft\.username \|\| remembered\.username/);
  assert.doesNotMatch(appSource, /draft\.password \|\| remembered\.password/);
  assert.doesNotMatch(appSource, /localStorage\.setItem\(rememberedLoginKey, JSON\.stringify\(\{ username, password \}\)\)/);
  assert.doesNotMatch(appSource, /localStorage\.setItem\([^)]*password/);
  assert.match(appSource, /localStorage\.removeItem\("alliedErpLoginDraft"\)/);
  assert.match(appSource, /currentSessionPassword = password/);
  assert.match(appSource, /syncCredentialFields\(\);\s*const username = document\.querySelector\("#loginUsername"\)\.value/);
  assert.match(appSource, /loginDraft\.password = ""/);
  assert.match(appSource, /passwordInput\?\.focus\(\)/);
  assert.match(appSource, /rememberLoginCredentials\(username\);\s*saveCurrentUser\(user\)/);
  assert.match(styleSource, /input:-webkit-autofill/);
  assert.match(styleSource, /-webkit-text-fill-color: var\(--ink\)/);
});

test("login form is not remounted by background sync while logged out", () => {
  assert.match(appSource, /if \(!currentUser\) \{\s*if \(document\.querySelector\("\.login-screen"\)\) return;\s*renderLogin\(\);\s*return;\s*\}/);
  assert.match(appSource, /window\.setInterval\(\(\) => syncStateFromServer\(\), 5000\)/);
  assert.match(appSource, /if \(changed && options\.render !== false\) render\(\)/);
});

test("settings is visible to all users while assistant tools remain super-admin only", () => {
  assert.match(appSource, /navButton\("settings", "S", "Settings"\)/);
  assert.match(appSource, /if \(view === "settings"\) return settingsView\(\)/);
  assert.match(appSource, /isSuperAdmin\(\) \? `<div class="panel">[\s\S]*Assistant Connection/);
  assert.match(appSource, /isSuperAdmin\(\) \? dataBackupsSection/);
  assert.doesNotMatch(appSource, /if \(view === "settings" && !isSuperAdmin\(\)\) view = "dashboard"/);
});

test("callback requested is a first-class order status in the frontend", () => {
  assert.match(appSource, /callback_requested: "Callback Requested"/);
  assert.match(appSource, /\["callback_requested", "Callback Requested"\]/);
  assert.match(appSource, /function callbacksFilterButton\(\)/);
  assert.match(appSource, /statusFilter='callback_requested'/);
  assert.match(appSource, /function latestCallbackNote\(order = \{\}\)/);
  assert.match(appSource, /Callback: \$\{html/);
  assert.match(styleSource, /\.status\.callback_requested/);
  assert.match(serverSource, /callback_requested: 70/);
  assert.match(serverSource, /recordOrderStatus\(order, "callback_requested", "Customer requested a callback during Vapi verification\.", "Vapi"\)/);
});

test("settings page supports all-user themes and super-admin-only data backups", () => {
  assert.match(appSource, /const themePreferenceKey = "allied_erp_theme"/);
  assert.match(appSource, /function applyThemePreference/);
  assert.match(appSource, /document\.documentElement\.dataset\.theme/);
  assert.match(appSource, /Use System Theme/);
  assert.match(appSource, /Dark Mode/);
  assert.match(appSource, /navButton\("settings", "S", "Settings"\)/);
  assert.doesNotMatch(appSource, /view === "settings" && !isSuperAdmin\(\)/);
  assert.match(appSource, /function dataBackupsSection/);
  assert.match(appSource, /isSuperAdmin\(\) \? dataBackupsSection/);
  assert.match(appSource, /Backup Now/);
  assert.match(appSource, /Type RESTORE to confirm/);
  assert.match(appSource, /backupAuthHeaders/);
  assert.match(styleSource, /:root\[data-theme="dark"\]/);
  assert.match(styleSource, /color-scheme: dark/);
});

test("server exposes guarded settings backup endpoints", () => {
  assert.match(serverSource, /function requireSuperAdmin/);
  assert.match(serverSource, /Super Admin authorization is required/);
  assert.match(serverSource, /\/api\/settings\/data-status/);
  assert.match(serverSource, /\/api\/settings\/backups/);
  assert.match(serverSource, /\/api\/settings\/backups\/current\/download/);
  assert.match(serverSource, /upload-and-restore/);
  assert.match(serverSource, /safeBackupFileName/);
  assert.match(serverSource, /Backup does not look like an Allied ERP state file/);
  assert.match(serverSource, /Pre-restore backup/);
});

test("production reset is disabled and deleted records can be restored", () => {
  assert.match(appSource, /function isProductionApp\(\)/);
  assert.match(appSource, /Production data reset is disabled/);
  assert.match(appSource, /function restoreDeletedRecord\(type, id\)/);
  assert.match(appSource, /Only Super Admin can restore deleted records/);
  assert.match(appSource, /state\.deletedCustomers = \(state\.deletedCustomers \|\| \[\]\)\.filter/);
  assert.match(appSource, /state\.deletedProducts = \(state\.deletedProducts \|\| \[\]\)\.filter/);
  assert.match(appSource, /Deleted Records/);
  assert.match(appSource, /deleted_at/);
  assert.match(appSource, /deleted_by/);
});

test("server refuses production startup without persistent data storage", () => {
  assert.match(serverSource, /NODE_ENV === "production" && !process\.env\.ALLIED_ERP_DATA_DIR/);
  assert.match(serverSource, /Refusing to start with ephemeral local storage/);
  assert.match(serverSource, /shared-state-latest\.json/);
  assert.match(serverSource, /Production data protection: shared-state\.json could not be read/);
});
