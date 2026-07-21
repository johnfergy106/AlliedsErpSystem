import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { after, before } from "node:test";

let appProcess;
let appPort;
let dataDir;
let vapiServer;
let vapiPort;
const vapiCallResponses = new Map();
const vapiPostedCalls = [];

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

async function postState(state) {
  const response = await fetch(`http://127.0.0.1:${appPort}/api/state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });
  assert.equal(response.ok, true, await response.text());
}

async function getState() {
  const response = await fetch(`http://127.0.0.1:${appPort}/api/state`);
  assert.equal(response.ok, true);
  return response.json();
}

async function waitForOrder(orderId, predicate, timeoutMs = 1000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const state = await getState();
    const order = state.orders.find((item) => item.id === orderId);
    if (order && predicate(order, state)) return { order, state };
    await wait(25);
  }
  const state = await getState();
  const order = state.orders.find((item) => item.id === orderId);
  assert.fail(`Timed out waiting for ${orderId}. Current order: ${JSON.stringify(order)}`);
}

async function postVapiWebhook(body) {
  const response = await fetch(`http://127.0.0.1:${appPort}/api/vapi/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) assert.fail(await response.text());
  return response.json();
}

async function postVapiCall(body) {
  const response = await fetch(`http://127.0.0.1:${appPort}/api/vapi/calls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) assert.fail(await response.text());
  return response.json();
}

async function getUnitsOfMeasure() {
  const response = await fetch(`http://127.0.0.1:${appPort}/api/units-of-measure`);
  const text = await response.text();
  assert.equal(response.ok, true, text);
  return JSON.parse(text);
}

async function postUnitOfMeasure(body) {
  const response = await fetch(`http://127.0.0.1:${appPort}/api/units-of-measure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { response, body: await response.json().catch(() => ({})) };
}

function vapiWebhook({ callId, orderId, outcome, transcript, endedReason = "customer-ended-call", status = "ended", structuredData = null }) {
  return {
    type: "end-of-call-report",
    call: {
      id: callId,
      assistantId: "asst_test",
      assistant: { name: "Allied Verification Assistant" },
      metadata: { orderId },
      status,
      endedReason,
      customer: { number: "+19515551234" },
      startedAt: "2026-07-17T15:00:00.000Z",
      endedAt: "2026-07-17T15:02:15.000Z",
      transcript,
      analysis: structuredData === null ? { structuredData: { outcome } } : { structuredData },
    },
  };
}

function vapiStructuredOutputWebhook({ callId, orderId, result, transcript = "" }) {
  return {
    type: "end-of-call-report",
    call: {
      id: callId,
      assistantId: "asst_test",
      assistant: { name: "Allied Verification Assistant" },
      status: "ended",
      endedReason: "customer-ended-call",
      customer: { number: "+19515551234" },
      startedAt: "2026-07-17T15:00:00.000Z",
      endedAt: "2026-07-17T15:02:15.000Z",
      transcript,
      structuredOutputs: {
        out_erp_verification: {
          name: "ERP_Order_Verification",
          result: {
            order_number: orderId,
            ...result,
          },
        },
      },
    },
  };
}

function vapiEmptyStructuredOutputWebhook({ callId, orderId, transcript = "" }) {
  return {
    message: {
      type: "end-of-call-report",
      call: {
        id: callId,
        assistantId: "asst_test",
        assistant: { name: "Allied Verification Assistant" },
        metadata: { orderId },
        status: "ended",
        endedReason: "customer-ended-call",
        customer: { number: "+19515551234" },
        startedAt: "2026-07-17T15:00:00.000Z",
        endedAt: "2026-07-17T15:02:15.000Z",
        transcript,
        artifact: { structuredOutputs: {} },
      },
    },
  };
}

function vapiStatusUpdate({ callId, orderId, status }) {
  return {
    message: {
      type: "status-update",
      call: {
        id: callId,
        metadata: { orderId },
        status,
        customer: { number: "+19515551234" },
      },
    },
  };
}

function completedVapiCall({ callId, orderId, result, name = "ERP_Order_Verification" }) {
  return {
    id: callId,
    metadata: { orderId },
    status: "ended",
    endedReason: "customer-ended-call",
    customer: { number: "+19515551234" },
    startedAt: "2026-07-17T15:00:00.000Z",
    endedAt: "2026-07-17T15:02:15.000Z",
    transcript: "Completed call transcript.",
    artifact: {
      structuredOutputsLastUpdatedAt: "2026-07-17T15:02:30.000Z",
      structuredOutputs: {
        output_id: {
          name,
          result: {
            order_number: orderId,
            ...result,
          },
        },
      },
    },
  };
}

before(async () => {
  const { createServer } = await import("node:http");
  vapiServer = createServer((request, response) => {
    if (request.method === "POST") {
      let body = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => {
        body += chunk;
      });
      request.on("end", () => {
        const payload = body ? JSON.parse(body) : {};
        vapiPostedCalls.push(payload);
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ id: `call_post_${vapiPostedCalls.length}`, status: "queued" }));
      });
      return;
    }
    const callId = new URL(request.url, "http://127.0.0.1").pathname.split("/").filter(Boolean).at(-1);
    const responses = vapiCallResponses.get(callId) || [];
    const payload = responses.length > 1 ? responses.shift() : responses[0];
    response.writeHead(payload ? 200 : 404, { "Content-Type": "application/json" });
    response.end(JSON.stringify(payload || { message: "not found" }));
  });
  vapiPort = await listen(vapiServer);
  const portServer = createServer();
  appPort = await listen(portServer);
  await new Promise((resolve) => portServer.close(resolve));
  dataDir = await mkdtemp(path.join(tmpdir(), "allied-erp-state-"));
  appProcess = spawn(process.execPath, ["server.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(appPort),
      ALLIED_ERP_DATA_DIR: dataDir,
      VAPI_API_KEY: "test-key",
      VAPI_ASSISTANT_ID: "asst_test",
      VAPI_PHONE_NUMBER_ID: "phone_test",
      VAPI_API_URL: `http://127.0.0.1:${vapiPort}/call`,
      VAPI_STRUCTURED_OUTPUT_RETRY_DELAYS_MS: "10,20,30",
      VAPI_RETRY_WORKER_INTERVAL_MS: "5",
    },
    stdio: "ignore",
  });
  await waitForApp();
});

