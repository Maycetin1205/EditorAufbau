// BlockDefinition
// Technischer Registry-Eintrag fuer einen registrierten Block-Typ.
// Wird aus den statischen Klassenfeldern + customProperties-Getter einer
// Block-Klasse abgeleitet (siehe BasicBlock.defineAndRegister).

import type { BlockCategory } from './BlockComponent'
import type { FlowDirection, FlowWidth } from './flowLayout'
import type { PropertyDescription } from './PropertyDescription'

export type { BlockCategory }

// Beispieldaten-Bauplan (Kap. 4K.4): beschreibt, mit welchem Teilbaum ein
// Block eingefügt wird ("nie ein leeres Gerippe"). Reine Daten — die Factory
// materialisiert daraus BlockNodes. `children` überschreibt die
// defaultChildren des Kind-Typs; fehlt es, gelten dessen eigene.
export interface DefaultChildSpec {
  type: string
  props?: Record<string, unknown>
  children?: readonly DefaultChildSpec[]
}

// Bindbare Stelle (Kap. 5.2, Bedienlogik 3): eine Text-Stelle des Blocks,
// die per Klick an ein Feld der Datenquelle in Reichweite gebunden werden
// kann. `prop` = die Anzeige-Prop der Stelle (z. B. 'heading'); die Bindung
// selbst (Feldcode = Technikwert) liegt in der Prop `<prop>Field` und muss
// in den defaultProps des Blocks stehen (Default '' = ungebunden), damit
// Persistenz sie erhält und der Export sie als Attribut mitnimmt.
// `label` = Klarname der Stelle für den Feld-Picker (z. B. 'Titel').
// Der Block markiert das Stellen-Element im Template mit
// data-ff-spot="<prop>" (Klick-Ziel) und data-ff-bound (Daten-Markierung,
// sichtbar nur im Editor — gated über data-ff-editor am Host).
export interface BindableSpot {
  prop: string
  label: string
}

export interface ActionValueSpot {
  prop: string
  label: string
}

// Auslesbare Stellen liefern aktuelle Laufzeitwerte an Aktionsparameter.
// Registry-Opt-in statt fest verdrahteter Bausteintypen im Schritt-Editor.
export type ActionValueSpotsFor<Props> = ReadonlyArray<{
  prop: keyof Props & string
  label: string
}>

// ---------------------------------------------------------------------------
// Bindungs-Konvention (Aufräumen A5) — DIE eine, typgeprüfte Definition.
// Die Bindung einer Stelle liegt in der Prop `<prop>Field` (Feldcode =
// Technikwert, '' = ungebunden); im exportierten HTML normalisiert sie der
// Browser zum kleingeschriebenen Attribut `<prop>field`. Alle Leser gehen
// über diese Typen/Helfer statt eigener String-Bastelei:
//   - Editor: bindingProp() in useLitElement/useBindingPicker/BlockHost.
//   - Laufzeit: seRuntime/feldRuntime bauen ihre Attributnamen über
//     bindingAttr() (P-C 2026-07-17 — vorher nur Typ-Anker per satisfies;
//     seither reist diese Funktion im Runtime-Bündel mit).
//   - Bausteine: bindableSpots/bindingRoute sind über BindableSpotsFor/
//     BindingRouteFor gegen die eigenen defaultProps geprüft.

// Prop-Form der Bindung (`heading` → `headingField`).
export type BindingProp<P extends string = string> = `${P}Field`

// Attribut-Form der Bindung (`headingField` → `headingfield`): HTML-
// Attribute sind kleingeschrieben, das Suffix bleibt `field`.
export type BindingAttr = `${string}field`

// Die EINE Stelle, die den Bindungs-Prop-Namen baut.
export function bindingProp<P extends string>(prop: P): BindingProp<P> {
  return `${prop}Field`
}

// Die EINE Stelle, die den Bindungs-Attributnamen baut (Laufzeit liest
// Attribute, nicht Props — HTML normalisiert `valueField` zu `valuefield`).
export function bindingAttr(prop: string): BindingAttr {
  return `${prop.toLowerCase()}field`
}

// Typgeprüfte bindableSpots: eine Stelle ist nur deklarierbar, wenn ihre
// Bindungs-Prop `<prop>Field` in den defaultProps des Blocks existiert —
// sonst könnten Persistenz und Export die Bindung nicht mitnehmen.
export type BindableSpotProp<Props> = keyof Props extends infer K
  ? K extends BindingProp<infer P> ? P : never
  : never

export type BindableSpotsFor<Props> = ReadonlyArray<{
  prop: BindableSpotProp<Props>
  label: string
}>

// Typgeprüfte bindingRoute: das Einsortieren-/Wert-Feld muss eine
// existierende Bindungs-Prop des Blocks sein.
export type BindingRouteFor<Props> = {
  fieldProp: keyof Props & BindingProp
}

// Datenanschluss am Board: der Block deklariert das Einsortieren-Feld,
// das gemeinsam mit der source-Prop im eigenen Anschluss-Dialog gepflegt wird.
// Struktur und sichtbare Feldbindungen bleiben am echten Baustein im Canvas.
export interface BindingRoute {
  fieldProp: string
}

// Ereignis eines Blocks (Kommandozentrale Z1, Vorgriff Kap. 8): was bei
// diesem Baustein passieren kann. `name` = Klarname für den Bediener
// („Karte angeklickt"), `key` = Technikwert — das Vokabular des alten
// Editors (onClick/onCardClick/onCardDrop), an dem ab Z2 die
// Aktionsketten hängen. Der Bediener sieht NIE den key.
export interface BlockEventSpec {
  key: string
  name: string
}

