// useEditor
// React-Hook: bindet die Editor-Instanz aus dem Context (U5) an React via
// useSyncExternalStore. React fragt offiziell: wie abonnieren (subscribe) +
// welcher Snapshot (version). Bei version-Änderung rendert die nutzende
// Komponente neu.

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
