// register
// Zentrale Side-Effect-Imports aller Built-in-Block-Typen.
// Jeder Import triggert HMR-geschuetztes customElements.define + registerBlockType.
// Wer Blocks benutzt, importiert diese eine Datei.
//
// Kahlschlag 2026-07-14 (Nutzer-Entscheidung): Text, Bereich (Container),
// Infobox, Status-Chip (Badge) und Eingabefeld (FormField) sind KOMPLETT
// entfernt — sie hatten fuer das Ziel (Empfang-Board in SoftEngine) keine
// Funktion. Es bleibt, was funktioniert: Kanban (+ Spalte/Karte) und
// Schaltflaeche. Neue Bausteine erst, wenn eine echte Maske sie erzwingt.

import './button/ButtonBlock'
import './card/CardBlock'
import './kanban/KanbanBlock'
import './kanban/KanbanSpalteBlock'
