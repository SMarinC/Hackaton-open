# PanelaTeam: PVB para tiendas de abarrotes

**Borrador de diseño · v0.1 · 12 de septiembre de 2026**

## Estado y propósito

Está confirmado el equipo **PanelaTeam**, el segmento **tiendas de abarrotes con secciones diferenciadas** y el uso de **imágenes y videos de internet para la demo**. La visión solicitada conecta cámaras, estructura observaciones y coordina agentes con las personas responsables de stock, exhibiciones y promociones.

PVB significa aquí un alcance inicial para validar utilidad operativa y valor de negocio. Este documento propone un diseño; no acredita capacidades implementadas ni resultados. **La reposición como primer ciclo sigue siendo una propuesta pendiente de decisión.** Tampoco están confirmados el piloto, las integraciones o los canales de comunicación.

## Problema e hipótesis de valor

El encargado necesita convertir señales dispersas del local en acciones con responsable y resultado verificable. PanelaTeam propone conectar observaciones, datos comerciales y personas para detectar situaciones, aclarar lo que falta, gestionar una acción y comprobar su ejecución.

La hipótesis inicial es reducir el tiempo y trabajo necesarios para resolver faltantes en exhibición. El encargado sería la persona usuaria principal; reposición y compras participarían según el caso. El comprador, la frecuencia del problema y la disposición a pagar requieren validación.

## Qué puede aportar cada fuente

| Pregunta | Evidencia necesaria y límite |
|---|---|
| ¿Dónde hay personas? | Cámara y zonas configuradas: personas visibles durante el período. Cero observado y zona no observable son estados diferentes. |
| ¿Cuánto permanecen? | Video continuo y seguimiento: duración observada por visita a una zona. Reportar episodios incompletos; permanencia no demuestra interés. |
| ¿Qué sección vende más? | POS, catálogo y relación producto-sección vigente: unidades netas, ventas netas y margen, por separado. Un ticket no identifica la exhibición de origen si hay varias. |
| ¿Qué producto escogen? | POS confirma compras. Detectar retirada o devolución al estante exige encuadre e identificación específicos; son eventos diferentes. |
| ¿Hace falta reponer? | Vista del estante, ubicación esperada e inventario actualizado, con confirmación cuando falte información. La cámara no revela el stock total. |
| ¿Funciona una promoción? | Ventas, descuentos, costos, disponibilidad y comparación adecuada. Vender más durante una promoción no prueba su efecto causal. |

