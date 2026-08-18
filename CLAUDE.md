# Aufbau-Editor — Projektgedächtnis

> **Zuerst lesen — bewusst kurz.** Aktuelle Aussagen des Nutzers und der Code
> schlagen diese Datei; bei Widerspruch nachfragen. Der Nutzer kann nicht
> programmieren: diese Regeln + die Prüfungen sind sein Ersatz dafür, Code
> lesen zu können. **Vor jeder Code-Änderung: Plan zeigen, „go" abwarten.**
> **„Aufgefallen unterwegs" ist GESTRICHEN** (Nutzer-Ansage 2026-08-04; galt
> 2026-07-17 bis 2026-08-04 als Pflicht-Rubrik am Berichtsende). Grund: eine
> Rubrik, die Pflicht ist, ist niemals leer — sie produzierte bei jedem
> Bericht Vorschläge, auch wenn es nichts zu melden gab, und lenkte vom
> Gebauten ab. **Gemeldet wird nur noch, was den Auftrag blockiert oder etwas
> kaputt macht.** Verbesserungsideen NUR auf Nachfrage; nicht als Rubrik
> wieder einführen.
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
   der Validator blockt mit Klartext.
   **Geändert 2026-08-10 (Nutzer-Ansage):** der Preflight blockt NICHT mehr.
   Bis dahin stand hier „Validator + Preflight blocken" — `preflightMask`
   hielt den Nutzer wiederholt vom Exportieren ab, in Fällen, die er bewusst
   so gebaut hatte. Der Export läuft jetzt immer.
   **Nachgezogen 2026-08-18:** der gelbe Warn-Punkt im Datencenter ist auf
   Nutzer-Entscheidung entfernt — `preflightMask` ist seitdem ohne Aufrufer
   im Produkt (löschen oder behalten = offene Mini-Entscheidung, s. Plan).
   (`warnChecks` in `validator.ts` war genauso aufruferlos und ist in U3,
   2026-08-12, geloescht.)
   Geblieben ist
   `validateMaskHtml` (SE-Marker, LF, reines ASCII) — schlägt die an, würde
   SoftEngine die Datei gar nicht erst laden. Damit ist „nichts scheitert
   still" für die DATEIFORM weiter zugesagt, für die FACHLICHE Bindung
   dagegen nicht mehr: eine ins Leere zeigende Bindung fällt erst in
   SoftEngine auf.
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
   (JWHtmlStart.html / Monaco) liegt nicht in diesem Repo.
   **Neu belegt im Echttest 2026-07-28 (Nutzer-Protokoll):** die Datei
   EXISTIERT und arbeitet — sie führt selbst `DATA SEND`/`DATA RECV` aus
   (`basis.html.interface.js:89/:161`), kein 404. `basisHTML_REGISTER` und
   `basisHTML_SND_MSG` vorhanden, ein Daten-Push angenommen. ABER: dieser
   Lauf war **WinUI/BüroWARE** (`__WEBWARE__: "0"`, `__WINUI_MAJORVERSION__:
   "7"`). Der Nutzer bestätigt im selben Gespräch mündlich, dass die Maske
   AUCH in WebUI/WEBWARE läuft (kein Protokoll dazu, nur seine Aussage).
   Praktischer Stand damit: **der Anschluss funktioniert auf beiden
   Plattformen, er ist kein Risiko.** Unbeantwortet bleibt allein, ob er
   NÖTIG ist — das entschiede nur ein Lauf OHNE den Tag, und der lohnt erst,
   wenn jemand ihn entfernen will. Bis dahin: Tag bleibt drin, wird aber
   nicht als belegter SE-Kontrakt zitiert.
   Nebenbeobachtung aus demselben Protokoll: `CONECT` wird ZWEIMAL gesendet
   (Empfang trotzdem nur 1 Paket) — ungeklärt, ob Interface-Eigenlogik oder
   doppelte Anmeldung.
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
   `npm test`), nie zwischendurch. **Playwright/e2e ENTFERNT (Nutzer-Entscheidung 2026-07-23):**
   die langsamen Browser-Tests fraßen Tokens und Zeit.
   **HARTE TEST-SPERRE (Nutzer-Ansage 2026-07-28, sehr deutlich):** KEINE
   neuen Testarten, keine neue Testumgebung, keine Anzeige-/Komponenten-/
   DOM-Tests — auch nicht vorschlagen. Zwei Gründe, beide vom Nutzer: sie
   fressen Tokens, UND sie machen Agenten fahrlässig, weil die sich auf
   grüne Ampeln verlassen statt selbst zu denken. Der Tabellen-Befund B1
   belegt genau das: ein GRÜNER Test deckte einen Zweig ab, den das Produkt
   nie erreichte. Bestehende Tests bleiben und dürfen bei echten Änderungen
   mitwachsen; neue Test-GATTUNGEN sind tabu.
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
   Einen Doku-Wächter `check:docs` gab es von 2026-07-24 bis 2026-07-30; er
   bewachte ARCHI.md, die Changelog-Tabelle und die genannten `npm run …`-
   Scripts. Entfernt mit der Doku, die er bewachte (s. u.) — es gibt keinen
   Doku-Wächter mehr, und ohne Absprache kommt auch keiner zurück.
   **Und ein Regel-Wächter `check:regeln` (2026-07-24, Nutzer-Entscheidung):**
   er bewacht die BAUART gegen genau diese Regeln — kein Bausteintyp-Sondercode
   und kein Baustein-IMPORT in generischem Code (Regel 2, beides mit begründeten
   Ausnahmen im Script), jeder Baustein im Export-Test UND in der
   Veralten-Positivliste **UND im Referenzabzug** (seit 2026-07-28: geprüft am
   Markup des Abzugs, nicht an einer Textstelle — eine Textsuche wäre schon von
   einem Kommentar zu befriedigen), Dateien ≤ 500 Zeilen (KEINE Altlasten mehr —
   die zwei früheren sind längst geteilt, jede Datei fällt unter denselben Deckel),
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

