import { createHash } from "node:crypto";
import { lstat, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
const built = args.includes("--built");
const fail = (message) => { throw new Error(message); };
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

// A deliberately small SVG subset for these static, outlined brand assets.
// No scripts, CSS, links, entities, fonts, embedded media or external resources.
const elements = new Set(["svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "title", "desc"]);
const attributes = new Set(["xmlns", "viewBox", "role", "aria-labelledby", "aria-label", "id", "transform", "x", "y", "x1", "y1", "x2", "y2", "width", "height", "rx", "ry", "r", "cx", "cy", "d", "points", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "fill-rule", "clip-rule", "opacity", "fill-opacity", "stroke-opacity"]);

function verifySvg(bytes, path) {
  let text;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes).trim(); }
  catch { fail(`${path}: SVG no es UTF-8 válido.`); }
  if (!text.startsWith("<svg") || !text.endsWith("</svg>")) fail(`${path}: falta raíz SVG.`);
  const stack = [];
  let roots = 0;
  let offset = 0;
  const plainText = (value) => {
    if (/[<&]/.test(value)) fail(`${path}: marcado o entidades no admitidos.`);
    if (value.trim() && !["title", "desc"].includes(stack.at(-1))) fail(`${path}: texto fuera de title/desc.`);
  };
  for (const token of text.matchAll(/<[^>]*>/g)) {
    plainText(text.slice(offset, token.index));
    offset = token.index + token[0].length;
    const closing = token[0].match(/^<\/([A-Za-z][A-Za-z0-9]*)\s*>$/);
    if (closing) {
      if (stack.pop() !== closing[1]) fail(`${path}: etiquetas SVG desbalanceadas.`);
      continue;
    }
    const opening = token[0].match(/^<([A-Za-z][A-Za-z0-9]*)([\s\S]*?)(\/?)>$/);
    if (!opening || !elements.has(opening[1])) fail(`${path}: elemento SVG no admitido.`);
    const [, tag, rawAttributes, selfClosing] = opening;
    if (!stack.length) {
      if (tag !== "svg" || ++roots !== 1) fail(`${path}: raíz SVG inválida.`);
    } else if (tag === "svg" || ["title", "desc"].includes(stack.at(-1))) {
      fail(`${path}: estructura SVG no admitida.`);
    }
    const parsed = new Map();
    let remaining = rawAttributes;
    while (remaining.trim()) {
      const match = remaining.match(/^\s+([A-Za-z_:][\w:.-]*)\s*=\s*(["'])([^"'<>]*)\2/);
      if (!match) fail(`${path}: atributo SVG mal formado.`);
      const [, name, , value] = match;
      if (!attributes.has(name) || parsed.has(name) || value.includes("&")) fail(`${path}: atributo SVG no admitido: ${name}.`);
      if (["fill", "stroke"].includes(name) && !/^(?:none|currentColor|#[\da-f]{3,8}|[a-z]+)$/i.test(value)) fail(`${path}: pintura SVG no admitida.`);
      if (name === "xmlns" && (tag !== "svg" || value !== "http://www.w3.org/2000/svg")) fail(`${path}: namespace SVG inválido.`);
      parsed.set(name, value);
      remaining = remaining.slice(match[0].length);
    }
    if (tag === "svg") {
      const viewBox = (parsed.get("viewBox") ?? "").trim().split(/[\s,]+/).map(Number);
      if (parsed.get("xmlns") !== "http://www.w3.org/2000/svg" || viewBox.length !== 4 || !viewBox.every(Number.isFinite) || viewBox[2] <= 0 || viewBox[3] <= 0) fail(`${path}: namespace o viewBox ausente/inválido.`);
    }
    if (!selfClosing) stack.push(tag);
  }
  plainText(text.slice(offset));
  if (stack.length || roots !== 1) fail(`${path}: SVG incompleto.`);
}

async function verifyFile(path, asset) {
  const file = resolve(root, path);
  if (!(await lstat(file)).isFile()) fail(`${path}: debe ser un archivo regular, sin enlace simbólico.`);
  const bytes = await readFile(file);
  if (bytes.length !== asset.size_bytes) fail(`${path}: tamaño distinto del manifiesto.`);
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== asset.sha256) fail(`${path}: SHA-256 distinto del manifiesto.`);
  if (path.endsWith(".png")) {
    if (!bytes.subarray(0, 8).equals(pngSignature)) fail(`${path}: firma PNG inválida.`);
  } else {
    verifySvg(bytes, path);
  }
}

try {
  if (args.some((arg) => arg !== "--built")) fail("Uso: node scripts/verify-assets.mjs [--built]");
  const manifest = JSON.parse(await readFile(resolve(root, "assets/integrity.json"), "utf8"));
  if (manifest.version !== 1 || manifest.algorithm !== "sha256" || !Array.isArray(manifest.assets)) fail("Formato de manifiesto de assets inválido.");
  const expected = ["assets/panelateam-medellin.png", ...(await readdir(resolve(root, "public/brand"))).filter((name) => name.endsWith(".svg")).map((name) => `public/brand/${name}`)].sort();
  const listed = manifest.assets.map((asset) => asset?.path).sort();
  if (JSON.stringify(listed) !== JSON.stringify(expected)) fail("El manifiesto debe cubrir el PNG original y todos los SVG de public/brand, sin duplicados.");
  let count = 0;
  for (const asset of manifest.assets) {
    if (!/^(?:assets\/[a-z0-9-]+\.png|public\/brand\/[a-z0-9-]+\.svg)$/.test(asset.path) || !Number.isSafeInteger(asset.size_bytes) || asset.size_bytes <= 0 || !/^[a-f0-9]{64}$/.test(asset.sha256)) fail("Entrada de asset inválida.");
    await verifyFile(asset.path, asset);
    count += 1;
    if (built && asset.path.startsWith("public/")) {
      await verifyFile(`dist/${asset.path.slice("public/".length)}`, asset);
      count += 1;
    }
  }
  console.log(`Integridad de assets OK: ${manifest.assets.length} originales${built ? ` y ${count - manifest.assets.length} copias de build` : ""}; hashes, firma PNG y SVG estáticos verificados.`);
} catch (error) {
  console.error(`Integridad de assets FALLÓ: ${error.message}`);
  process.exitCode = 1;
}
