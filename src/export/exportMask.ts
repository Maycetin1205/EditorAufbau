// exportMask
// Mini-Export: deterministischer Baum-Durchlauf → SoftEngine-Maske.
//
// Export-Grundsätze:
//  (a) HTML + SEvariablen-JSON entstehen aus DERSELBEN Quelle (Baum +
//      Datenquellen-Modell). Solange es keine Datenquellen gibt,
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
import { ACTION_VALUE_ID_ATTR, serializeBlockEvents } from '../core/data/aktionen'
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
import {
  parseRasterPos,
  rasterFlaecheStyle,
  rasterItemStyle,
} from '../core/blocks/rasterLayout'
import tokensCssRaw from '../design/masken-tokens.css?raw'
import runtimeJsRaw from './generated/ff-runtime.js?raw'
import {
  escapeHtmlAttr,
  escapeHtmlText,
  escapeNonAsciiJs,
  guardScriptContent,
  stripCssComments,
} from './serializer'

// SoftEngine-Anschluss aus JWHtmlStart.html / Monaco-Referenz (Quelle liegt
// NICHT in diesem Repo). Der EditorPfad-Platzhalter wird von SoftEngine
// aufgelöst.
//
// Ehrlicher Beleg-Stand (Befund B4, 2026-07-28): Gebraucht werden die
// Bridge-Funktionen (basisHTML_REGISTER / basisHTML_SND_MSG /
// sendBWLinkIntern) — dass genau DIESER Import sie liefern muss, ist nicht
// belegt. Die beiden echt laufenden Referenzmasken in docs/chef-maske/ laden
// kein externes Skript, und frühe Echttests bestanden vor Einführung des
// Tags; eingeführt wurde er zusammen mit dem window.FF_*-Fix (2364726), also
// ohne sauberen A/B-Vergleich. Bleibt als defensiver Anschluss drin, bis ein
// kontrollierter WEBWARE-Test entscheidet — nicht ohne diesen Test entfernen
// UND nicht als bewiesenen Kontrakt zitieren.
const SE_INTERFACE_SCRIPT = '<script src="<!--SOFTENGINE-VAR!EditorPfad-->/JS/JS/basis.html.interface.js"></script>'

// Layout-Props reisen NICHT als Element-Attribut, sondern als style (Fluss:
// width/height über flowItemStyle; Raster: rasterX/Y/W/H über rasterItemStyle
// = grid-column/row). Ohne diese Ausnahme landeten sie doppelt und unnütz als
// rasterx="0" … im Markup.
const LAYOUT_ATTR_AUSNAHME = new Set(['width', 'height', 'rasterX', 'rasterY', 'rasterW', 'rasterH'])

export interface MaskExport {
  html: string
  sevariablen: string
}

// ---------- Baum → Markup ----------
// (Zeichen-Regeln — ASCII-Escaping, Skript-Schutz, CSS-Bereinigung —
// wohnen seit A6 im serializer; hier entstehen Markup und Reihenfolge.)

