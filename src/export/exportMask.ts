// exportMask
// Kap. 3 Mini-Export: deterministischer Baum-Durchlauf → SoftEngine-Maske.
//
// Export-Grundsätze (CLAUDE.md):
//  (a) HTML + SEvariablen-JSON entstehen aus DERSELBEN Quelle (Baum +
//      Datenquellen-Modell). Solange es keine Datenquellen gibt (Kap. 5),
//      ist die JSON das leere, gültige Gerüst.
//  (b) Jeder Export wird maschinell geprüft (validator.ts), bevor er
//      SoftEngine sieht.
//  (c) Determinismus: gleicher Baum → Byte für Byte identische Datei.
//      Keine Zeitstempel, kein Zufall, feste Reihenfolgen.
//
// SE-Regeln (behandlung-umbau/SE-INVENTAR.md):
//  - Marker JWHtmlStart = erste Zeile, JWHtmlEnde = letzte Zeile (NO-TOUCH)
//  - LF-only, nur ASCII (Umlaute als &#x…; im HTML, \uXXXX im JS)
//
// WYSIWYG: die Blöcke im Export sind DIESELBEN Web Components wie im Editor
// (Runtime-Bündel aus src/blocks via runtime-entry). Breite/Fluss kommen aus
// DERSELBEN flowLayout-Logik, die der Canvas benutzt.

import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { getDataSource, type DataSource } from '../core/data/dataSources'
import {
  flowItemStyle,
  parseFlowWidth,
  resolveChildDirection,
  ROOT_FLOW,
  type FlowDirection,
} from '../core/blocks/flowLayout'
import tokensCssRaw from '../design/masken-tokens.css?raw'
import runtimeJsRaw from './generated/ff-runtime.js?raw'

export interface MaskExport {
  html: string
  sevariablen: string
}

// ---------- Escaping (ASCII-Regel) ----------

function escapeNonAsciiHtml(s: string): string {
  return s.replace(/[^\n\t\x20-\x7E]/g, (c) => `&#x${c.codePointAt(0)!.toString(16).toUpperCase()};`)
}

function escapeHtmlText(s: string): string {
  return escapeNonAsciiHtml(
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
  )
}

function escapeHtmlAttr(s: string): string {
  return escapeHtmlText(s).replace(/"/g, '&quot;')
}

function escapeNonAsciiJs(s: string): string {
  // Nicht-ASCII in JS-Bündeln steht praktisch nur in String-Literalen —
  // \uXXXX ist dort immer gültig. Ein Test kompiliert das Ergebnis zur
  // Sicherheit (export.test.ts).
  return s.replace(/[^\n\t\x20-\x7E]/g, (c) => {
    const code = c.charCodeAt(0)
    return '\\u' + code.toString(16).toUpperCase().padStart(4, '0')
  })
}

// '</script>' im eingebetteten Bündel würde den Skriptblock sprengen.
function guardScriptContent(js: string): string {
  return js.replace(/<\/script/gi, '<\\/script')
}

// CSS: Kommentare raus (enthalten Umlaute/Gedankenstriche), dann ASCII-Check
// durch den Validator. Werte selbst sind ASCII.
function stripCssComments(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l, i, arr) => l !== '' || (arr[i - 1] ?? '') !== '')
    .join('\n')
    .trim()
}

// ---------- Baum → Markup ----------

