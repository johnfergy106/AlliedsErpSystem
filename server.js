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

function safeUser(user) {
  const { password, ...publicUser } = user;
  return publicUser;
}

function envPasswordFor(username) {
  const directKey = envPasswordKeys[username] || `ALLIED_ERP_${username.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_PASSWORD`;
  return process.env[directKey] || "";
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
      let body = "";
      request.setEncoding("utf8");
      for await (const chunk of request) body += chunk;
      const credentials = JSON.parse(body || "{}");
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
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`Allied ERP listening on ${host}:${port}`);
});
