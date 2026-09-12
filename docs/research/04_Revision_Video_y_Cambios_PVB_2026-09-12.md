# PanelaTeam — revisión del video y ajustes propuestos al PVB

> **Nota de identidad — 2026-09-12:** **PanelaTeam** identifica al equipo y **Panela Stocks** a la solución. Esta revisión conserva su contexto de construcción original.

**12 de septiembre de 2026 · Decisión de construcción, pendiente de validación funcional.** Esta revisión incorpora el nuevo prompt de visión y el video indicado por el equipo. El objetivo inmediato es construir detección local de personas, seguimiento temporal y eventos por zona que alimenten casos persistentes. No acredita un MVP terminado, conexiones externas ni resultados de negocio.

## Evidencia visual y procedencia

La referencia es [HD CCTV Camera video 3MP 4MP iProx CCTV HDCCTVCameras.net retail store](https://www.youtube.com/watch?v=KMJS66jBtVQ), atribuida a HDCCTV Cameras. Su [ficha de Wikimedia Commons](https://commons.wikimedia.org/wiki/File:HD_CCTV_Camera_video_3MP_4MP_iProx_CCTV_HDCCTVCameras.net_retail_store.webm) enlaza ese mismo video y declara una duración de 1 minuto 51 segundos y resolución 1270 × 720. Describe una instalación de CCTV en una tienda de productos para el hogar. La fecha de ficha es 25 de diciembre de 2017; el texto superpuesto en el video indica 24 de diciembre. Se conserva la discrepancia: no se sustituye por una fecha de captura inventada.

La inspección del equipo en Chrome, alrededor de la posición 0:08, muestra una perspectiva elevada, acceso a la derecha, zona de caja a la izquierda e islas de exhibición centrales. Hay personas, muebles y oclusiones. Esta inspección parcial permite proponer regiones; no certifica continuidad del video completo, identificación fiable de SKU ni resultados del detector.

Commons clasifica el archivo como `PD-automated`, por su atribución a una cámara automática. Esta es la base de derechos declarada en la ficha; no es una autorización Creative Commons del titular ni una garantía sobre otros derechos. El [manifiesto del recurso](../../public/media-manifest.json) conserva el enlace, autor, fechas y alcance de inspección. Esta revisión no incorpora una copia del video ni reutiliza los JPG sin procedencia del paquete M1.

## Tres zonas operativas propuestas

| Zona | Señal observable propuesta | Límite |
|---|---|---|
| Entrada | Presencia y cruces de una región próxima al acceso | Un track nuevo no equivale a un visitante único |
| Caja | Ocupación y permanencia observada en la región de atención | No prueba compra ni distingue automáticamente cliente y empleado |
| Exhibición | Presencia y permanencia junto a islas centrales | No identifica categoría de abarrotes, interés, venta o faltante |

Las regiones se definirán sobre la imagen real con coordenadas normalizadas y versión. Son zonas operativas del material de demostración; no se asignarán nombres de productos que la evidencia no sostiene. El segmento objetivo del PVB continúa siendo abarrotes con secciones diferenciadas; este video no valida su representatividad.

## Decisión técnica

El flujo será `video → COCO-SSD local → ZoneTracker → regla → evento → caso persistente → coordinación`. El [modelo oficial de TensorFlow.js](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd) acepta video del navegador y devuelve cajas, clase y score. Se filtrarán detecciones de personas. No genera IDs persistentes ni calcula permanencia: `ZoneTracker` debe asociar detecciones, registrar entradas/salidas y reconocer pérdidas de seguimiento.

El [codelab oficial](https://codelabs.developers.google.com/codelabs/tensorflowjs-object-detection/) ofrece una referencia de detección y superposición local. La descarga inicial de bibliotecas/modelo puede necesitar red; procesar fotogramas localmente no equivale a disponibilidad completamente desconectada. La licencia del [código TFJS](https://github.com/tensorflow/tfjs-models/blob/master/LICENSE) se registra separadamente de los derechos del video.

La permanencia utilizará tiempo de reproducción, con inferencias sin solapamiento. Cambiar fuente, buscar otra posición o modificar regiones invalidará el seguimiento previo. Las pausas y los intervalos sin observación no deben inflar duración. Cada evento conservará fuente, posición temporal, región, track temporal, regla y versión; el score del detector no se presentará como precisión medida del sistema.

## Cambios propuestos al producto

La señal visual abre una comprobación contextual. **Permanencia y stock disponible no bastan para ordenar reposición**: el caso debe comprobar la necesidad en estante y las facultades de la política. El inventario de demostración será un fixture identificado; los estados históricos del video no se presentarán como una urgencia actual de esa tienda.

El agente podrá consultar, interpretar respuestas, recordar y reportar dentro de una política previa. Una respuesta deberá modificar el mismo caso. El cierre distinguirá confirmación humana, evidencia visual compatible o estado pendiente/bloqueado; una fotografía de otra tienda no será un “después”. Se requieren deduplicación y recuperación del caso tras reinicio.

**Slack y correo siguen siendo obligatorios por decisión del usuario/equipo**, incorporada en el [commit 613ce94](https://github.com/SMarinC/Hackaton-open/commit/613ce94d761c7b824c9ec600637b8bae34c985b5). Las [bases del concurso](https://medellin.aitinkerers.org/hackathons/h_kWaGpfQvrNc/) valoran integración útil, pero no exigen nominalmente estos dos canales ni garantizan puntos por conectarlos. Aún no hay cuentas de prueba disponibles: una bandeja local puede ayudar a desarrollar el flujo, pero no satisface por sí sola el requisito de intercambio y reportes reales en ambos canales.

## Evidencia necesaria para aceptar el MVP

Primero se anotará un intervalo continuo con entradas, permanencia y oclusiones esperadas. Después se contrastarán detecciones y tracks con esa anotación, mostrando errores y tiempos medidos. Se probará que pausa, salto temporal, repetición del evento y reinicio no producen duración o acciones falsas. Finalmente, dos respuestas de stock contrastantes deben cambiar el plan, persistir y producir reportes recibidos en Slack y correo. Hasta ejecutar estas comprobaciones, se mantiene el estado **en construcción**, sin afirmar aceptación de D0.
