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
   Jeder Export lädt das offizielle Interface über
   `<!--SOFTENGINE-VAR!EditorPfad-->/JS/JS/basis.html.interface.js`; ohne
   diesen Anschluss bekommt WEBWARE weder SEFILELOOP-Daten noch Relationen.
6. **Alter Editor = nur Funktionsliste.**
7. **Bedienung am Ding:** Anfasser, Doppelklick, Klick auf die Stelle;
   Inspector nur für Unzeigbares; der Editor **erfindet nie Daten**
   (Striche statt Demo-Werte, der Klarname ist die Vorschau).
8. **Ein Arbeitsbaum = ein Agent** (Claude und Codex nie parallel im selben
   Ordner); Übergabe nur über gepushte Commits; ein Thema = ein Commit.
   **Pflicht seit dem Kollisions-Vorfall 2026-07-15:** VOR Arbeitsbeginn
   und VOR jedem Push `git fetch` — ist origin voraus, erst dessen Stand
   ansehen und zusammenführen, dann bauen/pushen. NIE force-pushen. Ein
   Branch, an dem der jeweils andere Agent laut Auftrag arbeitet, ist tabu.
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

## Stand (2026-07-15) + vereinbarte nächste Schritte

- **Bibliothek:** Kanban (+ Spalte/Karte, Datenpfad in SoftEngine bestätigt;
  Karte seit 2026-07-16 nach der Empfang-Anatomie: acht bindbare Stellen
  (Zeit, Datum, Avatar, Titel, Titel 2, Unterzeile, Textzeile, Chip),
  auto-hoch mit 112px MINDESThöhe (Nutzer-Entscheidung, ersetzt die feste
  Höhe), Text maximal zwei Zeilen, Chip am unteren Rand; LEER-REGEL: Stellen
  ohne Inhalt verschwinden in der Maske restlos samt leerer Zeilen, im
  Editor bleiben sie Klick-Ziele (Strich/gestrichelter Kreis); Avatar =
  Datenwert→Tier-Silhouette, Icons + Schlüsselwörter 1:1 aus der
  Empfang-Referenz in `src/blocks/card/tierIcon.ts`, unbekannter Wert →
  Pfote, leerer Wert → Avatar weg),
  Schaltfläche, Formularfeld (v1 statisch, Neubau nach behandlung-Referenz),
  Zeile. Export = Vollbild (`height: 'fill'`, Schema-v2-Migration).
  Aktionsketten (Z2/START_TOOL) in SoftEngine bestätigt.
  **Kanban-Entscheidungen 2026-07-15 (SE-Echttest-Feedback):**
  „Einsortieren nach" ist OPTIONAL (ohne Feld → alle Zeilen in die
  Auffang-/Auto-Spalte); der eingebaute Schreibweg (automatisches
  Standard-PUT 174 beim Ziehen) ist ERSATZLOS raus — ein Drop führt nur
  die sichtbare Kette „Karte verschoben" aus, die Karte bleibt liegen
  (der nächste Daten-Push entscheidet). `putRelation` existiert nicht
  mehr; NR 174 ist nur noch eine löschbare Bibliotheks-Vorlage.
  Datenquellen: IDB-ID wird als `ID0004` eingegeben/angezeigt (Technikwert
  `IDBID0004` unsichtbar); KEIN Formularfeld für die Datensatz-Nummer —
  Felder pflegt allein „+ Feld", `indexField` läuft unsichtbar (Bestand
  bleibt, neue Quellen `0_10`).
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
     setField/rowsFor/Quellen), `relations.ts` (Vorlagen, PUT/PUTADD,
     plattformneutrale GET-Warteschlange). Kanban-seRuntime
     enthält nur noch Kanban (Hydrierung, Spaltenwahl, Karten-Drag) und
     hört als erster Zuhörer auf die Klingel. Abhängigkeitsregel gilt:
     Bausteine importieren die Schicht — die Schicht kennt NIE einen
     Baustein.
     `Strg+Alt+D` zeigt die unsichtbare Bridge-Diagnose auch dann, wenn noch
     kein Paket ankam (Interface/Senden/pid/REGMSG/Registrierung/SEDATA).
  2b. ✅ **Zentrale-Gerüst (eingeschoben + erledigt 2026-07-15,
     Nutzer-Entscheidung: kein neues Feature mehr in die alte Steuerung):**
     Steuerung neu als Master-Detail nach der Demo-Vorlage — Bereiche
     Datenquellen | Relationen | Aktionen; Bearbeiten inline
     (FormularKarte statt Modal im Modal, Escape-Schichtung erhalten);
     Detail zeigt Felder/Parameter mit Klartext-Bedeutung, Syntaxzeile
     und „Verwendung in dieser Maske". Die anfängliche Übersicht mit Kacheln
     und „Zu erledigen" wurde auf Nutzer-Entscheidung wieder restlos entfernt;
     die Steuerung öffnet direkt mit Datenquellen.
     Alte DataSourceList/RelationList gelöscht (kein toter Code).
     Bereich „Verknüpfungen/Auswahl-Filter" kommt erst MIT der
     Selektions-Funktion; tiefe Zentrale-Funktionen (IDB-Import,
     Arten-Katalog, Ampeln über die Vorprüfung hinaus)
     kommen als eigene Pakete, wenn ihre Grundlage existiert.
  2c. ✅ **Universeller Relations-Syntax-Import (erledigt 2026-07-15):**
     GET_RELATION / PUT_RELATION / PUTADD_RELATION werden ohne Annahmen über
     Parameterpositionen zerlegt; führende Nullen, leere Parameter, freie
     Platzhalternamen, Werte mit `[` und ein abschließendes `...` bleiben
     erhalten. Syntax ist nur Ein-/Ausgabe, gespeichert wird eine strukturierte
     Vorlage. Formular = nur Anzeigename + Syntax; Bibliothek durchsucht Name,
     NR und Syntax und filtert fachlich nach Lesen (GET) bzw. Schreiben
     (PUT/PUTADD). Keine Relations-Ausführung in diesem Paket.
  3a. **Relations-Aktion im vorhandenen Ereignisablauf** *(implementiert,
      Browser-Abnahme offen)*: Baustein → Ereignis → Schritt mit sichtbarer
      Aktion „Relation" (Technikwert `RELATION`, kein Sonderpfad). Das
      Aktionsmodell ist eine echte Union aus START_TOOL und RELATION;
      Relationsschritte speichern nur stabile Vorlagen-ID, positionsgetreue
      Zuordnungen ALLER Syntaxparameter (feste, leere und dynamische) und
      optionale Zusatzparameter. Relationsauswahl durchsucht Name/NR/Syntax;
      Datenfelder speichern Quellen-ID + Feldcode. Aktionen-UI ist flach:
      Ereignisse und Schritte sind Zeilen mit Trennern statt Karten-in-Karten.
      Verwendete Vorlagen reisen über `FF_RELATIONS`.
  3b. ✅ **Gemeinsame GET/PUT/PUTADD-Laufzeit implementiert (2026-07-15,
      SoftEngine-Echttest offen):** `basisHTML_REGISTER` ist der gemeinsame
      Antwortkanal für BWMSG und WWMSG; kein WinUI-Sonderlistener und kein
      console.log-Abfangen. GET läuft seriell, Callback primär und neue
      `SEDATA.Message<N>` als Rückfallweg; PUT/PUTADD fire-and-forget.
      Parameterquellen Fest/Ereignis/Datenfeld/vorheriges Ergebnis/SE
      VAR-Array werden aufgelöst, benannte GET-Ergebnisse bleiben in der
      Kette verfügbar. Die Export-Sperre ist entfernt.
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
  verschiedenen Quellen; bausteinübergreifende Selektion; pflegbare
  Wert→Bild-Zuordnung für den Karten-Avatar (installations-individuell —
  bis dahin gilt die eingebaute Empfang-Liste); Datumsanzeige-Baustein;
  Spaltenbreiten der Tabelle in der Maske dauerhaft merken; Sortierung wie
  Windows (Zahl/Datum/ABC).

