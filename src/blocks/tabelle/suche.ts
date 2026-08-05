// Tabellen-Inhaltssuche
// Der Bediener tippt in die Suchzeile ueber der Tabelle und sieht nur noch
// die Zeilen, die dazu passen (Nutzer-Wunsch 2026-07-25: „dass ich den
// Tabelleninhalt durchsuchen kann").
//
// Eigene Datei wie ./sortierung: Suchlogik gehoert an EINE pruefbare Stelle,
// nicht ins Rendering. Ausserdem waere TabelleBlock sonst ueber den
// 500-Zeilen-Deckel gewachsen.
//
// Die Entscheidung „passt diese Zeile?" wohnt seit dem Nachschlage-Feld
// (2026-08-05) in ../shared/textSuche: das Fenster dort sucht genau so wie
// diese Suchzeile, und zwei Abschriften wuerden irgendwann verschieden
// treffen (Regel 10 — der zweite Aufrufer hat den Umzug erzwungen).
// Hier weiter-exportiert, damit die Tabellen-Suche an ihrem angestammten
// Namen erreichbar bleibt.
import { zeilePasst } from '../shared/textSuche'

export { zeilePasst }

// Indizes der passenden Zeilen — seit der waehlbaren Zeile (2026-08-05)
// braucht die Tabelle die IDENTITAET einer Zeile (ihren Rohindex) durch
// Suche und Sortierung hindurch, nicht nur ihre Werte: die Markierung muss
// an derselben Zeile kleben, egal wie gefiltert oder sortiert wird.
export function passendeIndizes(
  zeilen: readonly (readonly string[])[],
  suchtext: string,
): number[] {
  const raus: number[] = []
  zeilen.forEach((z, i) => {
    if (zeilePasst(z, suchtext)) raus.push(i)
  })
  return raus
}

// Zeilen filtern. Gibt IMMER eine neue Liste zurueck (Eingabe unangetastet);
// leerer Suchtext liefert alles. DIESELBE Logik wie passendeIndizes — die
// Werte-Form bleibt als geprueftes Verhalten bestehen.
export function filtereZeilen(
  zeilen: readonly (readonly string[])[],
  suchtext: string,
): string[][] {
  return passendeIndizes(zeilen, suchtext).map((i) => [...zeilen[i]])
}

// Zeigt die Tabelle ECHTE Daten oder Editor-Platzhalter?
//
// Die Frage entscheidet alles am Leerzustand: Striche „—" oder leere Zeilen,
// „— Datensaetze" oder „Keine Datensaetze". Sie hat NICHTS damit zu tun, ob
// gerade Zeilen da sind — bis 2026-07-28 stand genau das im Baustein
// (`datenzeilen.length > 0`), und deshalb fiel die laufende Maske an einem
// Tag ohne Saetze auf die Editor-Platzhalter zurueck (Regel-7-Bruch).
//
// `imEditor` kommt aus dem Attribut `data-ff-editor`, das der BlockHost an
// jedem Editor-Element setzt und der Export nie. Eigene Funktion, damit die
// Entscheidung pruefbar ist, statt im Rendern zu verschwinden — dasselbe
// Muster wie ./sortierung und die Suche darueber.
export function zeigtEchteDaten(imEditor: boolean, source: string): boolean {
  return !imEditor && source.trim() !== ''
}

// Beschriftung der Fusszeile: wie viele Datensaetze sieht der Bediener?
//
// Drei Faelle, drei Saetze — der haeufigste Fehler waere, sie zu einem zu
// verschmelzen:
//   - Ohne Quelle (Editor): ein Strich. Nie eine erfundene Zahl (Regel 7).
//   - Ohne Suche: die schlichte Anzahl.
//   - MIT Suche: „X von Y" — sonst verschweigt die Zahl, dass 250 Saetze
//     da sind und die Suche nur einen uebrig laesst. Genau das hat der
//     Nutzer am 2026-07-25 bemaengelt.
// Und richtige Einzahl: „1 Datensatz", nicht „1 Datensätze".
//
// `auswahlAktiv` (2026-08-05): folgt die Tabelle der Auswahl eines anderen
// Bausteins und ist gerade eine Zeile gewaehlt, sagt die Fusszeile es dazu —
// der Bediener soll IMMER sehen, warum er weniger Saetze sieht als sonst
// (Regel 4). Der Zusatz haengt an jedem der drei Faelle gleich.
export function datensatzText(args: {
  hatQuelle: boolean
  sichtbar: number
  gesamt: number
  suchtAktiv: boolean
  auswahlAktiv?: boolean
}): string {
  if (!args.hatQuelle) return '— Datensätze'
  const zusatz = args.auswahlAktiv ? ' · durch Auswahl gefiltert' : ''
  // Nach „von" steht der Dativ: „von 250 DatensätzEN".
  const wort = (n: number): string => (n === 1 ? 'Datensatz' : 'Datensätze')
  const wortDativ = (n: number): string => (n === 1 ? 'Datensatz' : 'Datensätzen')
  if (!args.suchtAktiv) {
    return (args.gesamt === 0 ? 'Keine Datensätze' : `${args.gesamt} ${wort(args.gesamt)}`) + zusatz
  }
  if (args.sichtbar === 0) return `Kein Treffer von ${args.gesamt} ${wortDativ(args.gesamt)}` + zusatz
  return `${args.sichtbar} von ${args.gesamt} ${wortDativ(args.gesamt)}` + zusatz
}
