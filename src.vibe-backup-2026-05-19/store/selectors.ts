// Kleine Selektoren halten Komponenten lesbar und verhindern Store-Wildwuchs.
import type { EditorStore } from './editorStore'

export const selectSelectedBlock = (state: EditorStore) =>
  state.selectedBlockId ? state.blocks[state.selectedBlockId] : null
