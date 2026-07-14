# Aufbau Editor Architektur

Stand: MVP-Reset + Schwenk auf Modell 2 (Container/Flow-Baum statt absolutem x/y).

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

Der Umfang waechst kapitelweise — der VERBINDLICHE Stand steht in der
CLAUDE.md-Roadmap. Aktuell (2026-07-14) aktiv:

- Bloecke: **Kanban (+ Spalte, Karte) und Schaltflaeche — sonst nichts.**
  Kahlschlag 2026-07-14 (Nutzer-Entscheidung): Text, Bereich (Container),
  Infobox, Status-Chip (Badge) und Eingabefeld (FormField) sind KOMPLETT
  entfernt (Code + Tests); sie hatten fuer das Ziel (Empfang-Board in
  SoftEngine) keine Funktion. Alte Speicherstaende: unbekannte Typen werden
  beim Laden SICHTBAR gemeldet (alert), ihre Kinder ruecken an ihre Stelle
  hoch (sanitizeTree, kein stiller Verlust). Neue Bausteine erst, wenn eine
  echte Maske sie erzwingt.
- Relationen werden AUSSCHLIESSLICH in der Steuerung gepflegt; das
  Inspector-Dropdown "Beim Verschieben zurueckschreiben ueber" ist
  abgeschafft (putRelation: hiddenInInspector). Das Board nutzt still die
  Standard-Schreibvorlage; Anpassen = Vorlage in der Steuerung bearbeiten
  (id bleibt stabil). Sichtbare Wahl kommt erst mit der Strecke (B4).
- Sidebar = nur die Baustein-Palette; Canvas (Flow + Drag&Drop);
  Inspector (Inhalt/Layout/Daten)
- Kommandozentrale (Toolbar „Steuerung", Z1/Z2): Aktions-Ketten-Editor je
  Baustein-Ereignis (StepForm; Z2: Schritt-Typ „Werkzeug starten
  (START_TOOL)") + Datenquellen- + Relationen-Bibliothek (aus der
  Sidebar umgezogen)
- Stores: Editor (Undo/Redo/Transaktionen), DataSourceStore, RelationStore
- Export nach SoftEngine (index.basis.source.html +
  index.basis.SEvariablen.json) mit Validator + Preflight; SE-Laufzeit des
  Kanbans (Push-Empfang, Hydrierung, Schreibweg)

## Datenmodell — Container/Flow-Baum (Modell 2)

SoftEngine-Masken sind fließendes HTML (Container + Flexbox/Grid). Darum ist der
Editor-State ein **Baum**, keine Liste mit Koordinaten: Die Lage eines Blocks
ergibt sich aus **Verschachtelung + Reihenfolge**, nicht aus x/y. Gespeichert als
flache Map (craft.js-Stil) mit einer impliziten Wurzel.

```ts
interface BlockNode {
  id: string
  type: string
  props: Record<string, unknown>
  events?: Record<string, ActionStep[]> // Aktionsketten je Ereignis (Z2)
  parentId: string | null // null nur für die Wurzel
  childIds: string[]       // geordnete Kinder = Flow-Reihenfolge
}

type BlockTree = Record<string, BlockNode>
```

`events` (Z2) liegt bewusst NEBEN `props`: props speisen Export-Attribute
und Lit-Properties, Ketten nicht (Modell: `src/core/data/aktionen.ts`,
wie `block.events` im alten Editor). Sie reisen im Export als EIN
`data-ff-aktionen`-Attribut; die Ausfuehrung in der Maske uebernimmt
`src/blocks/shared/seAktionen.ts` (nur im Export — data-ff-editor-Waechter).

`BlockTree` ist die gespeicherte Wahrheit. Er enthält keine Lit-Instanz, kein
React-Element und keine Editor-UI. Der Export (Kap. 8) ist ein deterministischer
Baum-Durchlauf → HTML.

> Historie: Bis zum Schwenk auf Modell 2 nutzte der Editor absolute
> `layout {x,y,width,height}`. Das war ein unvalidierter MVP-Default und ist
> überholt. Alte localStorage-Stände werden beim Laden in den Baum migriert
> (layout wird verworfen).

## Block-Vertrag

```ts
interface BlockComponent {
  get customProperties(): PropertyDescription[]
}
```

Statische Block-Daten wie `blockType`, `tagName`, `displayName`,
`defaultProps` und `customProperties` werden in der Registry gespeichert.

Spezialisierte Container (Kap. 4K.4, z. B. Kanban) beschreiben ihr Verhalten
ebenfalls rein deklarativ über Registry-Felder — die UI kennt keine
Block-Typen (`if type===` ist verboten):

- `allowedChildTypes`: erlaubte Kind-Typen (Spalte nimmt nur Karten).
  Durchgesetzt an EINER Stelle (`canContain` in blockRegistry), benutzt vom
  Store (addBlock/moveNode) und der Drag-Vorschau im Canvas.
- `defaultChildren`: Beispieldaten-Teilbaum beim Einfügen (nie ein leeres
  Gerippe); materialisiert von `createBlockSubtree` in der Factory.
- `childDirection`: feste Fluss-Richtung der Kinder (Board = row) —
  aufgelöst über `resolveChildDirection` in flowLayout (dieselbe Quelle für
  Canvas UND Export).
- `showInPalette`: false = Baustein entsteht nur in seinem Organismus.
- `containerHint`: false = keine gestrichelte Editor-Hilfe (eigenes Chrome).
- `addChildButton`: Editor-Hilfe „Plus-Knopf" im BlockHost („+ Karte").
- `acceptsDataSource` (Kap. 5.1): an den Block lässt sich eine Datenquelle
  hängen (`source`-Prop = Vorlagen-id, Inspector-Sektion „Daten", Export
  erzeugt daraus den SEFILELOOP).
