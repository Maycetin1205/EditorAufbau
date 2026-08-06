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
  // nichts erfunden, auch nicht formatiert).
  zelle: (wert: string) => TemplateResult | string
}

// Die Standard-Art. Eine Spalte ohne Angabe ist Text — so verhielten sich alle
// Spalten bis 2026-08-06, alte Staende bleiben damit unveraendert.
export const ART_TEXT = 'text'

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
    wert: 'status',
    name: 'Status',
    spur: '120px',
    klasse: 'status',
    // Die Marke der Designsprache (Fellnase Regel 5: gekappte Ecke +
    // quadratischer Punkt). Sie ist GETEILT, nicht abgeschrieben — dieselbe
    // `chipStyles` tragen Karte und Kanban-Spalte (../shared/statusVariant).
    // Ohne Zuordnung bleibt sie GRAU und zeigt den Rohwert: der Editor
    // erfindet keine Bedeutung, die niemand vergeben hat (Regel 7). Die
    // Zuordnung Datenwert -> Klarname -> Bedeutung kommt als eigenes Paket.
    zelle: (wert) => html`<span class="chip">${wert}</span>`,
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
