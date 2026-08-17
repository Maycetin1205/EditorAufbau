import { describe, expect, it } from 'vitest'
import { dtkTextAusBytes, parseDtk, parseDtkBytes } from './dtkImport'

const sp = (n: number) => ' '.repeat(n)

function posSatz(
  id: string,
  nummer: number,
  label: string,
  pos: number | '',
  len: number,
  art: string,
  zwilling = true,
): string {
  const nr = String(nummer)
  const posText = pos === '' ? '' : String(pos)
  const feld = `${posText === '' ? '' : `${posText}  `}${len}${art}`
  return (
    `3,POS,${id},${sp(10 - nr.length)}${nr}${sp(57)}${id}${sp(120)}` +
    `00003.11.200711:0500003.08.202610:34${sp(150)}56281${sp(400)}` +
    `${label}${sp(41 - label.length)}${feld}${sp(19)}0${sp(8)}` +
    `NN${zwilling ? ` ${feld}` : sp(10)}${sp(60)}\r\n`
  )
}

function verzeichnis(id: string, nummer: number): string {
  const nr = String(nummer)
  return `3,POS,${id},${sp(10 - nr.length)}${nr}${sp(57)}ÿl ÿ${sp(8)}\r\n`
}

function kopfsatz(id: string, name: string): string {
  return (
    `0,${id}${sp(70)}${id}${sp(60)}VET${sp(100)}` +
    `${name}${sp(60 - name.length)}00003.11.200711:0500003.08.202610:34${sp(40)}\r\n`
  )
}

describe('parseDtk — Leseweg A (@DSATZ-Zeilen)', () => {
  it('liest beide belegten Zeilenformen und sortiert nach Position', () => {
    const [t] = parseDtk(
      'IDBID0001_55_55,,55,55,Bezeichnung,L\r\n' +
        'IDBID0001_0_55,1001,0,55,TierArtID,L,a001,000000\r\n',
    )
    expect(t.kennung).toBe('IDBID0001')
    expect(t.felder).toEqual([
      { code: '0_55', label: 'TierArtID' },
      { code: '55_55', label: 'Bezeichnung' },
    ])
  })

  it('verwirft Zeilen, deren Schlüssel den Spalten widerspricht (zerrissene Stelle)', () => {
    const raus = parseDtk('IDBID0001_55_55,,55,66,Kaputt,L\r\n')
    expect(raus).toEqual([])
  })

  it('verwirft Klarnamen mit Binärresten MITTEN im Text', () => {
    const nul = String.fromCharCode(0)
    const raus = parseDtk('IDBID0001_0_55,,0,55,Ka' + nul + 'putt,L')
    expect(raus).toEqual([])
  })

  it('streift Spaltenrand-Artefakte am RAND des Klarnamens ab (belegt: 0x80 vor " von")', () => {
    const rand = String.fromCharCode(0x80)
    const [t] = parseDtk('IDBID0045_10_8,1045,10,8,' + rand + ' von,R2,a002,000000')
    expect(t.felder).toEqual([{ code: '10_8', label: 'von' }])
  })

  it('dieselbe Position+Länge aus mehreren Blockkopien zählt einmal', () => {
    const [t] = parseDtk(
      'IDBID0001_0_55,,0,55,TierArtID,L\r\nIDBID0001_0_55,,0,55,TierArtID,L\r\n',
    )
    expect(t.felder).toHaveLength(1)
  })
})

describe('parseDtk — Leseweg B (3,POS-Stammsätze) und Soll-Zählung', () => {
  it('liest den Stammsatz: Klarname, Position, Länge — Feld-Art wird nicht übernommen', () => {
    const [t] = parseDtk(posSatz('ID0003', 11, 'Speicherfähig', 409, 1, 'AJN'))
    expect(t.kennung).toBe('IDBID0003')
    expect(t.felder).toEqual([{ code: '409_1', label: 'Speicherfähig' }])
    expect(t.soll).toBe(1)
  })

  it('leere Positions-Spalte heißt Position 0', () => {
    const [t] = parseDtk(posSatz('ID0004', 1, 'Artikelnummer', '', 25, 'L'))
    expect(t.felder).toEqual([{ code: '0_25', label: 'Artikelnummer' }])
  })

  it('auch ohne wiederholte Positionsangabe im Satz (neuere Felder) wird gelesen', () => {
    const [t] = parseDtk(posSatz('ID0003', 21, 'Chipnummer', 449, 30, 'L', false))
    expect(t.felder).toEqual([{ code: '449_30', label: 'Chipnummer' }])
  })

  it('Verzeichnis-Einträge liefern kein Feld, zählen aber fürs Soll — die Lücke wird sichtbar', () => {
    const [t] = parseDtk(
      posSatz('ID0004', 1, 'Artikelnummer', '', 25, 'L') +
        verzeichnis('ID0004', 2) +
        verzeichnis('ID0004', 2),
    )
    expect(t.felder).toHaveLength(1)
    expect(t.soll).toBe(2)
  })

  it('dieselbe Feldnummer aus alten Seitenständen zählt einmal', () => {
    const text =
      posSatz('ID0002', 1, 'Tierart', '', 30, 'L') +
      posSatz('ID0002', 1, 'Tierart', '', 30, 'L')
    const [t] = parseDtk(text)
    expect(t.felder).toHaveLength(1)
    expect(t.soll).toBe(1)
  })
})

