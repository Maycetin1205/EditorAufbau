import {
  artFuer,
  felderFor,
  kopfsatzFor,
  ladeRelationFor,
  loopReihenfolge,
  tableIdFor,
  varAusKopfsaetzen,
  type DataSource,
} from '../core/data/dataSources'
import { escapeNonAsciiJs } from './serializer'

export function baueSevariablen(
  used: readonly DataSource[],

  benutzteFelder: ReadonlyMap<string, ReadonlySet<string>>,

  holSchluessel: ReadonlyMap<string, string[]>,
): string {
  const bestellbar = used.filter((s) => ladeRelationFor(s) === null)
  const perApi = bestellbar.filter((s) => artFuer(s.kind).bestellBlock === 'erpapicall')
  const perDataSet = bestellbar.filter((s) => artFuer(s.kind).bestellBlock === 'dataset')

  const geordnet = loopReihenfolge(
    bestellbar.filter((s) => artFuer(s.kind).bestellBlock === 'sefileloop'),
  )

  const erpapicall = perApi.map((s) => ({
    ID: tableIdFor(s),
    ALIAS: s.name,
    FELDER: felderFor(s, benutzteFelder.get(s.id), holSchluessel.get(s.id) ?? []),
  }))
  // DataSets legen ihre Zeilen unter Daten.Tabellen.<ALIAS> ab — dieselbe
  // Form wie MEMTAB, die rowsFor() schon liest (softengine/data.ts).
  const dataset = perDataSet.map((s) => ({
    ID: tableIdFor(s),
    ALIAS: s.name,
    FELDER: felderFor(s, benutzteFelder.get(s.id), holSchluessel.get(s.id) ?? []),
  }))
  const sefileloop = geordnet.map((s) => {
    const kopfsatz = kopfsatzFor(s)
    return {
      INDEX_NR: 0,
      ALIAS: s.name,
      ID: tableIdFor(s),
      ...(kopfsatz !== '' ? { KOPFSATZ_INDEX: kopfsatz } : {}),
      FELDER: felderFor(s, benutzteFelder.get(s.id), holSchluessel.get(s.id) ?? []),
    }
  })

  const varAbschnitt = varAusKopfsaetzen(geordnet)
  return escapeNonAsciiJs(
    JSON.stringify({
      ...(varAbschnitt.length > 0 ? { VAR: varAbschnitt } : {}),
      SEFILELOOP: sefileloop,
      ERPAPICALL: erpapicall,
      ...(dataset.length > 0 ? { DATASET: dataset } : {}),
    }, null, 2),
  ) + '\n'
}
