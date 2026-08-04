// Editor-Angaben der Karte — Icon der Baustein-Bibliothek + Hinweiszeile im
// Inspector. Diese Datei laedt NUR der Editor, nie das Runtime-Buendel
// (Begruendung: editorAngaben in core/blocks).

import { CreditCard } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { CardBlock } from './CardBlock'

ergaenzeEditorAngaben(CardBlock.blockType, {
  symbol: CreditCard,
  hinweis: 'Alle Inhalte bearbeitest du direkt auf der Karte — Doppelklick auf die Stelle.',
})
