// Editor-Angaben der Zeile — Icon der Baustein-Bibliothek + Hinweiszeile im
// Inspector. Diese Datei laedt NUR der Editor, nie das Runtime-Buendel
// (Begruendung: editorAngaben in core/blocks).

import { StretchHorizontal } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { ZeileBlock } from './ZeileBlock'

ergaenzeEditorAngaben(ZeileBlock.blockType, {
  symbol: StretchHorizontal,
  hinweis: 'Keine Einstellungen — Bausteine ziehst du direkt in die Zeile.',
})
