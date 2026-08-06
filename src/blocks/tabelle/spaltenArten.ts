// Spalten-Arten der Tabelle — WIE eine Spalte ihre Werte zeigt.
//
// Eine TABELLE statt einer Fallunterscheidung (Regel 2, sinngemaess): jede Art
// steht hier EINMAL mit allem, was sie ausmacht — Technikwert, Klarname,
// Spaltenbreite und wie ihre Zelle gezeichnet wird. Wer eine fuenfte Art
// braucht, schreibt eine Zeile dazu; im Zeichnen (./tabelleKoerper) steht
// dafuer kein einziges `if art === …`, und der Editor bekommt die Auswahl
// ueber denselben Eintrag automatisch mit (./TabelleBlock, listenBindung).
//
// BREITE NACH ART, NIE NACH INHALT (Nutzer-Einwand 2026-08-06): eine Spalte,
// die sich nach ihren Werten richtet, springt beim Blaettern — die naechste
// Seite traegt kuerzere Werte, und die ganze Tabelle rutscht. Die Zahlen
// (90/100/120 px) sind Nutzer-Vorgabe, kein geschaetztes Mass.
//
// Aussehen: die Klassen sind in ./tabelleStil ausgeschrieben, die Werte
// stammen aus designsprache/musterbogen.html. Zahl und Datum teilen sich
// bewusst DIESELBE Klasse — die Demo zeichnet ihre Datumsspalten mit
// `zelle-zahl`, also rechtsbuendig und mit gleichbreiten Ziffern. Ein Datum
// wird AUSGERICHTET, nie umgerechnet (Nutzer 2026-08-06).

import { html, type TemplateResult } from 'lit'
import { coerceStatusVariant } from '../shared/statusVariant'

// EINE Zeile der Status-Zuordnung: Datenwert -> Klarname -> Bedeutung.
//
// Der Datenwert ist, was SoftEngine liefert ('W', '3', 'wartet') — ein
// Technikwert, den niemand lesen soll. Der Klarname ist, was in der Marke
// steht. Die Bedeutung bestimmt die FARBE, und zwar fest: der Bauer waehlt
// „Warnung", nie „gelb" (Regel 3 + die Farbregel der Designsprache — eine
// Farbe ist nirgends frei waehlbar).
export interface Zuordnung {
  wert: string
  name: string
  bedeutung: string
}

// Die Zuordnung zu einem Datenwert finden. Verglichen wird GETRIMMT und ohne
// Ruecksicht auf Gross-/Kleinschreibung — genau wie das Kanban seine Karten
// einsortiert (kanban/seRuntime). Ein fuehrendes Leerzeichen aus einem
// SoftEngine-Feld darf keine Marke grau werden lassen.
export function findeZuordnung(
  zuordnung: readonly Zuordnung[],
  wert: string,
): Zuordnung | undefined {
  const gesucht = wert.trim().toLowerCase()
  return zuordnung.find((z) => z.wert.trim().toLowerCase() === gesucht)
}

export interface SpaltenArt {
  // Technikwert — steht so in der Spalte und im Export (unsichtbar, Regel 3).
  wert: string
  // Klarname — was der Bauer im Picker liest.
  name: string
  // Die Rasterspur dieser Spalte (grid-template-columns).
  spur: string
  // Klasse an Kopf UND Zelle; '' = keine. Eine Klasse fuer beide, damit ein
  // rechtsbuendiger Wert nie unter einer linksbuendigen Ueberschrift steht.
  klasse: string
  // Wie die Zelle ihren Wert zeigt. Bekommt IMMER schon Fertiges herein: den
  // Datenwert, oder im Editor den Platzhalter-Strich (Regel 7 — hier wird
  // nichts erfunden, auch nicht formatiert). Dazu die Zuordnung DIESER Spalte
  // — nur die Status-Art liest sie, die anderen ignorieren sie.
  zelle: (wert: string, zuordnung: readonly Zuordnung[]) => TemplateResult | string
}

// Die Standard-Art. Eine Spalte ohne Angabe ist Text — so verhielten sich alle
// Spalten bis 2026-08-06, alte Staende bleiben damit unveraendert.
export const ART_TEXT = 'text'

// Die Status-Art wird auch von aussen gebraucht: die Registry haengt die
// Zuordnungstabelle daran (TabelleBlock), und die Preflight erkennt daran,
// welche Spalten sie auf eine fehlende Zuordnung ansehen muss.
export const ART_STATUS = 'status'

export const SPALTEN_ARTEN: readonly SpaltenArt[] = [
  {
    wert: ART_TEXT,
    name: 'Text',
    // Text teilt sich den Rest: minmax(0, …) statt 1fr allein, sonst kann eine
    // Rasterspur nicht unter ihren Inhalt schrumpfen und die Tabelle waechst
    // ueber ihren Rahmen hinaus.
    spur: 'minmax(0, 1fr)',
    klasse: '',
    zelle: (wert) => wert,
  },
  {
    wert: 'zahl',
    name: 'Zahl',
    spur: '90px',
    klasse: 'zahl',
    zelle: (wert) => wert,
  },
  {
    wert: 'datum',
    name: 'Datum',
    spur: '100px',
    klasse: 'zahl',
    zelle: (wert) => wert,
  },
  {
    wert: ART_STATUS,
    name: 'Status',
    spur: '120px',
    klasse: 'status',
    // Die Marke der Designsprache (Fellnase Regel 5: gekappte Ecke +
    // quadratischer Punkt). Sie ist GETEILT, nicht abgeschrieben — dieselbe
    // chipStyles tragen Karte und Kanban-Spalte (../shared/statusVariant).
    //
    // MIT Zuordnung: Klarname statt Datenwert, Farbe aus der Bedeutung.
    // OHNE Zuordnung (oder wenn der Datenwert nicht darin steht): GRAUE Marke
    // mit dem Rohwert. Das ist kein Fehlerzustand — die Zuordnung ist
    // freiwillig (Nutzer-Entscheidung 2026-08-06). Der Editor zeigt dann
    // ehrlich, was da ist, statt eine Bedeutung zu erfinden, die niemand
    // vergeben hat (Regel 7). Grau ist die Grundform von chipStyles: keine
    // v-Klasse, Flaeche --se-panel-2, Punkt --se-faint.
    zelle: (wert, zuordnung) => {
      const treffer = findeZuordnung(zuordnung, wert)
      if (!treffer) return html`<span class="chip">${wert}</span>`
      return html`<span class="chip v-${coerceStatusVariant(treffer.bedeutung)}">${
        treffer.name.trim() === '' ? wert : treffer.name
      }</span>`
    },
  },
]

// Die Art einer Spalte nachschlagen. Unbekannt oder leer -> Text: ein alter
// Stand, ein Tippfehler im Attribut oder eine spaeter entfernte Art darf nie
// eine leere Spalte ergeben (dieselbe Haltung wie coerceSpalten).
export function spaltenArt(wert: unknown): SpaltenArt {
  return SPALTEN_ARTEN.find((a) => a.wert === wert) ?? SPALTEN_ARTEN[0]
}

// Die Auswahl fuer den Editor — Technikwert + Klarname, aus DERSELBEN Liste.
// Damit kann die angebotene Auswahl gar nicht von den gezeichneten Arten
// abweichen (eine Quelle, zwei Leser).
export const SPALTEN_ART_OPTIONEN: readonly { wert: string; name: string }[] =
  SPALTEN_ARTEN.map((a) => ({ wert: a.wert, name: a.name }))
