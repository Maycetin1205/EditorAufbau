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

import { html, type TemplateResult } from 'lit'
import { pfoteIcon } from './pfote'
import { TIER_BILDER } from './tierBilder'

// Der einzige Rueckfall: unbekannte Tierart -> Pfote. Sie wohnt seit
// 2026-08-07 in ./pfote — der Leerzustand braucht dieselbe, und zwei
// Zeichnungen derselben Pfote koennen auseinanderlaufen.

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

// Nur das BILD — ohne jeden Rueckfall: kennt die Liste den Wert nicht, kommt
// undefined zurueck und der Aufrufer zeichnet gar nichts.
//
// Zwei Aufrufer, zwei Haltungen (2026-08-06): die KARTE hat eine Avatar-Stelle,
// die ausdruecklich fuer Tierarten da ist — dort ist die Pfote der ehrliche
// Rueckfall („ein Tier, das ich nicht kenne"). Die Tabellen-Spalte „Bild + Name"
// ist dagegen allgemein: der Bauer kann JEDES Feld daran binden. Stuende dort
// eine Pfote, behauptete die Spalte, ein Sachbearbeiter oder eine Zimmernummer
// sei ein Tier (Nutzer-Ansage 2026-08-06: „das soll ja nicht nur Tierarten
// anzeigen ... auch keinen Platzhalter oder so").
export function tierBild(wert: string): TemplateResult | undefined {
  const bild = tierBildName(wert)
  const quelle = bild === '' ? undefined : TIER_BILDER[bild]
  if (quelle === undefined) return undefined
  // alt bleibt leer: der Klarname der Tierart steht als Text daneben auf der
  // Karte — eine zweite Ansage waere fuer den Vorleser nur Laerm.
  return html`<img src=${quelle} alt="" aria-hidden="true" />`
}

export function tierIcon(wert: string): TemplateResult {
  return tierBild(wert) ?? pfoteIcon()
}
