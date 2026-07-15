# Aufbau-Editor — Projektgedächtnis

> **Zuerst lesen — bewusst kurz.** Aktuelle Aussagen des Nutzers und der Code
> schlagen diese Datei; bei Widerspruch nachfragen. Der Nutzer kann nicht
> programmieren: diese Regeln + die Prüfungen sind sein Ersatz dafür, Code
> lesen zu können. **Vor jeder Code-Änderung: Plan zeigen, „go" abwarten.**
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
6. **Alter Editor = nur Funktionsliste.**
7. **Bedienung am Ding:** Anfasser, Doppelklick, Klick auf die Stelle;
   Inspector nur für Unzeigbares; der Editor **erfindet nie Daten**
   (Striche statt Demo-Werte, der Klarname ist die Vorschau).
8. **Ein Arbeitsbaum = ein Agent** (Claude und Codex nie parallel im selben
   Ordner); Übergabe nur über gepushte Commits; ein Thema = ein Commit.
9. **Prüfungen einmal gebündelt vor dem Commit** (`npx tsc -b` +
   `npx eslint src` + `npm test` + `npx playwright test`), nie zwischendurch.
   Sicherheitsnetz = vier Wächter (export / seRuntime / persistence /
   e2e kanban-data) — Nutzer-Entscheidung, nicht ohne Absprache aufblähen.
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
- **GET-Antworten** landen in `SEDATA.Message<N>`; immer nur EINE Anfrage
  in Flug (Warteschlange, Muster `seGetNewIndex`) — Grundlage für Z3.
- **START_TOOL:** `sendBWLinkIntern('0,START_TOOL,<nr>[,params URL-kodiert]')`,
  Fallback `basisHTML_SND_MSG`. Werkzeug-Nummern je Installation individuell.
- **Quellen-Arten bestimmen die SEvariablen-Form:** IDB → SEFILELOOP
  `FELDER:'*'`; Stamm (ADR/ART/BEL) → explizite pos_len-Liste (+ optional
  FREISELEKT). MEMTAB/ERPAPICALL erst bauen, wenn die Form an einer echten
  Maske belegt ist.

## Stand (2026-07-15) + vereinbarte nächste Schritte

- **Bibliothek:** Kanban (+ Spalte/Karte, Datenpfad in SoftEngine bestätigt),
  Schaltfläche, Formularfeld (v1 statisch, Neubau nach behandlung-Referenz),
  Zeile. Export = Vollbild (`height: 'fill'`, Schema-v2-Migration).
  Aktionsketten (Z2/START_TOOL) in SoftEngine bestätigt.
- **Steuerung** (Aktionen | Datenquellen | Relationen) wird nach der
  Demo-Vorlage neu geschnitten.
