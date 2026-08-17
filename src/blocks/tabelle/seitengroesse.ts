export const ZEILEN_HOEHE = 32

export const OHNE_MESSUNG = 10

const PLATZHALTER_OHNE_MESSUNG = 4

export function platzhalterZeilen(gemessen: number | null): number {
  return gemessen ?? PLATZHALTER_OHNE_MESSUNG
}

export function passendeZeilen(
  rumpfHoehe: number,
  kopfHoehe: number,
  zeilenHoehe: number,
): number {
  return Math.max(1, Math.floor((rumpfHoehe - kopfHoehe) / zeilenHoehe))
}

export interface Zeilenmass {
  passen: number

  zeilenHoehe: number
}

export function zeilenmass(
  rumpfHoehe: number,
  kopfHoehe: number,
  takt: number,
): Zeilenmass {
  const passen = passendeZeilen(rumpfHoehe, kopfHoehe, takt)
  const platz = rumpfHoehe - kopfHoehe
  if (platz < takt) return { passen, zeilenHoehe: takt }
  return { passen, zeilenHoehe: Math.floor((platz / passen) * 100) / 100 }
}

export function linealTakte(passen: number | null, gezeichnet: number): number | null {
  if (passen === null) return null
  return Math.max(0, passen - gezeichnet)
}

export interface Aufteilung {
  seiten: number

  seite: number

  zeilen: (number | null)[]
}

export interface AufteilungFrage {
  sichtbar: readonly number[]

  hatQuelle: boolean
  proSeite: number

  wunschSeite: number

  platzhalterZeilen: number
}

export function seitenAufteilung({
  sichtbar,
  hatQuelle,
  proSeite,
  wunschSeite,
  platzhalterZeilen,
}: AufteilungFrage): Aufteilung {
  const seiten = hatQuelle ? Math.max(1, Math.ceil(sichtbar.length / proSeite)) : 1

  const seite = Math.min(Math.max(wunschSeite, 0), seiten - 1)
  if (!hatQuelle) {
    return { seiten, seite, zeilen: Array.from({ length: platzhalterZeilen }, () => null) }
  }
  return { seiten, seite, zeilen: [...sichtbar.slice(seite * proSeite, (seite + 1) * proSeite)] }
}
