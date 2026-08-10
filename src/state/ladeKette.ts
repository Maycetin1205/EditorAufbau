// ladeKette — DIE eine Kette, durch die ein gespeicherter Stand hereinkommt.
//
// Zwei Leser teilen sie: der Browser-Speicher (persistence.ts) und die
// Maskendatei (maskenDatei.ts). Haette jeder eine eigene Kette, wuerde die
// eine von der anderen abdriften — genau diese Doppelung hat den
// Tabellen-Bug 2026-07-24 erzeugt.
//
// Hier wohnen drei Dinge:
//   1. `sanitizeTree`      — Rohdaten -> brauchbarer Baum (verteidigen)
//   2. `baumAusRohdaten`   — Migrationen + Bereinigen, das Ergebnis benannt
//   3. die VERLUST-Pruefungen — ist beim Bereinigen etwas verlorengegangen?
//
// Die Kette MELDET nichts und RETTET nichts: sie sagt nur, was war. Was
// daraus folgt, entscheidet der jeweilige Aufrufer — der Browser-Speicher
// legt eine Notfallkopie an und sperrt notfalls das Schreiben, die
// Maskendatei lehnt einen Kandidaten ab, ohne die offene Sitzung anzufassen.
//
// Herausgeloest am 2026-08-10 aus persistence.ts (Kette) und maskenDatei.ts
// (Verlust-Pruefungen), damit beide Leser dieselben Pruefungen benutzen
// koennen. Reine Verschiebung: dieselben Funktionen, dieselben Texte,
// dieselbe Reihenfolge am Aufrufer.

import { ROOT_ID, type BlockTree } from '../core/blocks/BlockData'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import { sanitizeBlockEvents } from '../core/data/aktionen'
import {
  CURRENT_SCHEMA_VERSION,
  DEMO_CLEANUP_BEFORE_SCHEMA,
  migrateFlatBlocks,
  migrateFlowToRaster,
  migrateKanbanVorlage,
  migrateKnopfAusTabelle,
  migrateRasterBreitenReparatur,
  migrateRasterHoehenReset,
  migrateRootKanbanToViewportFill,
  putzeAlteKartenDemos,
} from './migrations'
import { createEmptyTree, normalizeProps } from './treeOps'

// Baut aus rohen (evtl. kaputten) Daten einen sauberen Baum: läuft von der
// Wurzel über childIds, übernimmt nur Knoten mit bekanntem Typ, normalisiert
// Props, repariert parentId und verwirft Waisen/Zyklen.
// Davor laufen die zwei Reparaturen, die auf den ROHDATEN arbeiten müssen,
// weil sie die Eltern-Kind-Kette selbst umhängen (migrations.ts):
// migrateKanbanVorlage (Vorlagen-Kasten) und migrateKnopfAusTabelle (der
// zurückgenommene Knöpfe-Platz in der Tabelle).
// onDropType: meldet jeden verworfenen UNBEKANNTEN Typ (z. B. die 2026-07-14
// abgeschafften Bausteine Text/Bereich/Infobox/Chip/Eingabefeld in alten
// Speicherständen) — Nutzer-Regel: Verluste beim Laden passieren NIE still.
// Der Altbestands-Putzer fuer die frueheren Karten-Demotexte lief bis A2.1
// hier drin. Er sitzt jetzt in `baumAusRohdaten` — dort, wo auch die uebrigen
// Migrationen laufen und wo sein Ergebnis (die geleerten Stellen) an den
// Aufrufer weitergereicht werden kann. Verhaltensgleich: derselbe Zeitpunkt,
// dieselbe Bedingung, nur eine Ebene hoeher.
export function sanitizeTree(
  raw: Record<string, unknown>,
  onDropType?: (type: string) => void,
): BlockTree {
  const tree = createEmptyTree()
  const src = raw as Record<string, { type?: unknown; props?: unknown; childIds?: unknown; events?: unknown }>
  migrateKanbanVorlage(src)
  migrateKnopfAusTabelle(src)

  const addChild = (parentId: string, childId: unknown): void => {
    if (typeof childId !== 'string' || tree[childId]) return
    const node = src[childId]
    if (!node || typeof node !== 'object') return
    if (typeof node.type !== 'string') return
    const def = getBlockDefinition(node.type)
    if (!def) {
      onDropType?.(node.type)
      // Kinder eines unbekannten Typs werden zum Eltern-Knoten HOCHGEZOGEN
      // statt still mitzuverschwinden (z. B. der Inhalt eines abgeschafften
      // "Bereich"): der unbekannte Rahmen fällt, der Inhalt bleibt an
      // seiner Position im Fluss.
      const kids = Array.isArray(node.childIds) ? node.childIds : []
      for (const k of kids) addChild(parentId, k)
      return
    }
    // Aktionsketten laufen durch den eigenen strengen Lader — nur
    // Ereignis-Keys, die der Typ in der Registry deklariert.
    const events = sanitizeBlockEvents(node.events, (def.blockEvents ?? []).map((e) => e.key))
    tree[childId] = {
      id: childId,
      type: node.type,
      props: normalizeProps(node.type, node.props && typeof node.props === 'object' ? node.props as Record<string, unknown> : {}),
      ...(events ? { events } : {}),
      parentId,
      childIds: [],
    }
    tree[parentId].childIds.push(childId)
    const grand = Array.isArray(node.childIds) ? node.childIds : []
    for (const g of grand) addChild(childId, g)
  }

  const rootSrc = src[ROOT_ID]
  const rootChildren = rootSrc && Array.isArray(rootSrc.childIds) ? rootSrc.childIds : []
  for (const cid of rootChildren) addChild(ROOT_ID, cid)
  return tree
}