after(async () => {
  if (appProcess) appProcess.kill();
  if (vapiServer) await new Promise((resolve) => vapiServer.close(resolve));
  if (dataDir) await rm(dataDir, { recursive: true, force: true });
});

test("server state saves merge records instead of replacing other users' work", async () => {
  await postState({
    orders: [{ id: "SO-1", customerId: "C-1", rep: "Jordan Lee" }],
    customers: [{ id: "C-1", name: "Customer One" }],
    products: [{ id: "P-1", name: "Product One" }],
    users: [{ username: "jordan", name: "Jordan Lee", role: "sales", password: "" }],
  });
  await postState({
    orders: [{ id: "SO-2", customerId: "C-2", rep: "Avery Brooks" }],
    customers: [{ id: "C-2", name: "Customer Two" }],
    products: [{ id: "P-2", name: "Product Two" }],
    users: [{ username: "avery", name: "Avery Brooks", role: "sales", password: "" }],
  });
  const state = await getState();
  assert.deepEqual(state.orders.map((order) => order.id).sort(), ["SO-1", "SO-2"]);
  assert.deepEqual(state.customers.map((customer) => customer.id).sort(), ["C-1", "C-2"]);
  assert.deepEqual(state.products.map((product) => product.id).sort(), ["P-1", "P-2"]);
  assert.deepEqual(state.users.map((user) => user.username).sort(), ["avery", "jordan"]);
});

test("deleted customers stay deleted when an older browser posts stale data", async () => {
  await postState({
    customers: [{ id: "C-1", name: "Customer One" }],
    deletedCustomers: ["C-1"],
  });
  await postState({
    customers: [{ id: "C-1", name: "Customer One Stale Copy" }],
  });
  const state = await getState();
  assert.equal(state.customers.some((customer) => customer.id === "C-1"), false);
  assert.deepEqual(state.deletedCustomers, ["C-1"]);
});

test("new customers remain saved while old deleted customer ids stay blocked", async () => {
  await postState({
    customers: [{ id: "C-1001", name: "Deleted Customer" }],
    deletedCustomers: ["C-1001"],
  });
  await postState({
    customers: [
      { id: "C-1001", name: "Deleted Customer Stale Copy" },
      { id: "C-1002", name: "New Customer" },
    ],
  });
  const state = await getState();
  assert.equal(state.customers.some((customer) => customer.id === "C-1001"), false);
  assert.equal(state.customers.some((customer) => customer.id === "C-1002" && customer.name === "New Customer"), true);
});

test("customer account numbers persist and preserve leading zeros", async () => {
  await postState({
    customers: [{ id: "C-ACCT", name: "Account Customer", account_number: "001-23456" }],
  });
  let state = await getState();
  assert.equal(state.customers.find((customer) => customer.id === "C-ACCT").account_number, "001-23456");

  await postState({
    customers: [{ id: "C-ACCT", name: "Account Customer", accountNumber: "0007/ABC" }],
  });
  state = await getState();
  assert.equal(state.customers.find((customer) => customer.id === "C-ACCT").account_number, "0007/ABC");
});

test("deleted sales orders are hidden for one user instead of removed globally", async () => {
  await postState({
    orders: [{ id: "SO-HIDDEN", customerId: "C-9", rep: "Jordan Lee" }],
  });
  await postState({
    orders: [{ id: "SO-HIDDEN", customerId: "C-9", rep: "Jordan Lee", hiddenFor: ["sales"] }],
    deletedOrders: ["SO-HIDDEN"],
  });
  const state = await getState();
  const order = state.orders.find((item) => item.id === "SO-HIDDEN");
  assert.ok(order);
  assert.deepEqual(order.hiddenFor, ["sales"]);
  assert.equal(state.deletedOrders.includes("SO-HIDDEN"), false);
});

