// Einstieg der neuen Editor-App: Provider laden, dann die Editor-Shell anzeigen.
import { AppProviders } from './providers'
import { EditorShell } from '../editor/shell/EditorShell'

export default function App() {
  return (
    <AppProviders>
      <EditorShell />
    </AppProviders>
  )
}