## Übergabe-Stand (2026-07-15, nach der Zusammenführung)

⚠ **Vorfall 2026-07-15:** Claude und Codex haben parallel ab demselben
Commit auf DEMSELBEN Branch gearbeitet (Verstoß gegen Regel 8) — Codex
Steuerung-Feinschliff, Claude Fahrplan-Schritt 3. Claude hat beide Stränge
zusammengeführt: Struktur/Funktion aus dem Claude-Strang (Relations-Aktion,
GET/PUT-Laufzeit, flache Aktionen-UI), Nutzer-Entscheidungen aus dem
Codex-Strang (SE-Fachbegriffe als Anzeigenamen, START_TOOL nur Nummer,
Erklärtexte raus, dichteres Raster). Nichts aus beiden Strängen ist
verloren. **Kommandozentrale, Datenbindung und SE-Echttest sind NICHT
abgenommen** — Browser-Abnahme + SE-Echttest durch den Nutzer stehen aus;
kein Merge nach `main` davor.

## Wichtige Stellen

- Store: `src/state/Editor.ts` · Registry-Konzepte: `src/core/blocks/` ·
  Bausteine: `src/blocks/`
- Export: `src/export/exportMask.ts` + `validator.ts` + `preflight.ts` ·
  Runtime-Bündel: `npm run build:runtime` (Veralten-Wächter im export.test!)
- SE-Laufzeit: `src/blocks/kanban/seRuntime.ts` (Umzug nach
  `src/softengine/` = Fahrplan-Schritt 2) · `src/blocks/shared/seAktionen.ts`
- Design: Masken-Tokens `src/design/masken-tokens.css` (--se-*, kantig,
  Grün) · Editor-UI `src/index.css` (shadcn, hell, Blau) — nie mischen.