test("deleted products stay permanently deleted when stale data is posted", async () => {
  await postState({
    products: [{ id: "P-DELETE", name: "Deleted Product" }],
    deletedProducts: ["P-DELETE"],
  });
  await postState({
    products: [{ id: "P-DELETE", name: "Deleted Product Stale Copy" }],
  });
  const state = await getState();
  assert.equal(state.products.some((product) => product.id === "P-DELETE"), false);
  assert.equal(state.deletedProducts.includes("P-DELETE"), true);
});

test("sent to shipping status is not overwritten by a stale verified order copy", async () => {
  await postState({
    orders: [{
      id: "SO-SHIP",
      customerId: "C-SHIP",
      rep: "Jordan Lee",
      status: "sent_to_shipping",
      statusChangedAt: "07/16/2026, 09:30 AM",
      statusHistory: [{ status: "sent_to_shipping", at: "07/16/2026, 09:30 AM", by: "Credit Dept.", notes: "" }],
    }],
  });
  await postState({
    orders: [{
      id: "SO-SHIP",
      customerId: "C-SHIP",
      rep: "Jordan Lee",
      status: "verified",
      statusChangedAt: "07/16/2026, 09:00 AM",
      statusHistory: [{ status: "verified", at: "07/16/2026, 09:00 AM", by: "Vapi", notes: "" }],
    }],
  });
  const state = await getState();
  const order = state.orders.find((item) => item.id === "SO-SHIP");
  assert.equal(order.status, "sent_to_shipping");
  assert.equal(order.statusHistory.some((entry) => entry.status === "verified"), true);
  assert.equal(order.statusHistory.some((entry) => entry.status === "sent_to_shipping"), true);
});

test("sales orders persist optional purchase order numbers", async () => {
  await postState({
    orders: [
      { id: "SO-PO-WITH", customerId: "C-PO", rep: "Jordan Lee", purchase_order_number: "PO-45821", status: "pending" },
      { id: "SO-PO-WITHOUT", customerId: "C-PO", rep: "Jordan Lee", status: "pending" },
    ],
  });

  let state = await getState();
  assert.equal(state.orders.find((item) => item.id === "SO-PO-WITH").purchase_order_number, "PO-45821");
  assert.equal(state.orders.find((item) => item.id === "SO-PO-WITHOUT").purchase_order_number, "");

  await postState({
    orders: [{ id: "SO-PO-WITH", customerId: "C-PO", rep: "Jordan Lee", purchase_order_number: "PO-99999", status: "pending" }],
  });

  state = await getState();
  assert.equal(state.orders.find((item) => item.id === "SO-PO-WITH").purchase_order_number, "PO-99999");
});

test("Vapi outbound call receives purchase_order_number safely", async () => {
  vapiPostedCalls.length = 0;
  await postVapiCall({
    orderId: "SO-PO-VAPI",
    customerPhoneNumber: "951-555-1234",
    order: {
      order: {
        id: "SO-PO-VAPI",
        buyerName: "Mia Turner",
        customer: { name: "Baxter Machine Works", contact: "Mia Turner" },
        salesRep: "Jordan Lee",
        date: "2026-07-20",
        address: { address: "1420 Foundry Park Dr", city: "Cleveland", state: "OH", zip: "44114" },
        total: 125,
        purchase_order_number: "PO-45821",
        items: [{ name: "2 inch packing tape", orderedQty: 5, unitPrice: 25 }],
      },
    },
  });
  await postVapiCall({
    orderId: "SO-PO-EMPTY",
    customerPhoneNumber: "951-555-1234",
    order: { order: { id: "SO-PO-EMPTY", customer: {}, items: [] } },
  });

  assert.equal(vapiPostedCalls[0].assistantOverrides.variableValues.purchase_order_number, "PO-45821");
  assert.equal(vapiPostedCalls[0].metadata.purchase_order_number, "PO-45821");
  assert.equal(vapiPostedCalls[1].assistantOverrides.variableValues.purchase_order_number, "");
});

test("Unit of Measure API seeds defaults, adds records, and rejects duplicate names", async () => {
  const seeded = await getUnitsOfMeasure();
  assert.equal(seeded.units.some((unit) => unit.name === "Units"), true);
  assert.equal(seeded.units.some((unit) => unit.name === "Cases"), true);
  assert.equal(seeded.units.some((unit) => unit.name === "Rolls"), true);
  assert.equal(seeded.units.some((unit) => unit.name === "Coils"), true);
  assert.equal(seeded.units.some((unit) => unit.name === "Boxes"), true);

  const created = await postUnitOfMeasure({ name: "Totes", singular_name: "tote", plural_name: "totes", abbreviation: "TT" });
  assert.equal(created.response.status, 201);
  assert.equal(created.body.unit.name, "Totes");

  const duplicate = await postUnitOfMeasure({ name: "totes", singular_name: "tote", plural_name: "totes" });
  assert.equal(duplicate.response.status, 409);
});

