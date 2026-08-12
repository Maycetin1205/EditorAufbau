// dataSources
// Datenquellen sind eigenständige, benannte VORLAGEN
// einmal definiert, in jeder Maske wiederverwendbar. Aus ihnen wird
// die SEvariablen-JSON des Exports erzeugt (SEFILELOOP) — nie von Hand.
//
// VERBINDLICHE QUELLE (korrigiert 2026-07-07): die FELD-Map der echten,
// live getesteten Behandlung-Maske — Repo `behandlung-umbau`,
// `behandlung/index.basis.source.html` (Block "SE-ADAPTER", `var FELD`) +
// `behandlung/SE-INVENTAR.md` §6/§11: "Die FELDER-Strings (pos_len) sind
// echte SE-Datenkontrakte". Die früheren Codes/IDB-IDs stammten aus den
// Dashboard-Prototypen dieses Repos und waren teilweise FALSCH
// (Terminplaner ist IDBID0001, nicht 0005; Kundenhaustiere IDBID0004,
// nicht 0009). TODO_-Platzhalter der Vorlagen werden nie übernommen.
//
// Regel Technikwert ≠ Anzeigename: `id`, `idbId`, `code` und `indexField`
// sind Technikwerte und erscheinen NIE sichtbar in der Maske; der Bediener
// sieht ausschließlich `name` und `label`. Erzwungen wird das beim EINGEBEN
// (DataSourceForm: „Klarname darf kein Feldcode sein", Klarname darf nicht
// leer sein) und beim LADEN (sanitizeDataSources wirft Felder ohne label
// weg). Bis 2026-07-30 prüfte dataSources.test.ts zusätzlich den
// mitgelieferten Startbestand — den gibt es nicht mehr, die Prüfung ist mit
// ihm entfallen.

// Quellen-ARTEN (Nutzer-Klarstellung 2026-07-07): nicht nur
// IDB-Tabellen — auch Adressstamm, Artikelstamm, Belege. Die Art bestimmt
// die SEvariablen-Form; sie und ihre Eigenschaften wohnen seit 2026-07-30
// als TABELLE in `quellenArten.ts` (vorher als `kind === 'idb'`-Weichen
// ueber sechs Stellen verstreut). Beleg fuer die Formen: behandlung-umbau
// empfang/index.basis.SEvariablen.json ({ ID: 'ADR', FELDER: '2_8,…' } /
// { ID: 'BEL', FELDER: '1_1,…' } / { ID: 'IDBID0001', FELDER: '*' }; ART
// analog in behandlung/).

import { QUELLEN_TRENNER } from '../blocks/BlockDefinition'
import type { EintragProblem } from './ladeProblem'
import { pruefeLadeRelation, type LadeRelation } from './ladeRelation'
import {
  artFuer,
  DATA_SOURCE_KINDS,
  QUELLEN_ARTEN,
  type DataSourceKind,
} from './quellenArten'

// Weitergereicht, damit die Quellen-Welt EINE Anlaufstelle bleibt: wer mit
// Datenquellen arbeitet, importiert aus dataSources — die Arten-Tabelle
// und das Hol-Modul selbst muss er nicht kennen.
export { artFuer, DATA_SOURCE_KINDS, QUELLEN_ARTEN, type DataSourceKind }
export {
  felderHinterSchnitt,
  LADE_RELATION_STANDARD,
  ladeRelationFor,
  relationNrFromInput,
  type LadeRelation,
} from './ladeRelation'

// Eine FELD-ART (Text/Zahl/Datum/Uhrzeit) gab es hier am 2026-07-27 einen
// halben Tag lang: sie sollte „Tag filtern nach" auf Datumsfelder verengen.
// Wieder entfernt am selben Tag (Nutzer-Entscheidung) — der Bediener kennt
// seine Felder und waehlt selbst; die Art zwang ihn nur, jedes Bestandsfeld
// nachzupflegen, bevor die Auswahl ueberhaupt etwas anbot. Bindbare Stellen
// zeigen darum ausnahmslos ALLE Felder der Quelle.
export interface DataSourceField {
  // Technikwert: direkter Property-Name im Datensatz ODER 'pos_len'
  // (Position_Länge im SATZ, z. B. '193_30').
  code: string
  // Klarname für den Bediener (z. B. 'Vorname'). Er ist zugleich die
  // Vorschau des Editors: eine gebundene Stelle zeigt den Klarnamen —
  // erfundene Beispielwerte gibt es NICHT (Nutzer-Entscheidung 2026-07-10,
  // ersetzt das sample-Feld aus).
  label: string
}