// Das Ergebnis der Kette: der Baum plus die Antwort auf „was ist dabei
// passiert". Meldet NICHTS und rettet NICHTS.
export interface BaumErgebnis {
  tree: BlockTree
  selectedId: string | null
  // Eine Schemastufe wurde durchlaufen — heisst zugleich: der Stand muss unter
  // der neuen Version neu gespeichert werden. Hiess bis A2.1 `migrated`; der
  // alte Name klang nach „irgendetwas hat sich geaendert" und wurde vom
  // Datei-Weg auch so gelesen (s. `absichtlichGeleert`).
  schemaAdvanced: boolean
  // Stellen, die eine Migration ABSICHTLICH geleert hat, als
  // `bausteinId.prop`. Nur so kann der Datei-Weg gewollte Aenderung von
  // Beschaedigung unterscheiden, statt beides gleich zu behandeln.
  absichtlichGeleert: ReadonlySet<string>
  // Verworfene unbekannte Bausteintypen: Typname -> Anzahl.
  verworfen: Map<string, number>
}

export function baumAusRohdaten(parsed: {
  schemaVersion?: unknown
  tree?: unknown
  blocks?: unknown
  selectedId?: unknown
}, putzeDemos = true): BaumErgebnis | null {
  let tree: BlockTree | null = null
  // Verworfene unbekannte Typen sammeln (nie still): trifft v. a. die
  // 2026-07-14 abgeschafften Bausteine in alten Staenden.
  const verworfen = new Map<string, number>()
  const absichtlichGeleert = new Set<string>()
  if (parsed.tree && typeof parsed.tree === 'object') {
    tree = sanitizeTree(parsed.tree as Record<string, unknown>, (type) => {
      verworfen.set(type, (verworfen.get(type) ?? 0) + 1)
    })
    // Nur am Baum-Weg, genau wie vorher: der alte `blocks`-Weg unten hat den
    // Putzer nie gesehen, und das bleibt so.
    if (putzeDemos) for (const p of putzeAlteKartenDemos(tree)) absichtlichGeleert.add(p)
  } else if (Array.isArray(parsed.blocks)) {
    tree = migrateFlatBlocks(parsed.blocks)
  }
  // Gueltiges JSON, aber KEINE verwertbare Baum-/Block-Struktur.
  if (!tree) return null

  // Gestufte Migrationen: jede laeuft nur beim Aufstieg ueber IHRE
  // Schwellenversion, damit ein schon migrierter Stand nicht erneut
  // umgeschrieben wird (z. B. bewusst gesetzte Kanban-Pixelhoehen aus Schema 2
  // ruehrt die 1→2-Migration nicht mehr an).
  const schemaVersion = typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : 1
  let schemaAdvanced = false
  if (schemaVersion < 2) schemaAdvanced = migrateRootKanbanToViewportFill(tree) || schemaAdvanced
  if (schemaVersion < 3) schemaAdvanced = migrateFlowToRaster(tree) || schemaAdvanced
  // Schema 4: heilt die Riesen-Rahmen aus der ersten (kaputten) Raster-
  // Migration bei Nutzern, deren Speicher schon auf Schema 3 stand.
  if (schemaVersion < 4) schemaAdvanced = migrateRasterBreitenReparatur(tree) || schemaAdvanced
  // Schema 5: setzt zu grosse Alt-Starthoehen (aus der ersten Raster-
  // Migration) auf die neuen, engen Registry-Starthoehen zurueck — jetzt, wo
  // der Baustein seine Zelle fuellt, liegt der Rahmen damit eng am Inhalt.
  if (schemaVersion < 5) schemaAdvanced = migrateRasterHoehenReset(tree) || schemaAdvanced

  const selectedId =
    typeof parsed.selectedId === 'string' && tree[parsed.selectedId] && parsed.selectedId !== ROOT_ID
      ? parsed.selectedId
      : null
  return { tree, selectedId, schemaAdvanced, absichtlichGeleert, verworfen }
}