test("existing line items default safely to Units and retain inactive classifications", async () => {
  await postState({
    unitOfMeasures: [{ id: "UOM-OLD", name: "Old Cases", singular_name: "old case", plural_name: "old cases", abbreviation: "OC", is_active: false, sort_order: 999 }],
    orders: [
      { id: "SO-UOM-DEFAULT", customerId: "C-UOM", rep: "Jordan Lee", items: [{ productId: "P-1", qty: 2, price: 1 }] },
      { id: "SO-UOM-INACTIVE", customerId: "C-UOM", rep: "Jordan Lee", items: [{ productId: "P-1", qty: 2, price: 1, unit_of_measure_id: "UOM-OLD" }] },
    ],
  });
  const state = await getState();
  assert.equal(state.orders.find((order) => order.id === "SO-UOM-DEFAULT").items[0].unit_of_measure_id, "UOM-UNITS");
  assert.equal(state.orders.find((order) => order.id === "SO-UOM-INACTIVE").items[0].unit_of_measure_id, "UOM-OLD");
});

test("Vapi verified webhook updates order once and ignores duplicates", async () => {
  await postState({
    orders: [{
      id: "SO-VAPI-VERIFIED",
      customerId: "C-VAPI",
      rep: "Jordan Lee",
      status: "verification_in_progress",
      verification: { vapiCallId: "call_verified_1", state: "verification_in_progress" },
      statusHistory: [],
    }],
  });

  const event = vapiWebhook({
    callId: "call_verified_1",
    orderId: "SO-VAPI-VERIFIED",
    outcome: "VERIFIED",
    transcript: "The buyer confirmed the order is correct.",
  });
  const result = await postVapiWebhook(event);
  assert.equal(result.outcome, "VERIFIED");

  let state = await getState();
  let order = state.orders.find((item) => item.id === "SO-VAPI-VERIFIED");
  assert.equal(order.status, "verified");
  assert.equal(order.verification.state, "verified");
  assert.equal(order.verification.verifiedDate.length > 0, true);
  assert.equal(order.verification.callDuration, "135");
  assert.match(order.verification.transcript, /confirmed the order/i);
  assert.equal(order.verificationHistory.length, 1);
  assert.equal(order.vapiNotes.length, 1);
  assert.equal(order.vapiNotes[0].verification_outcome, "VERIFIED");
  assert.equal(order.vapiNotes[0].summary, "Customer verified the sales order.");
  assert.equal(order.vapi_notes_count, 1);
  assert.equal(order.has_vapi_changes, undefined);

  const duplicate = await postVapiWebhook(event);
  assert.equal(duplicate.duplicate, true);
  state = await getState();
  order = state.orders.find((item) => item.id === "SO-VAPI-VERIFIED");
  assert.equal(order.verificationHistory.length, 1);
  assert.equal(order.vapiNotes.length, 1);
  assert.equal(order.statusHistory.filter((entry) => entry.status === "verified").length, 1);
});

test("Vapi webhook reads ERP_Order_Verification structuredOutputs result", async () => {
  await postState({
    orders: [{
      id: "SO-VAPI-STRUCTURED",
      customerId: "C-VAPI",
      rep: "Jordan Lee",
      status: "verification_in_progress",
      verification: { vapiCallId: "call_structured_1", state: "verification_in_progress", method: "Assistant" },
    }],
  });

  const result = await postVapiWebhook(vapiStructuredOutputWebhook({
    callId: "call_structured_1",
    orderId: "SO-VAPI-STRUCTURED",
    transcript: "Buyer confirmed the order and reported the ship date changed.",
    result: {
      verification_outcome: "VERIFIED",
      summary: "Buyer confirmed the order.",
      callback_notes: "",
      cancellation_reason: "",
      changes_reported: true,
      change_summary: "Customer requested an updated ship date.",
    },
  }));

  assert.equal(result.outcome, "VERIFIED");
  const state = await getState();
  const order = state.orders.find((item) => item.id === "SO-VAPI-STRUCTURED");
  assert.equal(order.status, "verified");
  assert.equal(order.verification.state, "verified");
  assert.equal(order.verification.summary, "Buyer confirmed the order.");
  assert.equal(order.verification.changeSummary, "Customer requested an updated ship date.");
  assert.equal(order.verification.changesReported, "true");
  assert.equal(order.verificationHistory.at(-1).summary, "Buyer confirmed the order.");
  assert.equal(order.vapiNotes.length, 1);
  assert.equal(order.vapiNotes[0].changes_reported, true);
  assert.equal(order.vapiNotes[0].change_summary, "Customer requested an updated ship date.");
  assert.equal(order.vapiNotes[0].change_review_status, "Pending Review");
  assert.equal(order.vapi_notes_count, 1);
  assert.equal(order.has_vapi_changes, true);
  assert.equal(order.vapi_change_review_status, "Pending Review");
  assert.equal(order.vapi_change_summary, "Customer requested an updated ship date.");
  assert.equal(state.auditLog.some((entry) => entry.action === "Vapi note imported" && entry.order_number === "SO-VAPI-STRUCTURED"), true);
  assert.equal(state.auditLog.some((entry) => entry.action === "Order flagged for customer change" && entry.order_number === "SO-VAPI-STRUCTURED"), true);
});

