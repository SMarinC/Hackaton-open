import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { existsSync, readFileSync, unwatchFile, watchFile } from "node:fs";
import { parseEnv } from "node:util";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { ApiError, createStore } from "./store.js";
import {
  createOutboxWorker,
  dispatchCase,
  displayOutbox,
  publicChannels,
  sendOutbox,
} from "./channels.js";
import { coordinate, coordinatorMode } from "./coordinator.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};
const json = (response, status, payload) => {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(payload));
};
async function readJson(request) {
  if (
    !request.headers["content-type"]
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new ApiError(415, "Se requiere application/json.");
  let bytes = 0;
  const chunks = [];
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > 65536) throw new ApiError(413, "Petición demasiado grande.");
    chunks.push(chunk);
  }
  try {
    const result = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!result || Array.isArray(result) || typeof result !== "object")
      throw new Error();
    return result;
  } catch {
    throw new ApiError(400, "JSON inválido.");
  }
}
function checkLocalRequest(request) {
  const host = request.headers.host ?? "";
  if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host))
    throw new ApiError(403, "Servidor disponible solo en loopback.");
  const origin = request.headers.origin;
  if (
    origin &&
    origin !== `http://${host}` &&
    !["http://127.0.0.1:5173", "http://localhost:5173"].includes(origin)
  ) {
    throw new ApiError(403, "Origen no permitido.");
  }
}

export function createHandler({
  store,
  env = process.env,
  fetchImpl = fetch,
  staticDir = resolve(root, "dist"),
}) {
  // Provider calls can take up to 10 s each; dispatch after responding so the
  // browser is not blocked. `handler.idle()` lets tests await the queue.
  const pending = new Set();
  const background = (promise) => {
    const task = promise.catch(() => {}).finally(() => pending.delete(task));
    pending.add(task);
  };
  const handler = async (request, response) => {
    try {
      checkLocalRequest(request);
      const url = new URL(request.url, "http://127.0.0.1");
      if (url.pathname === "/api/state" && request.method === "GET") {
        const cases = store.listCases();
        const versions = new Map(cases.map((item) => [item.id, item.version]));
        return json(response, 200, {
          cases,
          outbox: store
            .listOutbox()
            .map((item) =>
              displayOutbox(item, env, versions.get(item.case_id)),
            ),
          channels: publicChannels(env),
          coordinator: {
            mode: coordinatorMode(env),
            external_replies_supported: false,
          },
        });
      }
      if (url.pathname === "/api/events" && request.method === "POST") {
        const result = store.ingest(await readJson(request));
        if (result.created) {
          const decision = await coordinate(result.case, { env, fetchImpl });
          result.case = store.annotateDecision(
            result.case.id,
            result.case.version,
            decision,
          );
          background(dispatchCase(store, result.case.id, { env, fetchImpl }));
        }
        return json(response, result.created ? 201 : 200, result);
      }
      const observation = url.pathname.match(
        /^\/api\/cases\/([^/]+)\/observation$/,
      );
      if (observation && request.method === "POST") {
        const result = store.observe(observation[1], await readJson(request));
        if (!result.duplicate) {
          const decision = await coordinate(result.case, { env, fetchImpl });
          result.case = store.annotateDecision(
            result.case.id,
            result.case.version,
            decision,
          );
          background(dispatchCase(store, result.case.id, { env, fetchImpl }));
        }
        return json(response, 200, result);
      }
      const send = url.pathname.match(/^\/api\/outbox\/([^/]+)\/send$/);
      if (send && request.method === "POST") {
        await readJson(request);
        return json(response, 200, {
          message: await sendOutbox(store, send[1], { env, fetchImpl }),
        });
      }
      if (url.pathname.startsWith("/api/"))
        throw new ApiError(404, "Ruta API no encontrada.");
      if (!["GET", "HEAD"].includes(request.method))
        throw new ApiError(405, "Método no permitido.");
      let decoded;
      try {
        decoded = decodeURIComponent(url.pathname);
      } catch {
        throw new ApiError(400, "Ruta inválida.");
      }
      const base = await realpath(staticDir).catch(() => null);
      if (!base)
        throw new ApiError(
          503,
          "Frontend sin construir. Ejecuta npm run build o el servidor Vite.",
        );
      let file = resolve(base, `.${decoded}`);
      if (file !== base && !file.startsWith(base + sep))
        throw new ApiError(403, "Ruta no permitida.");
      const info = await stat(file).catch(() => null);
      if (info?.isDirectory() || (!info && !extname(decoded)))
        file = resolve(base, "index.html");
      const actual = await realpath(file).catch(() => null);
      if (!actual || !actual.startsWith(base + sep))
        throw new ApiError(404, "Archivo no encontrado.");
      const content = await readFile(actual);
      response.writeHead(200, {
        "Content-Type": mime[extname(actual)] ?? "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache",
      });
      response.end(request.method === "HEAD" ? undefined : content);
    } catch (error) {
      if (!response.headersSent)
        json(response, error instanceof ApiError ? error.status : 500, {
          error:
            error instanceof ApiError
              ? error.message
              : "No se pudo completar la operación.",
        });
      else response.end();
    }
  };
  handler.idle = () => Promise.allSettled([...pending]);
  return handler;
}

