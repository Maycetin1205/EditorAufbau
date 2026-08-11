// Editor-Angaben des Textes — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).

// Seit 2026-08-11 (Nutzer-Wahl „J", Musterbogen 3) in der Fellnase-Machart:
// Ueberschrift (Koralle-Balken) ueber zwei Zeilen. Loest den Buchstaben `Type`
// ab (2026-08-07 bis heute); die aeltere Sorge „mehrere Zeilen lesen sich als
// Fliesstext" wiegt weniger als die eine Bildsprache aller zehn Symbole —
// Nutzer-Urteil am Bogen, nicht meine Abwaegung.
import { ZeichenText } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { TextBlock } from './TextBlock'

ergaenzeEditorAngaben(TextBlock.blockType, {
  symbol: ZeichenText,
})