function styleAttr(node: BlockNode, parentDirection: FlowDirection): string {
  const style = flowItemStyle(parseFlowWidth(node.props.width), parentDirection)
  const css = Object.entries(style)
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${v}`)
    .join(';')
  return css ? ` style="${escapeHtmlAttr(css)}"` : ''
}

function nodeToHtml(
  tree: BlockTree,
  node: BlockNode,
  parentDirection: FlowDirection,
  depth: number,
): string {
  const def = getBlockDefinition(node.type)
  if (!def) return '' // unbekannte Typen exportieren wir nicht (sanitize verhindert das ohnehin)

  const pad = '  '.repeat(depth)
  // Attribute in fester Reihenfolge (Registry-Defaults) → deterministisch.
  // width wird NICHT als Attribut exportiert — sie wirkt als style aufs Flex-Item.
  const attrs = Object.keys(def.defaultProps)
    .filter((key) => key !== 'width')
    .map((key) => {
      const value = node.props[key] ?? def.defaultProps[key]
      return ` ${key.toLowerCase()}="${escapeHtmlAttr(String(value ?? ''))}"`
    })
    .join('')

  const open = `${pad}<${def.tagName}${attrs}${styleAttr(node, parentDirection)}>`
  if (!def.acceptsChildren || node.childIds.length === 0) {
    return `${open}</${def.tagName}>`
  }
  // Kind-Richtung aus DERSELBEN Quelle wie der Canvas (resolveChildDirection).
  const childDirection = resolveChildDirection(def, node.props)
  const children = node.childIds
    .map((id) => tree[id])
    .filter((c): c is BlockNode => Boolean(c))
    .map((c) => nodeToHtml(tree, c, childDirection, depth + 1))
    .join('\n')
  return `${open}\n${children}\n${pad}</${def.tagName}>`
}

// ---------- Datenquellen → SEFILELOOP (Kap. 5.1) ----------

// Sammelt die im Baum angehängten Datenquellen (source-Prop von Blöcken mit
// acceptsDataSource) in Baum-Reihenfolge, dedupliziert — deterministisch.
// Unbekannte Vorlagen-ids werden übersprungen (Quelle wurde entfernt).
function collectDataSources(tree: BlockTree): DataSource[] {
  const seen = new Set<string>()
  const acc: DataSource[] = []
  const visit = (node: BlockNode | undefined): void => {
    if (!node) return
    if (getBlockDefinition(node.type)?.acceptsDataSource) {
      const src = typeof node.props.source === 'string' ? getDataSource(node.props.source) : undefined
      if (src && !seen.has(src.id)) {
        seen.add(src.id)
        acc.push(src)
      }
    }
    node.childIds.forEach((id) => visit(tree[id]))
  }
  visit(tree[ROOT_ID])
  return acc
}

// ---------- Maske zusammensetzen ----------

export function exportMask(tree: BlockTree, title = 'Maske'): MaskExport {
  const root = tree[ROOT_ID]
  const blocks = (root?.childIds ?? [])
    .map((id) => tree[id])
    .filter((n): n is BlockNode => Boolean(n))
    .map((n) => nodeToHtml(tree, n, 'column', 2))
    .join('\n')

  const tokensCss = stripCssComments(tokensCssRaw)
  const runtimeJs = guardScriptContent(escapeNonAsciiJs(runtimeJsRaw.trim()))

  const html = [
    '<!--SOFTENGINE-VAR!JWHtmlStart-->',
    '<!DOCTYPE html>',
    '<html lang="de">',
    '<head>',
    '<meta charset="UTF-8" />',
    `<title>${escapeHtmlText(title)}</title>`,
    '<style>',
    tokensCss,
    '',
    '/* Grundgeruest + Wurzel-Fluss (identisch zum Editor-Canvas, ROOT_FLOW) */',
    'html, body { margin: 0; padding: 0; }',
    'body { background: var(--se-bg); font-family: var(--se-font); font-size: var(--se-fs); color: var(--se-ink); }',
    `.ff-root { display: flex; flex-direction: column; align-items: flex-start; gap: ${ROOT_FLOW.gap}px; padding: ${ROOT_FLOW.padding}px; }`,
    '</style>',
    '</head>',
    '<body>',
    '  <div class="ff-root">',
    blocks,
    '  </div>',
    '<script>',
    runtimeJs,
    '</script>',
    '</body>',
    '</html>',
    '<!--SOFTENGINE-VAR!JWHtmlEnde-->',
  ].join('\n')

  // SEvariablen: aus DEMSELBEN Baum erzeugt wie das HTML (Grundsatz a).
  // SEFILELOOP-Einträge nach Vorbild der echten Repo-Masken
  // (dashboard/praxis-kanban.html): INDEX_NR 0, ALIAS = Anzeigename,
  // ID = IDB-Tabellen-ID, FELDER '*'. Nicht-ASCII wird \uXXXX-escaped
  // (gültiges JSON, ASCII-Regel wie beim HTML).
  const sefileloop = collectDataSources(tree).map((s) => ({
    INDEX_NR: 0,
    ALIAS: s.name,
    ID: s.idbId,
    FELDER: '*',
  }))
  const sevariablen = escapeNonAsciiJs(
    JSON.stringify({ SEFILELOOP: sefileloop, ERPAPICALL: [] }, null, 2),
  ) + '\n'

  return { html, sevariablen }
}
