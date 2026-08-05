// feldRuntime — Datenverhalten eines EINWERTIGEN Blocks im Export.
//
// Die Runtime kennt nur den Vertrag source + valuefield + value, nie einen
// Bausteintyp. Benutzt wird sie derzeit von genau einem Baustein: dem
// Formularfeld. (Bis 2026-08-05 behauptete hier eine "Datumsanzeige"
// mitzunutzen — die gibt es nicht; der Datum-Baustein ist der Tageswaehler
// und hat gar keine Datenquelle.) Die Quelle und Zeilen kommen aus der
// SoftEngine-Schicht; der konkrete Baustein bleibt ein normales Web
// Component. Editor-Elemente melden sich nie an.

import { bindingAttr } from '../../core/blocks/BlockDefinition'
import { getField, setField } from '../../softengine/data'
import { macheDatenAnschluss } from '../shared/datenAnschluss'
import { leseGebundeneStelle } from '../shared/gebundeneStelle'
import { meldeKettenFehler, runEvent } from '../shared/seAktionen'

export interface RuntimeFieldElement extends HTMLElement {
  value: string
  // Optional: der Baustein prueft bei jeder Hydrierung selbst nach, ob sein
  // EIGENER Wert noch gilt. Das Nachschlage-Feld braucht es — sein Wert kommt
  // nicht aus einer Bindung, sondern aus dem Fenster, und wird ungueltig, wenn
  // der Bediener beim Geber etwas anderes waehlt. Was „noch gueltig" heisst,
  // weiss nur der Baustein; hier steht bloss der Anlass (die Hydrierung laeuft
  // bei Daten-Push, Tageswechsel und Auswahl-Aenderung).
  pruefeAuswahlPassung?: () => void
}

interface FieldData {
  row: unknown
  code: string
  pindex: string
}

// Ein Feld, das seinen Wert aus einer WEITEREN Quelle holt, wird NICHT
// zurueckgeschrieben. Der Schreibweg adressiert den Satz ueber die
// Datensatz-Nummer der ERSTEN Quelle (PINDEX) — mit dem Feldcode der zweiten
// waere das die richtige Nummer in der falschen Tabelle, also ein Schreiber
// auf einen fremden Satz. Erst wenn der Schreibweg fuer die Partnerzeile an
// einer echten Maske belegt ist, darf das aufgehen (Regel 5/10). Bis dahin
// zeigt so ein Feld den Wert nur an — sichtbar leer bleibt nichts, und still
// falsch geschrieben wird auch nichts (Regel 4).

const fieldData = new WeakMap<RuntimeFieldElement, FieldData>()
const wired = new WeakSet<RuntimeFieldElement>()

// SoftEngine-Datumsfelder nutzen DD.MM.YYYY, ein natives date-Input erwartet
// YYYY-MM-DD. Unbekannte Werte bleiben unangetastet; es wird nichts geraten.
export function dateValueToInput(value: string): string {
  const german = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value)
  return german ? `${german[3]}-${german[2]}-${german[1]}` : value
}

export function inputValueToDate(value: string): string {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return iso ? `${iso[3]}.${iso[2]}.${iso[1]}` : value
}

function currentValue(field: RuntimeFieldElement): string {
  return typeof field.value === 'string' ? field.value : ''
}

// Exportiert für den gezielten Runtime-Test. Attribute sind absichtlich
// lowercase: HTML normalisiert valueField beim Export zu valuefield
// (Attribut-Form der Bindungs-Konvention — bindingAttr = die eine Stelle).
export function hydrateField(field: RuntimeFieldElement): void {
  // Zuerst den Baustein selbst nachpruefen lassen, ob sein eigener Wert noch
  // gilt (Nachschlage-Feld: passt der uebernommene Satz noch zur Auswahl des
  // Gebers?). Ob dabei ueberhaupt etwas zu pruefen ist, entscheidet der
  // Baustein — hier steht nur der Anlass, und der ist fuer jeden Feldtyp
  // derselbe.
  field.pruefeAuswahlPassung?.()
  // Am NACHSCHLAGE-Feld gibt es keine Wert-Bindung: der Wert entsteht durch
  // die Auswahl im Fenster. Eine Bindung obendrauf ueberschriebe ihn bei
  // jedem SoftEngine-Push — der Bediener waehlt einen Kunden, das naechste
  // Datenpaket setzt das Feld zurueck, und niemand sagt ihm warum. Der
  // Inspector bietet die Bindung fuer diesen Feldtyp gar nicht erst an
  // (visibleWhen notEquals); hier faellt zusaetzlich ab, was aus
  // Altbestaenden oder von Hand gebauten Masken noch im Attribut steht.
  if (field.getAttribute('fieldtype') === 'nachschlagen') {
    fieldData.delete(field)
    return
  }
  // Quelle -> Zeile -> Wert macht die geteilte Leseleitung
  // (shared/gebundeneStelle). WELCHE Zeile gilt, entscheidet darin die
  // gemeinsame Auswahl-Regel: OHNE eingestellte Folge wie seit jeher die
  // erste Zeile der Quelle; MIT Folge nur die zur Auswahl passende — und ohne
  // Auswahl gar keine (das Feld bleibt dann leer). Der Schreibweg haengt an
  // DERSELBEN Zeile: was der Bediener sieht, aendert er auch. Keine Zeile =
  // kein Schreib-Eintrag, also kann ein leeres Feld nichts ueberschreiben.
  const stelle = leseGebundeneStelle(field, bindingAttr('value'))
  if (stelle.art !== 'wert') {
    fieldData.delete(field)
    // Ungebunden oder Quelle weg: der Wert bleibt stehen wie bisher. Nur eine
    // fehlende ZEILE leert das Feld.
    if (stelle.art === 'ohneZeile') field.value = ''
    return
  }

  const { zeile, quelle, quelleId, reinerCode, wert } = stelle
  const pindex = quelle.indexField === '' ? '' : getField(zeile, quelle.indexField)
  // Nur eine Bindung an die ERSTE Quelle bekommt einen Schreib-Eintrag.
  if (quelleId === '') fieldData.set(field, { row: zeile, code: reinerCode, pindex })
  else fieldData.delete(field)
  field.value = wert
}

function writeLocal(field: RuntimeFieldElement): FieldData | undefined {
  const data = fieldData.get(field)
  if (data) setField(data.row, data.code, currentValue(field))
  return data
}

function wireField(field: RuntimeFieldElement): void {
  if (wired.has(field)) return
  wired.add(field)
  field.addEventListener('input', () => { writeLocal(field) })
  field.addEventListener('change', () => {
    const data = writeLocal(field)
    runEvent(field, 'onChange', {
      VALUE: currentValue(field),
      PINDEX: data?.pindex ?? '',
    }).catch(meldeKettenFehler)
  })
}

// Anmeldung/Abo/Bruecke: die geteilte Mechanik (shared/datenAnschluss).
const anschluss = macheDatenAnschluss<RuntimeFieldElement>({
  hydriere: hydrateField,
  verdrahte: wireField,
})

export const connectField = anschluss.connect
export const disconnectField = anschluss.disconnect