El seguimiento asocia detecciones entre fotogramas y puede fragmentarse por oclusiones; contar detecciones como visitantes duplicaría observaciones. [ByteTrack](https://arxiv.org/abs/2110.06864).

El inventario debe conservar ubicación, fecha y estado: existencias físicas, disponibles y en tránsito no son equivalentes. [Shopify documenta esta distinción](https://shopify.dev/docs/apps/build/orders-fulfillment/inventory-management-apps); se cita como referencia conceptual, sin elegir esa integración.

## Arquitectura y responsabilidades propuestas

El recorrido funcional sería: **cámaras → percepción → eventos con evidencia → contexto comercial → coordinación → acción registrada → evaluación**.

| Rol | Responsabilidad y salida |
|---|---|
| Observación | Revisar cobertura y estructurar eventos, medidas, intervalos y limitaciones. |
| Análisis comercial | Consultar POS, inventario y catálogo; relacionar hechos mediante cálculos verificables. |
| Coordinación | Elegir responsable configurado, pedir información, proponer acciones y conservar el estado del caso. |
| Evaluación | Comprobar ejecución y registrar cierre, bloqueo o necesidad de más evidencia. |

Son roles funcionales que pueden comenzar en un servicio. Captura, seguimiento y cálculos serían componentes especializados. Los agentes trabajarían sobre sus resultados.

La conexión directa exige comprobar cámara o grabador, autenticación, cobertura, resolución y tiempos. [ONVIF Profile T](https://www.onvif.org/profiles/profile-t/) define funciones de transmisión para sistemas IP; no garantiza compatibilidad de un establecimiento concreto. Antes del piloto se definirán acceso por tienda, retención y tratamiento de fragmentos. El alcance propuesto utiliza identificadores temporales de seguimiento, sin reconocimiento facial.

## Ciclo sugerido: reposición de exhibición

1. Registrar un posible faltante con evidencia y producto, únicamente cuando sea identificable.
2. Consultar inventario y responsable. Si solo existe un total por tienda, preguntar por disponibilidad en bodega.
3. Solicitar confirmación cuando imagen o datos sean insuficientes.
4. Con mercancía disponible, proponer reposición interna. Sin mercancía, consultar entrega prevista o preparar solicitud a compras.
5. Tras la aprobación correspondiente, guardar una tarea con responsable e identificador.
6. Recibir el reporte de ejecución y comprobar evidencia posterior disponible.
7. Cerrar indicando qué verificó el sistema y qué confirmó una persona.

Estados sugeridos: `detectado → en validación → propuesta → aprobado → asignado → ejecución reportada → verificado`. También: `descartado`, `bloqueado` y `cancelado`, con motivo.

Crear una tarea, entregar un mensaje y reponer físicamente son resultados distintos. Compras, precios y promociones requieren responsables y reglas específicos; una respuesta conversacional no amplía permisos.

## Contrato mínimo de información

Cada evento conservaría identificador, tienda, cámara, zona, intervalo, versión de configuración, medida, unidad, calidad, evidencia y procedencia. Debe distinguirse captura real, reproducción de archivo, dato sintético y anotación humana.

Cada caso añadiría fuentes consultadas y antigüedad, pregunta pendiente, propuesta, responsable, aprobación, acción, estado y criterio de cierre. Las observaciones repetidas actualizarían el mismo caso. Una clave estable por acción evitaría duplicar tareas en reintentos; ante una escritura incierta se consultaría su resultado antes de repetir. Stock o condiciones desactualizados exigirían revalidación.

## Demo y aceptación técnica propuesta

La demo representaría una tienda con zonas, un video adecuado y datos ficticios de POS e inventario claramente etiquetados. Una bandeja interna permitiría representar al encargado; conversación y tareas tendrían persistencia real.

Se conservarían enlace, condiciones de reutilización y atribución del material. No se mezclarían locales como una serie continua ni se presentarían ventas ficticias como compras observadas. Si el video no permite detectar faltantes, se usaría una observación humana etiquetada.

La aceptación técnica comprobaría:

- Caso normal completo, con tarea recuperable después de recargar.
- Imagen insuficiente o datos antiguos: solicitud de aclaración, sin conclusión inventada.
- Reintento de aprobación: una sola tarea persistida.
- Trazabilidad entre observación, consulta, decisión y tipo de evidencia de cierre.
- Comparación manual de eventos seleccionados y registro de errores, sin afirmar validación general.

## Validación de negocio y pendientes

El piloto mediría tiempo hasta resolver faltantes confirmados, proporción de alertas revisadas accionables y trabajo humano requerido, incluyendo falsas alertas y casos abiertos. Necesita una línea base y criterios de continuación acordados.

Promociones y cambios de exhibición serían una evolución posterior: definir pregunta, métrica, ejecución y comparación antes del cambio. La atribución exige supuestos y un diseño defendible. [Investigación sobre impacto causal](https://research.google/pubs/inferring-causal-impact-using-bayesian-structural-time-series-models/).

Queda decidir el primer ciclo, seleccionar video, confirmar tienda piloto, catálogo, acceso a POS/inventario, responsables, canal, equipo disponible y criterios de éxito. El siguiente paso es verificar la observabilidad del escenario y acordar sus entradas, respuestas y condición de cierre antes de implementar.
