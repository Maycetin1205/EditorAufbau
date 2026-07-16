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

## Danach — erst NACH Rücksprache (A3–A7, grob)

- **A3** BlockHost (489 Z.) + Canvas (463 Z.) in Handgriffe teilen:
  Element-Brücke, Bindungs-Picker, Größenziehen als eigene Hooks/
  Komponenten; Seiten-Leiste + Popup-Seite aus Canvas.tsx herauslösen.
- **A4** React↔Lit-Übergabestelle als ein Adapter (erzeugen/Props/
  aufräumen an genau einer Stelle).
- **A5** `…Field`-Bindungs-Konvention als typgeprüfte Registry-Angabe;
  Editor/Laufzeit/Export lesen DIESELBE Definition; Export Byte-identisch.
- **A6** Exporter auf einen Serialisierer (ASCII/LF/Reihenfolge an genau
  einer Stelle); Byte-identisch, sonst SE-Echttest.
- **A7** Historische Kommentar-Passagen nach `docs/decisions/`.

## Prüf-Checkliste je Schritt (abhaken)

- [ ] Nur Umzug, keine Logik-Änderung (Diff nebeneinander gelesen)
- [ ] Keine Testdatei im Diff
- [ ] Kein Baustein-/Export-/SoftEngine-Code im Diff (A1/A2)
- [ ] `npx tsc -b` grün
- [ ] `npx eslint src e2e` grün
- [ ] `npm test` grün (104+)
- [ ] `npx playwright test` grün (9)
- [ ] Commit + Push (Branch UND main)
