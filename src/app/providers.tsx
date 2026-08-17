import { useEffect, useState, type ReactNode } from 'react'
import { dataSourceStore } from '../state/DataSourceStore'
import { Editor } from '../state/Editor'
import { EditorProvider } from '../state/EditorProvider'
import { relationStore } from '../state/RelationStore'
import { Fehlergrenze } from './Fehlergrenze'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [editor] = useState(() => new Editor())

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

  return (
    <EditorProvider editor={editor}>
      <Fehlergrenze>
        {children}
      </Fehlergrenze>
    </EditorProvider>
  )
}
