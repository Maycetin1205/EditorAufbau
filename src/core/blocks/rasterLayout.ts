// rasterLayout
// EINE Quelle für die RASTER-Platzierung eines Blocks auf der Maskenfläche —
// das Gegenstück zu flowLayout (Regel 1: Canvas UND Export leiten aus
// DEMSELBEN Mapping ab, damit Editor und SoftEngine-Maske identisch sitzen).
//
// Geltungsbereich V1: NUR die oberste Ebene der Maske (Kinder der Wurzel) und
// die Popup-Innenfläche. INNERHALB von Containern (Kanban-Board → Spalten →
// Karten, Karte, Zeile) bleibt flowLayout unverändert bestehen.
//
// Modell: reines CSS-Grid mit fester Spaltenzahl. Der Block liegt an ganzen
// Zellen — rasterX/rasterY = Position (0-basiert), rasterW/rasterH =
// Ausdehnung. KEIN absolute-Positioning, KEIN Transform: nur so gibt die
// Zeilenspur bei Überlauf (langer Text) über minmax nach, statt abzuschneiden
// (Nutzer-Zusage im Plan: kein Abschneiden, kein Überlappen).
//
// Universelle Raster-Props liegen — wie die Flow-Props — in node.props:
//   rasterX, rasterY  ganze Zellen ab 0 (Position im Grid)
//   rasterW, rasterH  ganze Zellen >= 1 (Breite/Höhe in Zellen)

import { propertySichtbar, type PropertyVisibilityCondition } from './PropertyDescription'

// Feinwerte (kalibrierbar nach Sichtprobe — im Bericht nennen):
//   spalten  = Anzahl der Rasterspalten.
//   spaltePx = NOMINALE Referenzbreite EINER Spalte in px — NICHT die Live-Breite.
//              Die Spalten wachsen mit dem Fenster (1fr, s. rasterFlaecheStyle),
//              damit die Maske das SoftEngine-Fenster füllt wie die echten Chef-
//              Masken (width:100%, Spalten als 1fr/flex — belegt in
//              docs/chef-maske/, Nutzer-Abgleich 2026-07-23). spaltePx dient nur
//              noch als Umrechnungs-/Fallback-Maß (Fluss->Raster-Migration).
//   zeilePx  = Höhe EINER Rasterzeile (fest — entkoppelt die Höhen der Nachbarn).
//   gapPx    = Abstand zwischen den Zellen.
export const RASTER = { spalten: 24, spaltePx: 40, zeilePx: 12, gapPx: 8 } as const

export interface RasterPos {
  x: number
  y: number
  w: number
  h: number
}

// Startgröße/Mindestgröße eines Bausteins auf dem Raster — Registry-Opt-in
// (BlockDefinition.raster), analog resizableHeight/lockedWidth. Canvas,
// Inspector und Export lesen generisch; kein `if type===` (Regel 2).
//
// breiteZiehbar: hat der Baustein auf der Rasterfläche den Breiten-Anfasser?
// Standard true — das ist der Sinn des Rasters, und die Fluss-Angabe
// resizableWidth gilt hier bewusst NICHT (s. BlockHost). Nur ein Baustein,
// dessen Breite in einem bestimmten Zustand keine Bedeutung mehr hat, schaltet
// ihn über eine Variante ab (senkrechte Trennlinie: sie ist ein Strich, kein
// Kasten — Breite zu ziehen erzeugte nur leeren Raum um ihn herum).
export interface RasterSpec {
  startW: number
  startH: number
  minW: number
  minH: number
  breiteZiehbar: boolean
  varianten: readonly RasterVariante[]
}

