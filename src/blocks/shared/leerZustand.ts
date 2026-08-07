// leerZustand — was dasteht, wenn nichts dasteht.
//
// EIN Stueck fuer alle Flaechen, die leer sein koennen (heute: Tabelle und
// Kanban-Spalte). Vorbild ist die eingecheckte Demo, Zeile fuer Zeile
// abgeschrieben: designsprache/musterbogen.html (Abschnitt „Leerzustaende")
// und die Klassen .leer / .leer--tafel in designsprache/atome.css.
//
// Die Haltung der Demo steht dort im Klartext: „ein Satz, eine Pfote, kein
// Ausrufezeichen. Leer ist kein Fehler." Deshalb gibt es hier auch kein
// zweites Aussehen fuer „schlimm leer" — nur die zwei Formen, die die Demo
// zeigt:
//   .leer         gestrichelter Rahmen (freie Flaeche, z. B. Kanban-Spalte)
//   .leer--tafel  ohne Rahmen (in einer Tafel — die traegt die Kante schon,
//                 ein zweiter Strich waere doppelt)
//
// Farben aus den Masken-Tokens; die Demo-Namen loesen 1:1 darauf auf
// (--linie -> --se-line, --espresso-mild -> --se-muted, --espresso-zart ->
// --se-faint, --rundung -> --se-r-md). Die Strukturmasse (Abstaende, 22px
// Zeichen, -12 Grad Drehung) bleiben Literale wie in der Demo.
//
// WANN er erscheint, entscheidet der Baustein — nicht diese Datei. Regel gilt
// nur fuer die MASKE: eine gebundene Quelle liefert 0 Zeilen. Im EDITOR bleibt
// die heutige Vorschau (Striche/Klarnamen) stehen, sonst naehme der
// Leerzustand dem Bauer sein Layout weg.

import { css, html, nothing, type TemplateResult } from 'lit'
import type { PropertyDescription } from '../../core/blocks/PropertyDescription'
import { pfoteIcon } from './pfote'

// Der Satz, wenn der Bauer keinen eigenen einstellt. Auch der Registry-
// Standard beider Bausteine — damit reist er NICHT als Attribut in den Export
// (Standardwert-Regel in exportMask).
export const LEER_TEXT_STANDARD = 'Keine Einträge.'

// Die Eigenschaft „Text wenn leer" fuer den Inspector. EINE Beschreibung fuer
// beide Bausteine: zwei Formulierungen fuer dieselbe Sache lesen sich wie zwei
// verschiedene Einstellungen.
export function leerTextProperty(): PropertyDescription {
  return {
    attributeName: 'leerText',
    name: 'Text wenn leer',
    description: 'Der Satz, den die Maske zeigt, wenn die Datenquelle keine Zeile liefert. Leer lassen: dann steht dort gar nichts.',
    kind: 'text',
    requiresDataSource: true,
  }
}

// Der Leerzustand als Markup. `tafel` = steht er INNERHALB eines Rahmens, der
// die Kante schon traegt (Tabelle)? Dann faellt der gestrichelte Rahmen weg.
//
// Leerer Text = der Bauer hat die Meldung abgeschaltet: dann gar nichts
// zeichnen. Eine Pfote ohne Satz waere ein Zeichen, das nichts sagt.
export function leerZustand(text: string, tafel = false): TemplateResult | typeof nothing {
  if (text.trim() === '') return nothing
  return html`<div class="leer${tafel ? ' leer--tafel' : ''}">
    ${pfoteIcon()}
    <span>${text}</span>
  </div>`
}

export const leerStil = css`
  .leer {
    display: grid;
    justify-items: center;
    gap: 7px;
    padding: 22px 14px 24px;
    border: var(--se-border) dashed var(--se-line);
    border-radius: var(--se-r-md);
    color: var(--se-muted);
    font-size: var(--se-fs);
    line-height: 1.4;
    text-align: center;
  }
  /* Das Zeichen leicht gekippt — es liegt da wie eine Spur, nicht wie ein
     Symbol in einem Formular. Die CSS-Farbe schlaegt das fill-Attribut der
     Pfote (Praesentationsattribute verlieren gegen jede Regel). */
  .leer svg {
    width: 22px;
    height: 22px;
    fill: var(--se-faint);
    transform: rotate(-12deg);
  }
  /* In der Tafel traegt der Rahmen schon die Kante — kein zweiter Strich. */
  .leer--tafel {
    border: none;
    padding: 44px 20px 48px;
  }
`
