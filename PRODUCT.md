# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Server + static frontend in JS/Node (src/, server/, vite.config.js — see package.json). **`index.html` + `src/main.js` is the real, running product interface** (video → detección COCO-SSD → zonas → casos → outbox Slack/correo), servido por Vite/`server/index.js`. `demo/panel.html` es una superficie secundaria — un reporte de caso independiente y estático (HTML/CSS puro, sin build) que extiende el mismo sistema visual documentado en `DESIGN.md` (escaneado del código real, no al revés) para mostrar el recorrido completo de un caso fuera de la mesa de trabajo en vivo.

## Users

- **Encargado de tienda** (usuario principal del demo): revisa una señal temporal, entiende su evidencia, revisa el resumen/reporte del caso, y configura o acepta las reglas de operación (la "política"). Fuente: PRD §§3, 6, 7.
- **Administrador**: conecta fuentes, identidades y canales; coordina una gestión con responsables; no obtiene por ello facultades comerciales.
- **Responsable de reposición**: recibe la tarea vía Slack, responde sobre disponibilidad, reporta ejecución o bloqueo.
- **Compras / proveedor autorizado** (contacto externo, representado por una cuenta de prueba en el demo): responde disponibilidad o fecha de entrega por correo; una consulta no constituye un pedido.
- **Propietario / operaciones**: decide contratar según reducción de coordinación, costo y utilidad comprobada. Posible veto de confianza sobre el acceso a cámaras/datos.

## Product Purpose

PanelaTeam convierte actividad observable en video en eventos y casos trazables, y en lugar de solo avisar, **conduce la coordinación completa** con las personas responsables por Slack y correo reales: consulta inventario, abre el hilo con el responsable, espera y procesa su respuesta, escala o pregunta a un tercero (compras/proveedor) cuando falta mercancía, registra la tarea, verifica la ejecución con evidencia y cierra el caso reportando en ambos canales.

El video, las zonas y la permanencia son el recorrido principal de esta primera unidad; Slack y correo siguen siendo **obligatorios** para aceptar D0 completo — el primer incremento puede demostrar el flujo local sin presentar canales pendientes como conectados.

El trabajo que reduce es **perseguir información y conducir cada transición entre personas y sistemas** — no reemplaza el trabajo físico de reposición ni las decisiones que exceden sus facultades (comprar, cambiar precio, aprobar promociones).

Éxito para el demo: un caso completo, trazable de punta a punta, sobrevive un recargo/reintento sin duplicar la tarea, y dos respuestas distintas al mismo evento producen gestiones distintas (prueba de que el agente decide con contexto y no solo dispara un aviso fijo).

## Positioning

Usar Slack, varios agentes o una API de visión es replicable por cualquier competidor y no es, por sí solo, una ventaja. La hipótesis de diferenciación es **confianza operativa**: un historial verificable de decisiones, comunicaciones, recuperación de fallos y cierres correctos que permite delegar más coordinación rutinaria con menos supervisión con el tiempo. Hoy esa ventaja no existe todavía — es una hipótesis a validar, no un activo ya poseído.

Referencias de mercado citadas en el PVB (Focal, Trax/FORM) resuelven visión y ejecución retail; la diferenciación por validar es una instalación acotada, conversación contextual con los responsables reales, y cierre del caso con poco trabajo del supervisor.

## Operating Context

- Segmento: tiendas de abarrotes con secciones diferenciadas. Piloto propuesto (no confirmado): una tienda con exhibición observable, encargado identificable, inventario consultable y responsable de reposición disponible.
- Canales de coordinación **obligatorios para el demo (D0)**: Slack (hilo por caso, conversación operativa principal) y correo (contacto externo representado por cuenta de prueba). Una bandeja simulada no satisface el requisito D0.
- Evidencia de entrada: video/cámara con procedencia declarada. **Ya hay una referencia CCTV real integrada** (`aidlc-docs/construction/U01-video-operations.md`); no es un placeholder pendiente. Sin reconocimiento facial, solo IDs temporales de seguimiento (COCO-SSD en navegador, sin transmitir píxeles a servicios externos).
- Datos comerciales: POS, inventario y catálogo — fixtures ficticios para el demo, etiquetados como tales en cualquier reporte.
- Política configurable: tienda, identidad, acciones admitidas, contactos, información compartible, límites, horario, recordatorios, escalamiento, vigencia y versión.
- **Ciclo de estados implementado (código real, `server/store.js`):** `review_required → assigned | awaiting_delivery → closed | discarded`. Un evento de permanencia abre el caso en `review_required`; una observación local con `shelf_issue_confirmed=true` decide la rama (`stock_confirmed` → `assigned` → `closed`, o `no_stock` → `awaiting_delivery`, con la tarea interna en `blocked_no_stock` hasta recibir fecha).
- **Ciclo de la visión PVB (aspiracional, no implementado):** `detectado → en validación → propuesta → aprobado → asignado → ejecución reportada → verificado` (también `descartado`, `bloqueado`, `cancelado`). No confundir con el ciclo implementado de arriba — son dos vocabularios distintos hasta que se reconcilien.
- Concurso: AI Tinkerers Medellín, "Agents, Everywhere" — entrega requiere repositorio público, video de dos minutos y demás materiales del handbook. Candidatura aún no enviada.

