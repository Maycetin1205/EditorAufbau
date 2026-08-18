import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, getField, rowsFor } from '../../softengine/data'
import { WEITERE_QUELLEN_PROP, type SchluesselPaar } from '../../core/data/sourceLinks'
import { zerlegeBindung } from '../../core/blocks/BlockDefinition'
import { paarListeAusAttribut } from './paarListe'

const WEITERE_QUELLEN_ATTR = WEITERE_QUELLEN_PROP.toLowerCase()

export type FeldLeser = (row: unknown, wert: string) => string

interface Nachschlag {
  nachSchluessel: Map<string, unknown>

  hierFelder: string[]
}

const SCHLUESSEL_TRENNER = '\x01'

function schluesselAus(werte: readonly string[]): string {
  if (werte.length === 0) return ''
  const teile: string[] = []
  for (const w of werte) {
    const t = w.trim()
    if (t === '') return ''
    teile.push(t)
  }
  return teile.join(SCHLUESSEL_TRENNER)
}

// Die Verknüpfungen dieses Bausteins: je Partner-Quelle die Schlüsselpaare,
// mit denen die zusammengehörige Zeile gefunden wird („Woran erkennt man die
// zusammengehörige Zeile?"). Auch die Erfassungszeile der Tabelle liest sie —
// sie ist die EINE Angabe dazu, eine zweite gibt es nicht.
export function verknuepfungenVon(
  el: HTMLElement,
): { quelleId: string; keyPairs: SchluesselPaar[] }[] {
  return paarListeAusAttribut(el, WEITERE_QUELLEN_ATTR, 'quelleId')
    .map((e) => ({ quelleId: e.id, keyPairs: e.keyPairs }))
}

export function macheFeldLeser(el: HTMLElement): FeldLeser {
  const weitere = verknuepfungenVon(el)
  if (weitere.length === 0) return (row, wert) => getField(row, zerlegeBindung(wert).code)

  const sedata = seGlobal().SEDATA
  const quellenListe = seGlobal().FF_DATA_SOURCES
  const nachschlag = new Map<string, Nachschlag>()

  for (const q of weitere) {
    const source = findRuntimeDataSource(quellenListe, q.quelleId)

    if (!source) continue
    const zeilen = rowsFor(sedata, source.name, source.tableId)
    const nachSchluessel = new Map<string, unknown>()
    for (const zeile of zeilen) {
      const key = schluesselAus(q.keyPairs.map((p) => getField(zeile, p.toField)))
      if (key !== '' && !nachSchluessel.has(key)) nachSchluessel.set(key, zeile)
    }
    nachschlag.set(q.quelleId, {
      nachSchluessel,
      hierFelder: q.keyPairs.map((p) => p.fromField),
    })
  }

  return (row, wert) => {
    const { quelleId, code } = zerlegeBindung(wert)
    if (quelleId === '') return getField(row, code)
    const eintrag = nachschlag.get(quelleId)
    if (!eintrag) return ''
    const key = schluesselAus(eintrag.hierFelder.map((f) => getField(row, f)))
    if (key === '') return ''
    const partner = eintrag.nachSchluessel.get(key)
    return partner === undefined ? '' : getField(partner, code)
  }
}
