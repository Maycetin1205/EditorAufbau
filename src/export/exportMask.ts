// exportMask
// Kap. 3 Mini-Export: deterministischer Baum-Durchlauf → SoftEngine-Maske.
//
// Export-Grundsätze:
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
import { firstDescendantOfType } from '../core/blocks/treeQuery'
import { serializeBlockEvents } from '../core/data/aktionen'
import { felderFor, tableIdFor, type DataSource } from '../core/data/dataSources'
import type { RelationTemplate } from '../core/data/relations'
import { dataSourceStore } from '../state/DataSourceStore'
import { relationStore } from '../state/RelationStore'
import {
  flowItemHeightStyle,
  flowItemStyle,
  parseFlowHeight,
  parseFlowWidth,
  resolveChildDirection,
  ROOT_FLOW,
  type FlowDirection,
  type FlowWidth,
} from '../core/blocks/flowLayout'
import tokensCssRaw from '../design/masken-tokens.css?raw'
import runtimeJsRaw from './generated/ff-runtime.js?raw'
import {
  escapeHtmlAttr,
  escapeHtmlText,
  escapeNonAsciiJs,
  guardScriptContent,
  stripCssComments,
} from './serializer'

// Verbindlicher SoftEngine-Anschluss aus JWHtmlStart.html / Monaco-Referenz.
// BüroWARE stellt diese Funktionen teils bereits im Host bereit; WEBWARE
// benötigt das Interface selbst, um pid/REGMSG, Daten-Push und Senden zu
// verdrahten. Der EditorPfad-Platzhalter wird von SoftEngine aufgelöst.
const SE_INTERFACE_SCRIPT = '<script src="<!--SOFTENGINE-VAR!EditorPfad-->/JS/JS/basis.html.interface.js"></script>'

export interface MaskExport {
  html: string
  sevariablen: string
}

// ---------- Baum → Markup ----------
// (Zeichen-Regeln — ASCII-Escaping, Skript-Schutz, CSS-Bereinigung —
// wohnen seit A6 im serializer; hier entstehen Markup und Reihenfolge.)