export interface DataSource {
  // Stabiler Technikwert — Blöcke referenzieren ihn in ihrer source-Prop.
  id: string
  // Anzeigename der Vorlage; wird im Export zum SEFILELOOP-ALIAS.
  name: string
  // Art der Quelle (bestimmt Tabellen-ID + FELDER-Form, s. o.).
  kind: DataSourceKind
  // Die EINGEGEBENE SoftEngine-Kennung, z. B. 'IDBID0001', 'IDBSE0880' oder
  // 'POS' — nur bei Arten ohne feste Kennung (Stammtabellen haben eine, s.
  // tableIdFor). Der Name `idbId` ist historisch: das Feld trug erst nur
  // IDB-IDs. Umbenennen würde die Maskendatei ändern, darum steht es hier
  // als Notiz statt als Umbau.
  idbId?: string
  // Feldcode der Datensatz-Nummer (pindex) — braucht der Schreibweg:
  // PUT_RELATION adressiert den Satz über diese Nummer. Kein Anzeige-Feld.
  indexField?: string
  // KOPFSATZ_INDEX der SEFILELOOP: an WELCHEN Satz die Zeilen hängen, in
  // SoftEngine-Form 'KÜRZEL_pos_len' — 'BEL_0_11' heißt „der offene Beleg,
  // ab Zeichen 0, 11 Zeichen lang". Damit schickt SoftEngine die Positionen
  // DIESES Belegs statt aller Positionen der Installation. Nur Arten mit
  // kopfsatzMoeglich führen ihn (s. quellenArten); leer = die Datei kommt
  // ohne Kopfsatz. Technikwert, nie sichtbar.
  kopfsatzIndex?: string
  // Liefert SoftEngine ALLE Sätze dieser Datei oder nur den EINEN, an dem die
  // Maske hängt? 'liste' (Standard, auch wenn nichts dasteht) = SEFILELOOP.
  // 'offenerSatz' = VAR-Abschnitt: der geöffnete Beleg, seine Adresse, die
  // angefasste Position. Erlaubt nur, wo die Art es führt (varMoeglich).
  lieferung?: 'liste' | 'offenerSatz'
  // Zeilen per Relation HOLEN statt geschoben bekommen (Welle R): die
  // laufende Maske fragt selbst, sobald die Geber-Quelle eine Zeile wählt.
  // Nur Arten mit relationLadenMoeglich führen sie (ladeRelationFor) — eine
  // holende Quelle bestellt bei SoftEngine nichts (exportMask).
  ladeRelation?: LadeRelation
  // Feld-Wörterbuch der Tabelle, in SATZ-Reihenfolge (deterministisch).
  fields: readonly DataSourceField[]
}

// Kommt diese Quelle als EIN offener Satz (VAR) statt als Liste (SEFILELOOP)?
// Die Art-Abfrage steckt mit drin — aus demselben Grund wie bei kopfsatzFor:
// wechselt der Bediener die Art, bleibt die alte Einstellung in der Datei
// stehen und dürfte den Export nicht mehr beeinflussen.
export function istOffenerSatz(source: DataSource): boolean {
  return artFuer(source.kind).varMoeglich && source.lieferung === 'offenerSatz'
}

// SoftEngine-Tabellen-ID einer Quelle: die feste ID der Art — und wo die
// Art keine hat (eigene Tabellen), die eingegebene IDB-ID.
export function tableIdFor(source: DataSource): string {
  const feste = artFuer(source.kind).tabellenId
  return feste === '' ? (source.idbId ?? '') : feste
}

// Die einzige BELEGTE Form eines Eintrags in einer expliziten FELDER-Liste:
// Position_Länge. So steht es an jeder Stamm-Quelle der Chef-Masken ('2_8',
// '3292_30', …) und am POS-Loop von docs/chef-maske/JsonBeleg.json. Ein
// Feldcode darf laut DataSourceField auch ein direkter Property-Name sein —
// für den ist die Listen-Form nirgends belegt, und geraten wird nicht (Regel 5).
const POS_LEN = /^\d+_\d+$/

