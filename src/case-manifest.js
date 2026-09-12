const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
const hasText = (value) => typeof value === "string" && value.trim().length > 0;
const object = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};
const array = (value) =>
  Array.isArray(value)
    ? value.filter((entry) => entry && typeof entry === "object")
    : [];
const number = (value) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;
const localKinds = new Set([
  "stock_confirmed",
  "no_stock",
  "restocked",
  "no_issue",
]);
const terminalStatuses = new Set(["closed", "discarded", "cancelled"]);

const statusLabels = {
  review_required: "Requiere revisión",
  assigned: "Reposición asignada",
  awaiting_delivery: "Espera información de entrega",
  closed: "Cierre humano",
  discarded: "Descartado",
  blocked: "Bloqueado",
  cancelled: "Cancelado",
};
const labelFrom = (labels, key, fallback) =>
  Object.hasOwn(labels, key) ? labels[key] : fallback;
export const statusLabel = (status) =>
  labelFrom(statusLabels, status, "Estado desconocido");

const entryLabels = {
  person_dwell_detected: "Permanencia detectada",
  shelf_alert_withheld: "Aviso a Slack retenido",
  stock_confirmed: "Incidencia y stock confirmados localmente",
  no_stock: "Incidencia confirmada localmente, sin stock",
  restocked: "Ejecución reportada localmente",
  no_issue: "Incidencia descartada localmente",
};
const intentLabels = {
  ask_review: "Consulta de revisión",
  assign_internal: "Aviso de tarea asignada",
  ask_eta: "Consulta de entrega",
  report: "Reporte del caso",
};

// Do not interpret a timestamp without an offset in the viewer's device timezone.
function instant(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  )
    return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}
const dateFormat = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const timeFormat = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
function wallTime(value) {
  const at = instant(value);
  if (at === null) return '<span class="time-unknown">Hora desconocida</span>';
  return `<time datetime="${escape(value)}">${escape(timeFormat.format(at))}<small>${escape(dateFormat.format(at))}</small></time>`;
}
function seconds(value) {
  return number(value) ? `${value.toFixed(1)} s` : "desconocido";
}
export function formatClipTime(value) {
  if (!number(value)) return "desconocido";
  const tenths = Math.round(value * 10);
  const minutes = Math.floor(tenths / 600);
  const remainder = ((tenths % 600) / 10).toFixed(1).padStart(4, "0");
  return `${String(minutes).padStart(2, "0")}:${remainder}`;
}

function mark(state = "pending", className = "mark") {
  const shape =
    state === "done"
      ? '<path d="M3 8l3 3 7-7"/>'
      : state === "cancelled"
        ? '<path d="M4 4l8 8M12 4l-8 8"/>'
        : '<rect x="3" y="3" width="10" height="10"/>';
  return `<svg viewBox="0 0 16 16" class="${className} ${state}" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${shape}</svg>`;
}
function lane(kind) {
  const choices = {
    slack: ["slack", "S", "Slack"],
    email: ["correo", "C", "Correo"],
    video: ["video", "V", "Evento de video"],
    local: ["local", "L", "Observación local, sin canal externo"],
    system: ["system", "Sys", "Sistema"],
    unknown: ["unknown", "?", "Canal desconocido"],
  };
  const [style, glyph, label] = choices[kind] || choices.unknown;
  return `<span class="lane lane-${style}" role="img" aria-label="${label}" title="${label}"><span aria-hidden="true">${glyph}</span></span>`;
}