**Namens-Konvention (Beschluss 2026-08-04):** neue Bezeichner deutsch;
bestehende englische bleiben; umbenannt wird nur, was ohnehin angefasst wird.

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
  2026-07-22), `'Z'` (Uhrzeit, z. B. `15:00` — belegt im empfang-Log
  2026-08-12). ⚠ `relId` OHNE `IDB`-Präfix (`ID0001`, nicht `IDBID0001`).
  Standard-PUT NR 174 ist nur die mitgelieferte Vorlage.
- **Anlegen (belegt im empfang-Log des Nutzers, 2026-08-12, WinUI):**
  Neuer IDB-Satz: `GET_RELATION[640!<IDBID>]` → Antwort = die NEUE
  Satznummer (z. B. `21`); danach schreiben die PUT_RELATION-174-Aufrufe
  mit genau dieser pindex. Neuer BELEG: `GET_RELATION[1020!<BELART>!!
  <ADRNR>!!!!]` → Antwort = der Beleg-INDEX des frischen Belegs
  (z. B. `0NL26105743`: Byte 3 = Belegart, ab Byte 4 = Belegnummer);
  Jahr/Archiv leer trifft ihn, er liegt im aktuellen Nummernkreis.
  Nebenbei belegt: `GET_RELATION[43!_BNR_!3!30]` → Name des angemeldeten
  Bedieners. **Daraus wird NICHTS gebaut** (Nutzer-Ansage 2026-08-12): die
  Etappe „Beleg anlegen und sofort sehen" ist gestrichen und wird nicht
  wieder vorgeschlagen. Die Zeilen hier bleiben nur als SE-Wissen stehen.
  Neue BELEGPOSITION (behandlung-Log 2026-08-12):
  `PUT_RELATION[82!0!L!26105745!!ART03045!!1]` — belegt sind Reihenfolge
  und Werte `[0, Belegart, Belegnummer, '', Artikelnummer, '', Menge]`;
  was die `0` und die Leerstellen genau bedeuten, ist noch ungedeutet
  (vor dem Bau am Log nachprüfen, nicht raten). Die zigtausend
  `Selektion …`-Zeilen danach sind SE-INTERNE Kalkulation je Position —
  sie entstehen im ERP, nicht durch unsere Maske.
