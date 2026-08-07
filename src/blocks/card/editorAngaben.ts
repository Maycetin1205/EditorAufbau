// Editor-Angaben der Karte — Icon der Baustein-Bibliothek + Hinweiszeile im
// Inspector. Diese Datei laedt NUR der Editor, nie das Runtime-Buendel
// (Begruendung: editorAngaben in core/blocks).

// Die gekappte Ecke ist die Signatur der Designsprache (masken-tokens, Regel 5)
// und sitzt an der echten Karte oben links, wo die Lasche ansetzt — StickyNote
// zeichnet genau das. CreditCard (bis 2026-08-07) war ein Wortwitz auf das
// deutsche „Karte": eine Zahlkarte mit Magnetstreifen hat mit einer
// Karteikarte nichts zu tun.
import { StickyNote } from 'lucide-react'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { CardBlock } from './CardBlock'

ergaenzeEditorAngaben(CardBlock.blockType, {
  symbol: StickyNote,
  hinweis: 'Alle Inhalte bearbeitest du direkt auf der Karte — Doppelklick auf die Stelle.',
})
