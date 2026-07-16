import { describe, expect, it } from 'vitest'
import { currentDateDisplay } from './datumWert'

describe('DatumBlock', () => {
  it('formatiert die echte Uhr nach der gewählten Klarname-Option', () => {
    const now = new Date(2026, 6, 16, 9, 5)
    expect(currentDateDisplay('date', now)).toBe('16.07.2026')
    expect(currentDateDisplay('time', now)).toBe('09:05')
    expect(currentDateDisplay('datetime', now)).toBe('16.07.2026 09:05')
  })
})
