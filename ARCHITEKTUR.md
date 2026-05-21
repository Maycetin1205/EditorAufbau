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
Tailwind + shadcn/ui auf Radix-Basis liefert die einheitliche Editor-UI.
Lit/Web Components sind die echten WYSIWYG-Bausteine.
Eine hand-gebaute Subject-Klasse plus Editor-Singleton bildet das Observer Pattern; React haengt sich via useSyncExternalStore an.
TypeScript beschreibt die Regeln. Zod nur dort, wo externe Daten in den Editor kommen.
SoftEngine wird ueber Kataloge, Vertraege und Export-Adapter angebunden.
```

UI-Migrations-Hinweis: Die alte verbindliche Strategie war Mantine. Mantine wird schrittweise entfernt, nicht in einem Big Bang. Zielarchitektur ist Tailwind + shadcn/ui + Radix. Der Block-Kern (BlockData, BlockDefinition, blockRegistry, Subject/Editor, BlockHost, Lit-Blocks) bleibt davon unberuehrt.

## 2. Nicht verhandelbare Regeln

1. WYSIWYG ist Pflicht. Die Canvas ist das Live-Dokument, keine separate Vorschau.
2. Was in der Canvas als Inhalt sichtbar ist, muss dieselbe technische Baustein-Komponente sein, die spaeter exportiert wird.
3. Keine doppelte Canvas-/Export-Implementierung pro Block.
4. Editor-Chrome und Baustein sind getrennt. Auswahlrahmen, Drag, Resize, Badges und Inspector gehoeren dem Editor, nicht dem Export-Baustein.
5. Ein Block speichert nur serialisierbare Daten: id, type, layout, props, events, bindings.
6. Web Components sind die echten visuellen Blocks. React rendert sie ueber einen generischen Host.
7. Tailwind + shadcn/ui auf Radix-Basis ist die einheitliche React-UI fuer Editor-Werkzeuge. Keine zweite UI-Library ohne bewusste Architektur-Aenderung. Mantine ist Altlast und wird Schritt fuer Schritt entfernt.
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
| Editor UI Styling | Tailwind CSS | Utility-Klassen als Styling-Basis, nur innerhalb der UI-Schicht (siehe §18). |
| Editor UI Komponenten | shadcn/ui (kopiert ins Repo) | Vor-konfigurierte Komponenten unter `src/ui/`, gezielt uebernommen, nicht blind installiert. |
| Editor UI Primitives | Radix UI | Zugaengliche Headless-Primitives (Dialog, Select, Tabs, Tooltip, Popover, ...). Werden nur ueber shadcn-Wrapper benutzt. |
| Editor UI Alt (in Migration) | Mantine | Nur noch in noch nicht migrierten Bereichen (CatalogPanel, EditorShell-Layout). Wird Etappenweise abgebaut. |
| Echte Blocks | Lit/Web Components | WYSIWYG-Bausteine fuer Editor und Export. Beruehrt keine UI-Library. |
| State | Subject-Klasse + Editor-Singleton (hand-gebaut) | Observer Pattern, React-Bruecke via useSyncExternalStore, keine externe State-Library |
| Regeln | TypeScript | Statische Typen + Interfaces; Zod nur an Aussengrenzen (XML-/JSON-Import) |
| Drag/Resize | dnd-kit plus eigene Canvas-Logik | Interaktion im Editor |
| Icons | lucide-react (Editor-Chrome) | Tabler-Icons bleiben in noch nicht migrierten Mantine-Panels uebergangsweise erlaubt. |

Hinweis (alte Regel aufgehoben): Die frueher verbindliche Mantine-Only-Regel ist ungueltig. Verbindlich ist jetzt Tailwind + shadcn/ui auf Radix-Basis. Mantine darf nur noch in Bereichen stehen, die noch nicht migriert sind, und wird Etappenweise entfernt. HeroUI/Framer/andere UI-Libraries bleiben verboten.

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
Editor Shell (React + Tailwind/shadcn/ui auf Radix)
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
    providers.tsx                Context-Provider (uebergangsweise noch MantineProvider, wird Schritt fuer Schritt rausgenommen).

  ui/                            Eigene UI-Schicht des Editor-Chrome.
    button.tsx                   shadcn-Style Button (cva-Varianten + Tailwind).
    panel.tsx                    Card/Paper-Ersatz: Rahmen + Padding + Titel-Slot.
    text-input.tsx               Label + Eingabefeld + optionaler Beschreibungs-/Fehlertext.
    number-input.tsx             Numerisches Input-Feld, gibt nur number-Werte nach oben.
    icon-button.tsx              Quadratischer Icon-only Button.
    (weitere shadcn-Komponenten werden bei Bedarf gezielt hier abgelegt.)

  lib/
    utils.ts                     cn() Helper (clsx + tailwind-merge) fuer Tailwind-Klassen-Komposition.

  state/
    Subject.ts                   generische Observer-Klasse
    Editor.ts                    class Editor extends Subject<Editor>, haelt BlockData[]
    useEditor.ts                 React-Hook via useSyncExternalStore

  core/
    blocks/
      BlockData.ts               interface BlockData = { id, type, layout, props }
      PropertyDescription.ts     interface fuer Inspector-Felder (Notiz Woche 2)
      BlockDefinition.ts         interface { type, tagName, defaultProps, customProperties }
      blockRegistry.ts           Map type-name -> BlockDefinition
      blockFactory.ts            createBlockData(type) -> BlockData
      BasicBlock.ts              optional: duenne Basisklasse fuer View-Helfer (extends LitElement)

  blocks/
    register.ts                  zentrale Side-Effect-Imports aller Built-in-Blocks
    button/
      ButtonBlock.ts             class ButtonBlock extends LitElement (View), HMR-Schutz, Self-Registry
    text/
      TextBlock.ts               class TextBlock extends LitElement
    formfield/
      FormFieldBlock.ts          class FormFieldBlock extends LitElement

  editor/
    shell/
      EditorShell.tsx
      Header.tsx
      StatusBar.tsx
    canvas/
      Canvas.tsx
      BlockHost.tsx              nimmt BlockData, erzeugt+syncronisiert das passende Custom-Element
      SelectionOverlay.tsx
      ResizeHandles.tsx
    sidebar/
      Sidebar.tsx
      BlockPalette.tsx
    inspector/
      Inspector.tsx              liest BlockDefinition.customProperties aus Registry
      controls/                  Inputs nach Datentyp; benutzen ausschliesslich src/ui/...
        TextControl.tsx
        NumberControl.tsx
        SelectControl.tsx
        SwitchControl.tsx
        ColorControl.tsx

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

Eine Datei pro Block-View-Klasse. Editor-State haelt nur serialisierbare `BlockData`-Objekte. Lit-View-Klassen halten reine Render-Properties. Bruecke = `BlockHost`. Zentrale `blocks/register.ts` triggert Self-Registrierung aller Built-in-Blocks.

Diese Struktur ist ein Ziel. Wir bauen sie Schritt fuer Schritt, nicht in einem Rutsch. Ordner wie `softengine/runtime` entstehen erst wenn der Editor SoftEngine-Daten wirklich anbindet.

## 6. Block-System

Strikte Trennung zwischen serialisierbarem **State** (im Editor-Store) und **View-Klasse** (Lit Web Component).

### 6.1 State: BlockData

Der Editor speichert ausschliesslich plain Objekte. Keine LitElement-Instanzen, keine DOM-Knoten im fachlichen State (Regel 5).

```ts
interface BlockData {
  id: string
  type: string                              // 'button', 'text', 'kanban', ...
  layout: { x: number; y: number; width: number; height: number }
  props: Record<string, unknown>            // blockspezifische Werte: label, content, fontSize, ...
}
```

Vorteile: localStorage-Persistenz trivial, Undo/Redo via Deep-Clone, Import/Export ohne DOM-Tricks, Tests ohne DOM-Mock.

### 6.2 View: Lit Web Component

Pro Block-Typ eine Klasse, erbt von `LitElement`. Klasse haelt **nur Render-Properties** (Lit-Reactive-Properties), keine ID/keinen Type, kein Layout — das lebt im Store als BlockData.

```ts
class ButtonBlock extends LitElement {
  // Lit-Reactive-Properties (manuell, weil erasableSyntaxOnly: true keine Decorators erlaubt)
  private _label: string = 'Klick mich'
  get label(): string { return this._label }
  set label(v: string) { const o = this._label; this._label = v; this.requestUpdate('label', o) }