function delivery(message) {
  // A delivery flag must accompany an actual provider operation, not a pending draft.
  const delivered =
    message.delivery_confirmed === true &&
    hasText(message.provider_id) &&
    ["provider_accepted", "delivered"].includes(message.status);
  if (delivered)
    return { label: "Entrega confirmada; lectura no acreditada", mark: "done" };
  const labels = {
    pending_connection: "Pendiente de conexión",
    ready: "Listo para enviar",
    send_disabled: "Envío deshabilitado",
    blocked_recipient: "Destinatario no autorizado",
    provider_accepted: "Aceptado por API; entrega no confirmada",
    sending: "En proceso de envío; resultado pendiente",
    failed: "Falló el envío",
    result_unknown: "Resultado desconocido; requiere reconciliación",
    cancelled: "Cancelado",
    delivered: "Entrega no acreditada en el registro",
  };
  return {
    label: labelFrom(labels, message.status, "Estado de entrega desconocido"),
    mark: message.status === "cancelled" ? "cancelled" : "pending",
  };
}

function renderSpine(item, timeline) {
  const source = object(item.source);
  const observations = array(item.observations);
  const localEntries = timeline.filter(
    (entry) => entry.source === "local_operator" && localKinds.has(entry.type),
  );
  const localObservations = observations.filter(
    (entry) => entry.source === "local_operator" && localKinds.has(entry.kind),
  );
  const detected =
    source.event_type === "person_dwell_detected" ||
    timeline.some((entry) => entry.type === "person_dwell_detected");
  const validated = localEntries.length > 0 || localObservations.length > 0;
  const assigned = hasText(item.task?.id);
  const reported =
    localEntries.some((entry) => entry.type === "restocked") ||
    localObservations.some((entry) => entry.kind === "restocked");
  // The current store has no independent proposal/approval or visual verification
  // records. A later status, task or human closure cannot stand in for those records.
  const stages = [
    ["detected", "Detectado", detected, "Evento registrado"],
    ["validation", "Validación", validated, "Observación local registrada"],
    ["proposal", "Propuesta", false, ""],
    ["approved", "Aprobado", false, ""],
    ["assigned", "Asignado", assigned, "Tarea registrada"],
    [
      "execution",
      "Ejecución reportada",
      reported,
      "Reporte local de ejecución",
    ],
    ["verified", "Verificado", false, ""],
  ];
  const current =
    item.status === "review_required" || item.status === "awaiting_delivery"
      ? "validation"
      : item.status === "assigned" && assigned
        ? "assigned"
        : null;
  return `<ol class="spine" aria-label="Etapas del caso, cada una según su evidencia">${stages
    .map(([id, label, exists, detail]) => {
      const description = exists ? detail : "Sin registro independiente";
      return `<li class="${exists ? "done" : "pending"}${current === id ? " current" : ""}" data-stage="${id}" data-evidence="${exists ? "recorded" : "missing"}"${current === id ? ' aria-current="step"' : ""} title="${label}: ${description}"><span class="spine-label">${label}</span><span class="sr-only">: ${description}</span></li>`;
    })
    .join("")}</ol>`;
}

function renderActualPath(item, timeline) {
  const states = {
    person_dwell_detected: ["review_required", "Revisión"],
    stock_confirmed: ["assigned", "Reposición asignada"],
    no_stock: ["awaiting_delivery", "Consulta de entrega"],
    restocked: ["closed", "Cierre humano"],
    no_issue: ["discarded", "Descartado"],
  };
  const entries = timeline
    .map((entry, index) => ({ ...entry, index }))
    .filter(
      (entry) =>
        states[entry.type] &&
        (entry.type === "person_dwell_detected" ||
          entry.source === "local_operator"),
    )
    .sort(
      (a, b) =>
        (instant(a.at) ?? Infinity) - (instant(b.at) ?? Infinity) ||
        a.index - b.index,
    );
  const history = [];
  for (const entry of entries) {
    const [state, label] = states[entry.type];
    if (history.at(-1)?.state !== state) history.push({ state, label });
  }
  if (!history.length)
    return '<p class="path-note">Historial de estados no disponible. Se muestra el estado conservado del caso.</p>';
  return `<ol class="state-path" aria-label="Recorrido registrado del caso">${history.map(({ state, label }, index) => `<li data-case-state="${state}"${index === history.length - 1 && state === item.status ? ' aria-current="step"' : ""}>${label}</li>`).join("")}</ol>`;
}

