export type Datenbesitz = 'softengine' | 'provided'

export interface BereitgestellteZeile {
  rohzeile: unknown

  zellen: readonly string[]

  zusatz?: readonly Record<string, string>[]
}

export interface AbgeleiteteZeilen {
  rohzeilen: unknown[]
  datenzeilen: string[][]
  zusatzzeilen: Record<string, string>[][]
}

export function leiteZeilenAb(zeilen: readonly BereitgestellteZeile[]): AbgeleiteteZeilen {
  return {
    rohzeilen: zeilen.map((z) => z.rohzeile),
    datenzeilen: zeilen.map((z) => [...z.zellen]),
    zusatzzeilen: zeilen.map((z) => (z.zusatz ?? []).map((w) => ({ ...w }))),
  }
}
