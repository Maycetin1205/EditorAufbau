// useKeyboardShortcuts
// Bindet globale Tastatur-Shortcuts an Editor-Befehle.
// Ausschliesslich Delete = Block loeschen. Backspace bleibt immer fuer
// Textbearbeitung reserviert und loescht niemals einen Baustein.
// Ctrl/Cmd+Z = Undo. Ctrl/Cmd+Shift+Z oder Ctrl+Y = Redo.
// Ctrl/Cmd+D = Duplicate.

import { useEffect } from 'react'
import { useEditorInstance } from './EditorContext'
import { loescheBaustein } from './loescheBaustein'

// Tippt der Bediener gerade in einem Eingabefeld?
//
// Geprueft wird der ganze `composedPath()`, nicht `event.target` (A6,
// 2026-08-11): kommt der Tastendruck aus dem Shadow DOM eines Bausteins, zeigt
// `target` auf den HOST (das Custom Element) und nie auf das Feld darin. Delete,
// Strg+Z und Strg+D trafen damit den EDITOR, waehrend der Bediener im Text
// eines Bausteins schrieb — ein markiertes Wort loeschen konnte den ganzen
// Baustein loeschen. Muster: `inTextBearbeitung` in canvas/rasterMove.ts.
//
// Ausserhalb des Shadow DOM aendert sich nichts: der Pfad ENTHAELT das Ziel,
// die Pruefung ist also eine Erweiterung der alten, keine andere.
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
  // Instanz aus dem Versorger statt Weltvariable —
  // die Instanz ist app-lebenslang stabil, der Effekt läuft weiter einmal.
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
