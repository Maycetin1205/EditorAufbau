// Editor-Angaben der Trennlinie — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).
//
// Rows2 zeigt die Linie MIT dem, was sie trennt — der gueltige Teil der alten
// Begruendung (ein blankes `Minus` ist das Rechenzeichen und sieht neben den
// anderen Symbolen nach nichts aus). Bis 2026-08-07 stand hier
// SeparatorHorizontal: dasselbe Bild, aber mit Chevrons ueber und unter der
// Linie — das ist das uebliche Zeichen fuer „hier ziehen, um zu verschieben".
// Die Trennlinie kann man nicht ziehen, also versprach das Symbol etwas.
//
// Die Hinweiszeile ist weg. Sie sagte „Keine Einstellungen — die Linie fuellt
// die Breite von selbst", und beides stimmt seit der senkrechten Trennlinie
// nicht mehr: der Baustein hat jetzt die Einstellung Richtung, und senkrecht
// fuellt er die Hoehe. Ein Hinweis ist laut editorAngaben ohnehin nur fuer
// Panels gedacht, die sonst LEER aussehen — dieses hat nun einen Umschalter.

import { Rows2 } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { TrennerBlock } from './TrennerBlock'

ergaenzeEditorAngaben(TrennerBlock.blockType, {
  symbol: Rows2,
})
