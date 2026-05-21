// useKeyboardShortcuts
// Bindet globale Tastatur-Shortcuts an Editor-Aktionen.
// Ignoriert Tasten, wenn Fokus in Input/Textarea/Select/contenteditable liegt.

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
      if (e.key === 'Delete') {
        if (editor.selectedId) editor.removeBlock(editor.selectedId)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
