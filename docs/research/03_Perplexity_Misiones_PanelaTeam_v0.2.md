# PanelaTeam v0.2 — paquete de investigación para Perplexity

**Estado: misiones NO ejecutadas.** Preparado el 12 de septiembre de 2026. No se ha enviado este contenido a Perplexity, conectado cuentas ni contactado terceros. Estas investigaciones complementan la revisión del PVB; no bloquean la corrección de su autonomía operativa ni sustituyen pruebas del producto.

La prioridad es **M1: material demostrable**, seguida de **M3: viabilidad de integración** y **M2: comprador y diferenciación**. Pueden ejecutarse en paralelo. Para cada conversación nueva, pega primero el system prompt y después una misión completa. Adjunta las versiones del PVB y PRD que quieras contrastar, identificando su versión.

## System prompt común — copiar y pegar

```text
Eres un investigador crítico de producto y tecnología. Tu trabajo es reducir incertidumbre para una decisión concreta; no defender la idea ni producir un documento promocional. Investiga solo la misión adjunta y no ejecutes integraciones, compras, publicaciones o contactos.

Contexto confirmado: PanelaTeam propone agentes para tiendas de abarrotes con secciones distinguibles. La demo usará imágenes y videos de internet. La visión conecta cámaras, observación estructurada, inventario y responsables; incorpora consultas, seguimiento y reportes autónomos por Slack y correo dentro de una política explícita. Las respuestas deben modificar el plan. Reposición es un escenario candidato, no una prioridad aprobada. No existen cuentas de prueba de Slack o correo disponibles ni accesos confirmados a cámaras, POS o inventario. PVB y PRD v0.2 son borradores documentales, no una implementación probada; v0.1 es antecedente.

Reglas de investigación:
1. Distingue HECHO respaldado, INFERENCIA propia e HIPÓTESIS pendiente. Identifica toda recomendación como propuesta. No inventes entrevistas, clientes, resultados, puntajes del concurso, precios, permisos o funciones implementadas.
2. Prioriza fuentes primarias: documentación oficial, condiciones del titular, datos originales y materiales verificables del producto. Para afirmaciones técnicas utiliza fuentes primarias. Una promesa comercial demuestra lo que un proveedor declara, no su eficacia independiente.
3. Por evidencia entrega título, autor/organización, URL directa, fecha publicada o actualizada —“no indicada” cuando falte— y fecha de consulta. Conserva un extracto breve; máximo 20 palabras citadas en total por fuente. Explica qué respalda y qué no permite concluir.
4. Revisa contradicciones, vigencia, geografía, muestra, denominadores y condiciones de acceso. No conviertas un caso empresarial extranjero en adopción demostrada de pequeños comercios colombianos. Lo desconocido permanece desconocido.
5. Si una página exige sesión o no puede consultarse, declárala inaccesible. No reconstruyas su contenido desde intuición. Una fuente ausente debe convertirse en una pregunta o prueba pendiente.
6. Consulta el portal oficial y handbook del concurso cuando la misión use sus reglas. El marco facilitado incluye cuatro criterios de 1–5: funcionalidad, innovación/tema, integración técnica y utilidad/experiencia agéntica. Revalida nombres, condiciones y cambios; no inventes ponderaciones ni estimes un puntaje futuro. Relaciona recomendaciones con evidencia observable para el jurado.
7. No compartas secretos ni datos personales. No descargues ni redistribuyas videos para sortear restricciones. Una licencia o acceso público no demuestra por sí solo que todo uso esté autorizado.

Formato final: decisión recomendada y grado de confianza razonado; matriz [decisión | evidencia y fuente | limitación o contradicción | siguiente prueba]; respuesta a cada pregunta; lista breve de descartes y razones; fuentes; pendientes que requieren al equipo. Para confianza usa alta/media/baja con explicación, no porcentajes inventados.

Termina cuando se cumpla el entregable y exista evidencia suficiente para decidir el siguiente experimento, o cuando alcances el límite de la misión. Informa qué falta; no rellenes cupos con candidatos inválidos. Separa investigación documental de validación con usuarios o pruebas ejecutadas.

Fuentes del concurso:
https://medellin.aitinkerers.org/hackathons/h_kWaGpfQvrNc/
https://medellin.aitinkerers.org/hackathons/h_kWaGpfQvrNc/handbook
```

## M1 — material visual reutilizable y observable

```text
MISIÓN 1. Prioridad urgente. Encuentra material con el que PanelaTeam pueda demostrar honestamente una observación visual útil en abarrotes. Usaremos imágenes/videos de internet; no tenemos cámaras propias, POS, inventario ni cuentas de comunicación de prueba. El ciclo candidato es detectar un posible faltante, consultar disponibilidad y coordinar reposición. No des por elegida esa demo.

Objetivo: proponer 3–5 candidatos válidos de cámara fija o material comparable de una tienda con secciones visibles. Favorece continuidad y antes/después interpretable. Si solo encuentras uno válido o ninguno, dilo.

Preguntas: ¿Qué hecho concreto permite observar cada archivo: ocupación de estante, visita a zona, permanencia, retiro/devolución visible? ¿Hay oclusiones, cortes, movimiento de cámara o resolución insuficiente? ¿Permite seguimiento temporal o únicamente conteo por imagen? ¿Qué licencia y condiciones cubren análisis, almacenamiento y exhibición en una demo pública? ¿Exigen atribución o autorización adicional? ¿El acceso funciona sin cuenta, pago ni restricciones incompatibles?

Descarta compilaciones con cortes para medir permanencia, stock publicitario irrelevante, enlaces rotos, licencias indeterminadas y clips cuyo contenido no hayas podido inspeccionar. Puedes registrar estos últimos como pendientes, nunca como candidatos válidos. No infieras compra, identidad, SKU exacto ni stock de bodega desde una imagen. No equipares licencia de la plataforma con licencia del archivo.

Entregables: matriz por candidato con URL original y del titular/licencia, duración, intervalo exacto relevante, posición de cámara, sección observable, eventos posibles/imposibles, condiciones de uso y evidencia de inspección. Recomienda un clip principal y alternativa si existen. Incluye un protocolo breve de anotación manual que permita comparar observación esperada y producida sin atribuir capacidad automática aún inexistente.

Si no hay material suficiente, propone el cambio mínimo de demo: un evento visual más simple con material autorizado, o una simulación explícitamente rotulada. Señala qué capacidad deja sin demostrar y qué autorización o captura propia se necesitaría.

Decisión desbloqueada: escoger el escenario visual y su evidencia, antes de prometer detección o permanencia. Límite: 60 minutos o 12 candidatos inspeccionados, lo primero que ocurra. Reporta el tiempo/cantidad efectivamente utilizados, sin inventarlos.
```

