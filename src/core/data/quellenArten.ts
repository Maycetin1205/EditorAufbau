// quellenArten — die Arten von Datenquellen, EINMAL als Tabelle.
//
// Warum diese Datei existiert (Nutzer-Einwand 2026-07-30: „datenquellen
// allgemein ist old hardcoded MUELL"): dieselbe Unterscheidung stand vorher
// als `wenn kind === 'idb' … sonst …` an sechs Stellen — in der
// Tabellen-ID, in der FELDER-Bestellung, im Formular, in der Liste, in der
// Feld-Liste. Eine fuenfte Art (ERPAPICALL, MEMTAB) haette jede einzelne
// davon angefasst, und wer eine vergisst, merkt es erst in SoftEngine.
//
// Jetzt sagt jede Art ihre Eigenschaften SELBST, und alle anderen Stellen
// lesen sie generisch — dieselbe Bauart wie die Baustein-Registry (Regel 2:
// Faehigkeiten sind Registry-Eintraege, kein Sondercode).
//
// EINE NEUE ART DAZU = eine Zeile in der Union + ein Eintrag in ARTEN.
// Voraussetzung ist aber nicht der Code, sondern der BELEG (Regel 5): die
// SEvariablen-Form einer Art muss aus einer echten, laufenden Maske stammen.
// Fuer die vier hier ist sie belegt (docs/chef-maske/: ADR/BEL/ART mit
// expliziter FELDER-Liste, IDBID0001/0004 mit FELDER '*'). ERPAPICALL kommt
// in derselben Maske vor, seine Form ist aber noch nicht abgelesen — darum
// steht es hier NICHT. Geraten wird nichts.

// Technikwert; steht in DataSource.kind und so auch in der Maskendatei.
// Handgeschrieben statt aus ARTEN abgeleitet, damit ein Tippfehler in der
// Tabelle unten ein tsc-Fehler ist und nicht eine stille neue Art.
export type DataSourceKind =
  | 'idb'
  | 'adressstamm'
  | 'artikelstamm'
  | 'beleg'
  | 'datei'

export interface QuellenArt {
  // Derselbe Wert wie der Schluessel in ARTEN (die Liste unten braucht ihn
  // im Eintrag selbst, damit sie ohne Umbau lesbar bleibt).
  id: DataSourceKind
  // Anzeigename in der Auswahlliste — das Einzige, was der Bediener sieht.
  name: string
  // Feste SoftEngine-Tabellen-ID der Art. '' bedeutet: die Kennung gibt der
  // Bediener ein, weil sie je Installation anders ist (eigene IDB-Tabellen).
  tabellenId: string
  // Bestellt diese Art ihre Felder EINZELN? Dann steht in den SEvariablen
  // die explizite pos_len-Liste, und was dort fehlt, liefert SoftEngine
  // nie — die gebundene Stelle bliebe leer. false = FELDER '*', SoftEngine
  // schickt ohnehin alles, die Feldliste dient nur den Klarnamen.
  felderEinzeln: boolean
  // Wie die Kennung heisst, die der Bediener eingeben muss — leer, wo die
  // Art eine feste hat (dann fragt das Formular nicht danach).
  kennungLabel: string
  // Ein echtes Beispiel dafuer, als Platzhalter im Eingabefeld.
  kennungBeispiel: string
}

// Schluessel = id. Ein Record (keine Liste) ist hier Absicht: tsc verlangt
// dadurch fuer JEDE Art in der Union einen Eintrag — eine halb angelegte
// Art kann es nicht geben.
const ARTEN: Record<DataSourceKind, QuellenArt> = {
  idb: {
    id: 'idb',
    name: 'IDB-Tabelle',
    tabellenId: '',
    felderEinzeln: false,
    kennungLabel: 'IDB-ID',
    kennungBeispiel: 'ID0001',
  },
  adressstamm: {
    id: 'adressstamm',
    name: 'Adressstamm',
    tabellenId: 'ADR',
    felderEinzeln: true,
    kennungLabel: '',
    kennungBeispiel: '',
  },
  artikelstamm: {
    id: 'artikelstamm',
    name: 'Artikelstamm',
    tabellenId: 'ART',
    felderEinzeln: true,
    kennungLabel: '',
    kennungBeispiel: '',
  },
  beleg: {
    id: 'beleg',
    name: 'Beleg',
    tabellenId: 'BEL',
    felderEinzeln: true,
    kennungLabel: '',
    kennungBeispiel: '',
  },
  // Jede andere ERP-Datei. BELEGT (2026-07-30) aus den 129 ausgelieferten
  // SEvariablen-Dateien des Herstellers: SEFILELOOP-Kennungen sind dort
  // freie Dateikuerzel — POS (Belegpositionen), SERPOS, CHAPOS, POIDX,
  // ARTLG, JSDDWZE05 … ADR/ART/BEL sind drei davon, nicht die Auswahl.
  // Ohne diese Zeile konnte der Bediener solche Dateien gar nicht anlegen.
  // FELDER einzeln wie bei den Stammtabellen — so machen es die echten
  // Masken (POS mit expliziter pos_len-Liste).
  datei: {
    id: 'datei',
    name: 'Andere Datei',
    tabellenId: '',
    felderEinzeln: true,
    kennungLabel: 'Dateikürzel',
    kennungBeispiel: 'POS',
  },
}

// Die Art einer Quelle. Der Nachschlag kann nicht ins Leere gehen: der Typ
// kennt nur diese vier, und sanitizeDataSources wirft eine fremde Art schon
// beim Laden weg.
export function artFuer(kind: DataSourceKind): QuellenArt {
  return ARTEN[kind]
}

// Reihenfolge der Auswahlliste = Reihenfolge in ARTEN.
export const QUELLEN_ARTEN: readonly QuellenArt[] = Object.values(ARTEN)

export const DATA_SOURCE_KINDS: readonly DataSourceKind[] =
  QUELLEN_ARTEN.map((a) => a.id)
