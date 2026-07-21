import { createServer } from "node:http";
import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const builtRoot = path.join(__dirname, "dist");
const sourceRoot = path.join(__dirname, "outputs");
const root = existsSync(path.join(builtRoot, "index.html")) ? builtRoot : sourceRoot;
const port = Number(process.env.PORT) || 4173;
const host = process.env.HOST || "0.0.0.0";
const dataRoot = process.env.ALLIED_ERP_DATA_DIR || path.join(__dirname, ".data");
const sharedStatePath = path.join(dataRoot, "shared-state.json");
const backupRoot = path.join(dataRoot, "backups");
const starterUsers = [
  { username: "admin", role: "super_admin", name: "Main Admin" },
  { username: "credit", role: "credit", name: "Credit Dept." },
  { username: "shipping", role: "shipping", name: "Shipping" },
  { username: "jordan", role: "sales", name: "Jordan Lee" },
  { username: "avery", role: "sales", name: "Avery Brooks" },
];
const defaultUnitOfMeasures = [
  ["UOM-UNITS", "Units", "unit", "units", "EA"],
  ["UOM-EACH", "Each", "each", "each", "EA"],
  ["UOM-CASES", "Cases", "case", "cases", "CS"],
  ["UOM-ROLLS", "Rolls", "roll", "rolls", "RL"],
  ["UOM-COILS", "Coils", "coil", "coils", "CO"],
  ["UOM-BOXES", "Boxes", "box", "boxes", "BX"],
  ["UOM-CARTONS", "Cartons", "carton", "cartons", "CT"],
  ["UOM-PACKS", "Packs", "pack", "packs", "PK"],
  ["UOM-PALLETS", "Pallets", "pallet", "pallets", "PL"],
  ["UOM-DRUMS", "Drums", "drum", "drums", "DR"],
  ["UOM-BAGS", "Bags", "bag", "bags", "BG"],
  ["UOM-BUNDLES", "Bundles", "bundle", "bundles", "BD"],
  ["UOM-SETS", "Sets", "set", "sets", "SET"],
  ["UOM-PAIRS", "Pairs", "pair", "pairs", "PR"],
  ["UOM-FEET", "Feet", "foot", "feet", "FT"],
  ["UOM-POUNDS", "Pounds", "pound", "pounds", "LB"],
  ["UOM-GALLONS", "Gallons", "gallon", "gallons", "GAL"],
].map(([id, name, singular_name, plural_name, abbreviation], index) => ({
  id,
  name,
  singular_name,
  plural_name,
  abbreviation,
  is_active: true,
  sort_order: (index + 1) * 10,
  created_at: "2026-07-21T00:00:00.000Z",
  updated_at: "2026-07-21T00:00:00.000Z",
  created_by: "System",
}));
const envPasswordKeys = {
  admin: "ALLIED_ERP_ADMIN_PASSWORD",
  credit: "ALLIED_ERP_CREDIT_PASSWORD",
  shipping: "ALLIED_ERP_SHIPPING_PASSWORD",
  jordan: "ALLIED_ERP_JORDAN_PASSWORD",
  avery: "ALLIED_ERP_AVERY_PASSWORD",
};
const vapiApiUrl = process.env.VAPI_API_URL || "https://api.vapi.ai/call";
const vapiRetryDelaysMs = (process.env.VAPI_STRUCTURED_OUTPUT_RETRY_DELAYS_MS || "3000,6000,12000,25000")
  .split(",")
  .map((value) => Number(value.trim()))
  .filter((value) => Number.isFinite(value) && value >= 0);
const retryWorkerIntervalMs = Number(process.env.VAPI_RETRY_WORKER_INTERVAL_MS || 5000);
let retryWorkerRunning = false;
let sharedStateWriteQueue = Promise.resolve();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
};

function resolveRequestPath(url) {
  const requestPath = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  const candidate = path.resolve(root, relativePath);
  if (!candidate.startsWith(root)) return null;
  if (existsSync(candidate)) return candidate;
  return path.join(root, "index.html");
}

async function readSharedStateJson() {
  if (!existsSync(sharedStatePath)) return {};
  try {
    return migrateSharedState(JSON.parse(await readFile(sharedStatePath, "utf8")));
  } catch {
    return {};
  }
}

function migrateOrderRecord(order = {}) {
  const units = normalizeUnitOfMeasuresForState({});
  return {
    ...order,
    purchase_order_number: purchaseOrderNumber(order) || "",
    items: Array.isArray(order.items) ? order.items.map((item) => migrateLineItem(item, units)) : order.items,
  };
}

function migrateSharedState(state = {}) {
  const unitOfMeasures = normalizeUnitOfMeasuresForState(state);
  return {
    ...state,
    unitOfMeasures,
    orders: Array.isArray(state.orders) ? state.orders.map((order) => ({
      ...order,
      purchase_order_number: purchaseOrderNumber(order) || "",
      items: Array.isArray(order.items) ? order.items.map((item) => migrateLineItem(item, unitOfMeasures)) : order.items,
    })) : state.orders,
  };
}