// camelCase-Style-Objekt → CSS-Deklarationen (kebab-case). EINE Stelle für
// das Block-style-Attribut UND die Wurzel-Grid-Regel.
function styleToCss(style: Record<string, string | number>): string {
  return Object.entries(style)
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${v}`)
    .join(';')
}

// Layout-Style eines Blocks als HTML-style-Attribut — DIESELBE Quelle wie der
// Canvas-Wrapper (WYSIWYG). Auf der Rasterebene (direkte Wurzel-Kinder)
// bestimmt die Zelle Platz+Größe (rasterItemStyle); Popup-Overlays (pageBlock)
// positionieren sich selbst über position:absolute (kein Layout-Style);
// INNERHALB von Containern gilt weiter der Fluss (flowItemStyle).
function styleAttr(
  node: BlockNode,
  parentDirection: FlowDirection,
  lockedWidth: FlowWidth | undefined,
  rasterEbene: boolean,
  istPage: boolean,
): string {
  let style: Record<string, string | number>
  if (istPage) {
    style = {}
  } else if (rasterEbene) {
    style = rasterItemStyle(parseRasterPos(node.props))
  } else {
    style = {
      ...flowItemStyle(parseFlowWidth(node.props.width), parentDirection, lockedWidth),
      // Feste Höhe — DIESELBE Quelle wie der Canvas-Wrapper.
      ...flowItemHeightStyle(parseFlowHeight(node.props.height), parentDirection),
    }
  }
  const css = styleToCss(style)
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
  // Übersetzt Popup-Schritt-ids in Klarnamen: der Baumblick entsteht
  // EINMAL in exportMask, die Rekursion reicht ihn nur durch.
  popupName: (id: string) => string,
  templateCtx?: TemplateCtx,
  // true = dieser Knoten liegt auf der Raster-Ebene (direktes Wurzel-Kind der
  // Hauptseite). Die Rekursion in Container/Popups reicht false weiter (Fluss);
  // die Popup-Innenfläche folgt in einer späteren Etappe.
  rasterEbene = false,
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
  // Layout-Props (width/height im Fluss, rasterX/Y/W/H auf dem Raster) werden
  // NICHT als Attribut exportiert — sie wirken als style aufs Item (styleAttr,
  // dieselbe flowLayout/rasterLayout-Quelle wie der Canvas).
  const attrs = Object.keys(def.defaultProps)
    .filter((key) => !LAYOUT_ATTR_AUSNAHME.has(key))
    .map((key) => {
      const value = node.props[key] ?? def.defaultProps[key]
      // Listen reisen als JSON (komma- und umlautsicher) — String(array) joint
      // mit Komma und ist nicht mehr eindeutig rueckgewinnbar; der Baustein
      // liest das JSON ueber seinen Attribut-Wandler zurueck. Alles andere als
      // Text wie bisher.
      const roh = Array.isArray(value) ? JSON.stringify(value) : String(value ?? '')
      return ` ${key.toLowerCase()}="${escapeHtmlAttr(roh)}"`
    })
    .join('')

  // Aktionsketten reisen als EIN data-Attribut mit dem Element.
  // Schritt-ids reisen nicht mit; nur Registry-freigegebene Wert-Bausteine
  // behalten gezielt ihre stabile id, damit andere Aktionen sie auslesen.
  // Deterministisch: Ereignis-Reihenfolge = Registry (blockEvents).
  // Die Laufzeit (seAktionen) liest das Attribut zurück.
  const aktionen = serializeBlockEvents(node.events, (def.blockEvents ?? []).map((e) => e.key), popupName)
  const aktionenAttr = aktionen ? ` data-ff-aktionen="${escapeHtmlAttr(aktionen)}"` : ''
  const actionValueIdAttr = (def.actionValueSpots?.length ?? 0) > 0
    ? ` ${ACTION_VALUE_ID_ATTR}="${escapeHtmlAttr(node.id)}"`
    : ''

  // Rasterflaeche: das Wurzel-Kind fuellt seine Zelle (DIESELBE Marke wie im
  // Editor, useLitElement/'fuellt') — sein Baustein-CSS streckt den Inhalt auf
  // die Zellhoehe. Popup-Overlays (pageBlock) sind kein Rasterkind.
  const fuelltAttr = rasterEbene && def.pageBlock !== true ? ' fuellt' : ''
  const open = `${pad}<${def.tagName}${attrs}${aktionenAttr}${actionValueIdAttr}${fuelltAttr}${styleAttr(node, parentDirection, def.lockedWidth, rasterEbene, def.pageBlock === true)}>`
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

// ---------- Datenquellen → SEFILELOOP ----------

// Sammelt die im Baum angehängten Datenquellen (source-Prop von Blöcken mit
// acceptsDataSource) in Baum-Reihenfolge, dedupliziert — deterministisch.
// Unbekannte Vorlagen-ids werden hier als Fallback übersprungen; im echten
// Export-Fluss fängt die Preflight (preflight.ts, S1a) eine gelöschte Quelle
// jedoch VORHER ab und blockiert den Export (Toolbar).
// `sources` = die Vorlagen-Bibliothek.
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
    node.childIds.forEach((id) => visit(tree[id]))
  }
  visit(tree[ROOT_ID])
  return acc
}

// ---------- Relation-Vorlagen → FF_RELATIONS ----------

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
        if (step.type === 'RELATION') add(step.relationId)
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
  // Vorlagen-Bibliothek: standardmäßig der gelebte Bestand des
  // DataSourceStore; Tests dürfen eine feste Liste stellen (Determinismus).
  sources: readonly DataSource[] = dataSourceStore.list,
  // Relation-Vorlagen: analog, gelebter Bestand des RelationStore.
  relations: readonly RelationTemplate[] = relationStore.list,
): MaskExport {
  const root = tree[ROOT_ID]
  // Popup-Klarnamen je Seiten-id: Popup-Schritte reisen mit dem NAMEN
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
    // Direkte Wurzel-Kinder = Raster-Ebene (rasterEbene=true).
    .map((n) => nodeToHtml(tree, n, 'column', 2, popupName, undefined, true))
    .join('\n')

  const used = collectDataSources(tree, sources)
  const usedRelations = collectRelations(tree, relations)

  const tokensCss = stripCssComments(tokensCssRaw)
  const runtimeJs = guardScriptContent(escapeNonAsciiJs(runtimeJsRaw.trim()))
  // Die benutzten Quellen-Definitionen reisen als DATEN mit der Maske
  // die Vorlagen liegen im Editor-localStorage, den die
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
  // Die benutzten Relation-Vorlagen reisen ebenso als DATEN mit:
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
    '/* Grundgeruest + Wurzel-Raster (identisch zum Editor-Canvas, rasterFlaecheStyle) */',
    'html, body { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }',
    'body { background: var(--se-bg); font-family: var(--se-font); font-size: var(--se-fs); color: var(--se-ink); }',
    `.ff-root { box-sizing: border-box; width: 100%; height: 100%; overflow: auto; ${styleToCss(rasterFlaecheStyle())}; padding: ${ROOT_FLOW.padding}px; }`,
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
  // ID + '*', Stammtabellen → feste ID + explizite pos_len-Liste).
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
