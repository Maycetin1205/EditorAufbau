// useSourceLinks
// React-Hook fuer die Verknuepfungen zwischen Datenquellen — dasselbe
// Muster wie useDataSources und useRelations: useSyncExternalStore bindet
// den Store-Singleton an React, bei version-Aenderung rendert die nutzende
// Komponente neu.

import { useSyncExternalStore } from 'react'
import { sourceLinkStore } from './SourceLinkStore'

export function useSourceLinks() {
  useSyncExternalStore(
    (cb) => sourceLinkStore.subscribe(() => cb()),
    () => sourceLinkStore.version,
  )
  return sourceLinkStore
}