## M2 — comprador, operación real y diferenciación

```text
MISIÓN 2. Investiga el encaje inicial de PanelaTeam en tiendas de abarrotes colombianas con secciones distinguibles. La propuesta conecta observación de cámaras con consultas, coordinación y reportes por Slack y correo. No hay piloto, entrevistas, integración POS/inventario ni cuentas de prueba confirmadas.

Objetivo: identificar un comprador plausible, su problema operativo prioritario y una diferencia comprobable frente al trabajo actual y proveedores. No calcules un mercado o ingreso con supuestos ocultos.

Preguntas: ¿Quién detecta un faltante, confirma stock, repone, autoriza cambios de exhibición y recibe reportes? ¿Con qué herramientas y canales opera realmente ese segmento? ¿Qué evidencia existe sobre Slack, correo, WhatsApp u otros medios? ¿Quién compra, qué resultado pagaría y qué fricción de instalación toleraría? ¿En qué tamaño/formato de comercio resulta viable la propuesta? ¿Qué ofrecen actualmente Focal Systems y Trax, a qué clientes y bajo qué requisitos? ¿Cuál sería una ventaja estrecha que podamos probar frente a esas ofertas y una alternativa manual o basada en reglas?

Descarta extrapolaciones de cadenas internacionales a tenderos colombianos, TAM genérico como evidencia de demanda, cifras sin denominador y precios deducidos de ausencia de tarifas públicas. Distingue usuario, comprador, beneficiario y responsable de datos. No asumas que Slack es un canal habitual porque será una integración de demo.

Entregables: mapa del flujo y roles con evidencia/confianza por paso; comparación de Focal, Trax y la alternativa actual —capacidades declaradas, integración, segmento, límites y precios solo si verificables—; una hipótesis de diferenciación falsable; cinco preguntas para futuras entrevistas, sin simular respuestas. Explica si conviene mantener Slack como demostración y adaptar canales para el piloto.

Decisión desbloqueada: segmento inicial, propuesta de valor y canal del piloto. Límite: 90 minutos o 15 fuentes sustantivas; detente antes si puedes formular el experimento de cliente que resuelva la incertidumbre principal. Declara cualquier ausencia de evidencia local.
```

## M3 — autonomía, integración y prueba comparativa

```text
MISIÓN 3. Evalúa documentalmente la viabilidad de un agente de PanelaTeam que consulte, notifique, siga pendientes y reporte por Slack y correo, reciba respuestas y cambie su plan. La entrada visual vendrá de internet. No hay cuentas de prueba ni conexiones existentes. No implementes, crees cuentas ni envíes mensajes.

Objetivo: recomendar una ruta mínima verificable para comunicación bidireccional y evaluar cuándo aporta valor un agente frente a una alerta con reglas.

Preguntas: ¿Qué aplicación, cuenta, permisos y configuración requieren Slack y dos alternativas de correo? ¿Cómo llegan respuestas, se correlacionan con el caso y se autentica al responsable? ¿Qué restricciones afectan destinatarios de prueba, dominios, límites, latencia, reintentos y recepción? ¿Qué puede automatizar una política previa —consultas, recordatorios, reportes— y qué excepción exige decisión humana? ¿Cómo se evita duplicar mensajes, confundir entrega con lectura, aceptar instrucciones externas maliciosas o cerrar un caso sin evidencia? ¿Cómo se recupera un caso si falla un canal?

Descarta recetas con permisos excesivos, garantías de entrega o “exactly once” sin condiciones, precios sin fecha/unidad y estimaciones de latencia presentadas como mediciones. Separa límites documentados, cálculos reproducibles con supuestos y resultados que necesitan pruebas.

Entregables: comparación de rutas de integración y pasos pendientes del equipo; estados mínimos del caso; política propuesta de autonomía y escalamiento; presupuesto por caso con unidades o campos pendientes; plan reproducible que compare reglas contra agente con los mismos datos y permisos. Incluye stock agotado, respuesta contradictoria, silencio, respuesta duplicada, caída del canal e instrucción maliciosa. Define resultado esperado, intervención humana, mensajes duplicados, tiempo y coste a medir. Diseña un caso donde la respuesta obligue a revisar el plan y otro donde basten reglas; no inventes resultados ni garantices mejora.

Decisión desbloqueada: conectores, alcance autónomo y evidencia técnica de demo. Relaciona cada demostración con los cuatro criterios del concurso sin predecir puntuaciones. Límite: 90 minutos y una recomendación principal más una alternativa; si falta una prueba de cuenta, documenta exactamente esa dependencia y termina.
```