test("Vapi PO correction creates a pending customer change request without overwriting order", async () => {
  await postState({
    orders: [{
      id: "SO-VAPI-PO-CORRECT",
      customerId: "C-VAPI",
      rep: "Jordan Lee",
      status: "verification_in_progress",
      purchase_order_number: "PO-45812",
      verification: { vapiCallId: "call_po_correct_1", state: "verification_in_progress", method: "Assistant" },
    }],
  });

  await postVapiWebhook(vapiStructuredOutputWebhook({
    callId: "call_po_correct_1",
    orderId: "SO-VAPI-PO-CORRECT",
    transcript: "Buyer said the correct purchase order number is PO-45821.",
    result: {
      verification_outcome: "VERIFIED",
      summary: "Buyer confirmed the order and corrected the PO number.",
      changes_reported: true,
      change_summary: "Purchase Order Number corrected from PO-45812 to PO-45821.",
      purchase_order_number_changed: true,
      purchase_order_number_old: "PO-45812",
      purchase_order_number_new: "PO-45821",
    },
  }));

  const state = await getState();
  const order = state.orders.find((item) => item.id === "SO-VAPI-PO-CORRECT");
  assert.equal(order.purchase_order_number, "PO-45812");
  assert.equal(order.has_vapi_changes, true);
  assert.equal(order.customerChangeRequests.length, 1);
  assert.equal(order.customerChangeRequests[0].field, "purchase_order_number");
  assert.equal(order.customerChangeRequests[0].current_value, "PO-45812");
  assert.equal(order.customerChangeRequests[0].customer_value, "PO-45821");
  assert.equal(order.customerChangeRequests[0].status, "Pending Review");
  assert.equal(order.vapiNotes[0].purchase_order_number_changed, true);
  assert.match(order.vapiNotes[0].purchase_order_note, /PO-45821/);
});

test("Vapi PO confirmation is saved in notes without flagging a correction", async () => {
  await postState({
    orders: [{
      id: "SO-VAPI-PO-CONFIRM",
      customerId: "C-VAPI",
      rep: "Jordan Lee",
      status: "verification_in_progress",
      purchase_order_number: "PO-45821",
      verification: { vapiCallId: "call_po_confirm_1", state: "verification_in_progress", method: "Assistant" },
    }],
  });

  await postVapiWebhook(vapiStructuredOutputWebhook({
    callId: "call_po_confirm_1",
    orderId: "SO-VAPI-PO-CONFIRM",
    result: {
      verification_outcome: "VERIFIED",
      summary: "Buyer confirmed the order and PO number.",
      changes_reported: false,
      change_summary: "No customer information changes reported.",
      purchase_order_number_changed: false,
      purchase_order_number_old: "PO-45821",
      purchase_order_number_new: "",
    },
  }));

  const state = await getState();
  const order = state.orders.find((item) => item.id === "SO-VAPI-PO-CONFIRM");
  assert.equal(order.has_vapi_changes, undefined);
  assert.equal(order.customerChangeRequests, undefined);
  assert.equal(order.vapiNotes[0].purchase_order_note, "Purchase Order Number confirmed: PO-45821.");
});

test("Vapi unit classification correction flags order and creates pending change request", async () => {
  await postState({
    products: [{ id: "P-GLOVES", name: "Nitrile Gloves", sku: "GLV" }],
    orders: [{
      id: "SO-VAPI-UOM-CORRECT",
      customerId: "C-VAPI",
      rep: "Jordan Lee",
      status: "verification_in_progress",
      items: [{ productId: "P-GLOVES", qty: 4, price: 10, unit_of_measure_id: "UOM-CASES" }],
      verification: { vapiCallId: "call_uom_correct_1", state: "verification_in_progress", method: "Assistant" },
    }],
  });

  await postVapiWebhook(vapiStructuredOutputWebhook({
    callId: "call_uom_correct_1",
    orderId: "SO-VAPI-UOM-CORRECT",
    result: {
      verification_outcome: "VERIFIED",
      summary: "Buyer confirmed the order but corrected the classification.",
      changes_reported: true,
      change_summary: "Nitrile Gloves should be boxes, not cases.",
      unit_classification_changed: true,
      unit_classification_changes: "Nitrile Gloves changed from cases to boxes.",
    },
  }));

  const state = await getState();
  const order = state.orders.find((item) => item.id === "SO-VAPI-UOM-CORRECT");
  assert.equal(order.items[0].unit_of_measure_id, "UOM-CASES");
  assert.equal(order.has_vapi_changes, true);
  assert.equal(order.customerChangeRequests.length, 1);
  assert.equal(order.customerChangeRequests[0].field, "unit_of_measure");
  assert.equal(order.customerChangeRequests[0].product_name, "Nitrile Gloves");
  assert.equal(order.customerChangeRequests[0].current_value, "Cases");
  assert.equal(order.customerChangeRequests[0].customer_value, "Boxes");
  assert.equal(order.customerChangeRequests[0].requested_unit_of_measure_id, "UOM-BOXES");
  assert.equal(order.vapiNotes[0].unit_classification_changed, true);
  assert.match(order.vapiNotes[0].verified_items, /4 cases of Nitrile Gloves/);
});

