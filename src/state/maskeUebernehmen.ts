// maskeUebernehmen — DIE eine Stelle, die eine GEPRUEFTE Maskendatei in die
// laufende Sitzung uebernimmt.
//
// Zwei Aufrufer (A3, 2026-08-10): der Menue-Eintrag „Maske laden…" in der
// Toolbar und die Sperransicht, wenn der Bediener aus einem gesperrten Stand
// heraus eine gueltige Datei oeffnet. Vorher stand die Reihenfolge nur in der
// Toolbar; die Sperransicht haette sie abschreiben muessen — und eine
// Abschrift driftet.
//
// Die REIHENFOLGE ist Absicht: erst die zwei Bibliotheken, dann der Baum.
// `ersetzeMaske` leert den Verlauf und stoesst das Speichern an; liefe es
// zuerst, wuerde ein Stand mit neuem Baum und alten Bibliotheken gespeichert.
//
// Der Inhalt ist beim Auspacken VOLLSTAENDIG geprueft (packeMaskeAus) — hier
// wird nichts mehr bereinigt und nichts mehr entschieden.

import type { Editor } from './Editor'
import { dataSourceStore } from './DataSourceStore'
import type { MaskenInhalt } from './maskenDatei'
import { relationStore } from './RelationStore'

export function uebernehmeMaske(editor: Editor, inhalt: MaskenInhalt): void {
  dataSourceStore.ersetzeAlle(inhalt.datenquellen)
  relationStore.ersetzeAlle(inhalt.relationen)
  editor.ersetzeMaske(inhalt.tree)
}
