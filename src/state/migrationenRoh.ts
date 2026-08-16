// migrationenRoh — die Migrationen, die auf den ROHDATEN laufen muessen.
//
// Aus migrations.ts herausgeloest (C2, 2026-08-16, 500-Zeilen-Deckel). Der
// Schnitt ist keine Groessen-Notloesung, sondern die Trennlinie, die es
// ohnehin gab: DIESE drei haengen die Eltern-Kind-Kette selbst um und laufen
// darum VOR `sanitizeTree` — der Baum, den die anderen Migrationen umformen,
// existiert zu ihrem Zeitpunkt noch gar nicht. Alle drei loeschen einen
// Baustein, den es nicht mehr gibt, und alle drei melden die entfernten ids
// zurueck, damit die Verlust-Kontrolle des Datei-Wegs Absicht von Schaden
// unterscheiden kann.
//
// Verhaltensgleich verschoben; die gestuften Baum-Migrationen (Schema 1..6)
// bleiben in migrations.ts.

import { ROOT_ID } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { RASTER, parseRasterPos, rasterSpecOf } from '../core/blocks/rasterLayout'

// Migration alter Stände: der Vorlagen-Kasten (kanban-vorlage) ist
// abgeschafft — seine Karten wandern an den ANFANG der ersten Spalte des
// Boards (die erste Karte des Boards ist jetzt die Musterkarte), der Kasten
// selbst verschwindet. Ohne den Umzug würde sanitizeTree den unbekannten
// Typ SAMT der gestalteten Musterkarte verwerfen. Board ohne Spalte
// (degeneriert): die Karten entfallen mit dem Kasten.
// Liefert die ids, die diese Migration ABSICHTLICH aus dem Baum genommen hat
// (A4, 2026-08-10). Vorher gab sie nichts zurueck — und die Verlust-Kontrolle
// (heute nur noch am DATEI-Weg, maskenDatei) konnte gewollte Aenderung nicht
// von Beschaedigung unterscheiden: sie sah einen Knoten weniger als in den
// Rohdaten und lehnte eine voellig gesunde alte Maskendatei ab. Absicht muss
// benannt sein, sonst ist sie von Schaden nicht zu trennen (dieselbe Lehre
// wie bei `putzeAlteKartenDemos`).
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

// Aufloesungs-Migration 2026-08-16 (Nutzer-Entscheidung zu C2): der Baustein
// „ZEILE" entfaellt. Er konnte genau eines — Bausteine nebeneinander — und war
// dafuer noetig, solange der Popup-Rumpf ein Fluss war. Seit der Rumpf ein
// Raster ist, ist Nebeneinander ueberall die Zelle, und die Zeile waere nur
// noch eine zweite Art, dasselbe zu tun.
//
// Bestehende Zeilen werden AUFGELOEST: die Kinder ruecken an die Stelle der
// Zeile. Laeuft auf den ROHDATEN vor sanitizeTree (wie die zwei Migrationen
// darueber), weil sie die Eltern-Kind-Kette umhaengt — und weil 'zeile' danach
// ein UNBEKANNTER Typ ist: der Sanitizer wuerde ihn als verworfenen Typ melden
// und den Bediener mit einer Verlustmeldung erschrecken, die keinen Verlust
// beschreibt.
//
// Auf einer FLAECHE (Wurzel, Ansicht, Popup) brauchen die Kinder danach eigene
// Zellen — im Fluss hatten sie keine. Sie bekommen das ZELLBAND der Zeile:
// nebeneinander ab deren Spalte, jedes mit seiner Registry-Startbreite, in
// deren Hoehe. Solange die Kinder in 24 Spalten passen (der Normalfall), belegt
// das Ergebnis exakt dieselben Zeilen wie vorher die Zeile — nichts darunter
// verschiebt sich. Passen sie nicht, wird umgebrochen; dann kann das Band
// wachsen und den Nachbarn darunter ueberlappen. Das ist sichtbar und mit
// einem Zug zu beheben — anders als ein stilles Neu-Stapeln der ganzen
// Flaeche, das eine bewusst gebaute Maske zerlegen wuerde.
// Liefert die ids der aufgeloesten Zeilen (Begruendung wie bei
// `migrateKanbanVorlage`: Absicht muss benannt sein, sonst ist sie von Schaden
// nicht zu trennen).
interface RohKnoten {
  type?: unknown
  props?: unknown
  childIds?: unknown
}

function rohProps(node: RohKnoten): Record<string, unknown> {
  if (!node.props || typeof node.props !== 'object') node.props = {}
  return node.props as Record<string, unknown>
}

// Liegen die Kinder dieses Knotens in Zellen? Auf den Rohdaten beantwortet das
// dieselbe Regel wie `istRasterFlaeche` im Baum: die Wurzel oder ein
// Seiten-Baustein (Ansicht, Popup).
function istFlaecheRoh(id: string, node: RohKnoten): boolean {
  return id === ROOT_ID
    || (typeof node.type === 'string' && getBlockDefinition(node.type)?.pageBlock === true)
}

function verteileImBand(
  src: Record<string, RohKnoten>,
  band: { x: number; y: number; h: number },
  kinder: readonly string[],
): void {
  let x = band.x
  let y = band.y
  for (const cid of kinder) {
    const kind = src[cid]
    if (!kind || typeof kind.type !== 'string') continue
    const props = rohProps(kind)
    const w = Math.min(RASTER.spalten, rasterSpecOf(getBlockDefinition(kind.type), props).startW)
    if (x + w > RASTER.spalten) {
      x = 0
      y += band.h
    }
    props.rasterX = x
    props.rasterY = y
    props.rasterW = w
    props.rasterH = band.h
    x += w
  }
}

export function migrateZeileAufloesen(src: Record<string, RohKnoten>): string[] {
  const entfernt: string[] = []
  for (const [id, node] of Object.entries(src)) {
    if (!node || typeof node !== 'object' || node.type !== 'zeile') continue
    const eltern = Object.entries(src).find(
      ([, p]) => p && typeof p === 'object' && Array.isArray(p.childIds) && p.childIds.includes(id),
    )
    // Waise: sie haengt an keinem Elternteil und kommt gar nicht erst in den
    // Baum — es gibt nichts aufzuloesen und nichts zu melden.
    if (!eltern) continue
    const [elternId, elternKnoten] = eltern
    const elternKinder = elternKnoten.childIds as unknown[]
    const kinder = (Array.isArray(node.childIds) ? node.childIds : [])
      .filter((c): c is string => typeof c === 'string')
    const stelle = elternKinder.indexOf(id)
    elternKnoten.childIds = [
      ...elternKinder.slice(0, stelle),
      ...kinder,
      ...elternKinder.slice(stelle + 1),
    ]
    if (istFlaecheRoh(elternId, elternKnoten)) {
      verteileImBand(src, parseRasterPos(rohProps(node)), kinder)
    }
    entfernt.push(id)
  }
  return entfernt
}