test("Vapi status-update in-progress keeps the order calling without finalizing", async () => {
  await postState({
    orders: [{ id: "SO-VAPI-STATUS", customerId: "C-VAPI", rep: "Jordan Lee", status: "pending" }],
  });

  await postVapiWebhook(vapiStatusUpdate({ callId: "call_status_1", orderId: "SO-VAPI-STATUS", status: "in-progress" }));

  const state = await getState();
  const order = state.orders.find((item) => item.id === "SO-VAPI-STATUS");
  assert.equal(order.status, "verification_in_progress");
  assert.equal(order.verification.state, "verification_in_progress");
  assert.equal(state.processedVapiCallIds?.includes("call_status_1"), false);
});

test("Vapi status-update ended with empty outputs does not finalize or enqueue", async () => {
  await postState({
    orders: [{ id: "SO-VAPI-STATUS-END", customerId: "C-VAPI", rep: "Jordan Lee", status: "verification_in_progress" }],
  });

  await postVapiWebhook(vapiStatusUpdate({ callId: "call_status_end_1", orderId: "SO-VAPI-STATUS-END", status: "ended" }));

  const state = await getState();
  const order = state.orders.find((item) => item.id === "SO-VAPI-STATUS-END");
  assert.equal(order.status, "verification_in_progress");
  assert.equal(order.verification, undefined);
  assert.equal(state.vapiStructuredOutputRetries?.some((record) => record.callId === "call_status_end_1"), false);
});

test("Vapi end-of-call empty output retries and applies fetched structured output", async () => {
  await postState({
    orders: [{
      id: "SO-VAPI-RETRY",
      customerId: "C-VAPI",
      rep: "Jordan Lee",
      status: "verification_in_progress",
      verification: { vapiCallId: "call_retry_1", state: "verification_in_progress", method: "Assistant" },
    }],
  });
  vapiCallResponses.set("call_retry_1", [completedVapiCall({
    callId: "call_retry_1",
    orderId: "SO-VAPI-RETRY",
    result: { verification_outcome: "VERIFIED", summary: "Fetched output verified the order." },
  })]);

  const response = await postVapiWebhook(vapiEmptyStructuredOutputWebhook({
    callId: "call_retry_1",
    orderId: "SO-VAPI-RETRY",
    transcript: "Initial webhook transcript.",
  }));
  assert.equal(response.queued, true);
  const duplicate = await postVapiWebhook(vapiEmptyStructuredOutputWebhook({
    callId: "call_retry_1",
    orderId: "SO-VAPI-RETRY",
    transcript: "Duplicate initial webhook transcript.",
  }));
  assert.equal(duplicate.queued, true);

  let state = await getState();
  assert.equal(state.processedVapiCallIds?.includes("call_retry_1"), false);
  assert.equal(state.vapiStructuredOutputRetries.filter((record) => record.callId === "call_retry_1").length, 1);
  assert.equal(state.vapiStructuredOutputRetries.some((record) => record.callId === "call_retry_1" && record.status === "pending"), true);

  const { order } = await waitForOrder("SO-VAPI-RETRY", (item) => item.status === "verified", 1200);
  assert.equal(order.verification.state, "verified");
  assert.equal(order.verification.summary, "Fetched output verified the order.");
  assert.equal(order.vapiNotes.length, 1);
  assert.equal(order.vapiNotes[0].summary, "Fetched output verified the order.");
});

test("Vapi retry succeeds when output becomes available on second attempt", async () => {
  await postState({
    orders: [{
      id: "SO-VAPI-SECOND-RETRY",
      customerId: "C-VAPI",
      rep: "Jordan Lee",
      status: "verification_in_progress",
      verification: { vapiCallId: "call_retry_2", state: "verification_in_progress", method: "Assistant" },
    }],
  });
  vapiCallResponses.set("call_retry_2", [
    { id: "call_retry_2", artifact: { structuredOutputs: {} }, metadata: { orderId: "SO-VAPI-SECOND-RETRY" } },
    completedVapiCall({
      callId: "call_retry_2",
      orderId: "SO-VAPI-SECOND-RETRY",
      result: { verification_outcome: "CANCELLED", summary: "Buyer cancelled.", cancellation_reason: "Ordered elsewhere" },
    }),
  ]);

  await postVapiWebhook(vapiEmptyStructuredOutputWebhook({ callId: "call_retry_2", orderId: "SO-VAPI-SECOND-RETRY" }));

  const { order } = await waitForOrder("SO-VAPI-SECOND-RETRY", (item) => item.status === "cancelled", 1200);
  assert.equal(order.verification.state, "cancelled");
  assert.equal(order.verification.cancellationNotes, "Ordered elsewhere");
  assert.equal(order.vapiNotes.length, 1);
  assert.equal(order.vapiNotes[0].cancellation_reason, "Ordered elsewhere");
});