export interface BlockDefinition {
  type: string
  tagName: string
  displayName: string
  category: BlockCategory
  defaultProps: Record<string, unknown>
  customProperties: PropertyDescription[]
  acceptsChildren: boolean
  resizableWidth: boolean
  // true = der Block hat eine einstellbare HÖHE (P1.3, opt-in): Zieh-
  // Anfasser an der Unterkante; Doppelklick setzt den Block-Standard
  // (z. B. Kanban = verbleibende Höhe/fill) zurück.
  // Der Block muss dafür `height` in seinen defaultProps deklarieren
  // (Kanban: feste Höhe = Karten scrollen im Spaltenrumpf). Default false.
  resizableHeight: boolean
  // Erlaubte Kind-Typen (Kap. 4K.4): undefined = alle Typen erlaubt.
  // Kanban-Spalte nimmt z. B. NUR Karten. Durchgesetzt im Store (addBlock/
  // moveNode) und in der Drag-Vorschau — nie per `if type===` in der UI.
  allowedChildTypes?: readonly string[]
  // Gegenrichtung (S3): erlaubte ELTERN-Typen. undefined = überall erlaubt.
  // Karten existieren NUR in Kanban-Spalten, Spalten NUR in Boards — eine
  // Karte lässt sich damit nicht mehr aus dem Kanban auf die Fläche ziehen.
  // Durchgesetzt an derselben EINEN Stelle wie allowedChildTypes (canContain).
  allowedParentTypes?: readonly string[]
  // Festgelegtes Breitenverhalten (K0, opt-in — ersetzt fillMinWidth): die
  // Registry pinnt die Fluss-Breite, die width-Prop des Knotens wird
  // ignoriert; Breite-Anfasser/Inspector-Breite entfallen. Kanban-Spalte:
  // 'fill' (alle Spalten teilen sich die Zeile IMMER gleichmäßig,
  // Entscheidung A), Vorlagen-Kasten: 'auto' (volle Breite in der eigenen
  // Slot-Zeile). undefined = normales width-Verhalten (alle anderen Blöcke).
  lockedWidth?: FlowWidth
  // Teilbaum, mit dem der Block eingefügt wird (Beispieldaten).
  defaultChildren?: readonly DefaultChildSpec[]
  // Feste Fluss-Richtung der Kinder für spezialisierte Container (Kanban-
  // Board = row). Der generische Bereich steuert das weiter über seine
  // `direction`-Prop — siehe resolveChildDirection in flowLayout.
  childDirection?: FlowDirection
  // false = erscheint nicht in der Bibliothek (Kanban-Spalte entsteht nur
  // über das Board). undefined/true = sichtbar.
  showInPalette?: boolean
  // Laufzeit-Vorlage (P1.1): der Container erzeugt seine Laufzeit-Kinder
  // aus der ERSTEN Nachfahren-Karte dieses Typs (Baumreihenfolge; seRuntime
  // klont sie je Datenzeile). Der Editor markiert genau diese Karte dezent
  // mit dem Label (Editor-Hilfe im BlockHost, nie im Export).
  templateChild?: { type: string; label: string }
  // false = keine gestrichelte Editor-Hilfe um den Container (Blöcke mit
  // eigenem sichtbarem Rahmen wie Kanban/Spalte). undefined/true = Hilfe an.
  containerHint?: boolean
  // Editor-Hilfe "Plus-Knopf" am Container: fügt einen Kind-Block dieses
  // Typs ans Ende ein (Kanban: "+ Spalte", Spalte: "+ Karte").
  addChildButton?: { label: string; childType: string }
  // true = an den Block lässt sich eine Datenquelle hängen (Kap. 5.1,
  // Bedienlogik 2). Der Block trägt dann eine `source`-Prop (Technikwert =
  // Vorlagen-id aus core/data/dataSources); der Inspector zeigt die Sektion
  // "Daten", der Export erzeugt daraus den SEFILELOOP. Kein `if type===`.
  acceptsDataSource?: boolean
  // Bindbare Stellen des Blocks (Kap. 5.2) — siehe BindableSpot.
  bindableSpots?: readonly BindableSpot[]
  // Aktuelle Bausteinwerte, die als Parameterquelle angeboten werden.
  actionValueSpots?: readonly ActionValueSpot[]
  // Eigener Datenanschluss-Dialog fuer source + Einsortieren-Feld.
  // Das dort gepflegte Feld-Control ist hiddenInInspector.
  bindingRoute?: BindingRoute
  // Ereignisse des Blocks (Z1) — siehe BlockEventSpec. undefined = der
  // Baustein löst keine Ereignisse aus (erscheint nicht in der Zentrale).
  blockEvents?: readonly BlockEventSpec[]
  // true = der Block ist eine SEITE der Maske (Popup, Kap. P-A): er liegt
  // als Kind der Wurzel im Baum (Persistenz/Undo/Export laufen generisch
  // mit), erscheint aber NIE im Fluss der Hauptseite — der Canvas zeigt ihn
  // nur als eigenen Seiten-Reiter. Kein `if type===`: Editor.childNodesOf
  // und die Seitenleiste lesen ausschließlich dieses Kennzeichen.
  pageBlock?: boolean
}