  // ... weitere View-Props analog

  render() { return html`<button>${this._label}</button>` }
}
```

### 6.3 Vertrag pro Block-Typ: BlockDefinition

Statt einer Mehrstufen-Klassen-Hierarchie wird jeder Block ueber ein Daten-Objekt registriert:

```ts
interface BlockDefinition {
  type: string                              // 'button'
  tagName: string                           // 'ff-button'
  defaultProps: Record<string, unknown>     // initiale props beim Anlegen
  customProperties: PropertyDescription[]   // Inspector-Felder
}
```

`PropertyDescription` aus Notiz Woche 2 bleibt unveraendert:

```ts
interface PropertyDescription {
  attributeName: string
  name: string
  description: string
  isArray: boolean
  maxLength: number
}
```

### 6.4 Vererbung optional

`BasicBlock extends LitElement` darf bleiben als duenne Basisklasse fuer geteilte View-Helfer (z.B. gemeinsames Styling), ist aber kein Zwang. Notiz-Woche-2-OOP-Konzepte (Vererbung, Polymorphie, Sichtbarkeit) gelten **innerhalb der View-Klassen**, nicht fuer den Editor-State.

### 6.5 BlockHost: Bruecke State <-> View

Generische React-Komponente. Bekommt `BlockData`, schaut den `tagName` aus der Registry, erzeugt `document.createElement(tagName)`, setzt die `props` auf das Element und mountet es in die DOM. Bei jeder BlockData-Aenderung syncronisiert es die props nach (Lit re-rendert intern).

### 6.6 HMR-Schutz

Vite-HMR re-evaluiert Module beim Speichern. `customElements.define(tag, Class)` darf nur einmal pro Tag laufen. Daher in jeder Block-Datei:

```ts
if (!customElements.get('ff-button')) {
  customElements.define('ff-button', ButtonBlock)
}
```

### 6.7 Zentrale Registrierung

Statt verstreuter Side-Effect-Imports an verschiedenen Stellen gibt es eine Datei `src/blocks/register.ts`, die alle Built-in-Blocks importiert. Wer Blocks benutzen will, importiert diese eine Datei.

```ts
// src/blocks/register.ts
import './button/ButtonBlock'
import './text/TextBlock'
// neue Blocks hier einreihen
```

### 6.8 Dateistruktur pro Block

```txt
blocks/button/ButtonBlock.ts
  - class ButtonBlock extends LitElement  (View)
  - customElements.define (HMR-geschuetzt)
  - registerBlockType(BlockDefinition)    (Self-Registrierung in Registry)
