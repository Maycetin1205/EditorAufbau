// dtkImport — liest SoftEngine-IDB-Exporte (.DTK) und macht daraus die
// Rohdaten für Datenquellen-Vorlagen: je Tabelle die Kennung, den Klarnamen
// und die Feldliste (Position_Länge + Klarname) — also genau das, was der
// Bediener sonst Feld für Feld abtippen müsste.
//
// WAS eine DTK ist: „IDB exportieren" der SoftEngine-GUI schreibt eine
// binäre Container-Datei (Seiten à 2048 Bytes), in der die Definitions-
// Sätze als Fixbreiten-TEXT liegen. Vermessen am echten Export einer
// Installation (2026-08-03: 20 Tabellen, ~280 Felder). Die Kundendatei wird
// NICHT eingecheckt (installations-individuelle Daten, Regel 5: solche
// Werte sind DATEN) — der Test baut sich einen kleinen Ausschnitt nach.
//
// Der Leser ist bewusst misstrauisch (Binärdatei!): jeder Fund muss eine
// Selbstprüfung bestehen, Verworfenes fällt über die Soll-Zählung als
// Lücke auf, und der Import-Dialog ZEIGT die Lücke (Regel 4: nichts
// scheitert still). Drei Lesewege sichern sich gegenseitig ab:
//
//   A  @DSATZ-Zeilen — 'IDBID0001_0_55,,0,55,TierArtID,L': sauberes CSV,
//      der Schlüssel wiederholt Position+Länge → Selbstprüfung.
//   B  3,POS-Sätze — die Feld-STAMMSÄTZE, fixbreit, je Feld nummeriert.
//      Echtheitsprüfung: die Tabellen-Kennung steht im Satzkopf doppelt.
//   C  Soll-Zählung — die Stammsatz-Nummern je Tabelle; die Zahl der
//      VERSCHIEDENEN Nummern ist die Soll-Feldzahl. Liegt die Ernte
//      darunter, zeigt der Dialog „N von M gelesen".
//
// WARUM zwei Lesewege nötig sind — die Datei ist ein Palimpsest: sie
// enthält auch ALTE Seitenstände. Belegt am echten Export: @DSATZ von
// ID0003 führte 8 Felder eines früheren Layouts (die Tabelle hat 21),
// ID0004 hatte gar keinen @DSATZ-Block; umgekehrt lag für ID0002 ein
// veralteter Stammsatz ('StallID', Feld 17) neben einem aktuellen Layout.
// Die Zeitstempel der Sätze unterscheiden die Generationen NICHT (alle
// tragen das Exportdatum als Änderungszeit) — darum entscheidet bei
// Widerspruch die Übereinstimmung: bestätigen die Stammsätze das Layout
// mehrheitlich, sind Stammsatz-Extras Altstände (fliegen raus); sonst ist
// das Layout der Altstand (seine Extras fliegen raus). Der Rest ist dem
// Dialog als Soll/Ist-Abweichung sichtbar.
//
// Die 2048er-Seiten zerreißen Sätze mitten im Text: an jeder Seitengrenze
// kann ein 30-Byte-Fortsetzungskopf stehen (0xFA …, zwei 0xFF-Läufe).
// dtkTextAusBytes schneidet diese Köpfe heraus, damit zerrissene Zeilen
// wieder zusammenwachsen („Ge|ändert um" → „Geändert um").

// Ein gelesenes Feld — code ist der Technikwert 'pos_len' (dieselbe Form,
// die das Eingabe-Formular aus Position+Länge baut, s. fieldCode).
export interface DtkFeld {
  code: string
  label: string
}

export interface DtkTabelle {
  // Technikwert in der Form von DataSource.idbId: 'IDBID0001'.
  kennung: string
  // Klarname aus dem Tabellen-Kopfsatz; '' wenn keiner lesbar war.
  name: string
  // Nach Position sortiert — deterministisch, wie das Feld-Wörterbuch.
  felder: DtkFeld[]
  // Soll-Feldzahl laut Nummern-Zählung (0 = keine Stammsätze gefunden).
  soll: number
}

const SEITE = 2048
const KOPF_LAENGE = 30
// Der Fortsetzungskopf sitzt an Byte 2042 jeder 2048er-Seite (vermessen:
// alle Vorkommen liegen auf k*2048+2042).
const KOPF_VERSATZ = 2042

