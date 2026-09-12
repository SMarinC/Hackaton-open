import { ApiError } from "./store.js";

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

export function channelConfig(env = process.env) {
  const slackTarget = env.PANELA_SLACK_CHANNEL?.trim() ?? "";
  const emailTarget = env.PANELA_EMAIL_TO?.trim().toLowerCase() ?? "";
  return {
    liveSend: env.PANELA_LIVE_SEND === "true",
    slack: {
      configured: Boolean(env.SLACK_BOT_TOKEN && slackTarget),
      recipient: slackTarget,
      allowed: list(env.PANELA_ALLOWED_SLACK_CHANNELS).includes(slackTarget),
    },
    email: {
      configured: Boolean(
        env.RESEND_API_KEY && env.PANELA_EMAIL_FROM && emailTarget,
      ),
      recipient: emailTarget,
      allowed: list(env.PANELA_ALLOWED_EMAIL_RECIPIENTS)
        .map((item) => item.toLowerCase())
        .includes(emailTarget),
    },
  };
}

export function publicChannels(env) {
  const config = channelConfig(env);
  return Object.fromEntries(
    ["slack", "email"].map((channel) => [
      channel,
      {
        configured: config[channel].configured,
        send_enabled:
          config.liveSend &&
          config[channel].configured &&
          config[channel].allowed,
        recipient_allowed: config[channel].allowed,
        inbound_supported: false,
        integration_status: "outbound_only",
      },
    ]),
  );
}

export function displayOutbox(item, env) {
  if (
    ![
      "pending_connection",
      "ready",
      "send_disabled",
      "blocked_recipient",
    ].includes(item.status)
  )
    return item;
  const config = channelConfig(env);
  const channel = config[item.channel];
  const status = !channel?.configured
    ? "pending_connection"
    : !channel.allowed
      ? "blocked_recipient"
      : !config.liveSend
        ? "send_disabled"
        : "ready";
  return { ...item, status };
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
  const channel = config[queued.channel];
  if (!channel?.configured)
    throw new ApiError(409, "Canal pendiente de conexión.");
  if (!channel.allowed)
    throw new ApiError(403, "Destinatario fuera de la lista autorizada.");
  const { item, alreadySent } = store.claimSend(id, channel.recipient);
  if (alreadySent) return item;
  try {
    const slack = item.channel === "slack";
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
                channel: channel.recipient,
                text: slackLiteral(item.text),
                unfurl_links: false,
                unfurl_media: false,
              }
            : {
                from: env.PANELA_EMAIL_FROM,
                to: [channel.recipient],
                subject: `[DEMO PanelaTeam] ${item.intent} · ${item.case_id}`,
                text: item.text,
              },
        ),
      },
    );
    if (!response.ok) {
      return store.finishSend(id, {
        status: response.status >= 500 ? "result_unknown" : "failed",
        error: `Proveedor devolvió HTTP ${response.status}; no se afirma entrega.`,
      });
    }
    const data = await response.json();
    if (slack && data.ok !== true)
      return store.finishSend(id, {
        status: "failed",
        error: "Slack rechazó el envío.",
      });
    const providerId = slack ? data.ts : data.id;
    if (!providerId)
      return store.finishSend(id, {
        status: "result_unknown",
        error: "Respuesta sin identificador del proveedor.",
      });
    return store.finishSend(id, {
      status: "provider_accepted",
      provider_id: String(providerId),
      error: null,
    });
  } catch {
    // Do not expose provider bodies, credentials, or raw exception strings to the browser.
    return store.finishSend(id, {
      status: "result_unknown",
      error: "Resultado de envío desconocido; reconciliar antes de repetir.",
    });
  }
}
