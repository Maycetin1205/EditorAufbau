// Zentraler Editor-State: Canvas, Inspector und Export lesen dieselbe Wahrheit.
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createBlock } from '../core/blocks/blockFactory'
import { getBlockDefinition } from '../core/blocks/blockRegistry'
import type {
  BlockId,
  BlockType,
  EditorBlock,
  EditorProjectState,
} from '../core/blocks/block.types'

type EditorActions = {
  addBlock: (type: BlockType) => void
  selectBlock: (id: BlockId | null) => void
  updateBlockProps: (id: BlockId, patch: Record<string, unknown>) => void
  deleteSelectedBlock: () => void
  noteBlockAction: (id: BlockId, actionLabel: string) => void
}

export type EditorStore = EditorProjectState & {
  selectedBlockId: BlockId | null
  lastEventMessage: string
} & EditorActions

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      blocks: {},
      rootBlockIds: [],
      selectedBlockId: null,
      lastEventMessage: 'Noch keine Block-Aktion.',

      addBlock: (type) =>
        set((state) => {
          const block = createBlock(type, state.rootBlockIds.length)

          return {
            blocks: {
              ...state.blocks,
              [block.id]: block,
            },
            rootBlockIds: [...state.rootBlockIds, block.id],
            selectedBlockId: block.id,
          }
        }),

      selectBlock: (id) => set({ selectedBlockId: id }),

      updateBlockProps: (id, patch) =>
        set((state) => {
          const block = state.blocks[id]
          if (!block) return state

          // Schema prueft die neuen Props, bevor sie in den Store duerfen.
          const definition = getBlockDefinition(block.type)
          const nextProps = definition.schema.parse({
            ...block.props,
            ...patch,
          }) as EditorBlock['props']

          return {
            blocks: {
              ...state.blocks,
              [id]: {
                ...block,
                props: nextProps,
              },
            },
          }
        }),

      deleteSelectedBlock: () =>
        set((state) => {
          const id = state.selectedBlockId
          if (!id) return state

          const blocks = { ...state.blocks }
          delete blocks[id]

          return {
            blocks,
            rootBlockIds: state.rootBlockIds.filter(
              (blockId) => blockId !== id,
            ),
            selectedBlockId: null,
          }ß
        }),

      noteBlockAction: (id, actionLabel) =>
        set({
          selectedBlockId: id,
          lastEventMessage: `Block-Aktion: ${actionLabel || 'ohne actionId'}`,
        }),
    }),
    {
      name: 'aufbau-editor-project-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        blocks: state.blocks,
        rootBlockIds: state.rootBlockIds,
        selectedBlockId: state.selectedBlockId,
      }),
    },
  ),
)
