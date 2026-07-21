import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appSource = await readFile("app.js", "utf8");
const styleSource = await readFile("styles.css", "utf8");

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
