import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
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
const starterUsers = [
  { username: "admin", role: "super_admin", name: "Main Admin" },
  { username: "credit", role: "credit", name: "Credit Dept." },
  { username: "shipping", role: "shipping", name: "Shipping" },
  { username: "jordan", role: "sales", name: "Jordan Lee" },
  { username: "avery", role: "sales", name: "Avery Brooks" },
];
const envPasswordKeys = {
  admin: "ALLIED_ERP_ADMIN_PASSWORD",
  credit: "ALLIED_ERP_CREDIT_PASSWORD",
  shipping: "ALLIED_ERP_SHIPPING_PASSWORD",
  jordan: "ALLIED_ERP_JORDAN_PASSWORD",
  avery: "ALLIED_ERP_AVERY_PASSWORD",
};
const vapiApiUrl = process.env.VAPI_API_URL || "https://api.vapi.ai/call";

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
    return JSON.parse(await readFile(sharedStatePath, "utf8"));
  } catch {
    return {};
  }
}

async function writeSharedStateJson(state) {
  await mkdir(dataRoot, { recursive: true });
  await writeFile(sharedStatePath, JSON.stringify(state, null, 2), "utf8");
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

function extractVapiCall(message) {
  return message?.call || message?.data?.call || message?.callData || message?.data || message || {};
}

function extractVapiCallId(message) {
  const call = extractVapiCall(message);
  return call.id || message?.callId || message?.data?.callId || "";
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
    verification_in_progress: "Verification In Progress",
    verified: "Verified",
    issue: "Issue",
  };
  return labels[status] || status || "";
}

function recordOrderStatus(order, status, notes = "", by = "Vapi") {
  const at = new Date().toLocaleString([], { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  order.status = status;
  order.statusChangedAt = at;
  order.statusChangedBy = by;
  if (!Array.isArray(order.statusHistory)) order.statusHistory = [];
  order.statusHistory.push({ status, label: statusLabel(status), at, by, notes });
  return at;
}

function formatMoney(value) {
  const amount = Number(value || 0);
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
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
  };
  return map[clean] || "unit";
}

function quantityUnitLabel(quantity, item = {}) {
  const productName = String(item.name || "").toLowerCase();
  const rawUnit = item.unit || item.uom || item.unitOfMeasure || "";
  let unit = singularizeUnit(rawUnit);
  if (!rawUnit && productName.includes("case")) unit = "case";
  if (!rawUnit && productName.includes("roll")) unit = "roll";
  return `${unit}${Number(quantity) === 1 ? "" : "s"}`;
}

function orderItemsSentence(items = []) {
  const lines = items.map((item) => {
    const quantity = Number(item.orderedQty || item.qty || 0);
    const productName = item.name || "item";
    const quantityText = Number.isFinite(quantity) && quantity > 0 ? quantity.toLocaleString("en-US") : "0";
    return `${quantityText} ${quantityUnitLabel(quantity, item)} of ${productName}`;
  });
  return lines.length ? `The order includes ${joinSentenceParts(lines)}.` : "";
}

function stringifyVariable(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function buildVapiVariableValues(requestBody) {
  const order = requestBody.order?.order || requestBody.order || {};
  const customer = order.customer || {};
  const orderNumber = order.id || requestBody.orderId || "";
  const values = {
    order_number: String(orderNumber || ""),
    buyer_name: String(order.buyerName || ""),
    customer_name: customer.name || "",
    customer_contact: customer.contact || order.buyerName || customer.name || "",
    account_number: order.accountNumber || "",
    account_status: order.accountStatus || "",
    sales_rep: order.salesRep || order.rep || "",
    order_date: order.date || "",
    ship_date: order.shipDate || "",
    shipping_address: addressSentence(order.address || {}),
    order_notes: order.notes || "",
    order_total: formatMoney(order.total || 0),
    order_items: orderItemsSentence(order.items || []),
  };
  return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, stringifyVariable(value)]));
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", "http://localhost");

    if (requestUrl.pathname === "/api/state" && request.method === "GET") {
      const body = existsSync(sharedStatePath) ? await readFile(sharedStatePath) : Buffer.from("{}", "utf8");
      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(body);
      return;
    }

    if (requestUrl.pathname === "/api/state" && request.method === "POST") {
      let body = "";
      request.setEncoding("utf8");
      for await (const chunk of request) body += chunk;
      JSON.parse(body);
      await mkdir(dataRoot, { recursive: true });
      await writeFile(sharedStatePath, body, "utf8");
      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(JSON.stringify({ ok: true }));
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
          source: "allied-erp",
        },
      };
      console.log("Vapi variable values:", JSON.stringify(vapiPayload.assistantOverrides.variableValues, null, 2));

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
      const message = await parseJsonBody(request);
      const call = extractVapiCall(message);
      const callId = extractVapiCallId(message);
      const orderId = String(call.metadata?.orderId || message.metadata?.orderId || message.orderId || "").trim();
      if (!orderId && !callId) {
        sendJson(response, 200, { ok: true, ignored: true });
        return;
      }

      const sharedState = await readSharedStateJson();
      const orders = Array.isArray(sharedState.orders) ? sharedState.orders : [];
      const order = orders.find((item) => item.id === orderId || item.verification?.vapiCallId === callId);
      if (!order) {
        sendJson(response, 200, { ok: true, ignored: true, reason: "Order not found." });
        return;
      }

      if (isSuccessfulVapiCompletion(message)) {
        const recordingUrl = extractRecordingUrl(message);
        const at = recordOrderStatus(order, "verified", "Vapi call completed successfully.", "Vapi");
        order.verification = {
          ...(order.verification || {}),
          state: "verified",
          method: "Assistant",
          summary: recordingUrl ? "Assistant verification completed and a recording is attached." : "Assistant verification completed successfully.",
          at,
          verifiedBy: "Vapi",
          vapiCallId: callId || order.verification?.vapiCallId || "",
          vapiCallStatus: call.status || "completed",
          recordingUrl: recordingUrl || order.verification?.recordingUrl || "",
        };
        await writeSharedStateJson(sharedState);
        sendJson(response, 200, { ok: true, orderId: order.id, status: "verified" });
        return;
      }

      sendJson(response, 200, { ok: true, ignored: true, status: call.status || message.type || "" });
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
});
