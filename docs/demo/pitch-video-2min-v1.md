# Panela Stocks · Pitch para video de dos minutos

**Equipo:** PanelaTeam. **Versión:** 1, 12 de septiembre de 2026. **Estado:** guion propuesto para revisión; audio y video aún no producidos. **Base de implementación revisada:** `44637af`.

Idea central: **del video a una gestión con evidencia**. El video debe mostrar cómo una señal abre un caso, cómo la información del encargado cambia la gestión y cómo se conserva su historia.

## Narración y montaje propuestos

Los tiempos son una pauta de edición de 120 segundos, no una duración de locución medida. La narración tiene 222 palabras: a 120 palabras por minuto ocuparía unos 111 segundos, dejando aproximadamente nueve para pausas. Ensayar a unas 120–125 palabras por minuto y ajustar el montaje después de escuchar la toma completa.

| Tiempo | Narración | Imagen y acción |
|---|---|---|
| 00:00–00:14 | En una tienda, algo puede quedar registrado en cámara y seguir sin atenderse. Somos PanelaTeam y creamos Panela Stocks: del video a una gestión con evidencia. | Abrir con el video en movimiento y el logo de Panela Stocks. La ilustración original de PanelaTeam aparece brevemente al nombrar al equipo; la aplicación ocupa la pantalla desde el inicio. |
| 00:14–00:32 | En esta grabación de referencia, el sistema detecta personas, sigue recorridos y mide permanencia por sección. Cuando se supera el umbral, abre una revisión. La señal indica dónde mirar; el encargado confirma qué ocurre. | Captura real de la app funcional: **Analizar video**, zonas, cajas e IDs temporales. Mostrar un caso nuevo. Rótulo: «Grabación de referencia · análisis local». |
| 00:32–00:48 | Aquí aparece el caso, con la zona, la duración y el instante del video. Podemos regresar a ese momento. La observación original se conserva, y cada gestión queda registrada. | **Pausar análisis**, seleccionar el caso, mostrar **Evidencia y procedencia** y **Revisar instante en el video**. Mantener el identificador del caso visible. |
| 00:48–01:10 | En dos casos de prueba, el encargado confirma un faltante. Si hay existencias en bodega, se crea una tarea de reposición. Si no hay stock, el caso queda esperando información de entrega y se prepara una consulta por correo. | Caso A: **Registrar observación local** → **Faltante confirmado; hay stock en bodega** → **Guardar observación local**; aparece **Reposición asignada**. Corte explícito a caso B: **Faltante confirmado; no hay stock**; mostrar espera y **Consulta de entrega** preparada. Rótulos: «Caso A · con stock» / «Caso B · sin stock», «Confirmación local · datos de prueba». |
| 01:10–01:28 | Cuando el operador informa que la reposición se realizó, el caso registra un cierre humano y prepara los reportes. Recargamos la aplicación: el expediente, sus decisiones y su evidencia permanecen. | Volver claramente al caso A asignado: **Reposición realizada**, nota de prueba y guardar. Mostrar **Cierre humano**, cronología y reportes preparados. Recargar y comprobar el mismo caso conservado. |
| 01:28–01:42 | Este incremento usa inventario ficticio y confirmaciones locales. Slack y correo siguen pendientes de conexión. La siguiente integración incorporará respuestas reales y seguimiento autónomo dentro de reglas autorizadas. | Acercamiento legible a **Pendiente de conexión** y **Leer mensaje preparado**. Separar visualmente «Disponible hoy» de «Siguiente integración». |
| 01:42–01:54 | Nuestra visión es que el agente coordine con los responsables, conserve el contexto y ayude al encargado a concentrarse en las situaciones que necesitan su criterio. | Una tarjeta breve «Objetivo»: video → caso → responsables → seguimiento. Identificarla como objetivo; no usar animaciones de mensajes enviados ni nubes conectadas. |
| 01:54–02:00 | Panela Stocks, por PanelaTeam. Observar, coordinar y conservar la evidencia. | Logo de la solución, nombre del equipo y enlace legible al [repositorio público](https://github.com/SMarinC/Hackaton-open). Mantener el cierre hasta 02:00. |

## Voz recomendada

Dirección propuesta: **voz femenina adulta, cálida, de registro medio-grave, español colombiano y acento paisa suave**. Conversación tranquila y cercana, consonantes claras, variación de entonación discreta y pausas naturales. Evitar una interpretación de anuncio comercial, susurros y énfasis dramáticos. Esta es una elección de dirección creativa; no se ha seleccionado ni escuchado una voz concreta.

Para una voz sintética, evaluar **ElevenLabs Voice Design v3** con ese perfil y una muestra de 15–20 segundos antes de producir la narración completa con **Multilingual v2**. La documentación permite describir idioma, acento, timbre y estilo y usar la voz diseñada con otros modelos; la coincidencia con lo pedido debe comprobarse escuchando el resultado. Cuenta, acceso y créditos siguen sin comprobarse. Si una persona del equipo dispone de un lugar silencioso, una toma humana tranquila también es una opción adecuada.

Prompt de diseño propuesto:

> Native Colombian Spanish female voice, adult, warm and conversational, with a subtle Medellín accent. Medium-low register, clear articulation, relaxed pacing and natural sentence-level intonation. She sounds like a knowledgeable teammate calmly explaining a working product to one person. Gentle confidence, small pauses between ideas, restrained emphasis. Clean studio sound, no music or room echo. Avoid an announcer performance, exaggerated regional slang, whispering or dramatic delivery.

Indicación de lectura: narrar el guion en español, unas 120–125 palabras por minuto como punto de partida, dejando respirar los cambios de escena. Pronunciar «Panela Stocks» como «Panela stoks» y «PanelaTeam» como «Panela tim». Mantener ambos nombres distintos. Escuchar especialmente nombres, ritmo y finales de frase; ajustar texto y pausas antes de acelerar artificialmente el audio. Si la voz final es sintética, indicarlo de forma discreta en los créditos o descripción.

## Preparación de la grabación

- Capturar la app funcional en `http://127.0.0.1:8787/index.html`. `demo/panel.html` es una referencia estática con ejemplos ficticios y no prueba el funcionamiento del backend.
- Usar casos nuevos creados después de la corrección de integridad. En notas, identificar los supuestos como «prueba local». Conservar los casos históricos del usuario.
- Ensayar los casos A y B por separado. El caso A se cierra desde reposición asignada; el caso B sin stock permanece esperando información. No montar un cierre directo desde falta de stock ni ocultar el cambio de caso.
- Recortar carga y escritura manteniendo orden causal, identificadores y estados legibles. Si se acelera la ejecución, mostrar «captura acelerada»; no presentar cortes como latencia real.
- Grabar a 1920 × 1080, 16:9, como elección de producción, no como requisito visto en las bases. Usar encuadres de detalle para que zona, duración y siguiente acción se lean sin pausar.
- Priorizar narración y audio limpio. Música instrumental muy baja, opcional; sin letra. Subtítulos en español revisados. Evitar un avatar que tape el flujo.
- La duración definitiva debe medirse sobre el archivo exportado e incluir apertura, pausas y créditos. Apuntar a un máximo de 02:00; los tiempos de esta tabla todavía no constituyen una prueba de duración.

## Ajuste a las bases y alcance de las afirmaciones

El [handbook oficial](https://medellin.aitinkerers.org/hackathons/h_kWaGpfQvrNc/handbook), leído el 12 de septiembre de 2026 en el navegador, pide un video de demostración de dos minutos y un prototipo funcional. El [portal y su rúbrica](https://medellin.aitinkerers.org/hackathons/h_kWaGpfQvrNc) valoran funcionamiento, relación con el entorno, ejecución/integración y utilidad/experiencia agéntica, cada uno de 1 a 5. La lectura actual muestra entrega a las 16:30 UTC−5 del 12 de septiembre. No se observó una exigencia de idioma, formato de imagen ni proveedor de voz en el handbook leído.

Se dedica la mayor parte del metraje al recorrido real porque permite al jurado evaluar lo construido. Esta es una recomendación editorial, no una garantía de puntaje. La integración bidireccional y la autonomía completa siguen pendientes y limitan lo que puede demostrar esta versión.

La grabación de referencia no es una cámara de una tienda piloto de abarrotes. La permanencia abre una revisión, no demuestra ventas, interés de compra ni un faltante. Las bifurcaciones operativas actuales se activan con confirmaciones humanas locales y reglas; no acreditan razonamiento de un modelo conectado. El cierre mostrado es humano. Slack y correo no deben presentarse como enviados/recibidos mientras sus estados reales indiquen lo contrario. La arquitectura multicloud, OpenRouter y Exa son opciones propuestas, no integraciones probadas.

Si antes de grabar se implementa y verifica un ida y vuelta real por Slack o correo, actualizar primero los bloques de comunicación y sus capturas con esa evidencia. Este guion no declara ese trabajo completado ni autoriza enviar mensajes externos.

Fuentes oficiales de voz, revisadas el 12 de septiembre de 2026: [Voice Design](https://elevenlabs.io/docs/eleven-creative/voices/voice-design), [modelos](https://elevenlabs.io/docs/overview/models), [idioma y acento](https://elevenlabs.io/docs/help-center/product/core-capabilities/text-to-speech/how-do-i-select-the-language-and-accent) y [Text to Speech](https://elevenlabs.io/docs/eleven-creative/playground/text-to-speech). Recomendación de perfil pendiente de audición; no se ha comprado un plan, generado audio ni producido o enviado el video.