// Eine ZUSTANDS-Variante der Raster-Angaben: trifft ihre Bedingung auf die
// Props des Bausteins zu, überschreiben ihre Werte die Grundangaben. Damit
// richten sich Startgröße UND Ziehbarkeit nach dem Zustand, ohne dass Canvas,
// Store oder Zieh-Mechanik den Bausteintyp kennen (Regel 2) — sie fragen alle
// rasterSpecOf. Bedingung in DERSELBEN Form wie visibleWhen und mit DERSELBEN
// Auswertung (propertySichtbar). Erste zutreffende Variante gewinnt.
export interface RasterVariante extends Partial<Omit<RasterSpec, 'varianten'>> {
  wenn: PropertyVisibilityCondition
}

// Generischer Default, falls ein Baustein keine `raster`-Deklaration trägt:
// mittelschmal (6 Zellen), drei Zeilen hoch, frei bis auf eine Mindest-Zelle,
// in beiden Achsen ziehbar, ohne Zustands-Varianten.
// Bewusst NICHT volle Breite: ein Baustein ohne eigene Startbreite soll den
// Auswahlrahmen nicht als Vollbreite-Kästchen aufblähen (E1-Nachtrag).
export const RASTER_FALLBACK: RasterSpec = {
  startW: 6,
  startH: 3,
  minW: 1,
  minH: 1,
  breiteZiehbar: true,
  varianten: [],
}

// Universelle Raster-Defaults: werden — wie FLOW_DEFAULTS — in
// defineAndRegister unter die defaultProps JEDES Blocks gemischt, damit
// Persistenz/normalizeProps sie kennt und erhält. Bewusst neutral (volle
// Breite, eine Zeile, oben links); die sinnvolle STARTgröße beim Einfügen
// liefert die Registry (rasterSpecOf), die konkrete Position vergibt der
// Store bzw. die Migration.
export const RASTER_DEFAULTS: Record<string, unknown> = {
  rasterX: 0,
  rasterY: 0,
  rasterW: RASTER.spalten,
  rasterH: 1,
}

// Ganze, nicht-negative Zellenzahl; kaputte Werte → Fallback (nie werfen,
// analog parseFlowWidth). Nicht-Ganzzahlen werden abgerundet.
export function parseRasterCell(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.floor(value)
  }
  return fallback
}

// Liest die vier Raster-Props eines Knotens defensiv aus. Breite/Höhe sind
// mindestens 1 Zelle (ein 0-breiter Block wäre unsichtbar).
export function parseRasterPos(props: Record<string, unknown>): RasterPos {
  return {
    x: parseRasterCell(props.rasterX, 0),
    y: parseRasterCell(props.rasterY, 0),
    w: Math.max(1, parseRasterCell(props.rasterW, RASTER.spalten)),
    h: Math.max(1, parseRasterCell(props.rasterH, 1)),
  }
}

// Registry-Raster-Angaben eines Bausteins; fehlende Felder fallen auf den
// Default. `props` = der aktuelle Zustand des Bausteins: trifft eine Variante
// zu, gilt sie statt der Grundangabe. Ohne Props (Aufrufer, die nur einen Typ
// kennen) bleibt es bei den Grundangaben — eine Bedingung auf einen Wert, den
// niemand kennt, trifft nicht zu.
export function rasterSpecOf(
  def: { raster?: Partial<RasterSpec> } | undefined,
  props: Record<string, unknown> = {},
): RasterSpec {
  const basis: RasterSpec = { ...RASTER_FALLBACK, ...(def?.raster ?? {}) }
  for (const v of basis.varianten) {
    if (!propertySichtbar(v.wenn, props)) continue
    return {
      startW: v.startW ?? basis.startW,
      startH: v.startH ?? basis.startH,
      minW: v.minW ?? basis.minW,
      minH: v.minH ?? basis.minH,
      breiteZiehbar: v.breiteZiehbar ?? basis.breiteZiehbar,
      varianten: basis.varianten,
    }
  }
  return basis
}

