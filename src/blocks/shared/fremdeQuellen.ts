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

  // Leer = die Schluesselwerte stehen in der Zeile selbst. Gesetzt = sie
  // stehen im Partnersatz DIESER Quelle (zweite Stufe, s. vonQuelleId):
  // die Tierart haengt am Artikelstamm, also liefert erst der gefundene
  // Artikel den Schluessel, mit dem die Tierart gefunden wird.
  von: string
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
): { quelleId: string; vonQuelleId?: string; keyPairs: SchluesselPaar[] }[] {
  return paarListeAusAttribut(el, WEITERE_QUELLEN_ATTR, 'quelleId', 'vonQuelleId')
    .map((e) => ({
      quelleId: e.id,
      ...(e.von === undefined ? {} : { vonQuelleId: e.von }),
      keyPairs: e.keyPairs,
    }))
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
      von: q.vonQuelleId ?? '',
    })
  }

  // Der Satz einer verknuepften Quelle zu DIESER Zeile. Haengt die
  // Verknuepfung an einer anderen (zweite Stufe), wird erst deren Satz
  // gesucht und DER liefert die Schluesselwerte. `tiefe` bricht einen Ring
  // ab, den der Editor zwar nicht bauen laesst, ein von Hand veraendertes
  // Attribut aber schon.
  const partnerVon = (row: unknown, quelleId: string, tiefe: number): unknown => {
    const eintrag = nachschlag.get(quelleId)
    if (!eintrag || tiefe > weitere.length) return undefined
    const basis = eintrag.von === '' ? row : partnerVon(row, eintrag.von, tiefe + 1)
    if (basis === undefined) return undefined
    const key = schluesselAus(eintrag.hierFelder.map((f) => getField(basis, f)))
    if (key === '') return undefined
    return eintrag.nachSchluessel.get(key)
  }

  return (row, wert) => {
    const { quelleId, code } = zerlegeBindung(wert)
    if (quelleId === '') return getField(row, code)
    const partner = partnerVon(row, quelleId, 0)
    return partner === undefined ? '' : getField(partner, code)
  }
}
