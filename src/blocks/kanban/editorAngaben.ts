// Editor-Angaben des Kanbans und seiner Spalte — Icons der Baustein-
// Bibliothek. Beide in EINER Datei, weil beide Bausteine in diesem Ordner
// wohnen. Diese Datei laedt NUR der Editor, nie das Runtime-Buendel
// (Begruendung: editorAngaben in core/blocks).
//
// Die Spalte erscheint nicht in der Bibliothek (showInPalette false — sie
// entsteht nur ueber das Board); ihr Icon steht trotzdem hier, damit sie
// ueberall dort ein Gesicht hat, wo der Editor Bausteine auflistet.

// Seit 2026-08-11 (Nutzer-Wahl „J", Musterbogen 3) in der Fellnase-Machart:
// das Board als drei Bahnen mit Karten (eine Karte Koralle als Blickfang),
// die Spalte als EINE Bahn mit Kartenstapel — dasselbe Vokabular, nur allein.
import { ZeichenKanban, ZeichenKanbanSpalte } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { KanbanBlock } from './KanbanBlock'
import { KanbanSpalteBlock } from './KanbanSpalteBlock'

ergaenzeEditorAngaben(KanbanBlock.blockType, {
  symbol: ZeichenKanban,
})

ergaenzeEditorAngaben(KanbanSpalteBlock.blockType, {
  symbol: ZeichenKanbanSpalte,
})
