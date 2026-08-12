// maskeUebernehmen — DIE eine Stelle, die eine GEPRUEFTE Maskendatei in die
// laufende Sitzung uebernimmt.
//
// Herausgeloest, als die Sperransicht (A3) ein zweiter Aufrufer war; die ist
// seit 2026-08-12 restlos entfernt (Nutzer-Ansage), uebrig ist der
// Menue-Eintrag „Maske laden…" in der Toolbar. Die Stelle bleibt, weil die
// Reihenfolge unten ein eigener Vertrag ist, kein Toolbar-Detail.
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
