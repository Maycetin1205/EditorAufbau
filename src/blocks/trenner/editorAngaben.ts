// Editor-Angaben der Trennlinie — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).
//
// Seit 2026-08-11 (Nutzer-Wahl „J", Musterbogen 3) in der Fellnase-Machart:
// die Linie (Koralle, senkrecht) MIT dem, was sie trennt — zwei getoente
// Flaechen. Der Grundsatz bleibt von frueher: nie ein blankes Minus, und kein
// Chevron-Bild, das ein Ziehen verspricht, das es nicht gibt (bis 2026-08-07).
//
// Die Hinweiszeile ist weg. Sie sagte „Keine Einstellungen — die Linie fuellt
// die Breite von selbst", und beides stimmt seit der senkrechten Trennlinie
// nicht mehr: der Baustein hat jetzt die Einstellung Richtung, und senkrecht
// fuellt er die Hoehe. Ein Hinweis ist laut editorAngaben ohnehin nur fuer
// Panels gedacht, die sonst LEER aussehen — dieses hat nun einen Umschalter.

import { ZeichenTrenner } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { TrennerBlock } from './TrennerBlock'

ergaenzeEditorAngaben(TrennerBlock.blockType, {
  symbol: ZeichenTrenner,
})
