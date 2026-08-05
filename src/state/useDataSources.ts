// useDataSources
// React-Hook für die Datenquellen-Bibliothek — dasselbe Muster
// wie useEditor: useSyncExternalStore bindet den Store-Singleton an React,
// bei version-Änderung rendert die nutzende Komponente neu.

import { useSyncExternalStore } from 'react'
import { dataSourceStore } from './DataSourceStore'

// Modulweit konstant, nicht je Render neu: eine wechselnde subscribe-Funktion
// laesst React das Abo bei JEDEM Render ab- und wieder anmelden. Der Store ist
// ein Singleton, also braucht es dafuer nicht einmal einen Hook.
const abonniere = (cb: () => void) => dataSourceStore.subscribe(cb)
const standVon = () => dataSourceStore.version

export function useDataSources() {
  useSyncExternalStore(abonniere, standVon)
  return dataSourceStore
}