// CSS des Grid-CONTAINERS (Rasterfläche) — DIESELBE Quelle für Editor-Canvas
// und Export-Root (Regel 1: identisch in Editor und SoftEngine). Spalten
// MITWACHSEND (1fr), Zeilen FEST (zeilePx). Das Außen-Padding kommt wie beim
// Fluss von der Wurzel (ROOT_FLOW.padding), nicht von hier.
export function rasterFlaecheStyle(): Record<string, string | number> {
  return {
    display: 'grid',
    // Mitwachsende Spalten (1fr): die Fläche füllt das ganze Fenster, genau wie
    // die echten Chef-Masken (width:100%, Spalten als 1fr/flex — docs/chef-maske/,
    // Nutzer-Abgleich 2026-07-23). Ein Baustein liegt in denselben ZELLEN wie im
    // Editor (Spalte 7-12 bleibt 7-12); wird das Fenster breiter, dehnt sich alles
    // gemeinsam. Ein fester Pixelwert würde die Maske NICHT mitwachsen lassen und
    // wäre unehrlich zum tatsächlichen SoftEngine-Verhalten.
    gridTemplateColumns: `repeat(${RASTER.spalten}, 1fr)`,
    // Feste Zeilenhöhe (Nutzer-Entscheidung 2026-07-23, „Bausteine beeinflussen
    // sich nicht"): KEIN minmax/auto. Mit auto teilten sich Bausteine in denselben
    // Zeilen die Höhe — ein wachsender/schrumpfender Baustein zog den Nachbarn mit
    // (belegt gemessen: A schrumpft → B wuchs 34→54px). Feste Zeilen entkoppeln
    // das: jeder Baustein ist genau spanne×zeilePx hoch, unabhängig vom Nachbarn.
    // Inhalt größer als die Zelle wird abgeschnitten — dann zieht der Bediener den
    // Baustein größer (feste Größe wie im Chef-Modell).
    gridAutoRows: `${RASTER.zeilePx}px`,
    gap: `${RASTER.gapPx}px`,
    // Zeilen oben packen ('start'), nicht über die ganze Flächenhöhe strecken.
    // (Für die Spalten braucht es kein justify: 1fr füllt die Breite bereits voll.)
    alignContent: 'start',
  }
}

// CSS des Grid-ITEMS (im Editor der CanvasNode-Wrapper, im Export das
// Block-Element selbst). Grid-Linien sind 1-basiert (Zelle 0 → Linie 1).
// min-width/height:0 ist Grid-Hygiene: verhindert, dass breiter Inhalt die
// Zellbreite sprengt.
export function rasterItemStyle(pos: RasterPos): Record<string, string | number> {
  return {
    gridColumn: `${pos.x + 1} / span ${pos.w}`,
    gridRow: `${pos.y + 1} / span ${pos.h}`,
    minWidth: 0,
    minHeight: 0,
  }
}

// Verteilt Blöcke verlustfrei „untereinander": fortlaufende y aus der
// übergebenen Reihenfolge, x=0, Breite UND Höhe je Block wie mitgegeben
// (jeweils mindestens 1 Zelle). Weil jeder Block seine eigene y-Spur bekommt,
// überlappt das Ergebnis nie — auch schmale Blöcke (w < voller Breite) liegen
// sauber untereinander in inhaltsnaher Breite, der Auswahlrahmen liegt eng am
// Baustein (E1-Nachtrag). DIESELBE Regel benutzt die Migration (schreibt die
// Props in den Baum).
export function stapeleUntereinander(
  groessen: readonly { w: number; h: number }[],
): RasterPos[] {
  const out: RasterPos[] = []
  let y = 0
  for (const g of groessen) {
    const w = Math.max(1, Math.floor(g.w))
    const h = Math.max(1, Math.floor(g.h))
    out.push({ x: 0, y, w, h })
    y += h
  }
  return out
}

// Unterste belegte Zeile + 1 = die freie Zeile „ganz unten" (Einfügen ans
// Ende). Leere Fläche → 0.
export function naechsteFreieZeile(positionen: readonly RasterPos[]): number {
  return positionen.reduce((max, p) => Math.max(max, p.y + p.h), 0)
}
