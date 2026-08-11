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
import { bindingProp, listeFuerExport } from '../core/blocks/BlockDefinition'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import {
  bindbareStellenVon,
  darfAuswahlFolgen,
  firstDescendantOfType,
  istAuswahlGeber,
  QUELLE_PROP,
  relationIdsVon,
  traegtEigeneQuelle,
} from '../core/blocks/treeQuery'
import { ACTION_VALUE_ID_ATTR, serializeBlockEvents } from '../core/data/aktionen'
import { AUSWAHL_FOLGE_PROP } from '../core/data/auswahlFolge'
import {
  felderFor,
  kopfsatzFor,
  tableIdFor,
  varAusKopfsaetzen,
  type DataSource,
} from '../core/data/dataSources'
import type { RelationTemplate } from '../core/data/relations'
import { WEITERE_QUELLEN_PROP } from '../core/data/sourceLinks'
import { dataSourceStore } from '../state/DataSourceStore'
import { relationStore } from '../state/RelationStore'
import {
  resolveChildDirection,
  ROOT_FLOW,
  type FlowDirection,
} from '../core/blocks/flowLayout'
import { rasterFlaecheStyle } from '../core/blocks/rasterLayout'
import schriftenCssRaw from '../design/masken-schriften.css?raw'
import tokensCssRaw from '../design/masken-tokens.css?raw'
import { collectDataSources } from './benutzteQuellen'
import { vorschauRoh, vorschauStellenVon } from './bindungsVorschau'
import { styleAttr, styleToCss } from './knotenStil'
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
// aufgelöst. Der Tag bleibt drin, wird aber nicht als bewiesener SE-Kontrakt
// zitiert. Beweislage: CLAUDE.md, Regel 5 / Befund B4.
const SE_INTERFACE_SCRIPT = '<script src="<!--SOFTENGINE-VAR!EditorPfad-->/JS/JS/basis.html.interface.js"></script>'

// Layout-Props reisen NICHT als Element-Attribut, sondern als style (Fluss:
// width/height über flowItemStyle; Raster: rasterX/Y/W/H über rasterItemStyle
// = grid-column/row). Ohne diese Ausnahme landeten sie doppelt und unnütz als
// rasterx="0" … im Markup.
const LAYOUT_ATTR_AUSNAHME = new Set(['width', 'height', 'rasterX', 'rasterY', 'rasterW', 'rasterH'])

// Die EIGENE Datenquelle eines Bausteins samt allem, was an ihr haengt. Die
// zwei gehoeren zusammen: traegt der Baustein gerade keine eigene Quelle
// (traegtEigeneQuelle), bleiben BEIDE daheim — eine weitere Quelle ohne erste
// hat nichts, woran sie anknuepfen koennte.
const EIGENE_QUELLE_PROPS = new Set([QUELLE_PROP, WEITERE_QUELLEN_PROP])

export interface MaskExport {
  html: string
  sevariablen: string
}

// ---------- Baum → Markup ----------
// (Zeichen-Regeln — ASCII-Escaping, Skript-Schutz, CSS-Bereinigung —
// wohnen seit A6 im serializer; hier entstehen Markup und Reihenfolge.)

// Ein Prop-Wert in seiner ATTRIBUT-Form (der String, der im Markup stünde).
// Listen reisen als JSON (komma- und umlautsicher) — String(array) joint mit
// Komma und ist nicht mehr eindeutig rueckgewinnbar; der Baustein liest das
// JSON ueber seinen Attribut-Wandler zurueck. Alles andere als Text.
// EINE Stelle, weil zwei Leser dieselbe Form brauchen: das geschriebene
// Attribut UND der Vergleich gegen den Registry-Standard (attribute).
function attributWert(value: unknown): string {
  return Array.isArray(value) ? JSON.stringify(value) : String(value ?? '')
}

