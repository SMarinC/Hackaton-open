# Product

<!-- impeccable:product-schema 1 -->

## Register

product

## Platform

web

## Stack

Frontend funcional en JavaScript/Vite y backend Node.js con SQLite (`src/`, `server/`, `vite.config.js`; ver `package.json`). **`index.html` + `src/main.js` es la interfaz operativa** del recorrido video → detección COCO-SSD → zonas → eventos → casos persistentes → outbox Slack/correo. Adopta la última dirección de `DESIGN.md`, «La mesa de operación»: dos columnas de trabajo para video y casos, con cronología de los casos del backend y tipografía de sistema sin cargar webfonts. `demo/panel.html` es una superficie secundaria estática con ejemplos ficticios; no consume los casos de la API ni acredita comunicaciones o ejecuciones reales. La app funcional requiere el entorno de ejecución y build descrito en `README.md`.

## Target Architecture

La [arquitectura objetivo](docs/architecture/target.md) distribuye responsabilidades lógicas entre percepción, coordinación, verificación y reportes; el motor de política y la persistencia delimitan efectos externos. API y workers se empaquetarán en contenedores OCI portables. Se propone una nube inicial y restauración ensayada en otra, con un único despachador autorizado. OpenRouter es candidato para inferencia intercambiable; Exa es una herramienta web opcional, no un sustituto de inventario ni un gateway de inferencia equivalente. Estos componentes siguen propuestos, sin despliegue ni conexión acreditados.

## Users

- **Encargado de tienda** (usuario principal del demo): revisa una señal temporal, entiende su evidencia, revisa el resumen/reporte del caso, y configura o acepta las reglas de operación (la "política"). Fuente: PRD §§3, 6, 7.
- **Administrador**: conecta fuentes, identidades y canales; coordina una gestión con responsables; no obtiene por ello facultades comerciales.
- **Responsable de reposición**: recibe la tarea vía Slack, responde sobre disponibilidad, reporta ejecución o bloqueo.
- **Compras / proveedor autorizado** (contacto externo que se representará por una cuenta de prueba en D0): responde disponibilidad o fecha de entrega por correo; una consulta no constituye un pedido. La cuenta aún está pendiente.
- **Propietario / operaciones**: decide contratar según reducción de coordinación, costo y utilidad comprobada. Posible veto de confianza sobre el acceso a cámaras/datos.

## Product Purpose

El propósito de Panela Stocks es convertir actividad observable en video en eventos y casos trazables, y **conducir la coordinación completa** con las personas responsables por Slack y correo reales: consultar inventario, abrir el hilo con el responsable, esperar y procesar su respuesta, escalar o preguntar a un tercero (compras/proveedor) cuando falta mercancía, registrar la tarea, verificar la ejecución con evidencia y cerrar el caso reportando en ambos canales. Este recorrido completo sigue siendo el objetivo de D0, no una capacidad ya demostrada.

El video, las zonas y la permanencia son el recorrido principal de esta primera unidad; Slack y correo siguen siendo **obligatorios** para aceptar D0 completo — el primer incremento puede demostrar el flujo local sin presentar canales pendientes como conectados.

El trabajo que reduce es **perseguir información y conducir cada transición entre personas y sistemas** — no reemplaza el trabajo físico de reposición ni las decisiones que exceden sus facultades (comprar, cambiar precio, aprobar promociones).

Éxito previsto para D0: un caso completo, trazable de punta a punta, sobrevive una recarga/reintento sin duplicar la tarea, y dos respuestas distintas al mismo evento producen gestiones distintas. Esa bifurcación muestra uso del contexto; por sí sola no prueba superioridad frente a reglas.

