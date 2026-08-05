// useEditor
// React-Hook: holt die Editor-Instanz aus dem EditorProvider (A2 — keine
// Weltvariable mehr) und bindet sie via useSyncExternalStore an React.
// React fragt offiziell: wie abonnieren (subscribe) + welcher Snapshot (version).
// Bei version-Aenderung rendert die nutzende Komponente neu.

import { useCallback, useSyncExternalStore } from 'react'
import { useEditorInstance } from './EditorContext'

export function useEditor() {
  const editor = useEditorInstance()
  // Die subscribe-Funktion MUSS stabil sein: reicht man hier bei jedem Render
  // eine neue Closure herein, meldet React das Abo jedes Mal ab und wieder an.
  // Der Rueckruf wird direkt durchgereicht (kein Wrapper) — Subject.subscribe
  // uebergibt ein Argument, das er schlicht ignoriert.
  const abonniere = useCallback(
    (cb: () => void) => editor.subscribe(cb),
    [editor],
  )
  useSyncExternalStore(abonniere, () => editor.version)
  return editor
}
