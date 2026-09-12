# Panela Stocks · Auditoría de integridad y marca

**Fecha:** 12 de septiembre de 2026. **Base revisada:** `f4df2f9`. **Equipo:** PanelaTeam.

Se revisaron objetos Git, imagen publicada, assets del build, nombres visibles, evidencia de casos, migración SQLite, dependencias y coherencia de los documentos principales. Las comprobaciones describen esta revisión; no constituyen certificación de seguridad, del detector ni del piloto.

## Hallazgos y resolución

### P2 · La imagen no se mostraba por un fallo de entrega

El README y el visor de GitHub mostraban una imagen sin dimensiones decodificadas (`naturalWidth = 0`). Al abrir la URL directa del PNG, Chrome recibió **503 Backend.max_conn reached**, error **54113** de Varnish, en un nodo de caché de Bogotá. Una consulta HTTP independiente recibió `200 image/png` y el archivo completo. La disponibilidad difería entre solicitudes; no se atribuye el fallo a una subida incompleta.

El [PNG original](../../assets/panelateam-medellin.png) tiene **1254 × 1254 píxeles**, RGB y **2.748.537 bytes**. Firma, CRC de los chunks, descompresión y estructura de scanlines resultaron válidos. Archivo local y respuestas remotas coincidieron byte por byte:

- SHA-256: `e2ba2afa2dd12dcaa05737acc840e234df3f6aa5d6938caa4b71fbc702e8e314`.
- Blob Git: `99e8d5e31c174b281483d6fc0409fdc5cc3cc8e7`, igual en archivo local, HEAD y origin/main.
- Incorporado en `9965333089ac8db6aa835341e65daf5b5c602f9f`.

Se conserva el PNG sin modificar. El README separa la ilustración del equipo del logo del producto, limita su presentación a 420 × 420 y enlaza el PNG mediante una revisión fija en la URL directa. Esto evita una redirección y fija el contenido, pero no garantiza disponibilidad del CDN externo. La demo sirve sus logos desde su propio build.

### P2 · Los eventos posteriores reescribían la evidencia inicial

En la base revisada, `server/store.js` actualizaba `source.duration_s` con nuevos eventos de una visita, conservando el identificador, instante y confianza del primer evento. La modificación también ocurría después de cerrar o descartar el caso y no incrementaba su versión.

Reproducción aislada: evento inicial `(t=8, duración=5, confianza=.9)` y posterior `(t=12, duración=9, confianza=.3)` producían una fuente mezclada `(t=8, duración=9, confianza=.9)`. Un evento posterior al descarte volvía a cambiarla.

**Corregido:** el evento inicial permanece inmutable. Cada evento guarda su propio payload validado en `events.payload`. Los casos nuevos incluyen `source_integrity: "opening_event_v1"`; este marcador acredita conservación del evento, no exactitud del detector. La migración agrega la columna sin borrar filas ni reconstruir datos desconocidos. Eventos históricos quedan con payload nulo; sus casos no reciben el marcador. La interfaz advierte que la duración histórica puede haber cambiado. Las pruebas cubren reapertura, descarte, cierre y migración.

### P2 · La marca estaba actualizada solo en documentos

La PR anterior cambió la documentación, mientras `index.html`, `demo/panel.html`, mensajes nuevos y exportación todavía usaban PanelaTeam como producto. Se integraron logo, favicon, títulos, atribución al equipo y nombre de los mensajes/exportaciones como **Panela Stocks**. Los mensajes históricos persisten sin reescritura.

Los [SVG](../../public/brand/) adaptan la referencia «Local en cuadro» aportada por el usuario: toldo terracota, marco y acento salvia. El texto Georgia Bold está convertido a trazados; no requiere una fuente externa. El punto pertenece a la marca, no indica una conexión activa. La [procedencia](../../assets/README.md) distingue esta adaptación del vector original y de la ilustración generada del equipo.

### P2 · Había afirmaciones documentales desactualizadas

El resumen PVB y el PVB completo aún decían que no había aplicación. DESIGN conservaba dimensiones antiguas y una afirmación de falta de apilado móvil. Se concilian con el incremento implementado y se preservan las limitaciones de Slack/correo y validación comercial. Los registros históricos siguen identificados como antecedentes.

## Comprobaciones

- `git fsck --full --strict`: código 0; objetos sin referencias locales, sin corrupción identificada.
- SQLite de la demo: `integrity_check = ok` y cero infracciones en `foreign_key_check`. Copia local privada antes de activar la migración; fuera de Git.
- Escaneo acotado de archivos versionados: sin credenciales reconocibles. `.gitignore` excluye secretos locales, bases privadas, dependencias y build.
- `npm audit`: cero vulnerabilidades reportadas por el registro en la captura.
- `npm test`: **56 pruebas aprobadas**, incluidas las regresiones de evidencia y la advertencia histórica.
- `npm run build`: correcto. Logos visibles en la app y en el reporte; las dos superficies se comprobaron a tamaño de escritorio y con viewport solicitado al navegador de 390 px, sin desbordamiento horizontal observado.
- `npm run check:assets -- --built`: **4 originales y 3 copias** válidos. El [manifiesto](../../assets/integrity.json) fija hashes y tamaños. CI comprueba assets antes de pruebas y después del build; diez comprobaciones aisladas adicionales rechazaron alteraciones o SVG activo.

## Límite operativo pendiente

Slack/correo bidireccionales, identidades reales, despacho y seguimiento autónomos y reconciliación siguen pendientes. Esta revisión no conectó cuentas ni envió mensajes. La integridad estructural de SQLite no permite recuperar valores fuente que se sobrescribieron antes de esta corrección.
