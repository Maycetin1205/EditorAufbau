// register
// Zentrale Side-Effect-Imports aller Built-in-Block-Typen.
// Jeder Import triggert HMR-geschütztes customElements.define + registerBlockType.
// Wer Blocks benutzt, importiert diese eine Datei.
//
// Neue Bausteine erst, wenn eine echte Maske sie erzwingt (Regel 10).
// Warum es genau diese Bausteine sind (Kahlschlag der Anfangs-Bausteine,
// Formularfeld-Neubau): docs/decisions/2026-07-14-kahlschlag-bausteine.md.

import './button/ButtonBlock'
import './card/CardBlock'
import './datum/DatumBlock'
import './formfeld/FormFeldBlock'
import './kanban/KanbanBlock'
import './kanban/KanbanSpalteBlock'
import './popup/PopupBlock'
import './tabelle/TabelleBlock'
import './text/TextBlock'
import './trenner/TrennerBlock'
import './zeile/ZeileBlock'
