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
8. **Ein Arbeitsbaum = ein Agent** (Claude und Codex nie parallel im selben
   Ordner); Übergabe nur über gepushte Commits; ein Thema = ein Commit.
   **Pflicht seit dem Kollisions-Vorfall 2026-07-15:** VOR Arbeitsbeginn
   und VOR jedem Push `git fetch` — ist origin voraus, erst dessen Stand
   ansehen und zusammenführen, dann bauen/pushen. NIE force-pushen. Ein
   Branch, an dem der jeweils andere Agent laut Auftrag arbeitet, ist tabu.
9. **Prüfungen einmal gebündelt vor dem Commit** (`npx tsc -b` +
   `npx eslint src` + `npm test` + `npx playwright test`), nie zwischendurch.
   Sicherheitsnetz = fünf Wächter (export / seRuntime / persistence /
   e2e kanban-data / Export-Referenzabzug, fünfter per Nutzer-Go
   2026-07-17) — Nutzer-Entscheidung, nicht ohne Absprache aufblähen.
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

## Stand (2026-07-15) + vereinbarte nächste Schritte

- **Bibliothek:** Kanban (+ Spalte/Karte, Datenpfad in SoftEngine bestätigt;
  Karte seit 2026-07-16 nach der Empfang-Anatomie: acht bindbare Stellen —
  Avatar links neben Titel + Titel 2 (nebeneinander in EINER Zeile) mit
  Unterzeile darunter, Zeit + Datum OBEN RECHTS in derselben Zeile,
  Textzeile, Chip am unteren Rand; auto-hoch mit 112px MINDESThöhe
  (Nutzer-Entscheidung, ersetzt die feste Höhe), Text maximal zwei Zeilen;
  LEER-REGEL: Stellen ohne Inhalt verschwinden in der Maske restlos samt
  leerer Zeilen, im Editor bleiben sie Klick-Ziele (Strich/gestrichelter
  Kreis) — NUR Platzhalter, nie Texte; Avatar wie das Original: 30px runde
  getönte Fläche, Datenwert→Tier-Silhouette, Icons + Schlüsselwörter 1:1
  aus der Empfang-Referenz in `src/blocks/card/tierIcon.ts`, unbekannter
  Wert → Pfote, leerer Wert → Avatar weg. Der „Muster"-Anstecker an der
  Musterkarte ist ABGESCHAFFT (Nutzer-Entscheidung 2026-07-16, der
  Löschschutz bleibt); die früheren Karten-Demo-Werte („Rückruf Fr.
  Wagner", „Befund Minka besprechen", „Heute", …) werden beim Laden alter
  Speicherstände geleert (exakter Vergleich, `putzeAlteKartenDemos`)),
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
  3a. ✅ **Relations-Aktion im vorhandenen Ereignisablauf** *(implementiert;
      Abnahme durch den Nutzer erteilt 2026-07-16)*: Baustein → Ereignis → Schritt mit sichtbarer
      Aktion „Relation" (Technikwert `RELATION`, kein Sonderpfad). Das
      Aktionsmodell ist eine echte Union aus START_TOOL und RELATION;
      Relationsschritte speichern nur stabile Vorlagen-ID, positionsgetreue
      Zuordnungen ALLER Syntaxparameter (feste, leere und dynamische) und
      optionale Zusatzparameter. Relationsauswahl durchsucht Name/NR/Syntax;
      Datenfelder speichern Quellen-ID + Feldcode. Aktionen-UI ist flach:
      Ereignisse und Schritte sind Zeilen mit Trennern statt Karten-in-Karten.
      Verwendete Vorlagen reisen über `FF_RELATIONS`.
  3b. ✅ **Gemeinsame GET/PUT/PUTADD-Laufzeit implementiert (2026-07-15;
      PUT-Weg in SoftEngine BESTÄTIGT 2026-07-16 über die
      Formularfeld-Kette — GET-Echttest weiter offen):** `basisHTML_REGISTER` ist der gemeinsame
      Antwortkanal für BWMSG und WWMSG; kein WinUI-Sonderlistener und kein
      console.log-Abfangen. GET läuft seriell, Callback primär und neue
      `SEDATA.Message<N>` als Rückfallweg; PUT/PUTADD fire-and-forget.
      Parameterquellen Fest/Ereignis/Datenfeld/vorheriges Ergebnis/SE
      VAR-Array werden aufgelöst, benannte GET-Ergebnisse bleiben in der
      Kette verfügbar. Die Export-Sperre ist entfernt.
  4. ✅ **Formularfeld anschließen (erledigt 2026-07-16, Codex nach
     Claude-Auftrag `docs/AUFTRAG-CODEX.md` + Claude-Nachprüfung;
     SE-ECHTTEST BESTANDEN, Nutzer 2026-07-16: Tippen UND Auswahlfeld →
     Kette „Wert geändert" → PUT_RELATION schreibt wirklich):** Feld deklariert
     acceptsDataSource + bindingRoute(valueField) + bindableSpot 'Wert' +
     Ereignis „Wert geändert" — alles Registry, kein Sondercode. Lesen:
     feldRuntime hydriert aus der ERSTEN Zeile der eigenen Quelle;
     Platzhalter weg, sobald Wert DA (egal woher). Schreiben: Tippen
     patcht die Zeile lokal (setField); nach SoftEngine schreibt NUR die
     sichtbare Kette „Wert geändert" ({VALUE}/{PINDEX}) — kein Auto-PUT.
     Ankreuzfeld bewusst unbindbar (SE-Wert-Kontrakt unbelegt, Merkliste).
     ⚠ Gelernter Kontrakt: 'change' ist NICHT composed und stirbt an der
     Schattengrenze — Eingabe-Bausteine müssen es am Host neu auslösen
     (FormFeldBlock.onChange); 'input' ist composed und braucht das nicht.
     Wächter: e2e/formfeld-data.spec.ts (tippt ECHT — fill() feuert kein
     natives change). **Multi-Datenquelle damit belegt:** jedes Feld wählt
     seine eigene Quelle, Export sammelt alle (FF_DATA_SOURCES +
     SEFILELOOP je Quelle, export.test). **Datumsanzeige-Baustein** (ff-datum,
     'Anzeige'): ungebunden echte Uhr (Datum/Zeit/beides, Klarnamen),
     gebunden Feldwert über DIESELBE feldRuntime.
  5. **Popup darauf aufbauen — Detail-Besprechung ERLEDIGT (Nutzer-
     Entscheidungen 2026-07-16):** Seiten-Modell: Maske = Hauptseite +
     Popup-Seiten als normale Block-Bäume, bedient über SEITEN-REITER am
     Canvas („Hauptseite | <Popup-Klarname> | + Popup", wie die Demo);
     Popup-Inhalt = dieselben Bausteine wie überall (Datenbindung
     funktioniert automatisch mit). SPEICHERN: derselbe Speicherstand der
     Maske (Schema v3: Hauptseite + Popup-Seiten-Liste mit Klarname,
     Größe, eigenem Baum; Migration v2→v3 verlustfrei, Undo seitenüber-
     greifend). Öffnen/Schließen = zwei neue sichtbare KETTEN-Schritt-
     Arten (Auswahl per Klarname, Technikwert = stabile Seiten-id).
     Entschieden: eingebautes X oben rechts (schließt immer, zusätzlich
     per Ketten-Schritt) · Klick auf die Abdunklung tut NICHTS (ERP-üblich,
     kein Datenverlust) · IMMER zentriert, Größe per Anfasser (freie
     Position erst, wenn eine echte Maske sie erzwingt). Export: dieselbe
     eine HTML-Datei, Popup inaktiv bis eine Kette öffnet; Abdunklung +
     Fenster + X gehören zum Popup-Baustein (1 Render-Quelle).
     Popup-Darstellung + Lebenszyklus bleiben beim Popup — nur Daten-
     zugriff/Relationen laufen über die SoftEngine-Schicht.
     Paketschnitt: (P-A) ✅ Seiten-Gerüst ERLEDIGT (2026-07-16) —
     einfacher als geplant: KEIN Schema v3 nötig, eine Popup-Seite ist ein
     Popup-Knoten (pageBlock in der Registry) als Kind der Wurzel im
     vorhandenen Baum; Persistenz/Undo/Export/Preflight laufen dadurch
     generisch mit, alte Speicherstände laden unverändert. Editor.rootId =
     Wurzel der AKTIVEN Seite (Canvas/Bibliothek/Drag folgen automatisch),
     childNodesOf filtert Seiten-Bausteine aus jedem Fluss. ff-popup:
     zentriertes Fenster (breite/hoehe-Props + Editor-Anfasser, zieht um
     2×delta weil zentriert), Kopf = Klarname (Doppelklick = umbenennen),
     X + Abdunklung (--se-scrim-Token) im Baustein; geschlossen =
     display:none, Editor-Reiter erzwingt Sicht über data-ff-editor;
     Export IMMER ohne offen-Attribut (export.test). Löschen der Seite =
     normales Entfernen des selektierten Popups.
     (P-B) ✅ Ketten-Schritte + Laufzeit ERLEDIGT (2026-07-16):
     Schritt-Arten POPUP_OPEN/POPUP_CLOSE (Anzeige „Popup öffnen/
     schließen" — Klarnamen, KEINE SE-Fachbegriffe); der Schritt speichert
     die stabile Seiten-id (übersteht Umbenennen), der Export übersetzt sie
     in den KLARNAMEN (Editor-ids reisen nie mit), die Laufzeit schaltet
     das offen-Attribut am ff-popup mit diesem name (applyPopupStep in
     seAktionen, eigener Wächter). Preflight: Schritt ohne/auf gelöschte
     Seite blockt; Popup-NAMEN MÜSSEN EINDEUTIG sein (Laufzeit-Identität,
     eigener Preflight-Block mit Klartext). StepForm: Popup-Auswahl in
     Klarnamen; Schrittzeile zeigt „Popup öffnen — <Name>".
     (P-C) Export-e2e + Wächter + SE-Echttest. HUCKEPACK (vereinbart
     2026-07-17, derselbe Echttest deckt alles, beides ändert das
     Runtime-Bündel): bindingAttr() aus der Bindungs-Konvention WIRKLICH
     in der Laufzeit benutzen (seRuntime/feldRuntime — heute nur
     Typ-Anker aus A5) + die Popup-Regel „Fläche − 24px" als EINE
     geteilte Konstante (steht heute doppelt: PopupBlock-CSS und
     PopupSeite-Anfasser — WYSIWYG-Drift-Gefahr).
  Danach: Tabelle, Verknüpfungen/Selektion, Quellen-Arten-Registry
  (+ ERP-API/MEMTAB nach Beleg), Steuerung-Neuschnitt nach Demo-Vorlage.
- **Merkliste:** Tabellen-Spalten aus verschiedenen Quellen;
  bausteinübergreifende Selektion; pflegbare Wert→Bild-Zuordnung für den
  Karten-Avatar (installations-individuell — bis dahin gilt die eingebaute
  Empfang-Liste); Spaltenbreiten der Tabelle in der Maske dauerhaft merken;
  Sortierung wie Windows (Zahl/Datum/ABC); Ankreuzfeld bindbar machen,
  sobald der SE-Wert-Kontrakt (J/N? 1/0?) an einer echten Maske belegt ist;
  Seiten-Leiste als kompakte Aufklappliste, falls viele Popups je Maske
  real werden (Nutzer-Sorge 2026-07-16); „Maske als Datei
  speichern/laden" für Sicherung/zweiten Arbeitsplatz (heute nur
  Browser-Speicher + Export); gemeinsame Zieh-Mechanik für Block- UND
  Popup-Anfasser (vereinbart 2026-07-17 als eigenes Editor-Paket,
  kein Export-Einfluss — wartet auf „go"); Projektkarte
  (public/project-map.html) veraltet still — auf Nutzer-Wunsch SPÄTER
  bereden (2026-07-17); Markup-Bauen (nodeToHtml/styleAttr) aus
  exportMask erst MIT dem Tabellen-Baustein herausziehen.
  (Export-Referenzabzug: ERLEDIGT 2026-07-17 als fünfter Wächter, s.
  Regel 9.)

## Zusammenführung ERLEDIGT (2026-07-16, Nutzer-Go)

Die zwei auseinandergelaufenen Linien (main = U-Umbau, dieser Branch =
Feature-Basis) sind wieder EINE: Baum = die Feature-Basis (gelebte, vom
Nutzer abgenommene und SE-getestete Wahrheit), Historien vereint
(merge -s ours, kein Force-Push). Aus dem U-Fahrplan von main:
- **U1 ✅ übernommen** (Notfallkopie + Klartext-Meldung bei unlesbarem
  Speicherstand, `BACKUP_KEY` in Editor.ts + persistence-Wächter-Fälle).
- **U2 ✅ übernommen** (Subject-Listener als Set).
- **U3 ✅ längst hier in neuerer Fassung** (src/softengine/ inkl.
  Relations-Laufzeit + BWMSG/WWMSG-Vereinheitlichung — main's Fassung
  verworfen).
- **U4/U5 (Editor.ts-Module, Provider statt Singleton): NICHT übernommen.**
  Die Commits stehen in der Historie, ihr Inhalt ist aber bewusst NICHT im
  Baum — verhaltensgleicher Umbau wird auf der vereinten Basis NEU
  aufgesetzt (eigenes Paket, billiger neu als verbogen). U6–U10 offen.
⚠ Für Codex: main's altes CLAUDE.md (mit U-Fahrplan als aktuellem Stand)
ist Geschichte — DIESES Dokument ist die eine Wahrheit. Es gibt wieder
genau EINE Projektlinie; ein Thema = ein Branch ab main = ein Agent.

Frühere Vorfälle als Lehre: 2026-07-15 arbeiteten Claude und Codex parallel
auf demselben Branch (Verstoß gegen Regel 8), danach zwei Tage auf zwei
divergierenden Linien. Beides ist repariert; nichts ging verloren.
Abnahmen: Schritt 3a/3b + Zentrale (Nutzer, 2026-07-16), Schritt 4 inkl.
SE-Echttest (Nutzer, 2026-07-16).

## Wichtige Stellen

- Store: `src/state/Editor.ts` (nur Zustand + öffentliche Methoden;
  Fächer daneben: treeOps/history/persistence/migrations/templateRules —
  Aufräumen A1 2026-07-16, Plan in `Aufräum.md`; A2: KEINE Weltvariable
  mehr, die eine Instanz entsteht in `src/app/providers.tsx` und reist
  über EditorProvider/EditorContext; A3–A7 ERLEDIGT 2026-07-17: Canvas/
  BlockHost in Handgriffe (CanvasNode/dndState/SeitenLeiste/PopupSeite +
  useBindingPicker/useBlockResize), useLitElement = die EINE React↔Lit-
  Übergabestelle, Bindungs-Konvention typgeprüft in BlockDefinition
  (bindingProp/BindableSpotsFor — Laufzeit nur Typ-Anker, Bündel
  unverändert), `src/export/serializer.ts` = die eine Zeichen-Regel-
  Stelle, Kommentar-Historie in `docs/decisions/`; Export bei A5–A7
  nachweislich Byte-identisch) ·
  Registry-Konzepte: `src/core/blocks/` · Bausteine: `src/blocks/`
- Export: `src/export/exportMask.ts` + `validator.ts` + `preflight.ts` ·
  Runtime-Bündel: `npm run build:runtime` (Veralten-Wächter im export.test!)
- SE-Laufzeit: `src/blocks/kanban/seRuntime.ts` (Umzug nach
  `src/softengine/` = Fahrplan-Schritt 2) · `src/blocks/shared/seAktionen.ts`
- Design: Masken-Tokens `src/design/masken-tokens.css` (--se-*, kantig,
  Grün) · Editor-UI `src/index.css` (shadcn, hell, Blau) — nie mischen.