- **GET-Antworten:** Das offizielle `basisHTML_REGISTER` vereinheitlicht
  `BWMSG` (BüroWARE/WinUI) und `WWMSG` (WEBWARE) zu demselben Callback.
  Dieser Callback ist der Hauptweg; neue `SEDATA.Message<N>` sind nur der
  Rückfallweg. Immer nur EINE GET-Anfrage in Flug (Warteschlange, Muster
  `seGetNewIndex`). Nie direkt nur auf `BWMSG` lauschen.
- **START_TOOL:** `sendBWLinkIntern('0,START_TOOL,<nr>[,params URL-kodiert]')`,
  Fallback `basisHTML_SND_MSG`. Werkzeug-Nummern je Installation individuell.
- **Quellen-Arten bestimmen die SEvariablen-Form:** IDB → SEFILELOOP
  `FELDER:'*'`; Stamm (ADR/ART/BEL) → explizite pos_len-Liste.
  MEMTAB/ERPAPICALL erst bauen, wenn die Form an einer echten
  Maske belegt ist.
  **Abweichung seit S5.1 (2026-08-11), BESTÄTIGT 2026-08-12 (Nutzer-Ansage):** unser Export
  schreibt für IDB nicht mehr `*`, sondern die pos_len-Liste der von der Maske
  BENUTZTEN Felder (`felderFor` in `core/data/dataSources.ts`, gesammelt in
  `export/benutzteQuellen.ts`). Anlass: SoftEngine macht für jeden gelieferten
  Wert einen Bild-Nachschlag (GET_RELATION 1911 — Nutzer-Log: 5 953 Aufrufe in
  9,2 s beim Öffnen), und die Menge bestimmt allein unsere Bestellung. Der Satz
  oben bleibt trotzdem stehen: er beschreibt, was die echten Masken TUN, und
  genau darum war die explizite IDB-Liste zunächst ein unbelegter Vorgriff.
  **Inzwischen bestätigt (Nutzer-Ansage 2026-08-12, kein eigenes Protokoll;
  der bestandene R2-Kerntest lief bereits mit genau diesem Export):** die
  Maske liefert mit expliziter Liste. Der Revert-Vorbehalt ist verbraucht.
- **Die REIHENFOLGE der SEFILELOOP-Einträge ist ein Kontrakt** (belegt
  2026-08-11, A/B-Echttest des Nutzers mit derselben Maske): steht ein
  Kopfsatz-Loop (POS/Belegpositionen) an ERSTER Stelle, liefert SoftEngine aus
  **keiner** Quelle Daten — auch ADR/ART/IDB dahinter bleiben leer. Dieselbe
  Datei mit POS an letzter Stelle: alle Quellen liefern. Ein Kopfsatz-Loop
  scheitert standalone, und SoftEngine bricht beim ersten gescheiterten Loop
  die ganze Liste ab. Der Export schreibt Kopfsatz-Arten deshalb ZULETZT
  (`loopReihenfolge` in `core/data/dataSources.ts`, Merkmal `kopfsatzMoeglich`
  aus der Arten-Tabelle). Wer die Ausgabe-Reihenfolge anfasst, bricht das.
- **Zeilenfilter am SEFILELOOP-Eintrag: GESTRICHEN** (Nutzer-Ansage
  2026-08-12). Hier standen die Belege für ein optionales Filter-Prädikat je
  Loop-Eintrag, aus 267 echten SEvariablen-Dateien in `Desktop\VORLAGEN`.
  Die Etappe R5 war damit gebaut und ist auf Ansage restlos zurückgenommen:
  das Formularfeld verlangte einen von Hand getippten Ausdruck mit
  Feldcodes, obwohl die Quelle die Felder mit Klarnamen kennt (Regel 3).
  **Nicht wieder vorschlagen, nicht wieder dokumentieren** — die Belege
  stehen in der git-Historie (`44a3b81`, `63942b0`). Aus derselben
  Durchsuchung bleibt festgehalten: MEMTAB kommt in KEINER echten Maske vor.
