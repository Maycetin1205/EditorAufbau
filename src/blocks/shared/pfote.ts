// pfote — das EINE gezeichnete Zeichen der Designsprache.
//
// Herausgeloest aus ./tierIcon (2026-08-07), weil es einen zweiten Benutzer
// gibt: der Leerzustand (./leerZustand) traegt dieselbe Pfote wie der
// Tierart-Rueckfall der Karte. Zwei Pfoten waeren zwei Zeichnungen, die
// auseinanderlaufen koennen — die Demo hat genau EINE (designsprache/
// musterbogen.html, <symbol id="pfote">, benutzt vom Trenner, vom Rueckfall
// und vom Leerzustand).
//
// Einfarbig in currentColor: das Zeichen nimmt die Farbe seiner Umgebung an.
// Das fill-ATTRIBUT ist bewusst nur ein Attribut — jede CSS-Regel schlaegt es
// (der Leerzustand faerbt die Pfote darueber auf --se-faint).

import { html, svg, type TemplateResult } from 'lit'

// Der reine Pfad-Inhalt (vier Ballen + Sohle) ohne <svg>-Huelle: wer eine
// eigene Huelle braucht (andere viewBox, andere Attribute), nimmt diesen.
export const PFOTE = svg`<circle cx="6.8" cy="9.6" r="1.9"></circle><circle cx="10.4" cy="7.2" r="1.9"></circle><circle cx="14.6" cy="7.2" r="1.9"></circle><circle cx="18.2" cy="9.6" r="1.9"></circle><path d="M12.5 11.2c-2.9 0-5.3 2.1-5.3 4.4 0 1.7 1.3 2.9 3.1 2.9.9 0 1.5-.3 2.2-.3s1.3.3 2.2.3c1.8 0 3.1-1.2 3.1-2.9 0-2.3-2.4-4.4-5.3-4.4z"></path>`

// Die fertige Pfote als Bild. Groesse und Farbe bestimmt der Aufrufer per CSS.
export function pfoteIcon(): TemplateResult {
  return html`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${PFOTE}</svg>`
}