export function startServer({ env = process.env } = {}) {
  const store = createStore({
    filename: env.PANELA_DB_PATH
      ? resolve(env.PANELA_DB_PATH)
      : resolve(root, "data/private/panela.sqlite"),
    inventoryFixture: env.PANELA_INVENTORY_FIXTURE ?? "unknown",
  });
  const server = createServer(createHandler({ store, env }));
  const worker = createOutboxWorker(store, {
    env,
    onResult: (results) => {
      for (const item of results) {
        if (item.skipped) continue;
        console.log(
          `Envío automático · ${item.channel} ${item.intent} → ${item.status}${item.provider_error ? ` (${item.provider_error})` : ""}${item.next_attempt_at ? ` · reintento ${item.next_attempt_at}` : ""}`,
        );
      }
    },
  });
  server.outboxWorker = worker;
  server.listen(Number(env.PORT ?? 8787), "127.0.0.1", () => {
    console.log(
      `Panela Stocks API disponible en http://127.0.0.1:${server.address().port}`,
    );
    worker.start();
  });
  server.on("close", () => {
    worker.stop();
    store.close();
  });
  return server;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const envFile = resolve(root, ".env");
  let envKeys = new Set();
  if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
    envKeys = new Set(Object.keys(parseEnv(readFileSync(envFile, "utf8"))));
  }
  const server = startServer();
  // Send flags, recipients and credentials are read per request, so a changed
  // .env applies without restarting. watchFile polls only this file: a
  // directory watcher on Windows also fires on SQLite writes and loops.
  watchFile(envFile, { interval: 1000 }, (current, previous) => {
    if (current.mtimeMs === previous.mtimeMs) return;
    try {
      const next = parseEnv(readFileSync(envFile, "utf8"));
      for (const key of envKeys) if (!(key in next)) delete process.env[key];
      Object.assign(process.env, next);
      envKeys = new Set(Object.keys(next));
      const reactivated = server.outboxWorker.resetBackoff();
      console.log(
        `Cambió .env · credenciales, destinatarios y banderas de envío recargados; ${reactivated} envío(s) fallido(s) vuelven a intentarse (PORT y PANELA_DB_PATH requieren reiniciar).`,
      );
      server.outboxWorker.tick().catch(() => {});
    } catch {
      console.log("No se pudo leer .env; se conservan los valores anteriores.");
    }
  });
  server.on("close", () => unwatchFile(envFile));
  for (const signal of ["SIGINT", "SIGTERM"])
    process.once(signal, () => server.close());
}

export { createStore } from "./store.js";
