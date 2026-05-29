// useKeyboardShortcuts
// Bindet globale Tastatur-Shortcuts an Editor-Befehle.
// Delete/Backspace = Block loeschen.
// Ctrl/Cmd+Z = Undo. Ctrl/Cmd+Shift+Z oder Ctrl+Y = Redo.
// Ctrl/Cmd+D = Duplicate.

import { useEffect } from 'react'
import { editor } from './Editor'

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (target.isContentEditable) return true
  return false
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return
      const mod = e.ctrlKey || e.metaKey

      if (!mod && (e.key === 'Delete' || e.key === 'Backspace')) {
        if (editor.selectedId) {
          e.preventDefault()
          editor.removeBlock(editor.selectedId)
        }
        return
      }

      if (!mod) return

      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault()
          if (e.shiftKey) editor.redo()
          else editor.undo()
          break
        case 'y':
          e.preventDefault()
          editor.redo()
          break
        case 'd':
          if (editor.selectedId) {
            e.preventDefault()
            editor.duplicateBlock(editor.selectedId)
          }
          break
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
