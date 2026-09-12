# Preguntas y decisiones — PRD PanelaTeam

**Estado: pendientes de validación · 12 de septiembre de 2026**

Las respuestas conocidas se conservan separadas de las propuestas. Ninguna opción sugerida cuenta como aprobación. El PRD puede revisarse completo mientras estos puntos se resuelven; no se inicia implementación por el hecho de haberlo redactado.

## Confirmado en la conversación

| Asunto | Respuesta del usuario / evidencia |
|---|---|
| Equipo | “nuestro equipo es PanelaTeam” |
| Segmento | “tiendas seccionadas de abarrotes que tengan distincion” |
| Material de demo | “vamos a usar imagenes y videos de internet” |
| Visión | Conexión de cámaras, información estructurada y agentes que coordinen stock/cambios y evalúen secciones, productos, permanencia y promociones |
| Encargo vigente | “siguiendo con el proceso de HardcoreAI y AI DLC procede a construir el PRD” |

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

## Q-03 — Responsables, canal y autorizaciones

¿Quién configura, aprueba y ejecuta; qué canal e identidades se usarán?

[Answer]: Pendiente de nombres/roles y canal. No hay autorizaciones operativas externas registradas.

**Propuesta D0:** bandeja interna con identidades de prueba y tareas persistentes. Opciones P1: canal actual de la tienda o bandeja propia, con permisos y destinatarios explícitos. El selector de rol de una demo no equivale a autenticación real. Compras/precios requieren atribuciones separadas de administración técnica.

## Q-04 — Resultado y criterio de cierre

¿Qué mejora justificará continuar el piloto y qué evidencia basta para cerrar cada tipo de caso?

[Answer]: Pendiente de línea base, plazo, criterio de éxito y aprobador comercial.

**Opciones de resultado principal:** menor tiempo/carga de resolución; mejor ejecución de exhibición; resultado comercial de una promoción con evaluación adecuada. El borrador propone tiempo de resolución y alertas útiles para el ciclo A. Definir si cada cierre admite confirmación humana, requiere evidencia visual o ambas.

## Q-05 — Entorno, tiempo y presupuesto

¿Qué entorno, responsables técnicos y presupuesto tiene el equipo para construir y probar?

[Answer]: Pendiente. No se conocen stack, hardware, proveedores, presupuesto de llamadas, tamaño del equipo ni tiempo restante confirmado.

**Propuestas de calidad:** acuse ≤2 s y respuesta/estado de espera del agente ≤15 s en 20 interacciones registradas, sujetas a revisión del equipo y entorno declarado. No son mediciones ni SLA. Las tolerancias visuales dependen del material y deben fijarse antes de la evaluación reservada.

**Opciones de ejecución a comparar en diseño:** aplicación local; servicio alojado; procesamiento visual local con razonamiento remoto. La elección depende de acceso, observabilidad, costo y plazo. Para la hackathon confirmar el horario con organizadores; el plan 30/60/90 del PRD es otra escala.

## Revisión

Registrar cada respuesta, quién decidió, fecha y secciones afectadas. Una respuesta puede resolver varios puntos. Solo marcar aprobaciones después de recibirlas; no completar [Answer] con inferencias.

[PRD completo](../../../specs/prd.md) · [Estado de Inception](../../aidlc-state.md)