describe('parseDtk — Palimpsest: alte Seitenstände neben aktuellen', () => {
  it('Stammsätze bestätigen das Satzlayout → Stammsatz-Extras sind Altstände (Fall StallID)', () => {
    const text =
      'IDBID0002_0_30,,0,30,Tierart,L\r\n' +
      'IDBID0002_30_30,,30,30,Sekundärtierart,L\r\n' +
      'IDBID0002_60_1,,60,1,Ohrmarke,ANJ\r\n' +
      posSatz('ID0002', 1, 'Tierart', '', 30, 'L') +
      posSatz('ID0002', 2, 'StallID', '', 38, 'L') +
      verzeichnis('ID0002', 3)
    const [t] = parseDtk(text)
    expect(t.felder.map((f) => f.code)).toEqual(['0_30', '30_30', '60_1'])
    expect(t.soll).toBe(3)
  })

  it('Stammsätze widersprechen dem Satzlayout → das Layout ist der Altstand (Fall ID0003)', () => {
    const text =
      'IDBID0003_0_30,,0,30,Wert,L\r\n' +
      'IDBID0003_30_255,,30,255,Parameter,L\r\n' +
      posSatz('ID0003', 1, 'Wert', '', 30, 'L') +
      posSatz('ID0003', 2, 'Stallbezeichnung', 76, 30, 'L') +
      posSatz('ID0003', 3, 'Flag 1', 106, 1, 'ANJ')
    const [t] = parseDtk(text)
    expect(t.felder.map((f) => f.code)).toEqual(['0_30', '76_30', '106_1'])
  })
})

describe('parseDtk — Tabellen-Klarnamen', () => {
  it('liest den Namen aus dem Kopfsatz; ohne lesbaren Namen bleibt er leer', () => {
    const raus = parseDtk(
      kopfsatz('ID0002', 'Tierart') + posSatz('ID0002', 1, 'Tierart', '', 30, 'L') +
        posSatz('ID0010', 1, 'ID', '', 55, 'L'),
    )
    expect(raus.find((t) => t.kennung === 'IDBID0002')?.name).toBe('Tierart')
    expect(raus.find((t) => t.kennung === 'IDBID0010')?.name).toBe('')
  })
})

describe('dtkTextAusBytes — Fortsetzungsköpfe der 2048er-Seiten', () => {
  const alsBytes = (s: string) => Uint8Array.from([...s].map((c) => c.charCodeAt(0)))

  const kopf =
    'ú' + 'x'.repeat(9) + 'V' + 'x'.repeat(5) + 'ÿ'.repeat(5) + 'xxx' + 'ÿ'.repeat(6)

  it('schneidet den Kopf an Byte 2042 heraus — die zerrissene Zeile heilt', () => {
    const teilA = 'IDBID0010_0_10,,0,10,Ge'
    const teilB = 'ändert um,D\r\n'
    const text = sp(2042 - teilA.length) + teilA + kopf + teilB
    const [t] = parseDtkBytes(alsBytes(text))
    expect(t.felder).toEqual([{ code: '0_10', label: 'Geändert um' }])
  })

  it('ohne die 0xFF-Signatur wird an Byte 2042 nichts herausgeschnitten', () => {
    const zeile = 'IDBID0010_0_10,,0,10,Geändert um,D\r\n'
    const text = sp(2042) + 'kein Kopf hier' + sp(30) + zeile
    expect(dtkTextAusBytes(alsBytes(text))).toContain('Geändert um')
    const [t] = parseDtkBytes(alsBytes(text))
    expect(t.felder).toHaveLength(1)
  })
})

describe('parseDtk — Ränder', () => {
  it('leerer oder fremder Inhalt ergibt eine leere Liste', () => {
    expect(parseDtk('')).toEqual([])
    expect(parseDtk('{ "sources": [] }')).toEqual([])
  })

  it('Tabellen kommen sortiert nach Kennung', () => {
    const raus = parseDtk(
      posSatz('ID0010', 1, 'ID', '', 55, 'L') + posSatz('ID0002', 1, 'Tierart', '', 30, 'L'),
    )
    expect(raus.map((t) => t.kennung)).toEqual(['IDBID0002', 'IDBID0010'])
  })
})
