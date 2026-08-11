// Editor-Angaben der Tabelle — Icon der Baustein-Bibliothek.
// Diese Datei laedt NUR der Editor, nie das Runtime-Buendel (Begruendung:
// editorAngaben in core/blocks).

// Seit 2026-08-11 (Nutzer-Wahl „J", Musterbogen 3) in der Fellnase-Machart —
// dasselbe richtige Motiv (Raster mit abgesetzter Kopfzeile), jetzt mit
// getoentem Kopf und Punkt-Akzent statt als blanker Strich.
import { ZeichenTabelle } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { TabelleBlock } from './TabelleBlock'

ergaenzeEditorAngaben(TabelleBlock.blockType, {
  symbol: ZeichenTabelle,
})
