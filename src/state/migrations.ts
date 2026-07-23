// migrations — Übernahme alter Speicherstände in die aktuelle Form.
// A1-Umzug 2026-07-16 (Aufräum.md), verhaltensgleich aus Editor.ts.
// Jede Migration ist eine dokumentierte Einbahnstraße: sie läuft beim Laden
// und macht aus Altbestand den heutigen Vertrag — Verluste passieren nie still.

import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import {
  RASTER,
  parseRasterPos,
  rasterSpecOf,
  stapeleUntereinander,
} from '../core/blocks/rasterLayout'
import { createEmptyTree, normalizeProps } from './treeOps'

export const CURRENT_SCHEMA_VERSION = 5

// Migration alter Stände (P1.1): der Vorlagen-Kasten (kanban-vorlage) ist
// abgeschafft — seine Karten wandern an den ANFANG der ersten Spalte des
// Boards (die erste Karte des Boards ist jetzt die Musterkarte), der Kasten
// selbst verschwindet. Ohne den Umzug würde sanitizeTree den unbekannten
// Typ SAMT der gestalteten Musterkarte verwerfen. Board ohne Spalte
// (degeneriert): die Karten entfallen mit dem Kasten.
export function migrateKanbanVorlage(
  src: Record<string, { type?: unknown; childIds?: unknown }>,
): void {
  for (const [id, node] of Object.entries(src)) {
    if (!node || typeof node !== 'object' || node.type !== 'kanban-vorlage') continue
    const parent = Object.values(src).find(
      (p) => p && typeof p === 'object' && Array.isArray(p.childIds) && p.childIds.includes(id),
    )
    if (!parent || !Array.isArray(parent.childIds)) continue
    const spalte = parent.childIds
      .map((cid) => (typeof cid === 'string' ? src[cid] : undefined))
      .find((n) => n && typeof n === 'object' && n.type === 'kanban-spalte')
    const cards = Array.isArray(node.childIds) ? node.childIds : []
    if (spalte) {
      spalte.childIds = [...cards, ...(Array.isArray(spalte.childIds) ? spalte.childIds : [])]
    }
    parent.childIds = parent.childIds.filter((cid) => cid !== id)
  }
}

// Migration 2026-07-16 (Nutzer-Beschwerde): Karten trugen bis zum Paket
// „Stellen starten leer" erfundene Demo-Werte ab Werk — in alten
// Speicherständen stehen sie noch und sehen aus wie Eingaben („Befund
// Minka besprechen", „Heute", …). Sie werden beim Laden geleert: EXAKTER
// Textvergleich gegen die fünf früheren Werkswerte, echte Eingaben
// bleiben unberührt.
const ALTE_KARTEN_DEMOS: ReadonlyArray<readonly [string, string]> = [
  ['heading', 'Rückruf Fr. Wagner'],
  ['time', '09:15'],
  ['meta', 'Katze · EKH'],
  ['text', 'Befund Minka besprechen'],
  ['chipText', 'Heute'],
]
export function putzeAlteKartenDemos(tree: BlockTree): void {
  for (const node of Object.values(tree)) {
    if (node.type !== 'card') continue
    for (const [prop, demo] of ALTE_KARTEN_DEMOS) {
      if (node.props[prop] === demo) node.props[prop] = ''
    }
  }
}

// Altes Format (Liste mit absolutem layout) -> Baum: alle Blöcke als Kinder der
// Wurzel, layout wird verworfen.
export function migrateFlatBlocks(blocks: unknown[]): BlockTree {
  const tree = createEmptyTree()
  for (const raw of blocks) {
    if (!raw || typeof raw !== 'object') continue
    const b = raw as { id?: unknown; type?: unknown; props?: unknown }
    if (typeof b.id !== 'string' || typeof b.type !== 'string') continue
    if (!getBlockDefinition(b.type)) continue
    tree[b.id] = {
      id: b.id,
      type: b.type,
      props: normalizeProps(b.type, b.props && typeof b.props === 'object' ? b.props as Record<string, unknown> : {}),
      parentId: ROOT_ID,
      childIds: [],
    }
    tree[ROOT_ID].childIds.push(b.id)
  }
  return tree
}

// Schema 2: Root-Kanbans sind Vollbild-Hauptflächen. Alte Pixelmaße kamen
// aus der früheren frei ziehbaren Canvas und ließen den SoftEngine-Bereich
// überragen. Nur beim EINMALIGEN Wechsel von Schema 1 werden Root-Boards auf
// volle Breite + verbleibende Höhe gesetzt. Danach bleiben bewusst gesetzte
// Pixelhöhen erhalten.
export function migrateRootKanbanToViewportFill(tree: BlockTree): boolean {
  let migrated = false
  for (const id of tree[ROOT_ID]?.childIds ?? []) {
    const node = tree[id]
    if (node?.type !== 'kanban') continue
    if (node.props.width === 'fill' && node.props.height === 'fill') continue
    tree[id] = { ...node, props: { ...node.props, width: 'fill', height: 'fill' } }
    migrated = true
  }
  return migrated
}

