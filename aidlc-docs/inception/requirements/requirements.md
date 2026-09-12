# Índice de requisitos — Panela Stocks

**Inception documental · Borrador v0.2 · Validación y aprobación pendientes**

## Intención y alcance

Solicitud vigente: revisar la visión y requisitos para autonomía sustantiva, interacción con externos y reportes por Slack/correo, conservando trazabilidad de HardcoreAI y AI-DLC. Tipo: producto nuevo, con un repositorio que actualmente contiene documentación y assets. Alcance de producto: varios sistemas (visión, datos comerciales y coordinación); alcance de este cambio: documentación. Complejidad propuesta: alta por incertidumbre visual y efectos operativos. Profundidad: detallada para requisitos; stack y diseño de implementación posteriores.

La revisión v0.2 parte de `84d2710`, con PRD v0.1 publicado; no hay app, configuración de build o tests de producto. Se trata como greenfield. No hay ingeniería inversa de aplicación que completar.

## Fuente única

Los requisitos normativos candidatos están en [specs/prd.md](../../../specs/prd.md). Este archivo es un índice de trazabilidad; no mantiene otra versión de sus reglas. Todo cambio de ID, prioridad o aceptación se hace en el PRD y se refleja en sus historias. Las referencias numéricas heredadas «§» corresponden al PVB v0.1; la revisión de autonomía/canales corresponde al PVB v0.2.

| Requisito | Necesidad / fuente del PVB | Historia | Evidencia de aceptación diseñada |
|---|---|---|---|
| [FR-01](../../../specs/prd.md#rf-01) Procedencia | §§8, 11: distinguir datos reales, replay y fixtures | US-01/05 | E-01 |
| [FR-02](../../../specs/prd.md#rf-02) Zonas/versiones | §§3–4, 8: interpretar observación y categoría vigentes | US-01/03/05 | E-02, E-06 |
| [FR-03](../../../specs/prd.md#rf-03) Observación/cobertura | §§3–4: evidencia antes de concluir | US-01/02 | E-03, E-04 |
| [FR-04](../../../specs/prd.md#rf-04) Visitas/permanencia | §§3, 9: métricas temporales defendibles | US-01 | E-03, E-04 |
| [FR-05](../../../specs/prd.md#rf-05) POS/rankings | §§3, 9: compras y resultados comerciales | US-03/04 | E-06 |
| [FR-06](../../../specs/prd.md#rf-06) Inventario | §§3, 6: ubicación, disponibilidad y vigencia | US-02 | E-05, E-07 |
| [FR-07](../../../specs/prd.md#rf-07) Coordinación autónoma | PVB v0.2: iniciar gestión y elegir siguiente paso contextual | US-02/04 | E-05, E-16, E-19 |
| [FR-08](../../../specs/prd.md#rf-08) Slack/correo bidireccionales | PVB v0.2: consultas reales y respuestas correlacionadas | US-02/05 | E-08, E-13, E-16, E-17, E-18 |
| [FR-09](../../../specs/prd.md#rf-09) Autorización por política o puntual | PVB v0.2: rutina independiente y excepción con facultades vigentes | US-02/04/05 | E-07, E-09, E-10, E-19 |
| [FR-10](../../../specs/prd.md#rf-10) Idempotencia | §8 y PVB v0.2: evitar duplicados y reenvío ciego | US-02/05 | E-08, E-18 |
| [FR-11](../../../specs/prd.md#rf-11) Persistencia | §§6–8 y PVB v0.2: trabajo, conversaciones y seguimiento durables | US-02 | E-08, E-11, E-18 |
| [FR-12](../../../specs/prd.md#rf-12) Cierre | §§6–7: distinguir modalidades de evidencia | US-02/04 | E-11 |
| [FR-13](../../../specs/prd.md#rf-13) Promociones | §10: experimentos y límites de atribución | US-04 | E-12 |
| [FR-14](../../../specs/prd.md#rf-14) Conectores reales | PVB v0.2: Slack/correo D0; §§4, 11: cámaras y datos reales P1 | US-02/05 | E-13, E-14, E-16, E-17, E-18 |
| [FR-15](../../../specs/prd.md#rf-15) Interacción SKU | §3: retirada/devolución distinta de compra | Extensión US-01/03 | E-15 |
| [FR-16](../../../specs/prd.md#rf-16) Manifiesto | §§8, 11: demostración reproducible | US-01/02/05 | E-01, E-11, E-13 |
| [FR-17](../../../specs/prd.md#rf-17) Seguimiento/reportes | PVB v0.2: recordatorio, escalamiento y reporte real en ambos canales | US-02/05 | E-16, E-17, E-18, E-19 |

Fuente PVB vigente: [operación autónoma v0.2](../../../docs/02_PVB_PanelaTeam_Operacion_Autonoma_v0.2.md); [v0.1 antecedente](../../../docs/01_PVB_PanelaTeam_Operacion_Abarrotes_v0.1.md). [Historias](../user-stories/stories.md) y [personas](../user-stories/personas.md).

## Calidad y completitud

NFR-01 a NFR-10 se definen en el PRD §9: integridad numérica, aislamiento, permisos de efectos, procedencia, respuesta, recuperación, uso accesible, costo, protección de datos y reproducibilidad. Los umbrales propuestos requieren revisión; no se ha medido desempeño.

Las seis dimensiones consideradas por el análisis son comportamiento funcional, requisitos de calidad, escenarios y fallos, negocio, integraciones y fronteras, y atributos de operación/mantenimiento. Los vacíos que afectan alcance o aceptación están en [preguntas](requirement-verification-questions.md).

**Estado de todos los FR/NFR:** redactados para revisión, no implementados ni aprobados. E-01 a E-19 son escenarios de aceptación futuros; ninguno se marca como ejecutado. Slack/correo son Must de D0 con envío, respuesta y reporte reales; el usuario confirmó que no hay cuentas de prueba. Hasta configurarlas y superar aceptación, integración no cumplida y prototipo parcial. La aprobación por mensaje no es requisito para rutinas cubiertas por política; compras/precios/compromisos comerciales reales permanecen excluidos D0. Diseño, unidades, código y evidencia de pruebas se enlazarán cuando existan.

La preparación del índice y de historias es parte del borrador de PRD autorizado. No afirma haber completado los gates formales de Requirements Analysis o User Stories del ruleset classic.
