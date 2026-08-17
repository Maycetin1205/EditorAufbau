import { useEffect } from 'react'
import { useEditorInstance } from './EditorContext'
import { loescheBaustein } from './loescheBaustein'

function inEingabefeld(e: KeyboardEvent): boolean {
  for (const ziel of e.composedPath()) {
    if (!(ziel instanceof HTMLElement)) continue
    const tag = ziel.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
    if (ziel.isContentEditable) return true
  }
  return false
}

export function useKeyboardShortcuts() {
  const editor = useEditorInstance()
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (inEingabefeld(e)) return
      const mod = e.ctrlKey || e.metaKey

      if (!mod && e.key === 'Delete') {
        if (editor.selectedId) {
          e.preventDefault()
          loescheBaustein(editor, editor.selectedId)
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
  }, [editor])
}
