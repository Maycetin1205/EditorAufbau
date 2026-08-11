// Editor-Angaben der Karte — Icon der Baustein-Bibliothek + Hinweiszeile im
// Inspector. Diese Datei laedt NUR der Editor, nie das Runtime-Buendel
// (Begruendung: editorAngaben in core/blocks).

// Seit 2026-08-11 (Nutzer-Wahl „J", Musterbogen 3) in der Fellnase-Machart:
// die Karte mit ihrer Lasche oben und der Fusszeile — also das, was der
// Baustein wirklich zeichnet. Vorgeschichte: CreditCard (bis 2026-08-07) war
// ein Wortwitz auf das deutsche „Karte", danach stand StickyNote.
import { ZeichenKarte } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { CardBlock } from './CardBlock'

ergaenzeEditorAngaben(CardBlock.blockType, {
  symbol: ZeichenKarte,
  hinweis: 'Alle Inhalte bearbeitest du direkt auf der Karte — Doppelklick auf die Stelle.',
})
