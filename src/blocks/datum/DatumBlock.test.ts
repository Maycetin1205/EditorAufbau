import { describe, expect, it } from 'vitest'
import { datumAnzeige } from './datumWert'

describe('DatumBlock', () => {
  it('formatiert die echte Uhr nach der gewählten Klarname-Option (.vuhr-Vorbild)', () => {
    const now = new Date(2026, 6, 16, 9, 5)
    expect(datumAnzeige('date', now)).toEqual({ haupt: '16.07.2026' })
    expect(datumAnzeige('time', now)).toEqual({ haupt: '09:05' })
    // Datum + Zeit: Zeit ist die grosse Hauptzeile, das Datum die kleine
    // Zeile darunter (Empfang-Referenz .vuhr).
    expect(datumAnzeige('datetime', now)).toEqual({ haupt: '09:05', neben: '16.07.2026' })
  })
})