// FELDER-Eintrag der SEFILELOOP — DIE eine Stelle, die entscheidet, was eine
// Quelle bei SoftEngine bestellt.
//
// Zwei Wege, nach Quellen-ART:
//   - Art bestellt EINZELN (Stammtabellen, POS, andere Dateien): ihr ganzes
//     Feld-Wörterbuch, Reihenfolge = Wörterbuch. Unverändert — diese Form ist
//     an echten Masken belegt, und sie zu beschneiden wäre eine zweite
//     Änderung ohne Auftrag.
//   - Art bestellt SAMMEL (IDB): bis 2026-08-11 immer '*'. Jetzt die explizite
//     Liste der BENUTZTEN Felder, wenn `benutzt` sie nennt.
//
// WARUM (Nutzer-Log 2026-08-11): SoftEngine macht für JEDEN gelieferten Wert
// einen Bild-Nachschlag (GET_RELATION 1911) — Maske öffnen = 5 953 Aufrufe in
// 9,2 s. Die SE-Seite können wir nicht ändern, die Menge liefert unsere
// Bestellung.
//
// ⚠ KONTRAKT-EHRLICHKEIT: für IDB ist die explizite Liste NIRGENDS belegt —
// beide Chef-Masken führen IDB mit '*'. Belegt sind nur die FORM (s. POS_LEN)
// und dass die Zeilen-Schlüssel pos_len tragen ('IDBID0001_253_30', softengine/
// data getField). Es entscheidet der SE-Echttest; schlägt er fehl, wird die
// Änderung zurückgenommen statt nachgebessert.
//
// `benutzt` = die Feldcodes, die diese Maske aus der Quelle liest oder schreibt
// (export/benutzteQuellen, benutzteFelderJeQuelle). Fehlt das Argument, bleibt
// es bei '*' — Aufrufer ohne Baumwissen sollen nicht raten müssen.
//
// `holSchluessel` = die Feldcodes, die eine HOLENDE Quelle (Welle R) aus einer
// Zeile DIESER Quelle als Schlüssel liest (export/benutzteQuellen,
// holSchluesselJeGeber). Sie stehen in keinem Attribut des Baums, sondern in
// der Einstellung der anderen Quelle — ohne sie schickt SoftEngine die Werte
// nie mit, der Schlüssel geht halb leer hinaus und die Relation findet nur den
// aktuellen Nummernkreis (SE-Echttest 2026-08-12: 261er-Belege lieferten
// nichts). Sie stehen HINTEN, damit eine Maske ohne holende Quelle Byte für
// Byte bestellt wie vorher.
export function felderFor(
  source: DataSource,
  benutzt?: ReadonlySet<string>,
  holSchluessel: readonly string[] = [],
): string {
  const mitSchluesseln = (codes: string[]): string[] => {
    for (const code of holSchluessel) {
      if (!codes.includes(code)) codes.push(code)
    }
    return codes
  }
  if (artFuer(source.kind).felderEinzeln) {
    return mitSchluesseln(source.fields.map((f) => f.code)).join(',')
  }
  // Nichts gefunden: '*' bleiben — das liefert ohnehin ALLES, auch die
  // Schlüsselfelder einer Hol-Relation. Eine leere FELDER-Liste ist keine belegte
  // Form, und eine Quelle, aus der die Maske nachweislich kein Feld liest,
  // bringt beim Kürzen ohnehin nichts ein — dann lieber der alte Zustand als
  // eine Bestellung, die auf einem Leser beruht, den ich übersehen haben
  // könnte (Sicherheitsventil).
  if (!benutzt || benutzt.size === 0) return '*'
  // Die Datensatz-Nummer liest die Laufzeit IMMER, wenn die Quelle eine führt
  // (pindex für Schreibwege: kanban/seRuntime, feldRuntime, resolveActionParam).
  // Sie steht vorne wie in den echten Listen — der POS-Loop beginnt mit '0_1',
  // das BEL-VAR mit '0_11'.
  const index = (source.indexField ?? '').trim()
  const codes = index === '' ? [] : [index]
  // Danach die benutzten Felder in Wörterbuch-Reihenfolge (dieselbe Regel wie
  // beim Einzel-Weg oben), zuletzt benutzte Codes, die im Wörterbuch nicht
  // (mehr) stehen — eine ins Leere zeigende Bindung. Sie mitzubestellen kostet
  // ein Feld und hält die Liste deterministisch.
  for (const f of source.fields) {
    if (benutzt.has(f.code) && !codes.includes(f.code)) codes.push(f.code)
  }
  for (const code of benutzt) {
    if (!codes.includes(code)) codes.push(code)
  }
  // Zuletzt die Schlüssel, die eine holende Quelle aus dieser Zeile liest.
  mitSchluesseln(codes)
  // Sicherheitsventil: sobald EIN Code sich nicht als pos_len ausdrücken lässt,
  // ist die ganze Bestellung unbelegt — dann '*'. Lieber die alte Datenmenge
  // als eine Stelle, die in der fertigen Maske still leer bleibt.
  return codes.every((code) => POS_LEN.test(code)) ? codes.join(',') : '*'
}

