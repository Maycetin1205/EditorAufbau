// geholteZeilen — der Zwischenspeicher der per Relation GEHOLTEN Zeilen
// (Welle R, „Zeilen per Relation holen").
//
// Warum ein EIGENER Speicher und nicht SEDATA: ein SoftEngine-Push ersetzt
// SEDATA.Daten KOMPLETT (bridge/seConsume) — dort abgelegte geholte Zeilen
// wischte jeder Push weg, und die Positionen verschwaenden mitten in der
// Arbeit. Hier ueberleben sie jeden Push; erst der naechste Auswahl-Wechsel
// des Gebers ersetzt sie (relationLader).
//
// Warum ein EIGENES Modul ohne Importe: data.ts (rowsFor) LIEST hier,
// relationLader SCHREIBT — laege der Speicher im Lader, braeuchte data
// einen Import auf relationLader, und der importiert selbst data: ein Kreis.
//
// Schluessel = Quellen-NAME (alias): derselbe Schluessel, mit dem der ganze
// Datenweg Quellen identifiziert (SEFILELOOP-ALIAS, rowsFor).

const speicher = new Map<string, unknown[]>()

// Zeilen einer Quelle setzen — [] leert sie (Abwahl, halber Schluessel).
export function setzeGeholteZeilen(alias: string, zeilen: unknown[]): void {
  if (alias === '') return
  speicher.set(alias, zeilen)
}

// Die geholten Zeilen einer Quelle — undefined = fuer diese Quelle wurde
// nie geholt (rowsFor faellt dann wie bisher auf [] zurueck).
export function geholteZeilenFuer(alias: string): unknown[] | undefined {
  return speicher.get(alias)
}

// Nur fuer gezielte Laufzeit-Tests: definierter Ausgangszustand
// (Muster setzeAuswahlZurueck in blocks/shared/auswahl).
export function setzeGeholteZeilenZurueck(): void {
  speicher.clear()
}
