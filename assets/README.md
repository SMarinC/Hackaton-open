# Identidad visual y verificación de archivos

`panelateam-medellin.png` fue generada el 12 de septiembre de 2026 con la herramienta integrada de generación de imágenes, a solicitud de PanelaTeam.

Concepto: bloques de panela con el emblema de ChatGPT/OpenAI sobre las montañas y el valle de Medellín, con el nombre PanelaTeam y el texto del evento.

Es una ilustración del equipo para la hackathon; no representa datos observados de una tienda.

Los logos de **Panela Stocks**, la solución del equipo **PanelaTeam**, están en [public/brand](../public/brand/): [logo principal](../public/brand/panela-stocks-logo.svg), [logo inverso](../public/brand/panela-stocks-logo-inverse.svg) e [icono](../public/brand/panela-stocks-icon.svg). Fueron reconstruidos en código desde la captura aportada por el usuario. El texto usa Georgia Bold convertido a trazados; los SVG no cargan fuentes externas. Son adaptaciones de esa referencia, no el archivo vectorial original. El PNG de la hackathon se conserva sin modificaciones.

El 12 de septiembre de 2026, una inspección en Chrome reprodujo una respuesta del CDN de GitHub: `503 Backend.max_conn reached`, error `54113` de Varnish. Una consulta HTTP independiente obtuvo el PNG completo con el mismo SHA-256 que el archivo local. Ese fallo de entrega no demostró corrupción de la imagen. La disponibilidad del CDN y la integridad de los bytes son comprobaciones distintas.

La fijación de la URL de `raw.githubusercontent.com` a un commit tampoco resolvió la carga en Chrome. El README usa ahora una [copia del PNG original en los adjuntos de GitHub](https://github.com/user-attachments/assets/7d92dfa2-2abc-4919-8c9b-512aa5b29dd5). Se subió el mismo archivo, sin regenerarlo ni editarlo; la vista previa decodificó sus 1254 × 1254 píxeles. El original versionado y su hash siguen siendo la referencia de integridad. La URL del README es la dirección estable del adjunto, no la redirección temporal firmada que devuelve el servicio.

[integrity.json](integrity.json) registra ruta, tamaño y SHA-256 del PNG y de los tres SVG. El manifiesto fija la versión revisada: un cambio intencional de arte requiere revisar el resultado visual y actualizar expresamente su entrada, sin recalcular hashes de manera automática en CI.

```sh
npm run check:assets
npm run build
npm run check:assets -- --built
```

El verificador no tiene dependencias adicionales ni realiza solicitudes de red. Comprueba hashes, tamaños, firma PNG y una estructura SVG estática acotada; rechaza scripts, eventos, CSS, entidades, enlaces, fuentes, medios incrustados y referencias externas. Con `--built` también compara las copias de `public/brand` en `dist/brand`. CI ejecuta el control antes de las pruebas y después del build. Esto detecta cambios accidentales y copias incompletas; no certifica la autoría, los derechos ni la fidelidad visual del arte, ni sustituye una inspección visual o un decodificador completo de imágenes.
