// Gemeinsame Block-Vertraege: Datenmodell, Registry-Eintrag und Inspector-Felder.
import type { ZodType } from 'zod'

export type BlockType = 'button' | 'text'
export type BlockId = string

export type BlockLayout = {
  parentId: BlockId | null
  order: number
}

export type EditorBlock<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  id: BlockId
  type: BlockType
  layout: BlockLayout
  props: TProps
  events: Record<string, string | null>
  bindings: Record<string, string | null>
}

export type EditorProjectState = {
  blocks: Record<BlockId, EditorBlock>
  rootBlockIds: BlockId[]
}

export type TextInspectorControl = {
  kind: 'text'
  prop: string
  label: string
  description?: string
  maxLength?: number
}

export type SelectInspectorControl = {
  kind: 'select'
  prop: string
  label: string
  description?: string
  options: Array<{ value: string; label: string }>
}

export type SwitchInspectorControl = {
  kind: 'switch'
  prop: string
  label: string
  description?: string
}

export type InspectorControl =
  | TextInspectorControl
  | SelectInspectorControl
  | SwitchInspectorControl

export type BlockDefinition<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  type: BlockType
  title: string
  description: string
  tagName: string
  defaultProps: TProps
  schema: ZodType<TProps>
  inspector: InspectorControl[]
  toHtml: (block: EditorBlock) => string
}
