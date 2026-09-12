# Bases y decisiones para PanelaTeam v0.2

**Revisión: 12 de septiembre de 2026, 17:06 UTC · Estado: análisis y recomendaciones; producto aún no implementado.**

## Fuentes del concurso y alcance de la comprobación

Se leyeron el [portal oficial](https://medellin.aitinkerers.org/hackathons/h_kWaGpfQvrNc/) y el [handbook](https://medellin.aitinkerers.org/hackathons/h_kWaGpfQvrNc/handbook) en navegador, con la sesión disponible. La herramienta de búsqueda no pudo recuperarlos; el navegador sí mostró el contenido. No se trasladan a este documento datos del perfil, mensajes privados ni ofertas personales.

El portal mostró cuatro criterios, puntuados de 1 a 5: funcionamiento, innovación y relación con el tema, ejecución/integración y utilidad/experiencia agéntica. No se vieron pesos diferenciados. Los niveles superiores enfatizan recorrido fiable, contexto esencial, tratamiento de fallos y valor con control comprensible. El lugar de uso debe mejorar la capacidad del agente; añadir un canal no basta.

La entrega mostrada es **12 de septiembre, 4:30 p. m., UTC−5**; sustituye el horario histórico de preparación. Las bases piden núcleo construido durante el evento, permiten componentes reutilizables y requieren título, descripción, GitHub público, video de dos minutos y publicación social con socios. Revisar avisos posteriores para cambios. Esta lectura no registra entrega de candidatura.

## Juicio sobre la propuesta

**Buena alineación conceptual; evidencia de funcionamiento todavía ausente.** Observar la tienda, consultar responsables y verificar resultados relaciona mundo físico, datos y comunicación. El riesgo es mostrar solo analítica y mensajes prefabricados: eso no demuestra que el agente coordine trabajo.

El PVB v0.1 ya admitía reglas preautorizadas, pero el PRD restringió D0 a una bandeja interna y aprobación frecuente. La nueva instrucción del usuario corrige esa restricción. La mejora de puntaje es una inferencia de diseño respecto de la rúbrica, no un pronóstico del jurado.

| Dimensión | Debilidad del alcance anterior | Cambio v0.2 | Comprobación |
|---|---|---|---|
| Funcionamiento | Canales principales diferidos | Caso con Slack y correo operativos | Recorrido completo con registro y destino real de prueba |
| Tema | Entorno visible pero coordinación conducida por el usuario | Evento inicia gestión; respuesta cambia plan | Dos variantes de contexto y próximos pasos distintos |
| Integración | Comunicación simulada y fallos de canal no probados | Entrada/salida, hilos, persistencia y recuperación | Respuesta entrante, reinicio y resultado de envío incierto |
| Utilidad | Encargado solicita cada acción | Política previa y gestión por excepción | Menos intervenciones de supervisión con cierre correcto |

Recomendación: construir primero ese circuito. Promociones, permanencia, varios modelos o varias cámaras aportan menos a la demostración si el circuito no termina. Mostrar una alternativa de aviso fijo permite explicar qué decisión necesita razonamiento contextual. No asignar notas a una app que no existe ni sumar canales como puntos.

## Opciones de integración comprobadas

La documentación acredita mecanismos disponibles, no que PanelaTeam ya esté conectado. El usuario confirmó **ausencia de cuentas de prueba**; falta preparar workspace, buzones, permisos y destinatarios antes de ensayar.

| Necesidad | Opción mínima por evaluar | Fuente primaria |
|---|---|---|
| Slack salida e hilos | App/bot y `chat.postMessage`; guardar canal y timestamp del hilo | [Publicar mensajes](https://docs.slack.dev/reference/methods/chat.postMessage/) |
| Slack entrada | Eventos de mensajes del canal o menciones explícitas; un webhook de salida no completa la conversación | [Mensajes de canal](https://docs.slack.dev/reference/events/message.channels/), [menciones](https://docs.slack.dev/reference/events/app_mention/) |
| Demo local Slack | Socket Mode evita exponer un endpoint público para los eventos; requiere conexión activa | [Socket Mode](https://docs.slack.dev/apis/events-api/using-socket-mode/) |
| Correo de prueba | Gmail API con permisos separados para enviar y leer respuestas; buzón dedicado | [Scopes](https://developers.google.com/workspace/gmail/api/auth/scopes) |
| Conversación de correo | Conservar hilo, cabeceras de respuesta e identidades; no autorizar por asunto | [Threads](https://developers.google.com/workspace/gmail/api/guides/threads) |
| Recuperar respuestas | Sincronización periódica acotada para D0; push añade renovación y consulta de historial | [Sync](https://developers.google.com/workspace/gmail/api/guides/sync), [push](https://developers.google.com/workspace/gmail/api/guides/push) |

Gmail es una opción técnica, no una elección de proveedor aprobada. `gmail.readonly` no se limita al hilo por filtrar casos en nuestra aplicación; su autorización tiene alcance sobre el buzón. La distribución posterior puede necesitar requisitos de verificación distintos. No extrapolar configuración de prueba a despliegue comercial.

Slack devuelve identificadores de publicación, no confirmación de lectura humana. Gmail advierte que una respuesta HTTP satisfactoria no basta para asumir envío exitoso en todos los casos. Para aceptar la demo, observar recepción y respuesta en cuentas de prueba. [Slack](https://docs.slack.dev/reference/methods/chat.postMessage/) · [Errores Gmail](https://developers.google.com/workspace/gmail/api/guides/handle-errors).

Los eventos Slack pueden repetirse. Persistir entradas y salidas con identificadores, ignorar ecos del propio bot y reconciliar resultados inciertos antes de reintentar. El proveedor y su red no permiten prometer exactamente un envío por decreto del PRD. [Events API](https://docs.slack.dev/apis/events-api/).

## Qué aporta cada canal

Slack concentra evidencia, aclaraciones, asignación y estado de un caso. Correo alcanza un participante externo de prueba y lleva su respuesta al mismo proceso; distribuye un reporte con resumen y pendientes. La elección de mensaje, destinatario y siguiente gestión depende del contexto y de una política vigente.

El agente puede notificar y preguntar sin aprobación por mensaje; compras, precio o compromisos no se habilitan por esa facultad. Para D0 usar datos comerciales ficticios y participantes del equipo. Ninguna acción de este análisis crea cuentas, conecta permisos o envía mensajes.

## Investigaciones que sí cambian decisiones

1. **Material visual:** localizar un clip reutilizable que permita observar el evento; si falla, cambiar captura o declarar origen humano.
2. **Negocio y canales:** comprobar coordinación real, comprador, uso de Slack/correo y alternativas antes de afirmar demanda.
3. **Crítica técnica:** encontrar el camino mínimo de setup y fallos de autonomía; diseñar una comparación con un aviso por regla.

Los [prompts de Perplexity](03_Perplexity_Misiones_PanelaTeam_v0.2.md) están preparados para esas misiones. No se necesita una investigación profunda adicional para justificar Slack bidireccional o corregir la restricción del PRD; sí para sostener diferenciación y viabilidad comercial.
