// Editor-Angaben des Datumsfelds — Icon der Baustein-Bibliothek + Hinweiszeile
// im Inspector. Diese Datei laedt NUR der Editor, nie das Runtime-Buendel
// (Begruendung: editorAngaben in core/blocks).

// Der schlichte Kalender. CalendarDays (bis 2026-08-07) hatte sechs Tagespunkte
// im Blatt — bei 16px ein grauer Fleck, der nur unruhig wirkte.
// Seit 2026-08-11 (Nutzer-Wahl „J", Musterbogen 3) in der Fellnase-Machart —
// weiter der schlichte Kalender, jetzt mit EINEM markierten Tag als Akzent.
import { ZeichenDatum } from '../../ui/bausteinZeichen'
import { ergaenzeEditorAngaben } from '../../core/blocks/editorAngaben'
import { DatumBlock } from './DatumBlock'

ergaenzeEditorAngaben(DatumBlock.blockType, {
  symbol: ZeichenDatum,
  // Das Panel waere sonst wortlos leer: der Tageswaehler fuehrt bewusst KEINE
  // Eigenschaft (DatumBlock, Nutzer-Entscheidung 2026-07-27). Der Satz sagt,
  // wo die Sache stattdessen eingestellt wird — die Filterung haengt an
  // Tabelle und Kanban („Tag filtern nach"), nicht hier.
  hinweis: 'Keine Einstellungen — der Tag wird am Baustein gewählt; wer ihm folgt, stellst du an Tabelle und Kanban ein.',
})
