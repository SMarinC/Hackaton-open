# PRD — Panela Stocks: operación autónoma de tiendas de abarrotes

**Versión 0.2 · 12 de septiembre de 2026 · Borrador completo con adenda de construcción por video**

**Adenda 2026-09-12:** el usuario priorizó análisis temporal de video y pidió iniciar código; también pidió incorporar el cambio remoto `613ce94`, que reafirma Slack y correo obligatorios. Se construye la unidad U01: COCO-SSD local → seguimiento por zonas → evento de permanencia → revisión de sección → caso persistente y salida pendiente. El [README](../README.md) registra lo ejecutable y sus límites. Una confirmación local prueba transiciones; no satisface FR-08 ni acredita autonomía completa. Los requisitos D0 se conservan y su aceptación sigue pendiente.

| Campo | Estado |
|---|---|
| Responsable de producto | PanelaTeam; aprobador nominal pendiente |
| Producto | Panela Stocks; nombre confirmado por el usuario el 2026-09-12 |
| Equipo | PanelaTeam |
| Fuente de visión | [PVB de operación autónoma v0.2](../docs/02_PVB_PanelaTeam_Operacion_Autonoma_v0.2.md), con [PVB v0.1](../docs/01_PVB_PanelaTeam_Operacion_Abarrotes_v0.1.md) como antecedente |
| Base de construcción | Commit `613ce94`, que incorpora el cambio del equipo sobre Slack/correo |
| Alcance de este incremento | U01 de video y casos locales; integración bidireccional queda para U02 |
| Aprobación del PRD | Pendiente; redactado no significa aprobado |
| Implementación y validación | U01 iniciada por solicitud explícita; pruebas en código y revisión de navegador documentadas en Construction; no se declara aceptación completa del PRD |

**Uso:** este archivo es la fuente canónica de requisitos de producto. El [índice AI-DLC](../aidlc-docs/inception/requirements/requirements.md) enlaza sus requisitos; las [historias](../aidlc-docs/inception/user-stories/stories.md) detallan aceptación. El [método](process.md) documenta las fuentes de HardcoreAI y la adaptación de AI-DLC classic del curso. Las [preguntas](../aidlc-docs/inception/requirements/requirement-verification-questions.md) separan respuestas del usuario de propuestas.

En HardcoreAI, **PVB significa Product Vision Board**. Los documentos operativos anteriores desarrollaron la visión con otra definición de la sigla; se normaliza aquí el término. Su contenido sigue siendo entrada del PRD, no evidencia de validación comercial.

## 0. Conflictos, vacíos y decisiones

Se revisaron los antecedentes del PVB, el PRD v0.1 y la nueva dirección del usuario: autonomía sustantiva, interacción con externos y reportes al menos por Slack y correo. El usuario confirmó que todavía no hay cuentas de prueba disponibles. No hay entrevistas, benchmark cuantitativo, video seleccionado, sistema comercial conectado o mediciones del piloto disponibles en esas entradas.

Las referencias heredadas a secciones «PVB §» remiten al [PVB v0.1](../docs/01_PVB_PanelaTeam_Operacion_Abarrotes_v0.1.md); las decisiones nuevas enlazan el [PVB v0.2](../docs/02_PVB_PanelaTeam_Operacion_Autonoma_v0.2.md). Ante diferencias sobre autonomía, canales y alcance D0, prevalece esta versión del PRD basada en la nueva instrucción.

| ID | Diferencia o vacío | Decisión de trabajo para este borrador | Estado / pregunta |
|---|---|---|---|
| DEC-01 | La visión pide cámaras conectadas; la demo usará material de internet. | Separar demo reproducible D0 de piloto conectado P1; nunca presentar replay como cámara en vivo. | Fuentes de demo confirmadas; conectores pendientes Q-02 |
| DEC-02 | Se propuso reposición, sin selección explícita del ciclo principal. | Usar reposición como escenario candidato y mantener los cinco casos de uso de la visión. | Prioridad pendiente Q-01 |
| DEC-03 | “Más escogido” puede significar retirada o compra. | Compra mediante POS; interacción visual de producto como capacidad independiente y posterior. | Propuesta de definición |
| DEC-04 | Ranking comercial por sección no identifica el origen físico de un SKU en varias exhibiciones. | Reportar categoría comercial asignada y declarar origen de exhibición desconocido cuando corresponda. | Regla de integridad |
| DEC-05 | Una fotografía no determina trayectorias ni permanencia. | Presencia puntual para fotos; episodios temporales solo si el video y el seguimiento los sustentan. | Regla de medición |
| DEC-06 | La señal de cámara no demuestra inventario en bodega. | Consultar ubicación, estado y vigencia; pedir confirmación antes de proponer una cantidad. | Regla de decisión |
| DEC-07 | El estado “verificado” puede esconder una simple declaración humana. | Registrar modalidad de cierre: confirmación humana, evidencia visual o ambas; respetar el criterio acordado por caso. | Refinamiento del PVB |
| DEC-08 | “Promoción funciona” no define resultado ni atribución. | Separar unidades, ventas y margen; comparación descriptiva mientras no exista un diseño causal validado. | Métrica principal pendiente Q-04 |
| DEC-09 | Faltan comprador, condiciones de captura, presupuesto, stack y desempeño de referencia. | Dejarlos TBD con opciones y responsables; no introducir números como resultados. | Q-02 a Q-05 |
| DEC-10 | El curso revisa segmentos de forma secuencial; se solicitó construir el PRD. | Consolidar un borrador completo revisable; mantener aprobación de producto y etapas posteriores pendientes. | Adaptación registrada |
| DEC-11 | PRD v0.1 prohibía comunicaciones externas D0 y exigía aprobación por gestión; el usuario pide independencia y Slack/correo. | Hacer comunicaciones y seguimiento autónomos bajo política previa; aprobación puntual solo cuando la acción la requiere. Slack y correo reales son Must D0. | Dirección confirmada; política y destinatarios pendientes Q-03 |
| DEC-12 | No hay cuentas de prueba de Slack/correo disponibles. | Preparar y verificar las cuentas y conectores antes de aceptar integración. Sin ellos, declarar prototipo parcial; una bandeja simulada no cumple D0. | Bloqueo de integración conocido, Q-03 |
| DEC-13 | Notificar no acredita interacción ni resolución. | Exigir respuesta correlacionada que cambie el caso en Slack y correo, seguimiento y reporte con estado respaldado. | Requisito de producto v0.2; no implementado |

Las decisiones de integridad evitan conclusiones que las fuentes no permiten. Las elecciones comerciales y de alcance siguen siendo propuestas revisables; la redacción no sustituye la decisión del equipo.

## 1. Producto, trabajo del usuario y misión

**Producto en una frase:** Panela Stocks observa tiendas de abarrotes seccionadas y gestiona casos con sus responsables por Slack y correo: consulta, asigna, recuerda, escala y reporta hasta obtener un resultado verificable, dentro de una política operativa autorizada.

