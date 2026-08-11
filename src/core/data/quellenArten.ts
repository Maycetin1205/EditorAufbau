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
  | 'belegposition'
  | 'datei'

// Ein Feld einer mitgebrachten Feldliste. Dieselbe Form wie DataSourceField —
// hier absichtlich noch einmal beschrieben statt importiert: dataSources liest
// DIESE Datei, ein Import zurueck waere ein Kreis.
export interface ArtFeld {
  code: string
  label: string
}

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
  // Darf diese Art einen KOPFSATZ_INDEX tragen — also UNTER einem anderen
  // Satz haengen? Belegpositionen sind der Fall: SoftEngine liefert dann die
  // Zeilen des OFFENEN Belegs statt aller Positionen der Installation.
  // BELEGT (2026-08-07) an der ausgelieferten Belegerfassung des Nutzers:
  // { ID: 'POS', ALIAS: 'Belegpositionen', KOPFSATZ_INDEX: 'BEL_0_11', … }.
  // Nur „Andere Datei" fuehrt ihn: ADR/ART/BEL SIND Kopfsaetze, und fuer IDB
  // ist die Form nicht abgelesen — dort wird nicht danach gefragt, statt zu
  // raten (Regel 5).
  //
  // ZWEITE, HAERTERE Folge (belegt 2026-08-11, A/B-Echttest des Nutzers):
  // Quellen dieser Arten stehen in den SEvariablen ZULETZT. Steht ein POS-Loop
  // an ERSTER Stelle, liefert SoftEngine aus KEINER Quelle Daten — auch die
  // Stammtabellen und IDB-Tabellen dahinter bleiben leer. Derselbe Export mit
  // POS am Ende liefert alles. SoftEngine bricht beim ersten gescheiterten Loop
  // offenbar die ganze Liste ab, und ein Kopfsatz-Loop scheitert standalone.
  // Wer eine Art mit `true` ergaenzt, verschiebt sie damit automatisch ans Ende
  // (loopReihenfolge in ./dataSources) — das ist Absicht, kein Nebeneffekt.
  kopfsatzMoeglich: boolean
  // Vorbelegung fuer den Kopfsatz; '' = keine.
  kopfsatzStandard: string
  // Darf diese Art als OFFENER SATZ bestellt werden (VAR-Abschnitt der
  // SEvariablen) statt als Liste (SEFILELOOP)? Der offene Satz ist der eine
  // Datensatz, an dem die Maske haengt — in der Belegerfassung der geoeffnete
  // Beleg samt seiner Adresse.
  //
  // BELEGT (2026-08-07) fuer BEL, ADR und POS: die ausgelieferten Rahmen
  // 00001/00007/00012/00016 und die POS-Masken deklarieren genau diese drei im
  // VAR-Abschnitt. Fuer ART und eigene IDB-Tabellen kommt es in keiner echten
  // Maske vor — dort wird es nicht angeboten, statt zu raten (Regel 5). Wird
  // es irgendwo belegt, ist es eine Zeile hier.
  varMoeglich: boolean
  // Feld-Woerterbuch, das die Art SELBST mitbringt — leer, wo es keins gibt.
  // Erlaubt ist das nur bei Arten mit FESTER Tabellen-ID: dort sind die
  // Positionen SoftEngine-Standard und in jeder Installation dieselben (darum
  // steht auch die ID hier im Code). Fuer eigene IDB-Tabellen waere dasselbe
  // falsch — deren Positionen sind installations-individuell (Regel 5), und
  // genau daran ist der frueher mitgelieferte Startbestand am 2026-07-30
  // gescheitert. Die Klarnamen stammen aus der Maske, die die Felder
  // tatsaechlich BENUTZT, nie aus einer Vermutung.
  standardFelder: readonly ArtFeld[]
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
    kopfsatzMoeglich: false,
    kopfsatzStandard: '',
    varMoeglich: false,
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
    varMoeglich: true,
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
    varMoeglich: false,
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
    varMoeglich: true,
    // Der Satzschluessel steht bewusst VORNE — er ist das Feld, auf das der
    // Kopfsatz der Belegpositionen zeigt ('BEL_0_11'), und in Rahmen00001
    // eroeffnet er die Liste genauso. Ohne ihn kann SoftEngine den Kopfsatz
    // nicht aufloesen und verwirft die Positionen stillschweigend.
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
  // Belegpositionen — die Zeilen des offenen Belegs. Eigene Art statt
  // „Andere Datei" mit dem Kuerzel POS, weil hier ALLES feststeht: die
  // Datei-ID, der Kopfsatz und die Feldpositionen.
  //
  // BELEGT (2026-08-07) an den ausgelieferten Belegerfassungs-Rahmen 00001 /
  // 00007 / 00012 / 00016 und den POS-Masken 01 / 02 des Herstellers:
  //   { ID: 'POS', ALIAS: 'Belegpositionen', KOPFSATZ_INDEX: 'BEL_0_11',
  //     FELDER: '0_1, 1_1, 2_1, 11_6, 17_1, 18_25, 45_60, …' }
  //
  // Vier der 18 Feldpositionen dieser Liste fehlen hier absichtlich: 0_1, 1_1,
  // 128_6 und 888_10 kommen in den echten Masken vor, ihre BEDEUTUNG steht
  // dort aber nirgends. Ein geratener Klarname waere eine Luege im Formular —
  // wer sie braucht, traegt sie mit eigenem Namen nach.
  //
  // ACHTUNG (gemessen 2026-08-07 an der Maske des Nutzers): der Kopfsatz zeigt
  // in den VAR-Abschnitt der SEvariablen (dort steht 'BEL' mit '0_11' als
  // erstem Feld). Solange der Export keinen VAR-Abschnitt schreibt, verwirft
  // SoftEngine den POS-Eintrag STILLSCHWEIGEND — SEDATA.Daten.SEFileLoop kam
  // ohne ihn zurueck. Diese Art ist also gebaut, aber ohne VAR nicht nutzbar.
  belegposition: {
    id: 'belegposition',
    name: 'Belegpositionen',
    tabellenId: 'POS',
    felderEinzeln: true,
    kennungLabel: '',
    kennungBeispiel: '',
    kopfsatzMoeglich: true,
    kopfsatzStandard: 'BEL_0_11',
    // POS/HTML/01 des Herstellers deklariert `VAR: [{ID: 'POS', FELDER: '*'}]`
    // — in einer Positions-Maske IST die Position der offene Satz.
    varMoeglich: true,
    // Reihenfolge = Satz-Reihenfolge. Jeder Klarname stammt aus dem Code der
    // echten Masken, die das Feld benutzen (Belegerfassung-Rahmen 00001 und
    // POS-Maske 01) — kein Name ist geraten.
    standardFelder: [
      // POS/01, GET_RELATION 4232: 2_1 -> Angebot/Auftrag/Lieferschein/…
      { code: '2_1', label: 'Belegart' },
      { code: '3_8', label: 'Belegnummer' },
      { code: '11_6', label: 'Positionsnummer' },
      // Belegerfassung: `if (POS_17_1 == '0')` — nur dann eine Artikelzeile.
      { code: '17_1', label: 'Zeilenart' },
      { code: '18_25', label: 'Artikelnummer' },
      { code: '45_60', label: 'Bezeichnung' },
      { code: '164_8', label: 'Menge' },
      { code: '246_9', label: 'Einzelpreis' },
      { code: '280_12', label: 'Gesamtpreis' },
      { code: '372_5', label: 'MwSt-Satz' },
      // LANGTEXT-Schluessel der Position (POS/01) und Parameter beim Loeschen.
      { code: '645_10', label: 'Satznummer' },
      { code: '689_5', label: 'Mengeneinheit' },
      { code: '1401_12', label: 'Rohertrag' },
      // Belegerfassung: 1 rot, 2 gruen, 3 blau, 4 grau.
      { code: '2558_1', label: 'Farbkennzeichen' },
      { code: '3164_12', label: 'Rabatt' },
    ],
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
    kennungBeispiel: 'SERPOS',
    kopfsatzMoeglich: true,
    kopfsatzStandard: '',
    varMoeglich: false,
    standardFelder: [],
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