// Die REIHENFOLGE, in der die Quellen in den SEvariablen stehen dürfen.
//
// ⚠ Das ist ein SE-Kontrakt, kein Geschmack. BELEGT am 2026-08-11 durch einen
// A/B-Echttest des Nutzers mit derselben Maske: steht der POS-Loop
// (Belegpositionen) an ERSTER Stelle, liefert SoftEngine aus KEINER Quelle
// Daten — auch die Stammtabellen und IDB-Tabellen dahinter bleiben leer.
// Dieselbe Datei mit POS an LETZTER Stelle: alle Quellen liefern. Erklärung:
// ein Kopfsatz-Loop scheitert standalone, und SoftEngine bricht beim ersten
// gescheiterten Loop offenbar die ganze Liste ab.
//
// Bis dahin schrieb der Export die Einträge in Baum- bzw. Anlege-Reihenfolge —
// wer POS zuerst anlegte, bekam eine Maske, in der GAR NICHTS ankam. Ohne
// Fehlermeldung, ohne Zusammenhang zur eigentlichen Ursache.
//
// Nach vorne kommt also, was allein bestehen kann; ans Ende, was unter einem
// anderen Satz hängt. WELCHE Arten das sind, sagt die Arten-Tabelle
// (kopfsatzMoeglich) — hier steht kein `if ID === 'POS'` (Regel 2). Innerhalb
// beider Gruppen bleibt die bisherige Reihenfolge erhalten (stabile Teilung als
// zwei Eimer, nicht als Sortierung — so ist die Stabilität sichtbar und nicht
// bloß von der Sort-Implementierung geliehen): eine Maske ohne
// Kopfsatz-Quelle exportiert Byte für Byte wie vorher.
//
// Die Bibliothek selbst wird NICHT umsortiert — das hier formt nur die Ausgabe.
export function loopReihenfolge(sources: readonly DataSource[]): DataSource[] {
  const alleinstehend: DataSource[] = []
  const unterKopfsatz: DataSource[] = []
  for (const source of sources) {
    if (artFuer(source.kind).kopfsatzMoeglich) unterKopfsatz.push(source)
    else alleinstehend.push(source)
  }
  return [...alleinstehend, ...unterKopfsatz]
}

// Der KOPFSATZ_INDEX, den der Export schreiben darf — leer heißt „Schlüssel
// weglassen". Die Art-Abfrage gehört HIERHER und nicht in den Export: wechselt
// der Bediener die Art einer bestehenden Quelle, bleibt der alte Wert in der
// Maskendatei stehen und ginge sonst still mit hinaus.
export function kopfsatzFor(source: DataSource): string {
  if (!artFuer(source.kind).kopfsatzMoeglich) return ''
  return (source.kopfsatzIndex ?? '').trim()
}

