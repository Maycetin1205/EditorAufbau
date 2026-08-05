// textSuche — DIE eine Text-Such-Entscheidung „passt diese Zeile?".
//
// Herausgezogen aus tabelle/suche.ts, als der zweite echte Aufrufer kam
// (Regel 10): das Nachschlage-Fenster des Formularfelds sucht exakt so, wie
// die Tabellen-Suchzeile sucht. Zwei Abschriften wuerden irgendwann
// verschieden treffen — der Bediener faende einen Kunden in der Tabelle, aber
// nicht im Nachschlage-Fenster, und keine Meldung erklaerte ihm den
// Unterschied.
//
// Verhalten (Nutzer-Wunsch 2026-07-25, woertlich uebernommen):
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

// Passt EINE Zeile (als Zell-Texte) auf den Suchtext?
export function zeilePasst(zeile: readonly string[], suchtext: string): boolean {
  const woerter = woerterVon(suchtext)
  if (woerter.length === 0) return true
  // Alle Zellen zu EINEM Text zusammenziehen: so findet „meier 2026" auch,
  // wenn der Name in Spalte 1 und das Datum in Spalte 4 steht.
  const zeileText = zeile.join(' ').toLowerCase()
  return woerter.every((wort) => zeileText.includes(wort))
}
