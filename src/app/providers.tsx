// Providers — App-weite Versorger.
// HIER entsteht die eine Editor-Instanz der App
// und wird über den EditorProvider bereitgestellt — es gibt keine
// Weltvariable mehr. (Tests bauen sich ihre Instanzen weiterhin selbst
// mit `new Editor()`.)

import { useEffect, useState, type ReactNode } from 'react'
import { dataSourceStore } from '../state/DataSourceStore'
import { Editor } from '../state/Editor'
import { EditorProvider } from '../state/EditorProvider'
import { relationStore } from '../state/RelationStore'
import { speicherGate } from '../state/speicherGate'
import { Fehlergrenze } from './Fehlergrenze'
import { Sperransicht } from './Sperransicht'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Lazy-Init: genau EINE Instanz für die Lebenszeit der App.
  const [editor] = useState(() => new Editor())
  // Stand unter Quarantaene (A3)? Der Editor hat ihn beim Bauen geprueft und
  // NICHT hydriert; der Riegel steht. Gefragt wird genau EINMAL, direkt nach
  // dem Bauen — spaeteres Sperren gibt es nicht (nur der Browserstart sperrt),
  // und ein Zustand hier laesst die Ansicht sauber verschwinden, sobald der
  // Bediener einen der drei Wege gegangen ist.
  const [quarantaene, setQuarantaene] = useState(() => speicherGate.quarantaene)

  // Alle drei Speicher schreiben entprellt (500 ms). Waehrend einer
  // durchgehenden Arbeitsserie meldet jeder Schritt schneller als das —
  // geschrieben wurde dann bis 2026-08-06 GAR NICHT, und wer das Fenster direkt
  // nach dem Tippen schloss, verlor still alles seit der letzten Ruhepause.
  // Hier ist die letzte Gelegenheit, das noch zu retten: `pagehide` (das
  // zuverlaessige Gegenstueck zu unload) und „Seite verborgen" (Tab-Wechsel,
  // Minimieren, auf dem Handy das Weglegen — dort kommt pagehide teils nie).
  // Bewusst KEIN beforeunload: das ist der Weg zum „Wirklich verlassen?"-Dialog,
  // und niemand hat einen angefordert. Steht nichts aus, tun die Aufrufe
  // nichts — ein Tab-Wechsel kostet also keinen Speicherlauf.
  useEffect(() => {
    const rette = (): void => {
      editor.speichereJetzt()
      dataSourceStore.speichereJetzt()
      relationStore.speichereJetzt()
    }
    const beiVerborgen = (): void => {
      if (document.visibilityState === 'hidden') rette()
    }
    window.addEventListener('pagehide', rette)
    document.addEventListener('visibilitychange', beiVerborgen)
    return () => {
      window.removeEventListener('pagehide', rette)
      document.removeEventListener('visibilitychange', beiVerborgen)
    }
  }, [editor])

  // Ein gesperrter Stand ersetzt den Editor, statt neben ihm zu stehen: ein
  // Editor, der jede Aenderung annimmt und nie speichert, waere die
  // schlimmere Falle (A3).
  return (
    <EditorProvider editor={editor}>
      <Fehlergrenze>
        {quarantaene
          ? (
            <Sperransicht
              quarantaene={quarantaene}
              editor={editor}
              onWeiter={() => setQuarantaene(null)}
            />
            )
          : children}
      </Fehlergrenze>
    </EditorProvider>
  )
}