// 0xFA + zwei 0xFF-Läufe an festen Stellen = Fortsetzungskopf. Die Läufe
// sind die Signatur; ein einzelnes 0xFA im Text reicht bewusst nicht.
function istFortsetzungsKopf(bytes: Uint8Array, p: number): boolean {
  if (bytes[p] !== 0xfa) return false
  for (let i = p + 16; i <= p + 20; i++) if (bytes[i] !== 0xff) return false
  for (let i = p + 24; i <= p + 29; i++) if (bytes[i] !== 0xff) return false
  return true
}

// Byte→Zeichen 1:1 (latin1). Bewusst ohne TextDecoder: die Umlaute der
// Feldnamen liegen als einzelne Bytes (ö=0xF6) — die 1:1-Abbildung hält
// sie stabil, und der Test läuft ohne Encoding-Abhängigkeiten.
function latin1(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode(...bytes.subarray(i, Math.min(i + 0x8000, bytes.length)))
  }
  return s
}

// Rohbytes → Text mit herausgeschnittenen Fortsetzungsköpfen.
export function dtkTextAusBytes(bytes: Uint8Array): string {
  const teile: string[] = []
  let start = 0
  for (let p = KOPF_VERSATZ; p + KOPF_LAENGE <= bytes.length; p += SEITE) {
    if (!istFortsetzungsKopf(bytes, p)) continue
    teile.push(latin1(bytes.subarray(start, p)))
    start = p + KOPF_LAENGE
  }
  teile.push(latin1(bytes.subarray(start)))
  return teile.join('')
}

// Zeichen, die in keinem Klarnamen vorkommen: Steuerzeichen, C1-Bereich,
// 0xFF-Füllung. Am RAND eines Fundes sind sie Spaltenrand-Artefakte und
// werden abgestreift (belegt: ein 0x80 vor ' von' im echten Export);
// MITTEN im Fund verraten sie eine zerrissene Stelle → ganz verwerfen.
function istMuellZeichen(c: number): boolean {
  return c < 32 || (c >= 127 && c <= 159) || c === 255
}

function sauberesLabel(roh: string): string {
  let von = 0
  let bis = roh.length
  while (von < bis && istMuellZeichen(roh.charCodeAt(von))) von++
  while (bis > von && istMuellZeichen(roh.charCodeAt(bis - 1))) bis--
  const t = roh.slice(von, bis).trim()
  if (t === '' || t.length > 60) return ''
  for (let i = 0; i < t.length; i++) {
    if (istMuellZeichen(t.charCodeAt(i))) return ''
  }
  // Satzart-Fragmente ('1,@KARTEI,…') sehen wie Text aus, sind aber Keys.
  if (t.includes('@') || /^\d+,/.test(t)) return ''
  return t
}

interface RohFeld {
  pos: number
  len: number
  label: string
}

const codeVon = (f: RohFeld) => `${f.pos}_${f.len}`

// --- Leseweg A: @DSATZ-Zeilen ------------------------------------------
// Zwei belegte Formen (zweite Spalte leer oder Satznummer, dahinter ggf.
// weitere Spalten): 'IDBID0001_0_55,,0,55,TierArtID,L' und
// 'IDBID0002_0_30,1002,0,30,Tierart,L,a001,000000'. Selbstprüfung: die
// pos/len aus dem Schlüssel MÜSSEN den Spalten 3+4 gleichen — eine von
// einer Seitengrenze zerrissene Zeile fällt hier durch.
const DSATZ_ZEILE =
  /IDB(ID\d{4})_(\d+)_(\d+),(\d*),(\d+),(\d+),([^,\r\n]+),([A-Z]{1,4}\d?)/g

function ernteDsatz(text: string): Map<string, Map<string, RohFeld>> {
  const tabellen = new Map<string, Map<string, RohFeld>>()
  for (const m of text.matchAll(DSATZ_ZEILE)) {
    if (m[2] !== m[5] || m[3] !== m[6]) continue
    const label = sauberesLabel(m[7])
    if (label === '') continue
    const feld = { pos: Number(m[5]), len: Number(m[6]), label }
    let felder = tabellen.get(m[1])
    if (!felder) {
      felder = new Map()
      tabellen.set(m[1], felder)
    }
    if (!felder.has(codeVon(feld))) felder.set(codeVon(feld), feld)
  }
  return tabellen
}