function renderProvenance(item) {
  const source = object(item.source);
  const inventory = object(item.inventory);
  const provenance =
    source.provenance === "browser_detection_event"
      ? "Evento del detector del navegador"
      : hasText(source.provenance)
        ? source.provenance
        : "Procedencia desconocida";
  const inventorySource =
    inventory.source === "fixture"
      ? "Inventario ficticio (fixture)"
      : hasText(inventory.source)
        ? `Fuente de inventario: ${inventory.source}`
        : "Fuente de inventario desconocida";
  const inventoryState = labelFrom(
    {
      unknown: "Stock desconocido",
      in_stock: "Stock disponible registrado",
      out_of_stock: "Ausencia de stock registrada",
    },
    inventory.status,
    "Stock desconocido",
  );
  const evidenceButton =
    hasText(source.source_id) && number(source.media_time_s)
      ? `<button class="quiet review-evidence" type="button" data-source="${escape(source.source_id)}" data-media-time="${escape(source.media_time_s)}">Revisar instante en el video</button>`
      : "";
  return `<div class="case-provenance">
    <p class="evidence-note">Detectado en el minuto <span class="mono">${formatClipTime(source.media_time_s)}</span> del clip (no es el reloj en vivo de arriba) · Permanencia registrada: <span class="mono">${seconds(source.duration_s)}</span>. La permanencia motiva una revisión; no demuestra faltante ni compra.</p>
    ${item.source_integrity === "opening_event_v1" ? "" : '<p class="evidence-note">Registro anterior al control de integridad: la duración pudo actualizarse después del evento inicial. No usar como evidencia temporal validada.</p>'}
    ${evidenceButton}
    <details class="evidence-details"><summary>Evidencia y procedencia</summary><dl>
      <dt>ID del caso</dt><dd class="mono">${escape(hasText(item.id) ? item.id : "ID desconocido")}</dd>
      <dt>Fuente</dt><dd class="mono">${escape(hasText(source.source_id) ? source.source_id : "Fuente desconocida")}</dd>
      <dt>Ejecución (run)</dt><dd class="mono">${escape(hasText(source.run_id) ? source.run_id : "Ejecución desconocida")}</dd>
      <dt>Procedencia</dt><dd>${escape(provenance)}</dd>
      <dt>Detector</dt><dd>${escape(hasText(source.detector) ? source.detector : "Detector desconocido")}</dd>
      <dt>Umbral de permanencia</dt><dd>${number(source.threshold_s) && source.threshold_s > 0 ? seconds(source.threshold_s) : "Umbral desconocido"}</dd>
      <dt>Puntaje del detector</dt><dd>${number(source.confidence) && source.confidence <= 1 ? `${Math.round(source.confidence * 100)}% (no es exactitud validada)` : "Puntaje desconocido"}</dd>
      <dt>Inventario</dt><dd>${escape(inventorySource)}. ${escape(inventoryState)}.</dd>
    </dl></details>
  </div>`;
}