// Der VAR-Abschnitt der SEvariablen, abgeleitet aus den Kopfsätzen.
//
// WARUM abgeleitet und nicht eingestellt: ein KOPFSATZ_INDEX 'BEL_0_11' zeigt
// auf eine Variable namens BEL. Gibt es die nicht, löst SoftEngine den Kopfsatz
// nicht auf und verwirft die ganze SEFILELOOP-Zeile STILLSCHWEIGEND — die
// Tabelle bleibt leer, ohne Fehler. Gemessen an der Maske des Nutzers
// (2026-08-07, drei Echttests: ohne VAR jedes Mal leer; von Hand ergänztes VAR
// mit expliziter Feldliste ließ die Positionen kommen). Es gibt hier also
// nichts zu wählen: wer einen Kopfsatz schreibt, BRAUCHT den Eintrag. Ein
// Häkchen im Formular wäre nur eine Gelegenheit, die Maske kaputt zu machen.
//
// Form nach dem ausgelieferten Rahmen00001 der Belegerfassung:
//   VAR: [{ ID: 'BEL', FELDER: '0_11, 0_1, 2_1, …' }]
// Bestellt wird nur das Feld, auf das der Kopfsatz zeigt — mehr ist für die
// Auflösung nicht belegt, und Bestellen auf Verdacht ist Raten (Regel 5/10).
//
// Reihenfolge = Reihenfolge der Quellen, Felder in Reihenfolge des Auftretens;
// zwei Quellen am selben Kopfsatz ergeben EINEN Eintrag. Keine Kopfsätze =
// leere Liste (der Export lässt den Schlüssel dann ganz weg).
export function varAusKopfsaetzen(
  sources: readonly DataSource[],
): { ID: string; FELDER: string }[] {
  const proId = new Map<string, string[]>()
  for (const s of sources) {
    const kopfsatz = kopfsatzFor(s)
    if (kopfsatz === '') continue
    // 'BEL_0_11' -> ID 'BEL', Feld '0_11'. Die Form ist beim Eintippen geprüft
    // (kopfsatzFromInput), ein Wert ohne sie kommt hier nicht an.
    const teile = /^([A-Za-z][A-Za-z0-9]*)_(\d+_\d+)$/.exec(kopfsatz)
    if (!teile) continue
    const felder = proId.get(teile[1]) ?? []
    if (!felder.includes(teile[2])) felder.push(teile[2])
    proId.set(teile[1], felder)
  }
  return [...proId].map(([ID, felder]) => ({ ID, FELDER: felder.join(',') }))
}

// KEIN mitgelieferter Startbestand mehr (Nutzer-Entscheidung 2026-07-30:
// „Raus, leer starten").
//
// Hier standen zwei fertige Quellen — Terminplaner IDBID0001 und
// Kundenhaustiere IDBID0004 mit 21 Feldcodes. Das war die Wahrheit EINER
// Installation, festgeschrieben im Code, und damit genau das, was Regel 5
// verbietet: Feldpositionen und Tabellen-Kennungen sind installations-
// individuelle DATEN. In einer zweiten Installation waren sie schlicht
// falsch — und sahen trotzdem richtig aus.
//
// Ersatz gibt es KEINEN: der Bediener legt seine Quellen selbst an und
// trägt die Felder Zeile für Zeile ein. Eine Abkürzung („Liste einfügen":
// den FELDER-Text einer laufenden Maske hineinkippen) stand am selben Tag
// eine Stunde da und ist auf Nutzer-Ansage restlos entfernt — nicht ohne
// neue Entscheidung wieder einbauen.
//
// Der Store startet darum leer; bestehende Bibliotheken bleiben unberührt
// (localStorage + Maskendatei tragen sie).

// ---------- Pure Helfer für das Eingabe-Formular ----------
// Regel Technikwert ≠ Anzeigename: der Bediener gibt Klarname + Position +
// Länge bzw. die IDB-ID im SoftEngine-Format ('ID0004') ein — die
// Technikwerte ('pos_len', 'IDBIDnnnn') entstehen daraus unsichtbar.
// Ungültige Eingaben ergeben '' (das Formular zeigt dann einen Fehler,
// es wird nie geraten).

// Position + Länge -> Feldcode: ('193', '30') -> '193_30'. Position darf 0
// sein (Datensatz-Nummer '0_10'), Länge muss mindestens 1 sein.
export function fieldCode(pos: string, len: string): string {
  const p = pos.trim()
  const l = len.trim()
  if (!/^\d+$/.test(p) || !/^\d+$/.test(l) || Number(l) < 1) return ''
  return `${p}_${l}`
}

// Eingegebene Kennung -> Technikwert, für jede Art, die keine feste hat.
//
// Zwei Formen, und die zweite fehlte bis 2026-07-30:
//   1. Die IDB-Kurzform, die der Bediener in der SoftEngine-GUI sieht:
//      'ID0004' (auch klein, auch schon mit IDB davor) -> 'IDBID0004',
//      Ziffern auf vier Stellen aufgefüllt.
//   2. Jede andere Kennung WÖRTLICH: 'IDBSE0880', 'POS', 'SERPOS',
//      'JSDDWZE05'. Vorher fielen genau diese durch — die Prüfung kannte nur
//      Form 1 und meldete „IDB-ID fehlt", obwohl es die Tabelle wirklich
//      gibt (belegt in den 129 ausgelieferten SEvariablen-Dateien des
//      Herstellers). Solche Tabellen waren im Editor nicht anlegbar.
//
// Ungültige Eingaben ergeben '' (das Formular zeigt dann einen Fehler); ein
// Feldcode wie '2_8' ist keine Kennung und fällt durch, weil eine Kennung
// mit einem Buchstaben beginnt.
const KENNUNG_IDB_KURZ = /^(?:IDB)?ID(\d{1,4})$/i
const KENNUNG_FREI = /^[A-Za-z][A-Za-z0-9]*$/

