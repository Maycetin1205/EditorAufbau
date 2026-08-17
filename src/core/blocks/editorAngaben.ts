// eslint no-restricted-imports). Bis 2026-08-11 stand hier `LucideIcon` aus

export type BausteinSymbol = (eigenschaften: {
  size?: number | string
  className?: string
}) => unknown

export interface EditorAngaben {
  symbol?: BausteinSymbol

  hinweis?: string
}

const ablage = new Map<string, EditorAngaben>()

const KEINE: EditorAngaben = {}

export function ergaenzeEditorAngaben(type: string, angaben: EditorAngaben): void {
  ablage.set(type, angaben)
}

export function editorAngabenVon(type: string): EditorAngaben {
  return ablage.get(type) ?? KEINE
}
