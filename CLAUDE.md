# Aufbau-Editor — Projektgedächtnis

> **Zuerst lesen — bewusst kurz.** Aktuelle Aussagen des Nutzers und der Code
> schlagen diese Datei; bei Widerspruch nachfragen. Der Nutzer kann nicht
> programmieren: diese Regeln + die Prüfungen sind sein Ersatz dafür, Code
> lesen zu können. **Vor jeder Code-Änderung: Plan zeigen, „go" abwarten.**
> **Jeder Paket-Abschlussbericht endet mit „Aufgefallen unterwegs"**
> (Regel seit 2026-07-17): 0–3 konkrete Verbesserungsvorschläge, je mit
> Preisschild (Aufwand; Export berührt? → SE-Echttest) — Vorschlagen ist
> Pflicht, gebaut wird weiterhin NICHTS ohne „go".
> Sachlich, direkt, kein Cheerleading.

## Ziel (Nordstern)

Visueller Baukasten für **SoftEngine-Masken**: Bausteine auf die Fläche
ziehen, an ERP-Daten binden, als fertiges HTML + SEvariablen-JSON
exportieren — läuft in SoftEngine **ohne Nachbesserung von Hand**.
Was im Editor zu sehen ist, IST der Export.

Vorgänger: Repo `react--app` (funktioniert, aber unwartbar) = **nur
Funktions-Checkliste**, nie Code- oder Optik-Vorlage. SoftEngine-Wahrheit:
echte Referenzmasken-Paare eingecheckt in `docs/chef-maske/` (empfang +
behandlung — Zielklasse des Baukastens, Originalquellen für Regel 5;
belegen auch ERPAPICALL + Stamm-Quellen ADR/ART/BEL). **Wichtig
(Nutzer-Klarstellung 2026-07-23):** diese Masken LAUFEN echt in SoftEngine
(darum bleibt der Kontrakt-Beleg für Anschluss/ERPAPICALL/Stamm gültig),
sind aber KI-gebaut — als Layout-/Bauart- oder Optik-Vorbild UNGEEIGNET
(Regel 5 gilt nur für die SE-Kontrakte, nicht für Aufbau/Aussehen). Vertieft
dokumentiert im Repo `behandlung-umbau` (bei Bedarf per add_repo).

## Die 10 Architektur-Regeln

1. **WYSIWYG ist beweisbar:** eine Render-Quelle (Web Components laufen im
   Editor UND im Export); Editor-Hilfen leben im BlockHost, nie im Baustein.
2. **Fähigkeiten sind Registry-Einträge, kein Sondercode:** Bausteine
   deklarieren, was sie können (allowedChildTypes, resizableHeight,
   bindableSpots, blockEvents, visibleWhen, …); Canvas, Inspector und Export
   lesen generisch. Nirgends `if typ === 'kanban'`.
3. **Technikwert ≠ Anzeigename:** Feldcodes, IDs, NRs arbeiten unsichtbar,
   sichtbar sind Klarnamen. (Bewusste Nutzer-Ausnahmen: Kanban-Spaltentitel
   = Datenwert; die SE-Fachbegriffe START_TOOL / GET_RELATION /
   PUT_RELATION / PUTADD_RELATION sind SELBST die Anzeige-Namen der
   Schritt-Arten und Verben — keine Klarname-Kombis wie „Werkzeug starten"
   oder „Lesen (GET)", Entscheidung 2026-07-15. Außerdem: START_TOOL hat
   KEINE Parameter im Formular, nur die Nummer; keine sichtbaren
   Erklär-/Tutorial-Texte in der Steuerung.)
4. **Ein Export, eine Quelle, nichts scheitert still:** HTML + SEvariablen
   entstehen deterministisch aus demselben Baum + denselben Bibliotheken;
   Validator + Preflight blocken mit Klartext.
