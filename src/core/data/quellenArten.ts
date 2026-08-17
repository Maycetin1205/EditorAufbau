export type DataSourceKind =
  | 'idb'
  | 'adressstamm'
  | 'artikelstamm'
  | 'beleg'
  | 'belegposition'
  | 'datei'
  | 'erpabfrage'

export interface ArtFeld {
  code: string
  label: string
}

export interface QuellenArt {
  id: DataSourceKind

  name: string

  tabellenId: string

  felderEinzeln: boolean

  kennungLabel: string

  kennungBeispiel: string

  kopfsatzMoeglich: boolean

  kopfsatzStandard: string

  relationLadenMoeglich: boolean

  varMoeglich: boolean

  bestellBlock: 'sefileloop' | 'erpapicall'

  feldVorsatzMoeglich: boolean

  standardFelder: readonly ArtFeld[]
}

const ARTEN: Record<DataSourceKind, QuellenArt> = {
  idb: {
    id: 'idb',
    name: 'IDB-Tabelle',
    tabellenId: '',
    felderEinzeln: false,
    kennungLabel: 'Kennung',
    kennungBeispiel: 'ID0001',
    kopfsatzMoeglich: false,
    kopfsatzStandard: '',
    relationLadenMoeglich: false,
    varMoeglich: false,
    bestellBlock: 'sefileloop',
    feldVorsatzMoeglich: false,
    standardFelder: [],
  },
  adressstamm: {
    id: 'adressstamm',
    name: 'Adressstamm',
    tabellenId: 'ADR',
    felderEinzeln: true,
    kennungLabel: '',
    kennungBeispiel: '',
    kopfsatzMoeglich: false,
    kopfsatzStandard: '',
    relationLadenMoeglich: false,
    varMoeglich: true,
    bestellBlock: 'sefileloop',
    feldVorsatzMoeglich: false,
    standardFelder: [],
  },
  artikelstamm: {
    id: 'artikelstamm',
    name: 'Artikelstamm',
    tabellenId: 'ART',
    felderEinzeln: true,
    kennungLabel: '',
    kennungBeispiel: '',
    kopfsatzMoeglich: false,
    kopfsatzStandard: '',
    relationLadenMoeglich: false,
    varMoeglich: false,
    bestellBlock: 'sefileloop',
    feldVorsatzMoeglich: false,
    standardFelder: [],
  },
  beleg: {
    id: 'beleg',
    name: 'Beleg',
    tabellenId: 'BEL',
    felderEinzeln: true,
    kennungLabel: '',
    kennungBeispiel: '',
    kopfsatzMoeglich: false,
    kopfsatzStandard: '',
    relationLadenMoeglich: false,
    varMoeglich: true,

    bestellBlock: 'sefileloop',
    feldVorsatzMoeglich: false,
    standardFelder: [
      { code: '0_11', label: 'Satzschlüssel' },
      { code: '2_1', label: 'Belegart' },
      { code: '3_8', label: 'Belegnummer' },
      { code: '11_8', label: 'Kundennummer' },
      { code: '19_10', label: 'Belegdatum' },
      { code: '393_12', label: 'Warenwert' },
      { code: '441_12', label: 'MwSt-Betrag' },
      { code: '453_12', label: 'Gesamtbetrag' },
      { code: '3440_60', label: 'Name' },
    ],
  },

  belegposition: {
    id: 'belegposition',
    name: 'Belegpositionen',
    tabellenId: 'POS',
    felderEinzeln: true,
    kennungLabel: '',
    kennungBeispiel: '',
    kopfsatzMoeglich: true,
    kopfsatzStandard: 'BEL_0_11',
    relationLadenMoeglich: true,

    varMoeglich: true,

    bestellBlock: 'sefileloop',
    feldVorsatzMoeglich: false,
    standardFelder: [

      { code: '2_1', label: 'Belegart' },
      { code: '3_8', label: 'Belegnummer' },
      { code: '11_6', label: 'Positionsnummer' },

      { code: '17_1', label: 'Zeilenart' },
      { code: '18_25', label: 'Artikelnummer' },
      { code: '45_60', label: 'Bezeichnung' },
      { code: '164_8', label: 'Menge' },
      { code: '246_9', label: 'Einzelpreis' },
      { code: '280_12', label: 'Gesamtpreis' },
      { code: '372_5', label: 'MwSt-Satz' },

      { code: '645_10', label: 'Satznummer' },
      { code: '689_5', label: 'Mengeneinheit' },
      { code: '1401_12', label: 'Rohertrag' },

      { code: '2558_1', label: 'Farbkennzeichen' },
      { code: '3164_12', label: 'Rabatt' },
    ],
  },

  datei: {
    id: 'datei',
    name: 'Andere Datei',
    tabellenId: '',
    felderEinzeln: true,
    kennungLabel: 'Kennung',
    kennungBeispiel: 'SERPOS',
    kopfsatzMoeglich: true,
    kopfsatzStandard: '',
    relationLadenMoeglich: false,
    varMoeglich: false,
    bestellBlock: 'sefileloop',
    feldVorsatzMoeglich: false,
    standardFelder: [],
  },

  erpabfrage: {
    id: 'erpabfrage',
    name: 'ERP-Abfrage',
    tabellenId: '',
    felderEinzeln: true,
    kennungLabel: 'Kennung',
    kennungBeispiel: 'LIEFERADRESSE.GET',
    kopfsatzMoeglich: false,
    kopfsatzStandard: '',
    relationLadenMoeglich: false,
    varMoeglich: false,
    bestellBlock: 'erpapicall',
    feldVorsatzMoeglich: true,

    standardFelder: [],
  },
}

export function artFuer(kind: DataSourceKind): QuellenArt {
  return ARTEN[kind]
}

export const QUELLEN_ARTEN: readonly QuellenArt[] = Object.values(ARTEN)

export const DATA_SOURCE_KINDS: readonly DataSourceKind[] =
  QUELLEN_ARTEN.map((a) => a.id)