```

Inspector liest `BlockDefinition.customProperties` (aus Registry), nicht von der Instanz. Canvas rendert via `BlockHost(blockData)`.

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

State lebt im Editor-Singleton und wird ueber eine **hand-gebaute Subject-Klasse** beobachtbar (Notiz Woche 1, OOP-konsistent zum restlichen Code).

### 8.1 Subject (generisch)

```ts
class Subject<T = void> {
  private listeners: Array<(data: T) => void> = []
  subscribe(fn): () => void   // gibt Unsubscribe-Funktion zurueck
  notify(data: T): void       // ruft alle Listener auf
}
```

### 8.2 Editor (Singleton, extends Subject)

```ts
class Editor extends Subject<Editor> {
  blocks: BlockData[]
  selectedId: string | null
  version: number             // primitiv, fuer useSyncExternalStore-Snapshot

  addBlock(type)              // erzeugt BlockData mit defaultProps aus Registry
  removeBlock(id)
  selectBlock(id | null)
  updateProperty(id, attr, value)   // mutiert blockData.props[attr]
}

export const editor = new Editor()
```

Bei jeder Aenderung ruft Editor `notify(this)` -> alle Listener reagieren. Version inkrementiert -> useSyncExternalStore erkennt Aenderung.

### 8.3 React-Bruecke

`useEditor()` Hook nutzt `useSyncExternalStore` (offizielle React-18-API fuer externe Stores):

```ts
function useEditor() {
  useSyncExternalStore(
    (cb) => editor.subscribe(() => cb()),
    () => editor.version,
  )
  return editor
}
```

Concurrent-Mode-sicher, kein useState-Trick.

### 8.4 Keine externe State-Library

Bewusst gegen Zustand, Redux, Jotai, Recoil. Begruendung:
- Notiz-Konzept (Observer-Pattern) direkt umsetzbar
- OOP-Stil konsistent zum Block-System
- Lernwert hoeher
- Keine zusaetzliche Dependency

### 8.5 Spaetere Erweiterungen als eigene Subjects

Falls Performance bei vielen Blocks Re-Render-Probleme macht: feinere Subjects als Komposition (z.B. `selection`, `catalog`, `history` jeweils eigenes Subject). Nicht jetzt, nur wenn echtes Problem auftritt.

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
Der Inspector kann Label und weitere Block-Eigenschaften aendern.
Der Button feuert bei Klick ein Event nach oben.
Ein HTML-Export Etappe 1 kann dieselbe <ff-button>-Komponente ausgeben.
Der Code ist klein genug, um ihn zu erklaeren.
Jede Datei hat kurze Wegweiser-Kommentare fuer Zweck und Architektur.
Am Ende ist dokumentiert, was fertig ist, was geprueft wurde und was offen bleibt.
```

