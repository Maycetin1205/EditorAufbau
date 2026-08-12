// registerEditorAngaben
// Zentrale Side-Effect-Imports der Editor-Angaben aller Bausteine (Icon der
// Bibliothek, Hinweiszeile im Inspector). Gegenstueck zu register.ts — nur mit
// EINEM entscheidenden Unterschied: register.ts laedt auch das Runtime-Buendel
// (runtime-entry.ts), DIESE Datei laedt ausschliesslich der Editor.
//
// Genau darin liegt ihr Sinn: alles, was das Buendel erreicht, steht Byte fuer
// Byte in jeder exportierten SoftEngine-Maske. Ein Bibliotheks-Icon und ein
// Bediener-Hinweis haben dort nichts zu suchen, und die Symbol-Datei (ui/zeichen)
// gehoert ohnehin nie hinein. Ausfuehrliche Begruendung: core/blocks/editorAngaben.
//
// Bausteine zuerst, Angaben danach — die Reihenfolge ist zwar egal (beide
// Ablagen stehen unabhaengig voneinander), aber so liest sich, was hier
// passiert: ein registrierter Baustein bekommt sein Editor-Gesicht dazu.
//
// Neuer Baustein = neue Zeile hier. Fehlt sie, zeigt die Bibliothek das
// neutrale Ersatz-Icon; der Editor bleibt bedienbar.

import './register'

import './ansicht/editorAngaben'
import './button/editorAngaben'
import './card/editorAngaben'
import './datum/editorAngaben'
import './formfeld/editorAngaben'
import './kanban/editorAngaben'
import './navi/editorAngaben'
import './popup/editorAngaben'
import './tabelle/editorAngaben'
import './text/editorAngaben'
import './trenner/editorAngaben'
import './zeile/editorAngaben'