- `blockEvents` (Z1, Vorgriff Kap. 8): Ereignisse des Blocks mit Klarnamen
  (Kanban: „Karte angeklickt"/„Karte verschoben"; key = Technikwert im
  Vokabular des alten Editors, z. B. onCardClick). Die Kommandozentrale
  listet sie; seit Z2 haengen die Aktionsketten daran (`BlockNode.events`,
  s. Datenmodell — Ketten-Editor in der Zentrale, Schritt-Typen-Registry
  STEP_TYPES in `src/core/data/aktionen.ts`).
- `bindableSpots` (Kap. 5.2): bindbare Text-Stellen des Blocks
  (Anzeige-Prop + Klarname). Die Bindung (Feldcode) liegt in `<prop>Field`
  (Default '' in den defaultProps). Der Block annotiert die Stelle mit
  `data-ff-spot` (Klick-Ziel Feld-Picker) und `data-ff-bound` (Daten-
  Markierung); Markierung + Beispielwert-Vorschau erscheinen NUR im Editor —
  der BlockHost setzt das Host-Attribut `data-ff-editor` und ersetzt die
  Anzeige-Properties gebundener Stellen durch die Beispielwerte des
  Feld-Wörterbuchs (`Editor.dataSourceFor` = Quelle des nächsten
  acceptsDataSource-Vorfahren). Der Baum bleibt dabei unberührt.

Daten-Controls im Inspector (Kap. 5.3, PropertyDescription statt Registry):

- `kind: 'field'`: Auswahl eines Felds der Quelle in Reichweite — Klarnamen
  sichtbar, gespeichert wird der Feldcode (Technikwert).
- `requiresDataSource`: Control nur mit Quelle in Reichweite sichtbar
  (gespeicherte Werte bleiben erhalten und leben mit der Quelle wieder auf).
- Beide erscheinen in der Inspector-Sektion „Daten" (nicht in der
  allgemeinen Gruppe). Das Kanban nutzt sie für `statusField` (Board:
  „Einsortieren nach") und `putRelation` (Board: „Beim Verschieben
  zurückschreiben über").
  Die Spalte hat KEIN Wert-Control: ihr TITEL (`heading`, Inline-Edit)
  IST der Datenwert (Nutzer-Entscheidung 2026-07-14, Titel = Wert).

Datenverhalten der exportierten Maske (Kap. 5.3): liegt beim Block, nicht
im Export-Generator — `src/blocks/kanban/seRuntime.ts` ist Teil des
Runtime-Bündels. Das Board meldet sich in `connectedCallback` an; Elemente
mit `data-ff-editor` (Editor) werden abgewiesen, darum existiert die
SoftEngine-Mechanik im Editor nicht. Zeilen kommen aus SEDATA (Formen wie
in `dashboard/praxis-kanban.html`), jede Zeile wird ein Klon der ersten
gestalteten Karte, gebundene Stellen (`bindableSpots` aus der Registry)
werden mit Zeilenwerten gefüllt, der Spalten-TITEL (`heading`) verteilt
(Titel = Wert, 2026-07-14; Ziehen schreibt den Titel der Zielspalte).

## Datenfluss

```txt
Sidebar klick
  -> editor.addBlock(type)         (hängt neuen Knoten an die Wurzel)
  -> BlockNode wird in den Baum eingehängt
  -> Canvas rendert die Kinder im Fluss (childNodesOf(root)) via BlockHost
  -> BlockHost erstellt das passende <ff-*> Element (natürliche Größe, kein x/y)
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

- **atoms** (`src/ui/atoms/`): kleinste Bausteine — reine Controls ohne Label/
  Beschreibung: Button, IconButton, TextInput, Textarea, Select
  (Select = shadcn/Radix-Primitives).
- **molecules** (`src/ui/molecules/`): kleine Kombinationen — `Field`
  (Label + Beschreibung + Fehlertext um ein beliebiges Control, inkl.
  aria-Verdrahtung), `SidePanel` (Header + scrollbarer Body für Sidebar/
  Inspector), `Panel` (Card mit Rahmen, für spätere komplexe Blöcke). Die
  Inspector-Controls (`src/editor/inspector/controls/`) komponieren `Field` +
  Atom und liegen aus Feature-Gründen dort, sind aber konzeptionell Molecules.
- **organisms** (`src/editor/`): Sidebar, Inspector, Toolbar, Canvas,
  BlockPalette, Kommandozentrale (`src/editor/zentrale/`).
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
- `src/editor/zentrale/Kommandozentrale.tsx`
- `src/editor/shell/EditorShell.tsx`
