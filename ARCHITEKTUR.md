# ARCHITEKTUR.md - EditorNext

Status: verbindliche Architektur v1 fuer den neuen Aufbau-Editor.

Diese Datei ist der Bauvertrag fuer Mensch und KI. Jede groessere Code-Aenderung im neuen Editor muss dazu passen. Wenn eine Regel nicht mehr passt, wird zuerst diese Datei bewusst geaendert, danach Code.

Jede abgeschlossene Etappe wird dokumentiert, geprueft und sichtbar markiert. Nichts gilt als fertig, nur weil Code geschrieben wurde.

## 1. Kurzfassung

Wir bauen den Editor neu auf Basis von `Aufbau/react-app`.

Der alte Editor und andere vibe-coded Staende sind nur Prototypen. Sie duerfen zum Verstehen gelesen werden, sind aber kein Wegweiser fuer Architektur, UI, Dateistruktur oder Code-Stil.

Leitsatz:

```txt
React baut die Werkstatt.
Mantine liefert die einheitliche Editor-UI.
Lit/Web Components sind die echten WYSIWYG-Bausteine.
Zustand haelt den Zustand und bildet das Observer Pattern.
TypeScript/Zod beschreiben die Regeln.
SoftEngine wird ueber Kataloge, Vertrage und Export-Adapter angebunden.
```

## 2. Nicht verhandelbare Regeln

1. WYSIWYG ist Pflicht. Die Canvas ist das Live-Dokument, keine separate Vorschau.
2. Was in der Canvas als Inhalt sichtbar ist, muss dieselbe technische Baustein-Komponente sein, die spaeter exportiert wird.
3. Keine doppelte Canvas-/Export-Implementierung pro Block.
4. Editor-Chrome und Baustein sind getrennt. Auswahlrahmen, Drag, Resize, Badges und Inspector gehoeren dem Editor, nicht dem Export-Baustein.
5. Ein Block speichert nur serialisierbare Daten: id, type, layout, props, events, bindings.
6. Web Components sind die echten visuellen Blocks. React rendert sie ueber einen generischen Host.
7. Mantine ist die einheitliche React-UI fuer Editor-Werkzeuge. Keine zweite UI-Library ohne bewusste Architektur-Aenderung.
8. Keine Fake-Mocks fuer ERP-Daten. Im Design-Modus werden echte Katalog-Metadaten und Feld-Platzhalter verwendet.
9. SoftEngine-Logik kommt spaeter ueber klare Adapter rein. Direkte SoftEngine-Globals leben nur in `softengine/runtime` oder `softengine/export`.
10. Komponenten reden nicht direkt wild miteinander. Sie melden Events nach oben, Stores/Kanaele benachrichtigen Beobachter.
11. Kleine Dateien, klare Namen, wenig Magie. Das Projekt soll zum Lernen geeignet bleiben.
12. Jeder neue Code bekommt kurze Wegweiser-Kommentare dort, wo Zweck oder Architektur sonst schwer erkennbar waeren.
13. Beendete Arbeit wird kontrolliert, dokumentiert und im passenden Statusbereich markiert.

## 3. Technologie-Entscheidungen

| Ebene | Entscheidung | Rolle |
| --- | --- | --- |
| Editor Shell | React + Vite | App, Layout, Canvas, Inspector, Workflow |
| Editor UI | Mantine | Einheitlicher professioneller Look fuer Panels, Forms, Modals, Tabs, Tabellen |
| Echte Blocks | Lit/Web Components | WYSIWYG-Bausteine fuer Editor und Export |
| State | Zustand | Zentraler Zustand mit selektiven Subscriptions, Observer Pattern |
| Regeln | TypeScript + Zod | Schemas, Validierung, verstaendliche Datenmodelle |
| Drag/Resize | dnd-kit plus eigene Canvas-Logik | Interaktion im Editor |
| Icons | Tabler/Mantine oder lucide, aber einheitlich | Werkzeug-Icons |

