import "./style.css";
import { ZoneTracker } from "./tracker.js";
import { VideoAnalyzer } from "./vision.js";

const $ = (id) => document.getElementById(id);
const video = $("video");
const ctx = $("overlay").getContext("2d");
const colors = ["#9fe2c3", "#f3bf85", "#a9c8fa"];
let zones = [
  {
    id: "checkout",
    name: "Caja y atención",
    polygon: [
      [0, 0.08],
      [0.27, 0.08],
      [0.31, 0.85],
      [0, 0.85],
    ],
  },
  {
    id: "display",
    name: "Pasillo de exhibición",
    polygon: [
      [0.29, 0.02],
      [1, 0.02],
      [1, 0.6],
      [0.59, 0.66],
      [0.34, 0.43],
    ],
  },
  {
    id: "entrance",
    name: "Entrada y circulación",
    polygon: [
      [0.34, 0.48],
      [0.57, 0.68],
      [1, 0.64],
      [1, 1],
      [0.32, 1],
    ],
  },
];
let tracker = new ZoneTracker({ zones, dwellThreshold: 8 });
let runId = crypto.randomUUID();
let sourceId = "hdcctv-retail-2017";
let manifest;
let localUrl;
let analyzing = false;
let latest = { tracks: [], zoneStats: [] };
let events = [];
let caseState = { cases: [], outbox: [] };
let stateFingerprint = "";
const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        s
      ],
  );
const clock = (t) =>
  `${String(Math.floor((t || 0) / 60)).padStart(2, "0")}:${String(Math.floor((t || 0) % 60)).padStart(2, "0")}`;
