import { useSyncExternalStore } from 'react'
import { relationStore } from './RelationStore'

const abonniere = (cb: () => void) => relationStore.subscribe(cb)
const standVon = () => relationStore.version

export function useRelations() {
  useSyncExternalStore(abonniere, standVon)
  return relationStore
}
