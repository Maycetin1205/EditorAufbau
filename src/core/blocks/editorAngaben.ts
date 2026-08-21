// eslint no-restricted-imports). Bis 2026-08-11 stand hier `LucideIcon` aus

export type BausteinSymbol = (eigenschaften: {
  size?: number | string
  className?: string
}) => unknown

// Ein Seiten-Baustein, den man im Editor an Anfassern groesser zieht. Der
// Baustein nennt SEINE Eigenschaftsnamen und Mindestmasse selbst — der Canvas
// darf sie nicht auswendig kennen (Regel 2). Bis 2026-08-21 schrieb
// `PopupSeite.tsx` die Namen `breite`/`hoehe` und die Masse 240/160/520/380
// direkt hin, obwohl `Canvas.tsx` diese Seite fuer JEDE Fenster-Seitenart
// rendert.
export interface ZiehbareGroesse {
  breiteProp: string

  hoeheProp: string

  minBreite: number

  minHoehe: number

  // Der Anfasser sitzt mittig und die Flaeche waechst nach BEIDEN Seiten: ein
  // Pixel Zeigerweg sind zwei Pixel Breite.
  faktor?: number
}

export interface EditorAngaben {
  symbol?: BausteinSymbol

  hinweis?: string

  // Welche Eigenschaften den Baustein im Editor BENENNEN (Statuszeile,
  // Fenster-Koepfe, Auswahllisten) — in Reihenfolge: die erste gefuellte, die
  // nicht mehr auf ihrem Standardwert steht, gewinnt.
  //
  // Bis 2026-08-21 kannte `bausteinName` diese Namen auswendig
  // (['label','heading','title','text','placeholder']) — generischer Code, der
  // die Eigenschaften einzelner Bausteine kennt, also ein Bruch von Regel 2.
  // Auffaellig war das an 'title': dazu gibt es keinen Baustein, die Zeile war
  // reine Fiktion. Ebenso die Reihenfolge 'label' vor 'placeholder' — kein
  // Baustein hat beides.
  nameProps?: readonly string[]

  ziehbareGroesse?: ZiehbareGroesse
}

const ablage = new Map<string, EditorAngaben>()

const KEINE: EditorAngaben = {}

export function ergaenzeEditorAngaben(type: string, angaben: EditorAngaben): void {
  ablage.set(type, angaben)
}

export function editorAngabenVon(type: string): EditorAngaben {
  return ablage.get(type) ?? KEINE
}
