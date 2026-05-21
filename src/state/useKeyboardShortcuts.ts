// useKeyboardShortcuts
// Bindet globale Tastatur-Shortcuts an Editor-Aktionen.
// Nutzt Mantine useHotkeys: ignoriert Eingabe in Input/Textarea/contenteditable
// automatisch, kein eigenes Event-Handling noetig.
// Neue Shortcuts hier in das Array haengen.

import { useHotkeys } from '@mantine/hooks'
import { editor } from './Editor'

export function useKeyboardShortcuts() {
  useHotkeys([
    [
      'Delete',
      () => {
        if (editor.selectedId) editor.removeBlock(editor.selectedId)
      },
    ],
  ])
}
