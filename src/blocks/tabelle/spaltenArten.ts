// Spalten-Arten der Tabelle — WIE eine Spalte ihre Werte zeigt.
//
// Eine TABELLE statt einer Fallunterscheidung (Regel 2, sinngemaess): jede Art
// steht hier EINMAL mit allem, was sie ausmacht — Technikwert, Klarname,
// Spaltenbreite, weitere Feldbindungen, Zeilentakt und wie ihre Zelle
// gezeichnet wird. Wer eine sechste Art braucht, schreibt eine Zeile dazu; im
// Zeichnen (./tabelleKoerper) steht dafuer kein einziges `if art === …`, und
// der Editor bekommt die Auswahl ueber denselben Eintrag automatisch mit
// (./TabelleBlock, listenBindung). Die fuenfte Art „Bild + Name" (2026-08-06)
// war die Probe darauf: sie brauchte zwei zusaetzliche Felder und einen
// hoeheren Takt — beides kam als Eintrag dazu, nicht als Sonderfall.
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

import { html, nothing, type TemplateResult } from 'lit'
import type { EintragsWahlOption } from '../../core/blocks/BlockDefinition'
import { coerceStatusVariant } from '../shared/statusVariant'
import { tierBild } from '../shared/tierIcon'
import { ZEILEN_HOEHE } from './seitengroesse'

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

// Ein ZUSATZFELD einer Art: eine zweite (dritte, …) Feldbindung, die nur diese
// eine Art braucht. „Bild + Name" zeigt drei Werte aus derselben Datenzeile —
// das Feld der Spalte selbst ist der Name, dazu kommen Bild und Unterzeile.
//
// Deklariert statt eingebaut, damit nirgends `if art === 'bild'` steht: der
// Feld-Picker bietet genau diese Felder an (ueber die Registry, s. TabelleBlock
// listenBindung), die Laufzeit liest genau diese Werte (./seRuntime) und die
// Preflight prueft genau diese Bindungen — alle drei generisch ueber die Liste.
export interface ZusatzFeld {
  // Schluessel im `felder`-Record der Spalte (Technikwert, unsichtbar).
  key: string
  // Klarname im Picker (Regel 3).
  label: string
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
  // Weitere Feldbindungen dieser Art (s. ZusatzFeld). Fehlt der Eintrag,
  // braucht die Art nur das eine Feld der Spalte.
  zusatzFelder?: readonly ZusatzFeld[]
  // Welchen Zeilentakt diese Spalte braucht. Bekommt die Zusatz-BINDUNGEN der
  // Spalte herein (key -> Feldcode, fehlend/'' = ungebunden), damit eine Art
  // nur dann Platz bekommt, wenn sie ihn wirklich fuellt. Fehlt der Eintrag,
  // gilt der Grundtakt.
  hoehe?: (felder: Record<string, string>) => number
  // Wie die Zelle ihren Wert zeigt. Bekommt IMMER schon Fertiges herein: den
  // Datenwert, oder im Editor den Platzhalter-Strich (Regel 7 — hier wird
  // nichts erfunden, auch nicht formatiert). Dazu die Zuordnung DIESER Spalte
  // (nur die Status-Art liest sie) und die WERTE der Zusatzfelder derselben
  // Datenzeile (nur „Bild + Name" liest sie).
  zelle: (
    wert: string,
    zuordnung: readonly Zuordnung[],
    zusatz: Record<string, string>,
  ) => TemplateResult | string
}

// Die Standard-Art. Eine Spalte ohne Angabe ist Text — so verhielten sich alle
// Spalten bis 2026-08-06, alte Staende bleiben damit unveraendert.
export const ART_TEXT = 'text'

// Die Status-Art wird auch von aussen gebraucht: die Registry haengt die
// Zuordnungstabelle daran (TabelleBlock), und die Preflight erkennt daran,
// welche Spalten sie auf eine fehlende Zuordnung ansehen muss.
export const ART_STATUS = 'status'

export const ART_BILD = 'bild'

// Die beiden Zusatzfelder der Bild-Art. Als Konstanten, weil ausser der Art
// selbst auch ihre Zelle sie liest — ein Tippfehler im Schluessel liesse die
// Zelle sonst still leer bleiben.
const FELD_BILD = 'bild'
const FELD_UNTER = 'unter'

