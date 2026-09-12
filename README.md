# PanelaTeam · Operación de tiendas de abarrotes

![PanelaTeam en las montañas de Medellín](assets/panelateam-medellin.png)

Proyecto de PanelaTeam para **Agents, Everywhere**, AI Tinkerers Medellín, septiembre de 2026.

**Estado: diseño del PVB. Este repositorio todavía no contiene una aplicación ejecutable.**

## Propuesta

Conectar observaciones de cámaras, ventas, inventario y responsables de tienda para detectar situaciones que requieren atención, coordinar una acción y comprobar su resultado.

El segmento inicial son tiendas de abarrotes con secciones diferenciadas. La visión incluye disponibilidad en exhibición, uso del espacio, desempeño comercial y evaluación de promociones.

## Primer ciclo sugerido

1. Observar un posible faltante en una exhibición con evidencia suficiente.
2. Consultar inventario, ubicación de existencias y responsable.
3. Pedir confirmación cuando la información sea incompleta.
4. Proponer y registrar una tarea de reposición aprobada.
5. Verificar la ejecución con la evidencia disponible.

La elección de este ciclo sigue pendiente de confirmación del equipo. Requiere un video o una cámara cuyo encuadre permita observar el estante.

## Documentación

- [Diseño del PVB](docs/PVB.md): roles, datos, acciones y criterios de aceptación.
- [Procedencia de la imagen del equipo](assets/README.md).

## Evidencia y límites

- Las imágenes muestran presencia visible; movimiento y permanencia requieren seguimiento temporal.
- Las ventas provienen del punto de venta. Una retirada del estante no demuestra una compra.
- El inventario registrado y la disponibilidad visible son fuentes distintas.
- La demo prevista utilizará material de internet con condiciones de reutilización verificadas y datos comerciales ficticios identificados.
- Las conexiones reales, métricas de desempeño y resultados comerciales deben comprobarse durante la implementación y el piloto.

## Próximos pasos

- Confirmar el recorrido mínimo y seleccionar material visual adecuado.
- Elegir el stack y repartir responsabilidades del equipo.
- Preparar los datos de demostración y el directorio de responsables.
- Construir el recorrido con persistencia y respuesta a evidencia insuficiente.
- Verificar un caso normal, uno incompleto y un reintento sin tareas duplicadas.
- Preparar instrucciones de arranque y demo de dos minutos.
