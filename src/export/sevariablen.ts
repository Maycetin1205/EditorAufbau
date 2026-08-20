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
  //
  // FELDER bleibt '*' (der dokumentierte Standard, Wiki 47889). Grund: hier
  // stossen ZWEI Vokabulare aufeinander. FELDER erwartet die BEZEICHNUNGen der
  // DataSet-Spalten ('Artikelnummer'), die gelieferten Zeilen tragen dagegen
  // MEMTAB-Schluessel aus Position und Laenge ('FELD_0_25') — und unsere
  // Feldcodes sind die zweite Sorte, weil die Laufzeit damit liest. Wir
  // wuerden also die falsche Sorte bestellen. Eine Auswahl braucht es hier
  // ohnehin nicht: welche Spalten das DataSet hat, entscheidet seine
  // Definition in SoftEngine — genau dafuer gibt es DataSets.
  const dataset = perDataSet.map((s) => ({
    ID: tableIdFor(s),
    ALIAS: s.name,
    FELDER: '*',
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
      // Leere Bloecke werden WEGGELASSEN. Nachgezaehlt an allen 19 echten
      // SoftEngine-Masken (Belegerfassung, 2026-08-20): keine einzige schreibt
      // je einen leeren Block — jede nur die, die sie benutzt, eine sogar `{}`.
      // Der einzige leere Block im ganzen Bestand stand in UNSEREM Export.
      // Anlass: eine Maske mit ausschliesslich einem DataSet begann mit
      // `"SEFILELOOP": [], "ERPAPICALL": [],` und bekam nichts geliefert.
      ...(varAbschnitt.length > 0 ? { VAR: varAbschnitt } : {}),
      ...(sefileloop.length > 0 ? { SEFILELOOP: sefileloop } : {}),
      ...(erpapicall.length > 0 ? { ERPAPICALL: erpapicall } : {}),
      ...(dataset.length > 0 ? { DATASET: dataset } : {}),
    }, null, 2),
  ) + '\n'
}
