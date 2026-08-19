import type { BlockCategory } from './BlockComponent'
import type { FlowDirection, FlowWidth } from './flowLayout'
import type { RasterSpec } from './rasterLayout'
import type {
  PropertyDescription,
  PropertyVisibilityCondition,
} from './PropertyDescription'

export type { BlockCategory }

export interface DefaultChildSpec {
  type: string
  props?: Record<string, unknown>
  children?: readonly DefaultChildSpec[]
}

export interface BindableSpot {
  prop: string
  label: string

  wenn?: PropertyVisibilityCondition

  vorschauProp?: string
}

export interface ActionValueSpot {
  prop: string
  label: string
}

export {
  eintragsFelderLesen,
  eintragsFelderVon,
  eintragsQuellenWahlWert,
  eintragsWahlWert,
  eintragsZuordnungLesen,
  listenStandardTitel,
  listeFuerExport,
  listeLesen,
  type EintragsQuellenWahl,
  type EintragsWahl,
  type EintragsWahlOption,
  type EintragsZuordnung,
  type ListenBindung,
  type ZuordnungZeile,
} from './listenBindung'
import type { ListenBindung } from './listenBindung'

export type ActionValueSpotsFor<Props> = ReadonlyArray<{
  prop: keyof Props & string
  label: string
}>

export type BindingProp<P extends string = string> = `${P}Field`

export type BindingAttr = `${string}field`

export function bindingProp<P extends string>(prop: P): BindingProp<P> {
  return `${prop}Field`
}

export function bindingAttr(prop: string): BindingAttr {
  return `${prop.toLowerCase()}field`
}

export const QUELLEN_TRENNER = '::'

export interface FeldZiel {
  quelleId: string
  code: string
}

export function bindungMitQuelle(quelleId: string, code: string): string {
  if (quelleId === '' || code === '') return code
  return `${quelleId}${QUELLEN_TRENNER}${code}`
}

export function zerlegeBindung(wert: string): FeldZiel {
  const teile = wert.split(QUELLEN_TRENNER)
  if (teile.length !== 2) return { quelleId: '', code: wert }
  const [quelleId, code] = teile
  if (quelleId === '' || code === '') return { quelleId: '', code: wert }
  return { quelleId, code }
}

export type BindableSpotProp<Props> = keyof Props extends infer K
  ? K extends BindingProp<infer P> ? P : never
  : never

export type BindableSpotsFor<Props> = ReadonlyArray<
  Omit<BindableSpot, 'prop' | 'vorschauProp'> & {
    prop: BindableSpotProp<Props>
    vorschauProp?: keyof Props & string
  }
>

export interface BlockEventSpec {
  key: string
  name: string
}

export interface SatzWahl {
  quelleProp?: string

  wenn?: PropertyVisibilityCondition
}

export type QuellenFaehigkeit = boolean | { wenn: PropertyVisibilityCondition }

// Die Fähigkeit „Erfassungszeile": der Baustein nimmt neue Zeilen entgegen,
// bevor sie im ERP existieren. `wenn` sagt, an welcher Eigenschaft der
// Schalter hängt — Editor (Herkunfts-Wähler), Export (data-ff-block-id) und
// Laufzeit lesen dieselbe Deklaration.
export interface ErfassungsFaehigkeit {
  wenn?: PropertyVisibilityCondition
}

// Eine erfasste Zeile, wie eine Kette sie liest: je Datenquelle EIN Satz
// {Feldcode: Wert}. Die Zellwerte allein sagen nicht, welches Feld welcher
// Quelle sie füllen — das weiß nur der Baustein (jede seiner Spalten IST ein
// Feld einer Quelle), darum liefert er es fertig. So kommt die Kette mit
// „Datenquelle → Feld" an sie heran und braucht keine Spalten-Indizes.
export type ErfassterSatz = Readonly<Record<string, Readonly<Record<string, string>>>>

// Der Laufzeit-Vertrag eines Bausteins mit dieser Fähigkeit: die Kette am
// Knopf liest die erfassten Zeilen und leert sie nach dem Lauf. Rein als Typ —
// die Laufzeit findet den Baustein über data-ff-block-id, nie über einen
// Import (Regel 2).
export interface ErfassungsTraegerElement {
  // Die Quellen, die eine erfasste Zeile hier füllen KANN — unabhängig davon,
  // ob schon etwas erfasst ist. Daran erkennt die Kette, dass dieser Baustein
  // ihren Takt gibt: eine leere Erfassung heißt „nichts zu schreiben", nicht
  // „es gibt keine Erfassung" (sonst liefe die Kette einmal mit fremden
  // Werten). Leer = die Erfassung ist ausgeschaltet.
  erfassteQuellen: readonly string[]

  erfassteSaetze: readonly ErfassterSatz[]
  erfassungLeeren: () => void
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

  resizableHeight: boolean

  allowedChildTypes?: readonly string[]

  allowedParentTypes?: readonly string[]

  lockedWidth?: FlowWidth

  defaultChildren?: readonly DefaultChildSpec[]

  childDirection?: FlowDirection

  showInPalette?: boolean

  templateChild?: { type: string; label: string }

  containerHint?: boolean

  addChildButton?: { label: string; childType: string }

  acceptsDataSource?: QuellenFaehigkeit

  satzWahl?: SatzWahl

  kannAuswahlFolgen?: boolean

  kannErfassen?: ErfassungsFaehigkeit

  bindableSpots?: readonly BindableSpot[]

  actionValueSpots?: readonly ActionValueSpot[]

  listenBindung?: ListenBindung

  blockEvents?: readonly BlockEventSpec[]

  pageBlock?: boolean

  flaechenSeite?: boolean

  maskenRand?: boolean

  raster?: Partial<RasterSpec>
}