// --- Leseweg B: 3,POS-Feldstammsätze -----------------------------------
// Satzkopf: '3,POS,ID0003,' + rechtsbündige Feldnummer (Breite 10) + ~57
// Leerzeichen + die Kennung NOCH EINMAL. Die Wiederholung unterscheidet
// echte Sätze von den Verzeichnis-Einträgen, die dieselben Schlüssel
// tragen, aber Binärdaten dahinter.
const POS_SATZ = /3,POS,(ID\d{4}), {5,9}(\d{1,4}) {50,64}\1/g

// Im Satz: großer Leerlauf, dann Klarname (Breite ~40), dann Position
// (rechtsbündig, bei Position 0 LEER) + Länge + Feld-Art. Beispiele:
//   'Speicherfähig <28sp> 409   1AJN'   → pos 409, len 1
//   'Artikelnummer <33sp> 25L'          → pos 0 (leer), len 25
// Der Leerlauf davor (>=100) ist Teil der Prüfung: Verzeichnis-Reste haben
// ihn nicht. Die Feld-Art ('L', 'R0', 'ANJ' …) wird mitgelesen, aber nicht
// übernommen — der Editor kennt bewusst keine Feld-Art (2026-07-27).
const FELD_IM_POS_SATZ =
  / {100,}(\S[^\r\n]{0,49}?) {2,}(?:(\d{1,4}) +)?(\d{1,4})([A-Z]{1,4}\d?)(?=[ \r\n])/

// Hinter der Feld-Art folgen Steuer-Flags mit einem J/N-Paar ('NN', 'NJ',
// '00NJ' …) — als Plausibilitätsanker Pflicht, sonst Fund verwerfen.
const FLAGS_DANACH = /[NJ]{2}/

const SATZ_FENSTER = 1300

// Je Tabelle KEYED NACH FELDNUMMER: dieselbe Nummer kann in alten
// Seitenständen mehrfach vorliegen — ein Feld pro Nummer, erster sauberer
// Fund gewinnt (einen besseren Schiedsrichter gibt die Datei nicht her,
// s. Kopfkommentar zu den Zeitstempeln).
function erntePosSaetze(text: string): Map<string, Map<number, RohFeld>> {
  const tabellen = new Map<string, Map<number, RohFeld>>()
  for (const satz of text.matchAll(POS_SATZ)) {
    if (satz.index === undefined) continue
    const nummer = Number(satz[2])
    const felder = tabellen.get(satz[1])
    if (felder?.has(nummer)) continue
    const fenster = text.slice(satz.index, satz.index + SATZ_FENSTER)
    const m = FELD_IM_POS_SATZ.exec(fenster)
    if (!m || m.index === undefined) continue
    const label = sauberesLabel(m[1])
    if (label === '') continue
    const pos = Number(m[2] ?? 0)
    const len = Number(m[3])
    if (len < 1 || pos > 9999) continue
    const dahinter = fenster.slice(m.index + m[0].length, m.index + m[0].length + 60)
    if (!FLAGS_DANACH.test(dahinter)) continue
    const ziel = felder ?? new Map<number, RohFeld>()
    if (!felder) tabellen.set(satz[1], ziel)
    ziel.set(nummer, { pos, len, label })
  }
  return tabellen
}

// --- Leseweg C: Soll-Zählung -------------------------------------------
// Jede Feldnummer je Tabelle nur einmal zählen — die Schlüssel stehen auch
// in Verzeichnis-Seiten, deshalb Set statt Zähler.
const POS_NUMMER = /3,POS,(ID\d{4}), {5,9}(\d{1,4})/g

function sollZahlen(text: string): Map<string, number> {
  const nummern = new Map<string, Set<number>>()
  for (const m of text.matchAll(POS_NUMMER)) {
    let s = nummern.get(m[1])
    if (!s) {
      s = new Set()
      nummern.set(m[1], s)
    }
    s.add(Number(m[2]))
  }
  return new Map([...nummern].map(([id, s]) => [id, s.size]))
}

