// Editor-Angaben der Trennlinie — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).
//
// SeparatorHorizontal statt Minus: `Minus` ist das Rechenzeichen — ein Strich
// ohne Umgebung, der neben `Text` und `StretchHorizontal` nach nichts aussah.
// SeparatorHorizontal zeigt die Linie MIT dem, was sie trennt.
//
// Die Hinweiszeile ist weg. Sie sagte „Keine Einstellungen — die Linie fuellt
// die Breite von selbst", und beides stimmt seit der senkrechten Trennlinie
// nicht mehr: der Baustein hat jetzt die Einstellung Richtung, und senkrecht
// fuellt er die Hoehe. Ein Hinweis ist laut editorAngaben ohnehin nur fuer
// Panels gedacht, die sonst LEER aussehen — dieses hat nun einen Umschalter.

import { SeparatorHorizontal } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { TrennerBlock } from './TrennerBlock'

ergaenzeEditorAngaben(TrennerBlock.blockType, {
  symbol: SeparatorHorizontal,
})
