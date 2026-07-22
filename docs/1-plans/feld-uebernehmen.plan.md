# „Feld übernehmen" + Sprechende Namen — Umsetzungsplan

> Fahrplan-Paket **3b** (CLAUDE.md, Stand `82d3f9c`). Zwei zusammengehörige
> Editor-Komfort-Änderungen. **Rein Editor-UI — Export und Laufzeit werden
> NICHT berührt** (kein SE-Echttest nötig; Referenzabzug byte-gleich,
> Bündel-Wächter „identisch"). Gebaut wird nichts ohne Nutzer-„go".

## Overview

Zwei kleine Verbesserungen am Editor:

1. **„Feld übernehmen"** am Schreib-Schritt (PUT/PUTADD): Statt Position,
   Länge und Tabellen-ID von Hand einzutippen, öffnet der Bediener ein
   Auswahl-Fenster, sucht das Zielfeld (z. B. „Zimmer") und klickt es an —
   Position, Länge und Tabelle füllen sich automatisch. Der geschriebene
   **Wert** und die **Satz-Nummer** bleiben wie bisher beim Bediener
   (Nutzer-Entscheidung 2026-07-22).
2. **Sprechende Namen**: Ein Baustein wird im Editor nach seinem Eigentext
   benannt — ein Formularfeld heißt „Vorname" (sein Platzhalter-Text) statt
   nur „Formularfeld". Das macht die Feld-/Bausteinauswahl lesbar.

## Problem Statement

**Die „Dreier-Regel-Falle" (belegt im SE-Echttest 2026-07-22).** Ein PUT
schreibt einen Wert an eine Stelle, die durch drei Parameter beschrieben
wird: Position (`{FELD_POS}`), Länge (`{FELD_LEN}`) und Tabelle
(`{RELID}`). Diese Werte muss der Bediener heute als **feste Zahlen** von
Hand eintippen (z. B. `253`, `30`, `ID0001`) und selbst wissen, dass das
zusammen das Feld „Zimmer" der Tabelle ID0001 ist. Passt der getippte Wert
nicht zu Position/Länge, schreibt die Maske **still an die falsche Stelle**
— genau das ist im ersten Echttest passiert (die Merkregel „Wert, Position,
Länge = dreimal dasselbe Feld" ist nur ein Pflaster auf ein Bedien-Loch).

**Fehlende sprechende Namen.** In den Steuerungs-Listen und im
Inspector-Kopf erscheint ein Formularfeld heute als „Formularfeld" ohne
Unterscheidung. `eigenerText` (zentrale/helfer.ts) liest die Props
`label/heading/title/text`, aber das Formularfeld trägt seinen Namen in der
Prop `placeholder` — er wird deshalb nicht angezeigt.

## Solution Architecture

**Grundeinsicht (macht das Paket klein und risikoarm):** Zur Laufzeit
werden `{FELD_POS}`/`{FELD_LEN}`/`{RELID}` gar nicht aus einem Feld
aufgelöst — `resolveActionParam` liefert bei einer `data_field`-Bindung den
**Feldwert**, nicht Position/Länge. Position/Länge/Tabelle sind heute schon
**feste Strings** in den Parametern. „Feld übernehmen" tut also nichts
anderes, als **genau diese festen Strings automatisch einzusetzen**, statt
sie den Bediener tippen zu lassen. Damit:

- keine Änderung am Ketten-Modell (`core/data/aktionen.ts`),
- keine Änderung an der Laufzeit (`seAktionen.ts`, `softengine/*`),
- keine Änderung am Export/Serializer/Runtime-Bündel.

Die Ableitung nutzt vorhandene, geprüfte reine Funktionen:
`splitFieldCode('253_30') → {pos:'253', len:'30'}`,
`tableIdFor(source) → 'IDBID0001'`, `relIdFromIdbId(...) → 'ID0001'`.

Die Zuordnung „welcher Parameter ist Position/Länge/Tabelle" kommt aus der
**Vorlage selbst** (Regel 2, kein Typ-/ID-Check): der Helfer sucht die
Parameter, die exakt `{FELD_POS}` / `{FELD_LEN}` / `{RELID}` sind (dieselbe
Ganz-String-Regel wie `defaultRelationParams`), und setzt dort eine feste
Bindung. Alle anderen Parameter (Wert, PINDEX) bleiben unangetastet.

**Sprechende Namen** ist eine Ein-Zeilen-Erweiterung von `eigenerText`
(Prop `placeholder` ergänzen) plus die Anwendung des Eigennamens im
Inspector-Kopf. Die Steuerungs-Listen verbessern sich dadurch automatisch
(sie rufen `bausteinName`, das auf `eigenerText` aufbaut).

## Implementation Details

### Phase 1 — „Feld übernehmen"

#### 1. Reiner Helfer (neu)

**Datei**: `src/editor/zentrale/feldUebernahme.ts` (neu)

Editor-only, wird NICHT vom Runtime-Bündel importiert (bleibt aus
`ff-runtime.js` heraus → Bündel-Wächter „identisch"). Reine Funktionen,
Node-testbar:

- `kannUebernehmen(relation: RelationTemplate): boolean` — `true`, wenn die
  Vorlage mindestens einen Ganz-String-Parameter `{FELD_POS}` **oder**
  `{FELD_LEN}` enthält. Steuert die Sichtbarkeit des Knopfes (Registry-Daten,
  kein Typ-Check).
- `uebernahmeQuellen(dataSources): UebernahmeFeld[]` — baut die flache
  Auswahlliste fürs Fenster: je Datenquelle deren Felder mit
  `{ sourceId, sourceName, code, label }`. Ausgelassen werden: (1) Felder
  ohne gültigen `pos_len`-Code (`splitFieldCode` → `null`; reine
  Property-Namen liefern keine Position/Länge); (2) **Nicht-IDB-Quellen**
  (Stamm ADR/ART/BEL) — s. P2-Kasten unten.

> **P2 (Codex) — nur IDB-Quellen anbieten.** PUT/PUTADD werden ohne
> Rückmeldung gesendet; ein Stamm-PUT (ADR/ART/BEL) ist im SE-Kontrakt
> NICHT belegt (Regel 5) und könnte **still scheitern** (Regel 4 „nichts
> scheitert still"). Bis der Stamm-PUT-Vertrag an einer echten Maske belegt
> ist, listet `uebernahmeQuellen` nur `kind === 'idb'`-Quellen. Der belegte
> RELID-Fall (`IDBID000x` → `ID000x`) bleibt damit der einzige angebotene.
> (Merkliste-Eintrag: „Feld-übernehmen für Stammtabellen — wartet auf
> belegten Stamm-PUT-Kontrakt".)
- `feldUebernehmen(params, relation, source, code): FeldUebernahmeResult` —
  die Kern-Funktion: nimmt die aktuellen Bindungen, überschreibt die
  Positionen mit `{FELD_POS}` → `{source:'fixed', value: pos}`,
  `{FELD_LEN}` → `len`, `{RELID}` → `relIdFromIdbId(tableIdFor(source))`;
  alle übrigen Positionen bleiben **unverändert** (Wert/PINDEX). Gibt ein
  Objekt `{ params, gesetzt }` zurück (Typ s. u.): `params` (Länge =
  `relation.params.length`) für `setRelationParams`, `gesetzt` (nur die
  tatsächlich gesetzten Platzhalter samt Wert) für die Bestätigungszeile.
  So bleibt der Vertrag eindeutig (P2 Codex, Runde 2).

Nutzt `splitFieldCode`, `relIdFromIdbId` (core/data/relations),
`tableIdFor` (core/data/dataSources).

#### 2. Auswahl-Fenster (neu)

**Datei**: `src/editor/zentrale/FeldUebernahmePicker.tsx` (neu)

Kleines Portal-„Fenster" im Stil des bestehenden
`canvas/FieldPicker.tsx` (Außenklick / Scroll schließen; `role="dialog"`,
`data-ff-editor-helper`, Editor-UI-Tokens). Unterschiede zum FieldPicker,
die einen eigenen Baustein rechtfertigen (statt den Canvas-Picker zu
überladen): (a) **Suchfeld** oben (Nutzer-Wunsch „ich suche das Feld aus"),
(b) **mehrere Datenquellen** gruppiert (Quelle als dezente
Zwischenüberschrift), (c) **Escape-Schichtung** (s. u.). Ankert am
„Feld übernehmen"-Knopf. Ruft `onPick(sourceId, code)`.

> **P1 (Codex) — Escape darf NICHT den halben Schritt verwerfen.** Der
> Picker lebt in der umgeblätterten Inspector-Ansicht, und der Inspector
> fängt jedes Escape per **Document-Capture** ab und schließt die
> Schritt-Ansicht ([Inspector.tsx:100](../../src/editor/inspector/Inspector.tsx)).
> `FieldPicker` ruft bei Escape kein `stopPropagation`
> ([FieldPicker.tsx:53](../../src/editor/canvas/FieldPicker.tsx)) — auf dem
> Canvas harmlos (kein Inspector-Escape aktiv), hier aber fatal. Deshalb
> registriert der neue Picker seinen Escape-Handler auf **`window` mit
> Capture** und ruft `stopImmediatePropagation()` + `stopPropagation()`:
> Ein `window`-Capture-Listener feuert VOR dem `document`-Capture-Listener
> des Inspectors und schluckt das Escape — nur der Picker schließt, der
> Schritt bleibt offen. (Genau dieser Konflikt ist ein weiterer Grund,
> FieldPicker nicht zu überladen, sondern getrennt zu bauen.)

> **Design-Entscheidung für die Zweitmeinung (Codex):** neuer Baustein vs.
> `FieldPicker` generalisieren (optionale Suche + Gruppen). Empfehlung:
> neuer Baustein, weil `FieldPicker` eng an die Canvas-Stelle-Anklicken-
> Mechanik (`useBindingPicker`, Viewport-Koordinaten einer Stelle) gekoppelt
> ist; Zusammen-Legen würde beide Bedienwege verheddern (Regel 10 „nichts auf
> Verdacht zusammenführen"). Die **Optik/Schließ-Logik** wird aus FieldPicker
> übernommen, nicht neu erfunden.

#### 3. Einbau ins Schritt-Formular

**Datei**: `src/editor/zentrale/StepForm.tsx` (ändern)

Aktueller Zustand: Bei `typ === 'RELATION'` und gewählter `relation` werden
die Parameterzeilen (`BindingRow`) gerendert.

Änderungen:

- Über den Parameterzeilen einen **Knopf „Feld übernehmen …"** rendern,
  aber **nur** wenn `kannUebernehmen(relation)` (also PUT/PUTADD mit
  `{FELD_POS}`/`{FELD_LEN}`). Kein Typ-Check auf „PUT" — die Vorlage
  entscheidet.
- Lokaler Zustand `zeigePicker` (bool) + Knopf-Ref fürs Ankern.
- Bei `onPick(sourceId, code)`: Quelle über `dataSources.list` finden,
  `const { params, gesetzt } = feldUebernehmen(aktuelleBindungen, relation,
  source, code)`, `setRelationParams(params)`, Fenster schließen,
  Bestätigung aus `gesetzt` + Feld-Label bauen und setzen.
- Kurze Bestätigungszeile nach der Übernahme, in Klartext — **zeigt nur die
  tatsächlich gesetzten Werte** (P2 Codex): hat die Vorlage kein `{RELID}`,
  steht dort keine „Tabelle …"; z. B. „Zimmer übernommen — Position 253 ·
  Länge 30". Die Bestätigung wird **bei jedem manuellen `setBinding`
  gelöscht** (und bei Feld-/Vorlagen-Wechsel), damit sie nie veraltet zu
  einem inzwischen von Hand geänderten Wert steht. `feldUebernehmen` gibt
  dafür zurück, welche Platzhalter es gesetzt hat.

Verhalten der bestehenden Parameterzeilen bleibt **unverändert** — der
Bediener kann jeden übernommenen Wert danach noch von Hand ändern
(was, wie gesagt, die Bestätigung löscht).

### Phase 2 — Sprechende Namen

#### 4. `eigenerText`: `placeholder` ergänzen + Default-Bewusstsein

**Datei**: `src/editor/zentrale/helfer.ts` (ändern)

Zwei Änderungen:

1. `TEXT_PROPS` um `'placeholder'` ergänzen (ans Ende — `label/heading/
   title/text` behalten Vorrang; das Formularfeld hat nur `placeholder`).
2. **Default-Bewusstsein** (löst P1-Playwright, s. Kasten): `eigenerText`
   bekommt die **Default-Props** des Bausteins herein und überspringt jeden
   Prop-Wert, der noch dem Default entspricht. So gilt der Text erst als
   Eigenname, wenn der Bediener ihn WIRKLICH geändert hat. Signatur:
   `eigenerText(props, defaults?)`; `bausteinName` reicht
   `getBlockDefinition(node.type)?.defaultProps` herein.

> **P1 (Codex) — Prüfbündel bleibt grün OHNE Test-Änderung.** Codex' Fund
> stimmt: zwei Playwright-Wächter wählen ein FRISCHES Formularfeld und
> erwarten im Kopf „Formularfeld"
> ([formfeld-data.spec.ts:26](../../e2e/formfeld-data.spec.ts),
> [zwischenspeicher-data.spec.ts:25](../../e2e/zwischenspeicher-data.spec.ts)).
> Ein frisches Feld trägt den Default-Platzhalter „Feldname". **Statt** die
> Tests umzuschreiben (Codex' Vorschlag) mache ich `eigenerText`
> default-bewusst: „Feldname" == Default → kein Eigenname → der Kopf bleibt
> „Formularfeld". Erst ein umbenanntes Feld („Vorname") zeigt den
> Eigennamen. Vorteil: die e2e-Wächter bleiben **unberührt** (kein Anfassen
> von Guardrails), und die Regel ist generisch (Regel 2) statt an „Feldname"
> hartverdrahtet — jeder Baustein zeigt seinen Typ, solange sein Text
> unverändert ist. Nebeneffekt (gewollt): in den Steuerungs-Listen
> verschwindet der nutzlose Zusatz „— Feldname" bei unbenannten Bausteinen.

#### 5. Inspector-Kopf zeigt den Eigennamen

**Datei**: `src/editor/inspector/Inspector.tsx` (ändern)

Aktuell: `const blockName = def.displayName ?? def.type` (Zeile 140), genutzt
als Panel-Titel (Zeile 312) und als Rück-Label der Unteraufgabe (Zeile 163).

Änderung: `blockName` wird zum **Eigennamen, wenn vorhanden**:
`const blockName = eigenerText(block.props, def.defaultProps) ||
(def.displayName ?? def.type)`. So steht im Kopf „Vorname" statt
„Formularfeld"; ohne (oder mit noch unverändertem) Eigentext bleibt es beim
Bausteinnamen. (Import `eigenerText` aus `../zentrale/helfer`.) Rück-Label
und Panel-Titel ziehen automatisch mit. Weil ein frisches Formularfeld dank
Default-Bewusstsein weiter „Formularfeld" zeigt, bleiben die beiden
Playwright-Wächter grün (kein Test-Eingriff).

## Technical Considerations

- **Pattern Usage:** Regel 2 (Registry-Daten): Sichtbarkeit + Parameter-
  Zuordnung kommen aus der Vorlage, nirgends `if verb === 'PUT'`. Regel 3
  (Technikwert ≠ Anzeigename): Picker zeigt Feld-Klarnamen, speichert werden
  Zahlen/IDs. Regel 10 (nichts auf Verdacht): FieldPicker-Optik wiederverwenden,
  neuer Picker nur wegen echter Unterschiede (Suche/Mehrquellen).
- **RELID nur IDB (belegt):** die Auswahl bietet nur IDB-Quellen (s. P2),
  daher füllt `feldUebernehmen` RELID stets als `relIdFromIdbId(IDBID000x) =
  ID000x` — der einzige belegte PUT-Kontrakt.
- **Vorlage ohne `{RELID}`:** dann wird nur Position/Länge gefüllt (die
  Tabelle steckt fest in der Vorlage). Der Helfer setzt nur, was er findet.
- **Default-Werte zeigen den Typ:** dank Default-Bewusstsein (#4) gilt ein
  noch unveränderter Prop-Text nicht als Eigenname — ein frisches
  Formularfeld heißt weiter „Formularfeld", nicht „Feldname". Das hält die
  Playwright-Wächter grün und ist die klarere Anzeige.
- **Bündel-Wächter/Referenzabzug:** keine der geänderten Dateien wird vom
  Runtime-Bündel importiert; `feldUebernahme.ts` ist editor-only. Erwartung:
  `check:runtime` = „identisch", Referenzabzug byte-gleich.
- **Edge Cases:** keine Datenquellen → Knopf sichtbar, Fenster zeigt „keine
  Felder" (oder Knopf deaktiviert). Feld ohne `pos_len`-Code → nicht in der
  Liste. Mehrfach-Übernahme → überschreibt erneut, verlustfrei.

## Files to Modify/Create

1. `src/editor/zentrale/feldUebernahme.ts` (neu) — reiner Helfer
   (`kannUebernehmen`, `uebernahmeQuellen`, `feldUebernehmen`).
2. `src/editor/zentrale/FeldUebernahmePicker.tsx` (neu) — Portal-Auswahl-
   fenster mit Suche + Quellen-Gruppen.
3. `src/editor/zentrale/StepForm.tsx` (ändern) — Knopf + Fenster + Anwendung
   + Bestätigungszeile.
4. `src/editor/zentrale/helfer.ts` (ändern) — `placeholder` in `TEXT_PROPS`.
5. `src/editor/inspector/Inspector.tsx` (ändern) — Kopf zeigt Eigennamen.
6. `src/editor/zentrale/feldUebernahme.test.ts` (neu) — Unit-Tests des Helfers.
7. `CLAUDE.md` (ändern) — Fahrplan 3b nachziehen: der WERT füllt sich NICHT
   automatisch (Nutzer-Entscheidung 2026-07-22), nur Position/Länge/Tabelle;
   Merkliste um „Feld-übernehmen für Stammtabellen (wartet auf Beleg)"
   ergänzen. (P2 Codex — Doku-Konsistenz; wird beim Release/TRIP-3 committet.)

**Bewusst NICHT geändert:** die e2e-Specs (`formfeld-data`,
`zwischenspeicher-data`) — dank Default-Bewusstsein bleibt der Kopf beim
frischen Feld „Formularfeld" (Guardrails unberührt).

## Type Definitions

- `UebernahmeFeld` (in `feldUebernahme.ts`): `{ sourceId: string;
  sourceName: string; code: string; label: string }`.
- `UebernahmeTreffer`: `{ art: 'pos' | 'len' | 'relid'; wert: string }`
  (ein tatsächlich gesetzter Platzhalter).
- `FeldUebernahmeResult`: `{ params: ActionParamBinding[]; gesetzt:
  UebernahmeTreffer[] }` — Rückgabe von `feldUebernehmen`; `gesetzt` treibt
  die Klartext-Bestätigung (nur was gesetzt wurde).
- Keine Änderungen an bestehenden Modell-Typen (`ActionParamBinding`,
  `RelationTemplate`, `DataSource` bleiben unverändert).

## Performance & Cost Impact

Vernachlässigbar (Editor-seitige Listen im zweistelligen Bereich, keine
Laufzeit-/Export-Pfad-Änderung).

## Backward Compatibility

Vollständig abwärtskompatibel: gespeicherte Ketten/Bausteine unverändert.
„Feld übernehmen" schreibt dieselben festen Bindungen, die ein Bediener
heute von Hand setzt. Sprechende Namen sind reine Anzeige.

## Test Impact

- **Neue Unit-Tests (vitest, kein Browser):** `feldUebernahme.test.ts` —
  `kannUebernehmen` (Vorlage mit/ohne `{FELD_POS}`), `feldUebernehmen`
  (Standard-PUT → Position/Länge/Tabelle korrekt gesetzt, Wert/PINDEX
  unangetastet, Länge stimmt), `uebernahmeQuellen` (Felder ohne `pos_len`
  und Nicht-IDB-Quellen ausgelassen), `eigenerText` (Default „Feldname" →
  leer; „Vorname" → „Vorname").
- **Keine neuen e2e/Browser-Tests** (Test-Bremse: Paket berührt weder
  Export noch Laufzeit). Die bestehenden e2e (`formfeld-data`,
  `zwischenspeicher-data`) bleiben **unverändert grün** — der Kopf eines
  frischen Formularfelds bleibt dank Default-Bewusstsein „Formularfeld".
- **Wächter als Leitplanke:** Referenzabzug muss byte-gleich bleiben,
  `check:runtime` „identisch" — beweist, dass der Export unberührt ist.
- **Prüfbündel** einmal vor dem Commit: `npx tsc -b && npx eslint src &&
  npm run check:runtime && npm test && npx playwright test`.

## To-dos

### Phase 1 — Feld übernehmen

- [x] `feldUebernahme.ts` mit `kannUebernehmen` / `uebernahmeQuellen` /
      `feldUebernehmen` anlegen (reine Funktionen).
- [x] `feldUebernahme.test.ts` schreiben (Kern-Fälle oben).
- [x] `FeldUebernahmePicker.tsx` bauen (FieldPicker-Optik + Suche + Gruppen).
- [x] StepForm: Knopf (sichtbar via `kannUebernehmen`), Fenster-Zustand,
      Anwendung, Bestätigungszeile.

### Phase 2 — Sprechende Namen

- [ ] `helfer.ts`: `placeholder` in `TEXT_PROPS` + `eigenerText` default-
      bewusst machen (`eigenerText(props, defaults?)`, `bausteinName` reicht
      `defaultProps` herein).
- [ ] `Inspector.tsx`: Kopf/Rück-Label auf Eigennamen umstellen (mit
      `def.defaultProps`).
- [ ] Kurzer `eigenerText`-Unit-Test: Default „Feldname" → leer, „Vorname"
      → „Vorname".

### Abschluss

- [ ] `CLAUDE.md` Fahrplan 3b + Merkliste nachziehen (Wert nicht auto,
      Stamm-Übernahme wartet auf Beleg).
- [ ] Prüfbündel grün (inkl. „identisch" / byte-gleich als Beweis; e2e
      unberührt grün).
- [ ] Abschlussbericht mit „Aufgefallen unterwegs".

---

## UMBAU V2 — Auslöser AM Parameter (Nutzer 2026-07-22, bindend; ERSETZT den Sammel-Link)

> **Für den umsetzenden Agenten:** Dies ist der GÜLTIGE Zuschnitt. Er ersetzt
> den „Feld aus Datenquelle wählen …"-Sammel-Link aus Abschnitt 3 oben.
> Zustand: Branch `feat/feld-uebernehmen`, ALLES gestaged, NICHTS committet.
> V1 ist fertig gebaut und war grün (Prüfbündel + Codex APPROVED): Helfer
> `feldUebernahme.ts` + Tests, Picker `FeldUebernahmePicker.tsx`, StepForm-
> Link, sprechende Namen (helfer.ts/Inspector.tsx) — Phase 2 NICHT anfassen,
> die bleibt wie sie ist. V2 ändert NUR Erkennung + Auslöser + Picker-Stufen.

**Warum V2:** Die echte Nutzer-Vorlage ist
`PUT_RELATION[174!POS!LEN!VART!PINDEX!IDBID!QUELLDATEN]` — nackte Wörter,
KEINE `{}`-Platzhalter. V1 erkannte nur `{FELD_POS}`/`{FELD_LEN}`/`{RELID}`
→ Auslöser erschien beim Nutzer nie. Beide Schreibweisen müssen gehen.

**V2-Anforderungen (exakt so, nicht mehr, nicht weniger):**

1. **Erkennung je Parameter-Zeile** (Ganz-String, mit ODER ohne `{}`,
   Groß-/Kleinschreibung egal — Editor-Tabelle in `feldUebernahme.ts`):
   - Position: `POS`, `FELD_POS` · Länge: `LEN`, `FELD_LEN` ·
     Tabelle: `IDBID`, `RELID`.
   - `VART`, `PINDEX`, `QUELLDATEN` und alles andere: NIE anfassen.
2. **POS-Zeile** (Auslöser nur, wenn POS- UND LEN-Zeile erkannt sind —
   halbe Übernahme wäre die Dreier-Regel-Falle, Codex-Fund):
   kleines Symbol an der Zeile + **Enter im Wert-Feld** → Picker
   **zweistufig**: Stufe 1 = Datenquellen (NUR `kind === 'idb'`),
   Stufe 2 = Felder der gewählten Quelle (nur gültige `pos_len`-Codes;
   Suchfeld ok) → Klick füllt **POS und LEN** als feste Werte.
   **IDBID wird dabei NICHT angefasst.**
3. **IDBID-Zeile** (wenn erkannt): Symbol + Enter → Picker NUR Stufe 1
   (IDB-Quellen), Klick trägt `relIdFromIdbId(tableIdFor(source))`
   (Form `ID0001`) als festen Wert ein. **KEINE Feld-Stufe danach.**
4. **Sammel-Link + `kannUebernehmen`-Dreier-Gate entfernen** (ersetzt durch
   2+3). Bestätigungszeile behalten (zeigt nur, was gesetzt wurde; löscht
   bei jeder manuellen Änderung). **Escape-Schichtung unverändert
   übernehmen** (window-capture + `stopImmediatePropagation` — Escape
   schließt NUR den Picker, nie den Schritt).
5. Tests nachziehen: `feldUebernahme.test.ts` auf die neue Erkennung
   (beide Schreibweisen, Nutzer-Syntax aus dem Warum-Kasten als Testfall);
   `helfer.test.ts` bleibt unverändert.
6. **NICHT in diesem Paket:** QUELLDATEN = „Wert aus Formularfeld" (braucht
   Laufzeit/Export-Änderung + SE-Echttest) — eigener Folgeplan, nur in
   CLAUDE.md-Fahrplan als Nächstes notieren.

**Betroffene Dateien (nur diese + Tests):** `feldUebernahme.ts`,
`FeldUebernahmePicker.tsx`, `StepForm.tsx`. Export/Laufzeit tabu — Beweis:
`check:runtime` „identisch", Referenzabzug byte-gleich, KEINE neuen e2e
(Test-Bremse). Prüfbündel EINMAL am Ende (Kommandos s. o.), Bericht mit
Text-Ampeln + „Aufgefallen unterwegs". Kein Commit/Push ohne Nutzer-Go.

## Kleinputz huckepack (Nutzer-Go 2026-07-22 „totes raus" — mit V2 in EINEM Prüfbündel)

Mechanisch belegt (madge / ts-prune / grep, 2026-07-22). GENAU diese Punkte,
nichts darüber hinaus; Verhalten ändert sich NICHT (Beweis = dasselbe
Prüfbündel):

1. **Tote Exporte löschen** (vorher Nutzung gegenprüfen, dann weg):
   `getRegisteredBlockTypes` (core/blocks/blockRegistry.ts) ·
   `RelationPlaceholder` (core/data/relations.ts) · `VERB_LABELS`
   (editor/zentrale/helfer.ts — Überbleibsel des gelöschten
   Aktionen-Bereichs) · `Panel` (ui/molecules/panel.tsx; Datei ganz
   löschen, wenn danach leer).
2. **dashboard/-Kommentare** entschärfen (NUR Kommentartext, kein Code):
   KanbanSpalteBlock.ts:19 · statusVariant.ts:10+58 · masken-tokens.css:21
   — der Ordner `dashboard/` existiert nicht mehr; Verweis raus,
   Bedeutung des Kommentars erhalten.
3. **Testdaten-Name „Buddy"** in seRuntime.test.ts:151 → neutraler Name
   (reiner Testtext, kein Verhalten).
4. **Rohbilder aus dem Repo:** `git rm docs/logo-rohsatz.png
   docs/avatare-rohsatz.png` (≈6 MB; bleiben über die Git-Historie
   wiederherstellbar). `docs/Test-note*` NICHT anfassen (lokal, gitignored).
5. **3 Import-Zyklen in core/blocks** (madge: BlockDefinition ↔
   BlockComponent ↔ flowLayout): prüfen, ob nur Typ-Importe — dann auf
   `import type` umstellen (Zyklus weg, null Laufzeit-Änderung). ECHTE
   Wert-Import-Zyklen NICHT umbauen, nur im Bericht nennen.
6. **CLAUDE.md nachziehen** (gehört zum selben Commit-Thema):
   - Merkliste: erledigte Kleinputz-Punkte austragen; veralteten
     „Buddy"-Eintrag raus; NEU aufnehmen: „Import-Zyklen core/blocks"
     (nur falls nicht per `import type` lösbar) + „Feld-übernehmen für
     Stammtabellen (wartet auf belegten Stamm-PUT-Kontrakt)".
   - Fahrplan 3b: „Feld übernehmen" auf den V2-Zuschnitt (Auslöser am
     Parameter, Wörter-Tabelle) + Wert wird NICHT auto-gefüllt.
   - Reihenfolge festschreiben (Nutzer 2026-07-22): **V2+Kleinputz →
     Tabelle + QUELLDATEN-Wertquelle (gebündelt, EIN SE-Echttest) →
     Größen-Paket.** QUELLDATEN-Wertquelle = „Wert aus Formularfeld X,
     ohne Datenquellen-Bindung" als Folgeplan notieren.