// ---------- Verlust-Pruefungen ----------
//
// Ist beim Bereinigen NICHTS verlorengegangen?
//
// Geprueft wird nur EINE Richtung: jede Angabe, die im Stand stand, muss
// unveraendert im Ergebnis wiederauftauchen. Was der Sanitizer ZUSAETZLICH
// einsetzt, ist erlaubt — das ist Normalisierung, kein Verlust.
// (Konkret: `sanitizeRelationTemplates` ergaenzt ein fehlendes
// `allowExtraParams` mit `false`. Ein strikter Gleichheitsvergleich haette
// deshalb voellig heile Dateien abgelehnt.)
//
// Umgekehrt schlaegt jede Veraenderung an: ein Wert, der verschwindet
// (`idbId: 42` -> weg), ein Typ, der kippt (`fields: "kaputt"` -> `[]`), ein
// Eintrag, der wegfaellt (Laenge stimmt nicht mehr).
export function keinVerlust(roh: unknown, rein: unknown): boolean {
  if (roh === rein) return true
  if (Array.isArray(roh) || Array.isArray(rein)) {
    if (!Array.isArray(roh) || !Array.isArray(rein) || roh.length !== rein.length) return false
    return roh.every((x, i) => keinVerlust(x, rein[i]))
  }
  if (typeof roh !== 'object' || typeof rein !== 'object' || roh === null || rein === null) return false
  const a = roh as Record<string, unknown>
  const b = rein as Record<string, unknown>
  return Object.keys(a)
    .filter((k) => a[k] !== undefined)
    .every((k) => Object.prototype.hasOwnProperty.call(b, k) && keinVerlust(a[k], b[k]))
}

// Die Props eines Bausteins OHNE die Stellen, die eine Migration absichtlich
// geleert hat (A2.1). Sie aus dem SOLL zu nehmen ist die engste moegliche
// Ausnahme: geprueft wird weiterhin jede andere Eigenschaft desselben
// Bausteins, und eine Stelle wird nur dann uebersprungen, wenn der Putzer sie
// namentlich gemeldet hat. Nichts wird pauschal durchgewunken.
function ohneGeleerte(
  props: unknown,
  bausteinId: string,
  geleert: ReadonlySet<string>,
): unknown {
  if (geleert.size === 0 || !props || typeof props !== 'object' || Array.isArray(props)) {
    return props
  }
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(props as Record<string, unknown>)) {
    if (!geleert.has(`${bausteinId}.${k}`)) out[k] = v
  }
  return out
}

