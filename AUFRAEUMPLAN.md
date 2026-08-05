# AUFRAEUMPLAN — Befunde aus dem Check-up 2026-08-05

Vollständiger Code-Durchgang (Nutzer-Auftrag). Dieser Plan ist vom Nutzer
freigegeben: **das Go für alle Schritte unten ist erteilt** (CLAUDE.md-Kopf).
Abarbeiten in Reihenfolge, ohne weitere Rückfragen. Wer von einem Schritt
ABWEICHEN muss, stoppt und fragt den Nutzer.

## Spielregeln (vor dem ersten Schritt lesen)

- **Arbeitsbasis:** `git fetch origin`, dann `origin/claude/editor-code-review-acj2y5`
  nach `main` mergen (dort liegen dieser Plan + die Doku-Bereinigung) und auf
  `main` arbeiten — sofern der Nutzer nichts anderes sagt.
- **Ein Schritt = ein Commit** (Regel 8). Vor jedem Push `git fetch`. NIE force-pushen.
- **Prüfbündel vor JEDEM Commit:** `npx tsc -b && npx eslint src && npm run check:regeln && npm run check:runtime && npm test`
- **Schritte mit Markierung [BÜNDEL]** ändern Code, der ins Runtime-Bündel wandert
  (`src/blocks/`, `src/softengine/`, `src/export/runtime-entry.ts`). Im selben Commit:
  `npm run build:runtime`, dann `npx vitest run -u` (Referenzabzug erneuern),
  den **Diff des Abzugs ansehen** (nur die erwartete Änderung?) und mit einchecken.
  Diese Commits im Abschlussbericht unter **„SE-Echttest nötig"** sammeln —
  den Echttest macht der Nutzer, gebündelt am Ende.
- **Test-Regeln (Regel 9):** KEINE neuen Test-Gattungen. Bestehende vitest-Dateien
  dürfen nur dort mitwachsen, wo der Plan es ausdrücklich sagt. Im Zweifel: kein
  Test, im Bericht nennen.
- **Neue Bezeichner deutsch** (Namens-Konvention). Kommentare: nur ändern, was der
  Plan nennt.
- Jeder Schritt endet mit einer **Klickanleitung** (steht beim Schritt) — die
  gesammelten Klickanleitungen kommen in den Abschlussbericht.

---

## Paket A — echte Fehler

### A1 [BÜNDEL] Kanban: Daten-Push während eines Karten-Zugs → falscher Datensatz möglich

**Problem:** `src/blocks/kanban/seRuntime.ts` hält die gezogene Karte als
Modul-Variable `dragged` (~Zeile 211). `hydrate()` entfernt bei jedem Daten-Push
ALLE Karten (~Zeile 142) — auch eine gerade gezogene. `dragged` zeigt dann auf
eine entfernte Karte, deren `cardData` (WeakMap) durch die starke Referenz am
Leben bleibt. Ein anschließender Drop führt die Kette „Karte verschoben" mit dem
PINDEX der ALTEN Karte aus → bei Schreib-Ketten trifft es den falschen Datensatz.

**Änderung:**
1. Am Anfang von `hydrate()` (vor dem Karten-Entfernen): wenn `dragged` gesetzt
   ist und `dragged.board` das gerade hydrierte Board ist → `dragged = null`.
   (Der laufende Zug endet damit logisch; ein Drop findet `dragged === null`
   und tut nichts — der Bediener zieht neu. Kein falscher Schreibweg möglich.)
2. Prüfen, ob ein `dragend`-Listener `dragged` nullt — falls nicht, im
   bestehenden `wireDrag` ergänzen.
3. In `handleDrop` nach dem `runEvent`-Aufruf `dragged = null` setzen.