// --- Tabellen-Klarnamen aus den Kopfsätzen ------------------------------
// '0,ID0002 … VET … Tierart  00008.01.201514:41…': der Klarname ist das
// letzte Textfeld vor dem ersten Zeitstempel. Die 58er-Deckelung erledigt
// das von selbst: frühere Spalten (Kennung, Gruppe) liegen zu weit vom
// Zeitstempel weg, um in EIN Fangfenster zu passen. Kopfsätze kommen
// mehrfach vor (auch zerrissen) — der erste saubere Fund gewinnt.
const KOPFSATZ = /0,(ID\d{4}) {2,}/g
const NAME_VOR_ZEIT = / {2,}(\S[^\r\n]{0,58}?) {2,}\d{5}\.\d{2}\.\d{4}/

function tabellenNamen(text: string): Map<string, string> {
  const namen = new Map<string, string>()
  for (const m of text.matchAll(KOPFSATZ)) {
    if (m.index === undefined || namen.has(m[1])) continue
    const fenster = text.slice(m.index, m.index + 500)
    const name = sauberesLabel(NAME_VOR_ZEIT.exec(fenster)?.[1] ?? '')
    if (name !== '' && !/^ID\d{4}$/.test(name)) namen.set(m[1], name)
  }
  return namen
}

// --- Zusammenführen der Lesewege ----------------------------------------
// Normalfall: A und B beschreiben dieselben Felder; vereinigt nach code,
// A-Klarname gewinnt (die CSV-Zeilen sind die sauberere Quelle).
// Palimpsest-Fall (Vereinigung ÜBER dem Soll): eine der beiden Quellen
// ist ein Altstand — welche, sagt die Übereinstimmung (s. Kopfkommentar).
function fuegeZusammen(
  a: Map<string, RohFeld> | undefined,
  b: Map<number, RohFeld> | undefined,
  soll: number,
): RohFeld[] {
  const aFelder = [...(a?.values() ?? [])]
  const bFelder = [...(b?.values() ?? [])]
  const aCodes = new Set(aFelder.map(codeVon))
  const bCodes = new Set(bFelder.map(codeVon))

  const vereinigt = new Map<string, RohFeld>()
  for (const f of [...aFelder, ...bFelder]) {
    if (!vereinigt.has(codeVon(f))) vereinigt.set(codeVon(f), f)
  }

  if (soll > 0 && vereinigt.size > soll) {
    const bestaetigt = [...bCodes].filter((c) => aCodes.has(c)).length
    if (bestaetigt * 2 >= bCodes.size) {
      // Die Stammsätze bestätigen das Layout mehrheitlich → die B-Extras
      // sind Altstände (Fall ID0002: 'StallID' neben aktuellem Layout).
      return aFelder
    }
    // Die Stammsätze widersprechen dem Layout → das LAYOUT ist der
    // Altstand (Fall ID0003: 8 Felder von früher neben 21 echten).
    return bFelder
  }
  return [...vereinigt.values()]
}

// --- Zusammenbau ---------------------------------------------------------

export function parseDtk(text: string): DtkTabelle[] {
  const a = ernteDsatz(text)
  const b = erntePosSaetze(text)
  const soll = sollZahlen(text)
  const namen = tabellenNamen(text)

  const ids = new Set([...a.keys(), ...b.keys(), ...soll.keys()])
  const raus: DtkTabelle[] = []
  for (const id of [...ids].sort()) {
    const sollZahl = soll.get(id) ?? 0
    const felder = fuegeZusammen(a.get(id), b.get(id), sollZahl).sort(
      (x, y) => x.pos - y.pos || x.len - y.len,
    )
    // Weder Felder noch Stammsätze: kein brauchbarer Fund, nicht anbieten.
    if (felder.length === 0 && sollZahl === 0) continue
    raus.push({
      kennung: `IDB${id}`,
      name: namen.get(id) ?? '',
      felder: felder.map((f) => ({ code: codeVon(f), label: f.label })),
      soll: sollZahl,
    })
  }
  return raus
}

// Der eine Aufruf für die Oberfläche: Datei-Bytes rein, Tabellen raus.
export function parseDtkBytes(bytes: Uint8Array): DtkTabelle[] {
  return parseDtk(dtkTextAusBytes(bytes))
}
