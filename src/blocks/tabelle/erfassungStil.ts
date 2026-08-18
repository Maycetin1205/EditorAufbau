import { css } from 'lit'

// Die Erfassungszeile sitzt unter den Daten und traegt dieselbe Grid-Form wie
// eine Datenzeile (.zeile); eigen ist nur, dass sie EINGABEN enthaelt und
// dass die Vorschlagsliste aus ihr herausragen darf.
export const erfassungStil = css`
      .zeile.erfassung {
        flex: none;
        background: var(--se-panel-2);
        border-top: var(--se-border) solid var(--se-line);
      }

      .zeile.erfassung > div {
        padding: 0 4px;
        display: flex;
        align-items: center;
      }

      /* Die Liste haengt nach OBEN aus der Zelle heraus (die Zeile steht
         unten); ohne sichtbaren Ueberlauf schnitte die Zelle sie ab. */
      .zeile.erfassung > div.erf-nachschlagen { overflow: visible; }

      .erf-nachschlag {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
        min-width: 0;
      }

      .erf-nachschlag.nach-oben .vorschlaege {
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

      .erf-nachschlag .erf-eingabe { padding-right: 26px; }

      .erf-nachschlag .lupe {
        position: absolute;
        right: 2px;
        display: grid;
        place-items: center;
        width: 22px;
        height: calc(var(--zeilen-hoehe) - 10px);
        padding: 0;
        border: none;
        border-radius: var(--se-r-sm);
        background: transparent;
        color: var(--se-muted);
        cursor: pointer;
      }
      .erf-nachschlag .lupe:hover { background: var(--se-accent-soft); color: var(--se-ink); }
      .erf-nachschlag .lupe:focus-visible { outline: 2px solid var(--se-accent); outline-offset: -2px; }

      /* Im Editor zeigt die Zelle keine Eingabe, sondern was sie WIRD:
         Striche, die Vorbelegung oder die Lupe. */
      .zeile.erfassung > div.erf-frei,
      .zeile.erfassung > div.erf-folgt,
      .zeile.erfassung > div.erf-nachschlagen { color: var(--se-muted); }

      :host([data-ff-editor]) .zeile.erfassung > div { cursor: pointer; }

      .erf-lupe-zeichen {
        display: inline-grid;
        place-items: center;
        margin-left: auto;
        color: var(--se-muted);
      }
      .erf-strich { color: var(--se-muted); }
`
