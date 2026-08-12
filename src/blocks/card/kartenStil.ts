// kartenStil — das Aussehen der Karte.
//
// Aus CardBlock herausgeloest (2026-08-06) beim Umbau auf die Demo-Karte,
// aus demselben Grund und mit demselben Schnitt wie bei der Tabelle
// (tabelle/tabelleStil): hier das AUSSEHEN, drueben Struktur und Verhalten.
//
// VORLAGE ist die Karte aus designsprache/musterbogen.html (.karte), Wert fuer
// Wert abgeschrieben — Nutzer-Auftrag 2026-08-06 („der Nutzer will exakt die
// Demo-Karte"). Uebernommen sind Aufbau, Abstaende, Strichstaerken und die
// Lasche; die FARBEN kommen wie ueberall aus den Masken-Tokens (--se-*, keine
// Hex-Werte), und die Schriftgroessen aus deren Stufen — die Demo-Grundgroesse
// ist bewusst nicht uebernommen (masken-tokens.css: eine SoftEngine-Maske ist
// ein dichtes Arbeitswerkzeug).
//
// Die Karte ist eine KARTEIKARTE: die Lasche oben links gehoert zu ihr und
// ueberdeckt ihre Oberkante um 3px — grosszuegig genug, dass bei krummen
// Zoomstufen keine Haarlinie durchscheint (Begruendung aus der Demo).
//
// LEERE STELLEN (die drei :empty-Regeln am Ende) — warum sie im Editor an
// JEDER Karte stehen: in der Maske rendert die Karte leere Stellen gar nicht
// erst, im Editor muessen sie aber anklickbar bleiben (eine leere Stelle ist
// 0px hoch und liesse sich sonst nie an ein Feld binden). Bis U8 (2026-08-12)
// hingen sie zusaetzlich an [data-editable], das der BlockHost nur am
// AUSGEWAEHLTEN Baustein setzt — dieselbe Karte sah ausgewaehlt anders aus als
// daneben (Nutzer-Befund mit zwei Screenshots). Damit ist die Ansage vom
// 2026-08-06 („keine haesslichen Platzhalter") ueberholt: eine Karte hat EIN
// Gesicht, die Auswahl zeigt sich allein am Rahmen des BlockHosts.
//
// Diese Begruendung steht HIER und nicht im Stil: jeder Kommentar innerhalb
// des css-Blocks reist Byte fuer Byte in JEDE exportierte Maske (s. Kopf von
// base/BasicBlock). Die aelteren Kommentare unten stehen noch drin — sie
// herauszuziehen ist ein eigener Schnitt, nicht Teil von U8.

import { css } from 'lit'

