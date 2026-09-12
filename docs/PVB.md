# Panela Stocks — resumen del PVB v0.2

**Solución:** Panela Stocks · **Equipo:** PanelaTeam.

**Product Vision Board · Borrador vigente: operación autónoma de tiendas de abarrotes.**

[PVB completo v0.2](02_PVB_PanelaTeam_Operacion_Autonoma_v0.2.md) · [PRD](../specs/prd.md) · [PVB v0.1 histórico](01_PVB_PanelaTeam_Operacion_Abarrotes_v0.1.md)

## Promesa y autonomía

El agente observa situaciones de una tienda y las gestiona con los responsables por Slack y correo. Consulta datos faltantes, decide la siguiente gestión, asigna tareas dentro de sus facultades, recuerda, escala y reporta resultados. La política se habilita previamente; las comunicaciones rutinarias no requieren aprobación por mensaje.

El personal aporta información y ejecuta el trabajo físico. El supervisor atiende excepciones. Compras, pagos y cambios de precio reales no forman parte de la demo. Una respuesta recibida no concede nuevos permisos.

## Demo recomendada

Posible faltante con evidencia → consulta de stock → hilo Slack → respuesta que modifica el plan → tarea de reposición o consulta de entrega por correo → respuesta correlacionada → seguimiento → cierre con evidencia → reporte por ambos canales.

La reposición es candidata, aún pendiente de selección del equipo. Se conserva la visión posterior de uso de secciones, ventas y promociones. La demo exige comunicación real con participantes de prueba y persistencia del caso. Una bandeja simulada acredita solo un prototipo parcial.

## Confirmado y pendiente

Confirmados: equipo PanelaTeam, solución Panela Stocks, tiendas de abarrotes con secciones diferenciadas, material visual de internet y necesidad de independencia con Slack/correo. El usuario confirmó que **todavía no hay cuentas de prueba disponibles**. Ya se eligió un video CCTV y se construyó el recorrido local de revisión por permanencia con JavaScript/Vite, Node.js y SQLite. Faltan cuentas/contactos, política operativa completa, presupuesto y criterios del piloto.

Existe una implementación parcial de video, casos y outbox, descrita en el [README](../README.md). No hay conexiones externas comprobadas ni resultados de desempeño comercial acreditados. Las fuentes conservan procedencia: video/replay/anotación, datos comerciales ficticios o reales. Cámara no prueba venta ni existencias en bodega; permanencia necesita seguimiento; una promoción requiere datos comerciales y evaluación adecuada.

## Cómo se comprobará el valor

- Respuesta humana diferente produce una gestión diferente, sin conducir al agente paso a paso.
- Slack y correo muestran ida y vuelta vinculada al mismo caso; reportes llegan a destinos de prueba.
- Reintento o reconexión conserva tareas y evita reenvío ciego.
- Se mide coordinación del supervisor, acciones rutinarias correctamente resueltas sin intervención puntual, ruido y cierre; la ejecución física se cuenta aparte.

Las [bases revisadas](research/02_Bases_y_Estrategia_PanelaTeam_v0.2.md) orientan estas mejoras, sin garantizar una nota. Las [misiones para Perplexity](research/03_Perplexity_Misiones_PanelaTeam_v0.2.md) definen investigación de material, mercado y crítica; el usuario aportó informes como insumos, sin que ello acredite validación del producto.