export function kennungFromInput(raw: string): string {
  const t = raw.trim()
  const kurz = KENNUNG_IDB_KURZ.exec(t)
  if (kurz) return `IDBID${kurz[1].padStart(4, '0')}`
  return KENNUNG_FREI.test(t) ? t : ''
}

// Eingegebener Kopfsatz -> Technikwert. Die Form ist die der ausgelieferten
// Belegerfassung: Kürzel, Position, Länge ('BEL_0_11'). Alles andere ergibt ''
// (das Formular zeigt dann einen Fehler) — ein Tippfehler hier wäre sonst eine
// Maske, die klaglos die Positionen ALLER Belege zieht.
const KOPFSATZ_FORM = /^[A-Za-z][A-Za-z0-9]*_\d+_\d+$/

export function kopfsatzFromInput(raw: string): string {
  const t = raw.trim()
  return KOPFSATZ_FORM.test(t) ? t : ''
}

// Rückweg fürs Bearbeiten/Anzeigen: 'IDBID0004' -> 'ID0004' (die Kurzform,
// die der Bediener kennt); alles andere bleibt, wie es ist.
export function kennungAnzeige(kennung: string | undefined): string {
  const m = /^IDB(ID\d{4})$/.exec(kennung ?? '')
  return m ? m[1] : (kennung ?? '')
}

// Die SoftEngine-Kennung einer Quelle in BEDIENER-Form — fuer die dezente
// Technik-Marke neben dem Klarnamen (Nutzer-Wunsch 2026-08-06: „nicht nur
// der Alias, auch die ID0001"): die feste Tabellen-ID der Art (ADR/ART/BEL)
// oder die eingegebene Kennung in Kurzform (ID0001, POS, …). EINE Stelle —
// vorher stand dieselbe Ableitung lokal im DatenquellenBereich.
export function quellenKennung(source: DataSource): string {
  const feste = artFuer(source.kind).tabellenId
  return feste !== '' ? feste : kennungAnzeige(source.idbId)
}

// Baut aus rohen (evtl. kaputten) localStorage-Daten eine saubere
// Vorlagen-Liste (Muster: sanitizeTree in Editor.ts — strukturell prüfen,
// Unbrauchbares verwerfen, nie raten). Inhaltliche Regeln (Klarname kein
// Feldcode usw.) erzwingt das Eingabe-Formular, nicht der Lader — gespeicherte
// Nutzerdaten werden hier nicht umgeschrieben.
export function sanitizeDataSources(raw: unknown): DataSource[] {
  return pruefeDatenquellen(raw).liste
}