**Prüfen:** Bestehende `seRuntime.test.ts` (kanban) muss grün bleiben. Wenn sich
dort mit vertretbarem Aufwand ein Fall ergänzen lässt („hydrate während Drag →
Drop löst keine Kette aus"), ergänzen; wenn die Testumgebung DnD-Events nicht
hergibt, weglassen und im Bericht sagen.

**Klickanleitung (SE-Echttest):** Maske mit Kanban + Schreib-Kette „Karte
verschoben" öffnen → Karte ziehen und HALTEN, während SoftEngine Daten schiebt
(z. B. anderer Client ändert einen Satz) → loslassen auf einer Spalte. Erwartung:
KEIN Schreibvorgang (Karte springt zurück / bleibt), kein Fehler. Normales
Ziehen ohne zeitgleichen Push funktioniert unverändert.

### A2 Undo: Tippen erzeugt einen Undo-Schritt pro Tastendruck und spült die Historie weg

**Problem:** `src/editor/inspector/controls/TextControl.tsx` (Zeile ~23) meldet
jeden Tastendruck; `Editor.updateProperty` (`src/state/Editor.ts` ~299) legt
dabei jedes Mal einen Verlaufs-Schritt an (Deckel 50, `src/state/history.ts`).
Folge: langer Titel getippt → ganze Undo-Historie weg, Strg+Z geht
buchstabenweise.

**Änderung:**
1. `Editor.updateProperty`: ganz am Anfang `if (Object.is(node.props[attr], value)) return`
   — identischer Wert erzeugt weder Verlauf noch Neuzeichnen.
2. Eine Eingabe-Sitzung = EIN Undo-Schritt, über die vorhandene
   Transaktions-Mechanik (Muster `zieheGroesse`): `TextControl`, `TextareaControl`
   und `NumberControl` bekommen zwei optionale Props `onBeginBearbeitung` /
   `onEndeBearbeitung`. Intern: `useRef`-Flag; beim ERSTEN `onChange` seit Fokus
   `onBeginBearbeitung` rufen (nicht schon beim Fokus — sonst entstünde ein
   Leer-Schritt, wenn jemand nur hineinklickt), bei `blur` (falls begonnen)
   `onEndeBearbeitung`. `Inspector.tsx` verdrahtet die beiden mit
   `ed.beginTransaction` / `ed.endTransaction`.
   (Bekannte, akzeptierte Kante — dieselbe wie beim Ziehen: Strg+Z MITTEN im
   Tippen springt zum Stand vor der Eingabe.)

**Prüfen:** Prüfbündel; `persistence.test.ts`/`maskenDatei.test.ts` bleiben grün.

**Klickanleitung:** Baustein einfügen → im Inspector einen Titel mit 60+ Zeichen
tippen → 1× Strg+Z: der GANZE Titel ist weg (nicht ein Buchstabe) → 2× Strg+Z:
auch das Einfügen ist rückgängig. Vorher unmöglich.

### A3 [BÜNDEL] Maske: Fehler sichtbar machen statt still sterben (Regel 4)

**Problem:** Vier Stellen werfen eine Aktionskette an und verschlucken jeden
Fehler (`void runEvent(...)` ohne catch): `src/blocks/shared/seAktionen.ts` ~192,
`src/blocks/kanban/seRuntime.ts` ~232 und ~249, `src/blocks/formfeld/feldRuntime.ts`
~111. Und die Brücke meldet „kein Interface nach 10 s" / „keine Daten nach 30 s"
nur in die versteckte Diagnose (`src/softengine/bridge.ts` ~195 und ~243), nicht
in den sichtbaren Fehlerbalken (`src/softengine/meldung.ts`, existiert bereits).

**Änderung:**
1. Alle vier `void runEvent(...)`-Stellen: `.catch(...)` anhängen, das
   `meldeFehler('Aktionskette fehlgeschlagen: ' + Klartext)` ruft
   (Fehlertext aus `Error.message`, sonst `String(fehler)`). Import prüfen —
   Bausteine dürfen `softengine/meldung` importieren.
2. `bridge.ts`: an der 10-s-Aufgabe-Stelle zusätzlich
   `meldeFehler('SoftEngine-Anschluss nicht gefunden — die Maske bleibt ohne Daten (Strg+Alt+D für Details).')`,
   an der 30-s-Stelle sinngemäß „Keine Daten von SoftEngine empfangen".
   (`meldung.ts` importiert nichts aus `bridge.ts` — kein Kreis. Prüfen.)
3. `src/export/runtime-entry.ts`: einmalig
   `window.addEventListener('unhandledrejection', …)` → `meldeFehler('Unerwarteter Fehler in der Maske: ' + String(e.reason))`.
   (Der Balken bündelt Mehrfach-Fehler selbst.)

**Prüfen:** Prüfbündel; Referenzabzug-Diff ansehen (nur Runtime-Bündel-Teil
ändert sich, Markup unverändert).

**Klickanleitung (SE-Echttest):** Maske in SoftEngine öffnen, die BEWUSST ohne
Anschluss läuft (oder Interface-Pfad kurz verstellen): oben erscheint ein roter
Balken mit Klartext statt einer stumm-leeren Maske.

### A4 [BÜNDEL] Datum: zweiter Tageswähler in derselben Maske bleibt stehen

**Problem:** `src/blocks/datum/DatumBlock.ts` behauptet im Kommentar (~164-165),
zwei Wähler zeigten immer denselben Tag — abonniert den geteilten Wert aber nie
(`aufTagHoeren` wird nicht importiert). Der zweite Wähler zeigt nach einem
Tageswechsel des ersten dauerhaft das alte Datum.

**Änderung:**
1. `src/blocks/shared/gewaehlterTag.ts`: `aufTagHoeren` gibt eine
   Abmelde-Funktion zurück (Muster `Subject.subscribe`); Docblock („anmelden,
   nie abmelden") anpassen. Der bisherige Aufrufer (`datenAnschluss.ts` ~60)
   ignoriert den Rückgabewert — kompatibel.
2. `DatumBlock`: in `connectedCallback` (NUR wenn KEIN `data-ff-editor`-Attribut,
   Muster Zeile ~195) abonnieren: `this.tag = gewaehlterTag()` im Callback;
   Abmelde-Funktion in einem privaten Feld halten. Neuen `disconnectedCallback`
   mit `super.disconnectedCallback()` + Abmelden. Kommentar ~164-165 stimmt
   danach wieder — stehen lassen.

**Prüfen:** Prüfbündel; Referenzabzug-Diff nur im Bündel-Teil.

**Klickanleitung (SE-Echttest):** Maske mit ZWEI Datum-Bausteinen: am ersten
auf „‹" klicken → der zweite zeigt sofort denselben Vortag.

### A5 Editor-Start absichern (weißer Bildschirm)

**Problem:** Zwei Stellen lesen `localStorage` außerhalb jeder Absicherung —
`src/state/persistence.ts` ~208 und `src/state/VorlagenStore.ts` ~66. Letztere
läuft schon beim Modul-Import (Singletons `dataSourceStore`/`relationStore`),
also VOR dem Aufbau der Oberfläche: wirft der Zugriff (Safari-Privatmodus,
blockierte Cookies), startet der Editor als leere weiße Seite ohne Meldung.
Außerdem fängt nichts einen Darstellungsfehler ab — ein Fehler in einer Ecke
reißt die ganze Oberfläche weg.

**Änderung:**
1. Beide `localStorage.getItem`-Aufrufe in die vorhandene Schutzform ziehen
   (Muster `persistence.ts` ~41-49: `typeof localStorage !== 'undefined'` +
   `try`). Wirft der Zugriff: wie „nichts gespeichert" starten, einmal
   `console.warn` — kein Alert-Gewitter.
2. Neue Datei `src/app/Fehlergrenze.tsx`: React-Klassenkomponente
   (`getDerivedStateFromError` + `componentDidCatch`), zeigt im Fehlerfall auf
   Deutsch: „Der Editor ist auf einen Fehler gelaufen." + Fehlermeldung +
   Knopf „Neu laden" (`location.reload()`). Editor-UI-Stil (`index.css`-Welt,
   KEINE Masken-Tokens). In `src/app/providers.tsx` um die Kinder legen.

**Prüfen:** Prüfbündel.

**Klickanleitung:** Normaler Start unverändert. (Der Privatmodus-Fall ist ohne
Safari schwer nachzustellen — als „nicht selbst prüfbar" im Bericht führen.)

### A6 Ziehen auf der Rasterfläche: Fenster-Wechsel mitten im Zug

**Problem:** `src/editor/canvas/rasterMove.ts` registriert
`pointermove`/`pointerup`/`pointercancel` am Fenster (~91-93), räumt aber —
anders als die Schwester-Mechanik `zieheGroesse.ts` (~79, mit Begründungs-
kommentar) — bei `blur` nicht auf: Fenster verlassen + außerhalb loslassen →
Geist-Baustein bleibt kleben bis zum nächsten Klick. Außerdem wird der
Klick-Schlucker (~79, `capture:true, once:true`) in `aufraeumen` (~56-60) nicht
entfernt — bleibt der synthetische Klick aus, schluckt er den NÄCHSTEN echten
Klick des Bedieners.

**Änderung:** `blur`-Listener nach dem Muster von `zieheGroesse` ergänzen (in
Registrierung UND `aufraeumen`); `schluckeKlick` in `aufraeumen` per
`removeEventListener(…, { capture: true })` mit entfernen.

**Prüfen:** Prüfbündel (reine Editor-Datei, kein Bündel).

**Klickanleitung:** Baustein auf der Fläche ziehen → mit gehaltener Taste aus
dem Fenster fahren → außerhalb loslassen → zurückkommen: kein abgedunkelter
Geist mehr, der nächste Klick funktioniert normal.

### A7 Zeichen-Hygiene: Null-Byte, CRLF, BOM

**Problem:** `src/editor/canvas/FieldPicker.tsx` Zeile ~101 enthält ein rohes
Null-Byte in einem Template-String (React-Key-Trenner). Folge: git und alle
Suchwerkzeuge behandeln die Datei als BINÄR (kein Diff, von jeder Codesuche
übersprungen), und sie ist als einzige Datei CRLF-codiert. Vier Dateien tragen
zudem eine BOM: `src/editor/zentrale/StepForm.tsx`, `src/vite-env.d.ts`,
`src/blocks/tabelle/TabelleBlock.ts`, `src/blocks/tabelle/tabelleStil.ts`.

**Änderung:**
1. `FieldPicker.tsx`: Null-Byte-Trenner durch `QUELLEN_TRENNER` ersetzen
   (Import aus `core/blocks/BlockDefinition` — die Datei nutzt
   `bindungMitQuelle` bereits; Quellen-ids können den Trenner laut
   `sanitizeDataSources` nie enthalten, der Key bleibt eindeutig).
   Datei als UTF-8/LF ohne BOM neu speichern (Ganzdatei-Diff ist okay).
2. BOM aus den vier Dateien entfernen (Inhalt unverändert).
3. Danach prüfen: `file src/editor/canvas/FieldPicker.tsx` meldet Text, nicht
   mehr `data`.

**Prüfen:** Prüfbündel. `check:runtime` zeigt, ob das Bündel byte-gleich
blieb (BOM/Zeilenenden sollten es nicht ändern); falls doch: wie [BÜNDEL]
verfahren.

**Klickanleitung:** Feld-Picker öffnen (gebundene Stelle anklicken): Liste und
Auswahl verhalten sich exakt wie vorher.

---

## Paket B — Ehrlichkeit & Kosmetik

### B1 Verdeckter Regelbruch: fest verdrahtetes `'popup'` im Store

`src/state/Editor.ts` ~122 (`addPopupPage`): `this.addBlock('popup', ROOT_ID)`
nennt einen Bausteintyp in generischem Code — als Funktionsargument sieht der
Wächter das nicht. Zwei Dateien weiter macht es `pageOps.ts` (~18) richtig über
das Registry-Kennzeichen. **Änderung:** Typ über die Registry auflösen
(`getAllBlockDefinitions().find((d) => d.pageBlock)?.type`; `undefined` → `null`
zurückgeben), Import ergänzen, kurzer Warum-Kommentar (Regel 2). Sichtbarer
Name „Popup" bleibt unverändert.

### B2 `noImplicitOverride` einschalten

`tsconfig.app.json`: `"noImplicitOverride": true` ergänzen. Danach überall, wo
`tsc` es verlangt, `override` ergänzen — erwartet: `TabelleBlock.customProperties`
(~91, als einziger der elf ohne) und ggf. `static styles`-Deklarationen der
Bausteine. Rein mechanisch, keine Verhaltensänderung, Bündel bleibt byte-gleich
(`check:runtime` bestätigt das).

### B3 Kommentare, die die Unwahrheit sagen

NUR diese Stellen — Aussage an die Wirklichkeit anpassen (oder den toten Export
einziehen), sonst nichts anfassen:
- `src/blocks/formfeld/feldRuntime.ts` ~1-5: behauptet, die „Datumsanzeige"
  nutze ihn identisch — stimmt nicht (nur `FormFeldBlock` importiert ihn).
- `src/blocks/tabelle/seRuntime.ts` ~47 und `src/blocks/text/seRuntime.ts` ~43:
  „Exportiert fuer den gezielten Runtime-Test" — kein Test importiert
  `hydrateTable`/`hydriereText`. Prüfen, was Tests WIRKLICH importieren; nicht
  benötigte Exporte einziehen (Funktion intern lassen), Kommentare streichen.
  Gleiches für `hydriereAlle` in `src/blocks/shared/datenAnschluss.ts` (~25-26)
  prüfen.
- `scripts/check-regeln.mjs` ~172-176: nennt Editor.ts mit „jetzt 422" Zeilen
  (real ~479) — Zahl streichen oder aktualisieren.

### B4 Kommentar-Chronik eindampfen — eng begrenzt

An GENAU diesen Stellen Review-Runden-/Datums-Erzählung entfernen, die
GELTENDE Regel (je 1-3 Sätze) behalten:
- `src/state/maskenDatei.ts` ~109, ~143, ~192, ~213, ~285, ~300, ~314
  (nummeriertes „Codex-Codereview Runde N"-Protokoll)
- `src/editor/zentrale/DataSourceForm.tsx` ~4-16 (Header beschreibt ein am
  selben Tag wieder entferntes Kachel-Design → auf 3-4 Zeilen Ist-Zustand)
- `src/core/data/schrittPruefung.ts` ~71 („Codex-Wortlaut …" → Regel behalten,
  Attribution weg)
- `src/blocks/shared/auswahl.ts` ~177-197 (21 Zeilen Historie über einer
  4-Zeilen-Funktion → auf die geltende Regel kürzen)
- `src/state/notfallkopie.ts` ~78, `src/editor/shell/Toolbar.tsx` ~91
  (Attribution weg, Regel bleibt)

**TABU:** alles unter `src/softengine/` und `src/export/serializer.ts`
(SE-Kontrakt-Belege mit Echttest-Daten) sowie jeder Kommentar, der eine
Nutzer-Entscheidung mit Datum festhält. Im Zweifel: stehen lassen.

### B5 Mini-Aufräumer

- `src/export/preflight.ts` ~215: `Boolean(n) &&` → `n !== undefined &&`,
  damit das `n!` entfällt.
- `src/editor/zentrale/DatenquellenBereich.tsx` ~44-48: nackter
  `catch { tabellen = [] }` — den Grund der Parse-Panne in die bestehende
  Dialog-Meldung geben statt ihn zu verwerfen.
- `src/state/useEditor.ts`, `useDataSources.ts`, `useRelations.ts`: die
  `subscribe`-Funktion für `useSyncExternalStore` stabilisieren
  (`useCallback` mit `[editor]` bzw. Store; Callback direkt durchreichen statt
  Wrapper-Closure) — beendet das Ab-/Anmelde-Geflacker bei jedem Render.

### B6 [BÜNDEL] Kopierten Code an die eine Stelle ziehen (Regel 10: echte zweite Fälle existieren)

Verhalten muss BYTE-GLEICH bleiben; die bestehenden Tests
(`fremdeQuellen.test`, `auswahl.test`, kanban `seRuntime.test`,
`feldRuntime.test`) pinnen es fest.
1. **Gebundene-Stelle-Pipeline** (7 identische Schritte in
   `text/seRuntime.ts` ~37-71 und `formfeld/feldRuntime.ts` ~57-96):
   als gemeinsame Hilfe `leseGebundeneStelle` nach `src/blocks/shared/`
   (deutscher Name, Docblock: EIN Satz Zweck). Beide Nutzer umstellen.
2. **`geberIdVon(el)`** (`getAttribute('data-ff-id') ?? ''` an vier Stellen:
   `TabelleBlock.ts` ~193, `tabelle/seRuntime.ts` ~76, `kanban/seRuntime.ts`
   ~178 und ~248) → Hilfsfunktion in `src/blocks/shared/auswahl.ts`.
3. **Auswahl-Wiederanheften nach Hydrierung** (`tabelle/seRuntime.ts` ~76-84
   und `kanban/seRuntime.ts` ~178-194 sind fast wortgleich inkl. Kommentar) →
   gemeinsame Hilfe in `shared/auswahl.ts` (Parameter: geberId, Kandidaten +
   Zeilen-Zugriff), beide umstellen.
BEWUSST NICHT: die drei `:empty::before`-Platzhalter vereinheitlichen (drei
gewollt verschiedene Inhalte, sichtbare Optik) und die Auswahl-Verdrahtung der
Tabelle umziehen (Verhaltensrisiko ohne Not).

### B7 Wächter nachschärfen

`scripts/check-regeln.mjs`, neue Prüfung: Steuerzeichen (< 0x20 außer
Tab/LF/CR) und BOM in `src/**`-Quellen sind ein FEHLER — Meldung mit Warum
(Suchwerkzeuge überspringen Binär-Dateien; genau so blieb A7 unsichtbar).

### B8 Schwebende Promises dauerhaft verbieten (Versuch, mit Abbruchkriterium)

`eslint.config.js`: typed-Linting nur für die Regel
`@typescript-eslint/no-floating-promises` aktivieren (`projectService` +
gezielter Regel-Eintrag). Erwartete Funde: die vier A3-Stellen (dann schon
gefixt). Tauchen mehr als ~10 NEUE Fehler auf oder wird der Lint-Lauf spürbar
lahm: Änderung zurücknehmen und im Abschlussbericht begründen — kein
Konfigurations-Kampf.

---

## Abschluss (eigener Commit)

1. `CLAUDE.md`: im Stand-Absatz „Check-up 2026-08-05" das Ergebnis in 2-3 Zeilen
   festhalten (was erledigt, was übersprungen und warum); den Verweis auf die
   Plan-Datei entfernen; die Plan-Ausnahme im Kopf der Datei streichen (sie gilt
   nur für diesen Plan).
2. `AUFRAEUMPLAN.md` **löschen** — der Plan lebt in der git-Historie
   (Doku-Schnitt-Regel).
3. **Abschlussbericht im Chat:** je Schritt erledigt/übersprungen (mit Grund),
   die gesammelten Klickanleitungen, und die Liste der Commits, die einen
   **SE-Echttest** brauchen (mindestens A1, A3, A4 und B6).

## Bewusst NICHT in diesem Plan (offene Nutzer-Entscheidungen)

- **Ein Vokabular pro Begriff** (Schritt/Step, QuellenArt/DataSourceKind,
  Bindung/Binding) — kollidiert mit der Namens-Konvention („umbenannt wird nur,
  was ohnehin angefasst wird").
- **Bibliotheken-Singletons vs. Provider-Bauart** — Umbau nur mit Entscheidung;
  bis dahin gilt der ehrliche Hinweis in CLAUDE.md („Wichtige Stellen").
- **README als menschliche Eingangstür** — kollidiert mit dem Doku-Schnitt.