// Ein Fund beim Laden: WO (Bereich + Eintrag/Pfad) und WARUM.
//
// Der Grund ist bewusst ein Satz-BRUCHSTUECK ohne „Die Datei ist
// beschädigt:" davor (A3): denselben Fund muss sowohl der Datei-Weg melden
// („Die Datei ist beschädigt: …") als auch die Sperransicht des
// Browser-Wegs, wo von einer Datei gar keine Rede ist. Den Satz baut der
// Aufrufer, die Wahrheit steht hier.
export interface LadeProblem {
  bereich: string
  // Baustein-id, Eintrags-id oder Pfad; leer, wenn der ganze Bereich gemeint ist.
  stelle: string
  grund: string
}

export const BEREICH_AUFBAU = 'Masken-Aufbau'

// Erst die VERWEISE: zeigt ein childIds-Eintrag auf einen Knoten, den der
// Stand gar nicht enthaelt, faellt er beim Bereinigen lautlos weg — und eine
// reine Knoten-ZAEHLUNG merkt davon nichts, weil der fehlende Knoten ja auch
// vorher nicht da war. Also ausdruecklich pruefen.
export function strukturProbleme(rohBaum: Record<string, unknown>): LadeProblem[] {
  const raus: LadeProblem[] = []
  for (const [id, knoten] of Object.entries(rohBaum)) {
    const kinder = knoten && typeof knoten === 'object'
      ? (knoten as Record<string, unknown>).childIds
      : undefined
    if (!knoten || typeof knoten !== 'object' || (kinder !== undefined && !Array.isArray(kinder))) {
      raus.push({ bereich: BEREICH_AUFBAU, stelle: id, grund: `der Baustein „${id}" ist unlesbar` })
      continue
    }
    for (const kind of Array.isArray(kinder) ? kinder : []) {
      if (typeof kind !== 'string' || !(kind in rohBaum)) {
        raus.push({
          bereich: BEREICH_AUFBAU,
          stelle: id,
          grund: 'ein Baustein verweist auf einen anderen, den der Stand nicht enthält',
        })
      }
    }
  }
  return raus
}

