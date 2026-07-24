// Providers — App-weite Versorger.
// HIER entsteht die eine Editor-Instanz der App
// und wird über den EditorProvider bereitgestellt — es gibt keine
// Weltvariable mehr. (Tests bauen sich ihre Instanzen weiterhin selbst
// mit `new Editor()`.)

import { useState, type ReactNode } from 'react'
import { Editor } from '../state/Editor'
import { EditorProvider } from '../state/EditorProvider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Lazy-Init: genau EINE Instanz für die Lebenszeit der App.
  const [editor] = useState(() => new Editor())
  return <EditorProvider editor={editor}>{children}</EditorProvider>
}
