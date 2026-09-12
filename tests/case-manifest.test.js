import test from "node:test";
import assert from "node:assert/strict";
import { renderCase, statusLabel } from "../src/case-manifest.js";
import { createStore } from "../server/store.js";

const source = {
  event_id: "event-fixture",
  run_id: "run-fixture",
  source_id: "source-fixture",
  zone_id: "zone-fixture",
  zone_name: "Sección de prueba",
  track_id: "track-1",
  visit_id: "track-1:visit-1",
  event_type: "person_dwell_detected",
  media_time_s: 10,
  duration_s: 8,
  confidence: 0.9,
  detector: "fixture-detector",
  threshold_s: 8,
};
const base = (overrides = {}) => ({
  id: "case-real-id",
  title: "Revisar sección de prueba",
  status: "review_required",
  version: 1,
  source,
  timeline: [],
  observations: [],
  ...overrides,
});
const message = (overrides = {}) => ({
  id: "message-slack",
  case_id: "case-real-id",
  channel: "slack",
  intent: "ask_review",
  status: "pending_connection",
  created_at: "2026-09-12T16:00:00Z",
  text: "Consulta preparada",
  delivery_confirmed: false,
  ...overrides,
});
const stage = (html, name) =>
  html.match(new RegExp(`<li[^>]*data-stage="${name}"[^>]*>`))?.[0];
const footer = (html) =>
  html.match(/<footer class="case-foot">[\s\S]*?<\/footer>/)?.[0];

