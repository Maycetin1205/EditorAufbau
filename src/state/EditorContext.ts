// EditorContext (U5)
// Der Editor-Store wandert vom globalen Singleton in einen React-Context:
// die App (Providers → EditorProvider) besitzt GENAU EINE Instanz,
// Komponenten holen sie über die Hooks. Tests bauen sich ihre eigene
// Instanz (new Editor()) — nichts hängt mehr an einem Modul-Singleton.

import { createContext, useContext } from 'react'
import type { Editor } from './Editor'

export const EditorContext = createContext<Editor | null>(null)

// Instanz aus dem Context — OHNE Abo, löst also selbst kein Re-Render aus.
// Für Ereignis-Handler und Ableitungen im Render reicht das (BlockHost:
// die Canvas abonniert den Store und rendert die Hosts mit). Wer selbst
// bei jeder Store-Änderung neu rendern will, nimmt useEditor.
export function useEditorInstance(): Editor {
  const editor = useContext(EditorContext)
  if (!editor) {
    throw new Error('useEditorInstance: kein <EditorProvider> über dieser Komponente.')
  }
  return editor
}
