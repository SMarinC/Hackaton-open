# U01 — Adopción del manifiesto de operación

## Encargo y base

El usuario pidió descargar y revisar los documentos de producto y diseño publicados por el equipo y usarlos para regenerar la demo. Se integraron `5f09666` y el merge `3032622` antes de editar. Los nombres existentes en Git son `DESIGN.md` y `PRODUCT.md`.

El documento de diseño define «el manifiesto de bodega»: una columna de 760 px, hojas rectangulares, papel kraft/tinta, IBM Plex y un registro cronológico que integra canales. `demo/panel.html` aporta la referencia visual con casos ficticios; no sustituye el pipeline funcional de video.

## Traducción a comportamiento

- El video sigue siendo la entrada principal; conserva detector local, seguimiento, zonas y umbral editable. Las medidas actuales se leen en líneas de texto y filas, sin tarjetas KPI ni barra lateral.
- Un selector abre una hoja por caso persistido. La selección se conserva durante la sesión y una actualización no reemplaza un formulario abierto.
- La hoja reúne registros de sistema, anotaciones del operador y mensajes de salida, ordenados por sus fechas. El reloj del clip y la hora de registro en Bogotá están separados. No se duplica una anotación que ya está en la cronología.
- Las etapas se derivan de evidencia individual. Una tarea asignada no prueba una aprobación separada; un cierre humano no prueba verificación visual. Propuesta/aprobado pueden seguir sin registro aunque exista una tarea.
- Slack/correo muestran el estado real de cada operación y su procedencia. Los reportes del pie se calculan solo desde mensajes de reporte del mismo caso. Aceptación del proveedor no significa entrega confirmada.
- La acción de revisar el instante comprueba que la fuente activa coincide, pausa y busca el tiempo conservado. No identifica personas ni reconstruye cuadros/detecciones guardados. Los archivos locales tienen una identidad efímera: cambiar de fuente o recargar pierde el vínculo para saltar al clip, aunque el expediente persiste. La interfaz explica ese límite y no identifica un archivo solo por su nombre.
- El contenido dinámico se escapa antes de insertarlo; la tabla, los canales, los estados, formularios y foco tienen nombres/texto accesibles. Movimiento reducido desactiva el pulso de progreso.

`PRODUCT.md` se reconcilia con lo implementado: clip ya elegido, permanencia temporal incluida, imagen de identidad generada, diseño adoptado para prototipo y siete etapas como ciclo objetivo. No se modifica el PVB para reducir la obligatoriedad de Slack/correo ni se declara aceptación D0.

## Verificación

Las pruebas de `tests/case-manifest.test.js` ejercitan cronología, procedencia, etapas, aislamiento de reportes por caso y escape de contenido. Se ejecuta además la suite de visión, seguimiento, pipeline y backend y el build Vite. La comprobación manual del navegador y sus resultados se registran en `aidlc-docs/audit.md` al finalizar.

## Pendiente conservado

Cuentas y respuestas reales Slack/correo, coordinación autónoma completa, reconciliación externa y verificación de ejecución con evidencia posterior. La regeneración de la interfaz no resuelve ni oculta estas dependencias.