**Estado de implementación:** el incremento funcional detecta personas, registra permanencia por visita/zona y abre una revisión. El backend conserva casos, observaciones locales, tareas y outbox. Confirmar una incidencia en exhibición y el estado de stock habilita las ramas de reposición de prueba o consulta; las observaciones son del operador local, no respuestas externas. El cierre actual es confirmación humana local sin verificación visual. Slack/Resend tienen adaptadores salientes pendientes de conexión y respuestas entrantes; el envío está desactivado por defecto. Responses aporta una propuesta opcional acotada por estado, con reglas como base; no se ha demostrado coordinación autónoma completa. Fuente: `server/README.md` y `server/store.js`.

## Positioning

Usar Slack, varios agentes o una API de visión es replicable por cualquier competidor y no es, por sí solo, una ventaja. La hipótesis de diferenciación es **confianza operativa**: un historial verificable de decisiones, comunicaciones, recuperación de fallos y cierres correctos que permite delegar más coordinación rutinaria con menos supervisión con el tiempo. Hoy esa ventaja no existe todavía — es una hipótesis a validar, no un activo ya poseído.

Referencias de mercado citadas en el PVB (Focal, Trax/FORM) resuelven visión y ejecución retail; la diferenciación por validar es una instalación acotada, conversación contextual con los responsables reales, y cierre del caso con poco trabajo del supervisor.

## Operating Context

- Segmento: tiendas de abarrotes con secciones diferenciadas. Piloto propuesto (no confirmado): una tienda con exhibición observable, encargado identificable, inventario consultable y responsable de reposición disponible.
- Canales de coordinación **obligatorios para el demo (D0)**: Slack (hilo por caso, conversación operativa principal) y correo (contacto externo representado por cuenta de prueba). Una bandeja simulada no satisface el requisito D0.
- Evidencia de entrada: grabación histórica elegida por el usuario, referenciada en YouTube y reproducible desde Commons mediante `public/media-manifest.json`. Muestra una tienda de productos para el hogar, no una tienda piloto de abarrotes ni una cámara propia en vivo. La ficha declara `PD-automated`; se conserva esa declaración sin presentarla como autorización confirmada del titular. El pipeline usa IDs temporales sin reconocimiento facial (`src/vision.js`, `src/tracker.js`, `tests/`).
- Datos comerciales: POS, inventario y catálogo — fixtures ficticios para el demo, etiquetados como tales en cualquier reporte.
- Política configurable objetivo: tienda, identidad, acciones admitidas, contactos, información compartible, límites, horario, recordatorios, escalamiento, vigencia y versión. El incremento actual aplica reglas de estado y controles de envío/destinatarios; no implementa todavía toda esa configuración operacional.
- **Ciclo implementado (`server/store.js`):** el evento abre `review_required`. Con incidencia en exhibición confirmada, `stock_confirmed` crea una tarea y pasa a `assigned`; `restocked` con nota solo permite cerrar desde `assigned`. `no_stock` pasa a `awaiting_delivery` y prepara la consulta por correo: si viene de revisión, `task` permanece `null`; solo una tarea ya existente pasa a `blocked_no_stock`. Desde `awaiting_delivery` no hay cierre directo por `restocked`: se requiere una nueva confirmación de stock para volver a `assigned`. `no_issue` descarta un caso no terminal. Las respuestas entrantes y la recepción de una fecha todavía no ejecutan transiciones.
- **Ciclo objetivo de siete etapas PVB (aspiracional):** `detectado → en validación → propuesta → aprobado → asignado → ejecución reportada → verificado` (también `descartado`, `bloqueado`, `cancelado`, con motivo). El backend no implementa propuesta, aprobación y verificación visual como etapas distintas. El diseño no debe mostrar las siete etapas como cumplidas por un cierre local.
- Concurso: AI Tinkerers Medellín, "Agents, Everywhere" — entrega requiere repositorio público, video de dos minutos y demás materiales del handbook. Candidatura aún no enviada.

## Capabilities and Constraints

**Obligatorio para el demo (D0):** un caso contextual con evidencia y procedencia declaradas, política activa, Slack bidireccional real, correo enviado/recibido correlacionado al mismo caso, reporte enviado en ambos canales, tarea/seguimiento persistentes (sobreviven un recargo), y un fallo recuperable demostrado (reintento sin duplicar la tarea).

