# Aufräum-Plan (2026-07-16) — Editor-Kern & BlockHost in Fächer teilen

> **Idiotensichere Vorgabe.** Jeder Schritt ist ein reiner UMZUG von Code —
> Verhalten, Bedienung, Export und Speicherform ändern sich um NULL.
> Die Wächter beweisen das nach jedem Schritt. Wer diesem Plan folgt,
> kann nichts kaputt machen, solange er die Eisernen Regeln einhält.

## Eiserne Regeln (gelten für JEDEN Schritt)

1. **Nur verschieben, nie umschreiben.** Funktionskörper wandern wörtlich
   in ihre neue Datei. Kein „wo ich schon mal hier bin"-Verbessern.
   Verbesserungen = eigenes Paket, eigener Commit, eigene Absprache.
2. **Keine Testdatei wird angefasst.** Wird ein Wächter rot, ist der UMZUG
   falsch — der Umzug wird korrigiert, nie der Wächter. (Einzige erlaubte
   Test-Änderung: ein Import-Pfad, falls ein Test bewusst ein internes
   Modul lädt — aktuell lädt kein Test interne Pfade, alle gehen über
   `./Editor`.)
3. **Außen-Vertrag bleibt identisch:** Alles, was heute aus
   `src/state/Editor.ts` importiert wird (`Editor`, `editor`, `BACKUP_KEY`),
   ist auch NACH dem Umzug von dort importierbar (notfalls Re-Export).
4. **Ein Schritt = ein Commit**, davor das volle Prüfbündel:
   `npx tsc -b` → `npx eslint src e2e` → `npm test` → `npx playwright test`.
   Alles grün → committen → pushen (Branch UND main). Irgendwas rot →
   nichts committen, Ursache finden.
