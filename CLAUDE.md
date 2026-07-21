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
Repo `behandlung-umbau` (echte, dokumentierte Maske; bei Bedarf per
add_repo an die Session hängen).

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
   `<!--SOFTENGINE-VAR!EditorPfad-->/JS/JS/basis.html.interface.js`; ohne
   diesen Anschluss bekommt WEBWARE weder SEFILELOOP-Daten noch Relationen.
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
   `npx eslint src` + `npm run check:runtime` + `npm test` +
   `npx playwright test`), nie zwischendurch.
   Sicherheitsnetz = sechs Wächter (export / seRuntime / persistence /
   e2e kanban-data / Export-Referenzabzug / Bündel-Wächter `check:runtime`,
   fünfter per Nutzer-Go 2026-07-17, sechster per Nutzer-Go 2026-07-20) —
   Nutzer-Entscheidung, nicht ohne Absprache aufblähen. Der Bündel-Wächter
   (`scripts/check-runtime-bundle.mjs`) baut das Runtime-Bündel über den echten
   CLI-Weg neu und vergleicht es mit dem eingecheckten `ff-runtime.js`; bewusst
   KEIN vitest-Test (In-Place-Bauen im vitest-Lauf würde die `?raw`-Leser
   flaky machen), sondern eigener Schritt VOR vitest.
   **Test-Bremse (Nutzer-Entscheidung 2026-07-17, Variante B bei P-C):**
   neue Browser-Tests nur, wenn ein Paket Export/Laufzeit berührt — und
   dann EIN schlanker Kreislauf-Test statt vieler Einzeltests; reine
   Editor-Bedienpakete (z. B. Zieh-Mechanik) bekommen KEINE neuen e2e.
   Der Referenzabzug (`src/export/referenzabzug.test.ts` + Referenz in
   `src/export/referenz/`) vergleicht den Export einer festen
   Referenzmaske Byte für Byte: Umbauten müssen ihn grün lassen; ändert
   ein Paket den Export ABSICHTLICH, Referenz mit `npx vitest run -u`
   erneuern — der Datei-Diff macht die Maskenänderung im Commit sichtbar.
   Berührt ein Paket den Export → SE-Echttest durch den Nutzer.
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
  PARAMS = sechs Strings `[pos, len, 'L', pindex, relId, wert]`.
  ⚠ `relId` OHNE `IDB`-Präfix (`ID0001`, nicht `IDBID0001`). Standard-PUT
  NR 174 ist nur die mitgelieferte Vorlage.
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

## Stand 2026-07-20 + Fahrplan

Historie der erledigten Pakete und alten Fahrpläne — wortgleich
ausgelagert: `docs/decisions/2026-07-20-claude-md-neuschnitt-archiv.md`.

### Was steht (vom Nutzer abgenommen, Kern-Wege SE-getestet)

- **Bausteine:** Kanban (+ Spalte/Karte — Karten-Anatomie, LEER-Regel und
  Avatar-Regeln: `docs/decisions/2026-07-16-karte-empfang-anatomie.md`),
  Schaltfläche, Formularfeld (Text + Auswahl; Ankreuzfeld bewusst
  unbindbar, bis der SE-Wert-Kontrakt belegt ist), Datumsanzeige
  (ungebunden echte Uhr, gebunden Feldwert), Zeile, Popup-Seiten
  (Seiten-Reiter am Canvas; X + Abdunklung gehören zum Baustein;
  Popup-Klarnamen müssen je Maske EINDEUTIG sein — Laufzeit-Identität,
  Preflight blockt). Export = Vollbild.
- **Kanban-Regeln:** „Einsortieren nach" ist OPTIONAL (ohne Feld → alle
  Zeilen in die Auffang-Spalte); KEIN eingebauter Schreibweg beim Ziehen —
  ein Drop führt nur die sichtbare Kette „Karte verschoben" aus, der
  nächste Daten-Push entscheidet. IDB-ID sichtbar als `ID0004`
  (Technikwert `IDBID0004` unsichtbar); Felder pflegt allein „+ Feld",
  `indexField` läuft unsichtbar.
- **Aktionsketten:** Baustein → Ereignis → Schritte. Arten: START_TOOL ·
  RELATION (GET/PUT/PUTADD über Vorlagen = Daten) · POPUP_OPEN/POPUP_CLOSE
  (Anzeige in Klarnamen). Parameterquellen: Fest / Ereignis
  ({VALUE}/{PINDEX}) / Datenfeld / Vorheriger Schritt / „Ergebnis von
  Schritt N" / SE-VAR-Array.
  Schreiben läuft NUR über sichtbare Ketten (kein Auto-PUT); Lesen
  hydriert automatisch aus der ERSTEN Zeile der Quelle. Multi-Datenquelle
  belegt: jedes Feld wählt seine Quelle, der Export sammelt alle.
- **SE-Echttests bestanden:** Formularfeld-Kette schreibt echt (PUT,
  2026-07-16) · Popup-Kreislauf (2026-07-17) · Kanban-Datenpfad +
  Aktionsketten Z2/START_TOOL. Offen: GET-Weg (s. Warteschlange).
- **Steuerung (Zentrale):** Master-Detail mit Bereichen Datenquellen |
  Relationen | Aktionen; Bearbeiten inline (FormularKarte),
  Escape-Schichtung erhalten.
- **Entfernt (Nutzer 2026-07-20, restlos):** „Quelle speichern" samt
  Änderungs-Spur/Schreib-Helfern (`f9a5af9`) · „Neuen Satz
  anlegen"/CREATE_RECORD (`24fbe54`) · Projektkarte/project-map
  (`fc5d786`) · dashboard/-Klickmodelle (`2c2d944`). Nichts davon ohne
  neue Nutzer-Entscheidung wieder einbauen.

