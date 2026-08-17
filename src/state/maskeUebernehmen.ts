import type { Editor } from './Editor'
import { dataSourceStore } from './DataSourceStore'
import type { MaskenInhalt } from './maskenDatei'
import { relationStore } from './RelationStore'

export function uebernehmeMaske(editor: Editor, inhalt: MaskenInhalt): void {
  dataSourceStore.ersetzeAlle(inhalt.datenquellen)
  relationStore.ersetzeAlle(inhalt.relationen)
  editor.ersetzeMaske(inhalt.tree)
}
