import { ApiError, isSendable } from "./store.js";

const list = (value = "") =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const slackLiteral = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
// Provider error codes (invalid_auth, not_in_channel, validation_error…) are
// safe and actionable; free-text messages can echo addresses, so drop them.
const safeCode = (value) =>
  typeof value === "string" && /^[a-z0-9_]{1,64}$/.test(value) ? value : null;
const QUEUED = ["pending_connection", "ready", "send_disabled", "blocked_recipient"];

export function channelConfig(env = process.env) {
  const slackTarget = env.PANELA_SLACK_CHANNEL?.trim() ?? "";
  const emailTarget = env.PANELA_EMAIL_TO?.trim().toLowerCase() ?? "";
  const reportTarget = env.PANELA_EMAIL_REPORT_TO?.trim().toLowerCase() ?? "";
  const allowedEmails = list(env.PANELA_ALLOWED_EMAIL_RECIPIENTS).map((item) =>
    item.toLowerCase(),
  );
  const emailCredentials = Boolean(env.RESEND_API_KEY && env.PANELA_EMAIL_FROM);
  const liveSend = env.PANELA_LIVE_SEND === "true";
  return {
    liveSend,
    autoSend: liveSend && env.PANELA_AUTO_SEND === "true",
    slack: {
      configured: Boolean(env.SLACK_BOT_TOKEN && slackTarget),
      recipient: slackTarget,
      allowed: list(env.PANELA_ALLOWED_SLACK_CHANNELS).includes(slackTarget),
    },
    email: {
      configured: emailCredentials && Boolean(emailTarget),
      recipient: emailTarget,
      allowed: allowedEmails.includes(emailTarget),
      report: {
        configured: emailCredentials && Boolean(reportTarget),
        recipient: reportTarget,
        allowed: allowedEmails.includes(reportTarget),
      },
    },
  };
}

// Internal status reports carry operator notes; they must never reuse the
// external recipient that receives supplier queries (PRODUCT.md principle 5).
export function routeFor(config, item) {
  const channel = config[item.channel];
  if (!channel) return null;
  return item.channel === "email" && item.intent === "report"
    ? channel.report
    : channel;
}

export function publicChannels(env) {
  const config = channelConfig(env);
  return Object.fromEntries(
    ["slack", "email"].map((channel) => {
      const sendEnabled =
        config.liveSend && config[channel].configured && config[channel].allowed;
      return [
        channel,
        {
          configured: config[channel].configured,
          send_enabled: sendEnabled,
          auto_send: config.autoSend && sendEnabled,
          recipient_allowed: config[channel].allowed,
          ...(channel === "email"
            ? {
                report_recipient_configured: config.email.report.configured,
                report_recipient_allowed: config.email.report.allowed,
              }
            : {}),
          inbound_supported: false,
          integration_status: "outbound_only",
        },
      ];
    }),
  );
}

export function displayOutbox(item, env, caseVersion, nowMs = Date.now()) {
  const config = channelConfig(env);
  const target = routeFor(config, item);
  const status = QUEUED.includes(item.status)
    ? !target?.configured
      ? "pending_connection"
      : !target.allowed
        ? "blocked_recipient"
        : !config.liveSend
          ? "send_disabled"
          : "ready"
    : item.status;
  const canSend =
    config.liveSend &&
    Boolean(target?.configured && target.allowed) &&
    (caseVersion === undefined || caseVersion === item.case_version) &&
    isSendable(item, nowMs);
  return { ...item, status, can_send: canSend };
}

async function errorCode(response, slack) {
  try {
    const data = await response.json();
    return safeCode(slack ? data?.error : data?.name);
  } catch {
    return null;
  }
}