Hinweis: HeroUI/Tailwind duerfen im aktiven neuen Aufbau nicht verwendet werden. Zielarchitektur ist Mantine als einziges Editor-UI-System.

## 4. Gesamtbild

```txt
ProjectState
  blocks[]
  catalog
  selection
  history
  ui

        geht als Props in
             |
             v
Editor Shell (React/Mantine)
  Canvas
    BlockHost
      <ff-button>
      <ff-text>
      <ff-formfield>
  Inspector
  Sidebar
  Data/Catalog Panels

        exportiert mit
             |
             v
SoftEngine Export
  HTML
  Web Component Bundles
  SoftEngine Variablen/Katalogdaten
  Runtime Adapter
```

React ist nicht die fachliche Wahrheit eines Blocks. React ist die Werkstatt. Die fachliche Wahrheit liegt in Block-Schema, Block-Definition und Web Component.

## 5. Ordnerstruktur

Zielstruktur, abgeleitet aus OOP-Klassen-Modell (§6):

```txt
src/
  app/
    App.tsx
    providers.tsx

  ui/
    theme.ts

  store/
    editorStore.ts        Zustand-Store: blocks, selection, addBlock, updateBlock ...
    selectors.ts          Selektor-Helfer

  core/
    blocks/
      BlockComponent.ts          Interface: Vertrag jeder Block-Klasse
      PropertyDescription.ts     Interface: Inspector-Eigenschaft
      BasicBlock.ts              Basisklasse: extends LitElement, implements BlockComponent
      blockRegistry.ts           Map type-name -> Klasse
      blockFactory.ts            createBlock(typeName) -> Instanz

  editor/
    shell/
      EditorShell.tsx
      Header.tsx
      StatusBar.tsx
    canvas/
      Canvas.tsx
      BlockHost.tsx              rendert eine Block-Instanz ueber ihr Custom-Element
      SelectionOverlay.tsx
      ResizeHandles.tsx
    sidebar/
      Sidebar.tsx
      BlockPalette.tsx
    inspector/
      Inspector.tsx              liest customProperties() der selektierten Block-Instanz
      controls/                  Mantine-Inputs nach Datentyp
        TextControl.tsx
        NumberControl.tsx
        SelectControl.tsx
        SwitchControl.tsx
        ColorControl.tsx

  blocks/
    button/
      ButtonBlock.ts             class ButtonBlock extends BasicBlock
    text/
      TextBlock.ts               class TextBlock extends BasicBlock
    formfield/
      FormFieldBlock.ts          class FormFieldBlock extends BasicBlock

  softengine/
    catalog/
      Catalog.ts                 SoftEngine-Katalog-Klasse
      importers/
        idbXmlImporter.ts
        relationImporter.ts
    export/
      buildHtml.ts               Project -> HTML-String
    runtime/
      softengineBridge.ts        Adapter zu basisHTML_SND_MSG, GET_RELATION etc.
      dataAdapter.ts
```

Eine Datei pro Block-Klasse. Keine getrennten `*.schema.ts` / `*.inspector.ts` / `*.export.ts` Dateien — alle Concerns leben in der Klasse (Properties, `customProperties()`, `render()`, statische `exportHtml()`).

Diese Struktur ist ein Ziel. Wir bauen sie Schritt fuer Schritt, nicht in einem Rutsch. Ordner wie `softengine/runtime` entstehen erst wenn der Editor SoftEngine-Daten wirklich anbindet.

## 6. Block-System

Jeder Block ist eine TypeScript-Klasse mit Vererbungs-Hierarchie. Modell aus Notizen Woche 2.

Klassen-Hierarchie:

```txt
Interface BlockComponent             Vertrag: was jeder Block koennen muss
  ^
  | implements
BasicBlock extends LitElement        Basisklasse: gemeinsame Properties + Render-Geruest
  ^
  | extends
ButtonBlock, TextBlock, KanbanBlock  konkrete Block-Klassen
```

