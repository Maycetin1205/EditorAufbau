// useMeldungen
// React-Hook fuer die Meldungsspur — dasselbe Muster wie useDataSources:
// useSyncExternalStore bindet das Modul-Singleton an React, bei
// version-Aenderung rendert die nutzende Komponente neu.

import { useSyncExternalStore } from 'react'
import { meldungen } from './meldungen'

// Modulweit konstant, nicht je Render neu: eine wechselnde subscribe-Funktion
// laesst React das Abo bei JEDEM Render ab- und wieder anmelden.
const abonniere = (cb: () => void) => meldungen.subscribe(cb)
const standVon = () => meldungen.version

export function useMeldungen() {
  useSyncExternalStore(abonniere, standVon)
  return meldungen
}
