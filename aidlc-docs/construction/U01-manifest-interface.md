# U01 — Mesa de operación y casos trazables

## Encargo y base

El usuario pidió descargar, revisar y adoptar los documentos de producto y diseño publicados por el equipo para regenerar la demo. Los nombres existentes en Git son `DESIGN.md` y `PRODUCT.md`.

Se integró primero `3032622`; antes de publicar llegó `b8e4071`, que redefine el diseño como «la mesa de operación»: video y casos simultáneos, paleta cálida OKLCH, tipografía de sistema sin webfonts y elevación por rol. La demo principal adopta esta revisión más reciente. La implementación inicial del manifiesto de una columna permanece en el commit `b95d489` de `feat/manifest-design-demo`.

## Traducción a comportamiento

- El video sigue siendo la entrada principal; conserva detector local, seguimiento, zonas y umbral editable. Las medidas actuales se leen con contexto, sin métricas comerciales inventadas.
- La mesa muestra el video y el expediente en dos columnas. Se amplía el espacio del expediente para acomodar la cronología, y en pantallas estrechas se apila la mesa para mantener controles legibles. Son extensiones al documento de diseño, cuya captura anterior no resolvía móvil.
- Un selector abre un caso persistido. La selección se conserva durante la sesión; la llegada de nuevos casos actualiza la navegación sin reemplazar el formulario abierto.
- La tabla del caso reúne registros de sistema, anotaciones del operador y mensajes de salida, ordenados por sus fechas. El reloj del clip y la hora de registro en Bogotá están separados. No se duplica una anotación que ya está en la cronología.
- El recorrido principal se deriva de transiciones conservadas: revisión, asignación/consulta, cierre/descarte. Una consulta sin stock no implica que exista una tarea ni permite cerrar directamente por reposición. El ciclo objetivo de siete etapas del PVB aparece en un detalle separado, con ausencia de evidencia explícita para propuesta, aprobación y verificación visual.
- Slack/correo muestran el estado real de cada operación. Los reportes del pie se calculan solo desde mensajes de reporte del mismo caso. Aceptación del proveedor no significa entrega confirmada. El texto de cada mensaje se consulta bajo demanda.
- Revisar el instante comprueba que la fuente activa coincide, pausa y busca el tiempo conservado. No identifica personas ni reconstruye cuadros/detecciones guardados. Los archivos locales tienen una identidad efímera: cambiar de fuente o recargar pierde el vínculo para saltar al clip, aunque el expediente persiste. La interfaz explica ese límite.
- El contenido dinámico se escapa antes de insertarlo; tabla, canales, estados, formularios y foco tienen nombres/texto accesibles. Movimiento reducido desactiva las animaciones.
- `demo/panel.html` conserva ejemplos estáticos explícitamente ficticios, distintos de los casos SQLite. Sus estados de mensaje respetan la cancelación de operaciones obsoletas; no acredita fotos o conversaciones reales. El build multipágina incluye el reporte y su CSS; los documentos se enlazan a GitHub.

`PRODUCT.md` se reconcilia con las capacidades existentes y las correcciones del equipo: clip elegido, permanencia temporal incluida, ilustración generada, diseño vigente y separación entre ciclo real y PVB. Se conserva la obligatoriedad de Slack/correo en D0.

## Verificación

Las 15 pruebas de `tests/case-manifest.test.js` ejercitan cronología, procedencia, ciclos real/objetivo, aislamiento de reportes por caso y escape de contenido. Se ejecuta además la suite de visión, seguimiento, pipeline y backend (53 pruebas en total) y el build Vite. La comprobación manual del navegador y sus resultados se registran en `aidlc-docs/audit.md`.

## Pendiente conservado

Cuentas y respuestas reales Slack/correo, coordinación autónoma completa, reconciliación externa y verificación de ejecución con evidencia posterior. La regeneración de la interfaz no resuelve ni oculta estas dependencias; no se declara D0 aceptado.
