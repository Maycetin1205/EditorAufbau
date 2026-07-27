// tagFilter — die EINE Filterregel „nur die Saetze des gewaehlten Tages".
//
// Vorbild ist die echte Empfang-Maske:
//   termine.filter(t => dateKey(getField(t, FELD.TP.datum)) === SELECTED_DATE)
//
// Kanban UND Tabelle brauchen sie — darum steht sie hier einmal statt
// zweimal abgeschrieben (Regel 10: der zweite echte Fall erzwingt es).
//
// Zwei Wege lassen die Zeilen UNVERAENDERT durch, und das ist Absicht:
//   - kein Datumsfeld eingestellt (tagCode '')  -> der Bediener will nicht filtern
//   - kein Tag gewaehlt (tag '')                -> keine Maske mit Tageswaehler
// Eine Maske ohne Tagesfilter verhaelt sich damit exakt wie vorher.
//
// Ein Satz mit unlesbarem oder leerem Datum faellt dagegen HERAUS, sobald
// gefiltert wird: „Termin ohne Datum" gehoert an keinen Tag. Er still an
// jedem Tag mitzuzeigen waere die schlechtere Luege.

import { getField } from '../../softengine/data'
import { tagSchluessel } from './datumSchluessel'

export function zeilenAmTag(
  rows: readonly unknown[],
  tagCode: string,
  tag: string,
): unknown[] {
  if (tagCode === '' || tag === '') return [...rows]
  return rows.filter((row) => tagSchluessel(getField(row, tagCode)) === tag)
}