export const kartenStil = css`
      /* Grundform (Demo .karte): Papierflaeche, EINE 1,5px-Kante, flach.
         Die linke obere Ecke ist EGKIG, weil dort die Lasche ansetzt — ohne
         Lasche ist sie rund wie die anderen drei (Klasse setzt der Baustein). */
      .card {
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        overflow: visible;
        padding: 11px 13px 12px;
        background: var(--se-card-bg);
        border: var(--se-border) solid var(--se-card-line);
        border-radius: 0 var(--se-r-md) var(--se-r-md) var(--se-r-md);
        font-family: var(--se-font);
        transition: border-color var(--se-move);
      }
      .card.ohne-reiter { border-radius: var(--se-r-md); }
      /* Der 24px-Vorschub (Demo: .karte margin-top 24px) ist der Platz, den die
         LASCHE braucht: sie sitzt auf der Oberkante und ragt nach oben aus der
         Karte heraus. Deshalb haengt er an der Lasche und steht am HOST, nicht
         an der Karte:
           - an der Lasche, weil eine Karte OHNE Datum und Zeit keine Lasche hat
             und dann auch keinen Platz dafuer braucht. Vom 2026-08-07 bis heute
             galt er fuer jede Karte — eine frei auf dem Blatt liegende Karte
             ohne Lasche bekam dadurch eine 24px-Delle ueber sich.
           - am Host, weil ein Abstand INNEN von der Kartenhoehe abgeht: in einem
             Platz mit fester Hoehe rutschte die Karte 24px nach unten und lief
             unten heraus. Aussen schiebt er die Karte als Ganzes.
         Den Abstand zwischen zwei Karten OHNE Lasche gibt die Spalte
         (KanbanSpalteBlock, ::slotted) — sonst kaeme er bei Karten MIT Lasche
         doppelt.
         flow-root bleibt: ein eigenes Element ist von sich aus 'inline', erst
         das macht die Kartenhuelle zu einem Block mit eigener Flaeche. */
      :host { display: flow-root; }
      :host([hat-reiter]) { margin-top: 24px; }
      /* Flach (Fellnase Regel 4): beim Zeigen wird die KANTE dunkler, die
         Karte hebt nicht ab. */
      .card:hover { border-color: var(--se-faint); }
      /* Hier lag von 2026-07-30 bis 2026-08-07 ein 3px breiter Farbstreifen
         auf der LINKEN Kante, der den Status noch einmal am Kartenkoerper
         zeigte. Die Entscheidung dafuer ist aufgehoben (Nutzer 2026-08-07):
         die Demo kennt ihn nicht — sie gibt der Karte rundum EINE Kante
         gleicher Staerke (atome.css .karte) und zeigt den Status allein an
         der Marke. Genau dort steht er weiterhin; verloren geht nichts.
         Besonders behandelt wird nur der Notfall (s. unten). */
      /* Notfall (Demo .karte--notfall): dieselbe Karte, klare Kante — Akzent
         an Rand und Lasche, ein HAUCH davon im Grund. Ein Anflug, keine
         Flaeche (Regel 2: ein lauter Ton je Flaeche). ALLE VIER Kanten im
         selben Ton und derselben Staerke: die Demo setzt border-color, nicht
         eine einzelne Kante, und kennt keinen zweiten Rotton. */
      .card.v-danger {
        border-color: var(--se-accent);
        background: var(--se-red-soft);
      }
      .card.v-danger:hover { border-color: var(--se-accent-dark); }
      /* Die GEWAEHLTE Karte (Auswahl-Geber Kanban, 2026-08-05): getoente
         Akzentflaeche + Akzentrahmen — dieselbe Handschrift wie die gewaehlte
         Tabellenzeile. Das Attribut setzt NUR die Laufzeit (kanban/seRuntime),
         der Editor erfindet keine Auswahl (Regel 7). Rundum EIN Rahmen: bis
         2026-08-07 standen hier drei einzelne Kanten, damit der linke
         Status-Streifen durchschien — den gibt es nicht mehr. */
      :host([data-ff-auswahl]) .card {
        border-color: var(--se-accent);
        background: var(--se-accent-soft);
      }

      /* Die Lasche (Demo .karte-reiter): sitzt AUF der Oberkante, ohne
         Unterkante — sie geht in die Karte ueber. left:-1.5px richtet sie an
         der Aussenkante aus, nicht am Innenrand.
         Nachgerechnet (2026-08-07): left zaehlt ab dem INNENrand der Karte,
         also hinter deren Kante. Minus eine Kantenstaerke landet die Lasche
         damit genau auf der Aussenkante — aber nur, solange links dieselbe
         1,5px-Kante liegt wie rundum. Mit dem frueheren 3px-Streifen stand sie
         1,5px zu weit innen; seit er weg ist, stimmt es wieder. */
      .reiter {
        position: absolute;
        left: calc(-1 * var(--se-border));
        bottom: calc(100% - 3px);
        display: flex;
        align-items: baseline;
        gap: 7px;
        padding: 3px 11px 6px;
        background: var(--se-card-bg);
        border: var(--se-border) solid var(--se-card-line);
        border-bottom: none;
        border-radius: var(--se-r-sm) var(--se-r-sm) 0 0;
        font-size: var(--se-fs-sm);
        font-weight: 700;
        line-height: 1.2;
        letter-spacing: 0.04em;
        color: var(--se-muted);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .card:hover .reiter { border-color: var(--se-faint); }
      .card.v-danger .reiter,
      .card.v-danger:hover .reiter {
        background: var(--se-accent-dark);
        border-color: var(--se-accent-dark);
        color: var(--se-card-bg);
      }

      /* Kopf (Demo .karte-kopf): Bild links, 10px Abstand, daneben die Namen. */
      .kopf {
        display: flex;
        align-items: center;
        gap: var(--se-gap);
        min-width: 0;
      }
      /* Das Tierzeichen steht FREI, ohne Kachel (Fellnase-Entscheidung).
         36px ist das Kartenmass der Demo (.tier ohne Groessen-Zusatz). */
      .avatar {
        box-sizing: border-box;
        display: grid;
        place-items: center;
        width: 36px;
        height: 36px;
        flex: none;
        color: var(--se-accent);
      }
      .avatar img,
      .avatar svg {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: contain;
      }
      .namen { min-width: 0; }
      /* Name (Demo .karte-name: 700 15,5px/1,25) und Zusatz (.karte-zusatz:
         12,5px, gedaempft). Beide einzeilig mit „…". */
      .name,
      .zusatz {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .name {
        color: var(--se-ink);
        font-size: var(--se-fs-lg);
        font-weight: 700;
        line-height: 1.25;
      }
      .zusatz {
        color: var(--se-muted);
        font-size: var(--se-fs-sm);
      }
      /* Fliesstext (Demo .karte-grund): 9px Abstand nach oben, hoehere
         Zeilenhoehe, hoechstens zwei Zeilen. */
      .grund {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        margin-top: 9px;
        color: var(--se-ink);
        font-size: var(--se-fs);
        line-height: 1.45;
      }
      /* Fusszeile (Demo .karte-fuss): zwei Plaetze, auseinandergeschoben —
         links ein gedaempfter Text, rechts die Marke. */
      .fuss {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: 10px;
      }
      .fussl {
        min-width: 0;
        color: var(--se-muted);
        font-size: var(--se-fs-sm);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      /* margin-left:auto haelt die Marke RECHTS, auch wenn der linke Platz
         leer ist. space-between allein reicht nicht: mit nur einem Kind
         schiebt es dieses an den Anfang — in der Maske waere die Marke also
         nach links gerutscht, sobald Titel 2 ungebunden bleibt (der
         Normalfall). In der Demo stehen immer beide Plaetze, dort faellt es
         nicht auf. */
      .fuss .chip { flex: none; margin-left: auto; }

      /* Leere Stellen: im Editor an JEDER Karte gleich, in der Maske nie.
         Warum, steht im Dateikopf (U8). */
      :host([data-ff-editor]) [data-ff-spot]:empty::before {
        content: '—';
        color: var(--se-faint);
      }
      :host([data-ff-editor]) .avatar:empty {
        border: var(--se-border) dashed var(--se-faint);
        border-radius: var(--se-r-sm);
      }
      :host([data-ff-editor]) .avatar:empty::before {
        content: none;
      }
`