test("Vapi retry exhaustion changes final verification to needs review", async () => {
  await postState({
    orders: [{
      id: "SO-VAPI-RETRY-EXHAUST",
      customerId: "C-VAPI",
      rep: "Jordan Lee",
      status: "verification_in_progress",
      verification: { vapiCallId: "call_retry_exhaust", state: "verification_in_progress", method: "Assistant" },
    }],
  });
  vapiCallResponses.set("call_retry_exhaust", [
    { id: "call_retry_exhaust", artifact: { structuredOutputs: {} }, metadata: { orderId: "SO-VAPI-RETRY-EXHAUST" } },
  ]);

  await postVapiWebhook(vapiEmptyStructuredOutputWebhook({ callId: "call_retry_exhaust", orderId: "SO-VAPI-RETRY-EXHAUST" }));

  const { order, state } = await waitForOrder("SO-VAPI-RETRY-EXHAUST", (item) => item.verification?.state === "needs_review", 1500);
  assert.equal(order.status, "verification_in_progress");
  assert.equal(order.verification.summary, "Vapi structured analysis was not available after retry attempts.");
  assert.equal(state.vapiStructuredOutputRetries.find((record) => record.callId === "call_retry_exhaust").status, "exhausted");
  assert.equal(order.vapiNotes.length, 1);
  assert.equal(order.vapiNotes[0].verification_outcome, "INCOMPLETE");
});

test("Vapi retry accepts alternate ERP Order Verification output name", async () => {
  await postState({
    orders: [{
      id: "SO-VAPI-ALT-NAME",
      customerId: "C-VAPI",
      rep: "Jordan Lee",
      status: "verification_in_progress",
      verification: { vapiCallId: "call_alt_name", state: "verification_in_progress", method: "Assistant" },
    }],
  });
  vapiCallResponses.set("call_alt_name", [completedVapiCall({
    callId: "call_alt_name",
    orderId: "SO-VAPI-ALT-NAME",
    name: "ERP Order Verification",
    result: { verification_outcome: "VERIFIED", summary: "Alternate name verified." },
  })]);

  await postVapiWebhook(vapiEmptyStructuredOutputWebhook({ callId: "call_alt_name", orderId: "SO-VAPI-ALT-NAME" }));

  const { order } = await waitForOrder("SO-VAPI-ALT-NAME", (item) => item.status === "verified", 1200);
  assert.equal(order.verification.summary, "Alternate name verified.");
  assert.equal(order.vapiNotes.length, 1);
});

test("Vapi cancelled webhook cancels the order", async () => {
  await postState({
    orders: [{ id: "SO-VAPI-CANCEL", customerId: "C-VAPI", rep: "Jordan Lee", status: "verification_in_progress" }],
  });

  await postVapiWebhook(vapiWebhook({
    callId: "call_cancel_1",
    orderId: "SO-VAPI-CANCEL",
    outcome: "CANCELLED",
    transcript: "The buyer said cancel the order and do not ship it.",
  }));

  const state = await getState();
  const order = state.orders.find((item) => item.id === "SO-VAPI-CANCEL");
  assert.equal(order.status, "cancelled");
  assert.equal(order.verification.state, "cancelled");
  assert.equal(order.verification.cancellationDate.length > 0, true);
  assert.equal(order.verification.cancelledBy, "Customer");
  assert.equal(order.verification.cancellationNotes, "Other");
  assert.equal(order.verificationHistory.at(-1).outcome, "CANCELLED");
  assert.equal(order.vapiNotes.length, 1);
  assert.equal(order.vapiNotes[0].verification_outcome, "CANCELLED");
  assert.equal(order.vapiNotes[0].cancellation_reason, "Other");
});

test("Vapi callback-requested webhook stores issue verification and callback notes", async () => {
  await postState({
    orders: [{ id: "SO-VAPI-CALLBACK", customerId: "C-VAPI", rep: "Jordan Lee", status: "verification_in_progress" }],
  });

  await postVapiWebhook(vapiWebhook({
    callId: "call_callback_1",
    orderId: "SO-VAPI-CALLBACK",
    outcome: "CALLBACK_REQUESTED",
    transcript: "The buyer said call back next week after they get manager approval.",
    structuredData: {
      verification_outcome: "CALLBACK_REQUESTED",
      callback_requested: true,
      callback_notes: "Call back next week",
      summary: "Buyer requested a callback next week.",
      verified: false,
    },
  }));

  const state = await getState();
  const order = state.orders.find((item) => item.id === "SO-VAPI-CALLBACK");
  assert.equal(order.status, "verification_in_progress");
  assert.equal(order.verification.state, "issue");
  assert.equal(order.verification.outcome, "callback_requested");
  assert.equal(order.verification.callbackNotes, "Call back next week");
  assert.equal(order.verificationHistory.at(-1).summary, "Buyer requested a callback next week.");
  assert.equal(order.vapiNotes.length, 1);
  assert.equal(order.vapiNotes[0].callback_notes, "Call back next week");
});

