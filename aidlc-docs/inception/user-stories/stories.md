# Historias de usuario — Panela Stocks

**Versión:** 0.2 · **Fecha:** 2026-09-12 · **Estado:** borrador de Inception incluido en el PRD, pendiente de revisión.

Estas historias desarrollan las [personas](personas.md) y el [PRD](../../../specs/prd.md). El equipo, el segmento de tiendas de abarrotes con secciones diferenciadas y el uso de imágenes/videos de internet para la demo están confirmados. El usuario pidió coordinación autónoma con Slack y correo y confirmó que no hay cuentas de prueba disponibles. La selección del primer escenario, tienda piloto, cuentas, permisos, destinatarios y políticas concretas siguen pendientes; ninguna integración está implementada. **La reposición es un escenario propuesto; su inclusión aquí no acredita aprobación del alcance ni de la etapa AI-DLC.**

Los criterios se expresan como condiciones verificables del producto esperado. No documentan funcionalidades ya implementadas ni pruebas ya ejecutadas. La evidencia esperada debe conservarse con las versiones de entradas y configuración. Las historias abarcan la visión del PVB: no constituyen un compromiso de implementar todas durante la hackathon.

<a id="us-01"></a>
## US-01 — Revisar uso observable de una sección

**Como** [encargado de tienda](personas.md#per-01), **quiero** revisar presencia, visitas y permanencia observable por sección, **para** identificar situaciones que merecen inspección o una prueba operativa.

**Trazabilidad:** [FR-01](../../../specs/prd.md#rf-01), [FR-02](../../../specs/prd.md#rf-02), [FR-03](../../../specs/prd.md#rf-03), [FR-04](../../../specs/prd.md#rf-04) y [FR-16](../../../specs/prd.md#rf-16).

**Alcance:** candidata de demo, condicionada a que el video permita observar el fenómeno seleccionado. No presupone identificación individual entre cámaras ni reconocimiento facial.

| ID | Dado | Cuando | Entonces |
|---|---|---|---|
| US-01-AC1 | Un video continuo de internet, zonas configuradas y una versión registrada de esa geometría. | Se procesa un intervalo y se consulta una sección. | Cada métrica muestra intervalo, unidad, fuente, versión de zona y evidencia relacionada; el material se identifica como reproducción de archivo. |
| US-01-AC2 | Episodios seleccionados con anotaciones manuales y una misma persona visible en varios fotogramas. | Se calculan visitas y permanencia. | Los fotogramas no se suman como visitantes distintos; se reportan episodios observados, duraciones y cantidades de episodios completos e incompletos. Las diferencias frente a las anotaciones quedan registradas. |
| US-01-AC3 | Una interrupción del video o una zona oculta durante parte del intervalo. | Se calcula presencia media y se muestran resultados. | El tiempo no observable se excluye del denominador y queda declarado; la interrupción no se interpreta como cero personas ni como salida confirmada de todas ellas. |
| US-01-AC4 | Una fotografía o un seguimiento temporal insuficiente. | Se solicita permanencia o trayectoria. | La medida se declara no disponible con el motivo; el sistema conserva las observaciones instantáneas que sí pueda respaldar. |
| US-01-AC5 | Un resultado generado y las entradas versionadas. | Se exporta su evidencia. | El manifiesto identifica fuente, intervalos, geometría, anotaciones de comparación, configuración y limitaciones necesarias para revisar el resultado. |

**Bordes y límites:** un retorno a la sección puede ser otra visita; un episodio truncado no equivale a permanencia completa. No inferir interés, identidad, compras o conversión individual a partir de presencia. No unir clips de locales distintos como una secuencia. Las tolerancias de evaluación visual se fijarán con el material seleccionado antes de la prueba; no se asigna ahora una precisión prometida.

<a id="us-02"></a>
## US-02 — Gestionar una posible reposición

**Como** [encargado](personas.md#per-01) y [responsable de reposición](personas.md#per-02), **quiero** que el agente inicie y mantenga la gestión de un posible faltante por Slack y correo bajo una política autorizada, **para** responder lo necesario y conocer el resultado sin conducir cada mensaje.

**Trazabilidad:** [FR-03](../../../specs/prd.md#rf-03), [FR-06](../../../specs/prd.md#rf-06), [FR-07](../../../specs/prd.md#rf-07), [FR-08](../../../specs/prd.md#rf-08), [FR-09](../../../specs/prd.md#rf-09), [FR-10](../../../specs/prd.md#rf-10), [FR-11](../../../specs/prd.md#rf-11), [FR-12](../../../specs/prd.md#rf-12), [FR-14](../../../specs/prd.md#rf-14), [FR-16](../../../specs/prd.md#rf-16) y [FR-17](../../../specs/prd.md#rf-17).

**Alcance:** reposición es un escenario de referencia propuesto, pendiente de priorización. La demo puede iniciar desde una observación humana etiquetada si el material no permite detectar automáticamente un faltante; el agente inicia la coordinación a partir del evento. Slack/correo reales, respuestas correlacionadas, reportes y autonomía por política son mínimos del recorrido elegido aunque cambie el caso comercial. Sin cuentas, el prototipo queda parcial y no cumple esos mínimos.

| ID | Dado | Cuando | Entonces |
|---|---|---|---|
| US-02-AC1 | Un posible faltante con evidencia, stock fixture agregado sin ubicación, Slack conectado y política que permite consultar al responsable. | El evento llega al coordinador. | Abre el caso, consulta stock e inicia una pregunta Slack real sobre disponibilidad en bodega sin prompt ni aprobación por mensaje; no convierte el stock total en existencias de bodega ni confirma el faltante sin respaldo. |
| US-02-AC2 | La misma observación inicial y respuestas Slack alternativas de un responsable autorizado, vinculadas al hilo/caso. | Confirma disponibilidad, informa que no hay mercancía o declara imagen insuficiente. | La gestión cambia respectivamente a asignación sustentada si la política permite, consulta de entrega/alternativa o petición de verificación; se guardan respuesta real, IDs e información que motivó la decisión. |
| US-02-AC3 | Una acción rutinaria con cantidad sustentada, destinatario y condiciones cubiertas por política vigente, o una excepción que requiere decisión puntual. | El coordinador evalúa sus facultades. | Crea la tarea y registra política/versión sin aprobación ad hoc para la rutina; para la excepción conserva propuesta y espera autorización de actor facultado. Sin facultad no escribe. Compras/precios/compromisos reales quedan excluidos D0. |
| US-02-AC4 | Una acción autorizada por política o decisión puntual y un cambio de cantidad, destinatario, stock o política. | Se intenta ejecutar la acción dependiente. | Se revalidan las condiciones; continúa sin nueva decisión humana solo si la política cubre explícitamente el cambio. La aprobación puntual anterior no cubre parámetros modificados; se solicita la autorización que corresponda o se bloquea. |
| US-02-AC5 | Varias observaciones, decisiones concurrentes o autorizaciones puntuales con la misma clave de acción. | Se procesan, incluso si la primera escritura tuvo respuesta perdida. | Se mantiene un caso activo y una única tarea. Ante resultado desconocido se consulta la acción existente antes de repetir; una repetición del evento no reproduce el efecto. |
| US-02-AC6 | Un caso con conversaciones Slack/correo, consultas, políticas/autorizaciones, tareas y seguimientos persistidos. | Se recarga o reinicia la aplicación. | Se recuperan los mismos identificadores de caso/tarea/mensajes, estado, próximos vencimientos, actor, instantes y evidencia; no se programan avisos duplicados por reiniciar. |
| US-02-AC7 | El responsable reporta ejecución y existe o falta evidencia posterior suficiente. | Se revisa el cierre según el criterio registrado. | Se distingue confirmación humana de verificación visual. Si falta la evidencia exigida por el criterio, queda pendiente o bloqueado con motivo; tarea guardada y mensaje entregado no cuentan como reposición física. |
| US-02-AC8 | Un caso con evidencia, estado y destinatarios de reporte autorizados en Slack y correo. | El agente produce el reporte correspondiente al estado. | Envía ambos reportes realmente, con mismo caso/versión, período, procedencia, acciones y pendientes pertinentes para cada destinatario; no envía a terceros información fuera de su facultad. Se comprueba contenido en los destinos de prueba. La aceptación de API no se presenta como entrega o lectura. |
| US-02-AC9 | Una consulta real enviada por correo a un contacto de prueba autorizado antes de completar la gestión, y su respuesta correlacionada mediante IDs/hilo y relación con tienda/caso. | La respuesta reporta un impedimento o corrige información. | Se guarda el evento y se usa para decidir el siguiente paso antes de completar la gestión. El reporte posterior se comprueba por separado; responder solo al reporte no cumple esta consulta. Una instrucción no amplía permisos ni el asunto basta para autorizar cambios. |
| US-02-AC10 | Caso esperando respuesta con plazo, límite y ruta de escalamiento configurados. | Vence el plazo sin respuesta, llega respuesta/cierre o se pausa el agente. | Ejecuta el seguimiento/escalamiento previsto; respuesta/cierre/pausa cancela avisos futuros obsoletos y conserva transiciones. Reanudar revalida estado/política sin repetir avisos. No exige aprobación por recordatorio. |
| US-02-AC11 | Envío con timeout, rechazo/rebote o resultado incierto, y un evento entrante Slack/correo repetido. | Se recupera el proceso. | Conserva el estado real, consulta resultado si es posible, no reenvía ciegamente ni inventa entrega; el evento duplicado no duplica tareas/transiciones. Un mensaje sin correlación suficiente queda pendiente de revisión. |
| US-02-AC12 | Una política versionada y ventana de evaluación con acciones rutinarias elegibles, incluidas fallidas o pendientes al corte. | Se calcula autonomía operativa. | Publica acciones resueltas correctamente sin intervención ad hoc / elegibles, conteos y exclusiones; cero elegibles significa no disponible. Respuestas del personal y reposición física normal no se confunden con conducir al agente. |

**Bordes y límites:** sin SKU identificable se pide revisión de zona; no se inventa producto ni cantidad. Si no hay responsable o stock vigente, el caso conserva la información pendiente sin enviar a un destinatario arbitrario. Las comunicaciones D0 deben funcionar realmente mediante cuentas/destinatarios de prueba configurados; las cuentas aún no están disponibles. Una bandeja interna puede apoyar el desarrollo, pero no cumple integración. No se ejecutan compras, cambios de precio, compromisos comerciales ni movimientos contables de inventario reales. Un nuevo ensayo de demo debe distinguirse de la reanudación del mismo caso para interpretar correctamente la deduplicación.

<a id="us-03"></a>
## US-03 — Revisar ventas por producto y categoría

**Como** [responsable comercial y de compras](personas.md#per-03), **quiero** comparar productos y categorías mediante ventas y unidades netas, **para** priorizar preguntas comerciales y operativas con cifras reconciliadas.

**Trazabilidad:** [FR-05](../../../specs/prd.md#rf-05).

**Alcance:** capacidad comercial propuesta. En demo, las transacciones y sus resultados se identifican como ficticios; no representan compras efectuadas por personas del video.

| ID | Dado | Cuando | Entonces |
|---|---|---|---|
| US-03-AC1 | Un fixture versionado de POS con ventas, descuento, devolución y cancelación, más una convención explícita sobre impuestos, moneda y período. | Se calculan rankings y totales. | Las unidades netas y ventas netas coinciden con un resultado esperado calculado independientemente; no se duplican descuentos ya incluidos ni se contabilizan cancelaciones como ventas efectivas. |
| US-03-AC2 | Un catálogo con asignaciones de producto a sección comercial y fechas de vigencia. | Se agrupan ventas históricas por sección. | Se utiliza la relación válida para cada transacción y se muestran ventas sin asignación; los grupos y los no asignados permiten reconciliar el total POS. |
| US-03-AC3 | Un SKU exhibido físicamente en más de una zona y un ticket sin origen físico. | Se consulta cuál exhibición vendió ese producto. | Se declara que el origen físico no está determinado; el ranking comercial no se presenta como atribución a una exhibición. |
| US-03-AC4 | Costos ausentes, monedas no comparables o datos incompletos. | Se solicita margen o un ranking consolidado que depende de esos datos. | La salida declara lo no disponible y conserva grupos comparables; no inventa costos ni suma monedas sin una conversión definida. |
| US-03-AC5 | La misma línea POS importada más de una vez con su identificador estable. | Se actualiza la información comercial. | Se conserva una sola contribución de esa línea a los totales y queda identificada la versión de datos usada. |

**Bordes y límites:** “más comprado” debe indicar unidades netas o ventas netas, según la pregunta. Retirada/devolución al estante por visión es una capacidad futura distinta. Margen bruto no es utilidad neta. Las devoluciones se tratan según una convención documentada, sin cambiar silenciosamente el período de reconocimiento.

<a id="us-04"></a>
## US-04 — Proponer y evaluar un cambio de exhibición o promoción

**Como** [encargado](personas.md#per-01) y [responsable comercial](personas.md#per-03), **quiero** definir una intervención con responsable, aprobación y criterio de evaluación, **para** comprobar su ejecución y aprender de sus resultados.

**Trazabilidad:** [FR-05](../../../specs/prd.md#rf-05), [FR-07](../../../specs/prd.md#rf-07), [FR-08](../../../specs/prd.md#rf-08), [FR-09](../../../specs/prd.md#rf-09), [FR-12](../../../specs/prd.md#rf-12) y [FR-13](../../../specs/prd.md#rf-13).

**Alcance:** evolución P2, fuera del núcleo D0. No se ha aprobado activar promociones, modificar precios ni ejecutar cambios reales.

| ID | Dado | Cuando | Entonces |
|---|---|---|---|
| US-04-AC1 | Una pregunta comercial y datos disponibles con limitaciones conocidas. | El coordinador propone un cambio. | Registra hipótesis, producto/categoría, sección, vigencia, responsable, restricciones, métrica principal y criterio de evaluación; solicita lo imprescindible que falte. |
| US-04-AC2 | Una propuesta de exhibición, precio o promoción y una política con facultades diferenciadas. | Se solicita aprobación. | La solicitud se dirige al responsable configurado para esa acción; una aprobación de reposición no autoriza cambios comerciales. |
| US-04-AC3 | Una propuesta aprobada sin confirmación de ejecución efectiva. | Se evalúan resultados posteriores. | Se conserva la ejecución como no confirmada y no se atribuye al cambio un período en el que no consta que estuviera activo. |
| US-04-AC4 | Ventas antes/después y datos de promoción, sin comparación causal válida. | Se prepara la evaluación. | Se muestran diferencias descriptivas de unidades y ventas, disponibilidad y limitaciones; no se afirma que la promoción causó el cambio observado. |
| US-04-AC5 | Un producto promocionado, productos de su categoría y costos disponibles o ausentes. | Se analiza el resultado comercial. | Se puede revisar el conjunto de la categoría para observar cambios de composición; se informa margen solo con costos suficientes y no se equipara aumento de unidades a mejora económica. |
| US-04-AC6 | Un experimento propuesto para un piloto futuro. | Se registra antes de ejecutarlo. | Conserva pregunta, métrica, comparación, período, condiciones de ejecución, disponibilidad y supuestos. Sin diseño y evidencia suficientes, cualquier salida permanece descriptiva. |

**Bordes y límites:** ventas ficticias demuestran el cálculo, no el éxito de una promoción real. Otras promociones, estacionalidad, agotados y ejecución incompleta deben quedar visibles cuando afecten la comparación. Una señal de menor presencia no demuestra desinterés ni justifica por sí sola un cambio comercial.

<a id="us-05"></a>
## US-05 — Configurar fuentes, zonas y responsabilidades

**Como** [administrador de la instalación](personas.md#per-04), **quiero** registrar fuentes y configurar zonas, roles y responsables por tienda, **para** mantener trazabilidad y controlar qué puede consultar o ejecutar cada participante.

**Trazabilidad:** [FR-01](../../../specs/prd.md#rf-01), [FR-02](../../../specs/prd.md#rf-02), [FR-08](../../../specs/prd.md#rf-08), [FR-09](../../../specs/prd.md#rf-09), [FR-14](../../../specs/prd.md#rf-14), [FR-16](../../../specs/prd.md#rf-16) y [FR-17](../../../specs/prd.md#rf-17).

**Alcance:** archivo y fixtures para observación/datos comerciales; Slack/correo reales de prueba obligatorios D0, todavía sin cuentas disponibles. Alta de cámaras y conectores comerciales reales son P1, condicionados a acceso y compatibilidad. No se presupone proveedor de correo, protocolo ni stack implementado.

| ID | Dado | Cuando | Entonces |
|---|---|---|---|
| US-05-AC1 | Un video de internet y fixtures comerciales. | Se registran como fuentes. | Se conserva origen/enlace, tipo de fuente, referencia a condiciones de reutilización y atribución cuando aplique, tienda representada, período, zona horaria y versión; ninguna fuente ficticia se etiqueta como real. |
| US-05-AC2 | Observaciones producidas con una geometría de zonas y una posterior edición de esa geometría. | Se consultan observaciones anteriores y posteriores. | Cada una conserva la versión que la produjo; el cambio no reinterpreta silenciosamente resultados históricos. |
| US-05-AC3 | Roles, responsables, cuentas/canales y política versionada de una tienda con acciones, límites, plazos y escalamiento definidos. | Se crea una consulta/tarea/reporte o se evalúa una excepción. | Resuelve destinatario y facultad desde configuración vigente; ejecuta rutina cubierta sin aprobación por mensaje o solicita decisión puntual cuando corresponde. Sin responsable/facultad informa bloqueo y no elige arbitrariamente. |
| US-05-AC4 | Un actor autorizado para la tienda A y un caso o fuente de la tienda B. | Intenta consultar, modificar o aprobar datos de B. | Se deniegan lectura y escritura y se registra el intento; cambiar un identificador en la petición no evita el aislamiento. |
| US-05-AC5 | Texto en el video, en una fuente o en una respuesta del personal que ordena ampliar permisos o enviar información a otro destinatario. | El agente interpreta ese contenido. | Lo trata como información de la fuente y no cambia políticas, permisos ni destinatarios configurados por esa instrucción. |
| US-05-AC6 | Para un piloto futuro, una cámara/POS/inventario real con autorización y compatibilidad comprobadas. | Se verifica el conector y después se interrumpe la fuente. | Se distingue conexión disponible, error y antigüedad de los últimos datos; la última captura no se presenta como lectura actual y se exponen las limitaciones para las decisiones dependientes. |
| US-05-AC7 | Una ejecución con entradas y configuración versionadas. | Se exporta el manifiesto de evidencia. | Incluye identificadores, versiones, procedencia, intervalos, referencias, estado de envíos/respuestas y resultados necesarios para revisión, sin credenciales ni acceso a evidencia de otra tienda. |
| US-05-AC8 | Slack o correo no tiene cuenta, permiso de envío/recepción o destinatario configurado. | Se intenta habilitar el recorrido o aceptar D0. | Expone el requisito pendiente; una bandeja simulada no acredita integración. Tras configurar ambos canales se verifican envío real, recepción correlacionada y recuperación de caída antes de marcar aceptación. |
| US-05-AC9 | Un evento Slack/correo con identidad, cuenta y referencia de hilo/mensaje, o con datos inválidos/insuficientes. | El conector recibe el evento. | Valida origen y asociación con tienda/caso; procesa solo la información autorizada, deduplica el ID del evento y conserva los demás para revisión sin ejecutar acciones. El texto/asunto no sustituye identidad ni política. |

**Bordes y límites:** no almacenar secretos en documentos ni exportaciones de evidencia. La configuración de acceso y retención del piloto requiere acuerdo antes de conectar fuentes reales. Una compatibilidad documentada de un estándar no demuestra compatibilidad de una cámara particular. El administrador de instalación no obtiene automáticamente permisos comerciales.

## Decisiones pendientes para convertir historias en alcance de construcción

- Prioridad de demo entre uso de sección, coordinación de reposición y otras capacidades descritas.
- Video seleccionado y observabilidad real: fenómenos medibles, anotaciones y tolerancias de aceptación.
- Fixtures, respuestas del responsable, convención POS y caso que debe completarse de extremo a extremo.
- Cuentas de Slack/correo, permisos de envío/recepción, destinatarios, identidades y políticas de autonomía: canales elegidos, cuentas aún no disponibles.
- Responsables de implementar y revisar cada historia, límites de tiempo y dependencias.
- Línea base, criterios de negocio y fuentes reales del piloto; no extrapolar la aceptación de demo a validación comercial.
