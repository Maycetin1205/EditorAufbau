// Tabellen-Inhaltssuche
// Der Bediener tippt in die Suchzeile ueber der Tabelle und sieht nur noch
// die Zeilen, die dazu passen (Nutzer-Wunsch 2026-07-25: „dass ich den
// Tabelleninhalt durchsuchen kann").
//
// Eigene Datei wie ./sortierung: Suchlogik gehoert an EINE pruefbare Stelle,
// nicht ins Rendering. Ausserdem waere TabelleBlock sonst ueber den
// 500-Zeilen-Deckel gewachsen.
//
// Verhalten bewusst so, wie es ein Bediener erwartet, der Windows kennt:
//   - Gross/Klein egal.
//   - Es genuegt, dass der Text IRGENDWO in IRGENDEINER Zelle vorkommt.
//   - Mehrere Woerter sind ein UND: „meier 2026" findet Zeilen, in denen
//     beides steht — auch in VERSCHIEDENEN Spalten. Das ist der Unterschied
//     zu einer stumpfen Textsuche und der Grund, warum man ueberhaupt
//     mehrere Woerter tippt.
//   - Leere Eingabe = alles zeigen (nie versehentlich alles ausblenden).

// Ein Suchbegriff wird in Woerter zerlegt; Leerraum jeder Art trennt.
function woerterVon(text: string): string[] {
  return text.trim().toLowerCase().split(/\s+/).filter((w) => w !== '')
}

// Passt EINE Zeile auf den Suchtext? Exportiert fuer den gezielten Test.
export function zeilePasst(zeile: readonly string[], suchtext: string): boolean {
  const woerter = woerterVon(suchtext)
  if (woerter.length === 0) return true
  // Alle Zellen zu EINEM Text zusammenziehen: so findet „meier 2026" auch,
  // wenn der Name in Spalte 1 und das Datum in Spalte 4 steht.
  const zeileText = zeile.join(' ').toLowerCase()
  return woerter.every((wort) => zeileText.includes(wort))
}

// Zeilen filtern. Gibt IMMER eine neue Liste zurueck (Eingabe unangetastet);
// leerer Suchtext liefert alles.
export function filtereZeilen(
  zeilen: readonly (readonly string[])[],
  suchtext: string,
): string[][] {
  if (woerterVon(suchtext).length === 0) return zeilen.map((z) => [...z])
  return zeilen.filter((z) => zeilePasst(z, suchtext)).map((z) => [...z])
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
export function datensatzText(args: {
  hatQuelle: boolean
  sichtbar: number
  gesamt: number
  suchtAktiv: boolean
}): string {
  if (!args.hatQuelle) return '— Datensätze'
  // Nach „von" steht der Dativ: „von 250 DatensätzEN".
  const wort = (n: number): string => (n === 1 ? 'Datensatz' : 'Datensätze')
  const wortDativ = (n: number): string => (n === 1 ? 'Datensatz' : 'Datensätzen')
  if (!args.suchtAktiv) {
    return args.gesamt === 0 ? 'Keine Datensätze' : `${args.gesamt} ${wort(args.gesamt)}`
  }
  if (args.sichtbar === 0) return `Kein Treffer von ${args.gesamt} ${wortDativ(args.gesamt)}`
  return `${args.sichtbar} von ${args.gesamt} ${wortDativ(args.gesamt)}`
}