export async function sendOutbox(
  store,
  id,
  { env = process.env, fetchImpl = fetch } = {},
) {
  const queued = store.getOutbox(id);
  if (!queued) throw new ApiError(404, "Mensaje no encontrado.");
  if (queued.status === "provider_accepted") return queued;
  const config = channelConfig(env);
  if (!config.liveSend)
    throw new ApiError(
      403,
      "Envío real deshabilitado: PANELA_LIVE_SEND no es true.",
    );
  const target = routeFor(config, queued);
  if (!target?.configured)
    throw new ApiError(
      409,
      queued.channel === "email" && queued.intent === "report"
        ? "Sin destinatario interno de reportes: configura PANELA_EMAIL_REPORT_TO."
        : "Canal pendiente de conexión.",
    );
  if (!target.allowed)
    throw new ApiError(403, "Destinatario fuera de la lista autorizada.");
  const { item, alreadySent } = store.claimSend(id, target.recipient);
  if (alreadySent) return item;
  const slack = item.channel === "slack";
  try {
    const response = await fetchImpl(
      slack
        ? "https://slack.com/api/chat.postMessage"
        : "https://api.resend.com/emails",
      {
        method: "POST",
        signal: AbortSignal.timeout(10000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${slack ? env.SLACK_BOT_TOKEN : env.RESEND_API_KEY}`,
          ...(!slack ? { "Idempotency-Key": item.operation_key } : {}),
        },
        body: JSON.stringify(
          slack
            ? {
                channel: target.recipient,
                text: slackLiteral(item.text),
                unfurl_links: false,
                unfurl_media: false,
              }
            : {
                from: env.PANELA_EMAIL_FROM,
                to: [target.recipient],
                subject: `[DEMO Panela Stocks] ${item.intent} · ${item.case_id}`,
                text: item.text,
              },
        ),
      },
    );
    if (!response.ok) {
      const code = await errorCode(response, slack);
      return store.finishSend(id, {
        status: response.status >= 500 ? "result_unknown" : "failed",
        provider_error: code,
        error:
          response.status === 429
            ? `Límite de tasa del proveedor (HTTP 429${code ? `, ${code}` : ""}); no se entregó, reintenta más tarde.`
            : `Proveedor devolvió HTTP ${response.status}${code ? ` (${code})` : ""}; no se afirma entrega.`,
      });
    }
    const data = await response.json();
    if (slack && data.ok !== true) {
      const code = safeCode(data.error);
      return store.finishSend(id, {
        status: "failed",
        provider_error: code,
        error: `Slack rechazó el envío (${code ?? "sin código"}); no se entregó.`,
      });
    }
    const providerId = slack ? data.ts : data.id;
    if (!providerId)
      return store.finishSend(id, {
        status: "result_unknown",
        provider_error: null,
        error: "Respuesta sin identificador del proveedor.",
      });
    return store.finishSend(id, {
      status: "provider_accepted",
      provider_id: String(providerId),
      provider_error: null,
      error: null,
    });
  } catch {
    // Do not expose provider bodies, credentials, or raw exception strings to the browser.
    return store.finishSend(id, {
      status: "result_unknown",
      provider_error: null,
      error: "Resultado de envío desconocido; reconciliar antes de repetir.",
    });
  }
}

// Sends only freshly queued messages of one case. Failed or uncertain messages
// are never retried automatically — that stays an explicit operator action.
export async function dispatchCase(
  store,
  caseId,
  { env = process.env, fetchImpl = fetch } = {},
) {
  if (!channelConfig(env).autoSend) return [];
  const results = [];
  for (const message of store.listOutbox()) {
    if (message.case_id !== caseId || !QUEUED.includes(message.status)) continue;
    try {
      results.push(await sendOutbox(store, message.id, { env, fetchImpl }));
    } catch (error) {
      results.push({
        id: message.id,
        skipped: error instanceof ApiError ? error.message : "Error inesperado.",
      });
    }
  }
  return results;
}

const AUTO_RETRY_LIMIT = 5;
const AUTO_RETRY_BASE_MS = 60_000;

// Keeps the outbox flowing while auto-send is on: sends anything queued for the
// current case version (e.g. created while sending was off or the server was
// down) and retries definitive refusals with exponential backoff (1, 2, 4, 8
// min) up to a limit. "failed" means nothing was delivered, so a retry cannot
// duplicate; uncertain results are never retried here.
export function createOutboxWorker(
  store,
  {
    env = process.env,
    fetchImpl = fetch,
    now = () => Date.now(),
    intervalMs = 10_000,
    onResult = () => {},
  } = {},
) {
  let timer = null;
  let running = false;
  async function tick() {
    if (running || !channelConfig(env).autoSend) return [];
    running = true;
    const results = [];
    try {
      const nowMs = now();
      const versions = new Map(
        store.listCases().map((item) => [item.id, item.version]),
      );
      const due = store
        .listOutbox()
        .filter((message) => {
          if (versions.get(message.case_id) !== message.case_version) return false;
          if (QUEUED.includes(message.status)) return true;
          return (
            message.status === "failed" &&
            (message.auto_attempts ?? 0) < AUTO_RETRY_LIMIT &&
            (!message.next_attempt_at ||
              Date.parse(message.next_attempt_at) <= nowMs)
          );
        })
        .reverse();
      for (const message of due) {
        let result;
        try {
          result = await sendOutbox(store, message.id, { env, fetchImpl });
        } catch (error) {
          results.push({
            id: message.id,
            skipped:
              error instanceof ApiError ? error.message : "Error inesperado.",
          });
          continue;
        }
        if (result.status === "failed") {
          const autoAttempts = (message.auto_attempts ?? 0) + 1;
          result = store.scheduleRetry(message.id, {
            auto_attempts: autoAttempts,
            next_attempt_at:
              autoAttempts < AUTO_RETRY_LIMIT
                ? new Date(
                    nowMs + AUTO_RETRY_BASE_MS * 2 ** (autoAttempts - 1),
                  ).toISOString()
                : null,
          });
        }
        results.push(result);
      }
    } finally {
      running = false;
    }
    onResult(results);
    return results;
  }
  return {
    tick,
    start() {
      if (timer) return;
      tick().catch(() => {});
      timer = setInterval(() => tick().catch(() => {}), intervalMs);
      timer.unref?.();
    },
    stop() {
      clearInterval(timer);
      timer = null;
    },
    resetBackoff: () => store.resetAutoRetries(),
  };
}
