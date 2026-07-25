// tabelleStil — das Aussehen des Tabellen-Bausteins.
//
// Aus TabelleBlock herausgeloest (2026-07-25), weil die Datei mit der
// Suchzeile ueber den 500-Zeilen-Deckel wuchs (check:regeln). Der Schnitt
// ist der natuerliche: hier das AUSSEHEN, drueben das VERHALTEN.
//
// Farben ausschliesslich aus den Masken-Tokens (--se-*) — keine Hex-Werte,
// keine Fallbacks. Sonst kann die Tabelle im Export anders aussehen als im
// Editor, und genau das darf nie passieren (Regel 1, WYSIWYG).

import { css } from 'lit'

export const tabelleStil = css`
      :host { min-width: 0; height: 100%; }
      /* Der Takt der Tabelle: Zeilenhoehe = Schrift + Innenabstand + Linie.
         EINE Stelle, weil drei Dinge sie brauchen — die echten Zeilen, die
         weitergezeichneten Linien im leeren Rest und der Kopf. */
      .tabelle { --zeilen-hoehe: 29px; }
      .tabelle {
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 100%;
        background: var(--se-panel);
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-lg);
        overflow: hidden;
        font-family: var(--se-font);
        font-size: var(--se-fs);
        color: var(--se-ink);
      }
      /* Suchzeile ueber dem Kopf: gehoert zur Tabelle, nicht zur Maske
         drumherum — deshalb sitzt sie INNERHALB des Rahmens. */
      .suchzeile {
        padding: 5px 8px;
        border-bottom: 1px solid var(--se-line);
        background: var(--se-panel-2);
      }
      .suchzeile input {
        box-sizing: border-box;
        width: 100%;
        height: 24px;
        padding: 0 8px;
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        color: var(--se-ink);
        background: var(--se-panel);
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-sm);
      }
      .suchzeile input:focus {
        outline: none;
        border-color: var(--se-accent);
      }
      .kopf,
      .zeile { display: grid; }
      .kopf {
        background: var(--se-panel-2);
        border-bottom: 1px solid var(--se-line);
        font-size: var(--se-fs-sm);
        font-weight: 600;
      }
      /* Der Rumpf fuellt die Bausteinhoehe. Bleibt unter den Zeilen Platz
         (die Tabelle ist im Raster hoeher als ihre Zeilen brauchen), lief
         dort vorher eine leere weisse Flaeche — sah aus wie ein Fehler.
         Jetzt zeichnet ein sich wiederholender Verlauf die Zeilenlinien
         einfach weiter, im selben Takt wie echte Zeilen. Kein Inhalt wird
         erfunden (Regel 7), nur das Lineal laeuft durch. */
      .koerper {
        flex: 1 1 auto;
        overflow: auto;
        background-image: repeating-linear-gradient(
          to bottom,
          transparent 0,
          transparent calc(var(--zeilen-hoehe) - 1px),
          var(--se-line-soft) calc(var(--zeilen-hoehe) - 1px),
          var(--se-line-soft) var(--zeilen-hoehe)
        );
        background-position: 0 0;
      }
      .zeile {
        border-bottom: 1px solid var(--se-line-soft);
        /* Muss zum Takt des Verlaufs oben passen, sonst versetzen sich
           echte Zeilen und weitergezeichnete Linien. */
        min-height: var(--zeilen-hoehe);
        box-sizing: border-box;
        align-items: center;
      }
      /* Echte Zeilen decken den Verlauf ab -> keine doppelte Linie. */
      .zeile { background: var(--se-panel); }
      .kopf > div,
      .zeile > div {
        padding: 6px 10px;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        border-right: 1px solid var(--se-line-soft);
      }
      .kopf > div:last-child,
      .zeile > div:last-child { border-right: none; }
      .kopf > div { cursor: pointer; user-select: none; }
      .sort-pfeil { font-size: 9px; color: var(--se-muted); }
      .zeile > div { color: var(--se-muted); }
      .fusszeile {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 4px 10px;
        border-top: 1px solid var(--se-line);
        font-size: var(--se-fs-sm);
        color: var(--se-muted);
        background: var(--se-panel-2);
      }
      .seiten-nav {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .seiten-nav select,
      .seiten-nav button {
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        padding: 2px 6px;
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
        color: var(--se-ink);
        cursor: pointer;
      }
      .seiten-nav button:disabled {
        opacity: 0.3;
        cursor: default;
      }
      /* Editor-only Spalten-Steuerung — NUR auf der Maskenfläche, nie im Export. */
      .steuerung { display: none; }
      :host([data-ff-editor]) .steuerung {
        position: absolute;
        top: 3px;
        right: 3px;
        z-index: 2;
        display: inline-flex;
        gap: 4px;
      }
      .steuerung button {
        font-family: var(--se-font);
        font-size: var(--se-fs-sm);
        line-height: 1;
        padding: 3px 7px;
        border: 1px solid var(--se-line);
        border-radius: var(--se-r-sm);
        background: var(--se-panel);
        color: var(--se-muted);
        cursor: pointer;
      }
      .steuerung button:hover {
        border-color: var(--se-accent);
        color: var(--se-accent);
      }
`
