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
// Wer die Zahl bestimmt (Nutzer-Entscheidung 2026-08-05): der BAUER stellt sie
// im Editor am Ding ein (Prop `proSeite`, Standard PASSEND). Ob der BEDIENER
// sie in der Maske noch umstellen darf, ist eine eigene Maskeneinstellung
// (`zeilenWaehler`, Standard nein) — wie die Suchzeile. Vorher stand der
// Waehler bedingungslos in jeder exportierten Maske.
//
// Warum die Zeilenhoehe HIER wohnt und nicht mehr im CSS: sie war die Zahl,
// mit der das Aussehen (tabelleStil) und die Rechnung (diese Datei) beide
// arbeiten muessen. Stand sie nur im CSS, muesste die Rechnung sie erraten —
// und beim naechsten Optik-Feinschliff rechnete sie still falsch. Jetzt gibt
// es EINE Zahl an EINER Stelle: der Baustein setzt sie beim Zeichnen als
// CSS-Variable, das Stylesheet liest nur noch var(--zeilen-hoehe).

// Der GRUNDTAKT der Tabelle in Pixeln. Kopf UND Zeilen bekommen ihn als FESTE
// Hoehe (nicht aus Schrift + Innenabstand geschaetzt) — nur so laufen die
// weitergezeichneten Linien des Lineals im selben Takt wie echte Zeilen.
// Ein geschaetzter Wert lief hier schon einmal 4,25px je Zeile aus dem Takt
// und sah nach vier Zeilen sichtbar krumm aus (Nutzer 2026-07-25).
//
// Seit 2026-08-06 ist es der Grund-, nicht mehr der einzige Takt: eine Spalten-
// Art darf mehr verlangen (./spaltenArten, zeilenHoeheFuer — „Bild + Name"
// braucht zwei Textzeilen). Der jeweils geltende Takt wandert von dort durch
// den Baustein bis hierher; geraten wird er nirgends.
export const ZEILEN_HOEHE = 32

// Die festen Zahlen zur Wahl. „Passend zur Hoehe" steht NICHT hier: das ist
// kein fester Wert, sondern das Ergebnis der Messung (PASSEND als Kennung).
export const ZEILEN_PRO_SEITE = [10, 25, 50] as const

// Kennung fuer „passend zur Hoehe" — gleichzeitig der Wert der Prop `proSeite`
// am Baustein UND der Wert im Waehler: EINE Schreibweise fuer dieselbe Sache,
// damit Bauplan und Bedienung nicht auseinanderlaufen. Auch der Standard.
export const PASSEND = 'passend'

// Rueckfall, wenn nicht gemessen werden kann (kein ResizeObserver im alten
// WinUI, oder kein Raster mit vorgegebener Hoehe).
export const OHNE_MESSUNG = ZEILEN_PRO_SEITE[0]

// Derselbe Fall im EDITOR, wo Platzhalter-Striche stehen statt Saetzen.
const PLATZHALTER_OHNE_MESSUNG = 4

// Wie viele PLATZHALTER-Zeilen der Editor zeichnet.
//
// Bis 2026-08-07 waren es stur vier — egal, wie hoch die Tabelle im Raster
// stand. Zwei Fehler in einem (Nutzer-Meldung 2026-08-07 „in der Tabelle ist
// IMMER eine leere Zeile"):
//   1. Unter den vier Strichen blieb Platz uebrig, den das Lineal fuellte. Mit
//      seinen Spaltentrennern liest sich dieser Streifen wie eine leere Zeile —
//      und zwar bei JEDER Tabelle, die hoeher als vier Zeilen ist.
//   2. WYSIWYG-Bruch: die MASKE zeigt so viele Zeilen, wie hineinpassen
//      (gemessen), der Editor zeigte vier. Der Bauer sah also nie, wie voll
//      seine Tabelle in SoftEngine wirklich wird.
// Beides faellt weg, sobald hier dieselbe Zahl gilt wie fuer echte Daten.
//
// Dieselbe Reihenfolge wie fuer Daten (feste Zahl gewinnt, sonst die Messung),
// nur der Rueckfall ist ein anderer: OHNE_MESSUNG waere 10, und zehn Striche in
// einer Tabelle, die im Fluss steht und mit ihrem Inhalt WAECHST, blasen sie
// auf. Dort bleiben es vier.
export function platzhalterZeilen(einstellung: string, gemessen: number | null): number {
  return proSeiteAusEinstellung(einstellung) ?? gemessen ?? PLATZHALTER_OHNE_MESSUNG
}

