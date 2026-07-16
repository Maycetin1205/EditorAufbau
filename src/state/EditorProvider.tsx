// EditorProvider (A2, Aufräum.md 2026-07-16)
// Trägt die EINE Editor-Instanz der App über React-Context — ersetzt die
// frühere Weltvariable (`export const editor`). Die Instanz entsteht genau
// einmal im App-Einstieg (src/app/providers.tsx); Komponenten holen sie
// ausschließlich über useEditor()/useEditorInstance() (EditorContext.ts).

import type { ReactNode } from 'react'
import type { Editor } from './Editor'
import { EditorContext } from './EditorContext'

interface EditorProviderProps {
  editor: Editor
  children: ReactNode
}

export function EditorProvider({ editor, children }: EditorProviderProps) {
  return <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>
}
