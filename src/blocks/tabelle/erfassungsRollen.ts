import type { EintragsWahlOption } from '../../core/blocks/BlockDefinition'
import { ART_TEXT } from './spaltenArten'
import type { Spalte } from './spalten'

// Die Rollen der Erfassungszeile (Welle G). Sie sitzen IM Spalten-Eintrag,
// nicht in einer zweiten Liste: waere es eine zweite, liefe sie beim Anlegen
// und Entfernen von Spalten auseinander und eine Zelle traege die Rolle einer
// anderen Spalte.

// Der Name der zweiten Bedienstelle am Spalten-Eintrag. Er reist im
// ff-listen-bind mit; Baustein und Registry-Eintrag muessen denselben nennen.
export const ERFASSUNG_STELLE = 'erfassung'

export const ROLLE_FREI = 'frei'

export const ROLLE_NACHSCHLAGEN = 'nachschlagen'

export const ROLLE_FOLGT = 'folgt'

// Die Schluessel am Spalten-Eintrag: die Rolle, ihre eigene Quelle, das
// Detail-Bund (wie `felder` bei der Darstellung) und die Vorbelegung.
export const ROLLE_KEY = 'rolle'
export const ROLLEN_QUELLE_KEY = 'rollenQuelle'
export const ERFASSUNG_KEY = 'erfassung'
export const VORBELEGUNG_KEY = 'vorbelegung'

// Beide nachschlagenden Rollen halten ihr Feld unter DEMSELBEN Schluessel: die
// Rolle sagt schon, was es bedeutet — uebernommen oder gefolgt. Zwei
// Schluessel wuerden beim Rollenwechsel nur Reste hinterlassen.
export const DETAIL_FELD = 'feld'

// Welche Rollen eine eigene Quelle haben. „Frei" hat keine.
export const ROLLEN_MIT_QUELLE: readonly string[] = [ROLLE_NACHSCHLAGEN, ROLLE_FOLGT]

export const ROLLEN_OPTIONEN: readonly EintragsWahlOption[] = [
  // „Frei" hat kein Feld: die Vorbelegung wird in die Zelle selbst getippt
  // (Doppelklick, Muster Spaltenkopf) — am Ding, nicht im Fenster.
  { wert: ROLLE_FREI, name: 'Frei' },
  {
    wert: ROLLE_NACHSCHLAGEN,
    name: 'Nachschlagen',
    felder: [{ key: DETAIL_FELD, label: 'Übernahme' }],
  },
  {
    wert: ROLLE_FOLGT,
    name: 'Folgt',
    felder: [{ key: DETAIL_FELD, label: 'Folgt-Feld' }],
  },
]

export function rolleVon(spalte: Spalte): string {
  const roh = spalte.rolle
  return ROLLEN_OPTIONEN.some((o) => o.wert === roh) ? (roh as string) : ROLLE_FREI
}

// Die Quelle DIESER Spalte. Jede nachschlagende Spalte hat ihre eigene
// (Nutzer-Korrektur 2026-08-18): eine tabellenweite Quelle waere falsch, denn
// Artikelnummer und Verabreichungsart stehen in verschiedenen Quellen.
export function rollenQuelleVon(spalte: Spalte): string {
  if (!ROLLEN_MIT_QUELLE.includes(rolleVon(spalte))) return ''
  return spalte.rollenQuelle ?? ''
}

// Das Feld der eigenen Quelle, das diese Zelle aus dem gewaehlten Satz zieht:
// bei „Nachschlagen" das uebernommene, bei „Folgt" das gefolgte. „Frei"
// liest nichts.
export function rollenFeldVon(spalte: Spalte): string {
  if (rolleVon(spalte) === ROLLE_FREI) return ''
  return spalte.erfassung?.[DETAIL_FELD] ?? ''
}

// Was die Vorschlagsliste als ANZEIGE zeigt und mitdurchsucht: die erste
// Folgt-Spalte DERSELBEN Quelle. Damit findet „bay" den Baytril, ohne dass
// jemand ein zweites Feld einstellt — in einer Belegerfassung ist das die
// Bezeichnung. Die Quelle muss passen: die Bezeichnung eines Artikels sagt
// nichts ueber eine Verabreichungsart. Ohne solche Spalte bleibt die Nummer.
export function ersteFolgtSpalte(
  spalten: readonly Spalte[],
  quelleId: string,
): Spalte | undefined {
  if (quelleId === '') return undefined
  return spalten.find((s) => rolleVon(s) === ROLLE_FOLGT
    && rollenQuelleVon(s) === quelleId
    && rollenFeldVon(s) !== '')
}

export function anzeigeFeldDerZeile(
  spalten: readonly Spalte[],
  quelleId: string,
): string {
  const folgt = ersteFolgtSpalte(spalten, quelleId)
  return folgt === undefined ? '' : rollenFeldVon(folgt)
}

// Die Spalten des grossen Nachschlage-Fensters: Bezeichnung und Nummer, also
// genau das, was die Vorschlagsliste daneben zeigt. Ohne passende Folgt-Spalte
// bleibt es bei der Automatik des Fensters (eine Spalte).
export function fensterSpaltenFuer(
  spalten: readonly Spalte[],
  spalte: Spalte,
): Spalte[] {
  const folgt = ersteFolgtSpalte(spalten, rollenQuelleVon(spalte))
  const wertFeld = rollenFeldVon(spalte)
  if (folgt === undefined || rollenFeldVon(folgt) === wertFeld) return []
  return [
    { titel: folgt.titel, feld: rollenFeldVon(folgt), art: ART_TEXT },
    { titel: spalte.titel, feld: wertFeld, art: ART_TEXT },
  ]
}