// Und auch der BAUM darf nichts still verlieren — dieselbe Regel wie bei
// den Bibliotheken. `sanitizeTree` wirft Waisen, Zyklen und kaputte Knoten
// ohne ein Wort weg; in einem gewachsenen Browser-Speicher war das bis A4
// richtig, in einer Datei ist es Datenverlust.
//
// Erlaubt bleibt GENAU eine Art von Verlust: Bausteine, deren TYP es nicht
// mehr gibt. Die zaehlt `baum.verworfen`, und der Bediener bekommt sie
// hinterher als Klartext-Meldung zu sehen — das ist der bestehende,
// gewollte Weg fuer abgeschaffte Bausteintypen.
export function verlustProbleme(
  rohBaum: Record<string, unknown>,
  baum: BaumErgebnis,
): LadeProblem[] {
  const raus: LadeProblem[] = []
  const rohKnoten = Object.keys(rohBaum).filter((id) => id !== ROOT_ID).length
  const reinKnoten = Object.keys(baum.tree).filter((id) => id !== ROOT_ID).length
  const bekanntVerworfen = [...baum.verworfen.values()].reduce((a, b) => a + b, 0)
  if (rohKnoten > reinKnoten + bekanntVerworfen) {
    raus.push({
      bereich: BEREICH_AUFBAU,
      stelle: '',
      grund: 'im Masken-Aufbau fehlen Bausteine '
        + `(${rohKnoten - reinKnoten - bekanntVerworfen} von ${rohKnoten})`,
    })
  }

  // Und zuletzt INNERHALB der Bausteine: ein Baum kann gleich viele Knoten
  // haben und trotzdem ausgeduennt sein. `normalizeProps` wirft Eigenschaften
  // weg, die der Typ nicht kennt; `sanitizeBlockEvents` verwirft eine GANZE
  // Aktionskette, wenn ein einziger Schritt kaputt ist. Beides lautlos — und
  // beides waere echter Arbeitsverlust.
  //
  // Diese Pruefung gilt nur, wenn der Baum unveraendert durchlaufen SOLLTE:
  // lief eine Schemastufe oder fielen abgeschaffte Bausteintypen weg, dann
  // AENDERT sich der Baum von Berufs wegen, und ein Vergleich waere Unsinn.
  //
  // Der Demotext-Putzer zaehlt AUSDRUECKLICH NICHT dazu (A2.1, 2026-08-10).
  // Er hat nie eine Schemastufe gesetzt, also lief diese Pruefung auch dann,
  // wenn nur er zugeschlagen hatte — und sah seine absichtlich geleerten
  // Props als Verlust: eine Datei aus Schema <= 4 mit einem der fuenf
  // Werkstexte liess sich GAR NICHT laden. Ihn pauschal wie eine Migration zu
  // behandeln waere die falsche Abhilfe: dann bliebe die ganze Datei
  // ungeprueft, nur weil irgendwo „Heute" stand. Stattdessen nennt er die
  // Stellen beim Namen, und genau die werden hier geduldet — alles andere
  // wird weiter vollstaendig verglichen.
  if (baum.schemaAdvanced || bekanntVerworfen > 0) return raus
  for (const [id, rohKnoten] of Object.entries(rohBaum)) {
    const rein = baum.tree[id]
    const roh = rohKnoten as Record<string, unknown>
    // Die WURZEL wird mitgeprueft, aber nur ihre Kinderliste: Typ und
    // Eigenschaften baut der Editor selbst, sie stehen nie zur Debatte.
    // Ohne diese Pruefung liesse sich ihre Kinderliste still ausduennen.
    if (id === ROOT_ID) {
      if (keinVerlust(roh.childIds, rein?.childIds)) continue
      raus.push({
        bereich: BEREICH_AUFBAU,
        stelle: ROOT_ID,
        grund: 'im Masken-Aufbau fehlen Beziehungen zwischen Bausteinen',
      })
      continue
    }
    // childIds mitpruefen: ein Baustein, der (durch Beschaedigung) unter
    // ZWEI Eltern haengt, wird beim Bereinigen nur einmal eingehaengt —
    // die zweite Beziehung faellt lautlos weg, ohne dass sich eine
    // Knotenzahl aendert.
    if (!rein || rein.type !== roh.type
      || !keinVerlust(ohneGeleerte(roh.props, id, baum.absichtlichGeleert), rein.props)
      || !keinVerlust(roh.events, rein.events)
      || !keinVerlust(roh.childIds, rein.childIds)) {
      raus.push({
        bereich: BEREICH_AUFBAU,
        stelle: id,
        grund: `am Baustein „${id}" stimmen Angaben nicht`,
      })
    }
  }
  return raus
}

// ---------- Der eine geprüfte Lade-Ausgang (A3) ----------
//
// Die FESTE Reihenfolge, in der ein Stand hereinkommt — dieselbe fuer den
// Browser-Speicher und die Maskendatei:
//
//   1. Zukunftsversion abweisen, VOR jeder Aenderung.
//   2. Rohform strukturell verwertbar machen: versionsgebundene Migrationen
//      + Bereinigen (`baumAusRohdaten`).
//   3. gegen den heutigen Vertrag pruefen (Struktur der Rohform, Verlust).
//   4. Ausgang: ok | migriert | quarantaene.
//
// EHRLICH zu Schritt 2: Migrieren und Bereinigen laufen dort ZUSAMMEN und in
// dieser Verschraenkung — `sanitizeTree` haengt zuerst die zwei
// Rohdaten-Migrationen ein (Vorlagen-Kasten, Knopf aus Tabelle), danach
// laufen die Schemastufen auf dem bereinigten Baum. Sie auseinanderzuziehen
// wuerde die Migrationsergebnisse veraendern (die Schemastufen liefen dann
// ueber Knoten unbekannten Typs mit, und die Stapel-Positionen kaemen anders
// heraus). Das ist ein Stoppgrund nach Plan 3.5, kein Nebenbei-Umbau — die
// Reihenfolge „erst migrieren, DANN gegen heutige Regeln bewerten" (A4) ist
// dadurch trotzdem eingehalten: Schritt 3 laeuft komplett nach Schritt 2.
//
// Und ehrlich zur Struktur-Pruefung: sie sieht die Rohform NACH den zwei
// Rohdaten-Migrationen — die haengen childIds selbst um. Vor ihnen gepruefte
// Altbestaende (Vorlagen-Kasten) waeren als „verweist ins Leere" gemeldet
// worden, obwohl genau das die Migration geradezieht.