test("a real store human closure does not fabricate proposal, approval or visual verification stages", (t) => {
  const store = createStore({
    filename: ":memory:",
    now: () => "2026-09-12T16:00:00Z",
  });
  t.after(() => store.close());
  const initial = store.ingest(source).case;
  const assigned = store.observe(initial.id, {
    request_id: "stock-observation",
    expected_version: initial.version,
    kind: "stock_confirmed",
    shelf_issue_confirmed: true,
    note: "Fixture: incidencia y stock comprobados localmente.",
  }).case;
  const closed = store.observe(initial.id, {
    request_id: "execution-observation",
    expected_version: assigned.version,
    kind: "restocked",
    note: "Fixture: ejecución informada por el operador local.",
  }).case;
  const html = renderCase(closed, store.listOutbox());
  assert.equal((html.match(/data-stage=/g) || []).length, 7);
  for (const name of ["detected", "validation", "assigned", "execution"])
    assert.match(stage(html, name), /data-evidence="recorded"/);
  for (const name of ["proposal", "approved", "verified"]) {
    assert.match(stage(html, name), /data-evidence="missing"/);
    assert.doesNotMatch(stage(html, name), /class="done/);
  }
  assert.match(html, /Cierre humano/);
  assert.match(html, /Sin verificación visual posterior/);
  assert.doesNotMatch(html, /<form/);
  assert.match(footer(html), /Slack<\/strong>: Pendiente de conexión/);
  assert.match(footer(html), /Correo<\/strong>: Pendiente de conexión/);
  assert.doesNotMatch(footer(html), /Reporte enviado|chan-ok/);
});

test("later status alone does not fill earlier evidence gaps", () => {
  const html = renderCase(base({ status: "closed", source: {}, task: null }));
  for (const name of [
    "detected",
    "validation",
    "proposal",
    "approved",
    "assigned",
    "execution",
    "verified",
  ]) {
    assert.match(stage(html, name), /data-evidence="missing"/);
  }
  const pending = renderCase(base());
  assert.match(stage(pending, "validation"), /class="pending current"/);
  assert.match(stage(pending, "validation"), /aria-current="step"/);
});

test("timeline and messages share chronology; local observations are not appended twice", () => {
  const local = {
    id: "local-row",
    type: "stock_confirmed",
    source: "local_operator",
    at: "2026-09-12T16:02:00Z",
    detail: "Nota local única",
  };
  const timeline = [
    local,
    {
      id: "unknown-row",
      type: "diagnostic",
      source: "system",
      detail: "Sin hora",
    },
    {
      id: "video-row",
      type: "person_dwell_detected",
      source: "system",
      at: "2026-09-12T16:00:00Z",
      detail: "Evento de video",
    },
  ];
  const outbox = [
    message({
      id: "mail-row",
      channel: "email",
      created_at: "2026-09-12T16:03:00Z",
    }),
    message({
      id: "slack-row",
      created_at: "2026-09-12T16:01:00Z",
      updated_at: "2026-09-12T16:05:00Z",
    }),
  ];
  const before = structuredClone({ timeline, outbox });
  const html = renderCase(
    base({
      timeline,
      observations: [
        {
          kind: "stock_confirmed",
          source: "local_operator",
          note: local.detail,
          at: local.at,
        },
      ],
    }),
    outbox,
  );
  const order = [...html.matchAll(/data-entry-id="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.deepEqual(order, [
    "video-row",
    "slack-row",
    "local-row",
    "mail-row",
    "unknown-row",
  ]);
  assert.equal((html.match(/Nota local única/g) || []).length, 1);
  assert.equal((html.match(/<table class="manifest">/g) || []).length, 1);
  assert.match(html, /Estado actualizado:/);
  assert.deepEqual({ timeline, outbox }, before);
});

test("only real message rows use Slack or email lanes", () => {
  const html = renderCase(
    base({
      timeline: [
        { id: "v", type: "person_dwell_detected", source: "system" },
        { id: "l", type: "no_issue", source: "local_operator" },
        { id: "s", type: "internal", source: "system" },
      ],
    }),
    [message(), message({ id: "email", channel: "email" })],
  );
  for (const name of ["slack", "correo", "video", "local", "system"]) {
    assert.equal(
      (html.match(new RegExp(`class="lane lane-${name}"`, "g")) || []).length,
      1,
    );
  }
  assert.match(html, /aria-label="Observación local, sin canal externo"/);
  assert.match(html, /aria-label="Evento de video"/);
  assert.match(html, /aria-label="Sistema"/);
  assert.match(
    html,
    /<th scope="col" class="col-lane"><span class="sr-only">Origen<\/span><\/th>/,
  );
});

test("Bogota wall-clock dates are explicit and distinct from clip time", () => {
  const html = renderCase(
    base({
      source: { ...source, media_time_s: 5 },
      timeline: [
        {
          id: "date-rollover",
          type: "person_dwell_detected",
          at: "2026-09-12T00:05:00Z",
        },
        { id: "no-offset", type: "internal", at: "2026-09-12T16:00:00" },
      ],
    }),
  );
  assert.match(html, /America\/Bogota/);
  assert.match(html, /19:05:00/);
  assert.match(html, /11\/09\/2026/);
  assert.match(html, /Detectado en el minuto <span class="mono">00:05\.0<\/span>/);
  assert.match(html, /Hora desconocida/);
  assert.doesNotMatch(html, /1970|datetime="2026-09-12T16:00:00"/);
});

test("missing provenance stays unknown instead of inventing a detector, run or threshold", () => {
  const html = renderCase(base({ source: {}, inventory: {} }));
  for (const label of [
    "Fuente desconocida",
    "Ejecución desconocida",
    "Procedencia desconocida",
    "Detector desconocido",
    "Umbral desconocido",
    "Stock desconocido",
  ]) {
    assert.ok(html.includes(label));
  }
  assert.doesNotMatch(html, /coco-ssd|8\.0 s|Aceite vegetal|Panela redonda/);
  const fixture = renderCase(
    base({ inventory: { source: "fixture", status: "unknown" } }),
  );
  assert.match(fixture, /Inventario ficticio \(fixture\)/);
  assert.match(fixture, /fixture-detector/);
  assert.match(fixture, /run-fixture/);
  assert.match(fixture, /source-fixture/);
});

test("all persisted text and attributes are escaped; no message from another case leaks", () => {
  const payload = '<img src=x onerror="alert(1)"><script>bad()</script>&\'';
  const id = 'case-" autofocus onfocus="bad()';
  const html = renderCase(
    base({
      id,
      title: payload,
      source: {
        ...source,
        source_id: payload,
        run_id: payload,
        detector: payload,
      },
      timeline: [{ id: payload, type: "diagnostic", detail: payload }],
    }),
    [
      message({ case_id: id, text: payload }),
      message({ case_id: "other-case", text: "PRIVATE OTHER CASE" }),
    ],
  );
  assert.doesNotMatch(html, /<img|<script>|PRIVATE OTHER CASE/);
  assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
  assert.match(
    html,
    /data-case-id="case-&quot; autofocus onfocus=&quot;bad\(\)"/,
  );
  assert.match(html, /class="case-number">#case-&quot;/);
});

test("report footer uses actual report messages and never treats API acceptance as delivery", () => {
  const html = renderCase(base({ status: "closed" }), [
    message({
      id: "report-slack",
      intent: "report",
      status: "pending_connection",
    }),
    message({
      id: "report-mail",
      channel: "email",
      intent: "report",
      status: "provider_accepted",
      provider_id: "provider-123",
    }),
    message({
      case_id: "other-case",
      intent: "report",
      channel: "slack",
      status: "delivered",
      delivery_confirmed: true,
      provider_id: "other",
    }),
  ]);
  assert.match(footer(html), /Slack<\/strong>: Pendiente de conexión/);
  assert.match(
    footer(html),
    /Correo<\/strong>: Aceptado por API; entrega no confirmada/,
  );
  assert.doesNotMatch(footer(html), /chan-ok|Reporte enviado/);
  const noReports = renderCase(base(), [
    message({ status: "provider_accepted", provider_id: "provider" }),
  ]);
  assert.equal((footer(noReports).match(/No generado/g) || []).length, 2);
});

test("latest report version controls each footer channel; an impossible delivery flag cannot complete a pending message", () => {
  const html = renderCase(base(), [
    message({
      id: "old",
      intent: "report",
      case_version: 1,
      status: "provider_accepted",
      provider_id: "old-provider",
      delivery_confirmed: true,
    }),
    message({
      id: "new",
      intent: "report",
      case_version: 3,
      status: "pending_connection",
      provider_id: "invalid-pending-id",
      delivery_confirmed: true,
    }),
  ]);
  assert.match(footer(html), /Slack<\/strong>: Pendiente de conexión/);
  assert.doesNotMatch(footer(html), /chan-ok/);
});

test("discarded is not a replenishment success and terminal cases have no observation form", () => {
  const html = renderCase(base({ status: "discarded" }));
  assert.equal(statusLabel("discarded"), "Descartado");
  assert.match(html, /no cuenta como reposición completada/);
  assert.doesNotMatch(html, /<form|class="local-observation"/);
  assert.match(html, /class="stamp-icon cancelled"/);
  assert.equal(statusLabel("unexpected"), "Estado desconocido");
  assert.equal(statusLabel("toString"), "Estado desconocido");
});

test("local observation form preserves the submit handler contract and restocked is offered only when assigned", () => {
  const html = renderCase(
    base({ status: "assigned", version: 4, task: { id: "task-real" } }),
  );
  assert.match(html, /<details class="local-observation">/);
  assert.match(html, /<form data-case="case-real-id" data-version="4">/);
  assert.match(html, /<select name="kind" required>/);
  for (const kind of ["stock_confirmed", "no_stock", "restocked", "no_issue"])
    assert.ok(html.includes(`value="${kind}"`));
  assert.match(
    html,
    /<textarea name="note" required minlength="3" maxlength="1000"/,
  );
  assert.match(html, /<button class="secondary" type="submit">/);
  assert.match(html, /<span class="form-result" role="status"><\/span>/);
  assert.doesNotMatch(renderCase(base()), /value="restocked"/);
  assert.doesNotMatch(renderCase(base({ version: undefined })), /<form/);
});

test("video review button carries escaped provenance and is absent without a valid source instant", () => {
  const html = renderCase(
    base({
      source: { ...source, source_id: 'clip-"quoted"', media_time_s: 0 },
    }),
  );
  assert.match(
    html,
    /<button class="quiet review-evidence" type="button" data-source="clip-&quot;quoted&quot;" data-media-time="0">Revisar instante en el video<\/button>/,
  );
  for (const invalid of [
    {},
    { source_id: "clip", media_time_s: NaN },
    { source_id: "clip", media_time_s: -1 },
    { source_id: "", media_time_s: 10 },
  ]) {
    assert.doesNotMatch(
      renderCase(base({ source: invalid })),
      /class="quiet review-evidence"/,
    );
  }
});

test("compact manifest keeps status readable, discloses message bodies and retains the full real case ID", () => {
  const id = "case_abc12345-full-persisted-id";
  const html = renderCase(base({ id }), [
    message({ id: "prepared", case_id: id, text: "Prepared body" }),
    message({
      id: "attempted",
      case_id: id,
      status: "provider_accepted",
      provider_id: "provider-id",
      text: "Attempted body",
    }),
  ]);
  assert.match(html, /<h3><span class="case-number">#abc12345<\/span>/);
  assert.match(
    html,
    /<dt>ID del caso<\/dt><dd class="mono">case_abc12345-full-persisted-id<\/dd>/,
  );
  assert.match(
    html,
    /<details class="message-item"><summary>Leer mensaje preparado<\/summary><p class="entry-detail">Prepared body<\/p><\/details>/,
  );
  assert.match(
    html,
    /<details class="message-item"><summary>Leer mensaje<\/summary><p class="entry-detail">Attempted body<\/p><\/details>/,
  );
  for (const match of html.matchAll(
    /<td class="col-mark"[^>]*>([\s\S]*?)<\/td>/g,
  )) {
    assert.doesNotMatch(match[1], /entry-state|Pendiente|Aceptado/);
    assert.match(match[1], /^<svg[\s\S]*<\/svg>$/);
  }
  assert.match(
    html,
    /<td class="col-entry"><strong>Consulta de revisión<\/strong><span class="entry-state">Pendiente de conexión<\/span>/,
  );
});

test("real state path uses recorded transitions and does not invent a task in the no-stock branch", (t) => {
  const store = createStore({
    filename: ":memory:",
    now: () => "2026-09-12T16:00:00Z",
  });
  t.after(() => store.close());
  const item = store.ingest(source).case;
  const pending = store.observe(item.id, {
    request_id: "no-stock-path",
    expected_version: item.version,
    kind: "no_stock",
    shelf_issue_confirmed: true,
    note: "Fixture: no hay stock.",
  }).case;
  assert.equal(pending.task, null);
  const html = renderCase(pending, store.listOutbox());
  const path = html.match(/<ol class="state-path"[\s\S]*?<\/ol>/)[0];
  assert.deepEqual(
    [...path.matchAll(/data-case-state="([^"]+)"/g)].map((m) => m[1]),
    ["review_required", "awaiting_delivery"],
  );
  assert.doesNotMatch(path, /assigned|closed|verified/);
  assert.match(
    html,
    /<details class="vision-cycle"><summary>Ciclo objetivo del PVB/,
  );
});

test("real state path preserves a return from supplier query to assigned before closure", (t) => {
  const store = createStore({
    filename: ":memory:",
    now: () => "2026-09-12T16:00:00Z",
  });
  t.after(() => store.close());
  let item = store.ingest(source).case;
  for (const [index, kind] of [
    "stock_confirmed",
    "no_stock",
    "stock_confirmed",
    "restocked",
  ].entries()) {
    item = store.observe(item.id, {
      request_id: `path-${index}`,
      expected_version: item.version,
      kind,
      shelf_issue_confirmed: true,
      note: "Fixture de transición local.",
    }).case;
  }
  const html = renderCase(item, store.listOutbox());
  const path = html.match(/<ol class="state-path"[\s\S]*?<\/ol>/)[0];
  assert.deepEqual(
    [...path.matchAll(/data-case-state="([^"]+)"/g)].map((m) => m[1]),
    ["review_required", "assigned", "awaiting_delivery", "assigned", "closed"],
  );
  assert.match(path, /data-case-state="closed" aria-current="step"/);
});


test("legacy evidence is disclosed without treating source integrity as detector accuracy", () => {
  const legacy = renderCase(base());
  assert.match(legacy, /Registro anterior al control de integridad/);
  assert.match(legacy, /No usar como evidencia temporal validada/);
  const current = renderCase(base({ source_integrity: "opening_event_v1" }));
  assert.doesNotMatch(current, /Registro anterior al control de integridad/);
  assert.match(current, /no es exactitud validada/);
  assert.match(current, /Permanencia registrada/);
});

test("only server-approved messages get an escaped send or retry control, with the provider reason", () => {
  const html = renderCase(base(), [
    message({ id: 'm"1', can_send: true, status: "ready" }),
    message({
      id: "m2",
      can_send: true,
      status: "failed",
      error: "Slack rechazó el envío (not_in_channel); no se entregó.",
      created_at: "2026-09-12T16:05:00Z",
    }),
    message({
      id: "m3",
      can_send: false,
      status: "result_unknown",
      created_at: "2026-09-12T16:06:00Z",
    }),
    message({ id: "m4", status: "ready", created_at: "2026-09-12T16:07:00Z" }),
  ]);
  assert.equal((html.match(/class="quiet send-message"/g) || []).length, 2);
  assert.match(html, /data-message="m&quot;1">Enviar ahora</);
  assert.match(html, /data-message="m2">Reintentar envío</);
  assert.doesNotMatch(html, /data-message="m3"|data-message="m4"/);
  assert.match(html, /Motivo: Slack rechazó el envío \(not_in_channel\)/);
});