function styleAttr(
  node: BlockNode,
  parentDirection: FlowDirection,
  lockedWidth?: FlowWidth,
): string {
  const style = {
    ...flowItemStyle(parseFlowWidth(node.props.width), parentDirection, lockedWidth),
    // Feste Höhe (P1.3) — DIESELBE Quelle wie der Canvas-Wrapper.
    ...flowItemHeightStyle(parseFlowHeight(node.props.height), parentDirection),
  }
  const css = Object.entries(style)
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${v}`)
    .join(';')
  return css ? ` style="${escapeHtmlAttr(css)}"` : ''
}

// Musterkarten-Kontext: unterhalb eines Blocks mit templateChild erscheinen
// Instanzen dieses Typs NIE sichtbar in der Maske (Nutzer-Entscheidung
// 2026-07-10: „Demo wird gar nicht erst exportiert"). Die EINE Musterkarte
// (dieselbe Definition wie Editor-Markierung/Löschschutz: treeQuery) reist
// als inertes <template data-ff-template> — der Browser rendert sie nie,
// die Laufzeit klont daraus die Datenkarten. Alle weiteren Instanzen
// (Altbestände) werden ausgelassen.
interface TemplateCtx {
  type: string
  id: string | undefined
}

function nodeToHtml(
  tree: BlockTree,
  node: BlockNode,
  parentDirection: FlowDirection,
  depth: number,
  // Übersetzt Popup-Schritt-ids in Klarnamen (P-B): der Baumblick entsteht
  // EINMAL in exportMask, die Rekursion reicht ihn nur durch.
  popupName: (id: string) => string,
  templateCtx?: TemplateCtx,
): string {
  const def = getBlockDefinition(node.type)
  if (!def) return '' // unbekannte Typen exportieren wir nicht (sanitize verhindert das ohnehin)

  const pad = '  '.repeat(depth)
  if (templateCtx && node.type === templateCtx.type) {
    if (node.id !== templateCtx.id) return '' // Demo-Karte: nie exportieren
    const inner = nodeToHtml(tree, node, parentDirection, depth + 1, popupName, undefined)
    return `${pad}<template data-ff-template>\n${inner}\n${pad}</template>`
  }

  // Attribute in fester Reihenfolge (Registry-Defaults) → deterministisch.
  // width/height werden NICHT als Attribut exportiert — sie wirken als
  // style aufs Flex-Item (styleAttr, dieselbe flowLayout-Quelle wie Canvas).
  const attrs = Object.keys(def.defaultProps)
    .filter((key) => key !== 'width' && key !== 'height')
    .map((key) => {
      const value = node.props[key] ?? def.defaultProps[key]
      return ` ${key.toLowerCase()}="${escapeHtmlAttr(String(value ?? ''))}"`
    })
    .join('')

  // Aktionsketten (Z2) reisen als EIN data-Attribut mit dem Element — der
  // Export kennt keine Block-ids, ein FF_-Global (Muster FF_RELATIONS)
  // schiede damit aus. Deterministisch: Ereignis-Reihenfolge = Registry
  // (blockEvents), Editor-ids reisen nicht mit (serializeBlockEvents).
  // Die Laufzeit (seAktionen) liest das Attribut zurück.
  const aktionen = serializeBlockEvents(node.events, (def.blockEvents ?? []).map((e) => e.key), popupName)
  const aktionenAttr = aktionen ? ` data-ff-aktionen="${escapeHtmlAttr(aktionen)}"` : ''

  const open = `${pad}<${def.tagName}${attrs}${aktionenAttr}${styleAttr(node, parentDirection, def.lockedWidth)}>`
  if (!def.acceptsChildren || node.childIds.length === 0) {
    return `${open}</${def.tagName}>`
  }
  // Kind-Richtung aus DERSELBEN Quelle wie der Canvas (resolveChildDirection).
  const childDirection = resolveChildDirection(def, node.props)
  // Ein templateChild-Block eröffnet den Musterkarten-Kontext für seinen
  // Teilbaum; sonst reist der äußere Kontext weiter.
  const childCtx: TemplateCtx | undefined = def.templateChild
    ? { type: def.templateChild.type, id: firstDescendantOfType(tree, node.id, def.templateChild.type) }
    : templateCtx
  const children = node.childIds
    .map((id) => tree[id])
    .filter((c): c is BlockNode => Boolean(c))
    .map((c) => nodeToHtml(tree, c, childDirection, depth + 1, popupName, childCtx))
    .filter((html) => html !== '')
    .join('\n')
  return children === ''
    ? `${open}</${def.tagName}>`
    : `${open}\n${children}\n${pad}</${def.tagName}>`
}

// ---------- Datenquellen → SEFILELOOP (Kap. 5.1) ----------

// Sammelt die im Baum angehängten Datenquellen (source-Prop von Blöcken mit
// acceptsDataSource) in Baum-Reihenfolge, dedupliziert — deterministisch.
// Unbekannte Vorlagen-ids werden hier als Fallback übersprungen; im echten
// Export-Fluss fängt die Preflight (preflight.ts, S1a) eine gelöschte Quelle
// jedoch VORHER ab und blockiert den Export (Toolbar).
// `sources` = die Vorlagen-Bibliothek (Kap. 5.4: benutzerdefiniert).
function collectDataSources(tree: BlockTree, sources: readonly DataSource[]): DataSource[] {
  const seen = new Set<string>()
  const acc: DataSource[] = []
  const add = (id: unknown): void => {
    const src = typeof id === 'string' ? sources.find((s) => s.id === id) : undefined
    if (src && !seen.has(src.id)) {
      seen.add(src.id)
      acc.push(src)
    }
  }
  const visit = (node: BlockNode | undefined): void => {
    if (!node) return
    if (getBlockDefinition(node.type)?.acceptsDataSource) {
      add(node.props.source)
    }
    // „Quelle speichern" braucht seine Quelle auch OHNE angehängten
    // Baustein in FF_DATA_SOURCES (die Laufzeit löst die id dort auf).
    for (const event of getBlockDefinition(node.type)?.blockEvents ?? []) {
      for (const step of node.events?.[event.key] ?? []) {
        if (step.type === 'QUELLE_SPEICHERN' || step.type === 'CREATE_RECORD') add(step.dataSourceId)
      }
    }
    node.childIds.forEach((id) => visit(tree[id]))
  }
  visit(tree[ROOT_ID])
  return acc
}

// ---------- Relation-Vorlagen → FF_RELATIONS (Kap. 5.5) ----------

// Sammelt benutzte Vorlagen aus registry-getriebenen Relation-Properties
// UND aus Relationsschritten. Baum-, Ereignis- und Schritt-Reihenfolge sind
// deterministisch; unbekannte IDs werden von der Preflight abgefangen.
function collectRelations(
  tree: BlockTree,
  relations: readonly RelationTemplate[],
): RelationTemplate[] {
  const seen = new Set<string>()
  const acc: RelationTemplate[] = []
  const add = (id: unknown): void => {
    const rel = typeof id === 'string' ? relations.find((r) => r.id === id) : undefined
    if (!rel || seen.has(rel.id)) return
    seen.add(rel.id)
    acc.push(rel)
  }
  const visit = (node: BlockNode | undefined): void => {
    if (!node) return
    const def = getBlockDefinition(node.type)
    for (const prop of def?.customProperties ?? []) {
      if (prop.kind !== 'relation') continue
      add(node.props[prop.attributeName])
    }
    for (const event of def?.blockEvents ?? []) {
      for (const step of node.events?.[event.key] ?? []) {
        if (step.type === 'RELATION' || step.type === 'QUELLE_SPEICHERN') add(step.relationId)
        // „Neuen Satz anlegen" bringt ZWEI Vorlagen mit: Hol- und Schreib-Weg.
        if (step.type === 'CREATE_RECORD') { add(step.getRelationId); add(step.relationId) }
      }
    }
    node.childIds.forEach((id) => visit(tree[id]))
  }
  visit(tree[ROOT_ID])
  return acc
}

// ---------- Maske zusammensetzen ----------

export function exportMask(
  tree: BlockTree,
  title = 'Maske',
  // Vorlagen-Bibliothek (Kap. 5.4): standardmäßig der gelebte Bestand des
  // DataSourceStore; Tests dürfen eine feste Liste stellen (Determinismus).
  sources: readonly DataSource[] = dataSourceStore.list,
  // Relation-Vorlagen (Kap. 5.5): analog, gelebter Bestand des RelationStore.
  relations: readonly RelationTemplate[] = relationStore.list,
): MaskExport {
  const root = tree[ROOT_ID]
  // Popup-Klarnamen je Seiten-id (P-B): Popup-Schritte reisen mit dem NAMEN
  // der Seite (Editor-ids nie); die Preflight erzwingt eindeutige Namen.
  const popupNameById = new Map<string, string>()
  for (const id of root?.childIds ?? []) {
    const n = tree[id]
    if (n && getBlockDefinition(n.type)?.pageBlock) {
      popupNameById.set(n.id, typeof n.props.name === 'string' ? n.props.name : '')
    }
  }
  const popupName = (id: string): string => popupNameById.get(id) ?? ''

  const blocks = (root?.childIds ?? [])
    .map((id) => tree[id])
    .filter((n): n is BlockNode => Boolean(n))
    .map((n) => nodeToHtml(tree, n, 'column', 2, popupName))
    .join('\n')

  const used = collectDataSources(tree, sources)
  const usedRelations = collectRelations(tree, relations)

  const tokensCss = stripCssComments(tokensCssRaw)
  const runtimeJs = guardScriptContent(escapeNonAsciiJs(runtimeJsRaw.trim()))
  // Die benutzten Quellen-Definitionen reisen als DATEN mit der Maske
  // (Kap. 5.4): die Vorlagen liegen im Editor-localStorage, den die
  // exportierte Maske nie sieht — seRuntime löst source-ids über dieses
  // Global auf. DIESELBE collectDataSources-Quelle wie die SEFILELOOP
  // (Export-Grundsatz a); nur was die Runtime braucht (kein Feld-Wörterbuch:
  // Bindungen reisen längst als Feldcode-Attribute).
  //
  // SE-KONTRAKT (WEBWARE/WebUI, Beleg SE-Echttest 2026-07-15): explizit ans
  // window hängen, NIEMALS `var`. WinUI (BüroWARE) lädt die Maske als ganze
  // Seite — ein top-level `var` landet am window. WebUI führt dasselbe Skript
  // GEKAPSELT aus (iFrame/Wrapper) — ein `var` bleibt lokal, und seRuntime
  // (liest globalThis.FF_*) findet nichts: der Board-Rahmen rendert, die
  // Karten fehlen. Die Referenz JWHtmlEnde.html hängt aus genau diesem Grund
  // window.Erstellen/window.HTMLFarbe explizit an (nicht bloß deklariert).
  const sourcesJs = guardScriptContent(escapeNonAsciiJs(
    'window.FF_DATA_SOURCES = ' + JSON.stringify(used.map((s) => ({
      id: s.id,
      name: s.name,
      tableId: tableIdFor(s),
      indexField: s.indexField ?? '',
    }))) + ';',
  ))
  // Die benutzten Relation-Vorlagen reisen ebenso als DATEN mit (Kap. 5.5):
  // die Aktionsketten lösen ihre relationId über dieses Global auf. Nur
  // Technikwerte (Verb/NR/Params) — der Anzeigename bleibt im Editor.
  const relationsJs = guardScriptContent(escapeNonAsciiJs(
    'window.FF_RELATIONS = ' + JSON.stringify(usedRelations.map((r) => ({
      id: r.id,
      verb: r.verb,
      nr: r.nr,
      params: r.params,
      allowExtraParams: r.allowExtraParams === true,
    }))) + ';',
  ))

  const html = [
    '<!--SOFTENGINE-VAR!JWHtmlStart-->',
    '<!DOCTYPE html>',
    '<html lang="de">',
    '<head>',
    '<meta charset="UTF-8" />',
    `<title>${escapeHtmlText(title)}</title>`,
    SE_INTERFACE_SCRIPT,
    '<style>',
    tokensCss,
    '',
    '/* Grundgeruest + Wurzel-Fluss (identisch zum Editor-Canvas, ROOT_FLOW) */',
    'html, body { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }',
    'body { background: var(--se-bg); font-family: var(--se-font); font-size: var(--se-fs); color: var(--se-ink); }',
    `.ff-root { box-sizing: border-box; width: 100%; height: 100%; overflow: auto; display: flex; flex-direction: column; align-items: flex-start; gap: ${ROOT_FLOW.gap}px; padding: ${ROOT_FLOW.padding}px; }`,
    '</style>',
    '</head>',
    '<body>',
    '  <div class="ff-root">',
    blocks,
    '  </div>',
    '<script>',
    sourcesJs,
    relationsJs,
    runtimeJs,
    '</script>',
    '</body>',
    '</html>',
    '<!--SOFTENGINE-VAR!JWHtmlEnde-->',
  ].join('\n')

  // SEvariablen: aus DEMSELBEN Baum erzeugt wie das HTML (Grundsatz a).
  // SEFILELOOP-Einträge nach Vorbild der echten behandlung-umbau-Masken:
  // INDEX_NR 0, ALIAS = Anzeigename, ID/FELDER je Quellen-ART (IDB → eigene
  // ID + '*', Stammtabellen → feste ID + explizite pos_len-Liste, Kap. 5.4).
  // Nicht-ASCII wird \uXXXX-escaped (gültiges JSON, ASCII-Regel wie beim HTML).
  const sefileloop = used.map((s) => ({
    INDEX_NR: 0,
    ALIAS: s.name,
    ID: tableIdFor(s),
    FELDER: felderFor(s),
  }))
  const sevariablen = escapeNonAsciiJs(
    JSON.stringify({ SEFILELOOP: sefileloop, ERPAPICALL: [] }, null, 2),
  ) + '\n'

  return { html, sevariablen }
}