5. **Kein Baustein-Code wird berührt** (src/blocks/*, src/softengine/*,
   src/export/*) → das Runtime-Bündel bleibt unverändert, der Export bleibt
   automatisch Byte-identisch. Muss `build:runtime` laufen, ist etwas falsch.

## A1 — `src/state/Editor.ts` (735 Zeilen, 5 Jobs) in Fächer teilen

Zielbild: Editor.ts behält NUR den Zustand + die öffentlichen Methoden
(die intern delegieren). Fünf neue Fächer daneben:

| Neue Datei | Was zieht ein (wörtlich aus Editor.ts) |
|---|---|
| `src/state/treeOps.ts` | `createRootNode`, `createEmptyTree`, `normalizeProps`, `cloneSubtree`, `collectSubtree` (als reine Funktion `collectSubtree(tree, id)`) |
| `src/state/migrations.ts` | `CURRENT_SCHEMA_VERSION`, `migrateKanbanVorlage`, `ALTE_KARTEN_DEMOS` + `putzeAlteKartenDemos`, `migrateFlatBlocks`, `migrateRootKanbanToViewportFill` |
| `src/state/persistence.ts` | `STORAGE_KEY`, `BACKUP_KEY`, `SAVE_DEBOUNCE_MS`, `PersistedState`/`LoadedState`, `sanitizeTree` (Lade-Verteidigung), `backupUnreadableState`, `loadFromStorage`, `persistState` (der Speicher-Rumpf aus `scheduleSave`) |
| `src/state/history.ts` | `EditorSnapshot`, `HISTORY_LIMIT`, neue kleine Klasse `Historie` (Verlauf + Zukunft + Transaktionstiefe — exakt die heutige Logik aus `pushHistory`/`beginTransaction`/`endTransaction`/`undo`/`redo`, nur gekapselt) |
| `src/state/templateRules.ts` | `owningTemplateBoardId`, `templateMarkFor`, `isRemoveProtected` (als reine Funktionen über `(tree, id)`) |

In `Editor.ts` bleibt: die Klasse `Editor` (Zustand `_tree`, `_selectedId`,
`_activePageId`, `_version`, `_saveTimer`, `_hydrated`, eine `Historie`-
Instanz), alle heutigen öffentlichen Getter/Methoden (Signaturen
UNVERÄNDERT — sie rufen jetzt die Fächer), das Singleton
`export const editor` (fällt erst in A2) und `export { BACKUP_KEY }`
als Re-Export (der persistence-Wächter importiert ihn von hier).

**Abnahme A1:** Prüfbündel komplett grün, `git diff --stat` zeigt NUR
`src/state/*` (+ dieses Dokument/CLAUDE.md), kein Test verändert.

## A2 — Editor über Versorger (Provider) statt Weltvariable

Heute fassen genau DREI Stellen das globale `editor`-Objekt an:
`state/useEditor.ts`, `state/useKeyboardShortcuts.ts`,
`editor/canvas/BlockHost.tsx`. Alle React-Oberflächen gehen bereits über
den Haken `useEditor()` — nur der Haken selbst greift zur Weltvariablen.

Schritte:
1. Neue Datei `src/state/EditorProvider.tsx`: React-Context, der EINE
   `Editor`-Instanz trägt; `<EditorProvider>` bekommt sie als Prop.
   Fehlt der Versorger, wirft `useEditor()` eine Klartext-Fehlermeldung
   (nie stilles Nichts).
2. `src/main.tsx` (bzw. App-Einstieg): erzeugt `new Editor()` EINMAL und
   spannt den Versorger um die App.
3. `useEditor()`: liest die Instanz aus dem Context (Abo-Mechanik
   `useSyncExternalStore` bleibt wörtlich gleich).
4. `useKeyboardShortcuts`: nimmt die Instanz über `useEditor()` statt
   über den Import.
5. `BlockHost.tsx`: `import { editor }` fliegt raus, stattdessen
   `useEditor()` (die Instanz ist stabil — Verhalten in Effekten und
   Listenern identisch).
6. `export const editor = new Editor()` wird aus Editor.ts GELÖSCHT —
   ab jetzt gibt es keine Weltvariable mehr. (Die Store-Tests bauen sich
   ihre Instanzen selbst mit `new Editor()` — unberührt.)

**Abnahme A2:** Prüfbündel grün; `grep "import { editor }"` über src/
liefert NULL Treffer; Editor im Browser kurz durchgeklickt (bauen,
Undo, Seite wechseln, speichern/neu laden).

## A3–A7 — ERLEDIGT 2026-07-17 (Nutzer-Go im Auftrag, je Schritt ein Commit)

- **A3 ✅** BlockHost + Canvas in Handgriffe geteilt: Knoten-Rekursion
  (`CanvasNode.tsx`), Dnd-Zustand (`dndState.ts`), Seiten-Reiter
  (`SeitenLeiste.tsx`), Popup-Seite (`PopupSeite.tsx`); Bindungs-Picker
  (`useBindingPicker.ts`) + Größenziehen (`useBlockResize.ts`) als Hooks.
  Canvas.tsx re-exportiert `DndContext`/`DropTarget` (Außen-Vertrag).
- **A4 ✅** React↔Lit-Übergabestelle als EIN Adapter
  (`useLitElement.ts`): Erzeugen/Props/Aufräumen an genau einer Stelle,
  wörtlich aus BlockHost gezogen.
- **A5 ✅** Bindungs-Konvention als typgeprüfte Registry-Angabe in
  `BlockDefinition.ts` (BindingProp/BindingAttr/bindingProp +
  BindableSpotsFor/BindingRouteFor). Editor liest `bindingProp()`;
  Laufzeit (seRuntime/feldRuntime) und Bausteine verankern per
  `satisfies`/Annotation — NUR Typen. Beweis: Runtime-Bündel nach
  Rebuild diff-frei UND Export-Referenzabzug Byte-identisch.
- **A6 ✅** Zeichen-Serialisierung (ASCII-Escaping, Skript-Schutz,
  CSS-Bereinigung) wörtlich in `src/export/serializer.ts`; Markup +
  Reihenfolge bleiben in exportMask. Beweis: Export Byte-identisch
  (Referenzabzug vorher/nachher).
- **A7 ✅** Historische Kommentar-Passagen nach `docs/decisions/`
  (2026-07-10-editor-hilfen, 2026-07-14-kahlschlag-bausteine,
  2026-07-15-kanban-schreibweg-und-schicht,
  2026-07-16-karte-empfang-anatomie); im Code bleiben geltende Verträge
  + Verweis. Migrations-Kommentare bewusst unangetastet (dokumentierte
  Daten-Übergänge). Bündel + Export weiterhin Byte-identisch.

## Aufgefallen unterwegs (2026-07-17) — Nacharbeiten aus A3–A7

Bewusste Restposten der Umzüge, als entscheidbare Pakete notiert
(Vorschlagen ist Pflicht, gebaut wird nichts ohne „go"):

- **Zieh-Mechanik einmal:** Block-Anfasser (`useBlockResize`) und
  Popup-Anfasser (`PopupSeite`) teilen dieselbe Geste (Transaktion auf →
  Wert je Bewegung in den Store → Transaktion zu); unterschiedlich sind
  nur Prop, Mindestwert und Faktor (Popup: 2×Delta, weil zentriert).
  Eigenes Editor-Paket, kein Export-Einfluss — **wartet auf „go"**.
- **Huckepack an P-C** (derselbe SE-Echttest deckt alles, beides ändert
  das Runtime-Bündel): `bindingAttr()` wirklich in der Laufzeit benutzen
  (seRuntime/feldRuntime — heute nur Typ-Anker aus A5) + die Popup-Regel
  „Fläche − 24px" als EINE geteilte Konstante (heute doppelt:
  PopupBlock-CSS und PopupSeite-Anfasser).
- **Markup-Bauen aus exportMask** (nodeToHtml/styleAttr als eigenes Fach)
  erst MIT dem Tabellen-Baustein — vorher nur Ästhetik, Risiko am
  empfindlichsten Stück; Reihenfolge-Regeln haben heute schon genau
  EINE Heimat (exportMask).
- **Entscheidungen offen (Nutzer):** Projektkarte automatisch aktuell
  halten (`docs:map` in der Commit-Routine oder docs:map:check als
  fünfter Wächter) · Export-Referenzabzug als festes Beweis-Skript.

## Prüf-Checkliste je Schritt (abhaken)

- [ ] Nur Umzug, keine Logik-Änderung (Diff nebeneinander gelesen)
- [ ] Keine Testdatei im Diff
- [ ] Kein Baustein-/Export-/SoftEngine-Code im Diff (A1/A2)
- [ ] `npx tsc -b` grün
- [ ] `npx eslint src e2e` grün
- [ ] `npm test` grün (104+)
- [ ] `npx playwright test` grün (9)
- [ ] Commit + Push (Branch UND main)
