// migrations — Übernahme alter Speicherstände in die aktuelle Form.
// Verhaltensgleich herausgezogen aus Editor.ts.
// Jede Migration ist eine dokumentierte Einbahnstraße: sie läuft beim Laden
// und macht aus Altbestand den heutigen Vertrag — Verluste passieren nie still.
//
// Hier stehen die Migrationen, die den fertigen BAUM umformen — die
// gestuften (Schema 1..6) und die zwei ungestuften Putzer. Die drei, die auf
// den ROHDATEN laufen muessen, weil sie die Eltern-Kind-Kette umhaengen,
// wohnen nebenan in migrationenRoh.

import { ROOT_ID, type BlockNode, type BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import {
  RASTER,
  parseRasterPos,
  rasterSpecOf,
  stapeleUntereinander,
} from '../core/blocks/rasterLayout'
import { istSeitenBaustein, istFlaechenSeite } from './pageOps'
import { createEmptyTree, normalizeProps } from './treeOps'

export const CURRENT_SCHEMA_VERSION = 6

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

// Eigenschaften, die es an einem Baustein NICHT MEHR GIBT — je Eintrag der
// Bausteintyp und der Name der Eigenschaft.
//
// Warum diese Liste gebraucht wird (S2.1, 2026-08-11): `normalizeProps` uebernimmt
// nur, was der Baustein heute als Standardwert kennt. Streicht eine Etappe eine
// Eigenschaft, verschwindet ihr gespeicherter Wert damit lautlos — und die
// Verlust-Kontrolle (ladeKette.verlustProbleme, heute nur noch am DATEI-Weg)
// sieht genau das: eine Angabe, die in den Rohdaten stand und im Ergebnis
// fehlt. Sie lehnte dann eine voellig gesunde Maskendatei ab, deren einzige
// „Beschaedigung" darin besteht, dass der Bediener einmal „25 pro Seite"
// gewaehlt hat — genau der Fehler, den A4 fuer den Vorlagen-Kasten schon
// einmal beheben musste. Absicht muss benannt sein, sonst ist sie von Schaden
// nicht zu trennen (dieselbe Lehre wie bei `putzeAlteKartenDemos`).
//
// Bewusst NICHT an eine Schemastufe gebunden: eine Stufe hebt den Detail-Vergleich
// fuer den GANZEN Stand auf (ladeKette:326), und dafuer ist der Anlass zu klein.
// Diese Liste duldet genau zwei Namen an genau einem Bausteintyp; jede andere
// Angabe desselben Bausteins wird weiter vollstaendig verglichen.
//
// Eine Eigenschaft streichen heisst also: Zeile hier eintragen, und zwar in
// demselben Commit.
const WEGGEFALLENE_PROPS: ReadonlyArray<readonly [string, string]> = [
  // Der Zeilen-Waehler der Tabelle (S2.1): es gilt jetzt immer „so viele Zeilen,
  // wie hineinpassen". `proSeite` war der Bauplan (passend / 10 / 25 / 50),
  // `zeilenWaehler` die Erlaubnis, ihn in der Maske zu uebersteuern.
  ['tabelle', 'proSeite'],
  ['tabelle', 'zeilenWaehler'],
]

// Die Stellen, an denen dieser Stand eine weggefallene Eigenschaft traegt, als
// `bausteinId.prop`. Liest die ROHDATEN, nicht den fertigen Baum: im fertigen
// Baum sind die Werte schon weg — das ist ja der Punkt.
export function weggefalleneProps(rohBaum: Record<string, unknown>): string[] {
  const raus: string[] = []
  for (const [id, knoten] of Object.entries(rohBaum)) {
    if (!knoten || typeof knoten !== 'object') continue
    const k = knoten as { type?: unknown; props?: unknown }
    if (!k.props || typeof k.props !== 'object') continue
    const props = k.props as Record<string, unknown>
    for (const [typ, prop] of WEGGEFALLENE_PROPS) {
      if (k.type !== typ) continue
      if (Object.prototype.hasOwnProperty.call(props, prop)) raus.push(`${id}.${prop}`)
    }
  }
  return raus
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
// Schema 6 (C2, 2026-08-16): der Popup-Rumpf wird eine Rasterflaeche. Bis
// hierher lag sein Inhalt im Fluss — untereinander, Reihenfolge = `childIds`,
// die Rasterprops der Kinder waren fuer den Bediener UNSICHTBAR und daher
// beliebig (`Editor.addBlock` vergab sie laengst, gezeigt hat sie niemand).
// Genau deshalb werden sie hier NICHT erhalten, sondern neu vergeben: die
// Kinder werden in ihrer sichtbaren Reihenfolge untereinander gestapelt, jedes
// mit seiner Registry-Startgroesse. Der Bediener sieht sein Popup danach so
// wieder, wie er es verlassen hat, und kann ab sofort frei platzieren.
//
// NUR FENSTER-Seiten (Popup). Eine FLAECHEN-Seite (Ansicht) hat ihre Kinder
// seit N1 im Raster der Maskenwurzel — sie hier neu zu stapeln, wuerde eine
// bewusst gebaute Ansicht zerlegen.
export function migratePopupInhaltAufRaster(tree: BlockTree): boolean {
  let migriert = false
  for (const knoten of Object.values(tree)) {
    if (!istSeitenBaustein(knoten) || istFlaechenSeite(knoten)) continue
    const kinder = knoten.childIds
      .map((id) => tree[id])
      .filter((n): n is BlockNode => Boolean(n))
    if (kinder.length === 0) continue
    const positionen = stapeleUntereinander(kinder.map((n) => {
      const spec = rasterSpecOf(getBlockDefinition(n.type), n.props)
      return { w: spec.startW, h: spec.startH }
    }))
    kinder.forEach((n, i) => {
      const p = positionen[i]
      n.props = { ...n.props, rasterX: p.x, rasterY: p.y, rasterW: p.w, rasterH: p.h }
    })
    migriert = true
  }
  return migriert
}

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
