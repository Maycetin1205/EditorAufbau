import { css } from 'lit'

// Die Erfassungszeile sitzt unter den Daten und traegt dieselbe Grid-Form wie
// eine Datenzeile (.zeile); eigen ist nur, dass sie EINGABEN enthaelt und
// dass die Vorschlagsliste aus ihr herausragen darf.
export const erfassungStil = css`
      .zeile.erfassung {
        flex: none;
        background: var(--se-panel-2);
        border-bottom: var(--se-border) solid var(--se-line);
      }

      /* Der Zeilengriff traegt keine Eingabe: er behaelt die Polster der
         Nummernspalte, nicht die der Erfassungszellen. */
      .zeile.erfassung > div.griff { padding: 0; }

      /* Die Liste haengt aus der Zelle heraus; ohne sichtbaren Ueberlauf
         schnitte die Zelle sie ab. Gilt fuer jede Zelle, weil jede gebundene
         Spalte eine Liste zeigen kann. */
      .zeile.erfassung > div {
        padding: 0 4px;
        display: flex;
        align-items: center;
        overflow: visible;
      }

      .erf-halter {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        min-width: 0;
      }

      .erf-halter.nach-oben .vorschlaege {
        top: auto;
        bottom: 100%;
        margin: 0 0 2px;
      }

      .erf-eingabe {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        height: calc(var(--zeilen-hoehe) - 8px);
        padding: 0 6px;
        font-family: var(--se-font);
        font-size: var(--se-fs);
        color: var(--se-ink);
        background: var(--se-panel);
        border: var(--se-border) solid var(--se-line);
        border-radius: var(--se-r-sm);
      }
      .erf-eingabe:focus {
        outline: none;
        border-color: var(--se-accent);
      }
      .erf-eingabe::placeholder { color: var(--se-faint); }

      /* Im Editor zeigt die Zelle keine Eingabe, sondern Striche. */
      :host([data-ff-editor]) .zeile.erfassung > div { color: var(--se-muted); }

      /* Eine tippbare Zeile MIT INHALT ist eine werdende Position: links
         markiert — erst der Knopf macht daraus einen echten ERP-Satz. Bis
         2026-08-20 war das eine eigene, tote Zeilenart (.erfasst); jetzt ist
         es dieselbe Zeile, nur gefuellt (S2.7). */
      .zeile.erfassung.gefuellt {
        box-shadow: inset 3px 0 0 var(--se-accent);
      }

      /* Die Zeile, in der gerade gearbeitet wird — sie ist gemeint, wenn ein
         Zeilen-Werkzeug drueckt. */
      .zeile.erfassung.aktiv {
        background: var(--se-accent-soft);
      }
`
