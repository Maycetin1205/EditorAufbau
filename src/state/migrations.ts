// migrations — Übernahme alter Speicherstände in die aktuelle Form.
// Verhaltensgleich herausgezogen aus Editor.ts.
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

// Migration alter Stände: der Vorlagen-Kasten (kanban-vorlage) ist
// abgeschafft — seine Karten wandern an den ANFANG der ersten Spalte des
// Boards (die erste Karte des Boards ist jetzt die Musterkarte), der Kasten
// selbst verschwindet. Ohne den Umzug würde sanitizeTree den unbekannten
// Typ SAMT der gestalteten Musterkarte verwerfen. Board ohne Spalte
// (degeneriert): die Karten entfallen mit dem Kasten.
// Liefert die ids, die diese Migration ABSICHTLICH aus dem Baum genommen hat
// (A4, 2026-08-10). Vorher gab sie nichts zurueck — und die Verlust-Kontrolle
// konnte gewollte Aenderung nicht von Beschaedigung unterscheiden: sie sah
// einen Knoten weniger als in den Rohdaten und stellte den ganzen Stand unter
// Quarantaene. Ein Bediener mit einem alten Vorlagen-Kasten im Speicher waere
// aus seinem eigenen Editor ausgesperrt worden. Absicht muss benannt sein,
// sonst ist sie von Schaden nicht zu trennen (dieselbe Lehre wie bei
// `putzeAlteKartenDemos`).
export function migrateKanbanVorlage(
  src: Record<string, { type?: unknown; childIds?: unknown }>,
): string[] {
  const entfernt: string[] = []
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
    } else {
      // Board ohne Spalte (degeneriert): die Karten entfallen MIT dem Kasten —
      // es gibt keinen Ort, an den sie koennten. Auch das ist Absicht und wird
      // darum genannt.
      for (const cid of cards) if (typeof cid === 'string') entfernt.push(cid)
    }
    parent.childIds = parent.childIds.filter((cid) => cid !== id)
    entfernt.push(id)
  }
  return entfernt
}

// Aufraeum-Migration 2026-08-06: KNOEPFE IN TABELLEN wieder heraus.
//
// Der Tabellen-Baustein nahm rund 40 Minuten lang Schaltflaechen als Kinder
// auf (Knoepfe-Platz in einer Tafel-Kopfzeile, Commits 99b30ce + 9a5f954).
// Die Faehigkeit ist zurueckgenommen, weil sie WYSIWYG brach — die
// Begruendung steht im Kopf von TabelleBlock. Ohne diesen Griff bliebe ein in
// dieser Zeit gesetzter Knopf als UNSICHTBARER Waise im Speicher liegen: der
// Editor zeichnet ihn nicht mehr (die Tabelle ist kein Container), der Export
// laesst ihn weg, und niemand kaeme mehr an ihn heran, um ihn zu loeschen.
// Nutzer-Ansage 2026-08-06: „restlos aus dem code raus, also kein Rest von
// ,button in tabelle' umbau."
//
// Bewusst OHNE Schema-Stufe, anders als die nummerierten Migrationen weiter
// unten: die betroffenen Staende tragen bereits die aktuelle Schemaversion
// (die Faehigkeit kam NACH Schema 5), eine Stufe wuerde sie also gar nicht
// erwischen. Und CURRENT_SCHEMA_VERSION hochzusetzen haette eine boese
// Nebenwirkung — loadFromStorage leitet daraus `putzeDemos` ab und wuerde den
// Karten-Demotext-Putzer ueber jeden Stand laufen lassen, der heute auf 5
// steht (genau der Datenverlust, der am 2026-08-06 abgestellt wurde).
//
// ACHTUNG beim Zurueckholen des Knoepfe-Platzes: diese Migration muss dann
// MIT WEG, sonst frisst sie die neuen Knoepfe bei jedem Laden. Sie greift
// eng — nur Kinder vom Typ 'button' unter einem Knoten vom Typ 'tabelle'.
// Laeuft auf den ROHDATEN vor sanitizeTree (wie migrateKanbanVorlage): die
// gestrichenen ids sind danach von der Wurzel aus unerreichbar und kommen
// gar nicht erst in den Baum.
// Liefert die entfernten Knopf-ids — Begruendung wie bei
// `migrateKanbanVorlage` (A4).
export function migrateKnopfAusTabelle(
  src: Record<string, { type?: unknown; childIds?: unknown }>,
): string[] {
  const entfernt: string[] = []
  for (const node of Object.values(src)) {
    if (!node || typeof node !== 'object' || node.type !== 'tabelle') continue
    if (!Array.isArray(node.childIds)) continue
    node.childIds = node.childIds.filter((cid) => {
      const kind = typeof cid === 'string' ? src[cid] : undefined
      const istKnopf = Boolean(kind) && typeof kind === 'object' && kind.type === 'button'
      if (istKnopf && typeof cid === 'string') entfernt.push(cid)
      return !istKnopf
    })
  }
  return entfernt
}

