// seitengroesse — wie viele Zeilen die Tabelle zeigt und welche davon.
//
// Zwei Rechnungen, beide rein (Zahlen rein, Zahlen raus — kein DOM, kein Lit):
//   1. passendeZeilen: wie viele Zeilen bei DIESER Hoehe Platz haben.
//   2. seitenAufteilung: welche Zeilen die aktuelle Seite zeigt.
//
// Warum es die erste ueberhaupt gibt (2026-08-06): die Tabelle zeigte fest 10
// Zeilen pro Seite, egal wie hoch sie im Raster stand. Eine flache Tabelle
// musste also scrollen, obwohl daneben Platz war; eine hohe zeigte 10 Zeilen
// und darunter leeres Lineal. Beides bricht den Nordstern — was zu sehen ist,
// IST der Export, und im Export sieht es genauso krumm aus.
//
// Warum die Zeilenhoehe HIER wohnt und nicht mehr im CSS: sie war die Zahl,
// mit der das Aussehen (tabelleStil) und die Rechnung (diese Datei) beide
// arbeiten muessen. Stand sie nur im CSS, muesste die Rechnung sie erraten —
// und beim naechsten Optik-Feinschliff rechnete sie still falsch. Jetzt gibt
// es EINE Zahl an EINER Stelle: der Baustein setzt sie beim Zeichnen als
// CSS-Variable, das Stylesheet liest nur noch var(--zeilen-hoehe).

// Der Takt der Tabelle in Pixeln. Kopf UND Zeilen bekommen ihn als FESTE
// Hoehe (nicht aus Schrift + Innenabstand geschaetzt) — nur so laufen die
// weitergezeichneten Linien des Lineals im selben Takt wie echte Zeilen.
// Ein geschaetzter Wert lief hier schon einmal 4,25px je Zeile aus dem Takt
// und sah nach vier Zeilen sichtbar krumm aus (Nutzer 2026-07-25).
export const ZEILEN_HOEHE = 32

// Die bewussten Uebersteuerungen im Fusszeilen-Waehler. „Passend zur Hoehe"
// ist die Voreinstellung und steht NICHT hier: sie ist kein fester Wert,
// sondern das Ergebnis der Messung (PASSEND als Waehler-Kennung).
export const ZEILEN_PRO_SEITE = [10, 25, 50] as const

// Waehler-Wert fuer „passend zur Hoehe". 0 ist kein moeglicher echter Wert
// (eine Seite mit null Zeilen gibt es nicht), taugt also als Kennung.
export const PASSEND = 0

// Rueckfall, wenn nicht gemessen werden kann (kein ResizeObserver im alten
// WinUI): dieselbe Zahl, mit der die Tabelle bis 2026-08-06 immer lief.
export const OHNE_MESSUNG = ZEILEN_PRO_SEITE[0]

// Wie viele Zeilen passen in einen Rumpf dieser Hoehe? Der Kopf sitzt IM
// scrollenden Rumpf (siehe tabelleStil) und geht darum ab.
// Abgerundet — eine halb sichtbare Zeile ist keine Zeile. Mindestens 1:
// eine Seite ohne Zeilen zeigte gar nichts und liesse sich nicht durchblaettern.
export function passendeZeilen(rumpfHoehe: number, kopfHoehe: number): number {
  return Math.max(1, Math.floor((rumpfHoehe - kopfHoehe) / ZEILEN_HOEHE))
}

export interface Aufteilung {
  // Wie viele Seiten es gibt (mindestens 1 — „Seite 1 von 0" gibt es nicht).
  seiten: number
  // Die Seite, die wirklich gezeigt wird: der Wunsch, in die Grenzen geklemmt.
  seite: number
  // Was gezeichnet wird — je Eintrag ein Rohindex in datenzeilen, oder null
  // fuer eine Platzhalter-Zeile (nur im Editor).
  zeilen: (number | null)[]
}

export interface AufteilungFrage {
  // Sichtbare Zeilen als Rohindizes (schon gesucht und sortiert).
  sichtbar: readonly number[]
  // Kommen echte Daten? (Editor ohne Quelle -> Platzhalter statt Daten.)
  hatQuelle: boolean
  proSeite: number
  // Auf welcher Seite der Bediener stehen WILL (kann veraltet sein).
  wunschSeite: number
  // Wie viele Platzhalter-Zeilen der Editor zeigt.
  platzhalterZeilen: number
}

// Welche Zeilen zeigt die aktuelle Seite?
//
// WICHTIG (2026-08-06): in der laufenden Maske wird NICHT mehr aufgefuellt.
// Vorher bekam jede Seite genau `proSeite` Zeilen — die fehlenden als leere
// Zeilen. Bei 3 Saetzen und 10 pro Seite standen also 7 leere Zeilen da, die
// sich beim Ueberfahren brav hinterlegten und beim Klick nichts taten: sie
// sahen aus wie Daten, die noch laden. Ein Satz ist eine Zeile, sonst nichts;
// den leeren Rest zeichnet das Lineal weiter (dieselbe Optik, ohne Luege).
// Im EDITOR bleiben die Platzhalter-Zeilen: dort steht kein Satz zur
// Verfuegung, und ein leerer Rahmen waere als Tabelle nicht zu erkennen.
export function seitenAufteilung({
  sichtbar,
  hatQuelle,
  proSeite,
  wunschSeite,
  platzhalterZeilen,
}: AufteilungFrage): Aufteilung {
  const seiten = hatQuelle ? Math.max(1, Math.ceil(sichtbar.length / proSeite)) : 1
  // Seite einklemmen: eine geschrumpfte Datenmenge (neuer SE-Push) darf den
  // Bediener nicht auf einer Seite stehen lassen, die es nicht mehr gibt.
  const seite = Math.min(Math.max(wunschSeite, 0), seiten - 1)
  if (!hatQuelle) {
    return { seiten, seite, zeilen: Array.from({ length: platzhalterZeilen }, () => null) }
  }
  return { seiten, seite, zeilen: [...sichtbar.slice(seite * proSeite, (seite + 1) * proSeite)] }
}
