# PanelaTeam · Operación de tiendas de abarrotes

![PanelaTeam en las montañas de Medellín](assets/panelateam-medellin.png)

Proyecto de PanelaTeam para **Agents, Everywhere**, AI Tinkerers Medellín, septiembre de 2026.

**Estado: PVB y PRD v0.2 en revisión. Este repositorio todavía no contiene una aplicación ejecutable ni canales conectados.**

## Propuesta

Un agente observa situaciones de una tienda y lleva adelante gestiones con sus responsables por Slack y correo: consulta, coordina, hace seguimiento y reporta resultados, dentro de reglas previamente autorizadas.

El segmento inicial son tiendas de abarrotes con secciones diferenciadas. La visión incluye disponibilidad en exhibición, uso del espacio, desempeño comercial y evaluación de promociones.

## Primer ciclo sugerido

1. Observar un posible faltante en una exhibición con evidencia suficiente.
2. Consultar inventario, ubicación de existencias y responsable.
3. Iniciar una conversación real por Slack; la respuesta cambia la siguiente gestión.
4. Asignar reposición bajo política o consultar disponibilidad por correo al contacto de prueba, incorporando su respuesta al caso.
5. Mantener seguimiento, verificar el cierre y entregar reportes por Slack y correo.

La elección de este ciclo sigue pendiente de confirmación del equipo. Requiere un video o una cámara cuyo encuadre permita observar el estante.

Las comunicaciones rutinarias usan una política previa, sin aprobación por mensaje. Compras y cambios de precio reales quedan fuera de la demo. El equipo aún no dispone de cuentas de prueba; su preparación y conexión son una dependencia del recorrido.

## Documentación

- [PRD completo](specs/prd.md): 13 secciones de producto, requisitos y criterios de aceptación; borrador pendiente de revisión.
- [Proceso HardcoreAI y AI-DLC](specs/process.md): fuentes consultadas, adaptación y estado de las aprobaciones.
- [Estado de Inception](aidlc-docs/aidlc-state.md) y [preguntas pendientes](aidlc-docs/inception/requirements/requirement-verification-questions.md).
- [PVB vigente — Operación autónoma v0.2](docs/02_PVB_PanelaTeam_Operacion_Autonoma_v0.2.md): autonomía por política, Slack/correo, modelo de negocio, métricas y demo.
- [Bases del concurso y mejoras](docs/research/02_Bases_y_Estrategia_PanelaTeam_v0.2.md): fuentes verificadas y evidencia que deberá mostrar la demo.
- [System prompt y misiones para Perplexity](docs/research/03_Perplexity_Misiones_PanelaTeam_v0.2.md): material visual, mercado y crítica técnica; investigaciones no ejecutadas.
- [PVB v0.1 — antecedente](docs/01_PVB_PanelaTeam_Operacion_Abarrotes_v0.1.md): visión anterior conservada para trazabilidad.
- [Resumen del PVB](docs/PVB.md): lectura breve del alcance y los criterios de aceptación.
- [Procedencia de la imagen del equipo](assets/README.md).

## Evidencia y límites

- Las imágenes muestran presencia visible; movimiento y permanencia requieren seguimiento temporal.
- Las ventas provienen del punto de venta. Una retirada del estante no demuestra una compra.
- El inventario registrado y la disponibilidad visible son fuentes distintas.
- La demo prevista utilizará material de internet con condiciones de reutilización verificadas y datos comerciales ficticios identificados.
- Las conexiones de comunicación deben comprobarse en D0; cámaras/POS reales y resultados comerciales se validarán en el piloto. Un simulador de mensajes no satisface la integración de v0.2.

## Próximos pasos

- Confirmar el recorrido mínimo y seleccionar material visual adecuado.
- Preparar workspace y buzones de prueba, contactos y política; comprobar un ida y vuelta real antes de ampliar la interfaz.
- Elegir el stack y repartir responsabilidades del equipo.
- Preparar los datos de demostración y el directorio de responsables.
- Construir el recorrido con persistencia y respuesta a evidencia insuficiente.
- Verificar un caso normal, uno incompleto y un reintento sin tareas duplicadas.
- Preparar instrucciones de arranque y demo de dos minutos.