// Der Takt einer Zeile mit Bild-Spalte. Gerechnet, nicht geschaetzt — nach
// derselben Bauart wie die Demo (designsprache/atome.css, .zelle-patient), aber
// mit unseren dichten Schriftgroessen: 4,5 + Name 15px x 1,25 + Unterzeile
// 12px x 1,35 + 4,5 = 44. Die Demo selbst kaeme mit ihrer Grundgroesse auf 58;
// von Fellnase uebernommen sind Schriftarten und Strichstaerken, ausdruecklich
// NICHT die Grundgroesse (masken-tokens.css) — eine SoftEngine-Maske ist ein
// dichtes Arbeitswerkzeug.
export const ZEILEN_HOEHE_BILD = 44

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
  {
    wert: ART_BILD,
    name: 'Bild + Name',
    // Wie Text: sie teilt sich den Rest. Ein festes Mass waere hier geraten —
    // die Demo gibt fuer ihre Patientenspalte keins vor (sie richtet sich dort
    // nach dem Inhalt, was hier gerade verboten ist: Breite nach ART).
    spur: 'minmax(0, 1fr)',
    klasse: 'bild',
    zusatzFelder: [
      { key: FELD_BILD, label: 'Bild' },
      { key: FELD_UNTER, label: 'Unterzeile' },
    ],
    // Platz NUR gegen Gegenleistung (Nutzer-Ansage 2026-08-06): ist weder Bild
    // noch Unterzeile gebunden, zeigt die Spalte genau das, was eine Textspalte
    // zeigt — dann bleibt auch der Takt der einer Textspalte. Der Takt gilt
    // immer fuer die GANZE Tabelle (zeilenHoeheFuer), sonst stuenden Zeilen
    // verschieden hoch.
    hoehe: (felder) =>
      (felder[FELD_BILD] ?? '') !== '' || (felder[FELD_UNTER] ?? '') !== ''
        ? ZEILEN_HOEHE_BILD
        : ZEILEN_HOEHE,
    // Aufbau und Masse aus der Demo (.zelle-patient): Bild 26px links, 10px
    // Abstand, Name fett darueber der kleineren Unterzeile.
    //
    // NICHTS auf Verdacht (Nutzer-Ansage 2026-08-06): kein gebundenes Bild —
    // kein Bild. Kein erkannter Wert — auch kein Bild, nicht einmal ein
    // Rueckfall-Zeichen (s. tierBild). Und keine Platzhalter-Flaeche im Editor:
    // die Spalte ist allgemein, nicht fuer Tierarten reserviert, und ein leerer
    // Kreis in jeder Zeile behauptete, hier gehoere ein Bild hin.
    zelle: (wert, _zuordnung, zusatz) => {
      const bild = tierBild(zusatz[FELD_BILD] ?? '')
      const unter = zusatz[FELD_UNTER] ?? ''
      return html`<div class="bild-name">
        ${bild === undefined ? nothing : html`<span class="bild-zeichen">${bild}</span>`}
        <div class="bild-text">
          <div class="bild-titel">${wert}</div>
          ${unter === '' ? nothing : html`<div class="bild-unter">${unter}</div>`}
        </div>
      </div>`
    },
  },
]

// Der Zeilentakt der GANZEN Tabelle: die anspruchsvollste Spalte bestimmt ihn.
// Eine Zeile ist eine Zeile — verschieden hohe Zellen in derselben Zeile gaebe
// es ohnehin nicht, und ein Takt je Spalte wuerde das Lineal zerlegen.
export function zeilenHoeheFuer(
  spalten: readonly { art: string; felder?: Record<string, string> }[],
): number {
  return spalten.reduce((hoch, s) => {
    const art = spaltenArt(s.art)
    return Math.max(hoch, art.hoehe?.(s.felder ?? {}) ?? ZEILEN_HOEHE)
  }, ZEILEN_HOEHE)
}

// Die Art einer Spalte nachschlagen. Unbekannt oder leer -> Text: ein alter
// Stand, ein Tippfehler im Attribut oder eine spaeter entfernte Art darf nie
// eine leere Spalte ergeben (dieselbe Haltung wie coerceSpalten).
export function spaltenArt(wert: unknown): SpaltenArt {
  return SPALTEN_ARTEN.find((a) => a.wert === wert) ?? SPALTEN_ARTEN[0]
}

// Die Auswahl fuer den Editor — Technikwert + Klarname + die Zusatzfelder
// dieser Art, aus DERSELBEN Liste. Damit kann die angebotene Auswahl gar nicht
// von den gezeichneten Arten abweichen (eine Quelle, zwei Leser): waehlt der
// Bauer „Bild + Name", bietet der Picker genau die Felder an, die die Zelle
// dieser Art auch liest.
export const SPALTEN_ART_OPTIONEN: readonly EintragsWahlOption[] =
  SPALTEN_ARTEN.map((a) => ({
    wert: a.wert,
    name: a.name,
    ...(a.zusatzFelder ? { felder: a.zusatzFelder } : {}),
  }))

// Schluessel IM Eintrag, unter dem die Zusatz-Feldbindungen stehen (s.
// ./spalten, Spalte.felder). Steht hier neben den Arten, weil beide Seiten ihn
// brauchen: der Picker schreibt dorthin, die Zelle liest von dort.
export const FELDER_KEY = 'felder'
