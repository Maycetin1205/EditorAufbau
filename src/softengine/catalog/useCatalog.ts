// useCatalog
// React-Hook: bindet die Catalog-Singleton-Instanz an React via useSyncExternalStore.
// Gleiche Struktur wie useEditor.

import { useSyncExternalStore } from 'react'
import { catalog } from './Catalog'

export function useCatalog() {
  useSyncExternalStore(
    (cb) => catalog.subscribe(() => cb()),
    () => catalog.version,
  )
  return catalog
}
