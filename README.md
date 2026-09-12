# PanelaStocks · Operación de tiendas de abarrotes

![PanelaTeam en las montañas de Medellín](assets/panelateam-medellin.png)

Proyecto de PanelaTeam para **Agents, Everywhere**, AI Tinkerers Medellín, septiembre de 2026.

**Estado: demo funcional de video con una mesa de operación y casos trazables.** Detector local, seguimiento por zonas, permanencia, eventos y casos persistentes. Slack y correo siguen siendo obligatorios para la demo completa; este incremento tiene adaptadores salientes sin conectar y no implementa todavía respuestas entrantes.

## Ejecutar ahora

Requiere Node.js **22.13 o superior** y conexión a internet para instalar dependencias, cargar inicialmente el modelo y reproducir la referencia pública. Los archivos locales se procesan en el navegador.

```sh
npm ci
npm run dev
```

Abre [PanelaStocks local](http://127.0.0.1:5173). Pulsa **Analizar video**. La referencia CCTV del usuario ya está configurada; también puedes abrir un MP4/WebM local compatible con el navegador. No se descarga un video al repositorio ni se extraen píxeles de un iframe de YouTube.

1. Observa cajas, recorridos e IDs temporales sobre el video.
2. El umbral inicial de ocho segundos abre una revisión de sección. Es configuración exploratoria, no un umbral validado con tiendas.
3. Abre **Casos** y selecciona un expediente. Su hoja reúne la evidencia, las observaciones locales y los mensajes de Slack/correo en orden cronológico. El recorrido principal muestra las transiciones registradas del backend; el ciclo objetivo de siete etapas del PVB se consulta por separado. En **Registrar observación local**, confirma una situación con nota para recorrer las ramas con stock, sin stock o sin incidencia.
4. Una reposición solo se cierra después de asignarse y recibir confirmación explícita. El cierre es humano local, no verificación visual ni mensaje externo.
5. **Revisar instante en el video** pausa la fuente actual en el tiempo registrado cuando corresponde al mismo video; no ejecuta una verificación nueva. Exporta el registro JSON. Pausar, buscar otra posición o cambiar zonas no debe inflar la permanencia. Cambiar fuente, zonas o umbral inicia una nueva ejecución temporal.

Para probar y construir:

```sh
npm test
npm run build
npm start
```

El build se sirve en [localhost:8787](http://127.0.0.1:8787). La base SQLite vive en `data/private/panela.sqlite`, excluida de Git. `.env.example` describe la configuración opcional; no se necesitan credenciales para la visión y el recorrido local. [Contrato del backend y límites de los conectores](server/README.md).

La interfaz adopta [PRODUCT.md](PRODUCT.md) y [DESIGN.md](DESIGN.md) actualizados por el equipo en `b8e4071`: video y casos simultáneos, paleta cálida OKLCH y tipografía de sistema. El registro de cada caso conserva cronología y procedencia. En pantallas pequeñas la mesa se apila para mantener controles legibles. El panel de [ejemplos estáticos](demo/panel.html) contiene casos ficticios y se incluye en el build; la app ejecutable presenta los casos de SQLite. Las consultas preparadas, la aceptación de una API y la entrega confirmada son estados distintos.

## Qué está implementado

| Parte          | Evidencia y límite                                                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Visión         | COCO-SSD en TensorFlow.js sobre cuadros del video, sin enviar píxeles al modelo generativo. Carga inicial del modelo desde su proveedor.                                       |
| Seguimiento    | Asociación geométrica, zonas por centro inferior de caja, tiempo del video y visitas temporales. Puede cambiar IDs con cruces/oclusiones; no cuenta personas únicas.           |
| Operación      | SQLite, deduplicación, consulta de sección, confirmaciones locales, tarea, descarte/cierre y outbox para ambos canales. Inventario identificado como fixture.                  |
| OpenAI         | Propuesta opcional acotada por estado mediante Responses. Sin clave/modelo usa reglas explícitas. No hay razonamiento autónomo completo ni integración autenticada comprobada. |
| Slack / correo | Adaptadores salientes Slack/Resend y controles de destino. Pendientes de credenciales, pruebas reales y recepción correlacionada; la bandeja local no cumple FR-08.            |

El [manifiesto de la referencia](public/media-manifest.json) conserva procedencia y la clasificación PD-automated declarada por Commons. La [revisión del video y del commit `613ce94`](docs/research/04_Revision_Video_y_Cambios_PVB_2026-09-12.md) explica la decisión de construcción.

## Propuesta

Un agente observa situaciones de una tienda y lleva adelante gestiones con sus responsables por Slack y correo: consulta, coordina, hace seguimiento y reporta resultados, dentro de reglas previamente autorizadas.

El segmento inicial son tiendas de abarrotes con secciones diferenciadas. La visión incluye disponibilidad en exhibición, uso del espacio, desempeño comercial y evaluación de promociones.

## Ciclo completo objetivo

1. Observar permanencia por zona y pedir una revisión, o identificar un posible faltante cuando una fuente futura lo permita con evidencia suficiente.
2. Consultar inventario, ubicación de existencias y responsable.
3. Iniciar una conversación real por Slack; la respuesta cambia la siguiente gestión.
4. Asignar reposición bajo política o consultar disponibilidad por correo al contacto de prueba, incorporando su respuesta al caso.
5. Mantener seguimiento, verificar el cierre y entregar reportes por Slack y correo.

El usuario priorizó video y autorizó iniciar código. La grabación de referencia permite explorar circulación y permanencia; no demuestra falta de productos. La reposición requiere confirmar además el problema en exhibición.

Las comunicaciones rutinarias usan una política previa, sin aprobación por mensaje. Compras y cambios de precio reales quedan fuera de la demo. El equipo aún no dispone de cuentas de prueba; su preparación y conexión son una dependencia del recorrido.

## Documentación

- [Producto y alcance de implementación](PRODUCT.md), [sistema de diseño](DESIGN.md) y [adopción en la demo](aidlc-docs/construction/U01-manifest-interface.md).
- [PRD completo](specs/prd.md): 13 secciones de producto, requisitos y criterios de aceptación; borrador pendiente de revisión.
- [Proceso HardcoreAI y AI-DLC](specs/process.md): fuentes consultadas, adaptación y estado de las aprobaciones.
- [Estado de Inception](aidlc-docs/aidlc-state.md) y [preguntas pendientes](aidlc-docs/inception/requirements/requirement-verification-questions.md).
- [PVB vigente — Operación autónoma v0.2](docs/02_PVB_PanelaTeam_Operacion_Autonoma_v0.2.md): autonomía por política, Slack/correo, modelo de negocio, métricas y demo.
- [Bases del concurso y mejoras](docs/research/02_Bases_y_Estrategia_PanelaTeam_v0.2.md): fuentes verificadas y evidencia que deberá mostrar la demo.
- [System prompt y misiones para Perplexity](docs/research/03_Perplexity_Misiones_PanelaTeam_v0.2.md): material visual, mercado y crítica técnica; el usuario devolvió informes, revisados como insumos y no como pruebas de producto.
- [PVB v0.1 — antecedente](docs/01_PVB_PanelaTeam_Operacion_Abarrotes_v0.1.md): visión anterior conservada para trazabilidad.
- [Resumen del PVB](docs/PVB.md): lectura breve del alcance y los criterios de aceptación.
- [Procedencia de la imagen del equipo](assets/README.md).

## Evidencia y límites

- Las imágenes muestran presencia visible; movimiento y permanencia requieren seguimiento temporal.
- Las ventas provienen del punto de venta. Una retirada del estante no demuestra una compra.
- El inventario registrado y la disponibilidad visible son fuentes distintas.
- La demo prevista utilizará material de internet con condiciones de reutilización verificadas y datos comerciales ficticios identificados.
- Las conexiones de comunicación deben comprobarse en D0; cámaras/POS reales y resultados comerciales se validarán en el piloto. Un simulador de mensajes no satisface la integración de v0.2.

## Siguiente unidad

- Preparar workspace y buzones de prueba, contactos y política; comprobar un ida y vuelta real antes de ampliar la interfaz.
- Conectar recepción Slack y correo al mismo caso, con remitentes y permisos comprobados.
- Pasar de outbox manual de desarrollo a despacho, aclaración y seguimiento autónomos por política; reconciliar envíos inciertos.
- Anotar una muestra reservada de video y medir errores de detección, asociación y permanencia.
- Grabar la demo de dos minutos mostrando video y respuestas reales que alteran la gestión. La integración completa D0 sigue pendiente.
