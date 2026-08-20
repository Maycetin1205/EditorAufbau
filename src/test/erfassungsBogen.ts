import type { BausteinQuelle } from '../core/data/sourceLinks'
import { seGlobal } from '../softengine/bridge'
import type { ErfassungsUmfeld } from '../blocks/tabelle/erfassungsZellen'
import type { Spalte } from '../blocks/tabelle/spalten'

// Der Prüfbogen der Erfassung: eine Belegpositions-Zeile mit ihren Spalten,
// die Verknüpfungen dazu und die gestellten SoftEngine-Daten. Liegt hier und
// nicht in der Testdatei, weil ihn mehrere Prüfungen brauchen — und weil
// erfassungsLauf.test.ts mit ihm über den Zeilen-Deckel lief.
export const spalte = (teil: Partial<Spalte>): Spalte => ({
  titel: 'Spalte', feld: '', art: 'text', ...teil,
})

// Das Nutzer-Modell (2026-08-19): die Tabelle zeigt die BELEGPOSITIONEN, und
// jede schreibende Spalte ist ein FELD DER POSITION. WO eine Zelle beim
// Erfassen sucht, WÄHLT der Nutzer am Spaltenkopf („Sucht beim Erfassen in") —
// abgeleitet wird das seit dem 19.08. nicht mehr. Welchen Wert der gewählte
// Satz liefert, sagt weiter die Verknüpfung (Schlüsselpaar
// Position.Artikelnummer ↔ Stamm.Artikelnummer).
//
// Der Bogen mischt darum absichtlich beides: Spalten, die suchen (Artikel,
// Bezeichnung, Gabe), und eine reine Anzeige-Spalte, die nur zeigt, was der
// gewählte Satz liefert (Gabe im Klartext).
export const ARTIKEL = spalte({ titel: 'Artikel', feld: '10_8', suchtIn: 'q-art' })
export const BEZEICHNUNG = spalte({ titel: 'Bezeichnung', feld: 'q-art::30_40', suchtIn: 'q-art' })
export const MENGE = spalte({ titel: 'Menge', feld: '11_6', art: 'zahl' })
export const GABE = spalte({ titel: 'Gabe', feld: 'q-gabe::5_4', suchtIn: 'q-gabe' })
export const GABE_TEXT = spalte({ titel: 'Gabe im Klartext', feld: 'q-gabe::9_20' })
export const NOTIZ = spalte({ titel: 'Notiz' })

export const ZEILE = [ARTIKEL, BEZEICHNUNG, MENGE, GABE, GABE_TEXT, NOTIZ]

// „Woran erkennt man die zusammengehörige Zeile?" — dieselbe Angabe, die die
// Datenzeile längst benutzt (weitereQuellen am Baustein). Der gewählte
// Artikel liefert der werdenden Position Artikelnummer UND Tierart; an der
// Tierart hängt die Gabe.
export const VERKNUEPFUNGEN: BausteinQuelle[] = [
  {
    quelleId: 'q-art',
    keyPairs: [
      { fromField: '10_8', toField: '3_18' },
      { fromField: '12_4', toField: '40_4' },
    ],
  },
  { quelleId: 'q-gabe', keyPairs: [{ fromField: '12_4', toField: '2_4' }] },
]

export function umfeldMit(
  spalten: readonly Spalte[] = ZEILE,
  verknuepfungen: readonly BausteinQuelle[] = VERKNUEPFUNGEN,
): ErfassungsUmfeld {
  return { spalten, quelleId: 'q-pos', verknuepfungen }
}

export function quellenStellen(): void {
  const g = seGlobal()
  g.FF_DATA_SOURCES = [
    { id: 'q-art', name: 'Artikel', tableId: 'ART', kind: 'art' },
    { id: 'q-gabe', name: 'Gaben', tableId: 'IDBID0001', kind: 'idb' },
  ]
  g.SEDATA = {
    Daten: {
      SEFileLoop: [
        {
          ALIAS: 'Artikel',
          Zeilen: [
            { '3_18': 'ART03045', '30_40': 'Baytril 25mg', '40_4': 'HUND' },
            { '3_18': 'ART00112', '30_40': 'Verband klein', '40_4': 'KATZ' },
            { '3_18': 'ART00999', '30_40': 'Spritze 5ml', '40_4': 'VOGEL' },
          ],
        },
        {
          ALIAS: 'Gaben',
          Zeilen: [
            { '5_4': 'ORAL', '9_20': 'oral', '2_4': 'HUND' },
            { '5_4': 'INJ', '9_20': 'Injektion', '2_4': 'HUND' },
            { '5_4': 'SALB', '9_20': 'Salbe', '2_4': 'KATZ' },
          ],
        },
      ],
    },
  }
}