5. **SE-Kontrakte nur aus Originalquellen** (echte Masken), nie geraten.
   Alles Installations-Individuelle (Relations-NRs, Werkzeug-Nummern,
   Felder) sind **Daten** (Vorlagen), nie fest im Code.
   Jeder Export lädt das offizielle Interface über
   `<!--SOFTENGINE-VAR!EditorPfad-->/JS/JS/basis.html.interface.js`.
   **Ehrlicher Stand dieses Anschlusses (Befund B4, geprüft 2026-07-28):**
   belegt ist, dass die Maske die Bridge-Funktionen (`basisHTML_REGISTER`,
   `basisHTML_SND_MSG`, `sendBWLinkIntern`) BRAUCHT — nicht, dass genau
   dieser Import sie liefern muss. Dagegen spricht: die zwei eingecheckten,
   echt laufenden Referenzmasken laden gar kein externes Skript, und frühe
   Echttests (SEFILELOOP-Empfang, START_TOOL) bestanden VOR Einführung des
   Tags. Der Tag kam in `2364726` — zusammen mit dem `var`→`window.FF_*`-Fix,
   also ohne sauberen A/B-Beleg. Die zitierte Originalquelle
   (JWHtmlStart.html / Monaco) liegt nicht in diesem Repo. Bis zu einem
   kontrollierten WEBWARE-Test bleibt der Tag drin (defensiver
   Kompatibilitäts-Anschluss), aber er gilt NICHT als belegter Kontrakt —
   und „harmlos" ist er auch nicht bewiesen (404, Startverzögerung oder
   Doppelanmeldung sind nicht ausgeschlossen).
6. **Alter Editor = nur Funktionsliste.**
7. **Bedienung am Ding:** Anfasser, Doppelklick, Klick auf die Stelle;
   Inspector nur für Unzeigbares; der Editor **erfindet nie Daten**
   (Striche statt Demo-Werte, der Klarname ist die Vorschau).
8. **Ein Arbeitsbaum = ein federführender Agent:** Unabhängige
   Parallelarbeit von Claude und Codex im selben Ordner bleibt tabu;
   Übergabe nur über gepushte Commits; ein Thema = ein Commit.
   **NEU (Nutzer-Entscheidung 2026-07-20, TRIP):** Innerhalb EINER
   Claude-Code-Sitzung darf Claude das Codex CLI als Unterschritt aufrufen
   (Plan-Review, Code-Review, Batch-Implementierung — Skills in
   `.claude/skills/`) — nacheinander, nie gleichzeitig; jeder Codex-Diff
   wird von Claude geprüft, bevor er gilt.
   **Pflicht seit dem Kollisions-Vorfall 2026-07-15:** VOR Arbeitsbeginn
   und VOR jedem Push `git fetch` — ist origin voraus, erst dessen Stand
   ansehen und zusammenführen, dann bauen/pushen. NIE force-pushen. Ein
   Branch, an dem der jeweils andere Agent laut Auftrag arbeitet, ist tabu.
