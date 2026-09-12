---
name: Panela Stocks
description: Centro de operación cálido y denso en datos — video, zonas y casos en una sola mesa de trabajo.
colors:
  accent: "oklch(47% 0.1 47)"
  green: "oklch(41% 0.075 158)"
  amber: "oklch(49% 0.1 65)"
  error: "oklch(46% 0.15 28)"
  paper: "oklch(99% 0.006 80)"
  page-bg: "oklch(96% 0.015 80)"
  ink: "oklch(28% 0.025 65)"
  muted: "oklch(48% 0.025 65)"
  line: "oklch(86% 0.02 80)"
  accent-soft: "oklch(93% 0.025 65)"
  amber-soft: "oklch(95% 0.04 65)"
  green-soft: "oklch(94% 0.035 158)"
  error-soft: "oklch(95% 0.025 28)"
typography:
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 650
    letterSpacing: "-0.045em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 600
    letterSpacing: "-0.02em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.64rem"
    fontWeight: 750
    letterSpacing: "0.14em"
  data:
    fontFamily: "ui-monospace, monospace"
    fontSize: "0.8rem"
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.7rem"
    fontWeight: 400
rounded:
  xs: "3px"
  sm: "5px"
  md: "7px"
  lg: "10px"
spacing:
  xs: "7px"
  sm: "14px"
  md: "20px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  tag:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    rounded: "{rounded.xs}"
  count-badge:
    backgroundColor: "oklch(93% 0.025 65)"
    textColor: "{colors.accent}"
    rounded: "{rounded.sm}"
---

# Design System: Panela Stocks

Solución: **Panela Stocks** · Equipo: **PanelaTeam**.

## Overview

**Creative North Star: "La mesa de operación"**

Panela Stocks es un centro de operación denso, no una landing ni un dashboard de vanidad: video con overlay de detección a la izquierda, mesa de coordinación de casos a la derecha, registro de observaciones abajo — todo visible a la vez, sin modales ni pasos ocultos. La paleta es papel cálido y tinta café, no gris-azul de SaaS genérico; la densidad de información es alta y deliberada, con tipografía de sistema (sin webfont cargada) que prioriza legibilidad y arranque instantáneo sobre personalidad tipográfica.

Este documento reemplaza una versión anterior que documentaba únicamente `demo/panel.html`, una exploración construida antes de que este sistema existiera en código. Ese archivo fue reescrito para extender esta misma identidad — ver su nota en `demo/panel.html`.

Rechazo implícito confirmado por el propio código: sin sidebar oscuro, sin gradientes, sin tarjetas de métrica genéricas tipo "hero stat" — cada número (personas detectadas, permanencia, tiempo de inferencia) vive dentro de una franja de observación con etiqueta y contexto, nunca aislado como KPI decorativo.

**Key Characteristics:**
- Dos columnas de trabajo simultáneas (video + mesa de casos), nunca una sola columna de lectura.
- Radios de esquina pequeños y consistentes (3–10px); nada redondeado tipo "pill" salvo controles diminutos.
- Elevación por rol: la superficie de video usa sombra ambiental; los contenedores de datos usan borde, nunca ambos a la vez.
- Estado codificado por color + texto siempre juntos (ámbar/verde/rojo con su etiqueta), nunca solo un punto de color.

## Colors

Paleta cálida de papel y tinta café en OKLCH; el color de estado (ámbar/verde/rojo) es la única saturación real del sistema.

### Primary
- **Terracota quemada** (`oklch(47% 0.1 47)`): acento de marca — logotipo, enlaces, botón primario, elementos activos (`.flow-steps .active`), badges de conteo.

### Secondary
- **Verde musgo** (`oklch(41% 0.075 158)`): punto de estado positivo (`.status-dot`) y estado de evento guardado con éxito.
- **Ámbar de atención** (`oklch(49% 0.1 65)`): estado de caso en curso (`.case-status`) y conexiones de canal pendientes — el color por defecto de "esto necesita mirarse".
- **Rojo ladrillo** (`oklch(46% 0.15 28)`): errores de formulario, eventos no guardados, banner de error global.

### Neutral
- **Papel** (`oklch(99% 0.006 80)`): fondo de tarjetas, inputs, topbar — la superficie "encima de la mesa".
- **Crema de fondo** (`oklch(96% 0.015 80)`): fondo de página — la "mesa" detrás de las superficies de papel.
- **Tinta café** (`oklch(28% 0.025 65)`): texto principal, encabezados.
- **Café apagado** (`oklch(48% 0.025 65)`): texto secundario, etiquetas, metadatos — nunca gris puro, siempre con el mismo matiz cálido que la tinta.
- **Línea crema** (`oklch(86% 0.02 80)`): todo borde y divisor del sistema.