// Ziel-Zellhöhe eines Blocks bei der Fluss→Raster-Migration: eine feste
// Pixelhöhe wird in Zellen umgerechnet (aufgerundet), sonst gilt die
// Registry-Starthöhe des Bausteins. Die Zeilenspur gibt bei Überlauf ohnehin
// über minmax nach (rasterLayout) — hier geht es nur um eine griffige
// Ausgangshöhe, ab der der Nutzer ziehen kann.
function migrationsHoehe(node: BlockNode): number {
  const h = node.props.height
  if (typeof h === 'number' && Number.isFinite(h) && h > 0) {
    return Math.max(1, Math.ceil(h / RASTER.zeilePx))
  }
  return rasterSpecOf(getBlockDefinition(node.type)).startH
}

// Nominale Pixelbreite EINER Rasterspalte für die Fluss→Raster-Umrechnung: eine
// feste Alt-Pixelbreite / PX_PRO_ZELLE = griffige Zellenzahl. Die Live-Spalten
// wachsen mit dem Fenster (1fr, rasterFlaecheStyle); spaltePx ist hier nur das
// nominale Umrechnungsmaß für den einmaligen Alt-Import, keine Anzeige-Breite.
const PX_PRO_ZELLE = RASTER.spaltePx

// Ziel-Zellbreite eines Blocks bei der Fluss→Raster-Migration (analog
// migrationsHoehe): eine feste Pixelbreite wird in Zellen umgerechnet
// (aufgerundet, gedeckelt auf die volle Breite), 'fill' → volle Breite, sonst
// gilt die Registry-Startbreite des Bausteins. So werden schmale Bausteine
// (Schaltfläche/Formularfeld/Datum) NICHT zu Vollbreite-Kästchen — der
// Auswahlrahmen liegt eng am Inhalt (E1-Nachtrag, Ursache 1).
function migrationsBreite(node: BlockNode): number {
  const w = node.props.width
  if (typeof w === 'number' && Number.isFinite(w) && w > 0) {
    return Math.min(RASTER.spalten, Math.max(1, Math.ceil(w / PX_PRO_ZELLE)))
  }
  if (w === 'fill') return RASTER.spalten
  return rasterSpecOf(getBlockDefinition(node.type)).startW
}

// Die Rasterflächen einer Maske (V1): die oberste Ebene (Wurzel) und jeder
// Popup-Rumpf (pageBlock-Knoten). Deren KINDER liegen auf dem Raster; das
// pageBlock-Element selbst ist ein Overlay und bleibt im Fluss der Wurzel
// (unberührt vom Raster).
function rasterFlaechenIds(tree: BlockTree): string[] {
  const popups = Object.values(tree)
    .filter((n) => getBlockDefinition(n.type)?.pageBlock === true)
    .map((n) => n.id)
  return [ROOT_ID, ...popups]
}

// Schema 3 (Nutzer-Entscheidung 2026-07-23): die Maskenfläche wechselt vom
// Fluss (Stapel, Nachrücken) auf ein Raster mit Einrasten. Beim EINMALIGEN
// Wechsel bekommt jeder Block auf einer Rasterfläche (oberste Ebene +
// Popup-Rümpfe) eine Raster-Position: inhaltsnahe Breite (migrationsBreite),
// fortlaufend untereinander (stapeleUntereinander) — die Maske sieht danach aus
// wie vorher (alles untereinander), schmale Bausteine bleiben schmal, ist aber
// ab sofort frei verschiebbar. Verlustfrei: die
// width/height-Props bleiben stehen (Container-Innenleben nutzt sie weiter),
// pageBlock-Overlays selbst bleiben unberührt.
export function migrateFlowToRaster(tree: BlockTree): boolean {
  let migrated = false
  for (const flaecheId of rasterFlaechenIds(tree)) {
    const flaeche = tree[flaecheId]
    if (!flaeche) continue
    const kinder = flaeche.childIds
      .map((id) => tree[id])
      .filter((n): n is BlockNode => Boolean(n) && getBlockDefinition(n.type)?.pageBlock !== true)
    if (kinder.length === 0) continue
    const positionen = stapeleUntereinander(
      kinder.map((n) => ({ w: migrationsBreite(n), h: migrationsHoehe(n) })),
    )
    kinder.forEach((node, i) => {
      const p = positionen[i]
      node.props = { ...node.props, rasterX: p.x, rasterY: p.y, rasterW: p.w, rasterH: p.h }
    })
    migrated = true
  }
  return migrated
}

