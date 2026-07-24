// useRelations
// React-Hook für die Relation-Vorlagen-Bibliothek — dasselbe
// Muster wie useDataSources: useSyncExternalStore bindet den Store-Singleton
// an React, bei version-Änderung rendert die nutzende Komponente neu.

import { useSyncExternalStore } from 'react'
import { relationStore } from './RelationStore'

export function useRelations() {
  useSyncExternalStore(
    (cb) => relationStore.subscribe(() => cb()),
    () => relationStore.version,
  )
  return relationStore
}
