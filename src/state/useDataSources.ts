// useDataSources
// React-Hook für die Datenquellen-Bibliothek (Kap. 5.4) — dasselbe Muster
// wie useEditor: useSyncExternalStore bindet den Store-Singleton an React,
// bei version-Änderung rendert die nutzende Komponente neu.

import { useSyncExternalStore } from 'react'
import { dataSourceStore } from './DataSourceStore'

export function useDataSources() {
  useSyncExternalStore(
    (cb) => dataSourceStore.subscribe(() => cb()),
    () => dataSourceStore.version,
  )
  return dataSourceStore
}
