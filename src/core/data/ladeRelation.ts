// ladeRelation — „Zeilen per Relation holen" (Welle R, UMBAU-PLAN-V6.md).
//
// Eine Quelle dieser Lade-Art bestellt bei SoftEngine NICHTS (keine
// SEFILELOOP-Zeile, kein Kopfsatz, kein VAR): die laufende Maske holt ihre
// Zeilen selbst, sobald in der GEBER-Quelle ein Satz gewählt ist — je
// Position ein GET_RELATION mit den vier Schlüsseln aus der gewählten Zeile.
// Alles hier ist am 2026-08-10/11 in der SoftEngine des Nutzers LIVE belegt
// (Relation 69; Kontrakte: CLAUDE.md „Positionen zur Laufzeit lesen" und der
// Wellen-Kopf R im UMBAU-PLAN-V6.md).
//
// Eigene Datei statt dataSources: die stand mit 451 Zeilen kurz vor dem
// 500er-Deckel. dataSources reicht Typ + Helfer weiter (eine Anlaufstelle
// für die Quellen-Welt). Importiert wird hier NUR aus quellenArten —
// dataSources liest diese Datei, ein Import zurück wäre ein Kreis; darum
// nehmen die Helfer strukturell `{ kind, ladeRelation }` statt DataSource.

import { artFuer, type DataSourceKind } from './quellenArten'

// Die vier benannten Schlüssel-Parameter sind BEWUSST fest (Regel 10):
// belegt ist genau EIN Fall — Relation 69 mit PARAMS [BELART, POS, LEN,
// BELNR, JAHR, ARCHIV, '', POSNR, '', '', '', '']. Eine generische
// Parameter-Liste wäre ein Vorgriff auf einen zweiten Fall, den es nicht
// gibt; kommt er, wird HIER verallgemeinert.
export interface LadeRelation {
  // Relationsnummer — je Installation individuell, also Daten, nie Code
  // (Regel 5).
  nr: string
  // Quelle, deren GEWÄHLTE Zeile den Satz bestimmt (id aus der Bibliothek).
  geberQuelleId: string
  // Feldcodes der GEBER-Zeile für die vier Schlüssel-Parameter.
  belegartFeld: string
  belegnummerFeld: string
  // Jahr/Archiv dürfen leer sein — dann gehen die Parameter leer hinaus und
  // die Relation findet nur den aktuellen Nummernkreis (belegt 2026-08-11:
  // leer fand die 262er-Belege, erst mit Werten auch die 261er).
  jahrFeld: string
  archivFeld: string
  // Feldcodes der GEHOLTEN Zeile, die ZUSAMMEN leer „keine weitere Position"
  // bedeuten. Belegt: 11_6 + 18_25 — der Positionsident 645_10 ist in der
  // Nutzer-Installation leer und taugt NICHT als Ende-Marker.
  endeFelder: readonly string[]
}

// Vorbelegung = der belegte Fall (Echttests 2026-08-11). Die Geber-Quelle
// wählt der Bediener selbst — sie ist je Maske eine andere.
export const LADE_RELATION_STANDARD = {
  nr: '69',
  belegartFeld: '2_1',
  belegnummerFeld: '3_8',
  jahrFeld: '0_1',
  archivFeld: '1_1',
  endeFelder: ['11_6', '18_25'] as readonly string[],
}

// Exportiert, weil die Laufzeit (softengine/data) die zusatzFelder mit
// GENAU demselben Muster prueft — zwei Abschriften desselben Regex koennten
// auseinanderlaufen.
export const POS_LEN = /^\d+_\d+$/
const NUR_ZIFFERN = /^\d+$/

// Der breite Schnitt des Laders: POS=0, LEN=255 — die SE-Antwortvariable
// fasst 255 Zeichen (SE-Log `zlen=255`, Echttest 2026-08-11). Felder, die
// GANZ in diesem Fenster liegen, schneidet getField aus dem SATZ-Rohstring;
// nur was darueber hinausragt, kostet je Position eine eigene Frage
// (Wellenkopf R: „nur Felder dahinter (z. B. 280_12) kosten je eine
// weitere Frage").
export const LADE_SCHNITT_LEN = 255