### SE-Echttest-Warteschlange (EIN gebündelter Test durch den Nutzer)

GET-Weg + „Ergebnis von Schritt N": Kette „Schritt 1 (GET) holt eine neue
Datensatz-Stelle → je Feld ein PUT mit Stelle aus ‚Ergebnis von
Schritt 1'". Klick-Anleitung ohne Fachbegriffe:
`docs/6-memo/se-echttest-klickanleitung.md`. Kein Termindruck — der Nutzer
testet, wann er will. Nach bestandenem Echttest: dieses Gleis → main
mergen, Nebengleis löschen, ab dann wieder EIN Gleis.

### Fahrplan (Nutzer-Entscheidungen 2026-07-20)

Leitlinie: erst das Grundgerüst „fertig anfühlen" — Relations-Vertiefung
und Mehr-Quellen-Ausbau sind ausdrücklich GEPARKT.

1. ✅ **Doku-Neuschnitt** (dieses Paket): CLAUDE.md halbiert, Historie
   wortgleich nach `docs/decisions/`, tote Verweise restlos nachgezogen,
   Erledigtes gelöscht, Skills vollständig behalten.
2. **Editor-Redesign R1–R3** — Bedienung + Optik, NUR Editor-UI, Export
   unberührt (beweisbar über den Referenzabzug; Test-Bremse: keine neuen
   e2e). Blaupause = Internal-Tool-Builder (Retool & Co.), Nutzer-Wahl
   2026-07-20: hell + Blau, dicht, EIN kleiner Radius (keine Bubbles),
   keine verschwendete Fläche. R1 ✅ gebaut 2026-07-21 (Skala 4px-Radius/
   28px-Dichte · Top-Bar 40px: Maskenname statt „MVP Editor", Seiten-
   Reiter als Segmente in der Leiste, Export = blauer Primärknopf, „Alle
   Blöcke löschen" ins „…"-Menü mit Bestätigung · Canvas als Blatt mit
   Schatten + Leerzustand-Hinweis · StatusBar mit Seiten-Anzeige) —
   Screenshot-Abnahme durch den Nutzer AUSSTEHEND ·
   R2 Bibliothek + Inspector (+ Baustein-Baum links) · R3 Steuerung/
   Formulare (Ereignis-Ketten wandern an den Baustein in den Inspector).
   Detailplan je Paket, „go" je Paket, Abnahme per Screenshot.
3. **Billig-Atome:** Text/Überschrift, Trennlinie, Gruppe/Karte —
   statische Bausteine (berühren den Export → gebündelte
   Echttest-Warteschlange, fachlich trivial).
4. **Tabelle** (der große fehlende Baustein). VORHER die Grundsatzfrage
   freies Raster vs. Fluss-Layout mit dem Nutzer entscheiden — das
   **Chef-Modell liegt seit 2026-07-20 vor** (Notiz-Fotos lokal beim
   Nutzer, `docs/Test-note*`, bewusst NICHT eingecheckt, s. .gitignore):
   `GridComponent` mit fester Breite×Höhe = freies Raster;
   `PropertyDescription`-Eigenschafts-Registry (deckungsgleich mit
   Regel 2); Beispiel `KanbanBoard` 500×200 mit Swimlane-Status
   „Offen/Bearbeitet/Geschlossen".
5. Danach: Feld-Extras (Pflichtfeld/Prüfung/Standardwert/Hilfetext) ·
   Auswahl/Selektion (markierte Zeile als Parameterquelle) ·
   README/CI/Fehlerbild · Meilenstein: **Demo beim Chef** mit einer
   echten Maske.
- Später, NUR mit Fable-Plan + Doppel-Review: Schritt-Arten-Registry
  (Ketten-Schritte steckbar wie Bausteine, Unbekanntes scheitert LAUT;
  huckepack Origin-Prüfung message-Fallback + Enum-Fixes Referenzmaske →
  ein SE-Echttest).
- Später (App-Ausbau, blockiert nichts): mehrere Masken verwalten ·
  Server-Speicherung · Login · Rechte · Ein-Bearbeiter-Sperre ·
  Versionsstände.

### Merkliste

Tabellen-Spalten aus verschiedenen Quellen · bausteinübergreifende
Selektion · pflegbare Wert→Bild-Zuordnung für den Karten-Avatar
(installations-individuell; bis dahin gilt die eingebaute Empfang-Liste
in `src/blocks/card/tierIcon.ts`) · Spaltenbreiten der Tabelle in der
Maske dauerhaft merken · Sortierung wie Windows (Zahl/Datum/ABC) ·
Ankreuzfeld bindbar machen, sobald der SE-Wert-Kontrakt (J/N? 1/0?) an
einer echten Maske belegt ist · Seiten-Leiste als kompakte Aufklappliste,
falls viele Popups je Maske real werden · Vorlagen-Ablage: gespeicherte
Popups/Baustein-Gruppen wiederverwenden (Nutzer-Idee 2026-07-21, als
Bereich im künftigen Baustein-Baum) · „Maske als Datei
speichern/laden" für Sicherung/zweiten Arbeitsplatz (heute nur
Browser-Speicher + Export) · Markup-Bauen (nodeToHtml/styleAttr) aus
exportMask erst MIT dem Tabellen-Baustein herausziehen · Export wirft
unbekannte Props still weg (Preflight-Meldung fehlt) · Maske meldet
Schreib-/Lesefehler dem Bediener nicht · Masken-Titel fest „Maske" ·
Editor-UI-Testabdeckung dünn.

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
