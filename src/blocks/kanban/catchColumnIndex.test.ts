import { describe, expect, it } from 'vitest'
import { catchColumnIndex } from './seRuntime'

describe('catchColumnIndex (Auffangspalte)', () => {
  it('findet die erste exakt mit ja markierte Spalte', () => {
    expect(catchColumnIndex(['nein', 'ja', 'nein'])).toBe(1)
    expect(catchColumnIndex([null, ' ja ', 'ja'])).toBe(1)
  })

  it('liefert -1, wenn keine Auffangspalte gewaehlt ist', () => {
    expect(catchColumnIndex(['nein', '', null, undefined])).toBe(-1)
    expect(catchColumnIndex([])).toBe(-1)
  })

  it('raet bei fremden Technikwerten nicht', () => {
    expect(catchColumnIndex(['true', 'JA', 'yes'])).toBe(-1)
  })
})
