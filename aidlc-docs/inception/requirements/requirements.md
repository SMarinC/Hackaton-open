# Índice de requisitos — PanelaTeam

**Inception documental · Borrador v0.1 · Validación y aprobación pendientes**

## Intención y alcance

Solicitud: construir el PRD siguiendo HardcoreAI y AI-DLC. Tipo: producto nuevo, con un repositorio que actualmente contiene documentación y assets. Alcance de producto: varios sistemas (visión, datos comerciales y coordinación); alcance de este cambio: documentación. Complejidad propuesta: alta por incertidumbre visual y efectos operativos. Profundidad: detallada para requisitos; stack y diseño de implementación posteriores.

Se inspeccionó el workspace sobre la base `bac57df`; no había app, configuración de build o tests de producto. Se trata como greenfield. No hay ingeniería inversa de aplicación que completar.

## Fuente única

Los requisitos normativos candidatos están en [specs/prd.md](../../../specs/prd.md). Este archivo es un índice de trazabilidad; no mantiene otra versión de sus reglas. Todo cambio de ID, prioridad o aceptación se hace en el PRD y se refleja en sus historias.

| Requisito | Necesidad / fuente del PVB | Historia | Evidencia de aceptación diseñada |
|---|---|---|---|
| [FR-01](../../../specs/prd.md#rf-01) Procedencia | §§8, 11: distinguir datos reales, replay y fixtures | US-01/05 | E-01 |
| [FR-02](../../../specs/prd.md#rf-02) Zonas/versiones | §§3–4, 8: interpretar observación y categoría vigentes | US-01/03/05 | E-02, E-06 |
| [FR-03](../../../specs/prd.md#rf-03) Observación/cobertura | §§3–4: evidencia antes de concluir | US-01/02 | E-03, E-04 |
| [FR-04](../../../specs/prd.md#rf-04) Visitas/permanencia | §§3, 9: métricas temporales defendibles | US-01 | E-03, E-04 |
| [FR-05](../../../specs/prd.md#rf-05) POS/rankings | §§3, 9: compras y resultados comerciales | US-03/04 | E-06 |
| [FR-06](../../../specs/prd.md#rf-06) Inventario | §§3, 6: ubicación, disponibilidad y vigencia | US-02 | E-05, E-07 |
| [FR-07](../../../specs/prd.md#rf-07) Coordinación | §§5–6: siguiente paso contextual | US-02/04 | E-05 |
| [FR-08](../../../specs/prd.md#rf-08) Responsable/canal | §§5–7: consulta dirigida y seguimiento | US-02/04/05 | E-08, E-13 |
| [FR-09](../../../specs/prd.md#rf-09) Aprobación | §§7–8: atribuciones y propuesta vigente | US-02/04/05 | E-07, E-09, E-10 |
| [FR-10](../../../specs/prd.md#rf-10) Idempotencia | §8: evitar duplicados | US-02 | E-08 |
| [FR-11](../../../specs/prd.md#rf-11) Persistencia | §§6–8: recuperar trabajo y efecto real | US-02 | E-08, E-11 |
| [FR-12](../../../specs/prd.md#rf-12) Cierre | §§6–7: distinguir modalidades de evidencia | US-02/04 | E-11 |
| [FR-13](../../../specs/prd.md#rf-13) Promociones | §10: experimentos y límites de atribución | US-04 | E-12 |
| [FR-14](../../../specs/prd.md#rf-14) Conectores reales | §§4, 11: piloto conectado | US-05 | E-14 |
| [FR-15](../../../specs/prd.md#rf-15) Interacción SKU | §3: retirada/devolución distinta de compra | Extensión US-01/03 | E-15 |
| [FR-16](../../../specs/prd.md#rf-16) Manifiesto | §§8, 11: demostración reproducible | US-01/02/05 | E-01, E-11, E-13 |

Fuente PVB: [documento completo](../../../docs/01_PVB_PanelaTeam_Operacion_Abarrotes_v0.1.md). [Historias](../user-stories/stories.md) y [personas](../user-stories/personas.md).

## Calidad y completitud

NFR-01 a NFR-10 se definen en el PRD §9: integridad numérica, aislamiento, permisos de efectos, procedencia, respuesta, recuperación, uso accesible, costo, protección de datos y reproducibilidad. Los umbrales propuestos requieren revisión; no se ha medido desempeño.

Las seis dimensiones consideradas por el análisis son comportamiento funcional, requisitos de calidad, escenarios y fallos, negocio, integraciones y fronteras, y atributos de operación/mantenimiento. Los vacíos que afectan alcance o aceptación están en [preguntas](requirement-verification-questions.md).

**Estado de todos los FR/NFR:** redactados para revisión, no implementados ni aprobados. E-01 a E-15 son escenarios de aceptación futuros; ninguno se marca como ejecutado. Diseño, unidades, código y evidencia de pruebas se enlazarán cuando existan.

La preparación del índice y de historias es parte del borrador de PRD autorizado. No afirma haber completado los gates formales de Requirements Analysis o User Stories del ruleset classic.