Konkrete Schritte:

1. Tailwind + shadcn/ui auf Radix-Basis installieren und als einziges Ziel-Editor-UI-System einrichten. Mantine bleibt vorlaeufig in unmigrierten Bereichen, wird aber Schritt fuer Schritt entfernt.
2. Architektur-Ordner minimal anlegen (`core/blocks/`, `store/`, `editor/...`, `ui/`, `lib/`).
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

## 18. UI-Schicht (Editor-Chrome)

Die Idee "Atomic Design" bleibt im Geist erhalten: Editor-Code importiert nicht direkt aus UI-Libraries und nicht wild Tailwind-Klassen durchs ganze Projekt. Stattdessen gibt es eine einzige, gewrappte UI-Schicht.

### 18.1 Regeln

- Editor-Chrome (`src/editor/...`) importiert **nie direkt** aus `@radix-ui/*` und **nie direkt** Tailwind-Utility-Klassen-Wildwuchs. Es importiert aus `src/ui/...`.
- shadcn/ui-Komponenten werden ins Repo kopiert (nicht als npm-Dependency), bei Bedarf angepasst und unter `src/ui/` abgelegt.
- shadcn/ui wird **nicht blind komplett** installiert. Pro Etappe wird gezielt nur das uebernommen, was gerade gebraucht wird.
- Tailwind-Klassen sind erlaubt in `src/ui/...` und in der zentralen `src/index.css`. In `src/editor/...` sind Tailwind-Klassen nur fuer Layout (Flex/Gap/Width/Padding) erlaubt; visuelle Variation (Farben, Borders, Radien) gehoert in eine UI-Komponente.
- Mantine-Imports sind **nur in noch nicht migrierten Bereichen** zulaessig und werden Etappenweise abgebaut. Neuer Code nutzt ausschliesslich `src/ui/...`.
- Block-Inhalt (Lit Web Component) folgt nicht diesem Schema. Er ist ein eigener Baustein nach §6 und kennt weder Tailwind noch shadcn.

### 18.2 Ordnerstruktur

```txt
src/
  ui/                      Eigene UI-Schicht. shadcn-Style. Tailwind erlaubt.
    button.tsx
    panel.tsx
    text-input.tsx
    number-input.tsx
    icon-button.tsx
    (... weitere bei Bedarf, z.B. select.tsx, dialog.tsx, tabs.tsx, tooltip.tsx)

  lib/
    utils.ts               cn() Helper (clsx + tailwind-merge).

  index.css                Tailwind-Direktiven + CSS-Variablen fuer shadcn-Theme.
```

Editor-Code (`editor/...`) importiert ausschliesslich aus `ui/` (oder uebergangsweise aus `@mantine/core`, solange ein Bereich noch nicht migriert ist).

### 18.3 Lit vs. React-Entscheidung

- **Editor-Chrome** ist immer React + Tailwind/shadcn/ui auf Radix. Hier ist die UI-Library unbestritten.
- **Block-Inhalt** ist Lit Web Component (§6). Nicht weil React in SoftEngine nicht laeuft (laeuft erprobt), sondern weil:
  - SoftEngine setzt DOM-Eigenschaften direkt; Lit-Setter fangen das sauber ab, React-State muesste per Bridge synchronisiert werden.
  - LitElement passt 1:1 zur OOP-Modellierung aus Notiz Woche 2 (Klasse, Property via getter/setter, Vererbung von Basisklasse).
  - Export-Groesse bleibt klein.
  - Tailwind/shadcn ist Editor-Chrome-Sache und hat im exportierten Block-Bundle nichts verloren.

Diese Entscheidung gilt als gepruefte Architekturwahl, nicht als technische Limitierung.

### 18.4 Migrationsplan Mantine -> Tailwind+shadcn

Phasenweise:

```txt
Phase 0  ARCHITEKTUR.md auf Tailwind+shadcn umgestellt.                 [erledigt mit dieser Aenderung]
Phase 1  Tailwind + shadcn-Basis im Projekt einrichten.
         src/ui/{button,panel,text-input,number-input,icon-button} anlegen.
         Sidebar/BlockPalette und Inspector/TextControl/NumberControl auf src/ui umstellen.
Phase 2  CatalogPanel (Datenquellen + Relations) auf src/ui umstellen.
         shadcn dialog/tabs nach Bedarf gezielt einfuegen.
Phase 3  EditorShell auf Tailwind-Grid (oder shadcn-Layout) umstellen, MantineProvider entfernen.
         useKeyboardShortcuts vom Mantine-Hook lossagen.
Phase 4  Mantine-Pakete aus package.json entfernen, npm prune.
```

