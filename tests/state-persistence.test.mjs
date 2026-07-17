import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test, { after, before } from "node:test";

let appProcess;
let appPort;
let dataDir;

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

async function postVapiWebhook(body) {
  const response = await fetch(`http://127.0.0.1:${appPort}/api/vapi/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) assert.fail(await response.text());
  return response.json();
}

function vapiWebhook({ callId, orderId, outcome, transcript, endedReason = "customer-ended-call", status = "ended" }) {
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
      analysis: { structuredData: { outcome } },
    },
  };
}

before(async () => {
  const { createServer } = await import("node:http");
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
    },
    stdio: "ignore",
  });
  await waitForApp();
});

after(async () => {
  if (appProcess) appProcess.kill();
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

  const duplicate = await postVapiWebhook(event);
  assert.equal(duplicate.duplicate, true);
  state = await getState();
  order = state.orders.find((item) => item.id === "SO-VAPI-VERIFIED");
  assert.equal(order.verificationHistory.length, 1);
  assert.equal(order.statusHistory.filter((entry) => entry.status === "verified").length, 1);
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
  assert.equal(order.verificationHistory.at(-1).outcome, "CANCELLED");
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
});

test("Vapi failed webhook is logged without modifying the order", async () => {
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
  assert.equal(order.verification, undefined);
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
