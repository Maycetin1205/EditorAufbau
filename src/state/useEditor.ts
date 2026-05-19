// useEditor
// React-Hook: bindet die Editor-Singleton-Instanz an React via useSyncExternalStore.
// React fragt offiziell: wie abonnieren (subscribe) + welcher Snapshot (version).
// Bei version-Aenderung rendert die nutzende Komponente neu.

import { useSyncExternalStore } from 'react'
import { editor } from './Editor'

export function useEditor() {
  useSyncExternalStore(
    (cb) => editor.subscribe(() => cb()),
    () => editor.version,
  )
  return editor
}
