// Editor-Angaben der Zeile — Icon der Baustein-Bibliothek + Hinweiszeile im
// Inspector. Diese Datei laedt NUR der Editor, nie das Runtime-Buendel
// (Begruendung: editorAngaben in core/blocks).

// Drei Kaesten nebeneinander — das TUT die Zeile. StretchHorizontal (bis
// 2026-08-07) zeichnete einen Balken mit Pfeilen nach aussen und versprach
// damit eine Geste („ziehen, um zu strecken"), die es an der Zeile nicht gibt.
// Seit 2026-08-11 (Nutzer-Wahl „J", Musterbogen 3) in der Fellnase-Machart —
// weiter drei Faecher nebeneinander, eines getoent + Punkt.
import { ZeichenZeile } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { ZeileBlock } from './ZeileBlock'

ergaenzeEditorAngaben(ZeileBlock.blockType, {
  symbol: ZeichenZeile,
  hinweis: 'Keine Einstellungen — Bausteine ziehst du direkt in die Zeile.',
})
