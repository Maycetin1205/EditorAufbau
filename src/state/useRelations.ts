// useRelations
// React-Hook für die Relation-Vorlagen-Bibliothek — dasselbe
// Muster wie useDataSources: useSyncExternalStore bindet den Store-Singleton
// an React, bei version-Änderung rendert die nutzende Komponente neu.

import { useSyncExternalStore } from 'react'
import { relationStore } from './RelationStore'

// Modulweit konstant, s. useDataSources: eine je Render neue subscribe-
// Funktion liesse React das Abo jedes Mal ab- und wieder anmelden.
const abonniere = (cb: () => void) => relationStore.subscribe(cb)
const standVon = () => relationStore.version

export function useRelations() {
  useSyncExternalStore(abonniere, standVon)
  return relationStore
}