// Die Einstellung („passend" oder eine Zahl als Text, wie sie im Attribut
// steht) in eine Zeilenzahl uebersetzen. null heisst „gemessen" — dann
// entscheidet passendeZeilen bzw. der Rueckfall.
//
// Defensiv gegen alles Unbekannte: ein Attribut aus einem alten Stand oder von
// Hand verstellt fuehrt auf „passend" zurueck, nie auf einen Absturz und nie
// auf eine erfundene Zahl. Nur die Zahlen aus ZEILEN_PRO_SEITE gelten — sonst
// koennte eine „1000" im Attribut die Maske in eine endlose Seite verwandeln.
export function proSeiteAusEinstellung(wert: string): number | null {
  const zahl = Number(wert)
  return ZEILEN_PRO_SEITE.some((n) => n === zahl) ? zahl : null
}

// Wie viele Zeilen passen in einen Rumpf dieser Hoehe? Der Kopf sitzt IM
// scrollenden Rumpf (siehe tabelleStil) und geht darum ab.
// Abgerundet — eine halb sichtbare Zeile ist keine Zeile. Mindestens 1:
// eine Seite ohne Zeilen zeigte gar nichts und liesse sich nicht durchblaettern.
//
// Der Takt kommt HEREIN und wird nicht mehr aus ZEILEN_HOEHE genommen: seit
// eine Bild-Spalte den Takt erhoeht, rechnete die feste Zahl sonst still zu
// viele Zeilen aus — und die letzten davon staenden unter dem Rand.
export function passendeZeilen(
  rumpfHoehe: number,
  kopfHoehe: number,
  zeilenHoehe: number,
): number {
  return Math.max(1, Math.floor((rumpfHoehe - kopfHoehe) / zeilenHoehe))
}

// Wie viele GANZE Zeilentakte darf das Lineal unter den Zeilen dieser Seite
// noch zeichnen?
//
// Warum es die Frage gibt (Nutzer-Meldung 2026-08-07, erneut 2026-08-10:
// „unter der letzten Zeile steht IMMER eine leere"): die Bausteinhoehe waechst
// in 20-px-Schritten des Rasters, eine Zeile ist 32 px hoch — der Rest trifft
// nie null, er liegt zwischen 2 und 30 px. Bis hierher nahm das Lineal diesen
// Rest mit `flex: 1 1 auto` auf und malte seine Spaltentrenner hinein. Ein
// solcher Streifen liest sich wie eine Zeile: leer, und je nach Rest auch noch
// duenner als die echten darueber.
//
// Die Rechnung war nie falsch — `passendeZeilen` rundet ab, und das bleibt so.
// Falsch war nur, dass ihr REST wie eine Zeile aussah. Das Lineal bekommt
// darum eine feste Hoehe aus ganzen Takten; was darunter uebrig bleibt, traegt
// gar keine Zeichnung mehr (die Panel-Flaeche der Tabelle).
//
// null heisst „nicht messbar" (kein ResizeObserver im alten WinUI, oder die
// Tabelle steht im Fluss ohne vorgegebene Hoehe). Dann bleibt es beim
// mitwachsenden Lineal: ohne Messung waere jede Takt-Zahl geraten — und im
// Fluss ist gar kein Rest da, den es fuellen koennte.
export function linealTakte(passen: number | null, gezeichnet: number): number | null {
  if (passen === null) return null
  return Math.max(0, passen - gezeichnet)
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
