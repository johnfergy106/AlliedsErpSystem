import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appSource = await readFile("app.js", "utf8");

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
