// Providers
// Sammelstelle der App-weiten React-Provider. Seit U5 besitzt sie die EINE
// Editor-Instanz (EditorProvider) — es gibt kein Modul-Singleton mehr.

import type { ReactNode } from 'react'
import { EditorProvider } from '../state/EditorProvider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return <EditorProvider>{children}</EditorProvider>
}
