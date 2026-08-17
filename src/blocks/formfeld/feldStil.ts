// feldStil — die Optik des Formularfelds.
//
// Aus FormFeldBlock.ts herausgezogen (2026-08-05), als das Nachschlagen die
// Datei ueber den 500-Zeilen-Deckel schob. Derselbe Schnitt wie bei der
// Tabelle (tabelle/tabelleStil.ts): Aussehen hierhin, Verhalten drueben.
//
// Aussehen ausschliesslich aus Masken-Tokens (--se-*) — keine Hex-Werte,
// keine hsl()-Literale (der Regel-Waechter prueft das). Strukturelle
// Groessen bleiben Literale, wie in jedem Baustein.

import { css } from 'lit'

export const feldStil = css`
  .feld {
    font-family: var(--se-font);
    /* Innenabstände EINMAL definiert — .ctrl und .ph leiten sich beide
       daraus ab, damit der Platzhalter exakt an der Textposition sitzt.
       (N1: keine Magic Numbers, die beim Padding-Ändern auseinanderlaufen.) */
    --feld-pad-y: 7px;
    --feld-pad-x: 10px;
    --feld-rand: var(--se-border);
  }
  /* Anker für den im Feld sitzenden Platzhalter. */
  .huelle { position: relative; }
  /* .ctrl exakt nach Referenz-Optik: Rahmen, Panel-Flaeche, kantiger
     Radius; Fokus = Hausfarbe als Rahmen + ein zweiter
     Strich derselben Staerke (Fellnase ist flach: kein Leuchten). */
  .ctrl {
    box-sizing: border-box;
    width: 100%;
    padding: var(--feld-pad-y) var(--feld-pad-x);
    border: var(--feld-rand) solid var(--se-line);
    background: var(--se-panel);
    border-radius: var(--se-r-md);
    font-family: var(--se-font);
    font-size: var(--se-fs);
    /* Zeilenhoehe wie in der Demo (.feld 1.4) und AUSDRUECKLICH hier, nicht
       geerbt: bei Eingabefeldern bringt der Browser eine eigene mit, die einen
       geerbten Wert schlaegt. Am 2026-08-07 wurde an dieser Stelle eine
       Zeilenhoehe von 1.5 entfernt mit der Begruendung, der lange Text nehme
       nun die Zeilenhoehe der Maske — das tat er nicht, er fiel auf den
       Browserwert zurueck. Der Platzhalter darunter (.ph) ist dagegen ein
       normaler Kasten und ERBTE die 1.55 der Maske: dadurch sass der
       Platzhaltertext rund 2px tiefer als der getippte Text im selben Feld.
       Ein Wert an beiden Stellen beendet das. */
    line-height: 1.4;
    color: var(--se-ink);
  }
  .ctrl:focus {
    outline: none;
    border-color: var(--se-accent);
    box-shadow: 0 0 0 var(--se-border) var(--se-accent);
  }
  textarea.ctrl {
    display: block;
    resize: vertical;
    min-height: 64px;
  }
  select.ctrl { padding: calc(var(--feld-pad-y) - 1px) calc(var(--feld-pad-x) - 2px); }
  /* Der Platzhalter sitzt IM Feld (an der Textposition des .ctrl:
     1px Rahmen + 7px/10px Innenabstand), faengt keine Klicks der
     Maske ab und verschwindet, sobald das Feld Inhalt hat.
     Zeilenhoehe = die des Feldes (.ctrl 1.4): Innenabstand allein reicht
     nicht, um zwei Texte zur Deckung zu bringen — die Zeilenhoehe bestimmt
     mit, wo die Schrift in ihrer Zeile liegt. */
  .ph {
    position: absolute;
    top: calc(var(--feld-pad-y) + var(--feld-rand));
    left: calc(var(--feld-pad-x) + var(--feld-rand));
    right: calc(var(--feld-pad-x) + var(--feld-rand));
    color: var(--se-faint);
    font-size: var(--se-fs);
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  }
  .ph[hidden] { display: none; }
  /* Der Platzhalter eines GEBUNDENEN Felds braucht hier keine Sonderregel:
     im Export steht dort bereits der Feld-Klarname ("Tiername"), derselbe
     Text, den der Editor an der Stelle zeigt (exportMask/bindungsVorschau).
     Er verschwindet wie jeder Platzhalter, sobald ein Wert da ist.
     Bis 2026-08-06 versteckte an dieser Stelle eine Regel den Platzhalter
     gebundener Felder in der Maske ganz. Grund war, dass die Maske damals
     den GETIPPTEN Text zeigte: der Bediener las in SoftEngine ploetzlich
     "Feldname", wo der Editor "Tiername" gezeigt hatte (SE-Echttest
     2026-08-04). Verstecken war die ehrliche Notloesung — ein leeres Feld
     verriet aber nicht mehr, wozu es gehoert. Jetzt stimmt der Text, und
     die Regel ist ueberfluessig. */
  /* Select hat 1px weniger Innenabstand als Textfelder; der eingeblendete
     Feldtext sitzt trotzdem exakt an seiner nativen Textposition. */
  .ph-select {
    top: calc(var(--feld-pad-y) - 1px + var(--feld-rand));
    left: calc(var(--feld-pad-x) - 2px + var(--feld-rand));
    right: 25px; /* Platz für den Aufklapp-Pfeil */
  }
  /* Datum und Uhrzeit (2026-08-17): Ein leeres <input type="date"> zeigt von
     sich aus "tt.mm.jjjj", ein leeres <input type="time"> zeigt "--:--".
     Unser Platzhalter liegt darueber — beide zusammen waeren zwei Texte
     uebereinander. Deshalb weicht abwechselnd einer:
       - RUHEND und leer: der browsereigene Hinweis wird unsichtbar, sichtbar
         ist der Feldname ("Anreise") — genau wie beim Textfeld.
       - IM FOKUS: das Feld gehoert dem Tippen. Der Name tritt zur Seite, die
         Segmente kommen zurueck. Ohne das tippte der Bediener blind: der
         Wert bleibt leer, bis das Datum VOLLSTAENDIG ist, der Name laege also
         waehrend der ganzen Eingabe darueber.
     WER den Namen wegnimmt, entscheidet der Baustein ueber ein Zustandsfeld
     (FormFeldBlock: Fokus AM STEUERELEMENT), nicht :focus-within an dieser
     Huelle. Ein paar Stunden lang stand hier :focus-within — und das schloss
     den Platzhalter SELBST ein: der Doppelklick zum Umbenennen fokussiert
     genau diesen Text, die Regel liess ihn im selben Moment verschwinden, und
     das Umbenennen "tat nichts" (Nutzer-Befund 2026-08-17). Auch :has() waere
     hier falsch gewesen: der eingebettete Browser von SoftEngine ist in seiner
     Version unbekannt, und die Regel darf nicht davon abhaengen.
     opacity statt display/visibility: nur so bleibt das Feld gleich hoch und
     die Segmente behalten ihre Breite (kein Sprung beim Fokus). Der
     ::-webkit-datetime-edit-Teil ist Chromium/Edge — genau dort laeuft der
     Editor und laeuft SoftEngine (WinUI wie WebUI). In einem anderen Browser
     greift die Regel nicht: dann stuenden beide Texte uebereinander. Das ist
     die bewusst in Kauf genommene Grenze (Nutzer-Ansage 2026-08-17). */
  .huelle.leer input[type="date"]:not(:focus)::-webkit-datetime-edit,
  .huelle.leer input[type="time"]:not(:focus)::-webkit-datetime-edit { opacity: 0; }
  .huelle.leer.tippt .ph-nativ { display: none; }
  /* Ankreuzfeld: Kästchen + Beschriftung in EINER Zeile (Referenz
     .impf-chk) — bewusst ohne <label for>-Kopplung: im Editor ist die
     Beschriftung das Umbenennen-Ziel. Den Haken-Klick auf den Text
     übernimmt in der MASKE ein eigener Handler (N1, s. onTextClick). */
  .zeile {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--se-fs);
    color: var(--se-ink);
  }
  input[type='checkbox'].ctrl {
    width: 15px;
    height: 15px;
    padding: 0;
    flex: none;
    accent-color: var(--se-accent);
  }
  /* Nachschlagen: Feld + Lupe in EINER Zeile; die Lupe sitzt im Feld
     rechts. Der gestrichelte Rahmen sagt wie bei gebundenen Stellen:
     dieser Wert kommt aus Daten, nicht aus der Tastatur. */
  .nachschlag { position: relative; }
  .nachschlag .ctrl { padding-right: 34px; border-style: dashed; }
  /* Nur EIN Knopf im Feld: die Lupe. Bis 2026-08-07 sass links daneben ein ×
     zum Loeschen (samt breiterem Innenabstand fuer beide) — es ist raus
     (Nutzer-Ansage): geloescht wird mit der Tastatur, wie in jedem anderen
     Feld. Zwei Knoepfe in einem 240px-Feld waren ohnehin einer zu viel. */
  .lupe {
    position: absolute;
    top: var(--feld-rand);
    bottom: var(--feld-rand);
    right: var(--feld-rand);
    width: 30px;
    display: grid;
    place-items: center;
    padding: 0;
    border: none;
    background: none;
    color: var(--se-muted);
    cursor: pointer;
    transition: background var(--se-move);
  }
  .lupe:hover { background: var(--se-accent-soft); color: var(--se-ink); }
  .lupe:focus-visible { outline: 2px solid var(--se-accent); outline-offset: -2px; }
  /* Im Editor wird gestaltet, nicht ausgefuellt: das Eingabeelement
     nimmt dort keine Bedienung an — dafuer wird der Platzhalter
     anfassbar (Doppelklick = Text im Feld aendern). Ein leerer
     Platzhalter bekommt nur im Editor einen greifbaren Hinweis. */
  :host([data-ff-editor]) .ctrl,
  :host([data-ff-editor]) .lupe { pointer-events: none; }
  :host([data-ff-editor]) .ph { pointer-events: auto; cursor: text; }
  :host([data-ff-editor]) .huelle[data-ff-bound] .ctrl {
    border-style: dotted;
    border-color: var(--se-accent);
  }
  /* N1: der "Text …"-Griff gilt für JEDEN geleerten Inline-Edit-Text —
     auch die Ankreuzfeld-Beschriftung bleibt im Editor anfassbar. */
  :host([data-ff-editor]) [data-ff-editable]:empty::before { content: 'Text …'; opacity: 0.6; }
  /* N1: in der MASKE schaltet die Beschriftung den Haken (Windows-
     Gewohnheit) — klickbar zeigen, Textauswahl beim Klicken vermeiden. */
  :host(:not([data-ff-editor])) .zeile .text { cursor: pointer; user-select: none; }
  /* Rasterflaeche: das Eingabefeld fuellt seine Zelle in Breite und Hoehe
     (Ziehen macht das FELD groesser). Nur die Text-artigen Felder in der
     .huelle strecken sich; das Ankreuzfeld (.zeile) bleibt 15px. */
  :host([fuellt]) .feld,
  :host([fuellt]) .huelle { height: 100%; }
  :host([fuellt]) .huelle .ctrl { height: 100%; }
`
