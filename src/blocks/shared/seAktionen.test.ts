// Unit-Tests fuer die puren Helfer der Aktions-Laufzeit (Z2). Die
// DOM-Ausfuehrung (Klick -> START_TOOL) prueft e2e/aktionen.spec.ts im
// echten Browser. LEITPLANKE: Tests niemals loeschen/abschwaechen.

import { describe, expect, it } from 'vitest'
import { buildStartToolLink } from './seAktionen'

describe('buildStartToolLink (Referenz-Form seStartTool, empfang Z. 873-874)', () => {
  it('ohne Parameter: 0,START_TOOL,<nr>', () => {
    expect(buildStartToolLink('3003', [])).toBe('0,START_TOOL,3003')
  })

  it('Parameter werden URL-kodiert angehaengt', () => {
    expect(buildStartToolLink('1951', ['3', 'a b'])).toBe('0,START_TOOL,1951,3,a%20b')
    expect(buildStartToolLink('7', ['Grüße'])).toBe('0,START_TOOL,7,Gr%C3%BC%C3%9Fe')
  })
})
