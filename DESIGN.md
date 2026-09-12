---
name: PanelaTeam
description: Un caso lee como un manifiesto de bodega auditable, no como un dashboard SaaS.
colors:
  paper-ground: "#e9dfc7"
  paper-sheet: "#f5efdf"
  ink: "#2a241c"
  ink-soft: "#6b5d47"
  rule: "#cdbd97"
  rule-strong: "#a8966c"
  stamp-red: "#8f2a1e"
  stamp-green: "#2c5a37"
  lane-slack: "#294a63"
  lane-correo: "#6b4a2a"
typography:
  display:
    fontFamily: "IBM Plex Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "IBM Plex Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.5
  data:
    fontFamily: "IBM Plex Mono, SFMono-Regular, Consolas, monospace"
    fontSize: "0.86rem"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  tag: "3px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "18px"
  lg: "24px"
components:
  lane-slack:
    backgroundColor: "{colors.lane-slack}"
    textColor: "{colors.paper-sheet}"
    rounded: "{rounded.tag}"
  lane-correo:
    backgroundColor: "{colors.lane-correo}"
    textColor: "{colors.paper-sheet}"
    rounded: "{rounded.tag}"
---

# Design System: PanelaTeam

## Overview

**Creative North Star: "El manifiesto de bodega"**

PanelaTeam no muestra la confianza operativa, la prueba. La superficie se construye para leerse como un documento que un encargado de tienda ya sabe verificar — un manifiesto de bodega o packing-list — nunca como un panel analítico de SaaS con tarjetas de KPI y píldoras de color. Cada caso es una hoja: papel kraft, tinta carbón, filas con regla, un sello legible sin leyenda para cada estado. La confianza no se declara con un badge verde; se demuestra dejando ver cada consulta, cada respuesta y cada canal, en orden.

El sistema nació de una fusión deliberada de dos mundos: el manifiesto de bodega (la identidad visual dominante — papel, tinta, filas tabulares) recibió el dispositivo de una segunda dirección, una línea de tiempo de rastreo de paquetería, como su "espina" de progreso — la fila de siete etapas que corona cada caso. El manifiesto posee la página; el rastreo solo le prestó su forma de avance instantáneo.

Rechazo confirmado: el dashboard SaaS genérico (sidebar, tarjetas KPI, píldoras de estado a color) fue la salida estándar ofrecida y explícitamente descartada — leía como analítica, no como expediente auditable.

**Key Characteristics:**
- Documento, no dashboard: una hoja continua por caso, nunca tarjetas dispersas.
- Sellos de tinta legend-free: el estado se lee por forma (✓ / □ / ✗), nunca solo por color.
- Un carril de canal (Slack / Correo) integrado en un único registro cronológico, nunca dos vistas separadas.
- Tinta funcional, no decorativa: rojo y verde aparecen solo como sello de estado, nunca como acento libre.

## Colors

Paleta de papel kraft y tinta: cálida, de bajo contraste cromático, con acentos de tinta funcional reservados estrictamente al estado del caso.

### Primary
- **Tinta carbón** (`#2a241c`): texto de cuerpo, títulos, iconografía de sello activa. Es la única tinta "neutral" del sistema — todo lo demás es fondo o acento funcional.

### Secondary
- **Sello verde** (`#2c5a37`): exclusivamente para "verificado" / marcas de fila completadas (`.mark.done`, `.chan-ok`). Nunca decorativo.
- **Sello rojo** (`#8f2a1e`): exclusivamente para anotaciones de bifurcación de caso ("misma señal, respuesta distinta") y, por contrato de dirección, para un futuro estado `bloqueado` — todavía no demostrado en el contenido actual.

### Tertiary
- **Carril Slack** (`#294a63`, azul-tinta de carbón): identifica cada fila originada en Slack; también sirve como color de enlace en todo el documento (`.disclosure a`, `.colophon a`).
- **Carril correo** (`#6b4a2a`, sepia-tinta): identifica cada fila originada en correo.

### Neutral
- **Kraft de fondo** (`#e9dfc7`): el "escritorio" — fondo de página, detrás de las hojas.
- **Papel de hoja** (`#f5efdf`): cada caso individual, más claro que el fondo para leerse como una hoja apoyada encima.
- **Tinta suave** (`#6b5d47`, tinta con matiz cálido — nunca gris puro): texto secundario, metadatos, timestamps.
- **Regla** (`#cdbd97`) y **regla fuerte** (`#a8966c`): líneas divisorias de fila y borde de secciones; la fuerte marca límites de bloque (cabecera de caso, encabezado de tabla), la suave separa filas dentro de una tabla.

### Named Rules
**La Regla de la Tinta Funcional.** Rojo y verde existen solo como sello de estado (fila verificada, anotación de bifurcación). Ningún otro elemento puede tomar prestado ese color para énfasis decorativo.

## Typography

**Display Font:** IBM Plex Sans (con Segoe UI, system-ui como respaldo)
**Body Font:** IBM Plex Sans
**Label/Mono Font:** IBM Plex Mono — reservada a datos y medición (timestamps, números de caso, cifras tabulares), nunca usada como disfraz de "lo técnico".

**Character:** Una sola familia sans hace todo el trabajo de prosa y jerarquía; el mono entra solo donde hay un dato real que alinear en columna. La pareja es deliberadamente "workhorse" — de oficina, no editorial — porque el registro es Operate: la tipografía nunca debe competir con la lectura del caso.