// Die benutzten Felder HINTER dem Schnitt — sie reisen als `zusatzFelder`
// mit der Hol-Relation in FF_DATA_SOURCES (exportMask): die laufende Maske
// hat kein Feld-Woerterbuch und kann die Liste nicht selbst bilden, der
// Export zaehlt sie aus derselben S5.1-Sammlung ab wie die
// FELDER-Bestellung (benutzteFelderJeQuelle). Ein Feld zaehlt schon, wenn
// es nur TEILWEISE hinter dem Fenster liegt (pos+len > 255): der
// SATZ-Ausschnitt waere sonst still abgeschnitten. Sortiert nach Position,
// dann Laenge — deterministische Export-Bytes.
export function felderHinterSchnitt(benutzt: ReadonlySet<string> | undefined): string[] {
  const raus: string[] = []
  for (const code of benutzt ?? []) {
    const m = /^(\d+)_(\d+)$/.exec(code)
    if (!m) continue
    if (Number(m[1]) + Number(m[2]) > LADE_SCHNITT_LEN) raus.push(code)
  }
  return raus.sort((a, b) => {
    const [posA = 0, lenA = 0] = a.split('_').map(Number)
    const [posB = 0, lenB = 0] = b.split('_').map(Number)
    return posA - posB || lenA - lenB
  })
}

// Eingegebene Relationsnummer -> Technikwert; ungültig = '' (das Formular
// zeigt dann einen Fehler, geraten wird nicht — Muster kennungFromInput).
export function relationNrFromInput(raw: string): string {
  const t = raw.trim()
  return NUR_ZIFFERN.test(t) ? t : ''
}

// Die WIRKSAME Lade-Relation einer Quelle — oder null. Die Art-Abfrage
// steckt mit drin (Muster kopfsatzFor): wechselt der Bediener die Art,
// bleibt die alte Einstellung in der Datei stehen und darf den Export nicht
// mehr beeinflussen.
export function ladeRelationFor(
  source: { kind: DataSourceKind; ladeRelation?: LadeRelation },
): LadeRelation | null {
  if (!artFuer(source.kind).relationLadenMoeglich) return null
  return source.ladeRelation ?? null
}

// Rohdaten (localStorage/Maskendatei) -> saubere LadeRelation oder null.
// Strukturell prüfen, Unbrauchbares verwerfen, nie raten (Muster
// pruefeDatenquellen). Pflicht: Nummer, Geber, Belegart-/Belegnummer-Feld,
// mindestens ein Ende-Feld; Jahr/Archiv dürfen leer sein.
export function pruefeLadeRelation(raw: unknown): LadeRelation | null {
  if (!raw || typeof raw !== 'object') return null
  const e = raw as Record<string, unknown>
  const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')
  const nr = text(e.nr)
  const geberQuelleId = text(e.geberQuelleId)
  const belegartFeld = text(e.belegartFeld)
  const belegnummerFeld = text(e.belegnummerFeld)
  const jahrFeld = text(e.jahrFeld)
  const archivFeld = text(e.archivFeld)
  const endeFelder = Array.isArray(e.endeFelder)
    ? e.endeFelder.filter((f): f is string => typeof f === 'string' && POS_LEN.test(f))
    : []
  if (!NUR_ZIFFERN.test(nr)) return null
  if (geberQuelleId === '') return null
  if (!POS_LEN.test(belegartFeld) || !POS_LEN.test(belegnummerFeld)) return null
  if (jahrFeld !== '' && !POS_LEN.test(jahrFeld)) return null
  if (archivFeld !== '' && !POS_LEN.test(archivFeld)) return null
  if (endeFelder.length === 0) return null
  return { nr, geberQuelleId, belegartFeld, belegnummerFeld, jahrFeld, archivFeld, endeFelder }
}