### Tint Roles (fondos suaves de estado)
- **Acento suave** (`oklch(93% 0.025 65)`): fondo del `count-badge` — el precedente que justifica los siguientes tres.
- **Ámbar suave** (`oklch(95% 0.04 65)`), **verde suave** (`oklch(94% 0.035 158)`), **rojo suave** (`oklch(95% 0.025 28)`, ya usado en `.error-banner`): fondo de chip para estado (abierto/cerrado/error) cuando el texto de color solo (como en `.case-status` del app real) no basta — p. ej. en un reporte de caso independiente sin el resto de la mesa de trabajo como contexto.

### Named Rules
**La Regla del Matiz Único.** Todo texto secundario y todo borde comparte el matiz 65–80 cálido de la tinta principal; ningún gris neutro entra al sistema.

## Typography

**Body/Display Font:** system stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`) — sin webfont cargada.
**Data/Label Font:** `ui-monospace, monospace` — reservada a IDs de caso, timestamps y cifras tabulares (`.mono`).

**Character:** Una sola familia de sistema hace toda la prosa y jerarquía; el arranque instantáneo (cero solicitud de fuente) importa más que una voz tipográfica propia en esta superficie de trabajo.

### Hierarchy
- **Headline** (650, 1.9rem, `-0.045em`): título de página (`h1`) — una sola vez por vista.
- **Title** (600, 1.08rem, `-0.02em`): encabezados de sección (`h2`).
- **Subtitle** (600, 0.95rem): encabezado de tarjeta de caso (`h3`).
- **Body** (400, 0.85rem, 1.5): párrafos y descripciones.
- **Label/Eyebrow** (750, 0.64rem, `0.14em`, mayúsculas escritas en el contenido): kicker de sección (`.eyebrow`) — usado consistentemente sobre `h1`/`h2` en esta app; es un patrón establecido del sistema, no una excepción puntual.
- **Caption** (400, 0.7rem): metadatos secundarios de baja jerarquía (fecha de mensaje, badge de build) — el peldaño entre Label y Body.
- **Data** (400, 0.8rem, `tabular-nums`): timestamps, IDs, cifras (`.mono`).

### Named Rules
**La Regla de la Escala Orgánica.** Este sistema no usa un ramp tipográfico discreto y estricto: el código real varía tamaños en incrementos finos (0.58rem a 1.9rem) para ajustar densidad por componente. Los cinco roles de arriba son anclas representativas, no la lista completa de valores válidos — un tamaño intermedio bien justificado por densidad es fiel al sistema, no una desviación.

## Layout

Contenedor principal `max-width: 1600px`, centrado, `padding: 32px 40px 0`. Topbar fija de 70px con marca a la izquierda y tag de build a la derecha. Cuerpo en grid de dos columnas: video (`minmax(0,1fr)`) + mesa de operación (350px, 390px en ≥1500px, 310px en ≤1100px), `gap: 26–32px`. Registro de eventos corre a ancho completo debajo, con scroll interno (`max-height: 270px`) en vez de paginación. En ≤1100px el padding del contenedor y de la mesa se reduce, pero el grid de dos columnas no colapsa a una sola — este sistema no tiene todavía un layout de una columna para mobile real.

## Elevation & Depth

Dos estrategias de elevación, nunca combinadas en el mismo elemento: la superficie de video (`.video-stage`) usa una sombra ambiental suave sin borde; los contenedores de datos (`.operations`, tarjetas de zona/caso) usan un borde de 1px sin sombra. Chips flotantes sobre el video (`.stage-legend`) son la única superficie con fondo oscuro semitransparente del sistema.

### Shadow Vocabulary
- **Elevación de medio** (`box-shadow: 0 3px 12px oklch(28% 0.025 65 / 0.12)`): exclusiva de `.video-stage`, la única superficie "flotante" del sistema.

### Named Rules
**La Regla de Elevación por Rol.** Medios (video) llevan sombra; contenedores de datos llevan borde. Nunca ambos en el mismo bloque.

## Shapes

Radios pequeños y consistentes: 3px (puntos de zona), 4–5px (tags, badges, inputs, botones de icono), 7px (botones, marca), 10px (superficies grandes: video, panel de operaciones). Sin esquinas totalmente cuadradas en ningún contenedor interactivo, y sin radios "pill" salvo el punto de estado circular (`border-radius: 50%`, reservado a indicadores de estado, nunca a botones).

## Components

### Buttons
- **Shape:** `border-radius: 7px`, padding `10px 14px`, sin sombra.
- **Primary:** fondo terracota, texto papel — acción principal única por vista (`▶ Analizar video`).
- **Secondary:** fondo papel, borde línea, texto tinta — acción alternativa (abrir archivo, guardar observación).
- **Quiet:** transparente, texto café apagado, padding reducido — acción terciaria de bajo compromiso (`Volver a referencia`).
- **Hover/Focus:** hover = `filter: brightness(0.95)`; focus-visible = contorno terracota de 3px con offset 3px, consistente en todo control interactivo.

### Tags & Badges
- **Tag** (`.tag`): borde de línea, texto café apagado, mayúsculas, `0.58rem` — clasifica una fuente o modo (`VIDEO GRABADO`).
- **Count badge** (`.count-badge`): fondo terracota muy claro (`oklch(93% .025 65)`), texto terracota — cuenta de casos activos.
- **Status dot** (`.status-dot`): círculo de 7px, verde por defecto — salud de conexión, siempre junto a texto, nunca solo el punto.

### Cards / Containers
- **Corner Style:** 10px en contenedores grandes (`.operations`, `.video-stage`).
- **Background:** papel sobre fondo crema.
- **Shadow Strategy:** ver Elevation & Depth — borde en `.operations`, sombra en `.video-stage`, ninguno de los dos en `.case-item` (que se separa de sus vecinas solo con un divisor inferior de 1px).
- **Internal Padding:** 19–21px.

### Case card (`.case-item`, componente de firma)
Tarjeta sin borde ni sombra propios, separada de la siguiente por un divisor; encabezado con ID mono truncado + estado en ámbar, título de zona, descripción contextual del estado, y mensajes/observaciones como `<details>` colapsables anidados (`.message-item`) — cada mensaje muestra canal (Slack/Correo), intención y estado de envío antes de expandir el texto. El formulario de observación local vive en su propio `<details>` y se etiqueta explícitamente como prueba local, no como respuesta real de canal.

### Event row (`.event-row`)
Fila de grid de 4 columnas (hora · zona/track · contexto de score · estado de guardado) — tabular, sin tarjeta, con estado de guardado en verde/rojo a la derecha y botón de reintento inline si falló.

### Inputs / Fields
- **Style:** borde de línea, fondo papel, radio 5px.
- **Focus:** contorno terracota de 3px (igual que botones).
- **Error:** el banner de error usa fondo rojo muy claro (`oklch(95% .025 28)`) con borde y texto en rojo ladrillo.

### Navigation
Topbar única y fija: marca + separador vertical con subtítulo + tag de build a la derecha. No hay navegación secundaria ni breadcrumbs — la app es una sola vista de trabajo.

## Do's and Don'ts

### Do:
- **Do** usar el patrón `.eyebrow` (mayúsculas, `0.14em` tracking, color terracota) sobre cada `h1`/`h2` de sección — es el sistema de jerarquía establecido de esta app.
- **Do** mantener el matiz cálido único en todo texto secundario y borde — nunca introducir un gris neutro.
- **Do** declarar la elevación de un bloque con sombra (medios) o borde (contenedores de datos), nunca ambos.
- **Do** mostrar el estado de un mensaje (canal, intención, estado de envío) antes de exponer su texto — el `<details>` colapsado es el patrón de firma para mensajes salientes.

### Don't:
- **Don't** introducir gradientes, sidebar oscuro permanente, o tarjetas de métrica aisladas tipo "hero stat" — cada cifra vive dentro de su franja de observación con etiqueta.
- **Don't** usar un radio de esquina "pill" en botones o tarjetas — el punto de estado circular es la única forma circular del sistema.
- **Don't** cargar una webfont de display para esta superficie — el arranque instantáneo con la pila de sistema es una decisión ya tomada, no un placeholder.
- **Don't** presentar una observación local del formulario de prueba como si fuera una respuesta real recibida por Slack o correo — el copy del propio componente ya lo distingue explícitamente y cualquier extensión del sistema debe conservar esa distinción.

## Extensión de la demo funcional

La regeneración sobre `b8e4071` conserva esta dirección de mesa de operación e incorpora un expediente con cronología verificable. El selector muestra un caso persistido a la vez; la tabla reúne video, operador local y mensajes de Slack/correo, conservando su estado real y mostrando el texto de cada mensaje bajo demanda. El recorrido principal corresponde a transiciones del backend; el ciclo objetivo del PVB se consulta por separado.

Para acomodar ese registro, la columna de casos puede ampliarse respecto de la captura original. En pantallas estrechas la mesa se apila: la prioridad es conservar la legibilidad y el uso de los controles, extendiendo el soporte móvil que faltaba en el diseño documentado. Se mantienen la tipografía de sistema, la paleta cálida y la separación entre sombra de medios y borde de datos.