function error(message) {
  $("global-error").textContent = message;
  $("global-error").hidden = !message;
}
async function api(path, body) {
  const result = await fetch(`/api${path}`, {
    ...(body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
  const data = await result.json();
  if (!result.ok) throw new Error(data.error || `Error ${result.status}`);
  return data;
}
function resetTracking(reason) {
  analyzer.reset();
  tracker.reset();
  runId = crypto.randomUUID();
  latest = { tracks: [], zoneStats: [] };
  renderObservations();
  draw();
  if (reason) $("model-status").textContent = reason;
}
const analyzer = new VideoAnalyzer(video, {
  onStatus: (status) => {
    $("model-status").textContent = status;
  },
  onError: (err) => {
    analyzing = false;
    video.pause();
    $("analyze").textContent = "↻ Reintentar análisis";
    error(
      `No se pudo analizar el video. Comprueba la conexión o abre un archivo local. ${err.message}`,
    );
  },
  onFrame: ({ mediaTime, inferenceMs, detections }) => {
    latest = tracker.update(detections, mediaTime);
    if (latest.reset) runId = crypto.randomUUID();
    $("inference-time").textContent = `${Math.round(inferenceMs)} ms`;
    $("model-status").textContent = video.paused
      ? "Pausado · no se acumula permanencia"
      : "Analizando · COCO-SSD local";
    for (const event of latest.events) {
      const record = {
        ...event,
        event_id: crypto.randomUUID(),
        run_id: runId,
        source_id: sourceId,
        observed_at: new Date().toISOString(),
        detector: "coco-ssd-lite_mobilenet_v2",
        threshold_s: tracker.dwellThreshold,
        zone_polygon: zones
          .find((z) => z.id === event.zone_id)
          ?.polygon.map((p) => [...p]),
        status: "pending",
      };
      events.unshift(record);
      deliverEvent(record);
    }
    renderObservations();
    renderEvents();
    draw();
  },
});
async function deliverEvent(event) {
  try {
    await api("/events", event);
    event.status = "saved";
    await refreshState();
  } catch (err) {
    event.status = "failed";
    event.failure = err.message;
  }
  renderEvents();
}
function renderObservations() {
  $("people-count").textContent = analyzing ? latest.tracks.length : "—";
  $("max-dwell").textContent = analyzing
    ? `${Math.max(0, ...latest.tracks.map((t) => t.dwell)).toFixed(1)} s`
    : "—";
  const threshold = tracker.dwellThreshold;
  $("zones").innerHTML = zones
    .map((zone, i) => {
      const stat = latest.zoneStats.find((s) => s.id === zone.id);
      return `<div class="zone-row"><div class="zone-row-name"><span class="zone-dot" style="--zone-color:${colors[i % colors.length]}"></span>${escapeHtml(zone.name)}</div><div class="zone-meter"><span style="width:${Math.min(100, ((stat?.maxDwell || 0) / threshold) * 100)}%"></span></div><strong>${stat?.count || 0} detectadas · ${(stat?.maxDwell || 0).toFixed(1)} s</strong></div>`;
    })
    .join("");
}
function draw() {
  const canvas = $("overlay");
  const w = (canvas.width = video.videoWidth || 1270);
  const h = (canvas.height = video.videoHeight || 720);
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = Math.max(2, w / 520);
  zones.forEach((zone, i) => {
    ctx.beginPath();
    zone.polygon.forEach(([x, y], index) =>
      index ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h),
    );
    ctx.closePath();
    ctx.strokeStyle = colors[i % colors.length];
    ctx.setLineDash([8, 7]);
    ctx.stroke();
    ctx.fillStyle = `${colors[i % colors.length]}0d`;
    ctx.fill();
    ctx.setLineDash([]);
  });
  latest.tracks.forEach((track) => {
    const index = zones.findIndex((z) => z.id === track.zoneId);
    const color = colors[Math.max(0, index) % colors.length];
    const [x, y, bw, bh] = track.bbox;
    ctx.strokeStyle = color;
    ctx.strokeRect(x * w, y * h, bw * w, bh * h);
    if (track.trail?.length) {
      ctx.beginPath();
      track.trail.forEach(([px, py], i) =>
        i ? ctx.lineTo(px * w, py * h) : ctx.moveTo(px * w, py * h),
      );
      ctx.stroke();
    }
    const label = `${track.id.replace("track-", "T")}  ·  ${track.dwell.toFixed(1)} s`;
    ctx.font = `600 ${Math.max(13, w / 70)}px system-ui`;
    const textWidth = ctx.measureText(label).width + 14;
    const tx = Math.max(0, Math.min(w - textWidth, x * w));
    const ty = Math.max(24, y * h);
    ctx.fillStyle = color;
    ctx.fillRect(tx, ty - 25, textWidth, 25);
    ctx.fillStyle = "#24302a";
    ctx.fillText(label, tx + 7, ty - 7);
  });
}
function renderEvents() {
  $("event-count").textContent = `${events.length} eventos en esta sesión`;
  if (!events.length) return;
  $("events").innerHTML = events
    .slice(0, 100)
    .map(
      (event) =>
        `<div class="event-row"><time class="mono">${clock(event.media_time_s)}</time><div><strong>${escapeHtml(event.zone_name)}</strong><br><small>${escapeHtml(event.track_id)} · ${event.duration_s.toFixed(1)} s observados</small></div><small>Permanencia → revisar sección<br>Score detector ${Math.round(event.confidence * 100)}%</small><span class="event-state ${event.status === "failed" ? "failed" : ""}">${event.status === "saved" ? "Caso registrado" : event.status === "failed" ? "No guardado" : "Guardando…"}${event.status === "failed" ? ` <button class="quiet retry-event" data-event="${event.event_id}">Reintentar</button>` : ""}</span></div>`,
    )
    .join("");
}
const statusLabels = {
  review_required: "Requiere revisión",
  assigned: "Reposición asignada",
  awaiting_delivery: "Consulta a proveedor",
  closed: "Cierre humano",
  discarded: "Sin incidencia",
};
const deliveryLabels = {
  pending_connection: "Pendiente de conexión",
  ready: "Listo para enviar",
  send_disabled: "Envío deshabilitado",
  blocked_recipient: "Destinatario no autorizado",
  provider_accepted: "Aceptado por API",
  failed: "Falló el envío",
  result_unknown: "Resultado desconocido",
  sending: "Enviando",
  cancelled: "Cancelado",
};
const intentLabels = {
  ask_review: "Revisar sección",
  assign_internal: "Asignar reposición",
  ask_eta: "Consultar entrega",
  report: "Reporte de estado",
};
function renderCases() {
  $("case-count").textContent = caseState.cases.length;
  if (!caseState.cases.length) return;
  $("cases").innerHTML = caseState.cases
    .map((item) => {
      const source = item.source || {};
      const messages = caseState.outbox.filter((m) => m.case_id === item.id);
      const terminal = ["closed", "discarded"].includes(item.status);
      const descriptions = {
        review_required: `${Number(source.duration_s || 0).toFixed(1)} s observados en ${clock(source.media_time_s)}. Se requiere revisar la sección; no demuestra faltante.`,
        assigned:
          "Incidencia y stock confirmados localmente. Reposición asignada; falta verificar ejecución.",
        awaiting_delivery:
          "Incidencia confirmada, sin stock. Consulta de entrega preparada; el caso sigue pendiente.",
        closed:
          "Cierre confirmado por el operador local. No hay verificación visual posterior.",
        discarded:
          "El operador local descartó la incidencia. No se cuenta como reposición completada.",
      };
      const messagesHtml = messages
        .map(
          (m) => `<details class="message-item">
      <summary><strong>${m.channel === "slack" ? "Slack" : "Correo"} · ${escapeHtml(intentLabels[m.intent] || m.intent)}</strong><span>${escapeHtml(deliveryLabels[m.status] || m.status)}</span></summary>
      <p>${escapeHtml(m.text)}</p></details>`,
        )
        .join("");
      const observationHtml = terminal
        ? ""
        : `<details><summary>Registrar observación local</summary>
      <small>Este control prueba el caso; no representa una respuesta recibida por Slack o correo.</small>
      <form data-case="${escapeHtml(item.id)}" data-version="${item.version}">
      <label>Resultado observado<select name="kind">
      <option value="stock_confirmed">Faltante confirmado; hay stock en bodega</option>
      <option value="no_stock">Faltante confirmado; no hay stock</option>
      ${item.status === "assigned" ? '<option value="restocked">Reposición realizada</option>' : ""}
      <option value="no_issue">No hay incidencia</option></select></label>
      <label>Nota de verificación<textarea name="note" required minlength="3" maxlength="1000" placeholder="Describe qué se comprobó y dónde."></textarea></label>
      <button class="secondary" type="submit">Guardar observación local</button><span class="form-result" role="status"></span></form></details>`;
      return `<article class="case-item" data-case-id="${escapeHtml(item.id)}">
      <div class="case-heading"><span class="mono">${escapeHtml(item.id.slice(0, 12))}</span><span class="case-status">${escapeHtml(statusLabels[item.status] || item.status)}</span></div>
      <h3>${escapeHtml(item.zone_name || "Revisión de sección")}</h3>
      <p>${escapeHtml(descriptions[item.status] || item.status)}</p>${messagesHtml}${observationHtml}</article>`;
    })
    .join("");
}
async function refreshState() {
  try {
    const state = await api("/state");
    caseState = state;
    for (const channel of ["slack", "email"]) {
      const value = state.channels?.[channel];
      $(`${channel}-status`).textContent = value?.configured
        ? "Salida configurada · entrada pendiente"
        : "Pendiente de conexión";
    }
    $("coordinator-status").textContent =
      state.coordinator?.mode === "openai"
        ? "Coordinador OpenAI configurado · política acotada"
        : "Coordinación local por reglas · OpenAI sin configurar";
    const fingerprint = JSON.stringify({
      cases: state.cases,
      outbox: state.outbox,
    });
    if (
      fingerprint !== stateFingerprint &&
      !document.querySelector(".case-item details[open]")
    ) {
      stateFingerprint = fingerprint;
      renderCases();
    }
  } catch {
    $("coordinator-status").textContent =
      "Servicio de casos no disponible. Revisa el servidor local.";
  }
}
$("analyze").addEventListener("click", async () => {
  if (analyzing && !video.paused) {
    video.pause();
    $("analyze").textContent = "▶ Continuar análisis";
    return;
  }
  $("analyze").disabled = true;
  error("");
  try {
    await analyzer.load();
    if (!video.videoWidth)
      throw new Error(
        "Espera a que cargue el video o selecciona un archivo local.",
      );
    analyzing = true;
    await video.play();
    analyzer.start();
    $("analyze").textContent = "Ⅱ Pausar análisis";
  } catch (err) {
    error(`No se pudo iniciar: ${err.message}`);
    $("analyze").textContent = "↻ Reintentar análisis";
  } finally {
    $("analyze").disabled = false;
  }
});
video.addEventListener("loadedmetadata", () => {
  $("video-stage").style.aspectRatio =
    `${video.videoWidth}/${video.videoHeight}`;
  resetTracking();
});
video.addEventListener("loadeddata", () => {
  $("video-empty").hidden = true;
  draw();
});
video.addEventListener("timeupdate", () => {
  $("video-clock").textContent = clock(video.currentTime);
});
video.addEventListener("seeking", () =>
  resetTracking("Nueva posición · permanencia reiniciada"),
);
video.addEventListener("pause", () => {
  if (analyzing) {
    $("analyze").textContent = "▶ Continuar análisis";
    $("model-status").textContent = "Pausado · no se acumula permanencia";
  }
});
video.addEventListener("play", () => {
  if (analyzing) {
    analyzer.start();
    $("analyze").textContent = "Ⅱ Pausar análisis";
  }
});
video.addEventListener("error", () => {
  $("video-empty").textContent =
    "No se pudo cargar la fuente. Abre un video local.";
  $("video-empty").hidden = false;
});
$("video-file").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  video.pause();
  analyzer.stop();
  analyzing = false;
  if (localUrl) URL.revokeObjectURL(localUrl);
  localUrl = URL.createObjectURL(file);
  sourceId = `local-${crypto.randomUUID()}`;
  video.src = localUrl;
  resetTracking("Video local · detector listo para iniciar");
  $("source-title").textContent = file.name;
  $("source-note").textContent =
    "Archivo local: los píxeles se procesan en este navegador. Verifica la procedencia y autorización del material antes de usarlo públicamente.";
  $("reference").hidden = false;
  $("analyze").textContent = "▶ Analizar video";
});
function useReference() {
  video.pause();
  analyzer.stop();
  analyzing = false;
  if (localUrl) {
    URL.revokeObjectURL(localUrl);
    localUrl = null;
  }
  sourceId = manifest.source_id;
  video.src = manifest.url;
  $("source-title").textContent = "Tienda de referencia · CCTV 2017";
  $("source-note").innerHTML =
    `Fuente: <a href="${escapeHtml(manifest.source_page)}" target="_blank" rel="noreferrer">HDCCTV Cameras / Wikimedia Commons</a>. Grabación histórica de productos para el hogar; zonas propuestas para explorar circulación. Derechos: PD-automated según ficha de Commons. No es una tienda de PanelaTeam ni una cámara en vivo.`;
  $("reference").hidden = true;
  $("analyze").textContent = "▶ Analizar video";
}
$("reference").addEventListener("click", useReference);
$("zones-json").value = JSON.stringify(zones, null, 2);
$("save-zones").addEventListener("click", () => {
  try {
    const proposed = JSON.parse($("zones-json").value);
    const candidate = new ZoneTracker({
      zones: proposed,
      dwellThreshold: tracker.dwellThreshold,
    });
    zones = proposed;
    tracker = candidate;
    resetTracking("Zonas actualizadas · medición reiniciada");
    $("zone-error").textContent = "";
  } catch (err) {
    $("zone-error").textContent = `Zonas inválidas: ${err.message}`;
  }
});
$("threshold").addEventListener("change", () => {
  const threshold = Number($("threshold").value);
  if (!Number.isInteger(threshold) || threshold < 2 || threshold > 120) {
    $("threshold").value = tracker.dwellThreshold;
    error(
      "El umbral debe ser un número entero entre 2 y 120 segundos. Se conserva el valor anterior.",
    );
    return;
  }
  error("");
  tracker = new ZoneTracker({ zones, dwellThreshold: threshold });
  resetTracking("Umbral actualizado · medición reiniciada");
});
$("events").addEventListener("click", (event) => {
  const id = event.target.closest(".retry-event")?.dataset.event;
  if (id) {
    const record = events.find((e) => e.event_id === id);
    record.status = "pending";
    deliverEvent(record);
  }
});
$("cases").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  const button = form.querySelector("button");
  button.disabled = true;
  try {
    const payload = {
      kind: data.get("kind"),
      note: data.get("note"),
      shelf_issue_confirmed: ["stock_confirmed", "no_stock"].includes(
        data.get("kind"),
      ),
    };
    const signature = JSON.stringify(payload);
    if (form.dataset.requestSignature !== signature) {
      form.dataset.requestSignature = signature;
      form.dataset.requestId = crypto.randomUUID();
      form.dataset.requestVersion = form.dataset.version;
    }
    await api(`/cases/${encodeURIComponent(form.dataset.case)}/observation`, {
      ...payload,
      request_id: form.dataset.requestId,
      expected_version: Number(form.dataset.requestVersion),
    });
    form.closest("details").open = false;
    stateFingerprint = "";
    await refreshState();
  } catch (err) {
    form.querySelector(".form-result").textContent = err.message;
  } finally {
    button.disabled = false;
  }
});
$("export").addEventListener("click", () => {
  const evidence = {
    exported_at: new Date().toISOString(),
    detector: "COCO-SSD lite_mobilenet_v2",
    measurement: "video media time; ephemeral tracks; not unique visitors",
    source:
      sourceId === manifest?.source_id
        ? manifest
        : { source_id: sourceId, rights: "user-supplied, not verified" },
    zones,
    dwell_threshold_s: tracker.dwellThreshold,
    events,
    cases: caseState.cases,
    outbox: caseState.outbox,
  };
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(evidence, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `panelateam-evidence-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
renderObservations();
refreshState();
setInterval(refreshState, 5000);
fetch("/media-manifest.json")
  .then((r) => {
    if (!r.ok) throw new Error();
    return r.json();
  })
  .then((data) => {
    manifest = data;
    useReference();
  })
  .catch(() =>
    error("No se pudo cargar la referencia. Puedes abrir un video local."),
  );
