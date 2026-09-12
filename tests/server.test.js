import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Readable } from "node:stream";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { createStore, ApiError } from "../server/store.js";
import { createHandler } from "../server/index.js";
import {
  sendOutbox,
  publicChannels,
  displayOutbox,
} from "../server/channels.js";
import { coordinate, coordinatorMode } from "../server/coordinator.js";

const event = (overrides = {}) => ({
  event_id: "event-1",
  run_id: "run-1",
  source_id: "local-video-1",
  zone_id: "zone-1",
  zone_name: "Abarrotes",
  track_id: "track-1",
  media_time_s: 8,
  duration_s: 5,
  confidence: 0.9,
  event_type: "person_dwell_detected",
  ...overrides,
});
const liveEnv = {
  PANELA_LIVE_SEND: "true",
  SLACK_BOT_TOKEN: "test-not-a-real-token",
  PANELA_SLACK_CHANNEL: "C_DEMO",
  PANELA_ALLOWED_SLACK_CHANNELS: "C_DEMO",
  RESEND_API_KEY: "test-not-a-real-key",
  PANELA_EMAIL_FROM: "demo@example.invalid",
  PANELA_EMAIL_TO: "operator@example.invalid",
  PANELA_ALLOWED_EMAIL_RECIPIENTS: "operator@example.invalid",
};
function memory(t) {
  const store = createStore({ filename: ":memory:" });
  t.after(() => store.close());
  return store;
}
function observe(store, id, input) {
  return store.observe(id, {
    request_id: randomUUID(),
    expected_version: store.getCase(id).version,
    ...input,
  });
}
async function call(handler, method, url, body, extraHeaders = {}) {
  const request = Readable.from(
    body === undefined ? [] : [Buffer.from(JSON.stringify(body))],
  );
  request.method = method;
  request.url = url;
  request.headers = {
    host: "127.0.0.1:8787",
    "content-type": "application/json",
    ...extraHeaders,
  };
  let status;
  let payload;
  let headers;
  const response = {
    headersSent: false,
    writeHead(code, value) {
      status = code;
      headers = value;
      this.headersSent = true;
    },
    end(value) {
      payload = value ? JSON.parse(value) : null;
    },
  };
  await handler(request, response);
  return { status, payload, headers };
}