Interface `BlockComponent` definiert den Vertrag jeder Block-Klasse:

```ts
interface BlockComponent {
  get id(): string
  get type(): string
  get width(): number
  get height(): number
  customProperties(): PropertyDescription[]
}
```

Interface `PropertyDescription` (1:1 aus Notizen Woche 2) beschreibt jede editierbare Eigenschaft:

```ts
interface PropertyDescription {
  attributeName: string
  name: string
  description: string
  isArray: boolean
  maxLength: number
}
```

Basisklasse `BasicBlock` erbt von `LitElement` und implementiert `BlockComponent`. Sie haelt gemeinsame Properties (`_id`, `_width`, `_height`, Position) als `private` Felder mit `public` Getter/Setter. Konkrete Blocks erweitern `BasicBlock`.

Sichtbarkeits-Regeln (Notizen Woche 2):

```txt
private    interne Felder (_width, _label, ...)
protected  Felder, die abgeleitete Klassen lesen/setzen duerfen
public     Getter/Setter als Schnittstelle nach aussen
```

Methodenueberschreibung erlaubt Polymorphie: jeder Block-Subtyp kann `customProperties()` neu definieren und seine spezifischen Eigenschaften melden.

Eine Datei pro Block:

```txt
blocks/button/ButtonBlock.ts    class ButtonBlock extends BasicBlock
blocks/text/TextBlock.ts        class TextBlock extends BasicBlock
```

Inspector liest `customProperties()` der selektierten Block-Instanz und baut daraus dynamisch die Editier-Controls (Mantine-Inputs).

Canvas nutzt einen generischen `BlockHost`, der jede Block-Instanz ueber ihr `<custom-element>`-Tag rendert.

Keine separaten `*.schema.ts` / `*.definition.ts` / `*.inspector.ts` / `*.export.ts` Dateien. Alle Verantwortlichkeiten leben in der Block-Klasse selbst (Properties = Schema, `customProperties()` = Inspector-Config, `render()` = Canvas, statische `exportHtml()` Methode = Export).

## 7. WYSIWYG-Regel

WYSIWYG bedeutet hier:

```txt
Canvas zeigt <ff-button>.
Export nutzt <ff-button>.
Es gibt keine separate Vorschau-Implementierung und keinen anderen ExportButton.
```

Der Editor darf zusaetzlich anzeigen:

- Auswahlrahmen
- Resize Handles
- Drag-Flache
- Feld-/Alias-Badges
- Fehlermeldungen
- Debug-Hinweise

Diese Dinge duerfen nie Teil der exportierten Komponente sein.

## 8. State und Observer Pattern

Wir verwenden Zustand als Observer Pattern:

```txt
Store aendert sich
  Canvas beobachtet relevante Blockdaten
  Inspector beobachtet selectedBlockId und selectedBlock
  StatusBar beobachtet selection/zoom
  BlockHost beobachtet nur seinen Block
```

Wichtig: Eine zentrale Wahrheit, aber keine riesige Alles-Datei.

Der Store darf intern in Slices organisiert sein:

```txt
blocksSlice      Blocks anlegen, aktualisieren, loeschen
selectionSlice   Auswahl, Multi-Select
historySlice     Undo/Redo
uiSlice          Zoom, Panels, Modus
catalogSlice     geladener SoftEngine-Katalog
```

Komponenten abonnieren nur das, was sie brauchen.

Richtig:

```ts
const block = useEditorStore((s) => s.blocks[id])
const updateBlock = useEditorStore((s) => s.updateBlock)
```

Falsch:

```ts
const entireStore = useEditorStore()
```

## 9. Datenfluss

Ein Block bekommt Daten von oben und meldet Ereignisse nach oben.

```txt
ProjectState.blocks[id].props
  -> BlockHost
  -> <ff-button label="Speichern">

User klickt <ff-button>
  -> CustomEvent "ff-action"
  -> BlockHost
  -> Editor Action/Event System
  -> Store oder SoftEngine-Vertrag
```