### Hierarchy
- **Título de caso** (600, 1.05rem, 1.3): nombre del producto/situación; primera línea de cada hoja, con el número de caso en mono inline antes del texto.
- **Cuerpo** (400, 0.85–0.86rem, 1.45–1.5): descripciones de caso y entradas del manifiesto.
- **Etiqueta de tabla** (500–600, 0.68rem, mayúsculas, `letter-spacing: 0.05em`): cabeceras de columna (`HORA`, `ENTRADA`) y metadatos del membrete.
- **Dato mono** (400–500, 0.68–1.3rem, `font-variant-numeric: tabular-nums`): timestamps, número de caso, carril de canal.

### Named Rules
**La Regla del Mono con Motivo.** IBM Plex Mono aparece solo donde hay una cifra, un timestamp o un identificador que alinear — nunca en prosa ni en un título por "verse técnico".

## Layout

Documento de una sola columna, ancho de medida `max-width: 760px` centrado — deliberadamente estrecho para leerse como una hoja de papel, no como un panel de ancho completo. Cada caso es un bloque vertical continuo: cabecera → espina de progreso → tabla de manifiesto → pie de reporte. En mobile (`≤620px`), la cabecera de caso colapsa a una columna y la espina de progreso oculta sus etiquetas de texto (queda solo la línea de puntos), delegando el nombre del estado actual al badge que ya está arriba — nunca duplicando información como una segunda fila apretada.

## Elevation & Depth

El sistema usa una sola capa de elevación por caso: cada hoja (`.case`) se separa del fondo kraft únicamente por una sombra suave con offset (`0 10px 24px -18px rgba(42,36,28,0.55), 0 2px 0 rgba(42,36,28,0.04)`), sin borde. Es intencional: papel real no tiene un trazo dibujado en su borde, solo el contraste de color contra la mesa y la sombra de estar apoyado encima.

### Shadow Vocabulary
- **Elevación de hoja** (`0 10px 24px -18px rgba(42,36,28,.55), 0 2px 0 rgba(42,36,28,.04)`): la única sombra del sistema; usarla en cualquier bloque que deba leerse como "papel sobre el escritorio".

### Named Rules
**La Regla de Elevación Única.** Un bloque declara su elevación con sombra o con borde, nunca ambos. La primera versión de `.case` violaba esto (borde de 1px + sombra apilados, "ghost card") — quedó corregido en la revisión de cierre.

## Shapes

Sin radio de esquina en los bloques principales (`.case`, `.disclosure`): el papel es rectangular. La única excepción son las pequeñas etiquetas de carril de canal (`.lane`, 20×20px, `border-radius: 3px`) — un radio mínimo de "ficha pequeña", nunca de tarjeta. Los puntos de la espina de progreso son círculos (`border-radius: 50%`), el único uso circular del sistema, reservado a estado/progreso.

## Components

### Manifest table (`.manifest`)
- **Estilo:** filas separadas por regla de 1px (`--rule`), sin fondo alterno de cebra — la separación viene de la línea, no del color.
- **Carril de canal:** ficha de 20×20px, letra única en mono bold (`S` Slack, `C` Correo), color de fondo `--lane-slack` / `--lane-correo`. Se eligió una letra literal en vez de un glifo o emoji tras detectar que "@" a ese tamaño se leía ambiguo como "e".
- **Marca de estado:** SVG autoral, nunca unicode/emoji — check verde para completado, cuadro hueco para pendiente. Legend-free: la forma sola comunica el estado.

### Status spine (`.spine`)
- **Estilo:** línea horizontal con nodos circulares; nodos pasados = tinta sólida, nodo actual = tinta con halo pulsante (única animación autoral del sistema, respeta `prefers-reduced-motion`), nodos futuros = contorno hueco.
- **Comportamiento responsive:** en mobile, las etiquetas de texto se ocultan visualmente (técnica `clip`, no `display:none`) — permanecen accesibles para lectores de pantalla vía `.spine-label`.

### Case card (`.case`)
- **Estilo de esquina:** ninguno (rectangular).
- **Fondo:** `--paper-sheet` sobre `--paper-ground`.
- **Estrategia de sombra:** ver Elevation & Depth — sombra únicamente, sin borde.
- **Padding interno:** `24px 24px 0` (el borde inferior de cada sección interna hace de separador, no un padding-bottom del bloque).

### Disclosure banner (`.disclosure`)
- **Estilo:** borde punteado completo (`1px dashed`), fondo de hoja — se lee como una nota adherida, no como una alerta de sistema. Único bloque del sistema con borde declarado (no lleva sombra, así que no repite la violación de elevación doble).

## Do's and Don'ts

### Do:
- **Do** usar sello de tinta (SVG autoral) para todo estado de fila — nunca un punto de color o una píldora.
- **Do** mantener el carril de canal como parte de una sola tabla cronológica continua, aunque el caso mezcle Slack y correo.
- **Do** declarar la elevación de un bloque con sombra o con borde, nunca ambos (La Regla de Elevación Única).
- **Do** etiquetar todo dato ficticio de forma explícita y legible (texto, no solo la marca de agua) — es un requisito de producto, no solo de diseño.

### Don't:
- **Don't** poner un número de caso o etiqueta suelta apilada encima de un `<h1>` en ningún breakpoint — es el patrón de kicker/eyebrow, prohibido sin excepción por el craft floor del sistema; el número de caso vive inline con el título.
- **Don't** usar rojo o verde fuera de su rol de estado (verificado / bifurcación-bloqueo) para énfasis decorativo.
- **Don't** usar IBM Plex Mono en prosa o títulos — solo en datos alineables (hora, ID, cifra).
- **Don't** introducir una tarjeta de KPI, sidebar o píldora de color de estado: es exactamente la salida estándar que este sistema existe para rechazar.