test("Vapi voicemail and no-answer webhooks do not change order status", async () => {
  await postState({
    orders: [{ id: "SO-VAPI-ATTEMPTS", customerId: "C-VAPI", rep: "Jordan Lee", status: "verification_in_progress" }],
  });

  await postVapiWebhook(vapiWebhook({
    callId: "call_voicemail_1",
    orderId: "SO-VAPI-ATTEMPTS",
    outcome: "VOICEMAIL",
    transcript: "The call reached voicemail.",
    endedReason: "voicemail",
  }));
  await postVapiWebhook(vapiWebhook({
    callId: "call_no_answer_1",
    orderId: "SO-VAPI-ATTEMPTS",
    outcome: "NO_ANSWER",
    transcript: "",
    endedReason: "customer-did-not-answer",
  }));

  const state = await getState();
  const order = state.orders.find((item) => item.id === "SO-VAPI-ATTEMPTS");
  assert.equal(order.status, "verification_in_progress");
  assert.equal(order.verification.state, "no_answer");
  assert.equal(order.verification.attempts, 1);
  assert.deepEqual(order.verificationHistory.map((entry) => entry.outcome), ["VOICEMAIL", "NO_ANSWER"]);
  assert.equal(order.vapiNotes.length, 2);
  assert.deepEqual(order.vapiNotes.map((entry) => entry.verification_outcome).sort(), ["NO_ANSWER", "VOICEMAIL"]);
});

test("Vapi failed webhook is logged without moving the order status", async () => {
  await postState({
    orders: [{ id: "SO-VAPI-FAILED", customerId: "C-VAPI", rep: "Jordan Lee", status: "verification_in_progress" }],
  });

  await postVapiWebhook(vapiWebhook({
    callId: "call_failed_1",
    orderId: "SO-VAPI-FAILED",
    outcome: "FAILED",
    transcript: "",
    endedReason: "phone-call-provider-error",
    status: "failed",
  }));

  const state = await getState();
  const order = state.orders.find((item) => item.id === "SO-VAPI-FAILED");
  assert.equal(order.status, "verification_in_progress");
  assert.equal(order.verification.state, "failed");
  assert.equal(order.verificationHistory.at(-1).outcome, "FAILED");
  assert.equal(Array.isArray(state.vapiWebhookFailures), true);
  assert.equal(state.vapiWebhookFailures.at(-1).callId, "call_failed_1");
});

test("Vapi webhook without matching order is logged for manual review", async () => {
  await postVapiWebhook(vapiWebhook({
    callId: "call_missing_order_1",
    orderId: "SO-NOT-FOUND",
    outcome: "VERIFIED",
    transcript: "The buyer confirmed the order.",
  }));

  const state = await getState();
  assert.equal(Array.isArray(state.vapiWebhookManualReview), true);
  assert.equal(state.vapiWebhookManualReview.at(-1).orderId, "SO-NOT-FOUND");
});

test("Vapi webhook falls back to transcript when structured output is missing", async () => {
  await postState({
    orders: [{ id: "SO-VAPI-FALLBACK", customerId: "C-VAPI", rep: "Jordan Lee", status: "verification_in_progress" }],
  });

  await postVapiWebhook(vapiWebhook({
    callId: "call_fallback_1",
    orderId: "SO-VAPI-FALLBACK",
    outcome: "",
    transcript: "Yes, this order is confirmed and correct. Please ship it.",
    structuredData: {},
  }));

  const state = await getState();
  const order = state.orders.find((item) => item.id === "SO-VAPI-FALLBACK");
  assert.equal(order.status, "verified");
  assert.equal(order.verification.state, "verified");
  assert.equal(order.verificationHistory.at(-1).outcome, "VERIFIED");
});

test("Vapi incomplete structured output becomes needs review", async () => {
  await postState({
    orders: [{
      id: "SO-VAPI-INCOMPLETE",
      customerId: "C-VAPI",
      rep: "Jordan Lee",
      status: "verification_in_progress",
      verification: { vapiCallId: "call_incomplete_1", state: "verification_in_progress", method: "Assistant" },
    }],
  });

  await postVapiWebhook(vapiStructuredOutputWebhook({
    callId: "call_incomplete_1",
    orderId: "SO-VAPI-INCOMPLETE",
    result: {
      verification_outcome: "INCOMPLETE",
      summary: "Buyer did not complete verification.",
    },
  }));

  const state = await getState();
  const order = state.orders.find((item) => item.id === "SO-VAPI-INCOMPLETE");
  assert.equal(order.status, "verification_in_progress");
  assert.equal(order.verification.state, "needs_review");
  assert.equal(order.verification.summary, "Buyer did not complete verification.");
  assert.equal(order.verificationHistory.at(-1).outcome, "INCOMPLETE");
});
