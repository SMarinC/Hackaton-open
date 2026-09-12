# Método y estado de elaboración del PRD

**Producto:** PanelaTeam · **Fecha:** 2026-09-12 · **Estado:** borrador para revisión.

## Propósito y fuentes

Este documento explica cómo se transforma la visión de PanelaTeam en un PRD trazable y cómo se prepara su continuidad en AI-DLC. El alcance actual es especificar el producto; la aprobación del contenido y el inicio de Construction siguen pendientes. Ningún artefacto se presenta como implementación, evidencia de resultados comerciales o certificación del framework.

En HardcoreAI, **PVB significa Product Vision Board**. El PVB existente conserva la visión comercial y el alcance propuesto para tiendas de abarrotes con secciones diferenciadas. La expresión previa «producto mínimo para validar valor de negocio» describe una intención de validación, pero no sustituye el nombre del artefacto del curso.

Se consultaron materiales de HardcoreAI, Cohorte 2. El siguiente inventario identifica rutas relativas dentro de esa copia de referencia; esos archivos no se distribuyen en este repositorio. Los ejemplos de otros productos no aportan requisitos, métricas ni decisiones para PanelaTeam.

| Referencia consultada | Parte utilizada | SHA-256 de la copia consultada |
|---|---|---|
| `Estacion-1/hcai-c2-product-vision-board.md` | Plantilla de visión, problema, segmento, restricciones, economía y riesgos; líneas 1–174 | `2ce5f5fe7ace09cd8f5bd459e1fe476feabd1fb00d1ac975fed0bd7259752eeb` |
| `Estacion-2/prompts-especificacion.md` | Análisis de conflictos, reglas de evidencia y 13 segmentos del PRD; líneas 38–173 | `f0bb00c4e40100ede1f1f14c646971d8bf6a941fbf1a42804cd50741ad4551b4` |
| `Estacion-4/estacion4-runbook.md` | Entrada PRD, Inception, requisitos e historias verificables; líneas 95–159 y 251–358 | `ee072eef0e1e63b2894b98bdc74111e23efc49d66c003a784f59e904328bbd69` |
| `Estacion-4/aidlc-rules/aws-aidlc-rule-details/inception/requirements-analysis.md` | Dimensiones de completitud, preguntas, requisitos y aprobación | `aa84c2081a845e1e365140dc24c364e62c3b866e7ebfc96d248711e10a9fcfb8` |
| `Estacion-4/aidlc-rules/aws-aidlc-rule-details/inception/user-stories.md` | Personas, historias, plan y revisión | `5aca612331c944feabb347704e203f14b1fae01d528883502c5191fd65373ce4` |

El archivo `Estacion-4/aidlc-rules/VERSION` declara `0.1.8`. Los hashes identifican las copias consultadas; no se comprobó igualdad binaria de cada archivo con el release público.

## Transformación de PVB a PRD

Antes de redactar los requisitos se contrastan los documentos del producto y las decisiones de la conversación. El análisis previo distingue contradicciones, diferencias de alcance y vacíos de información. Para PanelaTeam esto exige separar la visión de conexión a cámaras reales del material de internet previsto para la demo, y distinguir observaciones visuales, registros comerciales y confirmaciones humanas.

Cada decisión se identifica como confirmada, propuesta o pendiente. Cuando falta evidencia se registra el vacío y una forma de resolverlo. Las metas propuestas no se convierten en resultados observados; una simulación de inventario tampoco demuestra integración con una tienda. Los conflictos y sus resoluciones propuestas quedan visibles en el [PRD](prd.md).

El documento conserva los trece segmentos de Estación 2:

1. Descripción del producto, JTBD y misión.
2. Contexto y problema.
3. Perfil de cliente ideal y compradores.
4. Propuesta de valor y diferenciación.
5. Cinco casos de uso prioritarios.
6. Principios de diseño.
7. Recorridos normales, interrupciones y escalamiento.
8. Alcance MoSCoW.
9. Módulos y especificación funcional.
10. Métricas de éxito.
11. Evaluación del agente.
12. Riesgos y mitigaciones.
13. Entrega y validación a 30, 60 y 90 días.

## Adaptación explícita del proceso de revisión

El ejercicio original propone aprobar cada segmento antes de redactar el siguiente, además de resolver primero los conflictos. La instrucción actual de construir el PRD se interpreta como autorización para preparar **un borrador completo y revisable**. Por eso se consolidan los segmentos sin registrar aprobaciones individuales ni convertir las propuestas en decisiones aceptadas.

Esta adaptación permite revisar el producto como conjunto. No equivale a afirmar cumplimiento de los gates secuenciales del curso. Las preguntas que condicionen alcance, datos, autonomía o viabilidad quedan en [verificación de requisitos](../aidlc-docs/inception/requirements/requirement-verification-questions.md). La revisión humana deberá resolverlas y aprobar una versión concreta antes de tratarla como contrato de construcción.

También se preparan borradores de requisitos, personas e historias sin declarar superados los gates AI-DLC de respuestas, aprobación del plan de historias o aprobación de los artefactos. Esos registros permanecen pendientes; las historias de recorrido se dividirán antes del backlog y no se presentan como unidades de implementación ya validadas.

## Continuidad en AI-DLC

La referencia metodológica es la copia clásica del curso, cuyo runbook declara [AI-DLC v0.1.8](https://github.com/awslabs/aidlc-workflows/tree/v0.1.8). No se afirma que sea la versión más reciente. Preparar documentación con esta estructura tampoco instala un motor, importa reglas ejecutables ni activa automáticamente todas las etapas del framework.

El PRD alimenta un borrador de [requisitos](../aidlc-docs/inception/requirements/requirements.md), [personas](../aidlc-docs/inception/user-stories/personas.md) e [historias](../aidlc-docs/inception/user-stories/stories.md). La trazabilidad conecta necesidades, requisitos, escenarios y criterios de evaluación. Los comportamientos deben tener resultados verificables; los requisitos de calidad deben distinguir metas propuestas y mediciones realizadas.

El [estado del proceso](../aidlc-docs/aidlc-state.md) identifica lo preparado y lo pendiente; la [auditoría](../aidlc-docs/audit.md) registra acciones y decisiones con su condición real. Estos archivos no declaran Inception completa. El diseño de aplicación, las unidades de trabajo y Construction requieren continuar el proceso sobre requisitos revisados. No se han aprobado arquitectura, implementación, despliegue ni comunicaciones externas mediante la elaboración de este PRD.