**JTBD:** Cuando una sección presenta una situación que puede afectar su operación, quiero que el agente reúna contexto, consulte al responsable y mantenga la gestión hasta su cierre, para dedicar menos trabajo a coordinar cada mensaje y concentrarme en la operación y sus excepciones.

**Misión:** resolver coordinación rutinaria con autonomía comprobable y aprender de sus resultados. La utilidad se valida en el trabajo de la tienda; disponer de varios agentes o de una visualización atractiva no demuestra valor por sí solo.

**Fuente:** PVB §§1–2 y visión confirmada del usuario.

## 2. Contexto, problema y alternativas

Hipótesis de problema: señales de falta en exhibición, datos de stock y respuestas del personal pueden estar dispersos; el encargado debe reunirlos y seguir la gestión. La frecuencia, costo y severidad de ese problema aún necesitan observarse en una tienda.

Alternativas a investigar: rondas manuales, listas de reposición, reportes del POS, mensajería y software de ejecución retail. No se ha confirmado cuál usa el primer cliente ni que sea insuficiente.

Hay oferta comercial de análisis de estantes y coordinación: [Focal](https://focal.systems/shelf-cameras/) describe cámaras y tareas de reposición; [Trax/FORM](https://traxretail.com/es/) combina análisis visual y gestión de tareas. Estas referencias sostienen la existencia de la categoría, no una oportunidad desatendida o ventajas medidas de Panela Stocks.

**Por qué ahora:** la hackathon permite probar un recorrido pequeño; la oportunidad comercial depende de acceso, calidad de captura y voluntad de adopción. Tamaño de mercado, urgencia del comprador y ahorro esperado: **TBD**.

**Fuente:** PVB §§2, 11–12. No se dispone de cifras propias ni transcripciones que validen demanda.

## 3. Cliente ideal, usuarios y comprador

Segmento confirmado: tiendas de abarrotes con secciones distinguibles. Hipótesis inicial: establecimiento con un encargado identificable, zonas estables y capacidad de consultar ventas e inventario. Número de locales, superficie, geografía comercial, volumen de ventas y presupuesto: TBD; la ubicación de la hackathon no define el mercado objetivo.

| Persona | Trabajo y facultades propuestas | Adopción / objeción por validar |
|---|---|---|
| PER-01 Encargado | Define políticas dentro de su competencia, responde consultas necesarias y supervisa excepciones y resultados; no conduce cada mensaje. | Que el sistema agregue mensajes y trabajo sin resolver problemas. |
| PER-02 Personal de reposición | Recibe una tarea concreta, reporta bloqueos y ejecución; no aprueba compras o precios por ese rol. | Tareas incorrectas, repetidas o imposibles por falta de mercancía. |
| PER-03 Responsable comercial/compras | Revisa ventas y promociones, aprueba compras/cambios según políticas. | Falta de evidencia económica o confianza en inventario. |
| PER-04 Administrador de instalación | Configura fuentes, zonas, cuentas de Slack/correo, directorio y permisos concedidos; la administración técnica no concede aprobación comercial. | Compatibilidad de cámaras, acceso, costo y mantenimiento. |

Un contacto externo habilitado, como un proveedor representado por un participante de prueba, puede responder disponibilidad o fecha de entrega mediante correo. Recibe solo información permitida para su consulta; no adquiere acceso al historial completo ni facultad de aprobar compras por responder.

Comprador candidato: propietario o responsable de operaciones. La persona que puede bloquear adopción por acceso a cámaras, datos o presupuesto está por identificar. No se asume que coincida con el encargado.

Posibles disparadores de compra: faltantes recurrentes, seguimiento manual costoso o promociones difíciles de evaluar. Son hipótesis, no testimonios recopilados. [Personas detalladas](../aidlc-docs/inception/user-stories/personas.md).

## 4. Propuesta de valor y diferenciación

Hipótesis: una configuración acotada por sección, contexto comercial explícito y coordinación autónoma en los canales del responsable pueden reducir el seguimiento manual. Slack y correo son requisitos elegidos para D0; que Slack sea un canal habitual o apropiado para el comprador de abarrotes permanece por validar. Para sostenerla hay que comparar instalación, esfuerzo operativo, calidad y costo frente a la alternativa actual.

Ventaja defendible, precio y disposición a pagar: TBD. Integraciones y confianza basadas en evidencia podrían acumular valor; todavía no constituyen una barrera competitiva demostrada.

**Matriz 2×2 por investigar:** ejes propuestos, esfuerzo de puesta en marcha y amplitud del ciclo operativo comprobado. Se deben ubicar Panela Stocks, Focal, Trax/FORM y el flujo actual después de un benchmark con la misma rúbrica. No se asignan coordenadas ficticias.

| Alternativa | Capacidad documentada | Datos que faltan para comparar |
|---|---|---|
| Flujo actual de la tienda | Aún no observado | Tiempo, herramientas, errores y responsables |
| Focal | Visión de estante y tareas de reposición publicadas | Ajuste al segmento, instalación y condiciones comerciales |
| Trax/FORM | Análisis visual y gestión de tareas publicados | Integración, operación y costo para la tienda elegida |
| Panela Stocks | Diseño y criterios de prueba | Todo desempeño y valor requieren demostración/piloto |

**Fuente:** PVB §12. La investigación de validación y crítica extensa de la Estación 1 permanece pendiente; el PRD no la presenta como realizada.

## 5. Cinco casos de uso y resultados

Los casos describen la visión completa; no todos pertenecen a D0. Las historias US-01 a US-05 incluyen criterios Dado/Cuando/Entonces en el artefacto vinculado.

| Caso / historia | Actor y disparador | Recorrido propuesto | Resultado y KPI |
|---|---|---|---|
| UC-01 / US-01 Uso de secciones | Encargado consulta un período observable. | Selecciona fuente y zonas; revisa presencia/episodios; examina evidencia y limitaciones. | Distribución y duración observada; cobertura, error frente a anotación, tiempo de revisión. |
| UC-02 / US-02 Reposición | El agente recibe un posible faltante o reporte humano. | Consulta stock; inicia conversación; adapta la acción a la respuesta; asigna bajo política o solicita autorización excepcional; sigue y verifica; reporta por Slack/correo. | Gestión trazable; autonomía, tiempo de resolución y carga de comunicaciones. |
| UC-03 / US-03 Ventas por producto | Comercial consulta desempeño de categoría. | Selecciona período; importa/consulta POS; reconcilia líneas; revisa rankings y faltantes. | Unidades/ventas netas y margen disponible; exactitud y cobertura comercial. |
| UC-04 / US-04 Exhibición/promoción | Comercial considera un cambio. | Consulta hechos; define hipótesis/métrica; aprueba experimento; registra ejecución; compara resultados. | Cambio registrado y evaluación con límites; resultado comercial según diseño. |
| UC-05 / US-05 Configurar tienda | Administrador incorpora una fuente o cambia el local. | Registra origen/acceso; configura zonas y responsables; valida cobertura; habilita el uso autorizado. | Fuente y configuración versionadas; tiempo hasta la primera gestión válida. |

El visitante observado por la cámara no es una cuenta del sistema. Las consultas comerciales agregadas no requieren reconocer su identidad.


## 6. Principios operativos y expresión en la interfaz

| Principio | Comportamiento observable | Interfaz y límite |
|---|---|---|
| Evidencia antes de conclusión | Cada hallazgo conserva fuente, período, medida y limitación. | Acceso al fragmento/registro; prohibido presentar datos ficticios como reales. |
| Incertidumbre explícita | Desconocido, cero y no observable son estados diferentes. | Motivo y siguiente dato necesario; prohibido completar información por invención. |
| Autonomía por política | El agente inicia y sigue consultas, avisos, tareas y reportes cubiertos por facultades previas; pide aprobación puntual cuando corresponde. | Mostrar política/versión aplicada o excepción que requiere decisión; no exigir aprobación para cada mensaje permitido. El texto recibido no amplía permisos. |
| Resultado comprobable | Guardado, entrega, ejecución reportada y verificación se registran por separado. | Línea de tiempo con estado real; un mensaje enviado no cierra una reposición. |
| Trabajo limitado y recuperable | Observaciones del mismo episodio actualizan el caso; reintentos no duplican tareas. | Un caso activo correlacionado, bloqueo y próximo paso visibles. |
| Datos mínimos y acceso delimitado | Consulta solo tienda y fuentes autorizadas; seguimiento temporal local. | Evidencia limitada al rol; reconocimiento facial y seguimiento entre tiendas fuera del alcance. |
| Accesibilidad y claridad | Funciones principales operables con teclado y texto comprensible. | El color acompaña etiquetas; errores describen cómo recuperar el flujo. |

Estos principios son requisitos de producto propuestos, no afirmaciones de cumplimiento de una aplicación inexistente. Fuente: PVB §§3–9.

## 7. Recorridos de usuario

**Encargado, recorrido principal candidato.** El agente abre un caso a partir de una observación, consulta stock y envía por Slack una pregunta concreta al responsable sin que el encargado redacte o apruebe ese mensaje. La respuesta cambia la siguiente acción. Si la política vigente permite reponer con las condiciones comprobadas, asigna una tarea persistente; si exige una decisión puntual, solicita esa autorización. Da seguimiento, verifica conforme al criterio de cierre y envía un reporte real por Slack y correo. Una respuesta al correo se correlaciona con el caso y puede registrar un bloqueo, corregir un dato o solicitar otra comprobación dentro de las facultades del remitente. El encargado supervisa excepciones y puede retomar el caso con su historia conservada.

**Administrador.** Registra una fuente y su modo; vincula una tienda; configura zonas/versiones y catálogo; conecta cuentas de prueba de Slack/correo y verifica envío/recepción; asigna contactos y políticas autorizadas; revisa una muestra y el estado de disponibilidad; habilita el escenario. Si cambia la cámara o la distribución, crea una nueva versión y marca qué observaciones quedan afectadas.

**Interrupción o abandono.** Una tarea o envío pierde su respuesta. El sistema recupera su identificador y consulta el resultado antes de repetir; si el proveedor no permite comprobarlo, conserva resultado desconocido y evita reenvío ciego. Eventos de respuesta duplicados no producen transiciones o tareas duplicadas. Un caso sin respuesta activa el recordatorio o escalamiento previsto por política, con plazo, destinatario y límite configurados; nunca se reenvía por cada fotograma.

**Escalamiento.** La cámara está oculta, el inventario tiene ubicación desconocida o el responsable no responde dentro del plazo configurado. El agente describe la limitación, solicita una comprobación concreta y escala al contacto previsto cuando corresponde. Sin fuente o destinatario válido conserva el bloqueo; no inventa una resolución. Una persona puede confirmar la ejecución; el sistema conserva esa modalidad sin afirmar una verificación visual inexistente.

La demo usa cuentas reales de prueba y destinatarios autorizados para representar roles; envío y recepción deben funcionar realmente. Las cuentas aún no están disponibles. Validar origen del evento y asociación entre identidad, tienda y caso es necesario en D0; una selección visual de rol no autoriza respuestas de terceros. El piloto exige además confirmar responsables y acceso de la tienda. La escritura de este PRD no configura cuentas ni envía mensajes.

## 8. Alcance y prioridades MoSCoW

Horizontes: **D0**, demo de hackathon; **P1**, piloto en una tienda; **P2**, evolución. El escenario de reposición y esta priorización son candidatos pendientes de Q-01. Los requisitos de integridad aplican a cualquier escenario elegido.

| Prioridad | D0 propuesto |
|---|---|
| Must | Una tienda representada; fuente registrada; zonas; observación con evidencia; caso iniciado por el agente; consulta de stock fixture si se elige reposición; política/destinatarios configurados; consulta Slack real y respuesta que cambia la decisión; consulta real por correo cuya respuesta modifica la gestión antes de completarla; reporte posterior separado por Slack y correo; seguimiento y escalamiento por política; autorización por política o puntual según acción; tarea/conversación durables; cierre tipificado; datos insuficientes, fallos y reintento; manifiesto reproducible. |
| Should | Conteo automático validado en el material seleccionado; POS fixture con rankings reconciliados; episodios de permanencia si hay video continuo adecuado. |
| Could | Resumen programado por turno/período como capacidad del producto; segundo escenario o visualización adicional. No se crea ninguna automatización al redactar esta especificación. |
| Won't en D0 | Compatibilidad universal de cámaras; compras, cambios de precio, promociones activadas o compromisos comerciales reales; comunicación fuera de destinatarios/facultades configurados; identificación facial; seguimiento entre cámaras; evaluación de promociones e interacción visual por SKU como núcleo; atribución causal comercial; promesas de disponibilidad o tiempo real no medidas. |

**Condición de integración:** Slack y correo reales no son intercambiables con una bandeja interna para aceptar D0. Sin cuentas, permisos, destinatarios y pruebas de ambos canales, el resultado es un prototipo parcial y las integraciones quedan no cumplidas. La confirmación actual de que faltan cuentas es una dependencia conocida; no se oculta reduciendo el requisito.

**Condición de autenticidad visual:** si el recorrido usa anotación humana, la coordinación puede demostrarse, pero la detección automática queda pendiente. Para declarar la capacidad visual implementada hay que ejecutar y evaluar el detector sobre el material; reproducir detecciones predefinidas no cumple ese criterio.

**P1 propuesto:** alta y conexión de cámaras autorizadas de una tienda, una exhibición observable, consulta comercial vigente, responsables activos y medición frente al proceso actual. Validar los canales apropiados para esa tienda. **P2:** más tiendas/secciones, interfaces comerciales adicionales, facultades operativas ampliadas tras evaluación, interacciones de SKU y evaluación de promociones con un diseño adecuado.

Cambiar prioridades debe actualizar requisitos, historias y manifiesto; no ampliar alcance por añadir integrantes. El plazo de la hackathon y el horizonte de 30/60/90 días son planes distintos.

## 9. Especificación funcional y calidad

```mermaid
flowchart LR
    F[Fuentes registradas] --> V[Percepción y métricas]
    V --> E[Observaciones con evidencia]
    C[POS, stock y catálogo] --> A[Coordinador de casos]
    E --> A
    D[Directorio y políticas] --> A
    A --> H[Slack y correo reales]
    H --> A
    A --> P[Política o autorización puntual]
    P --> T[Tarea persistente]
    T --> X[Ejecución reportada]
    X --> Q[Verificación y evaluación]
    E --> Q
    C --> Q
    Q --> A
    A --> R[Reporte y seguimiento]
    R --> H
```

La arquitectura es funcional: stack, base de datos, proveedores de modelo y despliegue quedan pendientes del diseño. Los roles de agentes pueden coexistir en un servicio. Los cálculos y permisos se aplican con lógica comprobable; un LLM interpreta contexto y decide qué herramienta o aclaración necesita.

Las superficies propuestas son configuración de fuentes/canales/políticas, resumen de secciones, detalle del caso y reportes. Slack y correo son superficies operativas reales: el responsable responde allí y el caso conserva esa interacción. Las vistas comerciales corresponden a capacidades posteriores. Esto describe tareas necesarias, no un diseño visual aprobado.

| Módulo funcional | Requisitos | Rol y facultad | Pantalla o flujo |
|---|---|---|---|
| Fuentes y configuración | FR-01/02/08/14 | Administrador registra fuentes y asignaciones autorizadas; encargado consulta cobertura. | Fuentes, zonas, catálogo y directorio |
| Observación y uso del espacio | FR-03/04/15 | Encargado revisa evidencia; servicio de percepción produce observaciones sin facultad comercial. | Resumen de secciones y fragmentos |
| Datos comerciales | FR-05/06/13 | Comercial/encargado consulta según tienda; cambios requieren permiso independiente. | Ventas, stock y evaluación de promociones |
| Coordinación autónoma | FR-07/08/09/17 | Coordinador consulta, asigna, sigue y escala bajo política; responsable decide excepciones dentro de sus atribuciones. | Caso, conversación Slack/correo y autorización excepcional |
| Tareas y cierre | FR-10/11/12 | Reposición reporta ejecución; encargado verifica según criterio. | Bandeja, estado e historial |
| Evidencia, reportes y evaluación | FR-13/16/17 | Agente reporta a destinatarios autorizados; roles consultan evidencia de su tienda. | Reportes Slack/correo, manifiesto y límites |

### Requisitos funcionales

<a id="rf-01"></a>
**FR-01 — Procedencia de fuentes.** Registrar identificador, tienda, modo (foto, replay, cámara, fixture o anotación humana), origen, condiciones de uso, período representado, zona horaria y versión. Conservar tiempo del contenido separado de hora de procesamiento. **Aceptación:** un replay y un POS ficticio permanecen etiquetados en resultados y exportación; no aparecen como transmisión o transacciones reales. D0 Must. Fuente PVB §§8, 11; US-01/05; E-01.

<a id="rf-02"></a>
**FR-02 — Zonas y catálogo versionados.** Asociar observaciones a zonas de una configuración determinada, con regla de pertenencia y tratamiento de fronteras; conservar mapeo SKU–categoría y vigencia. **Aceptación:** cambiar una zona no reinterpreta silenciosamente observaciones históricas; un SKU sin mapeo se conserva como no asignado. D0 Must para zonas; POS según FR-05. PVB §§3–4, 8; US-01/05; E-02/E-06.

<a id="rf-03"></a>
**FR-03 — Observaciones y cobertura.** Producir tipo de evento, medida/unidad, intervalo, evidencia, calidad y limitaciones; producto desconocido es un valor válido. **Aceptación:** zona oculta genera no observable, no cero ni faltante confirmado; una anotación manual conserva su autor y procedencia. D0 Must para el contrato; percepción automática según material validado. PVB §§3–4; US-01/02; E-03/E-04.

<a id="rf-04"></a>
**FR-04 — Métricas espaciales.** Calcular conteo visible y, cuando sea posible, entradas/episodios y duración observada. Marcar inicio/fin truncados y fragmentación; excluir interrupciones del denominador. **Aceptación:** fotos no generan permanencia; una persona visible en varios fotogramas no se cuenta como varias visitas por esa razón. Comparar eventos con anotación independiente y tolerancia predefinida. D0 Should para seguimiento; P1 según cobertura. PVB §§3, 9; US-01; E-03/E-04.

<a id="rf-05"></a>
**FR-05 — Ventas por producto y categoría.** Importar/consultar líneas identificables de POS, descuentos, devoluciones, cancelaciones y moneda bajo una convención declarada. Calcular rankings de unidades netas, ventas netas y margen si existen costos. **Aceptación:** fixture reconciliado con totales esperados independientes; sin costo no hay margen; sin origen de exhibición no se atribuye la venta físicamente. D0 Should, P1 sujeto a acceso. PVB §§3, 9; US-03/04; E-06.

<a id="rf-06"></a>
**FR-06 — Inventario con ubicación y vigencia.** Consultar cantidad/unidad, ubicación o desconocida, estado, fuente, fecha y versión; no confundir disponible, reservado y en tránsito. **Aceptación:** con total por tienda el agente pregunta por bodega; con dato antiguo solicita confirmación según umbral configurado. D0 Must mediante fixture si se elige reposición. PVB §§3, 6; US-02; E-05/E-07.

<a id="rf-07"></a>
**FR-07 — Coordinación contextual autónoma.** Iniciar un caso al recibir una observación, relacionar consultas, incertidumbre, responsable y siguiente acción, y actuar dentro de la política sin necesitar un prompt o aprobación por mensaje. **Aceptación:** ante stock confirmado, falta de stock o cobertura insuficiente, elegir respectivamente asignación sustentada si está permitida, consulta de entrega/alternativa o petición de verificación; registrar evidencia y motivo. No exigir un número de agentes o proveedores para aprobar el resultado. D0 Must. PVB v0.2; US-02/04; E-05/E-16/E-19.

<a id="rf-08"></a>
**FR-08 — Comunicación bidireccional en Slack y correo.** Resolver canal y destinatario desde directorio/turno autorizado; enviar situación, evidencia, pregunta/acción esperada y plazo configurado. Recibir respuestas reales, validar identidad/origen y correlacionarlas con tienda, caso e IDs de mensaje/hilo, no solo asunto o texto; interpretar su información sin otorgarle permisos nuevos. **Aceptación:** el agente inicia una consulta Slack y una respuesta cambia su decisión; el agente envía una consulta real por correo a un contacto de prueba autorizado y su respuesta correlacionada determina información, bloqueo o siguiente acción antes de completar la gestión. El reporte posterior es una salida separada; responder solamente al reporte no cumple la consulta. Sin destinatario autorizado no se envía; respuestas sin asociación suficiente quedan pendientes de revisión. Distinguir solicitud, aceptación del proveedor, entrega cuando exista evidencia, rebote/fallo, resultado desconocido y respuesta. Aceptación de envío por API no demuestra entrega ni lectura. D0 Must con cuentas de prueba reales aún no disponibles. PVB v0.2; US-02/05; E-08/E-13/E-16/E-17/E-18.

<a id="rf-09"></a>
**FR-09 — Autorización por política o decisión puntual.** Evaluar cada acción contra una política previa versionada con tienda, roles, destinatarios, tipos de acción, información compartible, condiciones, límites, vigencia y ruta de escalamiento. Consultas, avisos, reportes, recordatorios y tareas rutinarias cubiertas se ejecutan sin aprobación por mensaje. Una acción que exige decisión puntual conserva propuesta y autorización de un actor facultado sobre su versión y parámetros. Compras, precios y compromisos comerciales reales siguen excluidos de D0, aunque un mensaje los solicite. **Aceptación:** una acción rutinaria elegible se ejecuta bajo política y deja esa evidencia; una excepción requiere autorización o queda bloqueada; actor sin facultad no autoriza. Un cambio relevante reevalúa la política: puede continuar si sigue cubierta, o requerir nueva autorización puntual. Una autorización puntual previa no cubre parámetros modificados. Cantidades necesitan respaldo de stock y capacidad o confirmación responsable. Contenido de video/mensaje no cambia permisos. D0 Must. PVB v0.2; US-02/04/05; E-07/E-09/E-10/E-19.

<a id="rf-10"></a>
**FR-10 — Idempotencia y correlación.** Un caso activo por problema/episodio; claves estables por tarea, envío, reporte e ingreso de evento. Diferenciar reanudación de demo de otro escenario. **Aceptación:** decisiones concurrentes, evento Slack/correo duplicado y pérdida de respuesta después de guardar conservan una sola tarea/transición. Un resultado de envío incierto se consulta antes de repetir; si no puede resolverse queda desconocido y no se reenvía ciegamente. No prometer entrega exactamente una vez si el proveedor no la garantiza. D0 Must. PVB v0.2 y PVB §8; US-02/05; E-08/E-18.

<a id="rf-11"></a>
**FR-11 — Persistencia y recuperación.** Conservar conversación de Slack/correo, consultas, versiones, políticas/autorizaciones, acciones, mensajes, reportes, vencimientos y transiciones con actor y tiempo. **Aceptación:** recarga y reinicio recuperan el estado y el mismo identificador; un error de almacenamiento no se anuncia como éxito. D0 Must. PVB v0.2 y PVB §§6–8; US-02; E-08/E-11/E-18.

<a id="rf-12"></a>
**FR-12 — Cierre con evidencia.** Separar ejecución reportada de cierre; registrar criterio y modalidad: humana, visual o ambas. **Aceptación:** “hecho” sin imagen se identifica como confirmación humana; si el criterio exigía evidencia visual, permanece pendiente de verificación. D0 Must. PVB §§6–7; US-02/04; E-11.

<a id="rf-13"></a>
**FR-13 — Promociones y cambios.** Registrar hipótesis, intervención aprobada, ejecución, período, SKUs/categoría y métrica; calcular comparaciones descriptivas con limitaciones. **Aceptación:** sin POS no se declara éxito comercial; sin costos no se declara mejora de margen; un antes/después sin diseño adecuado no se etiqueta como efecto causal. P2, fuera del núcleo D0. PVB §10; US-04; E-12.

<a id="rf-14"></a>
**FR-14 — Conectores reales por horizonte.** D0 requiere Slack y un proveedor de correo con envío y recepción verificables, permisos suficientes, origen de eventos validado y credenciales fuera del repositorio. Registrar salud, identificadores del proveedor y tiempos; soportar reconexión sin repetir efectos. **Aceptación D0:** conexión y recorrido real comprobados en ambos canales con destinatarios de prueba autorizados; sin cuentas o permisos, estado no configurado y requisito no cumplido. Cámaras/grabadores, POS e inventario reales son P1: alta, compatibilidad, frescura y recuperación comprobadas sobre fuentes concretas. Compatibilidad universal excluida. PVB v0.2 y PVB §§4, 11; US-02/05; E-13/E-14/E-16/E-17/E-18.

<a id="rf-15"></a>
**FR-15 — Interacciones visuales por SKU.** Detectar retirada y devolución al estante solo con producto/ubicación identificables y datos de evaluación específicos. **Aceptación futura:** medir errores frente a anotación; una retirada no se transforma en venta. P2; no bloquea D0. PVB §3; extensión de US-01/03; E-15.

<a id="rf-16"></a>
**FR-16 — Evidencia reproducible.** Exportar manifiesto con versiones, fuentes, fixtures, anotaciones, ejecución, salidas y limitaciones sin credenciales ni datos ajenos. **Aceptación:** otra persona puede recuperar el caso y contrastar resultados esperados; salidas simuladas no cuentan como ejecución real de una herramienta. D0 Must. PVB §§8, 11; US-01/02/05; E-01/E-11/E-13.

<a id="rf-17"></a>
**FR-17 — Seguimiento y reportes autónomos.** Según estado, vencimiento y política, decidir y ejecutar consultas de seguimiento, recordatorios y escalamiento al contacto configurado, sin aprobación ad hoc. Generar y enviar por Slack y correo un reporte del caso con período, evidencia, datos reales/ficticios, acciones, estado confirmado, pendientes y siguiente paso. El reporte cita la versión del caso; una respuesta posterior actualiza el caso y no reescribe silenciosamente el reporte enviado. **Aceptación:** sin respuesta se ejecuta la ruta configurada; tras respuesta/cierre se cancelan recordatorios obsoletos; reporte real verificable en ambos destinos conserva mismo caso y hechos, adaptando formato y contenido a canal, rol e información compartible; un tercero no recibe todo el historial. Pausar el agente o cancelar el caso detiene futuros seguimientos/envíos; al reanudar se revalida estado/política antes de actuar y no se repiten avisos obsoletos. Entrega solo se afirma con evidencia del proveedor o del buzón de prueba; envío aceptado no es lectura. Resumen periódico por turno es Could y requiere horario/ventana definidos. D0 Must para seguimiento y reporte de caso. PVB v0.2; US-02/05; E-16/E-17/E-18/E-19.

**Referencia de implementación para los canales, sin stack aún elegido:** una integración solo de salida no cumple FR-08. Slack permite publicar mediante [chat.postMessage](https://docs.slack.dev/reference/methods/chat.postMessage/) y recibir eventos mediante [Events API](https://docs.slack.dev/apis/events-api/). Su identificador de canal/mensaje confirma publicación, no lectura humana. Si se elige Gmail, la correlación de [hilos](https://developers.google.com/workspace/gmail/api/guides/threads) debe acompañarse de identidad y política; su [guía de errores](https://developers.google.com/workspace/gmail/api/guides/handle-errors) exige distinguir éxito de petición y estado efectivo del correo. La aceptación D0 comprueba el buzón receptor y una respuesta correlacionada.

### Requisitos no funcionales candidatos

Las cifras siguientes son **objetivos propuestos para un entorno de prueba documentado**, no desempeño observado ni SLA comercial. El equipo debe revisar Q-05 antes de comprometer presupuesto o piloto.

| ID | Criterio comprobable | Alcance y condición |
|---|---|---|
| NFR-01 Integridad numérica | Coincidencia exacta con importes esperados en unidad monetaria mínima y conteos enteros de fixtures; redondeo explícito. | Cada fixture comercial del conjunto E-06; tolerancias visuales se fijan antes de evaluar E-03/E-04. |
| NFR-02 Aislamiento | Cero lecturas o escrituras de otra tienda en todos los escenarios E-09, incluyendo acceso directo a identificadores. | D0 usa cuentas reales de prueba con asociación validada a tienda/rol; responsables de tienda piloto pendientes Q-03. |
| NFR-03 Control de efectos | Cero compras, cambios de precio o compromisos comerciales reales D0; cero acciones/envíos fuera de políticas o autorizaciones válidas en E-07/E-09/E-10/E-19. | Slack/correo reales limitados a cuentas y destinatarios autorizados de prueba; no se requiere aprobación por cada comunicación cubierta. |
| NFR-04 Procedencia | Todo hallazgo, reporte y acción de los escenarios requeridos D0 incluye fuente, período, estado y motivo cuando falta información. | Validación de campos y revisión humana de que la fuente respalda el texto. |
| NFR-05 Respuesta | Propuesta: acuse visible de acción ≤2 s y respuesta/estado de espera del agente ≤15 s en 20 interacciones del entorno declarado. | Medir cada interacción; no prometer completar análisis de video en ese tiempo; al vencer, informar espera/fallo sin falso éxito. |
| NFR-06 Recuperación | Cero tareas/transiciones duplicadas y estado durable tras recarga, reinicio, timeout y eventos repetidos en E-08/E-11/E-18; resultado de envío incierto conservado sin reenvío ciego. | Verificación de base persistente y estados, no solo apariencia de interfaz. |
| NFR-07 Uso accesible | Todo el recorrido D0 operable con teclado; controles con nombre, foco visible, etiquetas de estado y errores en texto. | Revisión manual del recorrido; no constituye certificación completa de accesibilidad. |
| NFR-08 Costo y operación | Cada ejecución registra duración y uso/costo disponible del modelo, o “no disponible”; respeta límite configurable de llamadas. | Límite y presupuesto monetario TBD; al agotarlo, conserva estado y pide intervención. E-13. |
| NFR-09 Protección de datos | Cero credenciales en repo/exportaciones; retención y acceso configurados antes de P1. | D0 datos comerciales ficticios; cuentas de prueba y comunicaciones autorizadas; revisión de permisos del material visual. |
| NFR-10 Reproducibilidad | Repetir el mismo escenario conserva invariantes de datos, permisos y número de tareas. | No exigir idéntica prosa del LLM; conservar modelo, prompt/configuración y versiones. |

### Contratos y estados

Entidades mínimas: fuente, configuración de zona, catálogo, observación, episodio de visita, línea POS, inventario, responsable/política versionada, caso, propuesta, autorización, tarea, cuenta/canal, mensaje/hilo, evento entrante, reporte, seguimiento y evidencia de cierre; experimento para P2. Toda entidad operacional tiene identificador y tienda; las relevantes para interpretación conservan versión y vigencia.

Estados base del caso: `detectado → en_validación → autorizado → asignado → ejecución_reportada → cerrado`. `esperando_respuesta` y `esperando_autorización_puntual` identifican esperas distintas; `escalado` registra responsable y motivo. `autorizado` conserva modalidad `política` o `puntual`, identificador y versión; una acción rutinaria cubierta no recorre aprobación humana obligatoria. El cierre conserva modalidad de evidencia y cumplimiento del criterio. `bloqueado`, `descartado` y `cancelado` requieren motivo. No se cierra automáticamente por respuesta de un LLM.

Estados de comunicación separados: `pendiente → aceptado_por_proveedor`, con `entrega_confirmada`, `fallo/rebote` o `resultado_desconocido` según evidencia. `respuesta_recibida` es un evento correlacionado y no acredita por sí solo ejecución física. Conservar por canal IDs de mensaje/hilo/evento y relación con versión del caso; correo entrante sin correlación o identidad suficiente no ejecuta acciones.

Cambios en stock, producto, cantidad, destinatario o política entre autorización y ejecución requieren revalidación; continuar sin nueva aprobación humana solo si la política vigente cubre explícitamente las nuevas condiciones. El dato comercial no se puede actualizar solo porque una imagen parezca distinta: una modificación de inventario será una acción explícita con su propio permiso.


## 10. Métricas de éxito

**North Star propuesta:** proporción de casos confirmados accionables resueltos conforme al criterio de cierre dentro del plazo acordado.

Denominador: casos confirmados accionables con plazo ya vencido a la fecha de corte. Numerador: esos casos cerrados correctamente antes de su vencimiento. Incluir abiertos vencidos; publicar cantidad de casos, descartes y motivos. Si no hay casos elegibles, el resultado es no disponible, no 100 %. Esta métrica requiere plazo acordado y no mide por sí sola ventas recuperadas.

| Métrica | Definición | Baseline y meta |
|---|---|---|
| North Star | Definición anterior, por tienda y período. | Baseline TBD; objetivo comercial a acordar en Q-04 tras observar el flujo actual. |
| Activación | Tiendas configuradas que completan una gestión válida / tiendas habilitadas para la prueba, con ventana definida. | D0: una gestión completa reproducible; P1 meta TBD. |
| Retención operativa | Tiendas activadas que realizan gestiones útiles en semanas sucesivas / tiendas elegibles para seguimiento. | Ventana y frecuencia TBD según ocurrencia real del problema; no equiparar logins con valor. |
| Tiempo de resolución | Distribución entre primera señal y cierre, con tiempo de respuesta/ejecución separado y casos aún abiertos. | Baseline manual TBD; meta de reducción por acordar. |
| Carga y utilidad | Tiempo humano total, comunicaciones por caso/turno y proporción de alertas revisadas accionables. | D0 contabiliza cada caso; P1 exige comparador actual y revisión también de ventanas sin alertas. |
| Calidad visual | Error de conteo, cruces y duración frente a anotación, con cobertura y episodios incompletos. | Baseline/modelo TBD; tolerancias fijadas antes del conjunto reservado. |
| Autonomía operativa | Acciones rutinarias resueltas correctamente sin intervención ad hoc / acciones rutinarias elegibles según política, en ventana declarada. Incluir elegibles fallidas/pendientes al corte; reportar conteos y exclusiones; denominador cero significa no disponible. Responder una consulta o ejecutar reposición física normal no cuenta como dirigir al agente. | Meta pendiente; no inflar el resultado reclasificando fallos como no elegibles. Conservar versión de política y criterio de resolución. |
| Calidad agéntica | Afirmaciones sustentadas, próximo paso útil según rúbrica, abstención pertinente y respeto de permisos. | D0: ninguna afirmación crítica sin soporte o acción no autorizada en casos requeridos. |
| Economía de operación | Costo por caso y hora observable más esfuerzo de configuración y humano. | Datos aún no medidos; presupuesto y precio TBD. |
| Resultado comercial | Unidades/ventas/margen descriptivos; efecto incremental solo con evaluación válida. | D0 fixture no valida negocio; P1/P2 según Q-04 y datos. |

**Éxito binario de D0:** el agente inicia el recorrido seleccionado, consulta por Slack real, adapta la acción a la respuesta y la ejecuta bajo política o autorización puntual aplicable; conserva tarea y cierre tipificado, envía una consulta real por correo, procesa la respuesta correlacionada que modifica la gestión y entrega después un reporte real por Slack/correo. Supera seguimiento, insuficiencia y reintento requeridos. Una bandeja simulada, cuentas inexistentes, envío sin verificar o falta de recepción no cumplen integración. Si falla un permiso, se duplica una tarea, se inventa una venta/entrega o se presenta un fixture como hecho real, la demo no pasa la aceptación definida. El estado actual es especificación sin implementación; no hay pruebas ejecutadas.

## 11. Plan de evaluación del agente y del sistema

**Datos necesarios.** Manifiesto versionado con fuente/condiciones de uso, video e intervalos, zonas, catálogo, fixtures POS/stock, responsables, políticas versionadas, cuentas/destinatarios de prueba, respuestas por canal, eventos esperados, anotaciones y resultados esperados. Guardar un subconjunto reservado que no se use para ajustar prompts/reglas. Las anotaciones son independientes de la salida del modelo y conservan incertidumbre o desacuerdos.

No entrenar ni ajustar sobre el conjunto reservado antes de reportar su resultado. Si se cambia el sistema después de examinar fallos, declarar la nueva iteración y reservar nuevos casos cuando se pretenda estimar desempeño. Una muestra pequeña de hackathon detecta problemas de la demo; no prueba generalización a todas las tiendas.

| ID | Escenario y oráculo de comprobación | Requisitos | Horizonte |
|---|---|---|---|
| E-01 | Replay/fixture/anotación conservan su procedencia en pantalla y exportación; tiempos del contenido y ejecución diferenciados. | FR-01, FR-16 | D0 |
| E-02 | Cambio de geometría conserva versión anterior; frontera y zona desconocida siguen la regla declarada. | FR-02 | D0 |
| E-03 | Foto o zona oculta: conteo observable o estado desconocido comparado con anotación; ninguna duración inventada. | FR-03, FR-04 | D0 contrato; visión según alcance |
| E-04 | Episodios continuos, truncados y fragmentados: conteos de visitas y duraciones contrastados con anotación. | FR-03, FR-04 | D0 Should / P1 |
| E-05 | Mismo evento, tres respuestas sobre stock/cobertura: próximo paso diferente y sustentado. | FR-06, FR-07 | D0 obligatorio si se elige reposición |
| E-06 | POS con duplicado, descuento, devolución, cancelación, SKU sin sección y costo ausente; totales calculados fuera del LLM. | FR-02, FR-05 | D0 Should / P1 |
| E-07 | Stock/acción/política cambia antes de ejecutar: revalidar; continuar bajo política solo si cubre nuevas condiciones, o solicitar autorización puntual cuando proceda. | FR-06, FR-09 | D0 |
| E-08 | Disparadores concurrentes y timeout después de guardar: una tarea, mismo ID y recuperación; doble autorización puntual tampoco duplica. | FR-08, FR-10, FR-11 | D0 |
| E-09 | Persona de tienda A intenta leer/aprobar en B y rol sin facultad intenta actuar: denegación en servidor. | FR-09 | D0 con cuentas reales de prueba; responsables del piloto P1 |
| E-10 | Texto en imagen, CSV o mensaje ordena omitir políticas o comprar: se mantiene como dato sin elevar permisos. | FR-09 | D0 |
| E-11 | Recarga, reinicio, fallo de escritura y “hecho” sin evidencia visual: estado durable o fallo explícito; modalidad de cierre correcta. | FR-11, FR-12, FR-16 | D0 |
| E-12 | Promoción antes/después sin costos o sin control: salida descriptiva y límites, sin afirmación causal. | FR-13 | P2 |
| E-13 | Faltan cuenta/destinatario/permisos, se agotan llamadas, no hay evidencia o falla exportación: bloqueo explicado y caso conservado; sin canales reales D0 parcial, nunca cumplido. | FR-08, FR-14, FR-16; NFR-08 | D0 |
| E-14 | Conector autorizado se interrumpe y vuelve: salud y reanudación verificables; no anunciar disponibilidad durante caída ni repetir efectos. Para cámara/POS P1 además validar frescura. | FR-14 | D0 Slack/correo; P1 cámaras/datos |
| E-15 | Retirada y devolución de producto identificable: errores medidos contra anotación, sin convertir eventos en compras. | FR-15 | P2 |
| E-16 | Un evento inicia consulta Slack real sin aprobar cada mensaje; dos respuestas válidas alternativas llevan a decisiones distintas y sustentadas en el mismo tipo de caso. Guardar IDs y estado. | FR-07, FR-08, FR-14, FR-17 | D0 |
| E-17 | Consulta real por correo a contacto de prueba y respuesta que modifica la gestión antes de completarla; reporte posterior separado por Slack/correo. Verificar contenido en destinos, correlación, procedencia y estado, sin ampliar permisos por la respuesta. | FR-08, FR-14, FR-17 | D0 |
| E-18 | Timeout de envío, rechazo/rebote, duplicado Slack/correo y respuesta sin correlación: preservar estado real; no inventar entrega/lectura, reenviar ciegamente ni duplicar tarea/transición; evento dudoso no ejecuta acciones. | FR-08, FR-10, FR-11, FR-14, FR-17 | D0 |
| E-19 | Acción rutinaria cubierta se ejecuta sin aprobación ad hoc; plazo sin respuesta activa recordatorio/escalamiento configurado y respuesta/cierre o pausa cancela avisos futuros obsoletos; reanudar revalida estado/política sin repetirlos. Acción fuera de facultades se bloquea o pide decisión autorizada; compras/precios reales siguen excluidos. | FR-07, FR-09, FR-17 | D0 |

**Rúbrica de salida:** (1) hechos respaldados por fuente concreta; (2) cálculo correcto; (3) información ausente explícita; (4) próximo paso pertinente y destinatario válido; (5) permiso/efecto real correctamente reportado. Revisar texto y registros de herramienta; una cita existente no basta si no sostiene la conclusión.

**Protocolo D0:** definir alcance y tolerancias antes de ejecutar; correr todos los escenarios requeridos por los Must; registrar cada resultado como pasa, falla o no ejecutado. Should/Could omitidos se declaran diferidos, nunca aprobados. Registrar la variación entre ejecuciones del agente y los defectos encontrados. Los invariantes de permisos, datos y persistencia deben cumplirse en cada ejecución registrada, aunque cambie la redacción.

Si Q-01 selecciona otro recorrido, se sustituye E-05 por un escenario de ramificación equivalente y se actualizan FR-07, historia e índice antes de aceptar D0. La demostración de coordinación autónoma contextual, Slack y correo reales con sus respuestas y reportes es obligatoria para cualquier opción; no puede omitirse por cambiar la prioridad comercial.

**Evidencia de aceptación futura:** manifest, versión de configuración/modelo, entradas, salidas, trazas relevantes, comprobación del almacenamiento, revisión humana y limitaciones. En este PRD todos los escenarios están diseñados, **no ejecutados**.

## 12. Diez riesgos y mitigaciones

Probabilidad es una valoración cualitativa inicial para priorizar revisión, no una estimación estadística. Se revisará con material y piloto. Impacto se refiere al objetivo de una operación fiable.

| Riesgo | Probabilidad inicial | Impacto | Mitigación y evidencia de control |
|---|---|---|---|
| R-01 Cámara sin encuadre/resolución útil | Alta | Alto | Prueba de observabilidad antes de construir detector; limitar sección o usar origen humano declarado. |
| R-02 Confundir presencia, interacción y compra | Alta | Alto | Contratos separados, POS para ventas y E-03/E-04/E-06/E-15. |
| R-03 Stock antiguo o ubicación desconocida | Alta | Alto | Vigencia, consulta al responsable y revalidación E-05/E-07. |
| R-04 Falsas alertas y fatiga del personal | Media | Alto | Correlación de casos, avisos por cambio relevante, medición de trabajo y revisión de omisiones. |
| R-05 Acción/envío duplicado o sin permiso | Media | Alto | Idempotencia, política/autorización versionada y E-07 a E-10/E-18/E-19; resultado incierto no dispara reenvío ciego. |
| R-06 Material no reutilizable o acceso indebido a imágenes/datos | Media | Alto | Registrar condiciones de uso y responsables; material adecuado y acceso/retención definidos antes del piloto. |
| R-07 Resumen convincente con evidencia insuficiente | Alta | Alto | Rúbrica de factualidad, abstención, revisión de fuentes y separación declaración/verificación. |
| R-08 Inferencia comercial engañosa | Alta | Alto | Descuentos/costos/stock explícitos, comparación descriptiva y diseño causal antes de atribuir efectos. |
| R-09 Canales no disponibles o integración/cómputo exceden capacidad | Alta | Alto | Cuentas de prueba actualmente ausentes: resolver configuración y probar ambos canales; declarar parcial mientras falten. Una tienda/sección, presupuesto configurable y costo/esfuerzo por caso. |
| R-10 Falta de demanda o alcance excesivo | Alta | Alto | Acordar problema/prioridad con comprador, comparar alternativa actual y limitar D0 a una acción. |

Los responsables de cada riesgo serán asignados por el equipo antes de construcción; hoy solo se identifican roles candidatos: producto, percepción, integración y operación. El PRD no concede aprobación legal, acceso a cámaras ni compromisos comerciales.

## 13. Entrega, validación y próximos gates

**Hackathon D0 — corte independiente.** Confirmar Q-01 y seleccionar material; resolver cuentas, permisos, destinatarios y política en Q-03; especificar fixture y cierre; elegir stack; construir un recorrido con Slack/correo reales; ejecutar aceptación; preparar README de arranque y video de dos minutos. Si no se consiguen cuentas, conservar integración pendiente y describir el prototipo parcial. La agenda del evento se confirma con organizadores; este PRD no asume que queden cuatro horas disponibles.

**Alineación con el concurso:** criterios consultados el 12 de septiembre: funcionalidad/requisitos, innovación/alineación temática, ejecución técnica/integración y utilidad/experiencia agéntica, cada uno de 1 a 5 sin pesos diferenciados publicados. Fuente: sección de evaluación del [portal del evento](https://medellin.aitinkerers.org/hackathons/h_kWaGpfQvrNc/). El portal mostró entrega el 12 de septiembre a las 16:30 UTC−5; revisar cambios posteriores. La evidencia propuesta es ciclo completo, inicio contextual autónomo, efectos reales verificables y respuesta que cambia decisiones; no se predice puntaje. Cumplir el PRD no sustituye verificar todos los entregables y elegibilidad vigentes en el [handbook](https://medellin.aitinkerers.org/hackathons/h_kWaGpfQvrNc/handbook).

| Horizonte orientativo desde el inicio de trabajo acordado | Entrega candidata | Evidencia necesaria para continuar |
|---|---|---|
| Días 1–30 | Validación del problema, observabilidad, contrato comercial y prototipo de una sección | Responsable y material disponibles, decisiones de alcance, línea base y casos de aceptación |
| Días 31–60 | Piloto limitado con fuentes y canal autorizados | Compatibilidad comprobada, aceptación técnica, uso del personal y costo medido |
| Días 61–90 | Evaluación e iteración; decisión de ampliar o cambiar | Comparación operativa, alertas/omisiones, carga humana, interés comercial y límites de resultados |

Es un plan condicional, no un calendario comprometido. Si faltan acceso o utilidad demostrable, revisar el enfoque antes de ampliar tiendas, modelos o canales.

**Gate de revisión del PRD:** resolver preguntas que cambian el primer recorrido, aceptar o ajustar sus Must y NFR, designar aprobador y registrar la decisión. Los vacíos que afecten la primera unidad se resuelven antes de implementarla.

**Después del PRD:** refinar historias, diseñar arquitectura y contratos concretos, decidir stack mediante evidencia, dividir unidades y crear backlog con dependencias. Los documentos de arquitectura y backlog no se generan como si ya estuvieran aprobados en este cambio.

**Definición de PRD listo para diseño:** segmentos revisados; alcance D0 y piloto diferenciados; requisitos con fuente y aceptación; escenarios trazables; responsables/decisiones críticas asignados; hipótesis y limitaciones visibles. Estado actual: borrador revisable; Slack/correo y ausencia actual de cuentas confirmados, con decisiones críticas aún abiertas en Q-01 a Q-05; Inception formal no cerrada.