Die Web Component weiss nicht, welches Panel sie aktualisieren soll. Sie feuert nur ein Ereignis. Das haelt die Kopplung locker.

## 10. SoftEngine-Strategie

SoftEngine wird frueh als Vertrag modelliert, aber nicht ueberall hart eingebaut.

Keine statische Fantasie-Datei `catalog.ts` als Wahrheit. Stattdessen:

```txt
SoftEngine-Dateien
  -> Importer/Parser
  -> SoftEngineCatalog
  -> Editor-Auswahl und Feld-Platzhalter
  -> Export/Runtime
```

Der Katalog ist ein echtes Metadatenmodell, keine Mock-Datenbank.

Katalog-Eintraege koennen mehr sein als IDB:

```txt
idb
memtab
beleg
adressstamm
relation
workflow
tool
variable
lookup
template
```

Ein Feld im Editor zeigt dann z.B.:

```txt
{Kunde.Vorname}
{Beleg.Datum}
{Artikel.Bezeichnung}
```

Das sind Design-Platzhalter aus echten Metadaten, keine Fake-Datensaetze.

Direkte SoftEngine-APIs wie `basisHTML_SND_MSG`, `sendBWLinkIntern`, `InitialisiereDatenBasis`, `GET_RELATION`, `PUT_RELATION` duerfen nur in SoftEngine-Adaptern vorkommen.

## 11. Export-Strategie

Export bekommt:

```txt
ProjectState
BlockRegistry
SoftEngineCatalog
ExportOptions
```

und erzeugt:

```txt
index.basis.source.html
index.basis.SEvariablen.json
benoetigte Web-Component-Bundles
Runtime/Adapter-Code
```

Export rendert dieselben Web Components oder ihre registrierten Tags. Es darf keine zweite visuelle Implementierung pro Block entstehen.

## 12. Alte Prototypen als Lesematerial

Das alte Projekt wird nicht kopiert, sondern nur bei Bedarf gelesen.

Es ist ein Prototyp, kein Architektur-Vorbild. Neue Bloecke, neue UI, Datenmodelle und SoftEngine-Vertraege duerfen und sollen neu gedacht werden.

Moegliche Lesestellen, falls fachliche Details gesucht werden:

```txt
Editor/react-app/src/editor/blockLibrary.ts
Editor/react-app/src/store/actionsStore.ts
Editor/react-app/src/store/dataStore.ts
Editor/react-app/src/utils/exportEngineHtmlAssembly.ts
Editor/react-app/src/utils/exportEngineCore.ts
Editor/react-app/src/runtime/actions.ts
Editor/react-app/src/components/data/parseIdbXml.ts
```

Diese Dateien koennen Hinweise geben, was fachlich gebraucht wurde. Sie bestimmen nicht die neue Architektur.

## 13. Erste Etappe: echter Vertical Slice

Wir starten nicht mit allen Blocks. Wir bauen einen einzigen Block komplett sauber: Button.

Ziel von Etappe 1:

```txt
Ich kann einen Button aus der Sidebar auf den Canvas setzen.
Der Button ist eine echte Web Component <ff-button>.
Der Inspector kann Label und Variante aendern.
Der Button feuert bei Klick ein Event nach oben.
Ein HTML-Export Etappe 1 kann dieselbe <ff-button>-Komponente ausgeben.
Der Code ist klein genug, um ihn zu erklaeren.
Jede Datei hat kurze Wegweiser-Kommentare fuer Zweck und Architektur.
Am Ende ist dokumentiert, was fertig ist, was geprueft wurde und was offen bleibt.
```

Konkrete Schritte:

1. Mantine installieren und als einziges Editor-UI-System einrichten.
2. Architektur-Ordner minimal anlegen (`core/blocks/`, `store/`, `editor/...`).
3. Interfaces `BlockComponent` und `PropertyDescription` schreiben (`core/blocks/`).
4. Basisklasse `BasicBlock extends LitElement implements BlockComponent` schreiben.
5. `ButtonBlock extends BasicBlock` schreiben als erste Block-Klasse mit `@customElement('ff-button')`.
6. Generischen `BlockHost.tsx` bauen, der jede Block-Instanz ueber ihr Custom-Element-Tag rendert.
7. Zustand-Store (`editorStore.ts`) auf Block-Instanzen ausrichten.
8. Sidebar und Inspector ueber Registry und `customProperties()` der Block-Klasse verdrahten.
9. HTML-Export Etappe 1 fuer Button bauen (statische `exportHtml()` Methode in der Klasse).
10. Danach erst Text oder FormField nach demselben Muster.

## 13.1 Etappen-Status

Jede Etappe bekommt einen sichtbaren Status:

```txt
Geplant      Architekturziel ist beschrieben, aber noch nicht gebaut.
In Arbeit    Dateien werden aktiv gebaut oder umgebaut.
Zur Pruefung Code ist fertig geschrieben, aber noch nicht kontrolliert.
Fertig       Code wurde kontrolliert, dokumentiert und passt zur Architektur.
Blockiert    Es fehlt eine Entscheidung, Information oder technische Freigabe.
```

Eine Etappe darf erst auf `Fertig`, wenn Build/Typecheck/Lint oder eine bewusst dokumentierte Ersatzpruefung gelaufen ist.

## 14. Definition of Done fuer jeden neuen Block

Ein Block ist erst fertig, wenn alle Punkte erfuellt sind:

- Block-Klasse vorhanden (`extends BasicBlock`, `@customElement('ff-...')`)
- Default-Werte fuer alle Properties im Konstruktor gesetzt
- Registry-Eintrag vorhanden (Map type-name -> Klasse)
- `render()` Methode liefert sichtbares Markup
- `customProperties()` liefert `PropertyDescription[]` fuer Inspector
- Editor rendert ueber generischen `BlockHost`
- Event-Vertrag dokumentiert (welche `CustomEvent`s die Klasse feuert)
- Statische `exportHtml()` Methode vorhanden
- Keine doppelte Canvas-/Export-Logik
- Kurze Wegweiser-Kommentare am Dateianfang
- Pruefung dokumentiert (Typecheck, Lint, Build)
- Status auf `Fertig` oder begruendet auf `Blockiert`

## 15. Aktuelle Entscheidung

Wir bauen neu in `Aufbau/react-app`.

Wir benutzen alte Prototypen nur als Lesematerial, nicht als Bauplan.

`ff-button` und `ff-text` existieren als KI-generierte Vibe-Prototypen im aktuellen `src/`. Sie sind nicht stabil und werden im naechsten Schritt nach Notiz-Architektur (OOP-Klassen, Vererbung, Interfaces) neu aufgebaut.

Der naechste Block wird anhand des Lernwerts und der SoftEngine-Relevanz entschieden.

## 16. Kommentar-Regel

Kommentare sind Pflicht als kurze Wegweiser, aber kein Zeilen-Blabla.

Richtig:

```ts
// Ein Block speichert nur Daten; die sichtbare Umsetzung kommt aus der Registry.
```

Falsch:

```ts
// Setzt label auf label.
```

Jede neue Datei bekommt oben einen kurzen Zweck-Kommentar. Komplexe Stellen bekommen einen kurzen Warum-Kommentar.

## 17. Aktueller Status

