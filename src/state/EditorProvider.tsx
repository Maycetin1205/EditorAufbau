// EditorProvider (U5)
// Besitzt die EINE Editor-Instanz der App und stellt sie über den
// EditorContext bereit. Eigene Datei (nur Komponente), damit Fast Refresh
// greift — Context + Hooks liegen in EditorContext.ts.

import { useState, type ReactNode } from 'react'
import { Editor } from './Editor'
import { EditorContext } from './EditorContext'

interface EditorProviderProps {
  // Vorgefertigte Instanz (z. B. für Tests); ohne Angabe erzeugt der
  // Provider genau eine und behält sie über die Lebenszeit der App.
  editor?: Editor
  children: ReactNode
}

export function EditorProvider({ editor: given, children }: EditorProviderProps) {
  const [instance] = useState(() => given ?? new Editor())
  return <EditorContext.Provider value={instance}>{children}</EditorContext.Provider>
}
