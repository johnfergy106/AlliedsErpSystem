import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import test, { after, before } from "node:test";

let captureServer;
let capturePort;
let appProcess;
let appPort;
const capturedBodies = [];

function listen(server) {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server.address().port));
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForApp() {
  const url = `http://127.0.0.1:${appPort}/api/state`;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      await wait(100);
    }
  }
  throw new Error("ERP test server did not start.");
}

function baseOrder(overrides = {}) {
  return {
    id: "SO-TEST",
    buyerName: "Mia Turner",
    customer: {
      name: "Baxter Machine Works",
      contact: "Mia Turner",
      purchaseOrder: overrides.purchaseOrder,
    },
    items: [],
    total: overrides.total,
    address: {
      address: "1420 Foundry Park Dr",
      city: "Cleveland",
      state: "OH",
      zip: "44114",
    },
    notes: "Rush delivery",
    shipDate: "2026-07-20",
    salesRep: "Jordan Lee",
    accountNumber: "BX-44",
    accountStatus: "old",
    purchaseOrder: overrides.purchaseOrder,
    billTo: overrides.billTo || "",
    trackingInfo: overrides.trackingInfo || "",
    promoTicket: { promoNumber: overrides.promoNumber || "" },
    creditCardOnFile: overrides.creditCardOnFile,
    date: "2026-07-15",
    ...overrides,
  };
}

async function sendOrder(order) {
  capturedBodies.length = 0;
  const response = await fetch(`http://127.0.0.1:${appPort}/api/vapi/calls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: order.id,
      customerPhoneNumber: "(951) 555-1234",
      order: {
        assistantId: "old-browser-value",
        phoneNumberId: "old-browser-value",
        order,
      },
    }),
  });
  assert.equal(response.ok, true, await response.text());
  assert.equal(capturedBodies.length, 1);
  return JSON.parse(capturedBodies[0]).assistantOverrides.variableValues;
}

before(async () => {
  captureServer = createServer(async (request, response) => {
    let body = "";
    request.setEncoding("utf8");
    for await (const chunk of request) body += chunk;
    capturedBodies.push(body);
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ id: "call_test", status: "queued" }));
  });
  capturePort = await listen(captureServer);

  const appServer = createServer();
  appPort = await listen(appServer);
  await new Promise((resolve) => appServer.close(resolve));

  appProcess = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(appPort),
      VAPI_API_KEY: "test-key",
      VAPI_ASSISTANT_ID: "asst_test",
      VAPI_PHONE_NUMBER_ID: "phn_test",
      VAPI_API_URL: `http://127.0.0.1:${capturePort}/call`,
    },
    stdio: "ignore",
  });
  await waitForApp();
});

after(async () => {
  if (appProcess) appProcess.kill();
  if (captureServer) await new Promise((resolve) => captureServer.close(resolve));
});

test("formats one item with quantity and product name only", async () => {
  const values = await sendOrder(baseOrder({
    total: 176.95,
    items: [{ productId: "P-1", sku: "5-2080", name: "20X80 gauge machine stretch wrap", orderedQty: 1, unitPrice: 176.95 }],
  }));
  assert.equal(values.order_items, "The order includes 1 unit of 20X80 gauge machine stretch wrap.");
  assert.doesNotMatch(values.order_items, /5-2080|176\.95|P-1|SKU|line total/i);
});

test("formats multiple items as a clean spoken sentence", async () => {
  const values = await sendOrder(baseOrder({
    total: 274.45,
    items: [
      { sku: "5-2080", name: "20X80 gauge machine stretch wrap", orderedQty: 1, unitPrice: 176.95 },
      { sku: "TAPE-200", name: "two-inch packing tape", orderedQty: 3, unitPrice: 32.5, unit: "case" },
    ],
  }));
  assert.equal(values.order_items, "The order includes 1 unit of 20X80 gauge machine stretch wrap, and 3 cases of two-inch packing tape.");
});

test("uses singular and plural unit, case, roll, and box wording", async () => {
  const values = await sendOrder(baseOrder({
    total: 100,
    items: [
      { name: "stretch wrap", orderedQty: 1 },
      { name: "gloves", orderedQty: 2 },
      { name: "packing tape", orderedQty: 1, unit: "case" },
      { name: "packing tape", orderedQty: 2, unit: "case" },
      { name: "bubble wrap", orderedQty: 1, unit: "roll" },
      { name: "bubble wrap", orderedQty: 2, unit: "roll" },
      { name: "labels", orderedQty: 1, unit: "box" },
      { name: "labels", orderedQty: 2, unit: "box" },
    ],
  }));
  assert.match(values.order_items, /1 unit of stretch wrap/);
  assert.match(values.order_items, /2 units of gloves/);
  assert.match(values.order_items, /1 case of packing tape/);
  assert.match(values.order_items, /2 cases of packing tape/);
  assert.match(values.order_items, /1 roll of bubble wrap/);
  assert.match(values.order_items, /2 rolls of bubble wrap/);
  assert.match(values.order_items, /1 box of labels/);
  assert.match(values.order_items, /2 boxes of labels/);
});