// Migration 2026-07-16 (Nutzer-Beschwerde): Karten trugen bis zum Paket
// „Stellen starten leer" erfundene Demo-Werte ab Werk — in alten
// Speicherständen stehen sie noch und sehen aus wie Eingaben („Befund
// Minka besprechen", „Heute", …). Sie werden beim Laden geleert: EXAKTER
// Textvergleich gegen die fünf früheren Werkswerte, echte Eingaben
// bleiben unberührt.
// Die Grenze des Putzers ist eine feste HISTORISCHE Zahl, keine Ableitung aus
// CURRENT_SCHEMA_VERSION (A2, 2026-08-10). Die Werkswerte unten gab es bis
// Schema 4; ab Schema 5 hat sie kein Stand mehr ab Werk. Beide Lade-Wege
// haben die Grenze frueher als „aelter als aktuell" gefragt — das ist genau so
// lange richtig, wie aktuell 5 ist. Beim Sprung auf 6 (Popup-Raster) waere
// jeder heutige Stand ploetzlich „alt" gewesen und der Putzer erneut ueber
// echte Eingaben gelaufen: `Heute` und `09:15` tippt der Bediener selbst.
// Derselbe Fehler hat den Nutzer schon einmal getroffen (bis 2026-08-06 lief
// der Putzer im Browser sogar ueber JEDEN Stand, s. persistence.ts).
export const DEMO_CLEANUP_BEFORE_SCHEMA = 5

const ALTE_KARTEN_DEMOS: ReadonlyArray<readonly [string, string]> = [
  ['heading', 'Rückruf Fr. Wagner'],
  ['time', '09:15'],
  ['meta', 'Katze · EKH'],
  ['text', 'Befund Minka besprechen'],
  ['chipText', 'Heute'],
]
// Liefert die Stellen, die WIRKLICH geleert wurden, als `bausteinId.prop`
// (A2.1, 2026-08-10). Vorher gab die Funktion nichts zurueck — und der
// Datei-Weg konnte das Leeren daher nicht von Beschaedigung unterscheiden:
// seine Verlust-Kontrolle sah nur fehlende Werte und lehnte die GANZE Datei
// ab („am Baustein ... stimmen Angaben nicht"). Eine Maskendatei aus Schema
// <= 4 mit einem dieser fuenf Texte liess sich dadurch gar nicht mehr laden.
// Absicht muss also benannt sein, sonst ist sie von Schaden nicht zu trennen.
export function putzeAlteKartenDemos(tree: BlockTree): string[] {
  const geleert: string[] = []
  for (const node of Object.values(tree)) {
    if (node.type !== 'card') continue
    for (const [prop, demo] of ALTE_KARTEN_DEMOS) {
      if (node.props[prop] !== demo) continue
      node.props[prop] = ''
      geleert.push(`${node.id}.${prop}`)
    }
  }
  return geleert
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
  return rasterSpecOf(getBlockDefinition(node.type), node.props).startW
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
      const startW = rasterSpecOf(getBlockDefinition(node.type), node.props).startW
      return p.x === 0 && p.w === RASTER.spalten && startW < RASTER.spalten
    }
    if (!kinder.some(istKaputt)) continue
    // Betroffene bekommen die Registry-Startbreite, alle anderen behalten ihre
    // Breite; die Höhe bleibt in jedem Fall. Danach lückenlos neu stapeln.
    const groessen = kinder.map((node) => {
      const p = parseRasterPos(node.props)
      const w = istKaputt(node) ? rasterSpecOf(getBlockDefinition(node.type), node.props).startW : p.w
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
