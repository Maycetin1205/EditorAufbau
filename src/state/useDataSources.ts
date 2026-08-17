import { useSyncExternalStore } from 'react'
import { dataSourceStore } from './DataSourceStore'

const abonniere = (cb: () => void) => dataSourceStore.subscribe(cb)
const standVon = () => dataSourceStore.version

export function useDataSources() {
  useSyncExternalStore(abonniere, standVon)
  return dataSourceStore
}