test("handles missing SKU without leaking undefined values", async () => {
  const values = await sendOrder(baseOrder({
    total: 25,
    items: [{ name: "custom product", orderedQty: 1, unitPrice: 25 }],
  }));
  assert.equal(values.sku_list, "custom product: SKU not available.");
  assert.doesNotMatch(values.item_details, /undefined|null/);
});

test("handles missing price without inventing a price", async () => {
  const values = await sendOrder(baseOrder({
    items: [{ name: "sample product", orderedQty: 2, sku: "SAMPLE" }],
  }));
  assert.match(values.unit_price_details, /sample product: unit price not available\./);
  assert.match(values.line_total_details, /sample product line total: not available\./);
});

test("uses an empty string for a missing purchase order number", async () => {
  const values = await sendOrder(baseOrder({
    total: 12,
    items: [{ name: "sample product", orderedQty: 1, unitPrice: 12 }],
    purchaseOrder: "",
  }));
  assert.equal(values.purchase_order_number, "");
});

test("provides SKU details only in the reference-only SKU variable", async () => {
  const values = await sendOrder(baseOrder({
    total: 12,
    items: [{ name: "sample product", orderedQty: 1, sku: "SKU-1", unitPrice: 12 }],
  }));
  assert.equal(values.sku_list, "sample product: SKU SKU-1.");
  assert.doesNotMatch(values.order_items, /SKU-1/);
});

test("provides unit price details only in the reference-only price variable", async () => {
  const values = await sendOrder(baseOrder({
    total: 32.5,
    items: [{ name: "two-inch packing tape", orderedQty: 1, unit: "case", unitPrice: 32.5 }],
  }));
  assert.equal(values.unit_price_details, "two-inch packing tape: $32.50 per case.");
  assert.doesNotMatch(values.order_items, /\$32\.50/);
});

test("provides the order total as a separate reference variable", async () => {
  const values = await sendOrder(baseOrder({
    total: 97.5,
    items: [{ name: "two-inch packing tape", orderedQty: 3, unit: "case", unitPrice: 32.5 }],
  }));
  assert.equal(values.order_total, "$97.50");
  assert.doesNotMatch(values.order_items, /\$97\.50/);
});

test("Vapi order_items uses selected unit classifications", async () => {
  const values = await sendOrder(baseOrder({
    total: 50,
    items: [
      { name: "Nitrile Gloves", orderedQty: 4, unit_of_measure: { singular_name: "case", plural_name: "cases" } },
      { name: "Packing Material", orderedQty: 2, unit_of_measure: { singular_name: "roll", plural_name: "rolls" } },
      { name: "Copper Wire", orderedQty: 1, unit_of_measure: { singular_name: "coil", plural_name: "coils" } },
      { name: "Fasteners", orderedQty: 3, unit_of_measure: { singular_name: "box", plural_name: "boxes" } },
    ],
  }));
  assert.match(values.order_items, /4 cases of Nitrile Gloves/);
  assert.match(values.order_items, /2 rolls of Packing Material/);
  assert.match(values.order_items, /1 coil of Copper Wire/);
  assert.match(values.order_items, /3 boxes of Fasteners/);
  assert.doesNotMatch(values.order_items, /units of cases|units of rolls|units of boxes/i);
});

test("Vapi grammar uses singular and plural classification names", async () => {
  const values = await sendOrder(baseOrder({
    items: [
      { name: "Nitrile Gloves", orderedQty: 1, unit_of_measure: { singular_name: "case", plural_name: "cases" } },
      { name: "Nitrile Gloves", orderedQty: 4, unit_of_measure: { singular_name: "case", plural_name: "cases" } },
      { name: "Small Part", orderedQty: 4, unit_of_measure: { singular_name: "each", plural_name: "each" } },
    ],
  }));
  assert.match(values.order_items, /1 case of Nitrile Gloves/);
  assert.match(values.order_items, /4 cases of Nitrile Gloves/);
  assert.match(values.order_items, /4 each of Small Part/);
});