- **Positionen zur Laufzeit lesen (belegt 2026-08-11, Echttests des
  Nutzers):** Relation 69 liefert je Frage EIN Feld einer Position:
  `basisHTML_SND_MSG('GET_RELATION', { NR: '69', PARAMS: [BELART, POS, LEN,
  BELNR, JAHR, ARCHIV, '', POSNR, '', '', '', ''] })` → `{"RESULT":"…"}`
  über den REGISTER-Callback, 2–19 ms. JAHR/ARCHIV = BEL-Felder 0_1/1_1 der
  gewählten Zeile (leer findet nur den aktuellen Nummernkreis). Breiter
  Schnitt POS=0/LEN=255 holt die vordere Positionszeile in EINEM Aufruf
  (der Antwortpuffer fasst 255 Zeichen). Ende der Liste: 11_6 UND 18_25
  beide leer (645_10/Positionsident ist hier LEER — kein Ende-Marker).
  Immer seriell; `ALS_ARRAY`/`ALIAS` machen die Antwort nur zur 10er-Liste
  mit trotzdem EINEM Wert. ⚠ ERPAPICALL per `basisHTML_SND_MSG` friert die
  WinUI-Maske EIN (nur Task-Manager) — tabu, bis die ErpApiCall-Referenz
  der Installation vorliegt. Bauauftrag: UMBAU-PLAN-V6.md, Welle R.
  echtem SE-Log, s. `docs/softengine-wiki/muster-satz-anlegen.md` — beim
  Anlegen werden auch LEERE Felder geschrieben; Ketten brauchen
  adressierbare Ergebnisse je Schritt („Ergebnis von Schritt N").

## Arbeitsablauf (Schnitt 2026-07-30)

- **Der TRIP-Ablauf ist weg.** Von sechzehn Skills sind VIER geblieben:
  `codex-ask`, `codex-plan-review`, `codex-code-review`, `codex-implement` —
  Zweitmeinung von Codex, ohne eigene Ablage. Gelöscht sind die drei
  TRIP-Stufen (`TRIP-1-plan`/`-2-implement`/`-3-release`) und neun nie
  benutzte (`TRIP-init` — einmalig zum Einrichten, das Projekt ist
  eingerichtet —, `TRIP-upgrade`, `TRIP-research`, `TRIP-review`,
  `TRIP-compact`, `TRIP-hotfix`, `TRIP-test`). Grund für die drei Stufen:
  sie produzierten genau die Ablagen, die derselbe Schnitt gelöscht hat
  (Plan-Datei, Changelog-Datei, Code-Review-Datei, ARCHI-Pflege).
  **Nicht ohne neue Entscheidung wieder anlegen; die git-Historie hat sie.**
- **Planen und Berichten läuft im Chat**, nicht in Dateien. Wo ein Plan
  ausnahmsweise als Datei nützlich ist, gehört er in die git-Historie des
  Commits, der ihn umsetzt — keine `docs/`-Ablage neu erfinden.
- **Es gibt keine Architektur-Karte mehr.** `docs/ARCHI.md` +
  `ARCHI-rules.md` sind gelöscht. Die vier Codex-Vorlagen sind seit
  2026-08-05 entsprechend bereinigt (sie verweisen auf CLAUDE.md und den
  Code, nicht mehr auf gelöschte Dateien). Wer sich einlesen muss: CLAUDE.md,
  dann der Code selbst („Wichtige Stellen" unten). CLAUDE.md bleibt Regel- und
  Entscheidungsbuch — bei Widerspruch gewinnt CLAUDE.md.
- **Die Rituale gelten unverändert:** Plan zeigen + „go" abwarten,
  Test-Bremse, SE-Echttest gebündelt (die Vorschlags-Rubrik ist seit
  2026-08-04 gestrichen, s. Kopf dieser Datei). Dem Nutzer
  nie Datei-/Technik-Reviews vorlegen — nur fachliche Entscheidungen in
  Klartext (Lehre 2026-07-20).

## Stand

**Doku-Schnitt 2026-07-30 (Nutzer-Ansage „weg"):** gelöscht sind
`docs/FAHRPLAN.md`, `docs/ARCHI.md` + `ARCHI-rules.md`, `docs/1-plans`,
`docs/2-changelog`, `docs/3-code-review`, `docs/4-unit-tests`, `docs/6-memo`,
`docs/decisions` und der Wächter `check:docs` — rund 2200 Zeilen. Begründung
des Nutzers: er liest sie nicht, und die git-Historie erzählt dasselbe.
**Die Chronik „was wann gebaut wurde" steht ab jetzt NUR in der git-Historie.**
Keine Tagesordnung, keine Changelog-Dateien, keine Plan-Ablage mehr anlegen
ohne neue Entscheidung. Geblieben ist, was BEWEIST statt zu erzählen:
`docs/chef-maske/` (die zwei echten Masken) und `docs/softengine-wiki/`.

### Woran gerade gearbeitet wird

**Der Bauauftrag steht seit 2026-08-10 in `UMBAU-PLAN-V6.md` im Repo-Stamm.**
Er ist die Ausnahme vom Doku-Schnitt oben und war eine ausdrückliche
Nutzer-Entscheidung: der Nutzer arbeitet in mehreren Chats, und ein neuer Chat
weiß nichts vom vorherigen — die Datei ist die einzige Übergabe. Sein
Abschnitt 0 gehört zum Pflichtprogramm beim Start (zusammen mit dieser Datei
und `git log`). Er ist Bauauftrag, **keine Chronik**: fortgeschrieben wird der
Zeiger in 0.1, nicht eine Liste dessen, was war. Zwei Rituale daraus gelten
zusätzlich zu den Regeln hier: **Ansage vor jeder Etappe** (was/warum mit
`datei:zeile`/wo sichtbar/was du prüfst/was ich nicht prüfen kann), und **ein
`go` gilt für genau EINE Etappe**.

**Branch-Konsolidierung 2026-08-05 (Nutzer-Entscheidung): es gibt nur noch
`main`, gearbeitet wird ab jetzt direkt dort.** Die zehn `claude/…`-Branches
sind erledigt; ihr Inhalt steckt in main oder ist bewusst verworfen. Gerettet
wurde daraus genau dreierlei: die senkrechte Trennlinie und die zwei
Fellnase-Design-Commits (Palette/Kanten/Flachheit + die eingebetteten
Schriften). Der Musterbogen in `designsprache/` blieb zunächst draußen — diese
Entscheidung ist am 2026-08-06 aufgehoben (s. „Demo-Übernahme" unten): er liegt
jetzt eingecheckt in main und ist das Vorbild. Der einmalige Force-Push auf main
war ausdrücklich erlaubt und ist verbraucht — ab hier gilt wieder Regel 8:
nie force-pushen, vor Arbeitsbeginn und vor jedem Push `git fetch`.
Von der Designsprache trägt die Maske Figtree eingebettet (~28 KB); die
Schmuck-Schrift Fraunces ist wieder raus, weil sie allein 88 KB für zwei
Überschriften kostete — `--se-font-schmuck` zeigt jetzt auf Georgia.

**Code-Review 2026-08-05/06 — ABGEARBEITET (14 Funde + 5 nachgeholte Bereiche,
14 Commits).** Alle 14 Funde waren nachprüfbar echt, keiner widerlegt; die
Review-Datei ist danach gelöscht (Chronik: git-Historie). Weg sind: der
Demo-Putzer, der aktuelle Eingaben aus dem Browser-Speicher löschte · das
Phantom-Undo beim Antippen eines Größen-Anfassers · die Auswahl auf einer
unsichtbaren Popup-Seite (auch über Undo) · zwei blinde Verwendungs-Anzeigen in
der Steuerung (Relationen in Ketten, Nachschlage-Quelle + Schritt-Parameter) ·
fünf Undo-Schritte für einen Quellwechsel · das Baustein-Verschieben beim
Text-Markieren · die Drop-Vorschau des Popups für Typen, die es nicht aufnimmt ·
der Arbeitsverlust beim Fenster-Schließen (jetzt schreibt `pagehide` einen
ausstehenden Stand, Mechanik in `speicherPlaner`) · der lose Download-Anker ·
die stille Umleitung von addBlock auf die Wurzel · der tote Löschen-Knopf an der
Musterkarte (Erklärung jetzt an EINER Stelle, `state/loescheBaustein`). Dazu aus
der Fortsetzung: **eine nur in einer Aktionskette gelesene Datenquelle fehlte im
Export** (keine SEFILELOOP, kein FF_DATA_SOURCES → Parameter ging leer hinaus).
Nicht selbst prüfbar und daher offen: die Bedienprobe im Browser und der
SE-Echttest (Regel 9).

**Demo-Übernahme („Fellnase") — Vorbild ist ab jetzt die eingecheckte Demo
(Nutzer-Entscheidung 2026-08-06).** Die drei Design-Commits (`b724521` Trenner
senkrecht, `0e2bdff` Palette/Kanten/Flachheit, `3cc13cf` Schriften) sind seit der
Konsolidierung IN MAIN; die Fellnase-Werte stehen in `masken-tokens.css`. Neu ist,
dass auch der Musterbogen SELBST eingecheckt ist: `designsprache/`
(musterbogen.html + atome.css + schriften.css, Herkunft `c3318f2`). Damit muss
niemand mehr eine Vorlage aus dem Gedächtnis beschreiben — **abschreiben statt
gestalten**; fehlt ein Wert in der Demo, wird gefragt statt geraten. Die Demo ist
reines HTML+CSS, läuft ohne Server und wird nie exportiert.

Der Abgleich Demo ↔ Editor — **Stand nachgezogen 2026-08-10**, der Text vom
2026-08-06 war überholt: die Kanban-SPALTE passt (Punkt, Titel, Zähler) · die
KARTE hat Lasche und Fußzeile inzwischen (`blocks/card/CardBlock.ts`, Commits
`7f7b76c`/`bf5846f`) — der frühere Satz „der KARTE fehlen Reiter und Fußzeile"
stimmt nicht mehr · bei der TABELLE ist der Editor-Zeilenaufbau nachgezogen
(`6613fe2`), **nicht nachgeprüft** habe ich Tafel-Rahmen, Spaltenbreiten,
Marken, Bilder und Leerzustand — wer daran weiterbaut, misst selbst nach,
statt diese Zeile zu glauben. Die Entscheidungen des Plans dazu:
- **Spaltenbreite nach ART, nie nach Inhalt** — sonst springt eine Spalte beim
  Seitenwechsel, wenn die nächste Seite kürzere Werte trägt (Nutzer-Einwand).
  Zahl 90 px, Datum 100 px, Status 120 px, Text teilt sich den Rest.
- **Status-Zuordnung ist FREIWILLIG:** die Spalte auf „Status" stellen genügt;
  ohne Zuordnung zeigt die Marke den Rohwert grau. Zugeordnet wird Datenwert →
  Klarname → Bedeutung; die Farbe folgt fest der Bedeutung, nie frei wählbar.
- **Geteilt statt kopiert:** die Marke gibt es schon (`shared/statusVariant.ts`,
  Nutzer Karte + Kanban) · die Tierbilder wandern von `blocks/card/` nach
  `blocks/shared/` · das Tafel-Aussehen entsteht als geteilter Stil, weil
  Tabelle, Dialog und Popup dieselbe Form tragen (die Popup/Dialog-Zusammen-
  legung bleibt ein eigenes Paket, s. Kopf von `DialogRahmen.ts`).
- Die Spalten-Darstellung mit Bild heißt **„Bild + Name"** (Nutzer 2026-08-06).
- Datum wird nur AUSGERICHTET, nie umgerechnet.

Das Nutzer-Urteil zur Editor-Optik vom 2026-08-05 ist abgearbeitet: nüchterne
Symbole in der Palette, Abstände in Inspector/Zentrale, Fraunces ist raus.

**Datenquellen** — Arten als Tabelle statt Sondercode (2026-07-30 gebaut),
Kennung frei eingebbar. Seither gebaut (2026-08-04/05): Auswahl geben/folgen
(Tabelle/Kanban geben die angeklickte Zeile, Einzelwert-Bausteine folgen ihr),
Text-Baustein bindbar + Farbe aus Masken-Tokens, Export ohne
Standardwert-Attribute. Als Nächstes: Verknüpfung von den Bausteinen an die
Datenquelle heben (der Plan dazu lag in `docs/1-plans/F_0.5.0…` und steckt
jetzt in Commit `fd827aa`). Offen daneben: Tabelle stabil machen, Optik-
Feinschliff, Wizard.

**Check-up 2026-08-05 — ABGEARBEITET (2026-08-05, 15 Schritte, 15 Commits):**
Die Bauart trägt; die 6 echten Fehler sind weg (Kanban-Zug bei Daten-Push ·
Undo spülte beim Tippen die Historie weg · verschluckte Ketten-/Brücken-
Fehler · zweiter Tageswähler zog nicht nach · weißer Editor-Start bei
gesperrtem Speicher · Geist-Baustein nach Fenster-Wechsel). Dazu:
Null-Byte/BOM aus den Quellen, `noImplicitOverride`, drei kopierte
Code-Stellen zusammengezogen, unwahre Kommentare korrigiert, Review-Chronik
eingedampft. Zwei neue Wächter: Steuerzeichen/BOM in `check:regeln` und
`no-floating-promises` (typ-gestützt, nur diese eine Regel). Übersprungen:
nichts. Nicht selbst prüfbar: der Privatmodus-Fall (braucht Safari), und
kein DnD-Test für den Kanban-Fix (wäre eine neue Test-Gattung, Regel 9).
Bewusst ausgeklammert, je eine eigene Nutzer-Entscheidung nötig: ein
Vokabular pro Begriff (Schritt/Step, QuellenArt/DataSourceKind — kollidiert
mit der Namens-Konvention oben) · Bibliotheken-Singletons vs.
Provider-Bauart · ein README als menschliche Eingangstür (kollidiert mit dem
Doku-Schnitt).

### Feste Zusagen — aus FAHRPLAN.md gerettet, weil es REGELN sind

Diese Punkte sind keine Chronik, sondern Entscheidungen. **Nicht ohne neue
Nutzer-Entscheidung anfassen:**

- **Geschrieben wird nur über sichtbare Ketten** — kein Auto-PUT. Gelesen
  wird automatisch aus der ERSTEN Zeile der Quelle.
- **Ankreuzfeld bleibt unbindbar**, bis der SE-Wert-Kontrakt (J/N? 1/0?) an
  einer echten Maske belegt ist.
- **Kanban:** „Einsortieren nach" ist optional; ein Drop führt NUR die
  sichtbare Kette „Karte verschoben" aus, einen eingebauten Schreibweg gibt
  es nicht.
- **Verknüpfung (Nutzer 2026-07-25):** höchstens 3 Schlüsselfelder,
  UND-verknüpft · kein Partner gefunden → Feld bleibt leer, die Zeile bleibt
  STEHEN (verschwundene Zeilen wären unsichtbarer Datenverlust) · nur EINE
  Stufe, keine Ketten über mehrere Quellen.
- **Nachschlagen wird KEIN Popup (Nutzer-Entscheidung 2026-08-12):** Das
  Nachschlage-Fenster bleibt ein flüchtiger Laufzeitdialog — kein Baustein,
  nicht im Baum, nicht im Export. Es bekommt die ECHTE Tabelle (damit Suche,
  Sortieren per Spaltenklick und Blättern), wählbare Spalten, und eingestellt
  wird es am Ding: Lupe im Editor klicken, Fenster über der abgedunkelten
  Fläche, Spalten stellen. **Der Popup-Weg (Fenster selbst bauen und ans Feld
  binden) ist geprüft und abgelehnt** — ein Popup weiß nicht, WER es geöffnet
  hat: zwei Felder am selben Popup füllen sich bei einem Zeilenklick beide.
  Nicht wieder vorschlagen; Begründung und die drei fehlenden Bausteine
  (Feld-Klick-Ereignis, Tabellen-Zeilen-Ereignis, Rückgabeweg) stehen im
  Beschluss-Kopf der Welle D in `UMBAU-PLAN-V6.md`, die Bauschritte in D4.
- **Keine Warn-Anzeigen (Nutzer 2026-08-10, sehr deutlich):** Es wird KEINE
  Anzeige für Preflight-/Bindungs-Warnungen gebaut und keine vorgeschlagen —
  Bedienfehler verantwortet der Nutzer selbst, der Editor soll funktionieren,
  nicht erziehen (dasselbe Muster wie „Aufgefallen unterwegs", s. Kopf).
  Der Export blockt weiterhin nie. Der gelbe Punkt in der Steuerung ist am
  2026-08-18 auf Nutzer-Entscheidung entfernt; `preflightMask` ist damit
  aufruferloser Code (Verbleib = offene Mini-Entscheidung, s. Plan).
  Erfolgs-Meldungen der Maske waren am 2026-08-18 kurz beauftragt und sind
  am selben Tag auf Nutzer-Ansage („muss nicht sein") GEPARKT worden —
  nicht von selbst wieder vorschlagen (Details: Sperrliste im Plan).
- **Der Export-Klick bleibt, wie er ist (Nutzer-Ansage 2026-08-17, „das
  bleibt wie es ist! muss nicht in den Plan").** Dass ein Klick ZWEI
  automatische Downloads auslöst und Chromium beim zweiten nachfragt, nimmt
  der Nutzer bewusst in Kauf. Keine ZIP, keine Anforder-Knöpfe, kein
  eingefrorener Exportstand — **nicht wieder vorschlagen und nicht wieder
  aufschreiben** (dieselbe Ansage steckt seit 2026-08-11 im Etappenkopf B1
  des Umbau-Plans; hier stand sie trotzdem weiter als offene Entscheidung).
- **Restlos entfernt — nicht wieder einbauen:** „Quelle speichern" samt
  Änderungs-Spur · „Neuen Satz anlegen"/CREATE_RECORD · Projektkarte/
  project-map · dashboard-Klickmodelle (alle Nutzer 2026-07-20) · der
  Baustein-Baum (2026-07-21) · die Verknüpfungs-Bibliothek der
  Kommandozentrale (2026-07-28) · der mitgelieferte Datenquellen-Startbestand,
  die Feld-Vorlagen und „Liste einfügen" (alle 2026-07-30).

## Wichtige Stellen

- Store: `src/state/Editor.ts` (nur Zustand + öffentliche Methoden;
  Fächer daneben: treeOps/history/persistence/migrations + migrationenRoh/
  templateRules/pageOps/rasterOps/selectionOps/quellenOps). Die eine Editor-Instanz
  entsteht in `src/app/providers.tsx` und reist über EditorProvider/
  EditorContext; die Bibliotheken (DataSourceStore/RelationStore) sind
  dagegen Modul-Singletons — zwei Bauarten, ehrlich benannt (Befund
  Check-up 2026-08-05, Vereinheitlichung = offene Nutzer-Entscheidung). `useLitElement` = die EINE
  React↔Lit-Übergabestelle · `zieheGroesse` = die EINE Zieh-Mechanik für
  Block- UND Popup-Anfasser · `src/export/serializer.ts` = die eine
  Zeichen-Regel-Stelle · `bindingAttr()` in BlockDefinition = die EINE
  Stelle der Bindungs-Attribut-Form.
  **Seit C1 (2026-08-11) erledigt:** `DIALOG_RAND`
  (`blocks/shared/DialogRahmen.ts`) ist wieder die EINE Konstante für
  „Fläche − Rand" — das Popup komponiert den `DialogRahmen`, `POPUP_RAND`
  ist gelöscht (bis dahin waren es zwei gleiche 24er, und wer eine änderte,
  änderte nur das halbe Fenster).
  **Seit C2 (2026-08-16):** `istRasterFlaeche` (`state/rasterOps.ts`) ist die
  EINE Frage „liegen die Kinder hier in Zellen?" — Store, Canvas UND Export
  lesen sie, also auch der Popup-Rumpf, der bis dahin ein Fluss war.
  `rasterFlaecheCss()` (`core/blocks/rasterLayout.ts`) ist die EINE Quelle des
  Gitter-CSS für die Maskenwurzel (Export) und den Popup-Rumpf (Baustein).
  **Der Baustein „Zeile" ist ersatzlos gestrichen** (Nutzer-Entscheidung):
  Nebeneinander macht die Zelle. Bestehende Zeilen löst `migrationenRoh.ts`
  beim Laden auf — nicht wieder einbauen.
- Registry-Konzepte: `src/core/blocks/` · Bausteine: `src/blocks/` ·
  Aktions-/Quellen-Modell: `src/core/data/`
- Export: `src/export/exportMask.ts` + `validator.ts` + `preflight.ts` ·
  Runtime-Bündel: `npm run build:runtime` (Veralten-Wächter im export.test!)
- SE-Schicht: `src/softengine/` (bridge/data/relations — kennt NIE einen
  Baustein) · Kanban-Hydrierung: `src/blocks/kanban/seRuntime.ts` ·
  Ketten-Laufzeit: `src/blocks/shared/seAktionen.ts`
- Design: Masken-Tokens `src/design/masken-tokens.css` (--se-*, kantig,
  Grün) · Editor-UI `src/index.css` (shadcn, hell, Blau) — nie mischen.
