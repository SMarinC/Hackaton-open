import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const hash = (value) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const terminal = new Set(["closed", "discarded"]);
const text = (value, name, max = 160) => {
  if (typeof value !== "string" || !value.trim() || value.length > max) {
    throw new ApiError(400, `${name} debe ser texto de 1 a ${max} caracteres.`);
  }
  return value.trim();
};
const numeric = (value, name, min, max) => {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < min ||
    value > max
  ) {
    throw new ApiError(400, `${name} está fuera de rango.`);
  }
  return value;
};
const polygon = (value) => {
  if (!Array.isArray(value) || value.length < 3 || value.length > 20) {
    throw new ApiError(
      400,
      "zone_polygon requiere entre 3 y 20 vértices normalizados.",
    );
  }
  return value.map((point) => {
    if (!Array.isArray(point) || point.length !== 2)
      throw new ApiError(400, "Cada vértice debe ser [x, y].");
    return [
      numeric(point[0], "zone_polygon.x", 0, 1),
      numeric(point[1], "zone_polygon.y", 0, 1),
    ];
  });
};

export function validateEvent(input) {
  if (!input || input.event_type !== "person_dwell_detected") {
    throw new ApiError(400, "Solo se admite person_dwell_detected.");
  }
  return {
    event_id: text(input.event_id, "event_id"),
    run_id: text(input.run_id, "run_id"),
    source_id: text(input.source_id, "source_id"),
    zone_id: text(input.zone_id, "zone_id"),
    zone_name: text(input.zone_name, "zone_name", 200),
    track_id: text(String(input.track_id ?? ""), "track_id"),
    visit_id:
      input.visit_id === undefined
        ? "legacy"
        : text(input.visit_id, "visit_id"),
    media_time_s: numeric(input.media_time_s, "media_time_s", 0, 86400),
    duration_s: numeric(input.duration_s, "duration_s", 0, 86400),
    confidence: numeric(input.confidence, "confidence", 0, 1),
    event_type: "person_dwell_detected",
    ...(input.detector === undefined
      ? {}
      : { detector: text(input.detector, "detector") }),
    ...(input.threshold_s === undefined
      ? {}
      : {
          threshold_s: numeric(
            input.threshold_s,
            "threshold_s",
            Number.MIN_VALUE,
            86400,
          ),
        }),
    ...(input.zone_polygon === undefined
      ? {}
      : { zone_polygon: polygon(input.zone_polygon) }),
  };
}