**Autonomía prevista del agente dentro de la política:** puede consultar datos autorizados, pedir confirmación/evidencia, notificar, recordar, escalar, entregar reportes, y asignar reposición interna automáticamente cuando la regla vigente cubre rol/producto/zona/cantidad/stock/condiciones. Fuera de eso, pide una decisión puntual. Nunca infiere autorización nueva de un correo/mensaje entrante; ampliar destinatarios o permisos requiere a una persona facultada. La nota de implementación anterior delimita lo disponible hoy.

**Explícitamente fuera de alcance D0:** comprar, aceptar cotización, pagar, o cambiar precio/promoción; detector de visión automático validado como exactitud comercial (el puntaje del detector no se presenta como exactitud validada); permanencia validada como indicador comercial y rankings de ventas/productos; cámaras/POS reales, más de una tienda, o evaluación causal de promociones. La permanencia temporal observada por visita/zona sí pertenece al incremento actual como disparador de revisión; no demuestra interés, compra ni faltante.

**Terminología del proyecto:** PVB = Product Vision Board; D0 = alcance obligatorio de la demo; "caso" = unidad de trabajo que agrupa evento, consultas, decisión y cierre; "política" = reglas de autonomía configuradas; "procedencia" = si un dato es captura real, reproducción de archivo, dato sintético o anotación humana.

**Pendiente/no decidido (no inventar):** reconciliar el ciclo implementado con el vocabulario PVB, evaluación anotada reservada del detector (FR-01/02/03/04), directorio real de responsables (FR-06/07/09), validación del ciclo de reposición con una tienda real, cuentas de prueba de Slack/correo y sus conexiones (U02), tienda piloto y presupuesto. El video de referencia y el recorrido local de revisión por permanencia ya están elegidos. Evidencia de implementación parcial: `aidlc-docs/construction/U01-video-operations.md`.

## Brand Commitments

La marca «Local en cuadro» proporcionada por el usuario se adapta en SVG en `public/brand/`: marco de video, toldo terracota y acento verde. El punto pertenece al dibujo del logo; no acredita una sesión ni una conexión activa. El nombre se conserva con espacio: **Panela Stocks**. La tipografía trazada pertenece solo a la marca; los controles siguen con fuentes de sistema.

Nombre de la solución: **Panela Stocks**. Nombre del equipo: **PanelaTeam**. Ambos nombres están confirmados por el usuario. Usar «Panela Stocks» para el producto y «PanelaTeam» para su equipo desarrollador; conservar esta distinción en títulos, descripciones y materiales de presentación. `assets/panelateam-medellin.png` es una ilustración generada para la identidad de la hackathon, no una fotografía de integrantes; su procedencia está en `assets/README.md`. Voz operativa, clara y precisa (PRD §6): cada estado explica qué pasó y cómo continuar. Para regenerar la demo funcional se adopta la última versión de `DESIGN.md`, «La mesa de operación», como dirección de prototipo: papel cálido, tinta café, dos columnas y fuentes de sistema sin Google Fonts. Esto no acredita una identidad comercial completa aprobada.

## Evidence on Hand

- **No hay cuentas de prueba de Slack ni correo conectadas todavía** (confirmado explícitamente por el usuario en el PVB v0.2) — es la dependencia de primera prioridad antes de poder demostrar el D0 real.
- El usuario eligió [la referencia CCTV de HDCCTV Cameras](https://www.youtube.com/watch?v=KMJS66jBtVQ). `public/media-manifest.json` conserva el recurso Commons, su procedencia, la declaración `PD-automated` y el alcance de una inspección parcial; no acredita autorización del titular ni revisión completa del video. Es material histórico de productos para el hogar, no captura propia ni validación del segmento de abarrotes.
- El inventario actual es un fixture identificado; POS y catálogo previstos para D0 también serán ficticios y etiquetados. No hay conexión comercial real.
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