export type QuarantaeneUrsache =
  // Der Stand ist neuer als diese App. Nichts anfassen.
  | 'zukunft'
  // Gueltiges JSON, aber kein verwertbarer Masken-Aufbau.
  | 'unlesbar'
  // Beim Laden waere etwas verlorengegangen (A4).
  | 'verlust'

export type LadeAusgang =
  | { art: 'ok'; baum: BaumErgebnis }
  // Heil, aber eine Schemastufe lief: der Stand muss unter der neuen Version
  // neu gespeichert werden.
  | { art: 'migriert'; baum: BaumErgebnis }
  | { art: 'quarantaene'; ursache: QuarantaeneUrsache; probleme: LadeProblem[] }

// Was der Aufrufer wissen muss, wenn er den Grund in einen Satz gießt.
export const ZUKUNFT_GRUND =
  'Dieser Stand stammt aus einer neueren Version des Editors und kann hier '
  + 'nicht geladen werden.'

export function pruefeBaumStand(
  roh: { schemaVersion: number; tree?: unknown; blocks?: unknown; selectedId?: unknown },
  // Schlaegt ein Teilverlust auf Quarantaene an? Der Datei-Weg sagt seit
  // 2026-07-28 ja. Der Browser-Weg sagt ab A4 ebenfalls ja — bis dahin
  // duennt er aus wie immer, und diese eine Zeile ist die ganze Differenz.
  optionen: { verlustPruefen: boolean },
): LadeAusgang {
  // 1. Zukunft — VOR jeder Aenderung, denn ab hier wird migriert.
  if (roh.schemaVersion > CURRENT_SCHEMA_VERSION) {
    return {
      art: 'quarantaene',
      ursache: 'zukunft',
      probleme: [{
        bereich: BEREICH_AUFBAU,
        stelle: '',
        grund: `gespeichert unter Aufbau-Version ${roh.schemaVersion}, `
          + `dieser Editor kennt ${CURRENT_SCHEMA_VERSION}`,
      }],
    }
  }

  // 2. Migrationen + Bereinigen. Der Demotext-Putzer laeuft nur fuer ALTE
  // Staende — die feste historische Grenze aus A2, hier fuer BEIDE Wege an
  // EINER Stelle. Vorher stand dieselbe Ableitung zweimal im Code, und der
  // Browser-Weg hatte sie bis 2026-08-06 falsch.
  const baum = baumAusRohdaten(roh, roh.schemaVersion < DEMO_CLEANUP_BEFORE_SCHEMA)
  if (!baum) return { art: 'quarantaene', ursache: 'unlesbar', probleme: [] }

  // 3. Vertragspruefung.
  if (optionen.verlustPruefen && roh.tree && typeof roh.tree === 'object') {
    const rohBaum = roh.tree as Record<string, unknown>
    const probleme = [...strukturProbleme(rohBaum), ...verlustProbleme(rohBaum, baum)]
    if (probleme.length > 0) return { art: 'quarantaene', ursache: 'verlust', probleme }
  }

  // 4. Ausgang.
  return { art: baum.schemaAdvanced ? 'migriert' : 'ok', baum }
}