Eine Phase ist erst `Fertig`, wenn `npm run build` und `npm run lint` sauber durchlaufen.

## 19. Block-Liste

Die folgende Liste ist verbindlich fuer die Aufbau-Etappen. Jeder Block bekommt einen festen Tag, einen deutschen Anzeigenamen und eine Kategorie. Tag-Praefix `ff-` bleibt.

| Tag | Anzeige | Kategorie | Kurzbeschreibung |
| --- | --- | --- | --- |
| `ff-button` | Schaltflaeche | Eingabe | Loest eine Aktion oder Action-Chain aus. |
| `ff-text` | Textblock | Inhalt | Statischer Text mit Platzhaltern. |
| `ff-feld` | Formularfeld | Eingabe | Generisches Feld, an IDB-/Beleg-Feld gebunden. |
| `ff-datum` | Datumsfeld | Eingabe | Datumseingabe mit Picker. |
| `ff-feldliste` | Feldliste | Inhalt | Mehrere Felder gruppiert dargestellt. |
| `ff-infobox` | Infobox | Inhalt | Hinweis/Warnung/Erfolg mit Icon. |
| `ff-tabelle` | Datentabelle | Daten | Liste aus Datenquelle mit Spalten. |
| `ff-zeitraster` | Zeitraster | Daten | Kalender-/Zeitachsen-Darstellung. |
| `ff-kanban` | Kanban-Board | Daten | Statusbasierte Spalten mit Karten. |
| `ff-detailkarte` | Detailkarte | Daten | Einzeldatensatz formularartig. |
| `ff-rahmen` | Rahmen | Layout | Container fuer beliebige Bloecke. |
| `ff-aktionsrahmen` | Aktionsrahmen | Layout | Container mit Aktions-/Toolbar-Zone. |
| `ff-assistent` | Assistent | Layout | Mehrstufiger Wizard mit Schritten. |

Reihenfolge fuer Etappen 3+ nach Lernwert + SoftEngine-Relevanz:

1. `ff-feld` (Bindung an IDB-Feld; Kern jeder Maske)
2. `ff-tabelle` (DataSource-Vertrag, Spalten, Selection)
3. `ff-detailkarte` (Feld-Komposition, Datensatz-Edit)
4. `ff-feldliste` (Layout + Felder)
5. `ff-rahmen` (Container; Voraussetzung fuer geschachtelte Bloecke)
6. `ff-datum` (Spezialfall Feld; UI-Library-Wrapping)
7. `ff-infobox` (einfacher Inhaltsblock; Pause-Block zwischen schweren)
8. `ff-kanban` (Daten + Drag innerhalb Block)
9. `ff-zeitraster` (Daten + Zeitachse)
10. `ff-aktionsrahmen` (Layout + Action-Chain-Anbindung)
11. `ff-assistent` (Multi-Step, State-Maschine)

Bereits vorhanden: `ff-button`, `ff-text` (Etappen 1/2 abgeschlossen).

## 20. Erweiterbarkeit

Die Architektur ist auf Plugin-Pattern via Registries ausgelegt. Neue Funktionen werden nicht in zentrale Schalter-Listen eingetragen, sondern registrieren sich selbst.

| Erweiterung | Mechanismus | Aufwand |
| --- | --- | --- |
| Neuer Block | `registerBlockType` in `blocks/<typ>/<Block>.ts` + Zeile in `blocks/register.ts` | 1-2 Dateien |
| Neue Inspector-Property | Eintrag in `BlockDefinition.customProperties`, ggf. neues Control in `inspector/controls/` | 0-1 Dateien |
| Neuer State-Bereich | Eigenes `Subject<T>`-basiertes Modul; eigener `useX`-Hook | 2 Dateien |
| Neue DataSource (IDB, Relation, Workflow, Lookup, Template) | Importer-Klasse in `softengine/catalog/importers/` | 1 Datei |
| Neue Action-Chain-Schritte | Eigene Schritt-Registry analog Block-Registry | 1-2 Dateien |
| Neuer Atom-Wrapper / Library-Wechsel | nur `ui/atoms/<Atom>.tsx` anfassen | 1 Datei pro Atom |
| Neue Export-Variante | Adapter in `softengine/export/` parallel zur bestehenden | 1 Datei |
| Neue Persistenz (IndexedDB, Cloud) | Adapter hinter `state/`-Schnittstelle | 1 Datei |

Regel: jede neue Funktion baut auf einer Registry oder einem Adapter. Der Editor-Kern bleibt von konkreten Implementierungen frei.