// Layout-Style eines Knotens: styleAttr/styleToCss wohnen in knotenStil
// (2026-08-06, 500-Zeilen-Deckel) — hier entstehen Markup und Reihenfolge,
// dort die Umrechnung Fluss/Raster → CSS.

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
  // Vorlagen-Bibliothek: nur fuer die Klarnamen-Vorschau (bindungsVorschau).
  sources: readonly DataSource[],
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
    const inner = nodeToHtml(tree, node, parentDirection, depth + 1, popupName, sources, undefined)
    return `${pad}<template data-ff-template>\n${inner}\n${pad}</template>`
  }

  // Bindungen von Stellen, die an diesem Baustein GERADE nicht bindbar sind
  // (bindbareStellenVon): am Nachschlage-Feld ist das seine Wert-Stelle. Der
  // Editor bietet die Bindung dort nicht an, die Laufzeit liest sie nicht — ein
  // Attribut dafuer saehe im Export eingestellt aus (dieselbe Linie wie die
  // daheim gebliebene Auswahl-Folge unten).
  const bindbareStellen = bindbareStellenVon(node)
  const bindbar = new Set(bindbareStellen.map((spot) => spot.prop))
  const stilleBindungen = new Set<string>(
    (def.bindableSpots ?? [])
      .filter((spot) => !bindbar.has(spot.prop))
      .map((spot) => bindingProp(spot.prop)),
  )
  // Vorschau in eine ANDERE Prop (Registry: das Formularfeld schickt den
  // Klarnamen in seinen Platzhalter).
  const vorschauStellen = vorschauStellenVon(node)

  // Attribute in fester Reihenfolge (Registry-Defaults) → deterministisch.
  // Layout-Props (width/height im Fluss, rasterX/Y/W/H auf dem Raster) werden
  // NICHT als Attribut exportiert — sie wirken als style aufs Item (styleAttr,
  // dieselbe flowLayout/rasterLayout-Quelle wie der Canvas).
  const attrs = Object.keys(def.defaultProps)
    .filter((key) => !LAYOUT_ATTR_AUSNAHME.has(key))
    .map((key) => {
      // Die Auswahl-FOLGE reist nur mit, wenn der Baustein in seinem
      // aktuellen Zustand folgen darf (darfAuswahlFolgen — dieselbe Antwort
      // wie Inspector und Preflight): ohne Quelle hat er keine Zeilen, die
      // eine Auswahl einengen koennte, und eine liegen gebliebene Folge
      // bliebe wirkungslos — ein Attribut, das nie wirkt, saehe im Export
      // eingestellt aus.
      if (key === AUSWAHL_FOLGE_PROP && !darfAuswahlFolgen(node)) return ''
      // Und die EIGENE Datenquelle nur, wenn der Baustein sie in seinem
      // aktuellen Zustand ueberhaupt traegt: das Nachschlage-Feld liest seinen
      // Wert aus dem Fenster, nicht aus einer eigenen Quelle. Eine alte
      // Bindung daran bleibt in den Props (unsichtbar ist nicht geloescht),
      // reist aber nicht mit — sonst stuende im Export eine Quelle, die kein
      // Baustein liest, und collectDataSources laedt dafuer eine ganze Tabelle
      // in die Maske (Praezedenz: der zurueckgestellte Feldtyp).
      if (EIGENE_QUELLE_PROPS.has(key) && !traegtEigeneQuelle(node)) return ''
      if (stilleBindungen.has(key)) return ''
      const standard = def.defaultProps[key]
      // Die bindbare LISTE geht geputzt hinaus: Einstellungen, die zur
      // aktuellen Darstellung eines Eintrags nicht gehoeren, liest in der Maske
      // niemand (listeFuerExport — Nutzer-Meldung 2026-08-06 an einer Spalte,
      // die auf „Text" stand und noch ihre Bild-Bindungen mittrug).
      const wert = key === def.listenBindung?.prop
        ? listeFuerExport(node.props[key] ?? standard, def.listenBindung)
        : (node.props[key] ?? standard)
      const roh = vorschauStellen.has(key)
        ? vorschauRoh(node, vorschauStellen.get(key)!, sources, standard)
        : attributWert(wert)
      // STANDARDWERT reist NICHT mit (2026-08-06). Vorher trug jeder Baustein
      // jede Nicht-Layout-Eigenschaft im Markup — auch die nie angefasste:
      // an JEDEM Text hing farbe="standard" source="" textfield="", an JEDER
      // Karte acht leere Bindungen. Das blaeht die Maske auf und verdeckt in
      // jedem Export-Diff das Wenige, was der Bauer wirklich eingestellt hat.
      // Verglichen wird die ATTRIBUT-Form (attributWert), nicht der rohe Wert:
      // entscheidend ist, ob im Markup derselbe String stuende — 520 und '520'
      // sind dasselbe Attribut.
      // Die frueherer Sonderregel „leere Liste reist nicht" (weitereQuellen,
      // folgtAuswahl) geht hier auf: deren Standard IST die leere Liste.
      // BEDINGUNG dieser Regel: die Laufzeit muss „Attribut fehlt" wie den
      // Standard lesen. Bei Lit-Properties gilt das von selbst (der Klassen-
      // Standardwert bleibt stehen); die drei Laufzeit-Leser, die direkt
      // getAttribute benutzen und einen NICHT-leeren Standard haben, ziehen
      // ihren Standard seit demselben Commit aus der Registry
      // (blocks/shared/seAktionen, kanban/seRuntime, tabelle/seRuntime).
      if (roh === attributWert(standard)) return ''
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
  // Auswahl-GEBER tragen ihre Baum-id als data-ff-id (2026-08-05): darueber
  // merkt sich die Laufzeit die gewaehlte Zeile je Baustein, und Folger
  // adressieren ihren Geber (folgtAuswahl.geberId = derselbe Wert). Gestempelt
  // wird bei jedem Geber, nicht nur bei Verweis — ein Codepfad, und die
  // Markierung funktioniert auch ohne Folger (bausteininterne Auswahl).
  // WER Geber ist, leitet istAuswahlGeber aus Registry + Zustand her (seit
  // 2026-08-06, davor ein Registry-Schalter je Bausteintyp): dieselbe Antwort
  // wie im Inspector und im Preflight — ein Baustein, dem der Editor keine
  // Folger anbietet, bekommt auch keine Kennung, und umgekehrt.
  const auswahlIdAttr = istAuswahlGeber(node)
    ? ` data-ff-id="${escapeHtmlAttr(node.id)}"`
    : ''

  // Rasterflaeche: das Wurzel-Kind fuellt seine Zelle (DIESELBE Marke wie im
  // Editor, useLitElement/'fuellt') — sein Baustein-CSS streckt den Inhalt auf
  // die Zellhoehe. Popup-Overlays (pageBlock) sind kein Rasterkind.
  const fuelltAttr = rasterEbene && def.pageBlock !== true ? ' fuellt' : ''
  const open = `${pad}<${def.tagName}${attrs}${aktionenAttr}${actionValueIdAttr}${auswahlIdAttr}${fuelltAttr}${styleAttr(node, parentDirection, def.lockedWidth, rasterEbene, def.pageBlock === true)}>`
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
    .map((c) => nodeToHtml(tree, c, childDirection, depth + 1, popupName, sources, childCtx))
    .filter((html) => html !== '')
    .join('\n')
  return children === ''
    ? `${open}</${def.tagName}>`
    : `${open}\n${children}\n${pad}</${def.tagName}>`
}

// ---------- Datenquellen → SEFILELOOP ----------
// WELCHE Quellen die Maske benutzt, beantwortet ./benutzteQuellen
// (collectDataSources) — dort ausgezogen, weil diese Datei am Deckel steht.

// ---------- Relation-Vorlagen → FF_RELATIONS ----------

// Sammelt benutzte Vorlagen — WELCHE ein Baustein benutzt, sagt relationIdsVon
// (dieselbe Stelle, die auch die Verwendungs-Anzeige der Steuerung fragt).
// Baum-, Ereignis- und Schritt-Reihenfolge sind deterministisch; unbekannte IDs
// werden von der Preflight abgefangen.
function collectRelations(
  tree: BlockTree,
  relations: readonly RelationTemplate[],
): RelationTemplate[] {
  const seen = new Set<string>()
  const acc: RelationTemplate[] = []
  const visit = (node: BlockNode | undefined): void => {
    if (!node) return
    for (const id of relationIdsVon(node)) {
      const rel = relations.find((r) => r.id === id)
      if (!rel || seen.has(rel.id)) continue
      seen.add(rel.id)
      acc.push(rel)
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
    .map((n) => nodeToHtml(tree, n, 'column', 2, popupName, sources, undefined, true))
    .join('\n')

  const used = collectDataSources(tree, sources)
  const usedRelations = collectRelations(tree, relations)

  // Die Schriften stehen VOR den Tokens: @font-face zuerst deklarieren,
  // dann darauf zeigen. stripCssComments ist auf dem Base64 gefahrlos —
  // das Base64-Alphabet kennt kein '*', eine Kommentar-Folge kann darin
  // nicht entstehen.
  const schriftenCss = stripCssComments(schriftenCssRaw)
  const tokensCss = stripCssComments(tokensCssRaw)
  const runtimeJs = guardScriptContent(escapeNonAsciiJs(runtimeJsRaw.trim()))
  // Die benutzten Quellen-Definitionen reisen als DATEN mit der Maske
  // die Vorlagen liegen im Editor-localStorage, den die
  // exportierte Maske nie sieht — seRuntime löst source-ids über dieses
  // Global auf. DIESELBE collectDataSources-Quelle wie die SEFILELOOP
  // (Export-Grundsatz a); nur was die Runtime braucht (kein Feld-Wörterbuch:
  // Bindungen reisen längst als Feldcode-Attribute).
  // Auch die Feld-KLARNAMEN bleiben draußen (bestätigt 2026-08-06, Begründung
  // in bindungsVorschau): Sichtbares löst der Export auf und schreibt es ins
  // Markup.
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
    schriftenCss,
    tokensCss,
    '',
    '/* Grundgeruest + Wurzel-Raster (identisch zum Editor-Canvas, rasterFlaecheStyle) */',
    'html, body { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; }',
    'body { background: var(--se-bg); font-family: var(--se-font); font-size: var(--se-fs); line-height: var(--se-lh); color: var(--se-ink); }',
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
  //
  // KOPFSATZ_INDEX steht nur, wo die Quelle einen hat (kopfsatzFor): er sagt
  // SoftEngine, an welchem Satz die Zeilen hängen (Belegpositionen am offenen
  // Beleg, 'BEL_0_11').
  const sefileloop = used.map((s) => {
    const kopfsatz = kopfsatzFor(s)
    return {
      INDEX_NR: 0,
      ALIAS: s.name,
      ID: tableIdFor(s),
      ...(kopfsatz !== '' ? { KOPFSATZ_INDEX: kopfsatz } : {}),
      FELDER: felderFor(s),
    }
  })
  // VAR steht VOR der SEFILELOOP — wie in den ausgelieferten Rahmen; die
  // Kopfsätze der SEFILELOOP zeigen dorthin. Ohne Kopfsätze fehlt der
  // Schlüssel ganz (Masken ohne Belegpositionen bleiben Byte für Byte, wie
  // sie waren).
  const varAbschnitt = varAusKopfsaetzen(used)
  const sevariablen = escapeNonAsciiJs(
    JSON.stringify({
      ...(varAbschnitt.length > 0 ? { VAR: varAbschnitt } : {}),
      SEFILELOOP: sefileloop,
      ERPAPICALL: [],
    }, null, 2),
  ) + '\n'

  return { html, sevariablen }
}