9. **Prüfungen einmal gebündelt vor dem Commit** (`npx tsc -b` +
   `npx eslint src` + `npm run check:regeln` + `npm run check:runtime` +
   `npm run check:docs` + `npm test`), nie zwischendurch. **Playwright/e2e ENTFERNT (Nutzer-Entscheidung 2026-07-23):**
   die langsamen Browser-Tests fraßen Tokens und Zeit.
   **Wer was testet (Nutzer-Ansage 2026-07-28, „softengine und browser test
   MACHE ICH"):** Die Bedienprüfung im Browser UND der SE-Echttest liegen
   ALLEIN beim Nutzer. Der bauende Agent startet keinen Dev-Server, klickt
   nicht im Preview und macht keine Screenshots; er prüft das Prüfbündel und
   sein eigenes Code-Urteil. Statt „im Browser geprüft" liefert er zu jeder
   Änderung eine kurze **Klickanleitung** (was öffnen, was tun, was zu sehen
   sein muss) und nennt ausdrücklich, was er NICHT prüfen konnte. Damit ist
   die Gegenrichtung vom 2026-07-23 („der Agent prüft vorher selbst im
   Preview") überholt. Sicherheitsnetz = fünf Code-Wächter (export / seRuntime / persistence /
   Export-Referenzabzug / Bündel-Wächter `check:runtime`): sie prüfen genau
   das, was im Browser NICHT sichtbar ist — Export-Bytes + SE-Anschluss.
   Dazu ein Doku-Wächter `check:docs` (2026-07-24): er bewacht die Doku selbst
   (ARCHI.md-Version + genannte `npm run …`-Scripts gegen package.json),
   keinen Code. Nutzer-Entscheidung, nicht ohne Absprache aufblähen.
   **Und ein Regel-Wächter `check:regeln` (2026-07-24, Nutzer-Entscheidung):**
   er bewacht die BAUART gegen genau diese Regeln — kein Bausteintyp-Sondercode
   und kein Baustein-IMPORT in generischem Code (Regel 2, beides mit begründeten
   Ausnahmen im Script), jeder Baustein im Export-Test UND in der
   Veralten-Positivliste **UND im Referenzabzug** (seit 2026-07-28: geprüft am
   Markup des Abzugs, nicht an einer Textstelle — eine Textsuche wäre schon von
   einem Kommentar zu befriedigen), Dateien ≤ 500 Zeilen (zwei Altlasten eingefroren),
   `any`/stumme Warnungen eingefroren, keine Hex-Farben im Baustein-CSS.
   Anlass: Regeln als reine Prosa halten niemanden auf — der Tabellen-Bug
   2026-07-24 entstand, weil „neuer Baustein = Zeile im Export-Test" nur
   im Kopf existierte. Fehlermeldungen sagen immer das WARUM, nicht nur das WAS. Der Bündel-Wächter
   (`scripts/check-runtime-bundle.mjs`) baut das Runtime-Bündel über den echten
   CLI-Weg neu und vergleicht es mit dem eingecheckten `ff-runtime.js`; bewusst
   KEIN vitest-Test (In-Place-Bauen im vitest-Lauf würde die `?raw`-Leser
   flaky machen), sondern eigener Schritt VOR vitest.
   Der Referenzabzug (`src/export/referenzabzug.test.ts` + Referenz in
   `src/export/referenz/`) vergleicht den Export einer festen
   Referenzmaske Byte für Byte: Umbauten müssen ihn grün lassen; ändert
   ein Paket den Export ABSICHTLICH, Referenz mit `npx vitest run -u`
   erneuern — der Datei-Diff macht die Maskenänderung im Commit sichtbar.
   Berührt ein Paket den Export → SE-Echttest durch den Nutzer.
   **Neuer Baustein = Zeile im Export-Test** (Lehre aus dem Tabellen-Bug
   2026-07-24): jeder neue Baustein bekommt mindestens EINEN Fall in
   `export.test.ts` (Attribut-Round-Trip) UND steht in der Veralten-Positivliste
   des Bündel-Sanity-Checks. Der Tabellen-Export war STILL kaputt (umbenannte
   Spalten fielen im Export auf die Standardtitel zurück, WYSIWYG-Bruch), weil
   kein Export-Test je „tabelle" berührte — deshalb schlug kein Wächter an.
10. **Nichts auf Verdacht bauen** — Gemeinsames erst herausziehen bzw.
    Neues erst bauen, wenn ein echter zweiter Fall es erzwingt.

## SoftEngine-Kontrakte (hart erarbeitet — nie verlieren)

- **Export-Dateien:** `index.basis.source.html` + `index.basis.SEvariablen.json`
  (Namenskonvention aller 124 Referenzmasken). LF-only, reines ASCII —
  das Escaping (ö → `&#x…;` im HTML, `\uXXXX` im JS/JSON) macht der Export
  maschinell; im Quellcode sind echte Umlaute überall erlaubt (auch
  Kommentare, Nutzer-Entscheidung 2026-07-15).
- **SoftEngine SCHIEBT die Daten:** Anmeldung
  `basisHTML_REGISTER(cb, document.title, '1.0')` mit Retry (25 ms × 400);
  jeder Push hydriert neu. Fallbacks: `message { MSG: { DATA } }`, SEDATA-Poll.
- **Zeilen-Properties tragen Tabellen-Präfix** (`IDBID0001_253_30`).
  Schlüssel-Scan: gleich / Präfix `code_` / Endung `_code` — gilt für
  Lesen UND Schreiben (setField patcht dieselben Schlüssel).
- **Schreiben:** `basisHTML_SND_MSG('PUT_RELATION', { NR, PARAMS })`,
  PARAMS = sechs Strings `[pos, len, art, pindex, relId, wert]` — `art` =
  Feld-Art: `'L'` (Text), `'D'` (Datum; Nutzer-Praxis, belegt im Echttest
  2026-07-22). ⚠ `relId` OHNE `IDB`-Präfix (`ID0001`, nicht `IDBID0001`).
  Standard-PUT NR 174 ist nur die mitgelieferte Vorlage.
- **GET-Antworten:** Das offizielle `basisHTML_REGISTER` vereinheitlicht
  `BWMSG` (BüroWARE/WinUI) und `WWMSG` (WEBWARE) zu demselben Callback.
  Dieser Callback ist der Hauptweg; neue `SEDATA.Message<N>` sind nur der
  Rückfallweg. Immer nur EINE GET-Anfrage in Flug (Warteschlange, Muster
  `seGetNewIndex`). Nie direkt nur auf `BWMSG` lauschen.
- **START_TOOL:** `sendBWLinkIntern('0,START_TOOL,<nr>[,params URL-kodiert]')`,
  Fallback `basisHTML_SND_MSG`. Werkzeug-Nummern je Installation individuell.
- **Quellen-Arten bestimmen die SEvariablen-Form:** IDB → SEFILELOOP
  `FELDER:'*'`; Stamm (ADR/ART/BEL) → explizite pos_len-Liste (+ optional
  FREISELEKT). MEMTAB/ERPAPICALL erst bauen, wenn die Form an einer echten
  Maske belegt ist.
- **Anlegen-Muster (GET neuer Index → PUTs → Querverweis):** belegt aus
  echtem SE-Log, s. `docs/softengine-wiki/muster-satz-anlegen.md` — beim
  Anlegen werden auch LEERE Felder geschrieben; Ketten brauchen
  adressierbare Ergebnisse je Schritt („Ergebnis von Schritt N").

## Arbeitsablauf: TRIP + Codex-Zweitmeinung (Nutzer-Go 2026-07-20)

- Skills in `.claude/skills/`: `/TRIP-1-plan` (planen; Codex/GPT 5.6
  zerpflückt den Plan) → `/TRIP-2-implement` (Codex implementiert in
  Batches, Claude prüft jeden Diff; Testing-Gate = Prüfbündel aus Regel 9)
  → `/TRIP-3-release` (Changelog/Doku/Commit — Commit und Push weiterhin
  NUR nach Nutzer-Go). Alle Skills bleiben installiert (Nutzer testet sie,
  sobald sein Codex-Kontingent wieder frei ist); ist Codex nicht
  verfügbar, übernimmt ein unabhängiger Prüf-Agent die Zweitprüfung —
  transparent im Bericht.
- Architektur-Karte für die Agenten: `docs/ARCHI.md` (Pflege nach
  `docs/ARCHI-rules.md`). CLAUDE.md bleibt Regel- und Entscheidungsbuch —
  bei Widerspruch gewinnt CLAUDE.md.
- Die Rituale gelten in TRIP unverändert: Plan zeigen + „go" abwarten,
  Test-Bremse, SE-Echttest gebündelt, „Aufgefallen unterwegs". Dem Nutzer
  nie Datei-/Technik-Reviews vorlegen — nur fachliche Entscheidungen in
  Klartext (Lehre 2026-07-20).

## Stand & Fahrplan

**Ausgelagert: [`docs/FAHRPLAN.md`](docs/FAHRPLAN.md)** — Tagesordnung, feste
Zusagen, Merkliste. Regeln und Tagesordnung bleiben getrennt: sonst ertrinken
die Regeln in Prosa und werden ueberlesen. Bei Widerspruch gewinnt CLAUDE.md.
Die Chronik „was wann gebaut wurde" steht NICHT dort, sondern in der
git-Historie und in `docs/2-changelog/` (Doku-Diaet 2026-07-27).

### Woran gerade gearbeitet wird

**Tabelle stabil machen**, daneben **Verknuepfte Quellen** (Paket 3 von 4).
Die vollstaendige Reihenfolge steht in FAHRPLAN.md.

## Wichtige Stellen

- Store: `src/state/Editor.ts` (nur Zustand + öffentliche Methoden;
  Fächer daneben: treeOps/history/persistence/migrations/templateRules).
  KEINE Weltvariable: die eine Instanz entsteht in `src/app/providers.tsx`
  und reist über EditorProvider/EditorContext. `useLitElement` = die EINE
  React↔Lit-Übergabestelle · `zieheGroesse` = die EINE Zieh-Mechanik für
  Block- UND Popup-Anfasser · `src/export/serializer.ts` = die eine
  Zeichen-Regel-Stelle · `bindingAttr()` in BlockDefinition = die EINE
  Stelle der Bindungs-Attribut-Form · `POPUP_RAND` (PopupBlock) = die
  EINE Konstante für „Fläche − Rand". Historie der Aufräum-Schritte
  A1–A7 und Kommentar-Historie: `docs/decisions/`.
- Registry-Konzepte: `src/core/blocks/` · Bausteine: `src/blocks/` ·
  Aktions-/Quellen-Modell: `src/core/data/`
- Export: `src/export/exportMask.ts` + `validator.ts` + `preflight.ts` ·
  Runtime-Bündel: `npm run build:runtime` (Veralten-Wächter im export.test!)
- SE-Schicht: `src/softengine/` (bridge/data/relations — kennt NIE einen
  Baustein) · Kanban-Hydrierung: `src/blocks/kanban/seRuntime.ts` ·
  Ketten-Laufzeit: `src/blocks/shared/seAktionen.ts`
- Design: Masken-Tokens `src/design/masken-tokens.css` (--se-*, kantig,
  Grün) · Editor-UI `src/index.css` (shadcn, hell, Blau) — nie mischen.
