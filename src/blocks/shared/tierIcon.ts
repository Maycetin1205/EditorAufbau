// tierIcon — Datenwert -> Tierzeichen fuer die Avatar-Stelle.
//
// Umgezogen von blocks/card/ nach blocks/shared/ (2026-08-06): die Zeichen
// gehoeren nicht mehr der Karte allein, sie sind Teil der Designsprache.
//
// Die BILDER sind die des Nutzers (./tierBilder, eingebettet). Bis zum
// 2026-08-06 standen hier sechs einfarbige Silhouetten aus der
// Empfang-Referenzmaske; sie sind ersetzt (Nutzer-Ansage: „diese ERSETZEN die
// bisherigen Tierformen ueberall, auch auf der Karte"). Geblieben ist genau
// eine gezeichnete Form: die PFOTE als Rueckfall fuer alles, was die Liste
// unten nicht kennt. Sie bleibt bewusst ein SVG in currentColor — ein
// Rueckfall soll nach Rueckfall aussehen und nicht nach einem elften Tier.
//
// Zehn Arten statt sechs (Nutzer-Entscheidung 2026-08-06): dazugekommen sind
// Meerschweinchen (fiel bisher auf den Hamster), Fisch und Pferd (fielen auf
// die Pfote) sowie die Schlange (fiel auf die Schildkroete).
//
// Die SCHLUESSELWORT-Suche stammt der Form nach aus der Empfang-Referenzmaske:
// der Datenwert ist Freitext („Europaeisch Kurzhaar-Katze", „Zwergkaninchen"),
// und das erste passende Wort gewinnt. Die REIHENFOLGE ist deshalb Teil der
// Regel und nicht zufaellig — laengere/spezifischere Woerter stehen vor
// kuerzeren, sonst faengt „hase" das Wort „Rennmaus-Hase" nicht mehr richtig
// und „ratte" schluckt nichts, was spaeter kommt. Ob ein LEERER Wert den
// Avatar ganz versteckt, entscheidet die Karte (Leer-Regel), nicht dieses
// Modul.
//
// Eine pflegbare Wert->Bild-Zuordnung (installations-individuell) ist ein
// eigenes spaeteres Paket — bis dahin ist diese eingebaute Liste der Standard.

import { html, svg, type TemplateResult } from 'lit'
import { TIER_BILDER } from './tierBilder'

// Der einzige Rueckfall: unbekannte Tierart -> Pfote. Einfarbig (currentColor),
// damit sie die Farbe ihrer Umgebung annimmt.
const PFOTE = svg`<circle cx="6.8" cy="9.6" r="1.9"></circle><circle cx="10.4" cy="7.2" r="1.9"></circle><circle cx="14.6" cy="7.2" r="1.9"></circle><circle cx="18.2" cy="9.6" r="1.9"></circle><path d="M12.5 11.2c-2.9 0-5.3 2.1-5.3 4.4 0 1.7 1.3 2.9 3.1 2.9.9 0 1.5-.3 2.2-.3s1.3.3 2.2.3c1.8 0 3.1-1.2 3.1-2.9 0-2.3-2.4-4.4-5.3-4.4z"></path>`

// Schluesselwort -> Bildname in ./tierBilder. Erstes Vorkommen im (klein
// geschriebenen) Datenwert gewinnt.
const TIER_KEY: ReadonlyArray<readonly [string, string]> = [
  ['welpe', 'hund'], ['hund', 'hund'],
  ['kater', 'katze'], ['katze', 'katze'],
  ['kaninchen', 'kaninchen'], ['hase', 'kaninchen'],
  // Meerschweinchen VOR Hamster/Maus: ein „Rosetten-Meerschweinchen" enthaelt
  // kein anderes Schluesselwort, aber die Reihenfolge haelt die Absicht fest.
  ['meerschwein', 'meerschweinchen'],
  ['hamster', 'hamster'], ['ratte', 'hamster'], ['maus', 'hamster'],
  ['wellensittich', 'vogel'], ['sittich', 'vogel'], ['papagei', 'vogel'], ['vogel', 'vogel'],
  // Schildkroete VOR den uebrigen Reptilien: sie hat ein eigenes Bild, die
  // Schlange auch — Echse und Gecko haben keins und nehmen die Schlange.
  ['schildkr', 'schildkroete'],
  ['schlange', 'schlange'], ['natter', 'schlange'], ['python', 'schlange'],
  ['echse', 'schlange'], ['gecko', 'schlange'], ['reptil', 'schlange'],
  ['fisch', 'fisch'], ['koi', 'fisch'],
  ['pferd', 'pferd'], ['pony', 'pferd'], ['fohlen', 'pferd'],
]

// Welches Bild gehoert zu diesem Datenwert? '' = keins, dann die Pfote.
// Eigene Funktion, damit die Entscheidung pruefbar ist, statt im Zeichnen zu
// verschwinden (dasselbe Muster wie tabelle/suche.zeigtEchteDaten).
export function tierBildName(wert: string): string {
  const a = wert.toLowerCase()
  for (const [wort, bild] of TIER_KEY) {
    if (a.includes(wort)) return bild
  }
  return ''
}

export function tierIcon(wert: string): TemplateResult {
  const bild = tierBildName(wert)
  const quelle = bild === '' ? undefined : TIER_BILDER[bild]
  if (quelle === undefined) {
    return html`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${PFOTE}</svg>`
  }
  // alt bleibt leer: der Klarname der Tierart steht als Text daneben auf der
  // Karte — eine zweite Ansage waere fuer den Vorleser nur Laerm.
  return html`<img src=${quelle} alt="" aria-hidden="true" />`
}