```txt
Vibe-Prototyp (wird neu gemacht)
  Aktueller src/ Inhalt ist KI-generiert ohne Validierung:
  - Mantine-Shell, Architekturordner, Button-Schema/Definition/Inspector/Export.
  - <ff-button> und <ff-text> als Lit Web Components.
  - Canvas + BlockHost + Inspector + Sidebar/Palette.
  - HTML-Export Etappe 1.
  - localStorage-Persistenz fuer Blocks.
  Status: lauffaehig aber instabil, nicht nach Notiz-Architektur gebaut.
  Naechster Schritt: Neuaufbau mit OOP-Klassen-Modell aus Notizen Woche 2.

Zur Pruefung
  SoftEngine-Goldreferenz-Paket unter `goldreferenz-softengine/`:
  - `index.basis.source.html` als lauffaehiger SoftEngine-Pruefstand.
  - `index.basis.SEvariablen.json` aus funktionierendem Export uebernommen.
  - `GOLDREFERENZ_SOFTENGINE.md` als Beipackzettel und Pruefliste.
  - Stabil eingebaut: SEFILELOOP, IDB lesen, Beleg lesen, Join/Selection, GET_RELATION 640, PUT_RELATION 174, START_TOOL.
  - Labor/offen nur markiert: MASKENEVENT, normales VAR, PUTADD_RELATION, Refresh/Lifecycle.
  - Wichtig: `IDBID0005` bleibt in SEvariablen, Relation-Parameter nutzen `ID0005`.
  - Nach erstem SoftEngine-Test Datenloader korrigiert:
    SEvariablen-XHR/fetch-Intercept, bewiesene `__FF_*` Bootstrap-Namen,
    InitialisiereDatenBasis-Start, Message-Uebernahme fuer `SEDATA.Daten`,
    direkte Array-Container.
  - Nach Konsolenfehlern korrigiert:
    `Erstellen`, `initData`, `ReloadData` frueh definiert und unnoetige
    `SeHtmlFrameworkV2_Files`-Injection entfernt.
  - Fehlersuche erweitert:
    Interceptor auf alte Getter/asynchron-Callback-Struktur angepasst,
    fruehes `Erstellen()` ruft wieder Reset/Initialisierung,
    Log meldet SEvariablen-Intercept und SEDATA-Struktur,
    Feldanzeigen teilweise auf sprechende Namen umgestellt.
  - Bootstrap-Analyse begonnen:
    `BOOTSTRAP_ANALYSE.md` angelegt und fehlenden SE-Kommunikationsstart
    aus funktionierendem Export identifiziert.
  - SE-Kommunikationsstart ergaenzt:
    `selib.Json.InitializeERPConnection()` mit Fallback
    `InitialisiereSchnittstelle()`.

Geplant
  Goldreferenz zuerst in SoftEngine testen, bevor neue Editor-Features gebaut werden.
  Drag & Drop fuer Canvas-Platzierung.
  Naechster Block nach Lernwert und SoftEngine-Relevanz: FormField oder Container.

Blockiert
  Keine bekannten Architektur-Blocker.

Pruefung
  Goldreferenz-JSON mit Node geparst.
  Goldreferenz-HTML auf SoftEngine-Start-/Endmarker kontrolliert.
  Goldreferenz-Script aus HTML mit `node --check` syntaktisch kontrolliert.
  Goldreferenz-Script nach Datenloader-Fix erneut mit `node --check` kontrolliert.
  Goldreferenz-HTML auf aktive stabile Nachrichten kontrolliert: GET_RELATION, PUT_RELATION, START_TOOL.
  Goldreferenz-HTML auf Laborfunktionen kontrolliert: nur Hinweistext, keine aktiven Calls.
  ARCHITEKTUR.md auf alte Vorschau-Begriffe und Nicht-ASCII-Zeichen kontrolliert.
  Etappe 1 mit `npm.cmd run build` und `npm.cmd run lint` kontrolliert.
  Aktive neue Struktur auf HeroUI/Tailwind/Framer-Importe kontrolliert.
  Alte Prototyp-Dateien aus `src/App.tsx` und `src/editor/*.tsx` entfernt.
  `npm.cmd prune` ausgefuehrt; alte UI-Pakete sind nicht mehr installiert.
  Dev-Server frisch auf `http://localhost:5173/` gestartet und HTTP 200 geprueft.
  HTML-Export-Benennung auf "HTML-Export Etappe 1" geschaerft.
  Etappe 2 mit `npm.cmd run build` und `npm.cmd run lint` kontrolliert.
```