// Schema 4 (Reparatur, 2026-07-23): die ERSTE Fluss→Raster-Migration (Schema 3)
// hatte einen Planfehler und setzte JEDEN Block auf Vollbreite (rasterW = 24).
// Bei Nutzern, deren Browser-Speicher damit schon auf Schema 3 stand, greift die
// (inzwischen korrigierte) Schema-3-Migration nicht mehr — die Riesen-Rahmen
// blieben. Diese EINMALIGE Folge-Migration heilt genau diesen Altbestand:
// Jeder Block auf einer Rasterfläche mit dem Fehler-Muster (rasterX = 0 UND
// rasterW = 24), dessen Registry-Startbreite KLEINER als die volle Breite ist,
// bekommt seine inhaltsnahe Startbreite zurück; die Höhe (rasterH) bleibt.
// Danach werden die Blöcke der betroffenen Fläche überlappungsfrei neu
// gestapelt. Blöcke, die zu Recht volle Breite tragen (Kanban/Zeile/Trennlinie,
// Registry-Startbreite = 24), und bereits geheilte Stände bleiben unberührt —
// die Migration ist damit auch bei Mehrfachlauf gutartig (idempotent).
export function migrateRasterBreitenReparatur(tree: BlockTree): boolean {
  let migrated = false
  for (const flaecheId of rasterFlaechenIds(tree)) {
    const flaeche = tree[flaecheId]
    if (!flaeche) continue
    const kinder = flaeche.childIds
      .map((id) => tree[id])
      .filter((n): n is BlockNode => Boolean(n) && getBlockDefinition(n.type)?.pageBlock !== true)
    if (kinder.length === 0) continue
    // Trägt eine der Fläche das Fehler-Muster? Sonst nichts anfassen (auch die
    // Positionen bleiben, damit geheilte/frische Stände unberührt bleiben).
    const istKaputt = (node: BlockNode): boolean => {
      const p = parseRasterPos(node.props)
      const startW = rasterSpecOf(getBlockDefinition(node.type)).startW
      return p.x === 0 && p.w === RASTER.spalten && startW < RASTER.spalten
    }
    if (!kinder.some(istKaputt)) continue
    // Betroffene bekommen die Registry-Startbreite, alle anderen behalten ihre
    // Breite; die Höhe bleibt in jedem Fall. Danach lückenlos neu stapeln.
    const groessen = kinder.map((node) => {
      const p = parseRasterPos(node.props)
      const w = istKaputt(node) ? rasterSpecOf(getBlockDefinition(node.type)).startW : p.w
      return { w, h: p.h }
    })
    const positionen = stapeleUntereinander(groessen)
    kinder.forEach((node, i) => {
      const p = positionen[i]
      node.props = { ...node.props, rasterX: p.x, rasterY: p.y, rasterW: p.w, rasterH: p.h }
    })
    migrated = true
  }
  return migrated
}

// Schema 5 (Reparatur, 2026-07-23): die erste Fluss->Raster-Migration vergab zu
// GROSSE Starthoehen — solange der Baustein seine Zelle noch nicht fuellte, war
// der Auswahlrahmen riesig und der Inhalt winzig (Nutzer-Fund). Nachdem "der
// Baustein fuellt seine Zelle" gebaut UND die Registry-Starthoehen enger
// kalibriert sind, KAPPT diese EINMALIGE Migration jede zu grosse Alt-Hoehe auf
// die (neue) Registry-Starthoehe. Bewusst NUR schrumpfen (Math.min): Schrumpfen
// kann keine neue Ueberlappung erzeugen, darum ist KEIN Neu-Stapeln noetig und
// bewusst gesetzte Positionen/Breiten bleiben unberuehrt (idempotent, gutartig
// bei Mehrfachlauf). Breiten hat Schema 4 bereits geheilt.
export function migrateRasterHoehenReset(tree: BlockTree): boolean {
  let migrated = false
  for (const flaecheId of rasterFlaechenIds(tree)) {
    const flaeche = tree[flaecheId]
    if (!flaeche) continue
    for (const id of flaeche.childIds) {
      const node = tree[id]
      if (!node || getBlockDefinition(node.type)?.pageBlock === true) continue
      const p = parseRasterPos(node.props)
      const startH = rasterSpecOf(getBlockDefinition(node.type)).startH
      const neu = Math.min(p.h, startH)
      if (neu !== p.h) {
        node.props = { ...node.props, rasterH: neu }
        migrated = true
      }
    }
  }
  return migrated
}
