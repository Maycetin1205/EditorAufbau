# Aufbau Editor Architektur

Stand: MVP-Reset.

Dieses Projekt ist jetzt bewusst klein gehalten. Ziel ist nicht, alle alten
Editor-Ideen sofort zu tragen, sondern die Architektur aus den Notizen lernbar
zu machen.

## Ziel

Ein Block ist eine Komponente mit eigener Klasse:

- `BasicBlock` ist die gemeinsame Basisklasse — sie traegt nur, was wirklich
  jeder Block braucht.
- `ButtonBlock` und `TextBlock` erben nur diese gemeinsame Basis.
- Neue/optionale Features kommen per Composition (Lit Reactive Controller),
  nicht als immer mehr Methoden in die Basis (Lit-Empfehlung: fuer Features
  composition > inheritance). Die Basis darf nicht zum Sammelbecken werden.
- Jeder Block beschreibt seine editierbaren Eigenschaften ueber
  `PropertyDescription`.
- Der Editor speichert keine DOM-Objekte, sondern nur `BlockData`.
- Canvas, Sidebar und Inspector reagieren auf denselben Editor-State.

## Aktiver Umfang

Aktiv sind nur:

- Button-Block
- Text-Block
- Sidebar zum Hinzufuegen
- Canvas zum Anzeigen und Auswaehlen
- Inspector zum Bearbeiten
- zentraler Editor-Store mit Undo/Redo/Duplizieren/Loeschen

Alle alten Erweiterungen ausserhalb dieses MVP-Kerns wurden entfernt. Spaeter
koennen einzelne Themen wiederkommen, aber erst wenn der kleine Editor
verstanden und stabil ist.

## Datenmodell

```ts
interface BlockData {
  id: string
  type: string
  layout: {
    x: number
    y: number
    width: number
    height: number
  }
  props: Record<string, unknown>
}
```

`BlockData` ist die gespeicherte Wahrheit. Es enthaelt keine Lit-Instanz, kein
React-Element und keine Editor-UI.

## Block-Vertrag

```ts
interface BlockComponent {
  get customProperties(): PropertyDescription[]
}
```

Statische Block-Daten wie `blockType`, `tagName`, `displayName`,
`defaultProps`, `defaultLayout` und `customProperties` werden in der Registry
gespeichert.

## Datenfluss

```txt
Sidebar klick
  -> editor.addBlock(type)
  -> BlockData wird erzeugt
  -> Canvas rendert BlockHost
  -> BlockHost erstellt das passende <ff-*> Element
  -> Inspector liest PropertyDescription (nur fuer Bloecke mit customProperties)
  -> Inspector schreibt Aenderungen in editor.updateProperty
  -> Canvas rendert mit neuen Props

Inline-Edit (Doppelklick auf den Block; z.B. Button/Text):
  -> Block emittiert 'ff-prop-change' { attr, value }
  -> BlockHost -> editor.updateProperty
  -> Canvas rendert mit neuen Props
```

## UI-Struktur (Atomic Design)

Die Editor-UI ist nach Atomic Design geschichtet. Regel: Struktur von Anfang an
— aber nichts kuenstlich zerlegen, nur weil eine Schublade existiert.

- **atoms** (`src/ui/atoms/`): kleinste Bausteine — Button, IconButton,
  TextInput, Textarea, Select.
- **molecules** (`src/ui/molecules/`): kleine Kombinationen — Panel. Die
  Inspector-Controls (Label+Feld) liegen aus Feature-Gruenden unter
  `src/editor/inspector/controls/`, sind aber konzeptionell Molecules.
- **organisms** (`src/editor/`): Sidebar, Inspector, Toolbar, Canvas,
  BlockPalette.
- **templates** (`src/editor/shell/`): EditorShell = das Gesamt-Layout.
- **Bloecke** (`src/blocks/`): eigene Achse (Export-Inhalte). Ein einfacher
  Block (Button/Text) ist ein Organismus; bei komplexen Bloecken (spaeter
  Kanban/DetailCard) werden interne Teile zu eigenen atoms/molecules.

## Wichtige Dateien

- `src/core/blocks/BasicBlock.ts`
- `src/core/blocks/BlockComponent.ts`
- `src/core/blocks/BlockData.ts`
- `src/core/blocks/PropertyDescription.ts`
- `src/core/blocks/blockRegistry.ts`
- `src/core/blocks/blockFactory.ts`
- `src/blocks/button/ButtonBlock.ts`
- `src/blocks/text/TextBlock.ts`
- `src/state/Editor.ts`
- `src/editor/canvas/Canvas.tsx`
- `src/editor/canvas/BlockHost.tsx`
- `src/editor/inspector/Inspector.tsx`
- `src/editor/sidebar/BlockPalette.tsx`
- `src/editor/shell/EditorShell.tsx`
