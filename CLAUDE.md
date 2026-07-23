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
belegen auch ERPAPICALL + Stamm-Quellen ADR/ART/BEL); vertieft
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
   `npx eslint src` + `npm run check:runtime` + `npm test`), nie
   zwischendurch. **Playwright/e2e ENTFERNT (Nutzer-Entscheidung 2026-07-23):**
   die langsamen Browser-Tests fraßen Tokens und Zeit; der Nutzer prüft die
   Bedienung selbst live, und der bauende Agent prüft VOR jedem „fertig"
   selbst im Browser-Preview (Port 5173) — nie mehr den Nutzer als einzigen
   Tester. Sicherheitsnetz = fünf Wächter (export / seRuntime / persistence /
   Export-Referenzabzug / Bündel-Wächter `check:runtime`): sie prüfen genau
   das, was im Browser NICHT sichtbar ist — Export-Bytes + SE-Anschluss.
   Nutzer-Entscheidung, nicht ohne Absprache aufblähen. Der Bündel-Wächter
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

## Stand 2026-07-20 + Fahrplan

Historie der erledigten Pakete und alten Fahrpläne — wortgleich
ausgelagert: `docs/decisions/2026-07-20-claude-md-neuschnitt-archiv.md`.

### Was steht (vom Nutzer abgenommen, Kern-Wege SE-getestet)

- **Bausteine:** Kanban (+ Spalte/Karte — Karten-Anatomie, LEER-Regel und
  Avatar-Regeln: `docs/decisions/2026-07-16-karte-empfang-anatomie.md`),
  Schaltfläche, Formularfeld (Text + Auswahl; Ankreuzfeld bewusst
  unbindbar, bis der SE-Wert-Kontrakt belegt ist; gebundene Felder zeigen
  den Klarnamen im Editor in PLATZHALTER-Optik — grau, Feld wirkt leer,
  Nutzer-Go 2026-07-22 — nie wie ein Wert), Datumsanzeige
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
  (Anzeige in Klarnamen). Parameterquellen: Fest / Ereigniswert
  ({VALUE}/{PINDEX}) / Datenfeld / Vorheriger Schritt / „Ergebnis von
  Schritt N" / SE-VAR-Array — Kurz-Klarnamen seit 2026-07-22 exakt so im
  Formular; die Namen leben NUR im Editor (Tabelle im StepForm), nicht im
  Runtime-Bündel. Das freie Feld „Ergebnisname" ist ENTFERNT (Nutzer
  2026-07-22): „Ergebnis von Schritt N" ersetzt es; Alt-Namen bleiben beim
  Bearbeiten erhalten, die Laufzeit liest sie unverändert.
  Schreiben läuft NUR über sichtbare Ketten (kein Auto-PUT); Lesen
  hydriert automatisch aus der ERSTEN Zeile der Quelle. Multi-Datenquelle
  belegt: jedes Feld wählt seine Quelle, der Export sammelt alle.
- **SE-Echttests bestanden:** Formularfeld-Kette schreibt echt (PUT,
  2026-07-16) · Popup-Kreislauf (2026-07-17) · Kanban-Datenpfad +
  Aktionsketten Z2/START_TOOL · GET-Weg + „Ergebnis von Schritt N" samt
  Wert-Zufluss und Anlegen über ZWEI Quellen/Indizes gleichzeitig
  (2026-07-22). **Kein offener SE-Kontrakt mehr.**
- **Steuerung (Zentrale):** Master-Detail mit Bereichen Datenquellen |
  Relationen | Aktionen; Bearbeiten inline (FormularKarte),
  Escape-Schichtung erhalten.
