# Personas — PanelaTeam

**Versión:** 0.1 · **Fecha:** 2026-09-12 · **Estado:** borrador de Inception para revisión.

Estas personas desarrollan el [PVB](../../../docs/01_PVB_PanelaTeam_Operacion_Abarrotes_v0.1.md) y acompañan el [PRD](../../../specs/prd.md). Son hipótesis de roles para tiendas de abarrotes con secciones diferenciadas; no proceden de entrevistas ni representan usuarios piloto confirmados. La redacción de estas personas e historias no implica aprobación de la etapa ni selección definitiva del escenario de demo.

<a id="per-01"></a>
## PER-01 — Encargado de tienda

**Objetivo:** convertir una señal del local en una gestión concreta, con responsable y resultado comprobable.

**Trabajo propuesto:** revisar observaciones por sección, aclarar condiciones que no aparecen en los sistemas, priorizar casos, aprobar acciones dentro de sus atribuciones y revisar su cierre. Necesita reconocer de inmediato qué se observó, qué fuente comercial se consultó, qué falta confirmar y cuál es la siguiente decisión.

**Información necesaria:** sección y período observados; evidencia y cobertura; stock con ubicación, estado y fecha; responsable de turno; propuesta, vencimiento y criterio de cierre.

**Permisos propuestos:** lectura de su tienda, respuesta a consultas y aprobación de las acciones operativas que una política le asigne. Ser encargado no concede automáticamente permiso para comprar, cambiar precios o acceder a otra tienda. Una respuesta de conversación no amplía permisos.

**Resultado a validar:** resolver situaciones con menos tiempo de coordinación y una carga de revisión aceptable. La línea base y la mejora necesaria para continuar el piloto siguen pendientes.

**Hipótesis por comprobar:** frecuencia de revisión, canal habitual, calidad del inventario, capacidad real de aprobar y disponibilidad para atender consultas.

**Historias relacionadas:** [US-01](stories.md#us-01), [US-02](stories.md#us-02) y [US-04](stories.md#us-04).

<a id="per-02"></a>
## PER-02 — Responsable de reposición

**Objetivo:** recibir una tarea ejecutable y comunicar con precisión lo que pudo hacer.

**Trabajo propuesto:** confirmar disponibilidad en bodega cuando sea necesario, revisar ubicación y cantidad solicitadas, ejecutar tareas autorizadas y reportar resultado o impedimento. Puede ser la misma persona que el encargado en una tienda pequeña; los permisos de cada acción siguen siendo explícitos.

**Información necesaria:** producto identificado o sección que debe revisar, ubicación, cantidad y unidad cuando estén sustentadas, aprobación aplicable, prioridad, instrucciones y forma de aportar evidencia.

**Permisos propuestos:** consultar y actualizar tareas asignadas, aportar confirmaciones y reportar ejecución o bloqueo. Reportar una reposición no modifica automáticamente el inventario contable ni demuestra por sí solo una verificación visual.

**Resultado a validar:** tareas comprendidas sin intercambios innecesarios, con impedimentos registrados y menos duplicados. No se presupone que la reposición será el primer escenario aprobado.

**Hipótesis por comprobar:** disponibilidad de dispositivos, tareas habituales, unidades de manejo, diferencia entre stock registrado y utilizable, y evidencia que puede aportar durante su trabajo.

**Historia relacionada:** [US-02](stories.md#us-02).

<a id="per-03"></a>
## PER-03 — Responsable comercial y de compras

**Objetivo:** decidir sobre surtido, pedidos, exhibiciones y promociones usando datos comerciales y condiciones operativas verificables.

**Trabajo propuesto:** revisar productos y categorías, analizar disponibilidad, evaluar solicitudes de compra, aprobar cambios comerciales dentro de su autoridad y definir cómo comparar el resultado de una intervención. El propietario podría desempeñar este rol; comprador del producto y disposición a pagar siguen sin validar.

**Información necesaria:** ventas y unidades netas reconciliadas con el POS; costos cuando existan; catálogo y asignación comercial por sección; promociones y ejecución; disponibilidad; limitaciones de comparación. La sección comercial de un SKU puede ser distinta de la exhibición física de origen de una compra.

**Permisos propuestos:** aprobación de compras, precios o promociones solo cuando la política le asigne esas facultades. Consultar resultados no implica permiso para ejecutar esos cambios.

**Resultado a validar:** decisiones y experimentos con hipótesis, responsable y métrica definidos. La demo con fixtures demuestra cálculos y flujo; no acredita efecto de promociones, aumento de ventas ni retorno económico.

**Hipótesis por comprobar:** acceso a costos, calidad de ventas y devoluciones, reglas de compra, presupuesto, autoridad para experimentar y criterio de continuidad del piloto.

**Historias relacionadas:** [US-03](stories.md#us-03) y [US-04](stories.md#us-04).

<a id="per-04"></a>
## PER-04 — Administrador de la instalación

**Objetivo:** configurar fuentes, zonas, usuarios y acceso por tienda para que los resultados sean interpretables y las acciones respeten sus permisos.

**Trabajo propuesto:** registrar procedencia, configurar secciones y geometría de zonas, versionar cambios, asignar roles y responsables y comprobar salud de fuentes. En la demo administra un archivo de internet, fixtures y una bandeja interna. La conexión directa a cámaras, POS e inventario reales corresponde al piloto y depende de compatibilidad y acceso confirmados.

**Información necesaria:** identificadores de fuente/tienda, períodos y zona horaria, derechos o condiciones de reutilización del material, configuración vigente, estado de conexión, directorio y políticas de acceso. Para el piloto también serán necesarias las decisiones sobre acceso y retención de evidencia.

**Permisos propuestos:** administrar configuración dentro de las tiendas asignadas. Administrar la instalación no concede de forma automática autoridad comercial ni acceso irrestricto a todas las tiendas.

**Resultado a validar:** poder reconstruir qué configuración produjo una observación y detectar fuentes inaccesibles o desactualizadas antes de usar sus resultados en una decisión.

**Hipótesis por comprobar:** quién instala y mantiene el sistema, compatibilidad de cámaras/grabadores, mecanismos de acceso comercial, frecuencia de cambios del local y costo de preparación.

**Historia relacionada:** [US-05](stories.md#us-05).

## Acuerdos pendientes que afectan a las personas

- Seleccionar el escenario prioritario de demo y confirmar quién representa cada rol.
- Identificar tienda piloto, responsables reales, turnos, facultades de aprobación y canal de comunicación.
- Observar el proceso actual y acordar línea base, métricas y criterio de continuidad.
- Confirmar acceso a cámaras, POS, inventario y catálogo sin asumir que ya existen integraciones.