function renderManifest(item, timeline, messages) {
  // observations already have matching timeline records. Appending them here
  // would fabricate a second event for each local action.
  const rows = [
    ...timeline.map((entry) => ({ kind: "timeline", entry, at: entry.at })),
    ...messages.map((entry) => ({
      kind: "message",
      entry,
      at: entry.created_at,
    })),
  ].map((row, index) => ({ ...row, index, time: instant(row.at) }));
  rows.sort(
    (a, b) => (a.time ?? Infinity) - (b.time ?? Infinity) || a.index - b.index,
  );
  const body = rows
    .map(({ kind, entry, at }) => {
      const isMessage = kind === "message";
      const origin = isMessage
        ? entry.channel === "slack" || entry.channel === "email"
          ? entry.channel
          : "unknown"
        : entry.type === "person_dwell_detected"
          ? "video"
          : entry.source === "local_operator"
            ? "local"
            : "system";
      const state = isMessage
        ? delivery(entry)
        : { label: "Registro conservado", mark: "done" };
      const label = isMessage
        ? labelFrom(intentLabels, entry.intent, "Mensaje")
        : labelFrom(entryLabels, entry.type, "Registro del sistema");
      const detail = isMessage ? entry.text : entry.detail;
      const attempted =
        (Number.isSafeInteger(entry.attempts) && entry.attempts > 0) ||
        [
          "sending",
          "provider_accepted",
          "delivered",
          "result_unknown",
          "failed",
        ].includes(entry.status);
      const detailHtml = isMessage
        ? `<details class="message-item"><summary>${attempted ? "Leer mensaje" : "Leer mensaje preparado"}</summary><p class="entry-detail">${escape(hasText(detail) ? detail : "Detalle no registrado")}</p></details>`
        : `<p class="entry-detail">${escape(hasText(detail) ? detail : "Detalle no registrado")}</p>`;
      const updated =
        isMessage &&
        instant(entry.updated_at) !== null &&
        entry.updated_at !== entry.created_at
          ? `<span class="entry-meta">Estado actualizado: ${wallTime(entry.updated_at)}</span>`
          : "";
      const provider =
        isMessage && hasText(entry.provider_id)
          ? `<span class="entry-meta">Referencia del proveedor: <span class="mono">${escape(entry.provider_id)}</span></span>`
          : "";
      const reason =
        isMessage && hasText(entry.error)
          ? `<span class="entry-meta entry-error">Motivo: ${escape(entry.error)}</span>`
          : "";
      const retry =
        isMessage &&
        entry.status === "failed" &&
        instant(entry.next_attempt_at) !== null
          ? `<span class="entry-meta">Reintento automático: ${wallTime(entry.next_attempt_at)}</span>`
          : isMessage && entry.status === "failed" && entry.auto_attempts > 0
            ? `<span class="entry-meta">Reintentos automáticos agotados; se reactivan al cambiar la configuración.</span>`
            : "";
      const send =
        isMessage && entry.can_send === true && hasText(entry.id)
          ? `<button class="quiet send-message" type="button" data-message="${escape(entry.id)}">${["failed", "result_unknown"].includes(entry.status) ? "Reintentar envío" : "Enviar ahora"}</button>`
          : "";
      return `<tr data-entry-kind="${kind}" data-entry-id="${escape(entry.id || "")}">
      <td class="col-lane">${lane(origin)}</td>
      <td class="col-time">${wallTime(at)}</td>
      <td class="col-entry"><strong>${escape(label)}</strong><span class="entry-state">${escape(state.label)}</span>${detailHtml}${updated}${provider}${reason}${retry}${send}</td>
      <td class="col-mark" aria-hidden="true">${mark(state.mark)}</td>
    </tr>`;
    })
    .join("");
  return `<table class="manifest"><caption>Registro cronológico · Hora local America/Bogota (UTC−05:00). Los mensajes muestran su estado actual; las horas desconocidas aparecen al final.</caption>
    <thead><tr><th scope="col" class="col-lane"><span class="sr-only">Origen</span></th><th scope="col" class="col-time">Hora</th><th scope="col" class="col-entry">Entrada</th><th scope="col" class="col-mark"><span class="sr-only">Marca de estado</span></th></tr></thead>
    <tbody>${body || '<tr><td colspan="4" class="manifest-empty">No hay entradas registradas para este caso.</td></tr>'}</tbody>
  </table>`;
}

