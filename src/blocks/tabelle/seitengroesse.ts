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
// Wer die Zahl bestimmt (Nutzer-Entscheidung 2026-08-11, Etappe S2.1): NIEMAND.
// Es passen so viele Zeilen hinein, wie hineinpassen — Punkt. Bis dahin gab es
// dafuer einen Waehler mit vier Werten (passend zur Hoehe / 10 / 25 / 50): der
// Bauer stellte ihn im Editor am Ding ein (Prop `proSeite`), und eine zweite
// Maskeneinstellung (`zeilenWaehler`) entschied, ob der Bediener ihn spaeter
// uebersteuern darf. Beide sind weg, mit beiden ihre Folgen: eine feste Zahl in
// einer hohen Tabelle liess unten Platz stehen, in einer flachen erzwang sie
// Scrollen — und eine Tabelle scrollt nie innen (Nutzer: geblaettert wird mit
// der Fusszeile, gesucht mit der Suchleiste).
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

// Rueckfall, wenn nicht gemessen werden kann (kein ResizeObserver im alten
// WinUI, oder kein Raster mit vorgegebener Hoehe). Die 10 war bis 2026-08-11
// der erste Wert der Waehler-Liste; die Liste ist weg, der Rueckfall bleibt.
export const OHNE_MESSUNG = 10

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
// Dieselbe Quelle wie fuer Daten (die Messung), nur der Rueckfall ist ein
// anderer: OHNE_MESSUNG waere 10, und zehn Striche in einer Tabelle, die im
// Fluss steht und mit ihrem Inhalt WAECHST, blasen sie auf. Dort bleiben es vier.
export function platzhalterZeilen(gemessen: number | null): number {
  return gemessen ?? PLATZHALTER_OHNE_MESSUNG
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

// Das ZEILENMASS dieser Tabelle: wie viele Zeilen, und wie hoch jede davon
// GEZEICHNET wird.
//
// Warum die zweite Zahl noetig wurde (Nutzerprobe zu S2, Etappe S2.1
// 2026-08-11): unter der letzten Zeile bleibt geometrisch IMMER ein Rest. Die
// Bausteinhoehe waechst in 20-px-Schritten des Rasters (Zeile 12 + Abstand 8),
// eine Zeile ist 32 px hoch — der Rest trifft nie null, er liegt zwischen 2 und
// 30 px. S2 hat ihn aufgehoert zu BEMALEN (vorher las er sich als leere,
// duennere Zeile); uebrig blieb ein leerer Streifen, und der stoert weiter.
//
// Jetzt bekommt ihn keine eigene Flaeche mehr, sondern er wird auf die Zeilen
// VERTEILT: jede wird um Rest/Anzahl hoeher, bei einer normal hohen Tabelle
// also um 1 bis 4 px. Fuer das Auge sind alle Zeilen gleich, die Fusszeile sitzt
// buendig an der letzten, und Editor und Maske rechnen dasselbe (eine
// Render-Quelle). Die ANZAHL bleibt unberuehrt — gezaehlt wird weiter mit dem
// Takt, sonst haette eine hoehere Zeile wieder weniger Zeilen zur Folge.
//
// Zwei Grenzen, beide bewusst:
//   * Passt nicht einmal EIN ganzer Takt hinein, wird nichts verteilt. Sonst
//     schrumpfte die einzige Zeile auf die Resthoehe (eine 10-px-Zeile ist
//     schlimmer als eine, die unten anstoesst).
//   * Abgeschnitten auf 1/100 px, nie aufgerundet. Sonst koennte die Summe der
//     Zeilen den Rumpf um einen Bruchteil ueberragen — das gibt eine senkrechte
//     Scrollleiste, die die Breite aendert, die Messung neu anstoesst und die
//     Tabelle zwischen zwei Zeilenzahlen zappeln laesst. Der so verschenkte
//     Rest ist kleiner als ein halbes Pixel.
export interface Zeilenmass {
  // Wie viele Zeilen eine Seite zeigt.
  passen: number
  // Die Hoehe, mit der eine Zeile (und ein Lineal-Takt) gezeichnet wird.
  zeilenHoehe: number
}

export function zeilenmass(
  rumpfHoehe: number,
  kopfHoehe: number,
  takt: number,
): Zeilenmass {
  const passen = passendeZeilen(rumpfHoehe, kopfHoehe, takt)
  const platz = rumpfHoehe - kopfHoehe
  if (platz < takt) return { passen, zeilenHoehe: takt }
  return { passen, zeilenHoehe: Math.floor((platz / passen) * 100) / 100 }
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
// darum eine feste Hoehe aus ganzen Takten. Was darunter uebrig blieb, war ab
// S2 eine unbemalte Flaeche; seit S2.1 gibt es sie gar nicht mehr — der Rest
// steckt in den Zeilen (s. `zeilenmass`), und ein Takt ist genau so hoch wie
// eine Zeile.
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
