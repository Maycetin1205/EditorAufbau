// feldRuntime — gemeinsames Datenverhalten einwertiger Blöcke im Export.
//
// Die Runtime kennt nur den gemeinsamen Vertrag source + valuefield + value.
// Formularfeld und Datumsanzeige verwenden ihn identisch. Die Quelle und
// Zeilen kommen aus der SoftEngine-Schicht; der konkrete Baustein bleibt ein
// normales Web Component. Editor-Elemente melden sich nie an.

import { bootSe, hasSeData, onSeDaten, seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, getField, rowsFor, setField } from '../../softengine/data'
import { runEvent } from '../shared/seAktionen'

export interface RuntimeFieldElement extends HTMLElement {
  value: string
}

interface FieldData {
  row: unknown
  code: string
  pindex: string
}

const fields = new Set<RuntimeFieldElement>()
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
// lowercase: HTML normalisiert valueField beim Export zu valuefield.
export function hydrateField(field: RuntimeFieldElement): void {
  const sourceId = field.getAttribute('source') ?? ''
  const code = field.getAttribute('valuefield') ?? ''
  if (sourceId === '' || code === '') {
    fieldData.delete(field)
    return
  }

  const source = findRuntimeDataSource(seGlobal().FF_DATA_SOURCES, sourceId)
  if (!source) {
    fieldData.delete(field)
    return
  }

  const row = rowsFor(seGlobal().SEDATA, source.name, source.tableId)[0]
  if (row === undefined) {
    fieldData.delete(field)
    field.value = ''
    return
  }

  const pindex = source.indexField === '' ? '' : getField(row, source.indexField)
  fieldData.set(field, { row, code, pindex })
  field.value = getField(row, code)
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
    void runEvent(field, 'onChange', {
      VALUE: currentValue(field),
      PINDEX: data?.pindex ?? '',
    })
  })
}

function hydrateAll(): void {
  if (!hasSeData()) return
  fields.forEach(hydrateField)
}

let subscribed = false

export function connectField(field: RuntimeFieldElement): void {
  if (field.hasAttribute('data-ff-editor')) return
  fields.add(field)
  wireField(field)
  if (!subscribed) {
    subscribed = true
    onSeDaten(hydrateAll)
  }
  bootSe()
  if (hasSeData()) hydrateField(field)
}

export function disconnectField(field: RuntimeFieldElement): void {
  fields.delete(field)
}
