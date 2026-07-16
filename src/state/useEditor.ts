// useEditor
// React-Hook: holt die Editor-Instanz aus dem EditorProvider (A2 — keine
// Weltvariable mehr) und bindet sie via useSyncExternalStore an React.
// React fragt offiziell: wie abonnieren (subscribe) + welcher Snapshot (version).
// Bei version-Aenderung rendert die nutzende Komponente neu.

import { useSyncExternalStore } from 'react'
import { useEditorInstance } from './EditorContext'

export function useEditor() {
  const editor = useEditorInstance()
  useSyncExternalStore(
    (cb) => editor.subscribe(() => cb()),
    () => editor.version,
  )
  return editor
}