export function createStore({
  filename = resolve("data/private/panela.sqlite"),
  now = () => new Date().toISOString(),
  inventoryFixture = "unknown",
} = {}) {
  if (!["unknown", "in_stock", "out_of_stock"].includes(inventoryFixture)) {
    throw new Error(
      "PANELA_INVENTORY_FIXTURE debe ser unknown, in_stock u out_of_stock.",
    );
  }
  if (filename !== ":memory:")
    mkdirSync(dirname(filename), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(filename);
  if (filename !== ":memory:") chmodSync(filename, 0o600);
  db.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS cases (id TEXT PRIMARY KEY, episode_key TEXT NOT NULL UNIQUE, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS events (event_key TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, case_id TEXT NOT NULL REFERENCES cases(id), payload TEXT);
    CREATE TABLE IF NOT EXISTS observations (request_key TEXT PRIMARY KEY, case_id TEXT NOT NULL REFERENCES cases(id), fingerprint TEXT);
    CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY, operation_key TEXT NOT NULL UNIQUE, case_id TEXT NOT NULL REFERENCES cases(id), data TEXT NOT NULL);
  `);
  if (
    !db
      .prepare("PRAGMA table_info(events)")
      .all()
      .some((column) => column.name === "payload")
  ) {
    // Legacy fingerprints cannot reconstruct the original evidence. Leave payload NULL.
    db.exec("ALTER TABLE events ADD COLUMN payload TEXT");
  }
  if (
    !db
      .prepare("PRAGMA table_info(observations)")
      .all()
      .some((column) => column.name === "fingerprint")
  ) {
    db.exec("ALTER TABLE observations ADD COLUMN fingerprint TEXT");
  }
  const parse = (row) => (row ? JSON.parse(row.data) : null);
  const getCase = (id) =>
    parse(db.prepare("SELECT data FROM cases WHERE id = ?").get(id));
  const getOutbox = (id) =>
    parse(db.prepare("SELECT data FROM outbox WHERE id = ?").get(id));
  const saveCase = (item) =>
    db
      .prepare("UPDATE cases SET data = ? WHERE id = ?")
      .run(JSON.stringify(item), item.id);
  const saveOutbox = (item) =>
    db
      .prepare("UPDATE outbox SET data = ? WHERE id = ?")
      .run(JSON.stringify(item), item.id);
  const transaction = (fn) => {
    db.exec("BEGIN IMMEDIATE");
    try {
      const result = fn();
      db.exec("COMMIT");
      return result;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  };
  const timeline = (item, type, detail, source = "system") => {
    item.timeline.push({ id: randomUUID(), at: now(), type, detail, source });
  };
  const messageText = (item, intent) => {
    const title = `[DEMO Panela Stocks · ${item.id}] ${item.zone_name}`;
    const provenance = `Fuente de video: ${item.source.source_id}; ejecución ${item.source.run_id}; t=${item.source.media_time_s}s. Inventario de demostración, no POS real.`;
    const body = {
      ask_review: `Se observó permanencia en esta sección durante ${item.source.duration_s.toFixed(1)} s. Revisa la sección y confirma si hay alguna situación que atender. La permanencia no demuestra faltante, compra ni problema.`,
      assign_internal:
        "El operador local confirmó una incidencia de exhibición y stock disponible para la gestión de prueba. Tarea interna asignada: revisar y efectuar la reposición indicada por el responsable. No se ha inferido producto ni cantidad desde el video.",
      ask_eta:
        "El operador local confirmó una incidencia de exhibición y ausencia de stock en este caso de prueba. ¿Hay una entrega prevista? Indica fecha y cualquier impedimento. Esta consulta no es un pedido ni un compromiso de compra.",
      report: `Estado del caso: ${item.status}. ${item.status === "closed" ? "Cierre por confirmación del operador local; sin verificación visual posterior." : "Descartado por el operador local; no cuenta como reposición completada."} Nota: ${item.observations.at(-1)?.note ?? "Sin nota"}. Respuestas reales Slack/correo todavía no integradas.`,
    }[intent];
    return `${title}\n${body}\n${provenance}`;
  };
  const enqueue = (item, channel, intent) => {
    const operationKey = `${item.id}:${item.version}:${channel}:${intent}`;
    const queued = {
      id: `msg_${randomUUID()}`,
      operation_key: operationKey,
      case_id: item.id,
      case_version: item.version,
      channel,
      intent,
      text: messageText(item, intent),
      status: "pending_connection",
      created_at: now(),
      updated_at: now(),
      attempts: 0,
      recipient: null,
      provider_id: null,
      error: null,
      delivery_confirmed: false,
      policy_id: "demo-section-review-v1",
    };
    db.prepare("INSERT OR IGNORE INTO outbox VALUES (?, ?, ?, ?)").run(
      queued.id,
      operationKey,
      item.id,
      JSON.stringify(queued),
    );
    return queued;
  };
  const cancelObsolete = (item) => {
    for (const row of db
      .prepare("SELECT data FROM outbox WHERE case_id = ?")
      .all(item.id)) {
      const queued = parse(row);
      if (
        [
          "pending_connection",
          "ready",
          "send_disabled",
          "blocked_recipient",
          "failed",
        ].includes(queued.status)
      ) {
        queued.status = "cancelled";
        queued.updated_at = now();
        saveOutbox(queued);
      }
    }
  };

  // A process that died after dispatch cannot safely assume the provider rejected the request.
  for (const row of db.prepare("SELECT data FROM outbox").all()) {
    const item = parse(row);
    if (item.status === "sending") {
      item.status = "result_unknown";
      item.error = "Reinicio durante envío; requiere reconciliación.";
      item.updated_at = now();
      saveOutbox(item);
    }
  }

  return {
    close: () => db.close(),
    getCase,
    getOutbox,
    listCases: () =>
      db.prepare("SELECT data FROM cases ORDER BY rowid DESC").all().map(parse),
    listOutbox: () =>
      db
        .prepare("SELECT data FROM outbox ORDER BY rowid DESC")
        .all()
        .map(parse),
    ingest(input) {
      const event = validateEvent(input);
      return transaction(() => {
        const eventKey = hash([event.run_id, event.event_id]);
        // Keep existing legacy event fingerprints stable across this additive contract change.
        const { visit_id: visitId, ...legacyEvent } = event;
        const fingerprint = hash(visitId === "legacy" ? legacyEvent : event);
        const seen = db
          .prepare("SELECT * FROM events WHERE event_key = ?")
          .get(eventKey);
        if (seen) {
          if (seen.fingerprint !== fingerprint)
            throw new ApiError(
              409,
              "event_id reutilizado con contenido distinto.",
            );
          return { case: getCase(seen.case_id), duplicate: true };
        }
        const episodeIdentity = [
          event.run_id,
          event.source_id,
          event.zone_id,
          event.track_id,
          event.event_type,
        ];
        // The legacy bucket retains its original key; identified visits each get a separate case.
        if (visitId !== "legacy") episodeIdentity.push(visitId);
        const episodeKey = hash(episodeIdentity);
        let item = parse(
          db
            .prepare("SELECT data FROM cases WHERE episode_key = ?")
            .get(episodeKey),
        );
        const created = !item;
        if (!item) {
          item = {
            id: `case_${randomUUID()}`,
            status: "review_required",
            version: 1,
            zone_id: event.zone_id,
            zone_name: event.zone_name,
            source: {
              ...event,
              mode: "video_replay",
              provenance: "browser_detection_event",
            },
            source_integrity: "opening_event_v1",
            inventory: {
              status: inventoryFixture,
              source: "fixture",
              confirmed_by_operator: false,
            },
            title: `Revisar ${event.zone_name}`,
            created_at: now(),
            updated_at: now(),
            observations: [],
            timeline: [],
            task: null,
            closure: null,
            coordinator_decision: {
              mode: "rules",
              intent: "ask_review",
              reason: "La permanencia solo habilita una revisión de sección.",
            },
          };
          timeline(
            item,
            "person_dwell_detected",
            "Evento de permanencia recibido; no prueba falta de stock.",
          );
          db.prepare("INSERT INTO cases VALUES (?, ?, ?)").run(
            item.id,
            episodeKey,
            JSON.stringify(item),
          );
          enqueue(item, "slack", "ask_review");
        }
        // Each validated event retains its own evidence; the case source is its opening event.
        db.prepare(
          "INSERT INTO events (event_key, fingerprint, case_id, payload) VALUES (?, ?, ?, ?)",
        ).run(eventKey, fingerprint, item.id, JSON.stringify(event));
        return { case: item, duplicate: false, created };
      });
    },
    observe(id, input) {
      if (
        !["stock_confirmed", "no_stock", "restocked", "no_issue"].includes(
          input?.kind,
        )
      ) {
        throw new ApiError(400, "Tipo de observación inválido.");
      }
      const note = text(input.note, "note", 2000);
      const kind = input.kind;
      const requestId = text(input.request_id, "request_id");
      const expectedVersion = input.expected_version;
      if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 1) {
        throw new ApiError(
          400,
          "expected_version debe ser un entero positivo.",
        );
      }
      if (
        input.shelf_issue_confirmed !== undefined &&
        typeof input.shelf_issue_confirmed !== "boolean"
      ) {
        throw new ApiError(400, "shelf_issue_confirmed debe ser booleano.");
      }
      const needsShelfIssue = kind === "stock_confirmed" || kind === "no_stock";
      if (needsShelfIssue && input.shelf_issue_confirmed !== true) {
        throw new ApiError(
          400,
          "Confirma explícitamente la incidencia de exhibición con shelf_issue_confirmed=true; el stock por sí solo no habilita una acción.",
        );
      }
      return transaction(() => {
        const item = getCase(id);
        if (!item) throw new ApiError(404, "Caso no encontrado.");
        const requestKey = hash([id, requestId]);
        const fingerprint = hash({
          kind,
          note,
          expected_version: expectedVersion,
          shelf_issue_confirmed: input.shelf_issue_confirmed ?? null,
        });
        const seen = db
          .prepare("SELECT fingerprint FROM observations WHERE request_key = ?")
          .get(requestKey);
        if (seen) {
          if (seen.fingerprint !== fingerprint)
            throw new ApiError(
              409,
              "request_id reutilizado con contenido distinto.",
            );
          return { case: item, duplicate: true };
        }
        if (item.version !== expectedVersion)
          throw new ApiError(
            409,
            "La versión del caso cambió; actualiza el estado antes de registrar otra observación.",
          );
        if (terminal.has(item.status))
          throw new ApiError(
            409,
            "Un caso terminal no admite nuevas acciones.",
          );
        if (kind === "restocked" && item.status !== "assigned")
          throw new ApiError(
            409,
            "Solo puede confirmarse reposición de una tarea asignada.",
          );
        if (kind === "stock_confirmed" && item.status === "assigned")
          throw new ApiError(409, "La tarea ya está asignada.");
        if (kind === "no_stock" && item.status === "awaiting_delivery")
          throw new ApiError(409, "El caso ya espera información de entrega.");
        cancelObsolete(item);
        item.version += 1;
        item.updated_at = now();
        item.observations.push({
          id: randomUUID(),
          request_id: requestId,
          expected_version: expectedVersion,
          kind,
          note,
          at: now(),
          source: "local_operator",
          channel: "local",
          verified_identity: false,
          ...(needsShelfIssue ? { shelf_issue_confirmed: true } : {}),
        });
        timeline(item, kind, note, "local_operator");
        if (kind === "stock_confirmed") {
          item.inventory = {
            status: "in_stock",
            source: "fixture",
            confirmed_by_operator: true,
            note,
          };
          item.status = "assigned";
          item.task = {
            id: `task_${randomUUID()}`,
            status: "assigned",
            kind: "internal_replenishment_demo",
            quantity: null,
            sku: null,
            created_at: now(),
          };
          item.coordinator_decision = {
            mode: "rules",
            intent: "assign_internal",
            reason:
              "Incidencia de exhibición y stock confirmados localmente; cantidad y producto no inferidos.",
          };
          enqueue(item, "slack", "assign_internal");
        } else if (kind === "no_stock") {
          item.inventory = {
            status: "out_of_stock",
            source: "fixture",
            confirmed_by_operator: true,
            note,
          };
          item.status = "awaiting_delivery";
          if (item.task) item.task.status = "blocked_no_stock";
          item.coordinator_decision = {
            mode: "rules",
            intent: "ask_eta",
            reason:
              "Incidencia de exhibición y ausencia de stock confirmadas por el operador; consultar fecha, no comprar.",
          };
          enqueue(item, "email", "ask_eta");
        } else {
          item.status = kind === "restocked" ? "closed" : "discarded";
          if (item.task)
            item.task.status =
              kind === "restocked" ? "reported_complete" : "cancelled";
          item.closure = {
            at: now(),
            modality: "local_human_confirmation",
            note,
            outcome: item.status,
            visual_verification: false,
          };
          item.coordinator_decision = {
            mode: "rules",
            intent: "report",
            reason:
              "Reporte de estado registrado; cierre y descarte separados.",
          };
          enqueue(item, "slack", "report");
          enqueue(item, "email", "report");
        }
        saveCase(item);
        db.prepare(
          "INSERT INTO observations (request_key, case_id, fingerprint) VALUES (?, ?, ?)",
        ).run(requestKey, item.id, fingerprint);
        return { case: item, duplicate: false };
      });
    },
    annotateDecision(id, version, decision) {
      return transaction(() => {
        const item = getCase(id);
        if (!item || item.version !== version) return item;
        item.coordinator_decision = decision;
        saveCase(item);
        return item;
      });
    },
    claimSend(id, recipient) {
      return transaction(() => {
        const item = getOutbox(id);
        if (!item) throw new ApiError(404, "Mensaje no encontrado.");
        if (item.status === "provider_accepted")
          return { item, alreadySent: true };
        if (
          ![
            "pending_connection",
            "ready",
            "send_disabled",
            "blocked_recipient",
          ].includes(item.status)
        ) {
          throw new ApiError(
            409,
            "Mensaje no enviable; no se reintenta un resultado incierto.",
          );
        }
        const parent = getCase(item.case_id);
        if (!parent || parent.version !== item.case_version)
          throw new ApiError(
            409,
            "Mensaje obsoleto para esta versión del caso.",
          );
        item.status = "sending";
        item.recipient = recipient;
        item.attempts += 1;
        item.updated_at = now();
        saveOutbox(item);
        return { item, alreadySent: false };
      });
    },
    finishSend(id, result) {
      return transaction(() => {
        const item = getOutbox(id);
        if (!item) throw new ApiError(404, "Mensaje no encontrado.");
        Object.assign(item, result, {
          updated_at: now(),
          delivery_confirmed: false,
        });
        saveOutbox(item);
        return item;
      });
    },
  };
}