function renderReports(item, messages) {
  const channels = [
    ["slack", "Slack"],
    ["email", "Correo"],
  ];
  const states = channels.map(([channel, label]) => {
    const reports = messages.filter(
      (entry) => entry.channel === channel && entry.intent === "report",
    );
    reports.sort(
      (a, b) =>
        (Number(b.case_version) || 0) - (Number(a.case_version) || 0) ||
        (instant(b.created_at) ?? -Infinity) -
          (instant(a.created_at) ?? -Infinity),
    );
    const state = reports.length
      ? delivery(reports[0])
      : { label: "No generado", mark: "pending" };
    return `<span class="report-channel ${state.mark === "done" ? "chan-ok" : "chan-pending"}" data-report-channel="${channel}">${mark(state.mark, "chan-icon")}<strong>${label}</strong>: ${escape(state.label)}</span>`;
  });
  const closureNote =
    item.status === "closed"
      ? "Cierre humano. Sin verificación visual posterior."
      : item.status === "discarded"
        ? "Caso descartado; no cuenta como reposición completada."
        : item.status === "cancelled"
          ? "Caso cancelado; no cuenta como reposición completada."
          : "El caso sigue abierto.";
  return `<footer class="case-foot"><div class="report-line"><strong>Reportes por canal</strong>${states.join("")}</div><p class="closure-note">${closureNote}</p></footer>`;
}

function renderObservation(item) {
  if (
    terminalStatuses.has(item.status) ||
    !["review_required", "assigned", "awaiting_delivery"].includes(
      item.status,
    ) ||
    !hasText(item.id) ||
    !Number.isSafeInteger(item.version) ||
    item.version < 1
  )
    return "";
  return `<details class="local-observation"><summary>Registrar observación local</summary>
    <p>Este control prueba el caso; no representa una respuesta recibida por Slack o correo.</p>
    <form data-case="${escape(item.id)}" data-version="${item.version}">
      <label>Resultado observado<select name="kind" required>
        <option value="stock_confirmed">Faltante confirmado; hay stock en bodega</option>
        <option value="no_stock">Faltante confirmado; no hay stock</option>
        ${item.status === "assigned" ? '<option value="restocked">Reposición realizada</option>' : ""}
        <option value="no_issue">No hay incidencia</option>
      </select></label>
      <label>Nota de verificación<textarea name="note" required minlength="3" maxlength="1000" placeholder="Describe qué se comprobó y dónde."></textarea></label>
      <button class="secondary" type="submit">Guardar observación local</button><span class="form-result" role="status"></span>
    </form>
  </details>`;
}

/** Render one case from persisted evidence, without turning pending work into results. */
export function renderCase(value, outbox = []) {
  const item = object(value);
  const timeline = array(item.timeline);
  const messages = array(outbox).filter(
    (message) => hasText(item.id) && message.case_id === item.id,
  );
  const title = hasText(item.title)
    ? item.title
    : hasText(item.zone_name)
      ? item.zone_name
      : "Revisión de sección";
  const displayId = hasText(item.id)
    ? `#${item.id.replace(/^case_/, "").slice(0, 8)}`
    : "ID desconocido";
  const terminal = terminalStatuses.has(item.status);
  const stamp =
    item.status === "discarded" || item.status === "cancelled"
      ? "cancelled"
      : "pending";
  return `<article class="case case-item" data-case-id="${escape(item.id || "")}" data-state="${escape(item.status || "unknown")}">
    <header class="case-head"><div class="case-subject"><h3><span class="case-number">${escape(displayId)}</span> ${escape(title)}</h3></div>
      <div class="case-status ${terminal ? "stamp-terminal" : "stamp-progreso"}">${mark(stamp, "stamp-icon")}<span>${escape(statusLabel(item.status))}${item.status === "closed" ? "<small>Sin verificación visual posterior</small>" : ""}</span></div>
    </header>
    ${renderActualPath(item, timeline)}
    ${renderProvenance(item)}
    <details class="vision-cycle"><summary>Ciclo objetivo del PVB</summary><p class="evidence-note">Modelo de siete etapas previsto. Las etapas sin registro no están demostradas por este caso; no representan el ciclo implementado completo.</p>${renderSpine(item, timeline)}</details>
    ${renderManifest(item, timeline, messages)}
    ${renderReports(item, messages)}
    ${renderObservation(item)}
  </article>`;
}
