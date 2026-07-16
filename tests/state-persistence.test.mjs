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

test("deleted sales orders stay permanently deleted when stale data is posted", async () => {
  await postState({
    orders: [{ id: "SO-DELETE", customerId: "C-9", rep: "Jordan Lee" }],
    deletedOrders: ["SO-DELETE"],
  });
  await postState({
    orders: [{ id: "SO-DELETE", customerId: "C-9", rep: "Jordan Lee" }],
  });
  const state = await getState();
  assert.equal(state.orders.some((order) => order.id === "SO-DELETE"), false);
  assert.equal(state.deletedOrders.includes("SO-DELETE"), true);
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
