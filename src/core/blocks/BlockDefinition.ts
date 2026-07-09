// BlockDefinition
// Technischer Registry-Eintrag fuer einen registrierten Block-Typ.
// Wird aus den statischen Klassenfeldern + customProperties-Getter einer
// Block-Klasse abgeleitet (siehe BasicBlock.defineAndRegister).

import type { BlockCategory } from './BlockComponent'
import type { FlowDirection } from './flowLayout'
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

export interface BlockDefinition {
  type: string
  tagName: string
  displayName: string
  category: BlockCategory
  defaultProps: Record<string, unknown>
  customProperties: PropertyDescription[]
  acceptsChildren: boolean
  resizableWidth: boolean
  // Erlaubte Kind-Typen (Kap. 4K.4): undefined = alle Typen erlaubt.
  // Kanban-Spalte nimmt z. B. NUR Karten. Durchgesetzt im Store (addBlock/
  // moveNode) und in der Drag-Vorschau — nie per `if type===` in der UI.
  allowedChildTypes?: readonly string[]
  // Gegenrichtung (S3): erlaubte ELTERN-Typen. undefined = überall erlaubt.
  // Karten existieren NUR in Kanban-Spalten, Spalten NUR in Boards — eine
  // Karte lässt sich damit nicht mehr aus dem Kanban auf die Fläche ziehen.
  // Durchgesetzt an derselben EINEN Stelle wie allowedChildTypes (canContain).
  allowedParentTypes?: readonly string[]
  // Fließende Breite mit Mindestbreite (S3, opt-in): der Block verteilt sich
  // im Zeilen-Container immer fließend (mind. fillMinWidth px, Umbruch statt
  // Scroll) und ignoriert seine width-Prop; Breite-Anfasser/Inspector-Breite
  // entfallen. undefined = normales width-Verhalten (alle anderen Blöcke).
  fillMinWidth?: number
  // Teilbaum, mit dem der Block eingefügt wird (Beispieldaten).
  defaultChildren?: readonly DefaultChildSpec[]
  // Feste Fluss-Richtung der Kinder für spezialisierte Container (Kanban-
  // Board = row). Der generische Bereich steuert das weiter über seine
  // `direction`-Prop — siehe resolveChildDirection in flowLayout.
  childDirection?: FlowDirection
  // false = erscheint nicht in der Bibliothek (Kanban-Spalte entsteht nur
  // über das Board). undefined/true = sichtbar.
  showInPalette?: boolean
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
}
