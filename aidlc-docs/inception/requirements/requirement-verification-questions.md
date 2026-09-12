# Preguntas y decisiones — PRD Panela Stocks

**Versión 0.2 · Estado: decisiones parcialmente confirmadas; validación y gates pendientes · 12 de septiembre de 2026**

Las respuestas conocidas se conservan separadas de las propuestas. Ninguna opción sugerida cuenta como aprobación. El PRD puede revisarse completo mientras estos puntos se resuelven; no se inicia implementación por el hecho de haberlo redactado.

## Confirmado en la conversación

| Asunto | Respuesta del usuario / evidencia |
|---|---|
| Equipo | “nuestro equipo es PanelaTeam” |
| Solución | “Panela Stocks”; nombre confirmado por el usuario el 2026-09-12 |
| Segmento | “tiendas seccionadas de abarrotes que tengan distincion” |
| Material de demo | “vamos a usar imagenes y videos de internet” |
| Visión | Conexión de cámaras, información estructurada y agentes que coordinen stock/cambios y evalúen secciones, productos, permanencia y promociones |
| Método del PRD | “siguiendo con el proceso de HardcoreAI y AI DLC procede a construir el PRD” |
| Dirección vigente | Agente independiente en notificación e interacción con externos; reportes al menos por Slack y correo; revisar bases y mejorar PVB |
| Canales D0 | Slack y correo elegidos por el usuario; no implican adopción validada en el segmento |
| Cuentas de prueba | El usuario confirmó que no están disponibles; falta configurarlas |

Las publicaciones previas del PVB no representan aprobación de este PRD, de reposición como núcleo o de una arquitectura.

## Q-01 — Prioridad de la demo

¿Qué recorrido protagoniza la primera versión?

- A. Faltante → consulta de stock → reposición con cierre verificable.
- B. Uso de secciones → cambio de exhibición aprobado.
- C. Ventas/promociones → evaluación descriptiva y próxima acción.
- X. Otra prioridad descrita por el equipo.

[Answer]: Pendiente. Se presentó esta pregunta durante la elaboración; no hay respuesta registrada aquí.

**Propuesta del borrador:** A como escenario candidato, por cerrar un ciclo operativo concreto. Si se elige B o C, actualizar §8 del PRD y los escenarios obligatorios. Responsable de decisión: PanelaTeam, aprobador nominal TBD.

## Q-02 — Material y acceso

¿Qué video concreto permite observar el fenómeno elegido y qué acceso existe para el piloto?

[Answer]: Solo está confirmado el uso de material de internet para D0. No hay video seleccionado, tienda piloto ni accesos reales confirmados.

**Opciones de captura a evaluar:** video fijo con cobertura útil; fotografías para presencia puntual; observación humana etiquetada para probar coordinación mientras se valida captura. Elegir material y comprobar condiciones de reutilización antes de usarlo. Para P1 documentar modelo de cámara/grabador y fuentes POS/stock.

## Q-03 — Cuentas, responsables y políticas de autonomía

¿Qué cuentas, destinatarios e identidades se configurarán para Slack/correo y quién definirá las acciones, límites y escalamiento permitidos?

[Answer]: Slack y correo están elegidos; el usuario confirmó que no hay cuentas de prueba disponibles. Siguen pendientes workspace/app Slack, proveedor/cuenta de correo, permisos de envío/recepción, destinatarios autorizados, asociación identidad–tienda–caso, roles, política versionada y ruta de escalamiento. No hay una configuración operativa autorizada ni cuentas conectadas por redactar el PRD.

**Requisito D0 revisado:** consulta Slack iniciada por el agente y respuesta que cambia la decisión; reporte real por Slack y correo; una consulta de correo a contacto de prueba con respuesta correlacionada que determina el siguiente paso, seguida de reporte separado. Se usan cuentas reales de prueba y destinatarios autorizados. Un webhook solo de salida no demuestra interacción. Una bandeja interna puede apoyar desarrollo, pero no acredita integración; sin cuentas y pruebas el prototipo permanece parcial.

**Autonomía por concretar:** definir quién autoriza inicialmente consultas, avisos, reportes, tareas rutinarias, recordatorios y escalamiento; registrar condiciones, límites, vigencia y qué excepciones requieren decisión puntual. Las acciones cubiertas se ejecutan sin aprobación por mensaje. Compras/precios/compromisos comerciales reales quedan fuera de D0. El selector visual de rol, asunto de correo o texto recibido no sustituye verificar identidad, caso y facultades.

**P1:** comprobar con la tienda si Slack/correo encajan con su operación y configurar sus responsables reales; la preferencia de demo no valida adopción comercial.

## Q-04 — Resultado y criterio de cierre

¿Qué mejora justificará continuar el piloto y qué evidencia basta para cerrar cada tipo de caso?

[Answer]: Pendiente de línea base, plazo, criterio de éxito y aprobador comercial.

**Opciones de resultado principal:** menor tiempo/carga de resolución; mejor ejecución de exhibición; resultado comercial de una promoción con evaluación adecuada. El borrador propone tiempo de resolución, carga de comunicaciones y autonomía operativa para el ciclo A. Medir acciones rutinarias resueltas correctamente sin intervención ad hoc / elegibles según política; incluir fallidas/pendientes al corte y no confundir respuesta del personal o ejecución física normal con supervisar al agente. Baseline y meta siguen pendientes. Definir si cada cierre admite confirmación humana, requiere evidencia visual o ambas.

## Q-05 — Entorno, tiempo y presupuesto

¿Qué entorno, responsables técnicos y presupuesto tiene el equipo para construir y probar?

[Answer]: Pendiente. No se conocen stack, hardware, proveedores, presupuesto de llamadas, tamaño del equipo ni tiempo restante confirmado.

**Propuestas de calidad:** acuse ≤2 s y respuesta/estado de espera del agente ≤15 s en 20 interacciones registradas, sujetas a revisión del equipo y entorno declarado. No son mediciones ni SLA. Las tolerancias visuales dependen del material y deben fijarse antes de la evaluación reservada.

**Opciones de ejecución a comparar en diseño:** aplicación local; servicio alojado; procesamiento visual local con razonamiento remoto. La elección depende de acceso, observabilidad, costo y plazo. El [portal](https://medellin.aitinkerers.org/hackathons/h_kWaGpfQvrNc/) mostró entrega el 12 de septiembre de 2026 a las 16:30 UTC−5 durante esta revisión; comprobar avisos posteriores. El plan 30/60/90 del PRD es otra escala.

## Revisión

Registrar cada respuesta, quién decidió, fecha y secciones afectadas. Una respuesta puede resolver varios puntos. Solo marcar aprobaciones después de recibirlas; no completar [Answer] con inferencias.

[PRD completo](../../../specs/prd.md) · [Estado de Inception](../../aidlc-state.md)
