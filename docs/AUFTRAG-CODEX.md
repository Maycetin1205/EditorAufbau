# Arbeitsauftrag an Codex (2026-07-16): Formularfeld anschließen + Multi-Datenquelle + Datumsbaustein

> Übergabe von Claude nach abgeschlossener Analyse (Nutzer-Anweisung 2026-07-16:
> „Codex bringt die Aufgabe zu Ende"). Die Analyse ist FERTIG — dieses Dokument
> enthält das komplette Design mit Dateipfaden. Nichts mehr erkunden, bauen.

## ⚠ ZUERST: der richtige Branch

**Arbeitsbranch = `claude/data-binding-architecture-odkwi0` — NICHT main.**

Begründung: Die Feature-Basis, die dieses Paket braucht (Relations-Vorlagen,
GET/PUT-Laufzeit `src/softengine/relations.ts`, Aktionsketten `seAktionen.ts`,
Zentrale, Karten-Bindungs-Mechanik), existiert NUR auf diesem Branch. main
enthält den U-Umbau (U1–U5), aber KEINE dieser Grundlagen — dort gebaut wäre
alles doppelt/umsonst. Die Zusammenführung main ↔ dieser Branch ist ein
EIGENES Paket und passiert nur auf Nutzer-Anweisung, nicht nebenbei.

Regel 8 gilt: vor Arbeitsbeginn und vor jedem Push `git fetch`; Claude rührt
diesen Branch ab jetzt nicht mehr an. Der Nutzer hat die Abnahme von
Fahrplan-Schritt 3a/3b erteilt (2026-07-16).

## Paket 1 — Formularfeld anschließen (Fahrplan-Schritt 4)

Ziel: Feld-Bindung lesen/schreiben + Platzhalter-Regel („Platzhalter weg,
sobald das Feld einen Wert HAT — egal woher"). Alles registry-getrieben,
kein `if typ === 'formfeld'` irgendwo.

### 1a. `src/blocks/formfeld/FormFeldBlock.ts`

- `defaultProps` ergänzen: `source: ''`, `value: ''`, `valueField: ''`.
- `static readonly acceptsDataSource = true` — damit löst
  `editor.dataSourceFor` (src/state/Editor.ts:459) die Quelle am Feld SELBST
  auf und die Preflight S1a (gelöschte Quelle) greift automatisch.
- `static readonly bindingRoute = { fieldProp: 'valueField' }` — der
  Inspector zeigt damit automatisch „Daten anschließen…"
  (BindungsAnschluss/BindungsStrecke, beides generisch, nichts anfassen).
- `customProperties` + Eintrag für `valueField`: `kind: 'field'`,
  `hiddenInInspector: true`, Name „Feld", Beschreibung in Klartext
  (Muster: statusField im KanbanBlock).
- `static readonly bindableSpots = [{ prop: 'value', label: 'Wert' }]`.
- Neue `@property() value = ''`. Den `_belegt`-State ERSETZEN:
  Platzhalter versteckt ⇔ `this.value !== ''` (das IST die
  Platzhalter-Regel — getippt, gepusht oder programmatisch, egal).
  `onInput` setzt `this.value = t.value` (kein Update-Loop: gleicher Wert
  rendert nicht neu).
- Template: `.value=${this.value}` an input/textarea binden. Select: steht
  `value` nicht in den Optionen, eine zusätzliche `hidden`-Option mit dem
  Datenwert rendern (selected) — der echte Datenwert bleibt sichtbar, nie
  stumm leer.
- `.huelle` bekommt `data-ff-spot="value"` und
  `?data-ff-bound=${this.valueField !== ''}` — der FieldPicker im BlockHost
  funktioniert damit sofort (spotAt läuft über composedPath; die Stelle
  öffnet nur, wenn eine Quelle in Reichweite ist — beim Formularfeld also
  erst nach „Daten anschließen…", derselbe Fluss wie beim Kanban).
  Editor-Sichtbarkeit der Bindung (die gepunktete Unterstreichung aus
  BasicBlock greift an einem div nicht):
  `:host([data-ff-editor]) .huelle[data-ff-bound] .ctrl { border-style: dotted; border-color: var(--se-accent); }`
- **Ankreuzfeld: v1 NICHT bindbar** (kein Spot am checkbox-Zweig). Der
  SE-Wert-Kontrakt (J/N? 1/0? X/leer?) ist unbelegt — Regel 5, erst Beleg
  aus einer echten Maske. Auf die Merkliste.
- **Datum:** Wert-Konvention ist DD.MM.YYYY (dieselbe wie `formatNowDate`,
  src/core/data/relations.ts:98). Das date-Input braucht ISO: tolerant
  konvertieren (DD.MM.YYYY ↔ YYYY-MM-DD in beide Richtungen); unparsebare
  Werte roh lassen. Datum hat bewusst keinen Platzhalter (MIT_PLATZHALTER).
- `static readonly blockEvents = [{ key: 'onChange', name: 'Wert geändert' }]`
  — erscheint damit automatisch in der Zentrale/Aktionen. **Der Schreibweg
  nach SoftEngine ist die SICHTBARE Kette** (PUT_RELATION-Schritt, Parameter
  aus Quelle „Ereignis"/VALUE) — KEIN eingebautes Auto-PUT (dieselbe Linie
  wie die Kanban-Entscheidung 2026-07-15).
- `connectedCallback`/`disconnectedCallback`: `connectField(this)` /
  `disconnectField(this)` (Muster KanbanBlock ↔ seRuntime).

### 1b. NEU `src/blocks/formfeld/feldRuntime.ts` (Muster: `src/blocks/kanban/seRuntime.ts`)

- `connectField(el)`: `data-ff-editor` → sofort raus (Editor kennt die
  Mechanik nicht). Registrieren, EINMAL `onSeDaten(hydrateAll)` abonnieren,
  `bootSe()`, bei vorhandenen Daten sofort hydrieren.
- `hydrate(el)`: Attribute lesen — **lowercase!** (`source`, `valuefield`;
  vgl. seRuntime.ts:150) → `findRuntimeDataSource(seGlobal().FF_DATA_SOURCES, id)`
  → `rowsFor(seGlobal().SEDATA, source.name, source.tableId)` →
  **Zeile = rows[0]** (v1: erste Zeile; bei Stammquellen ADR/ART/BEL ist das
  genau der eine Satz. Zeilen-Auswahl per Klick = späteres Paket
  „bausteinübergreifende Selektion", Merkliste) →
  `el.value = getField(row, code)` (Property-Zuweisung NACH dem Einhängen,
  wie seRuntime). Zeile + pindex je Feld in einer WeakMap merken.
- Schreibweg lokal: `input`-Ereignis → `setField(row, code, wert)`
  (src/softengine/data.ts patcht direkte Properties, präfixierte Schlüssel
  UND den SATZ-Rohstring — fertig vorhanden). Damit lesen Datenfeld-Parameter
  von Relationsschritten und jede Neu-Hydrierung den aktuellen Wert.
- `change`-Ereignis (committed, nicht jeder Tastendruck) →
  `runEvent(el, 'onChange', { VALUE: wert, PINDEX: pindex })`
  (src/blocks/shared/seAktionen.ts). `PINDEX` = Wert von `source.indexField`
  aus der Zeile ('' wenn kein indexField — die Kette entscheidet selbst).

## Paket 2 — Multi-Datenquelle (fast geschenkt, BEWEIS bauen)

Befund der Analyse: Der Export kann es strukturell schon —
`collectDataSources` (src/export/exportMask.ts:192) sammelt ALLE Quellen im
Baum (dedupliziert), `FF_DATA_SOURCES` ist eine Liste, die SEFILELOOP mappt
über alle benutzten Quellen. `rowsFor` trennt je Quelle über ALIAS/IDB-ID.
Sobald das Formularfeld `acceptsDataSource` hat, wählt jedes Feld seine
EIGENE Quelle — Kanban(Quelle A) + Felder(Quelle B, C…) in einer Maske.

Zu bauen ist der BEWEIS als Test (export.test.ts + feldRuntime-Test):
1. Baum mit Kanban(Quelle A) + Formularfeld(Quelle B) → Export enthält BEIDE
   in `window.FF_DATA_SOURCES` UND als ZWEI SEFILELOOP-Einträge.
2. Ein Daten-Push mit beiden Tabellen hydriert Board UND Feld korrekt getrennt.
Falls dabei eine echte Ein-Quellen-Annahme auffliegt: fixen, im Commit nennen.

## Paket 3 — Datumsanzeige-Baustein (eigener Commit, NACH Paket 1)

NEU `src/blocks/datum/DatumBlock.ts` + Eintrag in `src/blocks/register.ts`:
- category 'anzeige', in der Bibliothek sichtbar; Optik nur aus
  Masken-Tokens (--se-*), Muster: Zeit/Datum-Stellen der Karte
  (`--se-mono`, `--se-muted`).
- Gleiche Bindungs-Mechanik wie das Formularfeld: `acceptsDataSource`,
  `bindingRoute { fieldProp: 'valueField' }`,
  `bindableSpots [{ prop: 'value', label: 'Wert' }]`, Laufzeit-Hydrierung
  aus rows[0] (die feldRuntime dafür generalisieren ODER eine kleine
  eigene — nur wenn ein echter zweiter Fall Gemeinsames erzwingt, Regel 10:
  hier IST das Formularfeld der zweite Fall, also gemeinsame Hilfsfunktion
  ziehen).
- UNGEBUNDEN zeigt der Baustein das ECHTE aktuelle Datum (kein erfundener
  Demo-Wert — Regel 7 verbietet Erfundenes, die echte Uhr ist nicht
  erfunden), Format DD.MM.YYYY wie `formatNowDate`. Prop `zeigt` mit
  Klarnamen-Auswahl: Datum / Zeit / Datum + Zeit (Technikwerte unsichtbar).
  GEBUNDEN zeigt er den Feldwert (Editor: Klarname als Vorschau, macht der
  BlockHost generisch).

## Prüfungen + Commits (Regel 9)

- **`npm run build:runtime` NICHT vergessen** — sonst schlägt der
  Veralten-Wächter in export.test an (das Bündel ist eingecheckt).
- Danach EINMAL gebündelt: `npx tsc -b` + `npx eslint src` + `npm test` +
  `npx playwright test`.
- Ein Thema = ein Commit: (1) Formularfeld-Anschluss inkl. Multi-Quelle-Beweis,
  (2) Datumsbaustein. Push auf DIESEN Branch.
- Das Paket berührt den Export → SE-Echttest durch den Nutzer ansetzen
  (Checkliste in den Commit-/Übergabetext: Feld zeigt Wert nach Push;
  Tippen + Kette „Wert geändert" mit PUT; zwei Quellen in einer Maske).

## Stolperfallen (aus der Analyse, alle belegt)

- Export-Attribute sind lowercase (`valuefield`), Properties camelCase.
- `window.FF_*` NIEMALS als `var` (WEBWARE-Kapselung — Gedächtnis
  se-webui-globals-window + Kommentar in exportMask.ts).
- Der Editor erfindet nie Daten: keine Demo-Werte in defaultProps; die
  Klarnamen-Vorschau gebundener Stellen macht der BlockHost NUR im DOM,
  der Baum bleibt sauber.
- Die Bindungs-Vorschau im BlockHost setzt `elAny['value'] = Klarname` —
  dadurch verschwindet im Editor der Platzhalter am gebundenen Feld
  (gewollt, exakt wie die Karte).
- seRuntime/Karten-Logik NICHT anfassen; die SoftEngine-Schicht
  (src/softengine/) kennt weiterhin KEINEN Baustein (Abhängigkeitsregel).
