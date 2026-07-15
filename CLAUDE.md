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
   sichtbar sind Klarnamen. (Bewusste Nutzer-Ausnahme: Kanban-Spaltentitel
   = Datenwert.)
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
- **Umbau-Fahrplan „Alles fixen" (2026-07-15, Nutzer-Entscheidung nach
  Code-Gutachten; läuft VOR N1). Jedes Paket: verhaltensgleich, ein
  Commit, Prüfungen gebündelt davor; SE-Echttests gebündelt (max. zwei):**
  1. ✅ **U0** CLAUDE.md: diesen Fahrplan eintragen (dieses Paket).
  2. **U1** Ladefehler sichtbar + Notfallkopie: kaputter Speicherstand
     wird ERST unter zweitem Schlüssel gesichert (Autosave darf ihn nie
     überschreiben), dann Klartext-Meldung statt stummem Leerstart.
     persistence-Wächter bekommt die Testfälle (abgesprochen).
  3. **U2** Subject auf Set (keine Doppel-Abos, sauberes Abmelden).
  4. **U3** SoftEngine-Schicht herausziehen (= alter Schritt 2): aus
     `blocks/kanban/seRuntime.ts` nach `src/softengine/` — `bridge.ts`
     (Anmeldung, Daten-Push, Diagnose), `data.ts` (getField/setField/
     rowsFor/Quellen), `relations.ts` (Vorlagen, PUT), `types.ts`;
     im Kanban bleibt nur `kanbanRuntime.ts` (Hydrierung, Karten-Drag).
     Einzige strukturelle Naht: der Abo-Punkt für Daten-Pushs. KEINE
     neuen Funktionen. Bausteine importieren die Schicht — die Schicht
     kennt NIE einen Baustein. Verschieben → Tests grün → Bündel neu
     bauen → **SE-Echttest 1 (Nutzer)**.
  5. **U4** Editor.ts zerlegen: Store-Kern, Baumoperationen, Historie,
     Persistenz (inkl. U1), Migrationen, Musterkarten-/Schutzregeln —
     je ein Modul, Außenverhalten identisch.
  6. **U5** Editor über Providers (React Context) statt globalem
     Singleton; die drei Import-Stellen stellen um.
  7. **U6** BlockHost zerlegen: Hooks (Element-Brücke, Bindung/Picker,
     Größenziehen) + kleine Komponenten (Chrome, Anfasser, Picker).
     Editor-Hilfen bleiben im Host (Regel 1).
  8. **U7** Element-Adapter als React↔Lit-Grenze (erzeugen/Props/
     aufräumen an einer Stelle; Host kennt keine Details mehr).
  9. **U8** Bindungs-/Export-Verträge explizit: `<prop>Field`-Konvention
     wird typgeprüfte Registry-Angabe; Editor, softengine-Schicht und
     Export lesen DIESELBE Definition; Rundlauf-Test. Ziel: Export
     Byte-identisch (export-Wächter beweist es).
  10. **U9** Exporter auf neutralen Zwischenbaum + einen Serialisierer
     (ASCII/LF/Reihenfolge an genau einer Stelle). Ziel: Byte-identisch;
     nur falls U8/U9 Bytes ändern → **SE-Echttest 2 (Nutzer)**.
  11. **U10** Rein historische Kommentar-Passagen nach `docs/decisions/`
     (eine Datei pro Entscheidung); im Code bleibt der gültige Vertrag.
- **Danach Funktions-Fahrplan (Umbau und neue Funktionen IMMER getrennte
  Pakete):**
  1. **N1** Formularfeld-Nacharbeiten — nur Darstellung/Bedienung, kein
     GET/PUT (Beschriftungs-Klick schaltet Haken in der Maske,
     Platzhalter-Robustheit, Doppel-Zweig).
  2. **Gemeinsame GET/PUT-Logik ergänzen** (GET-Warteschlange nach
     seGetNewIndex-Muster + Zwischenspeicher — der Z3-Kern).
  3. **Formularfeld anschließen** (Feld-Bindung lesen/schreiben; dabei
     Platzhalter-Regel: weg, sobald das Feld einen Wert HAT — egal woher).
  4. **Popup P1–P5 darauf aufbauen** (Seiten-Modell: Maske = Hauptseite +
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

## Wichtige Stellen

- Store: `src/state/Editor.ts` · Registry-Konzepte: `src/core/blocks/` ·
  Bausteine: `src/blocks/`
- Export: `src/export/exportMask.ts` + `validator.ts` + `preflight.ts` ·
  Runtime-Bündel: `npm run build:runtime` (Veralten-Wächter im export.test!)
- SE-Laufzeit: `src/blocks/kanban/seRuntime.ts` (Umzug nach
  `src/softengine/` = Umbau-Paket U3) · `src/blocks/shared/seAktionen.ts`
- Design: Masken-Tokens `src/design/masken-tokens.css` (--se-*, kantig,
  Grün) · Editor-UI `src/index.css` (shadcn, hell, Blau) — nie mischen.