function normalizeUnitOfMeasuresForState(state = {}) {
  const records = new Map();
  [...defaultUnitOfMeasures, ...(Array.isArray(state.unitOfMeasures) ? state.unitOfMeasures : [])].forEach((unit, index) => {
    if (!unit?.id && !unit?.name) return;
    const id = unit.id || `UOM-${Date.now()}-${index}`;
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

function unitByName(units = [], name = "") {
  const target = String(name || "").trim().toLowerCase();
  if (!target) return null;
  return units.find((unit) => [unit.name, unit.singular_name, unit.plural_name, unit.abbreviation].some((value) => String(value || "").trim().toLowerCase() === target)) || null;
}

function unitById(units = [], id = "") {
  return units.find((unit) => unit.id === id) || null;
}

function defaultUnit(units = defaultUnitOfMeasures) {
  return unitById(units, "UOM-UNITS") || units[0] || defaultUnitOfMeasures[0];
}

function unitSnapshot(unit = defaultUnit()) {
  return {
    id: unit.id,
    name: unit.name,
    singular_name: unit.singular_name,
    plural_name: unit.plural_name,
    abbreviation: unit.abbreviation || "",
  };
}

function lineItemUnit(item = {}, units = defaultUnitOfMeasures) {
  return unitById(units, item.unit_of_measure_id)
    || unitByName(units, item.unit_of_measure_snapshot?.name || item.unit_of_measure_snapshot?.plural_name || item.unit || item.uom || item.unitOfMeasure)
    || defaultUnit(units);
}

function migrateLineItem(item = {}, units = defaultUnitOfMeasures) {
  const unit = lineItemUnit(item, units);
  return {
    ...item,
    unit_of_measure_id: unit.id,
    unit_of_measure_snapshot: item.unit_of_measure_snapshot || unitSnapshot(unit),
    unit_of_measure: unitSnapshot(unit),
  };
}

async function writeSharedStateJsonNow(state) {
  await mkdir(dataRoot, { recursive: true });
  const body = JSON.stringify(state, null, 2);
  const temporaryPath = `${sharedStatePath}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
  if (existsSync(sharedStatePath)) {
    await mkdir(backupRoot, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await copyFile(sharedStatePath, path.join(backupRoot, `shared-state-${stamp}.json`)).catch(() => {});
    await copyFile(sharedStatePath, path.join(backupRoot, "shared-state-latest.json")).catch(() => {});
  }
  await writeFile(temporaryPath, body, "utf8");
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await rename(temporaryPath, sharedStatePath);
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function writeSharedStateJson(state) {
  sharedStateWriteQueue = sharedStateWriteQueue.catch(() => {}).then(() => writeSharedStateJsonNow(state));
  return sharedStateWriteQueue;
}

function uniqueList(...lists) {
  return [...new Set(lists.flat().filter(Boolean).map(String))];
}

function mergeByKey(existing = [], incoming = [], key, deleted = []) {
  const deletedSet = new Set(deleted);
  const records = new Map();
  existing.forEach((item) => {
    const id = item?.[key];
    if (id && !deletedSet.has(String(id))) records.set(String(id), item);
  });
  incoming.forEach((item) => {
    const id = item?.[key];
    if (id && !deletedSet.has(String(id))) records.set(String(id), item);
  });
  return [...records.values()];
}

const statusRank = {
  pending: 10,
  issue: 20,
  verification_in_progress: 30,
  verified: 40,
  pending_ap: 50,
  credit_hold: 60,
  kickback_pending: 65,
  sent_to_shipping: 80,
  partial_ship: 90,
  order_shipped: 100,
  completed: 110,
  cancelled: 120,
};

function statusTime(order = {}) {
  const parsed = Date.parse(order.statusChangedAt || order.verification?.at || order.updatedAt || order.date || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function orderRank(order = {}) {
  return statusRank[order.status] || 0;
}

function mergeStatusHistory(...orders) {
  const history = new Map();
  orders.flatMap((order) => (Array.isArray(order?.statusHistory) ? order.statusHistory : [])).forEach((entry) => {
    const key = [entry.status, entry.at, entry.by, entry.notes].map((value) => value || "").join("|");
    history.set(key, entry);
  });
  return [...history.values()];
}

function mergeVerificationHistory(...orders) {
  const history = new Map();
  orders.flatMap((order) => (Array.isArray(order?.verificationHistory) ? order.verificationHistory : [])).forEach((entry, index) => {
    const key = entry.callId || [entry.outcome, entry.timestamp, entry.transcript, index].map((value) => value || "").join("|");
    history.set(key, entry);
  });
  return [...history.values()];
}

function mergeVapiNotes(...orders) {
  const notes = new Map();
  orders.flatMap((order) => (Array.isArray(order?.vapiNotes) ? order.vapiNotes : [])).forEach((note, index) => {
    const key = note.vapi_call_id || note.id || [note.order_number, note.created_at, index].map((value) => value || "").join("|");
    notes.set(key, note);
  });
  return [...notes.values()].sort((a, b) => Date.parse(b.created_at || "") - Date.parse(a.created_at || ""));
}

function mergeAuditEntries(...orders) {
  const entries = new Map();
  orders.flatMap((order) => (Array.isArray(order?.auditLog) ? order.auditLog : [])).forEach((entry, index) => {
    const key = [entry.action, entry.timestamp, entry.employee, entry.vapi_call_id, index].map((value) => value || "").join("|");
    entries.set(key, entry);
  });
  return [...entries.values()].sort((a, b) => Date.parse(b.timestamp || "") - Date.parse(a.timestamp || ""));
}

function mergeCustomerChangeRequests(...orders) {
  const changes = new Map();
  orders.flatMap((order) => (Array.isArray(order?.customerChangeRequests) ? order.customerChangeRequests : [])).forEach((change, index) => {
    const key = change.id || [change.field, change.vapi_call_id, change.customer_value, index].map((value) => value || "").join("|");
    changes.set(key, change);
  });
  return [...changes.values()].sort((a, b) => Date.parse(b.created_at || "") - Date.parse(a.created_at || ""));
}

function mergeStateAuditLogs(...states) {
  const entries = new Map();
  states.flatMap((state) => (Array.isArray(state?.auditLog) ? state.auditLog : [])).forEach((entry, index) => {
    const key = [entry.action, entry.timestamp, entry.employee, entry.order_number, entry.vapi_call_id, index].map((value) => value || "").join("|");
    entries.set(key, entry);
  });
  return [...entries.values()].sort((a, b) => Date.parse(b.timestamp || "") - Date.parse(a.timestamp || ""));
}

function betterOrder(existing = {}, incoming = {}) {
  const existingTime = statusTime(existing);
  const incomingTime = statusTime(incoming);
  if (incomingTime > existingTime) return incoming;
  if (existingTime > incomingTime) return existing;
  return orderRank(incoming) >= orderRank(existing) ? incoming : existing;
}

function mergeOrderRecord(existing = {}, incoming = {}) {
  const winner = betterOrder(existing, incoming);
  const loser = winner === incoming ? existing : incoming;
  const vapiNotes = mergeVapiNotes(loser, winner);
  return {
    ...loser,
    ...winner,
    purchase_order_number: purchaseOrderNumber(winner) || purchaseOrderNumber(loser) || "",
    messages: mergeByKey(loser.messages, winner.messages, "id"),
    statusHistory: mergeStatusHistory(loser, winner),
    verificationHistory: mergeVerificationHistory(loser, winner),
    vapiNotes,
    vapi_notes_count: vapiNotes.length,
    customerChangeRequests: mergeCustomerChangeRequests(loser, winner),
    auditLog: mergeAuditEntries(loser, winner),
    processedVapiCallIds: uniqueList(loser.processedVapiCallIds, winner.processedVapiCallIds),
    hiddenFor: uniqueList(loser.hiddenFor, winner.hiddenFor),
  };
}

function mergeOrders(existing = [], incoming = []) {
  const records = new Map();
  [...existing, ...incoming].forEach((order) => {
    const id = order?.id;
    if (!id) return;
    const previous = records.get(String(id));
    records.set(String(id), previous ? mergeOrderRecord(previous, order) : order);
  });
  return [...records.values()];
}

function mergeSharedState(existing = {}, incoming = {}) {
  const deletedOrders = [];
  const deletedCustomers = uniqueList(existing.deletedCustomers, incoming.deletedCustomers);
  const deletedProducts = uniqueList(existing.deletedProducts, incoming.deletedProducts);
  const deletedUsers = uniqueList(existing.deletedUsers, incoming.deletedUsers);
  const processedVapiCallIds = uniqueList(existing.processedVapiCallIds, incoming.processedVapiCallIds);
  const vapiStructuredOutputRetries = mergeByKey(existing.vapiStructuredOutputRetries, incoming.vapiStructuredOutputRetries, "callId");
  const auditLog = mergeStateAuditLogs(existing, incoming);
  const unitOfMeasures = normalizeUnitOfMeasuresForState({ unitOfMeasures: mergeByKey(existing.unitOfMeasures, incoming.unitOfMeasures, "id") });
  const merged = {
    ...existing,
    ...incoming,
    settings: { ...(existing.settings || {}), ...(incoming.settings || {}) },
    deletedOrders,
    deletedCustomers,
    deletedProducts,
    deletedUsers,
    processedVapiCallIds,
    vapiStructuredOutputRetries,
    auditLog,
    unitOfMeasures,
  };
  merged.orders = mergeOrders(existing.orders, incoming.orders).map((order) => ({
    ...order,
    items: Array.isArray(order.items) ? order.items.map((item) => migrateLineItem(item, unitOfMeasures)) : order.items,
  }));
  merged.customers = mergeByKey(existing.customers, incoming.customers, "id", deletedCustomers);
  merged.products = mergeByKey(existing.products, incoming.products, "id", deletedProducts);
  merged.users = mergeByKey(existing.users, incoming.users, "username", deletedUsers);
  return merged;
}

function safeUser(user) {
  const { password, ...publicUser } = user;
  return publicUser;
}

function envPasswordFor(username) {
  const directKey = envPasswordKeys[username] || `ALLIED_ERP_${username.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_PASSWORD`;
  return process.env[directKey] || "";
}

function parseJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function normalizePhoneNumber(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("+")) {
    const e164 = `+${raw.slice(1).replace(/\D/g, "")}`;
    return /^\+[1-9]\d{7,14}$/.test(e164) ? e164 : "";
  }
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return "";
}

function maskPhoneNumber(phoneNumber) {
  const visible = phoneNumber.slice(-4);
  return `${"*".repeat(Math.max(0, phoneNumber.length - 4))}${visible}`;
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
}

function apiOrderStatusSnapshot(order = {}) {
  return {
    orderId: order.id || "",
    status: order.status || "",
    verificationState: order.verification?.state || "",
    verificationCallStatus: order.verification?.vapiCallStatus || "",
    displayedByFrontend: "order.status + order.verification.state",
  };
}

function logApiOrderStatus(stage, orders = []) {
  const tracked = orders
    .filter((order) => order?.verification?.vapiCallId || order?.status === "verification_in_progress" || order?.status === "verified" || order?.status === "cancelled")
    .slice(0, 8)
    .map(apiOrderStatusSnapshot);
  console.log(`[api-state] ${stage}: ${JSON.stringify(tracked)}`);
}

function extractVapiCall(message) {
  return message?.message?.call || message?.call || message?.data?.call || message?.callData || message?.data || message || {};
}

function extractVapiCallId(message) {
  const call = extractVapiCall(message);
  return call.id || message?.message?.callId || message?.callId || message?.data?.callId || "";
}

function extractWebhookType(message) {
  return String(message?.message?.type || message?.type || "").toLowerCase();
}

function extractVapiCallStatus(message) {
  const call = extractVapiCall(message);
  return String(call.status || message?.message?.status || message?.status || message?.data?.status || "").toLowerCase();
}

function webhookSecretIsValid(request) {
  const secret = process.env.VAPI_WEBHOOK_SECRET || "";
  if (!secret) return true;
  const auth = request.headers.authorization || "";
  const candidates = [
    request.headers["x-vapi-secret"],
    request.headers["x-webhook-secret"],
    request.headers["x-allied-webhook-secret"],
    auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "",
  ];
  return candidates.some((value) => value && value === secret);
}

function extractVapiAnalysis(message) {
  const call = extractVapiCall(message);
  return call.analysis || message?.message?.analysis || message?.analysis || message?.data?.analysis || {};
}

function extractStructuredOutputs(message) {
  const call = extractVapiCall(message);
  return call.artifact?.structuredOutputs
    || call.structuredOutputs
    || message?.message?.call?.artifact?.structuredOutputs
    || message?.message?.artifact?.structuredOutputs
    || message?.message?.structuredOutputs
    || message?.artifact?.structuredOutputs
    || message?.structuredOutputs
    || message?.data?.call?.artifact?.structuredOutputs
    || message?.data?.artifact?.structuredOutputs
    || message?.data?.structuredOutputs
    || {};
}

function hasStructuredOutputsPayload(message) {
  const call = extractVapiCall(message);
  return Boolean(
    call.artifact?.structuredOutputs
      || call.structuredOutputs
      || message?.message?.call?.artifact?.structuredOutputs
      || message?.message?.artifact?.structuredOutputs
      || message?.message?.structuredOutputs
      || message?.artifact?.structuredOutputs
      || message?.structuredOutputs
      || message?.data?.call?.artifact?.structuredOutputs
      || message?.data?.artifact?.structuredOutputs
      || message?.data?.structuredOutputs
  );
}

function structuredOutputValues(outputs = {}) {
  return Array.isArray(outputs) ? outputs : Object.values(outputs || {});
}

function findErpStructuredOutputIn(outputs = {}) {
  return structuredOutputValues(outputs).find((item) => item?.name === "ERP_Order_Verification" || item?.name === "ERP Order Verification") || null;
}

function findErpStructuredOutput(message) {
  return findErpStructuredOutputIn(extractStructuredOutputs(message));
}

function extractStructuredData(analysis = {}) {
  return analysis.structuredData || analysis.structured || analysis.data || analysis || {};
}

function extractVapiStructuredResult(message) {
  const structuredOutput = findErpStructuredOutput(message);
  if (structuredOutput?.result && typeof structuredOutput.result === "object") return structuredOutput.result;
  return extractStructuredData(extractVapiAnalysis(message));
}

function extractVapiTranscript(message) {
  const call = extractVapiCall(message);
  return String(call.transcript || call.artifact?.transcript || message?.message?.transcript || message?.transcript || message?.artifact?.transcript || "");
}

function extractVapiEndReason(message) {
  const call = extractVapiCall(message);
  return String(call.endedReason || call.endReason || message?.message?.endedReason || message?.endedReason || message?.endReason || "");
}

function extractVapiCustomerPhone(message) {
  const call = extractVapiCall(message);
  return String(call.customer?.number || call.customerPhoneNumber || message?.message?.customer?.number || message?.customer?.number || "");
}

function extractVapiAssistantName(message) {
  const call = extractVapiCall(message);
  return String(call.assistant?.name || message?.message?.assistant?.name || message?.assistant?.name || call.assistantId || "");
}

function extractVapiAssistantId(message) {
  const call = extractVapiCall(message);
  return String(call.assistantId || call.assistant?.id || message?.message?.assistantId || message?.assistantId || "");
}

function extractVapiOrderId(message) {
  const call = extractVapiCall(message);
  const variables = call.assistantOverrides?.variableValues || message?.message?.assistantOverrides?.variableValues || {};
  const structured = extractVapiStructuredResult(message);
  return String(call.metadata?.orderId || message?.metadata?.orderId || message?.message?.metadata?.orderId || message?.orderId || structured.order_number || variables.order_number || "").trim();
}

function extractVapiDuration(message) {
  const call = extractVapiCall(message);
  const direct = call.durationSeconds || call.duration || call.durationMs || message?.durationSeconds || "";
  if (direct) return String(direct);
  const started = Date.parse(call.startedAt || call.createdAt || "");
  const ended = Date.parse(call.endedAt || call.updatedAt || "");
  if (Number.isFinite(started) && Number.isFinite(ended) && ended > started) return String(Math.round((ended - started) / 1000));
  return "";
}

function extractStructuredOutcome(analysis = {}) {
  const structured = analysis;
  const candidates = [
    structured?.verification_outcome,
    structured?.verificationOutcome,
    structured?.outcome,
    structured?.order_status,
    structured?.orderStatus,
    structured?.result,
    analysis?.successEvaluation,
  ];
  return String(candidates.find((value) => value !== undefined && value !== null) || "").toLowerCase();
}

function classifyVapiOutcome(message) {
  const call = extractVapiCall(message);
  const type = String(message?.message?.type || message?.type || "").toLowerCase();
  const status = String(call.status || message?.status || "").toLowerCase();
  const endReason = extractVapiEndReason(message).toLowerCase();
  const structured = extractVapiStructuredResult(message);
  const structuredOutcome = extractStructuredOutcome(structured);
  const transcript = extractVapiTranscript(message).toLowerCase();
  const haystack = [structuredOutcome, status, endReason, transcript].join(" ");

  if (structuredOutcome === "incomplete") return "INCOMPLETE";
  if (structuredOutcome === "unknown") return "UNKNOWN";
  if (/(failed|failure|error|errored|system-error|assistant-error|phone-call-provider-error)/i.test(haystack)) return "FAILED";
  if (/(voicemail|voice mail|mailbox|left a message|answering machine)/i.test(haystack)) return "VOICEMAIL";
  if (/(no[-_ ]?answer|did not answer|not answered|unanswered|busy|declined|customer-did-not-answer)/i.test(haystack)) return "NO_ANSWER";
  if (/(callback|call back|call me back|later|different time|reschedule)/i.test(haystack)) return "CALLBACK_REQUESTED";
  if (/(cancelled|canceled|cancel order|do not ship|don't ship|not ordering|declined order)/i.test(haystack)) return "CANCELLED";
  if (/(transfer|transferred|forwarded)/i.test(haystack)) return "TRANSFERRED";
  if (structuredOutcome === "true" || /(verified|confirmed|order confirmed|verification complete|approved|correct)/i.test(haystack)) return "VERIFIED";
  if (["end-of-call-report", "call-ended", "call.completed", "call-completed"].includes(type) || ["ended", "completed"].includes(status)) return "UNKNOWN";
  return "UNKNOWN";
}

function isFinalVapiEvent(message) {
  const call = extractVapiCall(message);
  const type = String(message?.message?.type || message?.type || "").toLowerCase();
  const status = String(call.status || message?.status || "").toLowerCase();
  const endReason = extractVapiEndReason(message);
  return Boolean(
    ["end-of-call-report", "call-ended", "call.completed", "call-completed"].includes(type)
      || ["ended", "completed", "failed", "canceled", "cancelled"].includes(status)
      || call.endedAt
      || endReason
  );
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
    if (item && typeof item === "object") {
      const nested = extractRecordingUrl(item);
      if (nested) return nested;
    }
  }
  return "";
}

function isSuccessfulVapiCompletion(message) {
  const type = message?.type || message?.message?.type || "";
  const call = extractVapiCall(message);
  const status = String(call.status || message?.status || "").toLowerCase();
  const endedReason = String(call.endedReason || message?.endedReason || "").toLowerCase();
  const analysisSuccess = call.analysis?.successEvaluation || message?.analysis?.successEvaluation;
  if (analysisSuccess === false || analysisSuccess === "false") return false;
  if (["failed", "error", "errored", "canceled", "cancelled"].includes(status)) return false;
  if (endedReason.includes("error") || endedReason.includes("failed")) return false;
  return ["end-of-call-report", "call-ended", "call.completed", "call-completed"].includes(type) || ["ended", "completed"].includes(status);
}

function statusLabel(status) {
  const labels = {
    pending: "Pending",
    verification_in_progress: "Verification In Progress",
    verified: "Verified",
    issue: "Issue",
    cancelled: "Cancelled",
  };
  return labels[status] || status || "";
}

function recordOrderStatus(order, status, notes = "", by = "Vapi") {
  const at = new Date().toLocaleString([], { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  const previousStatus = order.status || "";
  order.status = status;
  order.statusChangedAt = at;
  order.statusChangedBy = by;
  if (!Array.isArray(order.statusHistory)) order.statusHistory = [];
  order.statusHistory.push({ status, label: statusLabel(status), at, by, notes });
  console.log(`[order-status] ${order.id || "unknown"} ${previousStatus || "none"} -> ${status} by ${by}: ${notes}`);
  return at;
}

function dateParts(date = new Date()) {
  return {
    date: date.toLocaleDateString([], { year: "numeric", month: "2-digit", day: "2-digit" }),
    time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    timestamp: date.toISOString(),
  };
}

function verificationHistoryRecord({ outcome, callId, transcript, duration, phoneNumber, assistantName, timestamp }) {
  const date = timestamp ? new Date(timestamp) : new Date();
  const parts = dateParts(Number.isNaN(date.getTime()) ? new Date() : date);
  return {
    date: parts.date,
    time: parts.time,
    timestamp: parts.timestamp,
    outcome,
    callId: callId || "",
    transcript: transcript || "",
    summary: "",
    user: assistantName || "Vapi",
    duration: duration || "",
    phoneNumber: phoneNumber ? maskPhoneNumber(phoneNumber) : "",
    assistantName: assistantName || "",
  };
}

function appendVerificationHistory(order, record) {
  if (!Array.isArray(order.verificationHistory)) order.verificationHistory = [];
  order.verificationHistory.push(record);
}

function hasProcessedCall(sharedState, order, callId) {
  if (!callId) return false;
  const sharedIds = Array.isArray(sharedState.processedVapiCallIds) ? sharedState.processedVapiCallIds : [];
  const orderIds = Array.isArray(order?.processedVapiCallIds) ? order.processedVapiCallIds : [];
  const historyIds = Array.isArray(order?.verificationHistory) ? order.verificationHistory.map((item) => item.callId).filter(Boolean) : [];
  return [...sharedIds, ...orderIds, ...historyIds].includes(callId);
}

function markProcessedCall(sharedState, order, callId) {
  if (!callId) return;
  if (!Array.isArray(sharedState.processedVapiCallIds)) sharedState.processedVapiCallIds = [];
  if (!sharedState.processedVapiCallIds.includes(callId)) sharedState.processedVapiCallIds.push(callId);
  if (order) {
    if (!Array.isArray(order.processedVapiCallIds)) order.processedVapiCallIds = [];
    if (!order.processedVapiCallIds.includes(callId)) order.processedVapiCallIds.push(callId);
  }
}

function logVapiManualReview(sharedState, event) {
  if (!Array.isArray(sharedState.vapiWebhookManualReview)) sharedState.vapiWebhookManualReview = [];
  sharedState.vapiWebhookManualReview.push({ ...event, loggedAt: new Date().toISOString() });
  console.warn(`[vapi-webhook] manual review needed: ${event.reason || "unknown"} call=${event.callId || "none"} order=${event.orderId || "none"}`);
}

function logVapiFailure(sharedState, event) {
  if (!Array.isArray(sharedState.vapiWebhookFailures)) sharedState.vapiWebhookFailures = [];
  sharedState.vapiWebhookFailures.push({ ...event, loggedAt: new Date().toISOString() });
  console.error(`[vapi-webhook] failed call=${event.callId || "none"} order=${event.orderId || "none"} reason=${event.endReason || "unknown"}`);
}

function logVapiWebhookActivity(sharedState, event) {
  if (!Array.isArray(sharedState.vapiWebhookLog)) sharedState.vapiWebhookLog = [];
  sharedState.vapiWebhookLog.push({ ...event, loggedAt: new Date().toISOString() });
  if (sharedState.vapiWebhookLog.length > 200) sharedState.vapiWebhookLog = sharedState.vapiWebhookLog.slice(-200);
  console.log(`[vapi-webhook-log] ${event.stage || "event"} call=${event.callId || "none"} order=${event.orderId || "none"} outcome=${event.outcome || "none"} matched=${event.orderMatched ? "yes" : "no"}`);
}

function structuredText(analysis, ...keys) {
  const structured = analysis || {};
  for (const key of keys) {
    const value = structured?.[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
  }
  return "";
}

function conciseCancellationReason(transcript = "", analysis = {}) {
  const structured = structuredText(analysis, "cancellation_reason", "cancellationReason", "reason");
  if (structured) return structured.slice(0, 160);
  const text = String(transcript || "").toLowerCase();
  const rules = [
    [/price|too expensive|cost|quote/, "Price too high"],
    [/ordered elsewhere|bought elsewhere|another vendor/, "Ordered elsewhere"],
    [/duplicate/, "Duplicate order"],
    [/wrong item|incorrect item|not the right item/, "Wrong item ordered"],
    [/manager approval|approval/, "Need manager approval"],
    [/budget/, "Budget issue"],
    [/shipping.*expensive|freight.*expensive/, "Shipping too expensive"],
    [/do not need|don't need|doesn't need|no longer need/, "Customer doesn't need order"],
  ];
  return rules.find(([pattern]) => pattern.test(text))?.[1] || "Other";
}

function conciseCallbackNotes(transcript = "", analysis = {}) {
  const structured = structuredText(analysis, "callback_notes", "callbackNotes", "summary");
  if (structured) return structured.slice(0, 160);
  const text = String(transcript || "").toLowerCase();
  const rules = [
    [/next week/, "Call back next week"],
    [/revised pricing|better price|new price/, "Needs revised pricing"],
    [/freight quote|shipping quote/, "Needs freight quote"],
    [/manager approval|approval/, "Needs manager approval"],
    [/waiting on po|purchase order|po number/, "Waiting on PO"],
    [/one month|next month/, "Call back in one month"],
  ];
  return rules.find(([pattern]) => pattern.test(text))?.[1] || "Customer requested callback";
}

function outcomeSummary(outcome, transcript = "", analysis = {}) {
  const structured = structuredText(analysis, "summary");
  if (structured) return structured.slice(0, 220);
  if (outcome === "CANCELLED") return conciseCancellationReason(transcript, analysis);
  if (outcome === "CALLBACK_REQUESTED") return conciseCallbackNotes(transcript, analysis);
  if (outcome === "VERIFIED") return "Customer verified the sales order.";
  if (outcome === "VOICEMAIL") return "Verification call reached voicemail.";
  if (outcome === "NO_ANSWER") return "Customer did not answer the verification call.";
  if (outcome === "FAILED") return "Vapi verification call failed.";
  if (outcome === "INCOMPLETE" || outcome === "UNKNOWN") return "Verification needs review.";
  return "Verification outcome could not be determined.";
}

function structuredBoolean(analysis, ...keys) {
  const value = structuredText(analysis, ...keys).toLowerCase();
  return value === "true" || value === "yes" || value === "1";
}

function meaningfulChangeSummary(summary = "") {
  const clean = String(summary || "").trim();
  if (!clean) return "";
  if (clean.toLowerCase() === "no customer information changes reported.") return "";
  return clean;
}

function purchaseOrderChanged(analysis = {}) {
  return structuredBoolean(analysis, "purchase_order_number_changed", "purchaseOrderNumberChanged");
}

function purchaseOrderCorrectionSummary(analysis = {}) {
  const changed = purchaseOrderChanged(analysis);
  const oldValue = structuredText(analysis, "purchase_order_number_old", "purchaseOrderNumberOld");
  const newValue = structuredText(analysis, "purchase_order_number_new", "purchaseOrderNumberNew");
  if (changed && oldValue && newValue) return `Purchase Order Number corrected: Current: ${oldValue}. Customer stated: ${newValue}.`;
  if (changed && newValue) return `Purchase Order Number added: ${newValue}.`;
  if (oldValue) return `Purchase Order Number confirmed: ${oldValue}.`;
  return "";
}

function unitClassificationChanged(analysis = {}) {
  return structuredBoolean(analysis, "unit_classification_changed", "unitClassificationChanged");
}

function parseUnitClassificationChanges(text = "") {
  return String(text || "")
    .split(/\n|;/)
    .map((line) => line.trim().replace(/\.$/, ""))
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/(.+?)\s+changed\s+from\s+(.+?)\s+to\s+(.+)$/i);
      if (!match) return { summary: line };
      return {
        product_name: match[1].trim(),
        current_value: match[2].trim(),
        customer_value: match[3].trim(),
        summary: line,
      };
    });
}

function ensureAuditLog(sharedState) {
  if (!Array.isArray(sharedState.auditLog)) sharedState.auditLog = [];
  return sharedState.auditLog;
}

function addAuditEntry(sharedState, entry) {
  ensureAuditLog(sharedState).push({
    timestamp: new Date().toISOString(),
    employee: entry.employee || "Vapi",
    ...entry,
  });
}

function upsertVapiOrderNote(sharedState, order, details) {
  const { callId, outcome, transcript, duration, phoneNumber, assistantName, timestamp, endReason, analysis = {}, sourceMessage = {} } = details;
  if (!Array.isArray(order.vapiNotes)) order.vapiNotes = [];
  const existing = order.vapiNotes.find((note) => note.vapi_call_id === callId);
  const now = new Date().toISOString();
  const startedAt = extractVapiCall(sourceMessage).startedAt || sourceMessage?.startedAt || "";
  const endedAt = extractVapiCall(sourceMessage).endedAt || timestamp || now;
  const changesReported = structuredBoolean(analysis, "changes_reported", "changesReported");
  const changeSummary = structuredText(analysis, "change_summary", "changeSummary");
  const poChanged = purchaseOrderChanged(analysis);
  const unitChanged = unitClassificationChanged(analysis);
  const unitChanges = structuredText(analysis, "unit_classification_changes", "unitClassificationChanges");
  const poOld = structuredText(analysis, "purchase_order_number_old", "purchaseOrderNumberOld") || purchaseOrderNumber(order);
  const poNew = structuredText(analysis, "purchase_order_number_new", "purchaseOrderNumberNew");
  const poNote = purchaseOrderCorrectionSummary(analysis);
  const verifiedItems = orderItemsForStoredOrder(sharedState, order);
  const note = {
    id: existing?.id || `VN-${callId || Date.now()}`,
    sales_order_id: order.id,
    order_number: order.id,
    vapi_call_id: callId || "",
    created_at: existing?.created_at || now,
    updated_at: now,
    call_started_at: startedAt,
    call_ended_at: endedAt,
    call_duration: duration || "",
    call_cost: extractVapiCall(sourceMessage).cost || sourceMessage?.cost || "",
    phone_number: phoneNumber ? maskPhoneNumber(phoneNumber) : "",
    verification_outcome: outcome,
    summary: outcomeSummary(outcome, transcript, analysis),
    cancellation_reason: conciseCancellationReason(transcript, analysis),
    callback_notes: outcome === "CALLBACK_REQUESTED" ? conciseCallbackNotes(transcript, analysis) : structuredText(analysis, "callback_notes", "callbackNotes"),
    changes_reported: changesReported,
    change_summary: changeSummary,
    purchase_order_number: purchaseOrderNumber(order),
    purchase_order_number_changed: poChanged,
    purchase_order_number_old: poOld,
    purchase_order_number_new: poNew,
    purchase_order_note: poNote,
    unit_classification_changed: unitChanged,
    unit_classification_changes: unitChanges,
    verified_items: verifiedItems,
    change_review_status: existing?.change_review_status || (changesReported || meaningfulChangeSummary(changeSummary) || poChanged || unitChanged ? "Pending Review" : ""),
    transcript: transcript || "",
    ended_reason: endReason || "",
    assistant_name: assistantName || "",
    structured_output_raw: analysis,
    source: "Vapi",
    created_by: "Vapi",
  };
  if (existing) {
    Object.assign(existing, note);
    console.log(`[vapi-notes] Vapi note updated after retry order=${order.id} call=${callId}`);
    return existing;
  }
  order.vapiNotes.push(note);
  order.vapiNotes.sort((a, b) => Date.parse(b.created_at || "") - Date.parse(a.created_at || ""));
  addAuditEntry(sharedState, { action: "Vapi note imported", order_number: order.id, vapi_call_id: callId, new_status: outcome });
  console.log(`[vapi-notes] Vapi note created order=${order.id} call=${callId}`);
  return note;
}

function orderItemsForStoredOrder(sharedState = {}, order = {}) {
  const products = Array.isArray(sharedState.products) ? sharedState.products : [];
  const units = normalizeUnitOfMeasuresForState(sharedState);
  const items = (Array.isArray(order.items) ? order.items : []).map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId) || {};
    const unit = lineItemUnit(item, units);
    return {
      name: product.name || item.name || "",
      orderedQty: item.qty || item.orderedQty || 0,
      unit_of_measure: unitSnapshot(unit),
    };
  });
  return orderItemsSentence(items);
}

function updateVapiNotesCount(order) {
  order.vapi_notes_count = Array.isArray(order.vapiNotes) ? order.vapiNotes.length : 0;
  console.log(`[vapi-notes] Notes count updated order=${order.id} count=${order.vapi_notes_count}`);
}

function applyVapiChangeFlag(sharedState, order, note, callId) {
  const shouldFlag = note?.changes_reported === true || Boolean(meaningfulChangeSummary(note?.change_summary)) || note?.purchase_order_number_changed === true || note?.unit_classification_changed === true;
  if (!shouldFlag) return;
  const previous = order.vapi_change_review_status || "";
  order.has_vapi_changes = true;
  order.vapi_change_review_status = order.vapi_change_review_status && order.vapi_change_review_status !== "Reviewed" ? order.vapi_change_review_status : "Pending Review";
  order.vapi_change_summary = note.change_summary || note.purchase_order_note || "";
  order.vapi_change_detected_at = new Date().toISOString();
  order.vapi_change_call_id = callId || "";
  if (note) note.change_review_status = order.vapi_change_review_status;
  if (note?.purchase_order_number_changed && note.purchase_order_number_new) {
    if (!Array.isArray(order.customerChangeRequests)) order.customerChangeRequests = [];
    const changeId = `PO-${callId || Date.now()}`;
    const existingChange = order.customerChangeRequests.find((change) => change.id === changeId || (change.field === "purchase_order_number" && change.vapi_call_id === callId));
    const change = {
      id: existingChange?.id || changeId,
      order_id: order.id,
      field: "purchase_order_number",
      label: "Purchase Order Number",
      current_value: note.purchase_order_number_old || purchaseOrderNumber(order),
      customer_value: note.purchase_order_number_new || "",
      status: existingChange?.status || "Pending Review",
      vapi_call_id: callId || "",
      created_at: existingChange?.created_at || new Date().toISOString(),
      summary: note.purchase_order_note || note.change_summary || "",
    };
    if (existingChange) Object.assign(existingChange, change);
    else order.customerChangeRequests.push(change);
  }
  if (note?.unit_classification_changed && note.unit_classification_changes) {
    if (!Array.isArray(order.customerChangeRequests)) order.customerChangeRequests = [];
    const products = Array.isArray(sharedState.products) ? sharedState.products : [];
    const units = normalizeUnitOfMeasuresForState(sharedState);
    parseUnitClassificationChanges(note.unit_classification_changes).forEach((changeText, index) => {
      const product = products.find((candidate) => candidate.name && changeText.product_name && candidate.name.trim().toLowerCase() === changeText.product_name.trim().toLowerCase()) || {};
      const lineIndex = (order.items || []).findIndex((item) => item.productId === product.id);
      const lineItem = lineIndex >= 0 ? order.items[lineIndex] : null;
      const currentUnit = lineItem ? lineItemUnit(lineItem, units) : unitByName(units, changeText.current_value);
      const requestedUnit = unitByName(units, changeText.customer_value);
      const changeId = `UOM-${callId || Date.now()}-${index}`;
      const existingChange = order.customerChangeRequests.find((change) => change.id === changeId);
      const change = {
        id: existingChange?.id || changeId,
        order_id: order.id,
        field: "unit_of_measure",
        label: "Unit of Measure",
        product_name: changeText.product_name || product.name || "",
        line_index: lineIndex,
        current_value: currentUnit?.name || changeText.current_value || "",
        customer_value: requestedUnit?.name || changeText.customer_value || "",
        requested_unit_of_measure_id: requestedUnit?.id || "",
        status: existingChange?.status || "Pending Review",
        vapi_call_id: callId || "",
        created_at: existingChange?.created_at || new Date().toISOString(),
        summary: changeText.summary || note.unit_classification_changes,
      };
      if (existingChange) Object.assign(existingChange, change);
      else order.customerChangeRequests.push(change);
    });
  }
  addAuditEntry(sharedState, {
    action: "Order flagged for customer change",
    order_number: order.id,
    vapi_call_id: callId,
    previous_status: previous,
    new_status: order.vapi_change_review_status,
  });
  console.warn(`[vapi-change] Order change flag applied order=${order.id} call=${callId}`);
}

function updateOrderFromVapiOutcome(order, outcome, details, sharedState = null) {
  const { callId, transcript, duration, phoneNumber, assistantName, timestamp, endReason, analysis } = details;
  const history = verificationHistoryRecord({ outcome, callId, transcript, duration, phoneNumber, assistantName, timestamp });
  history.summary = outcomeSummary(outcome, transcript, analysis);
  history.user = assistantName || "Vapi";
  const at = `${history.date}, ${history.time}`;
  const verification = {
    ...(order.verification || {}),
    state: outcome.toLowerCase(),
    method: "Assistant",
    at,
    vapiCallId: callId || order.verification?.vapiCallId || "",
    vapiCallStatus: outcome,
    lastOutcome: outcome,
    lastVerificationAttempt: at,
    transcript,
    callDuration: duration,
    customerPhoneNumber: phoneNumber ? maskPhoneNumber(phoneNumber) : "",
    changeSummary: structuredText(analysis, "change_summary", "changeSummary"),
    changesReported: structuredText(analysis, "changes_reported", "changesReported"),
  };

  if (outcome === "VERIFIED") {
    const statusAt = recordOrderStatus(order, "verified", "Vapi verification call confirmed the order.", "Vapi");
    Object.assign(verification, {
      state: "verified",
      summary: outcomeSummary(outcome, transcript, analysis),
      at: statusAt,
      verifiedBy: "Vapi",
      verifiedDate: history.date,
      verifiedTime: history.time,
    });
  } else if (outcome === "CANCELLED") {
    const statusAt = recordOrderStatus(order, "cancelled", "Customer cancelled the order during Vapi verification.", "Vapi");
    const cancellationNotes = conciseCancellationReason(transcript, analysis);
    Object.assign(verification, {
      state: "cancelled",
      summary: "Customer cancelled the order during Assistant Verification.",
      at: statusAt,
      verifiedBy: "Vapi",
      cancellationDate: history.date,
      cancelledBy: "Customer",
      cancellationNotes,
    });
  } else if (outcome === "VOICEMAIL") {
    verification.state = "voicemail";
    verification.summary = "Assistant Verification reached voicemail. Order status was not changed.";
  } else if (outcome === "NO_ANSWER") {
    verification.state = "no_answer";
    verification.summary = "Assistant Verification call was not answered. Order status was not changed.";
    verification.attempts = Number(verification.attempts || order.verificationAttempts || 0) + 1;
    order.verificationAttempts = verification.attempts;
  } else if (outcome === "CALLBACK_REQUESTED") {
    const callbackNotes = conciseCallbackNotes(transcript, analysis);
    verification.state = "issue";
    verification.outcome = "callback_requested";
    verification.summary = "Customer requested a callback during Assistant Verification. Order status was not changed.";
    verification.callbackNotes = callbackNotes;
  } else if (outcome === "FAILED") {
    verification.state = "failed";
    verification.summary = "Assistant Verification failed. Order status was not changed.";
  } else if (outcome === "INCOMPLETE" || outcome === "UNKNOWN") {
    verification.state = "needs_review";
    verification.summary = outcomeSummary(outcome, transcript, analysis);
  } else {
    verification.state = "needs_review";
    verification.summary = endReason ? `Assistant Verification ended with an unknown outcome: ${endReason}.` : "Assistant Verification ended with an unknown outcome.";
  }

  order.verification = verification;
  appendVerificationHistory(order, history);
  if (sharedState) {
    const note = upsertVapiOrderNote(sharedState, order, { ...details, outcome });
    applyVapiChangeFlag(sharedState, order, note, callId);
    updateVapiNotesCount(order);
  }
  return history;
}

function orderMatchesCall(order, orderId, callId) {
  return order?.id === orderId || (callId && order?.verification?.vapiCallId === callId);
}

function orderForCall(sharedState, orderId, callId) {
  const orders = Array.isArray(sharedState.orders) ? sharedState.orders : [];
  return orders.find((item) => orderMatchesCall(item, orderId, callId));
}

function retryDelayForAttempt(attempts) {
  return vapiRetryDelaysMs[Math.min(attempts, Math.max(0, vapiRetryDelaysMs.length - 1))] || 0;
}

function retryRecordFor(sharedState, callId) {
  if (!Array.isArray(sharedState.vapiStructuredOutputRetries)) sharedState.vapiStructuredOutputRetries = [];
  return sharedState.vapiStructuredOutputRetries.find((record) => record.callId === callId);
}

function enqueueStructuredOutputRetry(sharedState, context) {
  if (!context.callId) return null;
  if (!Array.isArray(sharedState.vapiStructuredOutputRetries)) sharedState.vapiStructuredOutputRetries = [];
  const existing = retryRecordFor(sharedState, context.callId);
  const now = new Date().toISOString();
  if (existing && ["processed", "exhausted"].includes(existing.status)) return existing;
  const nextAttemptAt = new Date(Date.now() + retryDelayForAttempt(existing?.attempts || 0)).toISOString();
  const record = existing || { callId: context.callId, attempts: 0, createdAt: now };
  Object.assign(record, {
    ...record,
    ...context,
    status: "pending",
    nextAttemptAt,
    updatedAt: now,
    maxAttempts: vapiRetryDelaysMs.length,
  });
  if (!existing) sharedState.vapiStructuredOutputRetries.push(record);
  console.warn(`[vapi-retry] queued call=${context.callId} order=${context.orderId || "none"} nextAttemptAt=${nextAttemptAt}`);
  return record;
}

function structuredOutputsFromCall(call = {}) {
  return call.artifact?.structuredOutputs || call.structuredOutputs || {};
}

function vapiCallUrl(callId) {
  return `${vapiApiUrl.replace(/\/+$/, "")}/${encodeURIComponent(callId)}`;
}

async function fetchCompletedVapiCall(callId) {
  const apiKey = process.env.VAPI_API_KEY || "";
  if (!apiKey) throw new Error("VAPI_API_KEY is not configured for structured output retry.");
  const url = vapiCallUrl(callId);
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  console.log(`[vapi-retry] GET call response status for ${callId}: ${response.status}`);
  const body = await response.text();
  let result = {};
  try {
    result = body ? JSON.parse(body) : {};
  } catch {
    result = { message: body };
  }
  if (!response.ok) throw new Error(result.message || result.error || `Vapi GET call failed with status ${response.status}.`);
  return result.call || result;
}

function applyStructuredOutputToOrder(sharedState, order, context, structuredResult, sourceMessage = {}) {
  const outcome = classifyVapiOutcome(sourceMessage);
  console.log(`[vapi-webhook] parsed verification outcome: ${outcome}`);
  console.log(`[vapi-webhook] database status before update: ${order.status || "none"} / ${order.verification?.state || "none"}`);
  const history = updateOrderFromVapiOutcome(order, outcome, {
    callId: context.callId,
    transcript: context.transcript || extractVapiTranscript(sourceMessage),
    duration: context.duration || extractVapiDuration(sourceMessage),
    phoneNumber: context.phoneNumber || extractVapiCustomerPhone(sourceMessage),
    assistantName: context.assistantName || extractVapiAssistantName(sourceMessage),
    timestamp: context.timestamp || new Date().toISOString(),
    endReason: context.endReason || extractVapiEndReason(sourceMessage),
    analysis: structuredResult,
    sourceMessage,
  }, sharedState);
  if (outcome === "VERIFIED") {
    const recordingUrl = extractRecordingUrl(sourceMessage);
    if (recordingUrl) order.verification.recordingUrl = recordingUrl;
  }
  markProcessedCall(sharedState, order, context.callId);
  logVapiWebhookActivity(sharedState, {
    stage: "status updated",
    callId: context.callId,
    orderId: order.id,
    assistantId: context.assistantId || extractVapiAssistantId(sourceMessage),
    outcome,
    orderMatched: true,
    status: order.status,
    verificationState: order.verification?.state || "",
    timestamp: context.timestamp || new Date().toISOString(),
  });
  console.log(`[vapi-webhook] database status after update: ${order.status || "none"} / ${order.verification?.state || "none"}`);
  return { outcome, history };
}

function markRetryProcessed(sharedState, callId) {
  const record = retryRecordFor(sharedState, callId);
  if (record) {
    record.status = "processed";
    record.processedAt = new Date().toISOString();
    record.updatedAt = record.processedAt;
  }
}

function markRetryExhausted(sharedState, order, record, note = "Vapi structured analysis was not available after retry attempts.") {
  record.status = "exhausted";
  record.exhaustedAt = new Date().toISOString();
  record.updatedAt = record.exhaustedAt;
  record.lastError = note;
  console.warn(`[vapi-retry] retry exhausted call=${record.callId} order=${record.orderId || "none"}`);
  if (!order) return;
  const history = updateOrderFromVapiOutcome(order, "INCOMPLETE", {
    callId: record.callId,
    transcript: record.transcript || "",
    duration: record.duration || "",
    phoneNumber: record.phoneNumber || "",
    assistantName: record.assistantName || "Vapi",
    timestamp: record.timestamp || new Date().toISOString(),
    endReason: record.endReason || "",
    analysis: { summary: note },
  }, sharedState);
  order.verification.summary = note;
  markProcessedCall(sharedState, order, record.callId);
  logVapiWebhookActivity(sharedState, {
    stage: "retry exhausted",
    callId: record.callId,
    orderId: order.id,
    outcome: "INCOMPLETE",
    orderMatched: true,
    status: order.status,
    verificationState: order.verification?.state || "",
    timestamp: record.timestamp || new Date().toISOString(),
  });
  return history;
}

async function processDueVapiRetryRecords() {
  if (retryWorkerRunning) return;
  retryWorkerRunning = true;
  try {
    const sharedState = await readSharedStateJson();
    const retries = Array.isArray(sharedState.vapiStructuredOutputRetries) ? sharedState.vapiStructuredOutputRetries : [];
    const due = retries.filter((record) => record.status === "pending" && record.nextAttemptAt && Date.parse(record.nextAttemptAt) <= Date.now());
    if (!due.length) return;
    for (const record of due) {
      if (hasProcessedCall(sharedState, orderForCall(sharedState, record.orderId, record.callId), record.callId)) {
        markRetryProcessed(sharedState, record.callId);
        continue;
      }
      const attemptNumber = Number(record.attempts || 0) + 1;
      console.log(`[vapi-retry] retry attempt ${attemptNumber}/${vapiRetryDelaysMs.length} call=${record.callId} order=${record.orderId || "none"}`);
      try {
        const call = await fetchCompletedVapiCall(record.callId);
        const outputs = structuredOutputsFromCall(call);
        const names = structuredOutputValues(outputs).map((item) => item?.name || "").filter(Boolean);
        console.log(`[vapi-retry] structuredOutputsLastUpdatedAt=${call.artifact?.structuredOutputsLastUpdatedAt || call.structuredOutputsLastUpdatedAt || ""}`);
        console.log(`[vapi-retry] structured output names found: ${names.join(", ") || "none"}`);
        const erpOutput = findErpStructuredOutputIn(outputs);
        const orderId = record.orderId || call.metadata?.orderId || erpOutput?.result?.order_number || "";
        const order = orderForCall(sharedState, orderId, record.callId);
        if (erpOutput?.result && order) {
          const result = applyStructuredOutputToOrder(sharedState, order, { ...record, orderId }, erpOutput.result, { call });
          markRetryProcessed(sharedState, record.callId);
          console.log(`[vapi-retry] structured result applied call=${record.callId} outcome=${result.outcome}`);
          continue;
        }
        if (!erpOutput) console.warn(`[vapi-retry] ERP_Order_Verification not found for call=${record.callId}. structuredOutputs=${JSON.stringify(outputs)}`);
        record.attempts = attemptNumber;
        if (record.attempts >= vapiRetryDelaysMs.length) {
          markRetryExhausted(sharedState, order, record);
        } else {
          record.nextAttemptAt = new Date(Date.now() + retryDelayForAttempt(record.attempts)).toISOString();
          record.updatedAt = new Date().toISOString();
        }
      } catch (error) {
        record.attempts = attemptNumber;
        record.lastError = error.message || "Retry failed.";
        if (record.attempts >= vapiRetryDelaysMs.length) {
          markRetryExhausted(sharedState, orderForCall(sharedState, record.orderId, record.callId), record);
        } else {
          record.nextAttemptAt = new Date(Date.now() + retryDelayForAttempt(record.attempts)).toISOString();
          record.updatedAt = new Date().toISOString();
        }
      }
    }
    await writeSharedStateJson(sharedState);
  } finally {
    retryWorkerRunning = false;
  }
}

function formatMoney(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatOptionalMoney(value) {
  return hasMoneyValue(value) ? formatMoney(value) : "";
}

function joinSentenceParts(parts) {
  const cleanParts = parts.filter(Boolean);
  if (cleanParts.length <= 1) return cleanParts[0] || "";
  if (cleanParts.length === 2) return `${cleanParts[0]}, and ${cleanParts[1]}`;
  return `${cleanParts.slice(0, -1).join(", ")}, and ${cleanParts.at(-1)}`;
}

function addressSentence(address = {}) {
  return [address.address, address.city, address.state, address.zip].filter(Boolean).join(", ");
}

function singularizeUnit(unit) {
  const clean = String(unit || "").trim().toLowerCase();
  const map = {
    units: "unit",
    unit: "unit",
    cases: "case",
    case: "case",
    rolls: "roll",
    roll: "roll",
    boxes: "box",
    box: "box",
  };
  return map[clean] || "unit";
}

function quantityUnitLabel(quantity, item = {}) {
  const unitObject = item.unit_of_measure || item.unitOfMeasureRecord || item.unit_of_measure_snapshot || null;
  if (unitObject) return Number(quantity) === 1 ? unitObject.singular_name || "unit" : unitObject.plural_name || unitObject.singular_name || "units";
  const productName = String(item.name || "").toLowerCase();
  const rawUnit = item.unit || item.uom || item.unitOfMeasure || "";
  let unit = singularizeUnit(rawUnit);
  if (!rawUnit && productName.includes("case")) unit = "case";
  if (!rawUnit && productName.includes("roll")) unit = "roll";
  if (!rawUnit && productName.includes("box")) unit = "box";
  if (Number(quantity) === 1) return unit;
  const pluralLabels = { unit: "units", case: "cases", roll: "rolls", box: "boxes" };
  return pluralLabels[unit] || `${unit}s`;
}

function itemQuantity(item = {}) {
  const quantity = Number(item.orderedQty || item.qty || 0);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

function quantityPhrase(item = {}) {
  const quantity = itemQuantity(item);
  const quantityText = quantity > 0 ? quantity.toLocaleString("en-US") : "0";
  return `${quantityText} ${quantityUnitLabel(quantity, item)}`;
}

function hasMoneyValue(value) {
  return value !== "" && value !== null && value !== undefined && Number.isFinite(Number(value));
}

function itemUnitPrice(item = {}) {
  return hasMoneyValue(item.unitPrice) ? Number(item.unitPrice) : hasMoneyValue(item.price) ? Number(item.price) : null;
}

function itemLineTotal(item = {}) {
  if (hasMoneyValue(item.lineTotal)) return Number(item.lineTotal);
  const unitPrice = itemUnitPrice(item);
  const quantity = itemQuantity(item);
  return unitPrice === null ? null : quantity * unitPrice;
}

function productName(item = {}) {
  return String(item.name || "").trim();
}

function orderItemsSentence(items = []) {
  const lines = items.map((item) => {
    const name = productName(item);
    if (!name) return "";
    return `${quantityPhrase(item)} of ${name}`;
  }).filter(Boolean);
  return lines.length ? `The order includes ${joinSentenceParts(lines)}.` : "";
}

function itemDetailsSentence(items = []) {
  const lines = items.map((item, index) => {
    const name = productName(item);
    if (!name) return "";
    const sku = item.sku ? String(item.sku) : "not available";
    const unitPrice = itemUnitPrice(item);
    const lineTotal = itemLineTotal(item);
    return `Item ${index + 1}: ${name}. Quantity: ${quantityPhrase(item)}. SKU: ${sku}. Unit price: ${unitPrice === null ? "not available" : formatMoney(unitPrice)}. Line total: ${lineTotal === null ? "not available" : formatMoney(lineTotal)}.`;
  });
  return lines.filter(Boolean).join(" ");
}

function skuListSentence(items = []) {
  return items
    .map((item) => {
      const name = productName(item);
      if (!name) return "";
      return `${name}: ${item.sku ? `SKU ${item.sku}` : "SKU not available"}.`;
    })
    .filter(Boolean)
    .join(" ");
}

function unitPriceDetailsSentence(items = []) {
  return items
    .map((item) => {
      const name = productName(item);
      if (!name) return "";
      const unitPrice = itemUnitPrice(item);
      const unit = item.unit_of_measure?.singular_name || item.unit_of_measure_snapshot?.singular_name || singularizeUnit(item.unit || item.uom || item.unitOfMeasure || quantityUnitLabel(1, item));
      return `${name}: ${unitPrice === null ? "unit price not available" : `${formatMoney(unitPrice)} per ${unit}`}.`;
    })
    .filter(Boolean)
    .join(" ");
}

function lineTotalDetailsSentence(items = []) {
  return items
    .map((item) => {
      const name = productName(item);
      if (!name) return "";
      const lineTotal = itemLineTotal(item);
      return `${name} line total: ${lineTotal === null ? "not available" : formatMoney(lineTotal)}.`;
    })
    .filter(Boolean)
    .join(" ");
}

function stringifyVariable(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function billingAddress(order = {}) {
  if (typeof order.billTo === "string") return order.billTo;
  if (order.billTo && typeof order.billTo === "object") return addressSentence(order.billTo);
  if (order.billingAddress && typeof order.billingAddress === "object") return addressSentence(order.billingAddress);
  return order.billingAddress || "";
}

function promoNumber(order = {}, customer = {}) {
  return order.promoTicket?.promoNumber || order.promoNumber || customer.promoNumber || "";
}

function purchaseOrderNumber(order = {}, customer = {}) {
  return String(order.purchase_order_number || order.purchaseOrderNumber || order.purchaseOrder || customer.purchaseOrder || "").trim();
}

function creditCardOnFile(order = {}) {
  return Boolean(order.creditCardOnFile || order.creditCard?.name || order.creditCard?.last4 || order.creditCard?.expiration) ? "Yes" : "";
}

function buildVapiVariableValues(requestBody) {
  const order = requestBody.order?.order || requestBody.order || {};
  const customer = order.customer || {};
  const orderNumber = order.id || requestBody.orderId || "";
  const items = Array.isArray(order.items) ? order.items : [];
  const values = {
    order_number: String(orderNumber || ""),
    buyer_name: String(order.buyerName || ""),
    customer_name: customer.name || "",
    customer_contact: customer.contact || order.buyerName || customer.name || "",
    sales_rep: order.salesRep || order.rep || "",
    order_date: order.date || "",
    ship_date: order.shipDate || "",
    shipping_address: addressSentence(order.address || {}),
    order_notes: order.notes || "",
    order_total: formatOptionalMoney(order.total),
    order_items: orderItemsSentence(items),
    item_details: itemDetailsSentence(items),
    sku_list: skuListSentence(items),
    unit_price_details: unitPriceDetailsSentence(items),
    line_total_details: lineTotalDetailsSentence(items),
    account_number: order.accountNumber || "",
    account_status: order.accountStatus || "",
    purchase_order_number: purchaseOrderNumber(order, customer),
    billing_address: billingAddress(order),
    tracking_number: order.trackingInfo || order.trackingNumber || "",
    promo_number: promoNumber(order, customer),
    credit_card_on_file: creditCardOnFile(order),
  };
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, stringifyVariable(value)]));
}

function maskLogSample(value) {
  const text = String(value || "");
  if (!text) return "";
  if (text.length <= 12) return text;
  return `${text.slice(0, 8)}...${text.slice(-4)}`;
}

function maskedVariableSamples(values = {}) {
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, maskLogSample(value)]));
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", "http://localhost");

    if (requestUrl.pathname === "/api/state" && request.method === "GET") {
      const sharedState = await readSharedStateJson();
      logApiOrderStatus("API response sent to frontend", Array.isArray(sharedState.orders) ? sharedState.orders : []);
      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(JSON.stringify(sharedState));
      return;
    }

    if (requestUrl.pathname === "/api/state" && request.method === "POST") {
      const incomingState = await parseJsonBody(request);
      const existingState = await readSharedStateJson();
      logApiOrderStatus("database value before browser save merge", Array.isArray(existingState.orders) ? existingState.orders : []);
      logApiOrderStatus("frontend value received", Array.isArray(incomingState.orders) ? incomingState.orders : []);
      const mergedState = mergeSharedState(existingState, incomingState);
      await writeSharedStateJson(mergedState);
      logApiOrderStatus("database value after browser save merge", Array.isArray(mergedState.orders) ? mergedState.orders : []);
      logApiOrderStatus("API response sent to frontend", Array.isArray(mergedState.orders) ? mergedState.orders : []);
      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(JSON.stringify({ ok: true, savedAt: new Date().toISOString(), state: mergedState }));
      return;
    }

    if (requestUrl.pathname === "/api/units-of-measure" && request.method === "GET") {
      const sharedState = await readSharedStateJson();
      sendJson(response, 200, { ok: true, units: normalizeUnitOfMeasuresForState(sharedState) });
      return;
    }

    if (requestUrl.pathname === "/api/units-of-measure" && request.method === "POST") {
      const body = await parseJsonBody(request);
      const sharedState = await readSharedStateJson();
      const units = normalizeUnitOfMeasuresForState(sharedState);
      const name = String(body.name || "").trim();
      const singular = String(body.singular_name || "").trim().toLowerCase();
      const plural = String(body.plural_name || "").trim().toLowerCase();
      if (!name || !singular || !plural) {
        sendJson(response, 400, { ok: false, error: "Display, singular, and plural names are required." });
        return;
      }
      if (units.some((unit) => unit.name.trim().toLowerCase() === name.toLowerCase())) {
        sendJson(response, 409, { ok: false, error: "That classification already exists." });
        return;
      }
      const now = new Date().toISOString();
      const unit = {
        id: body.id || `UOM-${Date.now()}`,
        name,
        singular_name: singular,
        plural_name: plural,
        abbreviation: String(body.abbreviation || "").trim(),
        is_active: body.is_active !== false,
        sort_order: Number(body.sort_order || ((units.length + 1) * 10)),
        created_at: now,
        updated_at: now,
        created_by: String(body.created_by || "API"),
      };
      sharedState.unitOfMeasures = normalizeUnitOfMeasuresForState({ unitOfMeasures: [...units, unit] });
      await writeSharedStateJson(sharedState);
      sendJson(response, 201, { ok: true, unit });
      return;
    }

    const unitPatchMatch = requestUrl.pathname.match(/^\/api\/units-of-measure\/([^/]+)$/);
    if (unitPatchMatch && request.method === "PATCH") {
      const body = await parseJsonBody(request);
      const sharedState = await readSharedStateJson();
      const units = normalizeUnitOfMeasuresForState(sharedState);
      const index = units.findIndex((unit) => unit.id === unitPatchMatch[1]);
      if (index < 0) {
        sendJson(response, 404, { ok: false, error: "Classification was not found." });
        return;
      }
      const nextName = body.name !== undefined ? String(body.name || "").trim() : units[index].name;
      if (units.some((unit) => unit.id !== units[index].id && unit.name.trim().toLowerCase() === nextName.toLowerCase())) {
        sendJson(response, 409, { ok: false, error: "That classification already exists." });
        return;
      }
      units[index] = {
        ...units[index],
        ...body,
        name: nextName,
        singular_name: body.singular_name !== undefined ? String(body.singular_name || "").trim().toLowerCase() : units[index].singular_name,
        plural_name: body.plural_name !== undefined ? String(body.plural_name || "").trim().toLowerCase() : units[index].plural_name,
        abbreviation: body.abbreviation !== undefined ? String(body.abbreviation || "").trim() : units[index].abbreviation,
        updated_at: new Date().toISOString(),
      };
      sharedState.unitOfMeasures = normalizeUnitOfMeasuresForState({ unitOfMeasures: units });
      await writeSharedStateJson(sharedState);
      sendJson(response, 200, { ok: true, unit: units[index] });
      return;
    }

    if (requestUrl.pathname === "/api/login" && request.method === "POST") {
      const credentials = await parseJsonBody(request);
      const username = String(credentials.username || "").trim().toLowerCase();
      const password = String(credentials.password || "").trim();
      const sharedState = await readSharedStateJson();
      const users = Array.isArray(sharedState.users) ? sharedState.users : [];
      const savedUser = users.find((user) => String(user.username || "").toLowerCase() === username);
      const starterUser = starterUsers.find((user) => user.username === username);
      const user = savedUser || starterUser;
      const savedPassword = savedUser?.password || "";
      const envPassword = envPasswordFor(username);
      const allowed = user && password && ((savedPassword && savedPassword === password) || (envPassword && envPassword === password));

      response.writeHead(allowed ? 200 : 401, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(JSON.stringify(allowed ? { ok: true, user: safeUser({ ...starterUser, ...savedUser, username }) } : { ok: false }));
      return;
    }

    if (requestUrl.pathname === "/api/vapi/calls" && request.method === "POST") {
      const apiKey = process.env.VAPI_API_KEY || "";
      const assistantId = process.env.VAPI_ASSISTANT_ID || "";
      const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID || "";
      if (!apiKey || !assistantId || !phoneNumberId) {
        sendJson(response, 500, { ok: false, error: "Vapi is not configured. Add VAPI_API_KEY, VAPI_ASSISTANT_ID, and VAPI_PHONE_NUMBER_ID in Render." });
        return;
      }

      const requestBody = await parseJsonBody(request);
      const orderId = String(requestBody.orderId || "").trim();
      const customerPhoneNumber = normalizePhoneNumber(requestBody.customerPhoneNumber);
      if (!orderId) {
        sendJson(response, 400, { ok: false, error: "Order ID is required." });
        return;
      }
      if (!customerPhoneNumber) {
        sendJson(response, 400, { ok: false, error: "Customer phone number is blank or invalid. Enter a valid US phone number or E.164 number." });
        return;
      }

      console.log(`[vapi] creating outbound call for order ${orderId} to ${maskPhoneNumber(customerPhoneNumber)}`);
      const variableValues = buildVapiVariableValues(requestBody);
      const vapiPayload = {
        assistantId,
        phoneNumberId,
        customer: { number: customerPhoneNumber },
        assistantOverrides: {
          variableValues,
        },
        metadata: {
          orderId,
          order_number: orderId,
          purchase_order_number: variableValues.purchase_order_number || "",
          source: "allied-erp",
        },
      };
      console.log("Vapi variable names:", Object.keys(vapiPayload.assistantOverrides.variableValues).join(", "));
      console.log("Vapi variable sample values:", JSON.stringify(maskedVariableSamples(vapiPayload.assistantOverrides.variableValues), null, 2));

      const vapiResponse = await fetch(vapiApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vapiPayload),
      });
      const responseText = await vapiResponse.text();
      let vapiResult = {};
      try {
        vapiResult = responseText ? JSON.parse(responseText) : {};
      } catch {
        vapiResult = { message: responseText };
      }

      if (!vapiResponse.ok) {
        const errorMessage = vapiResult.message || vapiResult.error || vapiResult.detail || `Vapi rejected the call with status ${vapiResponse.status}.`;
        console.error(`[vapi] call rejected for order ${orderId}: ${errorMessage}`);
        sendJson(response, vapiResponse.status, { ok: false, error: errorMessage, details: vapiResult });
        return;
      }

      const call = vapiResult.call || vapiResult;
      sendJson(response, 200, {
        ok: true,
        callId: call.id || "",
        callStatus: call.status || "scheduled",
        phoneNumber: maskPhoneNumber(customerPhoneNumber),
        vapiResponse: vapiResult,
      });
      return;
    }

    if (requestUrl.pathname === "/api/vapi/webhook" && request.method === "POST") {
      if (!webhookSecretIsValid(request)) {
        sendJson(response, 401, { ok: false, error: "Webhook authentication failed." });
        return;
      }
      const message = await parseJsonBody(request);
      const messageType = extractWebhookType(message);
      const call = extractVapiCall(message);
      const callId = extractVapiCallId(message);
      const orderId = extractVapiOrderId(message);
      const assistantId = extractVapiAssistantId(message);
      const transcript = extractVapiTranscript(message);
      const analysis = extractVapiAnalysis(message);
      const structuredOutputs = extractStructuredOutputs(message);
      const outputValues = structuredOutputValues(structuredOutputs);
      const erpStructuredOutput = findErpStructuredOutput(message);
      const legacyStructuredResult = extractStructuredData(analysis);
      const hasLegacyStructuredOutcome = Boolean(extractStructuredOutcome(legacyStructuredResult));
      const structuredResult = erpStructuredOutput?.result || (hasLegacyStructuredOutcome ? legacyStructuredResult : {});
      const endReason = extractVapiEndReason(message);
      const phoneNumber = extractVapiCustomerPhone(message);
      const duration = extractVapiDuration(message);
      const assistantName = extractVapiAssistantName(message);
      const timestamp = call.endedAt || call.updatedAt || call.createdAt || message?.timestamp || message?.message?.timestamp || new Date().toISOString();
      const outcome = erpStructuredOutput?.result || hasLegacyStructuredOutcome || !hasStructuredOutputsPayload(message) ? classifyVapiOutcome(message) : "";
      const structuredOutputNames = outputValues.map((item) => item?.name || "").filter(Boolean);
      console.log("[vapi-webhook] Webhook received");
      console.log(`[vapi-webhook] message type: ${messageType || "none"}`);
      console.log(`[vapi-webhook] Structured outputs found: ${structuredOutputNames.length}`);
      structuredOutputNames.forEach((name) => console.log(`[vapi-webhook] Structured output name: ${name}`));
      console.log(`[vapi-webhook] verification_outcome: ${structuredResult?.verification_outcome || structuredResult?.verificationOutcome || structuredResult?.outcome || "none"}`);
      if (!erpStructuredOutput) console.log("[vapi-webhook] ERP_Order_Verification not found. structuredOutputs:", JSON.stringify(structuredOutputs, null, 2));
      console.log(`[vapi-webhook] call=${callId || "none"} order=${orderId || "none"} assistant=${assistantId || "none"} outcome=${outcome} phone=${phoneNumber ? maskPhoneNumber(phoneNumber) : "none"}`);

      const sharedState = await readSharedStateJson();
      const order = orderForCall(sharedState, orderId, callId);
      console.log(`[vapi-webhook] Matched order: ${order?.id || "none"}`);

      if (messageType === "status-update") {
        const callStatus = extractVapiCallStatus(message);
        console.log(`[vapi-webhook] status-update status=${callStatus || "none"}`);
        if (order && ["in-progress", "in_progress", "ringing", "queued"].includes(callStatus)) {
          if (order.status !== "verification_in_progress") recordOrderStatus(order, "verification_in_progress", "Assistant Verification call is in progress.", "Vapi");
          order.verification = {
            ...(order.verification || {}),
            state: "verification_in_progress",
            method: "Assistant",
            vapiCallId: callId || order.verification?.vapiCallId || "",
            vapiCallStatus: callStatus || "in-progress",
            lastVerificationAttempt: new Date().toISOString(),
          };
          await writeSharedStateJson(sharedState);
        }
        sendJson(response, 200, { ok: true, ignored: true, type: "status-update", status: callStatus });
        return;
      }

      if (messageType && messageType !== "end-of-call-report" && !isFinalVapiEvent(message)) {
        sendJson(response, 200, { ok: true, ignored: true, reason: "Webhook event is not an end-of-call event." });
        return;
      }

      if (!orderId && !callId) {
        sendJson(response, 200, { ok: true, ignored: true });
        return;
      }

      logVapiWebhookActivity(sharedState, {
        stage: "incoming webhook",
        callId,
        orderId,
        assistantId,
        outcome: outcome || "pending_structured_output",
        endReason,
        phoneNumber: phoneNumber ? maskPhoneNumber(phoneNumber) : "",
        orderMatched: false,
        timestamp,
      });
      if (!order) {
        logVapiManualReview(sharedState, {
          reason: "No matching order number was found.",
          callId,
          orderId,
          assistantId,
          outcome,
          endReason,
          phoneNumber: phoneNumber ? maskPhoneNumber(phoneNumber) : "",
          timestamp,
        });
        await writeSharedStateJson(sharedState);
        sendJson(response, 200, { ok: true, ignored: true, reason: "Order not found." });
        return;
      }

      if (hasProcessedCall(sharedState, order, callId)) {
        console.log(`[vapi-webhook] duplicate ignored for call=${callId} order=${order.id}`);
        sendJson(response, 200, { ok: true, ignored: true, duplicate: true, orderId: order.id });
        return;
      }

      if (outcome === "TRANSFERRED") {
        console.log(`[vapi-webhook] transfer event ignored until final outcome for call=${callId || "none"} order=${order.id}`);
        sendJson(response, 200, { ok: true, ignored: true, outcome, reason: "Transfer event does not update order status." });
        return;
      }

      if (!erpStructuredOutput?.result && !hasLegacyStructuredOutcome && hasStructuredOutputsPayload(message)) {
        enqueueStructuredOutputRetry(sharedState, {
          callId,
          orderId: order.id,
          assistantId,
          transcript,
          duration,
          phoneNumber,
          assistantName,
          timestamp,
          endReason,
          metadata: call.metadata || message.metadata || {},
        });
        await writeSharedStateJson(sharedState);
        processDueVapiRetryRecords().catch((error) => console.error(`[vapi-retry] background processing failed: ${error.message}`));
        sendJson(response, 200, { ok: true, queued: true, orderId: order.id, callId });
        return;
      }

      if (outcome === "FAILED") {
        logVapiFailure(sharedState, {
          callId,
          orderId: order.id,
          assistantId,
          endReason,
          phoneNumber: phoneNumber ? maskPhoneNumber(phoneNumber) : "",
          timestamp,
        });
        const history = updateOrderFromVapiOutcome(order, outcome, {
          callId,
          transcript,
          duration,
          phoneNumber,
          assistantName,
          timestamp,
          endReason,
          analysis: structuredResult,
          sourceMessage: message,
        }, sharedState);
        logVapiWebhookActivity(sharedState, {
          stage: "status updated",
          callId,
          orderId: order.id,
          assistantId,
          outcome,
          orderMatched: true,
          status: order.status,
          verificationState: order.verification?.state || "",
          timestamp,
        });
        markProcessedCall(sharedState, order, callId);
        await writeSharedStateJson(sharedState);
        console.log(`[vapi-webhook] Database update successful for order ${order.id}`);
        sendJson(response, 200, { ok: true, orderId: order.id, outcome, status: order.status, verificationHistory: history });
        return;
      }

      const history = updateOrderFromVapiOutcome(order, outcome, {
        callId,
        transcript,
        duration,
        phoneNumber,
        assistantName,
        timestamp,
        endReason,
        analysis: structuredResult,
        sourceMessage: message,
      }, sharedState);

      if (outcome === "VERIFIED") {
        const recordingUrl = extractRecordingUrl(message);
        order.verification = {
          ...(order.verification || {}),
          summary: recordingUrl ? "Assistant Verification completed successfully and a recording is attached." : order.verification?.summary,
          recordingUrl: recordingUrl || order.verification?.recordingUrl || "",
        };
      }

      markProcessedCall(sharedState, order, callId);
      logVapiWebhookActivity(sharedState, {
        stage: "status updated",
        callId,
        orderId: order.id,
        assistantId,
        outcome,
        orderMatched: true,
        status: order.status,
        verificationState: order.verification?.state || "",
        timestamp,
      });
      await writeSharedStateJson(sharedState);
      console.log(`[vapi-webhook] Database update successful for order ${order.id}`);
      sendJson(response, 200, {
        ok: true,
        orderId: order.id,
        outcome,
        status: order.status,
        verificationHistory: history,
      });
      return;
    }

    const filePath = resolveRequestPath(request.url || "/");
    if (!filePath) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    const body = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": contentTypes[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html" ? "no-store" : "public, max-age=300",
    });
    response.end(body);
  } catch (error) {
    const requestUrl = new URL(request.url || "/", "http://localhost");
    if (requestUrl.pathname.startsWith("/api/")) {
      const status = error.message === "Request body must be valid JSON." ? 400 : 500;
      sendJson(response, status, { ok: false, error: error.message || "Server error." });
      return;
    }
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`Allied ERP listening on ${host}:${port}`);
  processDueVapiRetryRecords().catch((error) => console.error(`[vapi-retry] startup processing failed: ${error.message}`));
  setInterval(() => {
    processDueVapiRetryRecords().catch((error) => console.error(`[vapi-retry] scheduled processing failed: ${error.message}`));
  }, retryWorkerIntervalMs);
});