- **Relation-Auswahl vereinheitlicht (Nutzer 2026-07-22):** Der Vorlagen-
  Filter im Schritt-Formular UND in der Steuerung läuft über EINEN Umschalter
  (`SegmentControl`, Optionen `RELATION_GRUPPEN` in `zentrale/helfer.ts` =
  die eine Ablage): Mini-Tabs **Lesen | Schreiben**, „Alle" gestrichen
  („ist dumm"). Die Suche findet in BEIDEN Gruppen — bei aktiver Suche steht
  die Trefferzahl je Tab (`Lesen · 0` / `Schreiben · 2`) und die Ansicht
  springt zum Tab mit Treffern, wenn der aktive leer ist; Lesen/Schreiben
  bleiben getrennt (nie gemischt). Reine Editor-UI, Export unberührt
  (Bündel-Wächter „identisch", Referenzabzug byte-gleich, keine neuen Tests).
- **Entfernt (Nutzer 2026-07-20, restlos):** „Quelle speichern" samt
  Änderungs-Spur/Schreib-Helfern (`f9a5af9`) · „Neuen Satz
  anlegen"/CREATE_RECORD (`24fbe54`) · Projektkarte/project-map
  (`fc5d786`) · dashboard/-Klickmodelle (`2c2d944`). Nichts davon ohne
  neue Nutzer-Entscheidung wieder einbauen.

### SE-Echttest 2026-07-22: BESTANDEN — Warteschlange leer

In EINEM Lauf bestätigt (echte SE-Logs des Nutzers): GET-Weg liefert
(640 → neuer Satz-Index) · „Ergebnis von Schritt N" trägt die Stelle
korrekt in die PUTs — auch mit ZWEI Quellen/Indizes GLEICHZEITIG
(Anlegen-Muster live: GET ID0001→277 + GET ID0004→230, jeder PUT trifft
die richtige Tabelle) · getippte Werte fließen über das gebundene Feld in
den PUT · Sichtprüfung Text/Trennlinie/Datum-Optik: sieht in SoftEngine
aus wie im Editor (Nutzer-Abnahme 2026-07-22).
Lehre aus dem ersten Fehlversuch (dokumentiert, damit sie nie wieder Zeit
kostet): Formularfeld war ungebunden und der Wert-Parameter las ein
anderes Feld, als Position/Länge beschrieben — Masken-Konfiguration, kein
Code-Fehler. Merksatz **„Dreier-Regel": Wert, Position, Länge = dreimal
dasselbe Feld;** nur die Stelle kommt aus Schritt 1.
**Damit fällig: dieses Gleis → main mergen, Nebengleis löschen, ab dann
wieder EIN Gleis** (Merge macht die lokale Sitzung auf Nutzer-Auftrag,
2026-07-22).

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
   vom Nutzer LIVE abgenommen (2026-07-21) ·
   R2 ✅ gebaut 2026-07-21 (Bibliothek oben Hauptdarsteller: kompakte
   Icon-Karten je Kategorie, Klick/Drag unverändert · Baustein-Baum „Aufbau"
   war zwischenzeitlich gebaut, auf Nutzer-Entscheidung 2026-07-21 aber
   RESTLOS wieder entfernt [BausteinBaum.tsx + blockLabels.ts gelöscht,
   Sidebar-Einbindung raus; blockIcons.ts BLEIBT — die Bibliothek nutzt die
   Icons weiter] ·
   Inspector: feste Reihenfolge Inhalt→Daten mit feiner Trennlinie statt
   Abschnitts-Überschriften, gestrichelte Leer-Karte im Canvas-Stil, Labels
   11 px, Kopf OHNE Technik-Unterzeile [Regel 3], Beschreibungen als
   Label-Tooltip statt angeklebtem ⓘ, Farb-Eigenschaft als dezente Kacheln
   [echte --se-Farben, gewählte mit Ring, Tooltip = Klarname] statt Dropdown
   über Editor-Tabelle `src/editor/inspector/optionColors.ts` [rein
   Editor-seitig, Baustein-„select" unverändert] · Icons als Editor-Tabelle
   `blockIcons.ts`, Lucide bleibt aus dem Runtime-Bündel — Bündel-Wächter
   „identisch". Genehmigte e2e-Ausnahme: drei Kopf-Assertions [formfeld/
   kanban/zwischenspeicher] von der Technik-Zeile auf die Kopf-Überschrift
   umgestellt, Wächter-Zweck bleibt) — vom Nutzer LIVE begleitet und
   abgenommen (2026-07-21, inkl. aller 9 Korrekturpunkte + Baum-Aus) ·
   R3 Steuerung/Formulare — KORRIGIERTER ZUSCHNITT (Nutzer 2026-07-21):
   NUR die Ereignis-Ketten wandern an den Baustein (Inspector-Abschnitt
   „Aktionen"); die Steuerung STIRBT NICHT, sie bleibt als schlankes
   Verwaltungsfenster für Datenquellen + Relationen (maskenweite, selten
   angefasste Pflege) und bekommt nur die neue Optik.
   Detailplan je Paket, „go" je Paket. **Abnahme: der Nutzer prüft LIVE
   im Browser — KEINE Screenshot-/Galerie-Erzeugung mehr (Nutzer-
   Entscheidung 2026-07-21, „frisst unnötig Tokens"); Beweis = Prüfbündel-
   Ergebnis in Textform.**
   R3 ✅ gebaut 2026-07-21: Inspector-Abschnitt „Aktionen"
   (`src/editor/inspector/AktionenSektion.tsx`), registry-getrieben über
   `blockEvents` (kein Typ-Check), erscheint nach Inhalt/Daten mit feiner
   Trennlinie · je Ereignis EINE kompakte Kopfzeile (Name links, kleiner
   „+"-Icon „Schritt hinzufügen" rechts), Schritte als dichte Zeilen direkt
   darunter, KEIN Leerzustand-Text/keine eigene Knopf-Zeile (Punkt 10, Nutzer
   2026-07-21: Leerzustände kosten null zusätzliche Höhe) ·
   Sortieren/Bearbeiten/Duplizieren/Löschen + Undo (updateBlockEvents) exakt
   wie zuvor im Bereich · StepForm im VERHALTEN unverändert wiederverwendet
   (bleibt in `zentrale/`); die Schritt-Bearbeitung öffnete zunächst als Karte
   AM PANEL (Portal), seit dem R3-Feinschliff blättert stattdessen das
   Inspector-Panel um (s. unten), Escape-Schichtung erhalten ·
   Steuerung: Bereich „Aktionen" restlos raus (`AktionenBereich.tsx`
   gelöscht, Kommandozentrale auf zwei Bereiche Datenquellen|Relationen,
   Toolbar-Tooltip nachgezogen) · die Lese-Ansichten beider Bereiche teilen
   jetzt EINE Label-Stelle (`src/editor/zentrale/Gruppe.tsx`) — löst die
   kopierten Eyebrow-Überschriften + den R2-Hinweis „11-px-Labels" auf
   (Stufen: 10 px Eyebrow / 11 px Field / 14 px Detail-Titel) · Formular-
   Labels auf EINE Größe 11 px gezogen (Nutzer-Go 2026-07-21, „ruhiges
   Bild": StepForm-Gruppenlabels + Parameter-Spaltenköpfe und DataSourceForm
   „Felder" von 12/10 px → 11 px; Felder/Reihenfolge/Verhalten unberührt,
   RelationForm lief schon über Field). Prüfbündel grün (tsc · eslint ·
   check:runtime „identisch" · 103 vitest · 11 e2e), Export beweisbar
   unberührt, keine Testdatei/keine neuen e2e — LIVE-Abnahme durch den
   Nutzer steht aus.
   R3-Feinschliff ✅ gebaut 2026-07-21 (Plan von Fable, „Panel blättert um"):
   „Daten anschließen" UND das Schritt-Formular überlagern den Inspector nicht
   mehr (kein Modal/kein 460-px-Portal) — der Inspector hält EINEN Zustand
   `unteraufgabe` und wechselt seinen Inhalt komplett zur Aufgabe: SidePanel im
   Rückzeilen-Modus („← <Baustein>" + Aufgaben-Titel), 340 px EXAKT, Controls
   gestapelt (StepForm-Parameterzeilen: Name+Quelle in einer Zeile, Wert in
   voller Breite darunter — geprüft mit dem 6-Parameter-PUT: kein Querlauf).
   Escape/„Fertig"/„←" blättern zurück (capture+stopPropagation wie zuvor bei
   FormularKarte/Modal); Baustein-Wechsel schließt die Unteraufgabe (Render-
   Muster „State beim Auswahl-Wechsel anpassen", KEIN setState-im-Effekt).
   BindungsStrecke/StepForm liefern nur noch ihren Inhalt (kein Modal/keine
   FormularKarte-Hülle); die Schritt-Abschnitte bleiben role="group" — die e2e
   (formfeld-/kanban-/zwischenspeicher-data) zielen auf die Panel-Ansicht statt
   den Dialog (genehmigte Ausnahme, Flüsse + Assertions identisch). Beifang
   (Nutzer-Brille): die handgebauten Schritt-Selects auf EINE Größe (12 px wie
   die übrigen Controls; Labels bleiben 11 px), Popup-Select h-8→h-7, toter
   Parameter-Spaltenkopf raus. `ui/molecules/modal.tsx` ist damit ungenutzt
   (nur noch FieldPicker trägt sein eigenes role=dialog) — bewusst NICHT gelöscht
   (nicht selbst angelegt; s. Aufgefallen). Prüfbündel grün (tsc · eslint ·
   check:runtime „Bündel identisch" · 103 vitest · 11 e2e), Export beweisbar
   unberührt, keine neuen Tests.
   R3-Abschluss ✅ (Fable, 2026-07-21): Vorlagen-Anzeige entschärft — die
   volle Relations-Syntax ist NIE mehr Anzeigetext (Regel 3): Vorlagen-Liste
   und Schritt-Zeilen zeigen den Klarnamen bzw. bei ungetauften Vorlagen
   „<VERB> · Nr. <nr>" (`src/editor/zentrale/relationAnzeige.ts` = DIE eine
   Stelle dafür), die Syntax lebt nur noch als Hover-Tooltip + Suchtreffer ·
   Parameterzeilen EINZEILIG (Name | Quelle | Wert — halbe Höhe beim
   6-Parameter-PUT) · totes `ui/molecules/modal.tsx` gelöscht ·
   Referenzmasken eingecheckt: `docs/chef-maske/` (empfang + behandlung).
   R3 gesamt vom Nutzer LIVE abgenommen (2026-07-21) — das
   Editor-Redesign R1–R3 ist damit KOMPLETT abgeschlossen.
3. ✅ **Billig-Atome** gebaut 2026-07-21 (Plan `docs/1-plans/atome.plan.md`,
   UMGEPLANT: EIN Text-Baustein statt zwei, Gruppe gestrichen). Zwei statische
   Bausteine, registry-getrieben (Regel 2, kein `if typ`).
   **Text** (`ff-text`, Anzeige): EIN Bibliothekseintrag; die Optik bestimmen
   DREI freie Stil-Eigenschaften in EINER kompakten Inspector-Zeile
   „Text-Stil" (2. Umplanung, Nutzer 2026-07-21: „nicht per Auswahl — ich
   will entscheiden, wo es liegt, wie viele Pixel groß, dünn, dick"):
   `groesse` = freie Pixelzahl (6–96, Standard 14; Stufen-Werte der ersten
   Fassung werden still auf Pixel abgebildet) · `gewicht` = Dünn/Normal/Fett ·
   `ausrichtung` = Links/Mitte/Rechts (Icons). Inhalt per
   Doppelklick am Ding, Default-Text = überschreibbarer Platzhalter (Regel 7).
   KEINE Art-Umschaltung / kein zweiter Eintrag (Nutzer 2026-07-21: „ich nehm
   Text auch als Überschrift, wenn die Größe einstellbar ist") · **Trennlinie**
   (`ff-trenner`, Layout): 1px-Linie in --se-line, volle Breite (kein Anfasser),
   fester dezenter Abstand, KEINE Eigenschaften (Regel 10). Icons in
   `blockIcons.ts` (Lucide bleibt aus dem Bündel). **Gruppe GESTRICHEN** (Nutzer
   versteht ihren Nutzen nicht → Regel 10; kommt erst wieder, wenn sie beim
   Popup-Bauen real vermisst wird). **Export berührt (absichtlich):**
   `ff-runtime.js` neu gebaut (wächst um ff-text/ff-trenner), Referenzabzug
   erneuert (nur das eingebettete Bündel ändert sich, Masken-HTML byte-gleich),
   Veralten-Wächter-Positivliste um ff-text/ff-trenner ergänzt (der im Kahlschlag
   2026-07-14 entfernte ff-text ist als statisches Atom NEU). export.test:
   ein Fall je Baustein (Text-Stil-Attribute + Escaping, Trennlinie),
   KEINE neuen e2e (Test-Bremse). **Beifang Bibliothek:** Kategorien durch feine
   Trennlinie getrennt (Muster Inspector).
   **Feinschliff-Pass (Fable, 2026-07-21, nach Opus' Atome-Commit):**
   Inspector-Zeilen-Mechanik generisch (`inspectorRow` + kinds
   number/segment in PropertyDescription; NumberControl/SegmentControl,
   Icon-Tabelle `segmentIcons.ts` — Registry-Daten, kein Sondercode) ·
   **Datum-Optik nach Chef-Vorbild** `.vuhr` (Empfang): Zeit 17px/600/mono,
   Datum 11.5px gedämpft darunter, KEIN Kasten — löst den „Windows 98"-Look
   ab (Nutzer 2026-07-21); gebunden zeigt die Hauptzeile den Feldwert,
   Spot-Markierung unverändert · **Farb-Kacheln repariert**: Haken IN der
   Kachel statt Außen-Ring (der wurde am Panel-Rand abgeschnitten =
   „passt nicht rein") · **Hinweiszeilen** für sonst leer wirkende
   Inspector-Panels (Karte/Trennlinie/Zeile) über Editor-Tabelle
   `blockHinweise.ts` — ein Satz, wo die Bedienung am Ding stattfindet.
   Prüfbündel grün (tsc · eslint · check:runtime „identisch" · 105 vitest ·
   11 e2e), Masken-Markup im Referenzabzug byte-gleich (nur Bündel).
   LIVE-Abnahme + SE-Sichtprüfung BESTANDEN (2026-07-22).
3b. **„Feld übernehmen" + sprechende Namen ✅ gebaut 2026-07-22** (v0.1.0,
   Plan `docs/1-plans/feld-uebernehmen.plan.md`; Codex-Implementierung +
   Claude-Gegencheck, editor-only, Prüfbündel grün, kein SE-Echttest).
   „Feld übernehmen" am Schreib-Schritt: der Auslöser sitzt AN der
   Parameter-Zeile (Symbol + Enter im Wert-Feld) und erkennt POS/LEN/IDBID
   als Ganz-String MIT und OHNE `{}` — behebt, dass er bei der echten
   Nutzer-Vorlage mit nackten Wörtern nie erschien. POS füllt
   Position+Länge, IDBID die Tabelle; **der WERT füllt sich NICHT
   automatisch** und die Satz-Nummer bleibt beim Bediener
   (Nutzer-Entscheidung 2026-07-22). Zweistufiger Picker (Quelle → Feld)
   mit Viewport-Einklemmung (Nutzer-Fund) + Escape-Schichtung.
   Sprechende Namen: `eigenerText` (zentrale/helfer.ts) liest zusätzlich
   `placeholder`, default-bewusst (frisches Formularfeld bleibt
   „Formularfeld", stabile IDs unverändert, Regel 3).
   **QUELLDATEN-Wertquelle ✅ gebaut 2026-07-22, SE-Echttest BESTANDEN
   (Nutzer 2026-07-23):** neue Parameterquelle „Baustein"; wählbar sind
   vorerst Formularfelder mit ihrem Inline-Namen. Geschrieben wird ihr
   aktueller Wert, ausdrücklich OHNE Datenquellen-Bindung; gespeichert wird
   die stabile Baustein-ID. Registry-Opt-in (`actionValueSpots`) hält
   weitere Bausteine später erweiterbar. Laufzeit/Export + Lösch-Preflight
   sind gebaut. Beim ersten Nutzerexport fehlte wegen Runtime-Build/HMR-Race
   das ganze Bundle (HTML unsichtbar): Runtime-Build leert den Zielordner
   nicht mehr, Validator blockt leere Runtime jetzt ausdrücklich.
   **Aktuelle Reihenfolge:** Tabelle → Größen-Paket.
   **Offen — Größen-Paket** „Höhe an jedem Baustein ziehbar + Startgrößen"
   (erfüllt Tobis GridComponent-Skizze wörtlich). **Grundsatz-Entscheidung
   2026-07-22 (Nutzer, nach Skizzen-Abgleich):** das Fundament bleibt
   Fluss/Nachrücken — Tobis Skizze fordert nur einstellbare GRÖSSEN, keine
   festen Plätze; freies Raster nur, falls je ein echter Fall es erzwingt
   (Preisschild: Canvas-Neubau).
4. **Tabelle** (der große fehlende Baustein). VORHER die Grundsatzfrage
   freies Raster vs. Fluss-Layout mit dem Nutzer entscheiden — das
   **Chef-Modell liegt seit 2026-07-20 vor** (Notiz-Fotos lokal beim
   Nutzer, `docs/Test-note*`, bewusst NICHT eingecheckt, s. .gitignore):
   `GridComponent` mit fester Breite×Höhe = freies Raster;
   `PropertyDescription`-Eigenschafts-Registry (deckungsgleich mit
   Regel 2); Beispiel `KanbanBoard` 500×200 mit Swimlane-Status
   „Offen/Bearbeitet/Geschlossen".
5. Danach (Reihenfolge = Nutzer-Entscheidung 2026-07-23):
   **Zeilen-Auswahl/Nachschlagen** — markierte Zeile als Parameterquelle
   UND der vom Nutzer benannte Lookup-Fall („ganz wichtig"): Formularfeld
   anklicken → Enter → Popup mit z. B. Tabelle öffnet sich → Bediener
   wählt eine Zeile → der gewollte Wert wird ins Feld übernommen.
   Baut auf Tabelle + Popups + Ketten auf — Tabelle MUSS davor fertig
   sein · **Wizard** (Nutzer 2026-07-23 angemeldet, Zuschnitt offen —
   mehrstufige Maske; braucht eigenen Fable-Plan, Fragen erst wenn dran) ·
   README/CI/Fehlerbild · Meilenstein: **Demo beim Chef** mit einer
   echten Maske. **Feld-Extras (Pflichtfeld/Prüfung/Standardwert/
   Hilfetext): zurückgestuft auf „irgendwann vielleicht"**
   (Nutzer 2026-07-23), nicht mehr Teil der nahen Reihenfolge.
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
Popups/Baustein-Gruppen wiederverwenden (Nutzer-Idee 2026-07-21, Ort
offen) · „Maske als Datei
speichern/laden" für Sicherung/zweiten Arbeitsplatz (heute nur
Browser-Speicher + Export) · Markup-Bauen (nodeToHtml/styleAttr) aus
exportMask erst MIT dem Tabellen-Baustein herausziehen · Export wirft
unbekannte Props still weg (Preflight-Meldung fehlt) · Maske meldet
Schreib-/Lesefehler dem Bediener nicht · Masken-Titel fest „Maske" ·
Editor-UI-Testabdeckung dünn — laut Architektur-Review 2026-07-21 tiefer
als notiert: auch Migrationen/Baum/Undo/SE-Datenschicht ohne eigene Tests,
und `relations.test.ts` testet nur das Modell, nicht die gleichnamige
Laufzeit-Datei (Nachzieh-Paket ~½ Tag, kein Export) · TRIP-Skills
(~4.000 Zeilen in `.claude/`): testen, sobald Codex-Kontingent frei,
sonst abspecken — Entscheidung offen · doppelter Schlüssel-Scan in
`softengine/data.ts` (getField/setField) noch offen (war NICHT Teil des
Kleinputz-Pakets v0.1.0) · Feld-übernehmen für Stammtabellen (ADR/ART/BEL)
wartet auf belegten Stamm-PUT-Kontrakt · Formularfeld-Option „startet leer" für
Anlege-Masken (gebunden fürs Schreiben, zeigt keinen Bestandswert;
Kontrakt seit 2026-07-22 belegt, Nutzer-Bedenken notiert) ·
Steuerung zeigt Vorlagen-Parameter nur als „Fester Wert" ohne den Wert
selbst (besser: „Fester Wert: ‚X'") · Preflight warnt nicht, wenn eine
Kette ein Datenfeld liest, das kein Baustein der Maske pflegt.

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