- **Klickmodelle als Diskussionsgrundlage** (kein Produktcode, Einbau erst
  nach Detail-Besprechung + „go"): `dashboard/kommandozentrale-demo.html`,
  `dashboard/datatable-demo.html`, `dashboard/popup-demo.html`.
- **Vereinbarter Fahrplan (2026-07-15, Claude + Codex einig; Umbau und
  neue Funktionen sind IMMER getrennte Pakete):**
  1. ✅ **N1** Formularfeld-Nacharbeiten (erledigt 2026-07-15) — nur
     Darstellung/Bedienung, kein GET/PUT: Beschriftungs-Klick schaltet in
     der Maske den Haken (im Editor bleibt er Umbenennen-Ziel),
     Platzhalter-Position über gemeinsame Innenabstands-Variablen statt
     Magic Numbers, Text-Template zusammengezogen, „Text …"-Griff auch
     für geleerte Ankreuzfeld-Beschriftung.
  2. ✅ **SoftEngine-Schicht herausgezogen (erledigt 2026-07-15),
     verhaltensgleich:** `src/softengine/` — `bridge.ts` (Anmeldung,
     Daten-Push, Diagnose, Abo-Punkt `onSeDaten`), `data.ts` (getField/
     setField/rowsFor/Quellen), `relations.ts` (Vorlagen, PUT; die
     GET-Warteschlange zieht mit Schritt 3 hier ein). Kanban-seRuntime
     enthält nur noch Kanban (Hydrierung, Spaltenwahl, Karten-Drag) und
     hört als erster Zuhörer auf die Klingel. Abhängigkeitsregel gilt:
     Bausteine importieren die Schicht — die Schicht kennt NIE einen
     Baustein. Keine neuen Funktionen im Paket; Tests unverändert grün.
  2b. ✅ **Zentrale-Gerüst (eingeschoben + erledigt 2026-07-15,
     Nutzer-Entscheidung: kein neues Feature mehr in die alte Steuerung):**
     Steuerung neu als Master-Detail nach der Demo-Vorlage — Bereiche
     Übersicht | Datenquellen | Relationen | Aktionen; Bearbeiten inline
     (FormularKarte statt Modal im Modal, Escape-Schichtung erhalten);
     Detail zeigt Felder/Parameter mit Klartext-Bedeutung, Syntaxzeile
     und „Verwendung in dieser Maske"; Übersicht = Kacheln + „Zu
     erledigen" aus der VORHANDENEN Export-Vorprüfung mit Sprung.
     Alte DataSourceList/RelationList gelöscht (kein toter Code).
     Bereich „Verknüpfungen/Auswahl-Filter" kommt erst MIT der
     Selektions-Funktion; tiefe Zentrale-Funktionen (Syntax-Import,
     IDB-Import, Arten-Katalog, Ampeln über die Vorprüfung hinaus)
     kommen als eigene Pakete, wenn ihre Grundlage existiert.
  3. **Gemeinsame GET/PUT-Logik — ÜBERGEBEN AN CODEX (Nutzer-Entscheidung
     2026-07-15).** Arbeitsauftrag (vor dem Bau: Plan zeigen, „go"
     abwarten — die Arbeitsregeln oben gelten unverändert):
     a) `src/softengine/relations.ts`: GET-Ausführung mit
        Antwort-Warteschlange. GET-Antworten landen in
        `SEDATA.Message<N>`; immer nur EINE Anfrage in Flug, Antwort
        abwarten, dann die nächste (Muster `seGetNewIndex` der
        Empfang-Referenz — liegt lokal:
        `behandlung-umbau/empfang/index.basis.source.html`). Die Antwort
        wird unter dem Ergebnis-Namen des Schritts (`resultKey`) in einem
        Ketten-Zwischenspeicher abgelegt.
     b) `src/blocks/shared/seAktionen.ts`: neuer Schritt-Typ „Relation
        ausführen" — Vorlage über `FF_RELATIONS` auflösen (nie NR
        festverdrahten); GET wartet auf die Antwort, PUT/PUTADD =
        fire-and-forget über `sendPut`; FOLGE-Schritte derselben Kette
        dürfen `{ergebnisName}` als Platzhalter benutzen
        (Platzhalter-Auflösung erweitern). Ketten-Sperre bleibt.
     c) Steuerung (Gerüst): StepForm bekommt die Schritt-Art „Relation
        ausführen" — Vorlagen-Auswahl mit Anzeigenamen; bei GET ein Feld
        „Ergebnis speichern als"; der AktionenBereich zeigt
        „speichert als {name}". Preflight blockt Relation-Schritte ohne
        gewählte/bekannte Vorlage.
     d) ⚠ FALLE Export: `exportMask` sammelt FF_RELATIONS heute NUR aus
        kind-'relation'-Props der Bausteine — Relations-Schritte in
        Aktionsketten MÜSSEN mitgesammelt werden, sonst läuft die Kette
        in der Maske ins Leere. Gleiches gilt für den Verwendungs-Scan
        der Relationen-Bibliothek (Löschen-Warnung + „Verwendung in
        dieser Maske").
     e) Handwerk: Umbau und neue Funktionen getrennte Commits; Prüfungen
        einmal gebündelt vor dem Commit; Tests nur innerhalb der vier
        Wächter-Dateien erweitern; nach Änderungen an Blöcken/softengine
        `npm run build:runtime` (der Veralten-Wächter fängt Vergessenes);
        alter Editor `runtime/actions.ts` (executeSteps, step_ref) NUR
        als Funktionsliste. Danach SE-Echttest durch den Nutzer.
  4. **Formularfeld anschließen** (Feld-Bindung lesen/schreiben; dabei
     Platzhalter-Regel: weg, sobald das Feld einen Wert HAT — egal woher).
  5. **Popup P1–P5 darauf aufbauen** (Seiten-Modell: Maske = Hauptseite +
     Popup-Seiten als normale Block-Bäume; Größe per Anfasser;
     Aktions-Schritte „Popup öffnen/schließen"; Export als inaktive
     Vorlage im selben HTML). Popup-Darstellung + Lebenszyklus bleiben
     beim Popup — nur Datenzugriff/Relationen laufen über die
     SoftEngine-Schicht.
  Danach: Tabelle, Verknüpfungen/Selektion, Quellen-Arten-Registry
  (+ ERP-API/MEMTAB nach Beleg), Steuerung-Neuschnitt nach Demo-Vorlage.
- **Merkliste:** Platzhalter muss auch bei programmatischem Befüllen
  verschwinden (gehört zur Feld-Datenbindung); Tabellen-Spalten aus
  verschiedenen Quellen; bausteinübergreifende Selektion; Avatar-Zuordnung
  ein-/ausblendbar; Datumsanzeige-Baustein; Spaltenbreiten der Tabelle in
  der Maske dauerhaft merken; Sortierung wie Windows (Zahl/Datum/ABC).

## Übergabe-Stand (2026-07-15, Claude → Codex)

Branch `claude/data-binding-architecture-odkwi0` (gepusht, Arbeitsbaum
sauber) enthält: N1 Formularfeld-Nacharbeiten, SoftEngine-Schicht-Umzug
(`src/softengine/`), Zentrale-Gerüst (Master-Detail + Inline-Formulare),
Eingabe-Proportionen-Fix, die drei Klickmodelle in `dashboard/` und diese
Datei. Auf `main` liegt davon nur das CLAUDE.md. **Ab hier baut Codex**
(Fahrplan-Schritt 3) — ein Arbeitsbaum = ein Agent: Claude fasst den Code
nicht an, bis der Nutzer zurückübergibt; Übergaben ausschließlich über
gepushte Commits.

## Wichtige Stellen

- Store: `src/state/Editor.ts` · Registry-Konzepte: `src/core/blocks/` ·
  Bausteine: `src/blocks/`
- Export: `src/export/exportMask.ts` + `validator.ts` + `preflight.ts` ·
  Runtime-Bündel: `npm run build:runtime` (Veralten-Wächter im export.test!)
- SE-Laufzeit: `src/blocks/kanban/seRuntime.ts` (Umzug nach
  `src/softengine/` = Fahrplan-Schritt 2) · `src/blocks/shared/seAktionen.ts`
- Design: Masken-Tokens `src/design/masken-tokens.css` (--se-*, kantig,
  Grün) · Editor-UI `src/index.css` (shadcn, hell, Blau) — nie mischen.
