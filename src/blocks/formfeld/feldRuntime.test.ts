import { afterEach, describe, expect, it } from 'vitest'
import {
  dateValueToInput,
  hydrateField,
  inputValueToDate,
  type RuntimeFieldElement,
} from './feldRuntime'

class FakeField extends EventTarget {
  value = ''
  private readonly attrs: Record<string, string>

  constructor(attrs: Record<string, string>) {
    super()
    this.attrs = attrs
  }

  getAttribute(name: string): string | null {
    return this.attrs[name] ?? null
  }
}

afterEach(() => {
  delete (globalThis as Record<string, unknown>).FF_DATA_SOURCES
  delete (globalThis as Record<string, unknown>).SEDATA
})

describe('feldRuntime', () => {
  it('hydriert ausschließlich die erste Zeile der eigenen Quelle', () => {
    Object.assign(globalThis, {
      FF_DATA_SOURCES: [
        { id: 'board', name: 'Termine', tableId: 'IDBID0001', indexField: '0_10' },
        { id: 'field', name: 'Adressen', tableId: 'ADR', indexField: '2_8' },
      ],
      SEDATA: {
        Daten: {
          SEFileLoop: [
            { ALIAS: 'Termine', Zeilen: [{ '78_30': 'Minka' }] },
            { ALIAS: 'Adressen', Zeilen: [{ '2_8': '41', '10_30': 'Wagner' }, { '10_30': 'Falsch' }] },
          ],
        },
      },
    })
    const field = new FakeField({ source: 'field', valuefield: '10_30' }) as unknown as RuntimeFieldElement

    hydrateField(field)

    expect(field.value).toBe('Wagner')
  })

  it('leert einen gebundenen Wert, wenn die eigene Quelle keine Zeile liefert', () => {
    Object.assign(globalThis, {
      FF_DATA_SOURCES: [{ id: 'field', name: 'Adressen', tableId: 'ADR', indexField: '' }],
      SEDATA: { Daten: { SEFileLoop: [{ ALIAS: 'Adressen', Zeilen: [] }] } },
    })
    const field = new FakeField({ source: 'field', valuefield: '10_30' }) as unknown as RuntimeFieldElement
    field.value = 'Alt'

    hydrateField(field)

    expect(field.value).toBe('')
  })
})

describe('Datumswert-Konvention', () => {
  it('konvertiert tolerant zwischen SoftEngine- und date-Input-Format', () => {
    expect(dateValueToInput('16.07.2026')).toBe('2026-07-16')
    expect(inputValueToDate('2026-07-16')).toBe('16.07.2026')
    expect(dateValueToInput('unbekannt')).toBe('unbekannt')
    expect(inputValueToDate('unbekannt')).toBe('unbekannt')
  })
})