## Capabilities and Constraints

**Obligatorio para el demo (D0):** un caso contextual con evidencia y procedencia declaradas, política activa, Slack bidireccional real, correo enviado/recibido correlacionado al mismo caso, reporte enviado en ambos canales, tarea/seguimiento persistentes (sobreviven un recargo), y un fallo recuperable demostrado (reintento sin duplicar la tarea).

**Autonomía del agente dentro de la política:** puede consultar datos autorizados, pedir confirmación/evidencia, notificar, recordar, escalar, entregar reportes, y asignar reposición interna automáticamente cuando la regla vigente cubre rol/producto/zona/cantidad/stock/condiciones. Fuera de eso, pide una decisión puntual. Nunca infiere autorización nueva de un correo/mensaje entrante; ampliar destinatarios o permisos requiere a una persona facultada.

**Explícitamente fuera de alcance D0:** comprar, aceptar cotización, pagar, o cambiar precio/promoción; detector de visión automático validado como exactitud comercial (el puntaje del detector no se presenta como exactitud validada); métricas de permanencia y rankings comerciales; cámaras/POS reales, más de una tienda, o evaluación causal de promociones (todo esto es piloto/evolución posterior, no D0).

**Terminología del proyecto:** PVB = Product Vision Board; D0 = alcance obligatorio de la demo; "caso" = unidad de trabajo que agrupa evento, consultas, decisión y cierre; "política" = reglas de autonomía configuradas; "procedencia" = si un dato es captura real, reproducción de archivo, dato sintético o anotación humana.

**Pendiente/no decidido (no inventar):** reconciliar el ciclo de estados implementado con el vocabulario PVB, evaluación anotada reservada del detector (FR-01-04), directorio real de responsables (FR-06/07/09), cuentas de prueba de Slack/correo (aún no existen — U02 pendiente), tienda piloto, presupuesto.

## Brand Commitments

Nombre de equipo: **PanelaTeam** — identidad confirmada (nombre comercial del producto todavía pendiente). Foto del equipo en `assets/panelateam-medellin.png`, con procedencia documentada en `assets/README.md`. Voz operativa, clara y precisa (PRD §6): cada estado explica qué pasó y cómo continuar. Sin guía de marca, paleta o tipografía comercial aprobada todavía.

## Evidence on Hand

- **No hay cuentas de prueba de Slack ni correo conectadas todavía** (confirmado explícitamente por el usuario en el PVB v0.2) — es la dependencia de primera prioridad antes de poder demostrar el D0 real.
- Referencia de video CCTV ya integrada (ver `aidlc-docs/construction/U01-video-operations.md`); condiciones de reutilización y procedencia declaradas — no se presenta como captura propia.
- Datos de POS/inventario serán fixtures ficticios, etiquetados como tales en cualquier reporte o UI.
- No existen resultados de piloto, métricas operativas reales, ROI ni comparación causal — el PVB v0.2 prohíbe explícitamente publicar cifras inventadas o atribuciones causales indebidas.
- La candidatura al concurso no ha sido enviada; el PRD/PVB documentado no acredita una nota de implementación.

## Product Principles

1. **Nunca afirmar lo que la evidencia no sostiene.** Imagen insuficiente o dato desactualizado → el agente pide aclaración; no inventa un cierre ni un resultado.
2. **Observación distinta de inferencia, siempre etiquetada.** "Cero observado" ≠ "zona no observable"; "retirada del estante" ≠ "compra confirmada"; "stock de tienda" ≠ "stock de bodega". El reporte no colapsa estas distinciones.
3. **Procedencia declarada en cada dato y cada reporte.** Real, fixture o anotación humana — nunca mezclados sin etiqueta, ni en el demo ni en el panel.
4. **El agente actúa dentro de una política explícita, nunca por inferencia de un mensaje entrante.** Ampliar permisos o destinatarios es un cambio de configuración humano, no una conclusión del agente.
5. **Reportar solo a quien corresponde.** Reporte operativo a personal, resumen a encargado, consulta mínima a tercero — no distribuir todo a todos.
6. **No presentar simulación como realidad, stock como inferencia visual, ni notificación como resolución.** Los datos y estados sirven a decisiones, no a aparentar validación comercial (PRD §§6, 8, 9).
7. **El video y su evidencia temporal preceden a los indicadores agregados.** Cada gestión conserva fuente, motivo, estado y próximo paso; la falta de conexión se muestra explícitamente; el operador puede pausar y revisar sin perder el caso.

## Accessibility & Inclusion

PRD NFR-07: recorrido operable con teclado, controles con nombre, foco visible, etiquetas y errores en texto. El color acompaña información textual, nunca la reemplaza. Respetar preferencia de movimiento reducido (`prefers-reduced-motion`). No se declara certificación de accesibilidad.