// Dieselbe Bereinigung, aber sie sagt auch, WAS sie nicht uebernehmen konnte
// (A4). Zusaetzlich, nicht anders: `sanitizeDataSources` oben liefert
// unveraendert dieselbe Liste wie vorher, alle bestehenden Aufrufer bleiben.
// Wer LADET, nimmt diese Fassung — ein verworfener Eintrag darf nicht mehr
// still verschwinden.
export function pruefeDatenquellen(
  raw: unknown,
): { liste: DataSource[]; probleme: EintragProblem[] } {
  const probleme: EintragProblem[] = []
  if (!Array.isArray(raw)) return { liste: [], probleme }
  const acc: DataSource[] = []
  const seen = new Set<string>()
  let nr = 0
  for (const entry of raw) {
    nr++
    // Die Stelle: die id, wo es eine gibt — sonst die Position in der Liste.
    const stelle = entry && typeof entry === 'object'
      && typeof (entry as Record<string, unknown>).id === 'string'
      && (entry as Record<string, unknown>).id !== ''
      ? (entry as Record<string, unknown>).id as string
      : `Eintrag ${nr}`
    const weg = (grund: string): void => { probleme.push({ stelle, grund }) }
    if (!entry || typeof entry !== 'object') {
      weg('die Datenquelle ist unlesbar')
      continue
    }
    const e = entry as Record<string, unknown>
    if (typeof e.id !== 'string' || e.id === '') {
      weg('der Datenquelle fehlt ihre Kennung')
      continue
    }
    if (seen.has(e.id)) {
      weg('diese Kennung kommt zweimal vor')
      continue
    }
    // Der Trenner der qualifizierten Bindung (QUELLEN_TRENNER, s.
    // BlockDefinition) darf in einer Quellen-id nicht vorkommen — sonst waere
    // 'a::b::128_350' mehrdeutig. Beim Anlegen kann das nicht passieren
    // (crypto.randomUUID), wohl aber in einer von Hand bearbeiteten Datei.
    // Eindeutigkeit wird hier an der Quelle garantiert, statt beim Lesen
    // erraten zu werden.
    if (e.id.includes(QUELLEN_TRENNER)) {
      weg(`die Kennung enthält „${QUELLEN_TRENNER}" und wäre damit mehrdeutig`)
      continue
    }
    if (typeof e.name !== 'string' || e.name.trim() === '') {
      weg('der Klarname fehlt')
      continue
    }
    if (typeof e.kind !== 'string' || !DATA_SOURCE_KINDS.includes(e.kind as DataSourceKind)) {
      weg('die Art der Datenquelle fehlt oder ist unbekannt')
      continue
    }
    const fields: DataSourceField[] = []
    let feldNr = 0
    for (const f of Array.isArray(e.fields) ? e.fields : []) {
      feldNr++
      const feldWeg = (grund: string): void => {
        probleme.push({ stelle: `${stelle} · Feld ${feldNr}`, grund })
      }
      if (!f || typeof f !== 'object') {
        feldWeg('das Feld ist unlesbar')
        continue
      }
      const ff = f as Record<string, unknown>
      if (typeof ff.code !== 'string' || ff.code === '') {
        feldWeg('dem Feld fehlt sein Feldcode')
        continue
      }
      // Gleicher Grund wie bei der id: ein Feldcode mit Trenner machte die
      // qualifizierte Bindung mehrdeutig, und sie faellt dann still auf
      // „nicht gebunden" zurueck. Echte SE-Feldcodes ('193_30') koennen ihn
      // nicht enthalten.
      if (ff.code.includes(QUELLEN_TRENNER)) {
        feldWeg(`der Feldcode enthält „${QUELLEN_TRENNER}" und wäre damit mehrdeutig`)
        continue
      }
      if (typeof ff.label !== 'string' || ff.label === '') {
        feldWeg('dem Feld fehlt sein Klarname')
        continue
      }
      // Nur code + label — ein `sample` aus Altbeständen (bis 2026-07-10)
      // oder ein `art` aus dem halben Tag Feld-Art (2026-07-27) wird
      // bewusst verworfen: beides gibt es nicht mehr.
      fields.push({ code: ff.code, label: ff.label })
    }
    // Die Hol-Relation strukturell prüfen (ladeRelation.ts). Eine kaputte
    // wird verworfen, aber GEMELDET (A4) — die Quelle selbst bleibt: ohne
    // Hol-Relation ist sie eine normale geschobene Quelle, kein Datenverlust
    // an den Feldern.
    const ladeRelation = e.ladeRelation === undefined ? null : pruefeLadeRelation(e.ladeRelation)
    if (e.ladeRelation !== undefined && ladeRelation === null) {
      probleme.push({ stelle, grund: 'die Hol-Relation ist unvollständig und wurde verworfen' })
    }
    seen.add(e.id)
    acc.push({
      id: e.id,
      name: e.name,
      kind: e.kind as DataSourceKind,
      ...(typeof e.idbId === 'string' && e.idbId !== '' ? { idbId: e.idbId } : {}),
      ...(typeof e.indexField === 'string' && e.indexField !== '' ? { indexField: e.indexField } : {}),
      ...(typeof e.kopfsatzIndex === 'string' && e.kopfsatzIndex !== ''
        ? { kopfsatzIndex: e.kopfsatzIndex }
        : {}),
      ...(e.lieferung === 'offenerSatz' ? { lieferung: 'offenerSatz' as const } : {}),
      ...(ladeRelation ? { ladeRelation } : {}),
      fields,
    })
  }
  return { liste: acc, probleme }
}