test("case and outbox survive reopen; duplicate frames never create extra messages", () => {
  const dir = mkdtempSync(join(tmpdir(), "panela-store-"));
  const filename = join(dir, "private", "test.sqlite");
  let store = createStore({ filename });
  try {
    const first = store.ingest(event());
    assert.equal(first.case.source_integrity, "opening_event_v1");
    assert.equal(first.case.inventory.status, "unknown");
    assert.equal(first.case.status, "review_required");
    assert.equal(store.ingest(event()).duplicate, true);
    const later = store.ingest(
      event({ event_id: "event-2", duration_s: 9, media_time_s: 12 }),
    );
    assert.equal(later.case.id, first.case.id);
    assert.deepEqual(later.case.source, first.case.source);
    assert.equal(store.listOutbox().length, 1);
    assert.equal(store.listOutbox()[0].intent, "ask_review");
    assert.match(store.listOutbox()[0].text, /no demuestra faltante/);
    assert.match(store.listOutbox()[0].text, /^\[DEMO Panela Stocks ·/);
    store.close();
    store = createStore({ filename });
    assert.equal(store.listCases()[0].id, first.case.id);
    assert.deepEqual(store.listCases()[0].source, first.case.source);
    assert.equal(store.ingest(event()).duplicate, true);
    assert.equal(store.listOutbox().length, 1);
    assert.notEqual(
      store.ingest(event({ run_id: "run-2" })).case.id,
      first.case.id,
    );
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("later event payloads persist without rewriting opening evidence or a terminal case", () => {
  const dir = mkdtempSync(join(tmpdir(), "panela-evidence-"));
  const filename = join(dir, "test.sqlite");
  let store = createStore({ filename });
  let inspection;
  try {
    const firstEvent = event({
      visit_id: "track-1:visit-1",
      detector: "fixture-detector",
      threshold_s: 5,
      zone_polygon: [[0, 0], [1, 0], [1, 1]],
    });
    const laterEvent = {
      ...firstEvent, event_id: "event-2", media_time_s: 12,
      duration_s: 9, confidence: 0.3,
    };
    const lateEvent = {
      ...firstEvent, event_id: "event-3", media_time_s: 22,
      duration_s: 20, confidence: 0.2,
    };
    const first = store.ingest(firstEvent).case;
    assert.deepEqual(store.ingest(laterEvent).case, first);
    const discarded = observe(store, first.id, {
      kind: "no_issue", note: "Caso de prueba sin incidencia.",
    }).case;
    const queued = store.listOutbox();
    assert.deepEqual(store.ingest(lateEvent).case, discarded);
    assert.deepEqual(store.listOutbox(), queued);
    assert.equal(store.ingest(lateEvent).duplicate, true);
    store.close();
    store = createStore({ filename });
    assert.deepEqual(store.getCase(first.id), discarded);
    inspection = new DatabaseSync(filename, { readOnly: true });
    const rows = inspection.prepare("SELECT case_id, payload FROM events ORDER BY rowid").all();
    assert.deepEqual(rows.map((row) => row.case_id), [first.id, first.id, first.id]);
    assert.deepEqual(rows.map((row) => JSON.parse(row.payload)), [firstEvent, laterEvent, lateEvent]);
  } finally {
    inspection?.close();
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("legacy event migration preserves cases and hashes without fabricating missing payloads", () => {
  const dir = mkdtempSync(join(tmpdir(), "panela-evidence-migration-"));
  const filename = join(dir, "test.sqlite");
  let store = createStore({ filename });
  let legacy;
  let inspection;
  try {
    const original = store.ingest(event()).case;
    const queued = store.listOutbox();
    store.close();
    store = null;
    legacy = new DatabaseSync(filename);
    legacy.exec("ALTER TABLE events DROP COLUMN payload");
    const legacyCase = { ...original };
    delete legacyCase.source_integrity;
    legacy.prepare("UPDATE cases SET data = ? WHERE id = ?").run(JSON.stringify(legacyCase), original.id);
    const oldRows = legacy.prepare("SELECT * FROM events").all();
    legacy.close();
    legacy = null;
    store = createStore({ filename });
    assert.deepEqual(store.getCase(original.id), legacyCase);
    assert.equal(Object.hasOwn(store.getCase(original.id), "source_integrity"), false);
    assert.deepEqual(store.listOutbox(), queued);
    assert.equal(store.ingest(event()).duplicate, true);
    const next = event({ event_id: "post-migration", media_time_s: 12, duration_s: 9 });
    assert.deepEqual(store.ingest(next).case, legacyCase);
    inspection = new DatabaseSync(filename, { readOnly: true });
    const rows = inspection.prepare("SELECT * FROM events ORDER BY rowid").all();
    assert.equal(rows.length, 2);
    assert.deepEqual({ ...rows[0] }, { ...oldRows[0], payload: null });
    assert.deepEqual(JSON.parse(rows[1].payload), { ...next, visit_id: "legacy" });
    const newCase = store.ingest(event({ run_id: "post-migration-run" })).case;
    assert.equal(newCase.source_integrity, "opening_event_v1");
    assert.equal(Object.hasOwn(store.getCase(original.id), "source_integrity"), false);
  } finally {
    inspection?.close();
    legacy?.close();
    store?.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("mutated duplicate and unsupported visual inference are rejected without writes", (t) => {
  const store = memory(t);
  store.ingest(event());
  assert.throws(
    () => store.ingest(event({ confidence: 0.2 })),
    (error) => error.status === 409,
  );
  assert.throws(
    () => store.ingest(event({ event_type: "stock_missing" })),
    (error) => error.status === 400,
  );
  assert.throws(
    () => store.ingest(event({ confidence: 1.1 })),
    (error) => error.status === 400,
  );
  assert.throws(
    () => store.ingest(event({ visit_id: "" })),
    (error) => error.status === 400,
  );
  assert.equal(store.listCases().length, 1);
  assert.equal(store.listOutbox().length, 1);
});

test("reentry opens a new case while frames of the same visit remain correlated", (t) => {
  const store = memory(t);
  const firstEvent = event({ visit_id: "track-1:visit-1" });
  const first = store.ingest(firstEvent).case;
  assert.equal(store.ingest(firstEvent).duplicate, true);
  const later = store.ingest(
    event({ event_id: "event-2", visit_id: "track-1:visit-1", duration_s: 9 }),
  );
  assert.equal(later.case.id, first.id);
  assert.equal(later.created, false);
  observe(store, first.id, {
    kind: "no_issue",
    note: "Primera visita sin incidencia.",
  });
  const next = store.ingest(
    event({
      event_id: "event-3",
      visit_id: "track-1:visit-2",
      media_time_s: 30,
    }),
  );
  assert.notEqual(next.case.id, first.id);
  assert.equal(next.created, true);
  assert.equal(next.case.status, "review_required");
  assert.equal(store.getCase(first.id).status, "discarded");
  assert.equal(store.listCases().length, 2);
  assert.equal(
    store.listOutbox().filter((item) => item.intent === "ask_review").length,
    2,
  );
  assert.throws(
    () => store.ingest({ ...firstEvent, visit_id: "track-1:visit-2" }),
    (error) => error.status === 409,
  );
});

test("inventory alone cannot authorize replenishment or a supplier query", (t) => {
  const store = memory(t);
  const first = store.ingest(event()).case;
  for (const kind of ["stock_confirmed", "no_stock"]) {
    for (const flag of [undefined, false, "true", 1]) {
      assert.throws(
        () =>
          observe(store, first.id, {
            kind,
            note: "Estado de inventario solamente.",
            shelf_issue_confirmed: flag,
          }),
        (error) => error.status === 400,
      );
    }
  }
  assert.deepEqual(store.getCase(first.id), first);
  assert.equal(store.listOutbox().length, 1);
  assert.equal(store.listOutbox()[0].status, "pending_connection");
});

test("observation request IDs persist and distinguish retries from repeated text in a later state", () => {
  const dir = mkdtempSync(join(tmpdir(), "panela-observations-"));
  const filename = join(dir, "test.sqlite");
  let store = createStore({ filename });
  try {
    const id = store.ingest(event()).case.id;
    const firstRequest = {
      request_id: "stock-1",
      expected_version: 1,
      kind: "stock_confirmed",
      note: "Hay stock.",
      shelf_issue_confirmed: true,
    };
    const first = store.observe(id, firstRequest);
    assert.equal(first.case.status, "assigned");
    const unavailable = observe(store, id, {
      request_id: "stock-2",
      kind: "no_stock",
      note: "Ahora no hay stock.",
      shelf_issue_confirmed: true,
    });
    assert.equal(unavailable.case.status, "awaiting_delivery");
    store.close();
    store = createStore({ filename });
    const oldRetry = store.observe(id, firstRequest);
    assert.equal(oldRetry.duplicate, true);
    assert.equal(oldRetry.case.status, "awaiting_delivery");
    const nextRequest = {
      ...firstRequest,
      request_id: "stock-3",
      expected_version: 3,
    };
    const reassigned = store.observe(id, nextRequest);
    assert.equal(reassigned.duplicate, false);
    assert.equal(reassigned.case.status, "assigned");
    assert.equal(reassigned.case.version, 4);
    assert.equal(reassigned.case.observations.length, 3);
    assert.notEqual(reassigned.case.task.id, first.case.task.id);
    const before = { case: store.getCase(id), outbox: store.listOutbox() };
    assert.equal(store.observe(id, nextRequest).duplicate, true);
    assert.throws(
      () => store.observe(id, { ...nextRequest, note: "Otro texto." }),
      (error) => error.status === 409,
    );
    assert.throws(
      () => store.observe(id, { ...nextRequest, expected_version: 4 }),
      (error) => error.status === 409,
    );
    assert.throws(
      () =>
        store.observe(id, {
          ...nextRequest,
          request_id: "stale-request",
          kind: "no_stock",
        }),
      (error) => error.status === 409,
    );
    assert.deepEqual(
      { case: store.getCase(id), outbox: store.listOutbox() },
      before,
    );
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("new observations require an explicit request ID and positive integer expected version", (t) => {
  const store = memory(t);
  const item = store.ingest(event()).case;
  const input = {
    kind: "no_issue",
    note: "Sin incidencia.",
    request_id: "request-1",
    expected_version: item.version,
  };
  for (const invalid of [
    { request_id: undefined },
    { request_id: "" },
    { expected_version: undefined },
    { expected_version: 0 },
    { expected_version: 1.5 },
    { expected_version: "1" },
  ]) {
    assert.throws(
      () => store.observe(item.id, { ...input, ...invalid }),
      (error) => error.status === 400,
    );
  }
  assert.deepEqual(store.getCase(item.id), item);
  assert.equal(store.listOutbox().length, 1);
});

test("evidence configuration is validated and retained with the event", (t) => {
  const store = memory(t);
  const metadata = {
    detector: "coco-ssd-lite_mobilenet_v2",
    threshold_s: 5,
    zone_polygon: [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ],
  };
  const item = store.ingest(event(metadata)).case;
  assert.equal(item.source.detector, metadata.detector);
  assert.equal(item.source.threshold_s, 5);
  assert.deepEqual(item.source.zone_polygon, metadata.zone_polygon);
  assert.equal(store.ingest(event(metadata)).duplicate, true);
  assert.throws(
    () => store.ingest(event({ ...metadata, threshold_s: 7 })),
    (error) => error.status === 409,
  );
  for (const invalid of [
    { detector: "" },
    { detector: 23 },
    { threshold_s: 0 },
    { threshold_s: -1 },
    { threshold_s: "5" },
    {
      zone_polygon: [
        [0, 0],
        [1, 1],
      ],
    },
    { zone_polygon: Array(21).fill([0, 0]) },
    {
      zone_polygon: [
        [0, 0],
        [1.1, 0],
        [1, 1],
      ],
    },
    { zone_polygon: [[0], [1, 0], [1, 1]] },
  ]) {
    assert.throws(
      () => store.ingest(event({ event_id: "invalid-metadata", ...invalid })),
      (error) => error.status === 400,
    );
  }
  assert.equal(store.listCases().length, 1);
  assert.equal(store.listOutbox().length, 1);
});

test("restock requires assigned task and note; human closure is explicit and terminal", (t) => {
  const store = memory(t);
  const id = store.ingest(event()).case.id;
  assert.throws(
    () => observe(store, id, { kind: "restocked", note: "Hecho" }),
    (error) => error.status === 409,
  );
  assert.throws(
    () => observe(store, id, { kind: "stock_confirmed", note: " " }),
    (error) => error.status === 400,
  );
  const assigned = observe(store, id, {
    kind: "stock_confirmed",
    note: "Revisión local de prueba.",
    shelf_issue_confirmed: true,
  }).case;
  assert.equal(assigned.status, "assigned");
  assert.equal(assigned.observations[0].source, "local_operator");
  assert.equal(assigned.observations[0].shelf_issue_confirmed, true);
  assert.equal(assigned.task.quantity, null);
  const closureRequest = {
    request_id: "close-1",
    expected_version: assigned.version,
    kind: "restocked",
    note: "Operador confirma ejecución de prueba.",
  };
  const closed = observe(store, id, closureRequest);
  assert.equal(closed.case.status, "closed");
  assert.equal(closed.case.closure.visual_verification, false);
  assert.equal(closed.case.closure.modality, "local_human_confirmation");
  assert.equal(observe(store, id, closureRequest).duplicate, true);
  assert.throws(
    () =>
      observe(store, id, {
        kind: "no_stock",
        note: "Nuevo texto",
        shelf_issue_confirmed: true,
      }),
    (error) => error.status === 409,
  );
  assert.equal(
    store.listOutbox().filter((item) => item.intent === "report").length,
    2,
  );
  const old = store.listOutbox().find((item) => item.intent === "ask_review");
  assert.equal(old.status, "cancelled");
  assert.deepEqual(
    store.ingest(event({ event_id: "event-late", media_time_s: 22, duration_s: 20, confidence: 0.2 })).case,
    closed.case,
  );
});

test("no stock creates email query; no issue remains discarded rather than resolved", (t) => {
  const store = memory(t);
  const id = store.ingest(event()).case.id;
  const waiting = observe(store, id, {
    kind: "no_stock",
    note: "Fixture agotado, confirmado localmente.",
    shelf_issue_confirmed: true,
  }).case;
  assert.equal(waiting.status, "awaiting_delivery");
  assert.equal(waiting.inventory.source, "fixture");
  assert.equal(waiting.observations[0].shelf_issue_confirmed, true);
  const mail = store.listOutbox().find((item) => item.intent === "ask_eta");
  assert.equal(mail.channel, "email");
  assert.match(mail.text, /no es un pedido/);
  assert.throws(
    () => observe(store, id, { kind: "restocked", note: "Sin tarea" }),
    (error) => error.status === 409,
  );
  const discarded = observe(store, id, {
    kind: "no_issue",
    note: "Revisión sin incidencia.",
  }).case;
  assert.equal(discarded.status, "discarded");
  assert.equal(discarded.closure.outcome, "discarded");
});

test("default and unauthorized sends make zero network calls", async (t) => {
  const store = memory(t);
  store.ingest(event());
  const item = store.listOutbox()[0];
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    throw new Error("must not execute");
  };
  await assert.rejects(
    sendOutbox(store, item.id, { env: {}, fetchImpl }),
    (error) => error.status === 403,
  );
  await assert.rejects(
    sendOutbox(store, item.id, {
      env: { ...liveEnv, PANELA_ALLOWED_SLACK_CHANNELS: "C_OTHER" },
      fetchImpl,
    }),
    (error) => error.status === 403,
  );
  await assert.rejects(
    sendOutbox(store, item.id, {
      env: { PANELA_LIVE_SEND: "true" },
      fetchImpl,
    }),
    (error) => error.status === 409,
  );
  assert.equal(calls, 0);
  assert.equal(displayOutbox(item, {}).status, "pending_connection");
  assert.equal(
    displayOutbox(item, { ...liveEnv, PANELA_LIVE_SEND: "false" }).status,
    "send_disabled",
  );
});

test("a timeout remains unknown and cannot be blindly resent", async (t) => {
  const store = memory(t);
  store.ingest(event());
  const id = store.listOutbox()[0].id;
  let calls = 0;
  const fetchImpl = async () => {
    calls += 1;
    throw new Error("test timeout with secret that must not escape");
  };
  const result = await sendOutbox(store, id, { env: liveEnv, fetchImpl });
  assert.equal(result.status, "result_unknown");
  assert.doesNotMatch(result.error, /secret/);
  await assert.rejects(
    sendOutbox(store, id, { env: liveEnv, fetchImpl }),
    (error) => error.status === 409,
  );
  assert.equal(calls, 1);
});

test("concurrent dispatch claims one operation; API acceptance never becomes delivery", async (t) => {
  const store = memory(t);
  store.ingest(event());
  const id = store.listOutbox()[0].id;
  let resolveFetch;
  let calls = 0;
  const fetchImpl = () => {
    calls += 1;
    return new Promise((resolve) => {
      resolveFetch = resolve;
    });
  };
  const pending = sendOutbox(store, id, { env: liveEnv, fetchImpl });
  await assert.rejects(
    sendOutbox(store, id, { env: liveEnv, fetchImpl }),
    (error) => error.status === 409,
  );
  resolveFetch({ ok: true, json: async () => ({ ok: true, ts: "123.456" }) });
  const result = await pending;
  assert.equal(result.status, "provider_accepted");
  assert.equal(result.delivery_confirmed, false);
  assert.equal(
    (await sendOutbox(store, id, { env: liveEnv, fetchImpl })).provider_id,
    "123.456",
  );
  assert.equal(calls, 1);
});

test("Resend receives stable operation key and allowed recipient, never browser-supplied routing", async (t) => {
  const store = memory(t);
  const id = store.ingest(event()).case.id;
  observe(store, id, {
    kind: "no_stock",
    note: "Sin stock de prueba",
    shelf_issue_confirmed: true,
  });
  const mail = store.listOutbox().find((item) => item.channel === "email");
  let sent;
  await sendOutbox(store, mail.id, {
    env: liveEnv,
    fetchImpl: async (url, request) => {
      sent = { url, request };
      return { ok: true, json: async () => ({ id: "email_test" }) };
    },
  });
  assert.equal(sent.url, "https://api.resend.com/emails");
  assert.equal(sent.request.headers["Idempotency-Key"], mail.operation_key);
  assert.deepEqual(JSON.parse(sent.request.body).to, [
    "operator@example.invalid",
  ]);
});

test("Slack treats user-provided zone text as literal instead of broadcast mentions", async (t) => {
  const store = memory(t);
  store.ingest(event({ zone_name: "<!channel> & abarrotes" }));
  let text;
  await sendOutbox(store, store.listOutbox()[0].id, {
    env: liveEnv,
    fetchImpl: async (_url, request) => {
      text = JSON.parse(request.body).text;
      return { ok: true, json: async () => ({ ok: true, ts: "123.789" }) };
    },
  });
  assert.doesNotMatch(text, /<!channel>/);
  assert.match(text, /&lt;!channel&gt; &amp; abarrotes/);
});

test("a sending operation recovered after restart stays uncertain", () => {
  const dir = mkdtempSync(join(tmpdir(), "panela-restart-"));
  const filename = join(dir, "test.sqlite");
  let store = createStore({ filename });
  try {
    store.ingest(event());
    const id = store.listOutbox()[0].id;
    store.claimSend(id, "C_DEMO");
    store.close();
    store = createStore({ filename });
    assert.equal(store.getOutbox(id).status, "result_unknown");
    assert.throws(() => store.claimSend(id, "C_DEMO"), ApiError);
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("optional Responses proposal cannot change inventory or allowed intent", async (t) => {
  const store = memory(t);
  const item = store.ingest(event()).case;
  const env = {
    OPENAI_API_KEY: "test-key",
    OPENAI_MODEL: "explicit-test-model",
  };
  const decision = await coordinate(item, {
    env,
    fetchImpl: async (_url, request) => {
      const body = JSON.parse(request.body);
      assert.equal(body.model, "explicit-test-model");
      assert.equal(body.store, false);
      assert.deepEqual(body.tools[0].parameters.properties.intent.enum, [
        "ask_review",
      ]);
      return {
        ok: true,
        json: async () => ({
          output: [
            {
              type: "function_call",
              name: "propose_intent",
              arguments: '{"intent":"buy","reason":"injected"}',
            },
          ],
        }),
      };
    },
  });
  assert.equal(decision.mode, "rules");
  assert.equal(decision.fallback_from, "openai");
  assert.equal(store.getCase(item.id).inventory.status, "unknown");
  assert.equal(coordinatorMode({ OPENAI_API_KEY: "test-only-key" }), "rules");
});

test("HTTP contract exposes honest configuration and rejects cross-origin mutations", async (t) => {
  const store = memory(t);
  let calls = 0;
  const handler = createHandler({
    store,
    env: {},
    fetchImpl: async () => {
      calls += 1;
      throw new Error("network prohibited");
    },
  });
  const created = await call(handler, "POST", "/api/events", event());
  assert.equal(created.status, 201);
  const state = await call(handler, "GET", "/api/state");
  assert.equal(state.payload.cases.length, 1);
  assert.equal(state.payload.channels.slack.configured, false);
  assert.equal(state.payload.channels.email.inbound_supported, false);
  assert.equal(state.payload.coordinator.mode, "rules");
  assert.equal(state.payload.outbox[0].status, "pending_connection");
  assert.equal(publicChannels(liveEnv).slack.inbound_supported, false);
  const denied = await call(
    handler,
    "POST",
    "/api/events",
    event({ event_id: "bad-origin" }),
    { origin: "https://untrusted.invalid" },
  );
  assert.equal(denied.status, 403);
  const contentType = await call(handler, "POST", "/api/events", event(), {
    "content-type": "text/plain",
  });
  assert.equal(contentType.status, 415);
  assert.equal(store.listCases().length, 1);
  assert.equal(calls, 0);
});
