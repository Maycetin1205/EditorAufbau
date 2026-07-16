// tierIcon — Wert -> Tier-Silhouette fuer die Avatar-Stelle der Karte.
//
// Icons und Schluesselwortliste stammen 1:1 aus der Empfang-Referenzmaske
// (Projekte/Aufbau/empfang, Regel 5: nur Originalquellen, nichts geraten):
// der Datenwert (z.B. "Hund", "Europaeisch Kurzhaar-Katze") wird per
// Schluesselwort-Suche einer von sechs Silhouetten zugeordnet, unbekannte
// Werte zeigen die Pfote. Ob ein LEERER Wert den Avatar komplett versteckt,
// entscheidet die Karte (Leer-Regel), nicht dieses Modul.
//
// Eine pflegbare Wert->Bild-Zuordnung (installations-individuell) ist ein
// eigenes spaeteres Paket — bis dahin ist diese eingebaute Liste der Standard.

import { html, svg, type TemplateResult } from 'lit'

const TIER_SVG: Record<string, TemplateResult> = {
  dog: svg`<ellipse cx="12" cy="13.5" rx="6.3" ry="7"></ellipse><ellipse cx="5.2" cy="11.5" rx="2.4" ry="5.2" transform="rotate(14 5.2 11.5)"></ellipse><ellipse cx="18.8" cy="11.5" rx="2.4" ry="5.2" transform="rotate(-14 18.8 11.5)"></ellipse>`,
  cat: svg`<path d="M5.2 10.5 L3.6 3.2 L10 6.4 Z"></path><path d="M18.8 10.5 L20.4 3.2 L14 6.4 Z"></path><circle cx="12" cy="13.5" r="7"></circle>`,
  rabbit: svg`<ellipse cx="8.8" cy="6.5" rx="2.3" ry="5.6" transform="rotate(-10 8.8 6.5)"></ellipse><ellipse cx="15.2" cy="6.5" rx="2.3" ry="5.6" transform="rotate(10 15.2 6.5)"></ellipse><circle cx="12" cy="16" r="6.2"></circle>`,
  hamster: svg`<circle cx="7.6" cy="8.8" r="2"></circle><ellipse cx="12" cy="14" rx="8.3" ry="6"></ellipse>`,
  bird: svg`<circle cx="9.2" cy="8.8" r="4.6"></circle><ellipse cx="12.5" cy="14.8" rx="5.2" ry="5.4"></ellipse><path d="M5.2 7.6 L2 9.2 L5.4 10.6 Z"></path><path d="M15.5 16.5 L22 20.5 L17.6 13.8 Z"></path>`,
  reptile: svg`<path d="M4.5 14.8 Q4.5 7.2 12 7.2 Q19.5 7.2 19.5 14.8 Z"></path><circle cx="20.6" cy="13.9" r="2.1"></circle><rect x="6.2" y="14.6" width="2.6" height="3" rx="1.2"></rect><rect x="13.4" y="14.6" width="2.6" height="3" rx="1.2"></rect>`,
  paw: svg`<circle cx="6.8" cy="9.6" r="1.9"></circle><circle cx="10.4" cy="7.2" r="1.9"></circle><circle cx="14.6" cy="7.2" r="1.9"></circle><circle cx="18.2" cy="9.6" r="1.9"></circle><path d="M12.5 11.2c-2.9 0-5.3 2.1-5.3 4.4 0 1.7 1.3 2.9 3.1 2.9.9 0 1.5-.3 2.2-.3s1.3.3 2.2.3c1.8 0 3.1-1.2 3.1-2.9 0-2.3-2.4-4.4-5.3-4.4z"></path>`,
}

const TIER_KEY: ReadonlyArray<readonly [string, string]> = [
  ['welpe', 'dog'], ['hund', 'dog'], ['kater', 'cat'], ['katze', 'cat'],
  ['kaninchen', 'rabbit'], ['hase', 'rabbit'], ['meerschweinchen', 'hamster'],
  ['hamster', 'hamster'], ['ratte', 'hamster'], ['maus', 'hamster'],
  ['wellensittich', 'bird'], ['sittich', 'bird'], ['papagei', 'bird'], ['vogel', 'bird'],
  ['schildkr', 'reptile'], ['echse', 'reptile'], ['schlange', 'reptile'],
  ['gecko', 'reptile'], ['reptil', 'reptile'],
]

export function tierIcon(wert: string): TemplateResult {
  const a = wert.toLowerCase()
  let key = 'paw'
  for (const [wort, icon] of TIER_KEY) {
    if (a.includes(wort)) {
      key = icon
      break
    }
  }
  return html`<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${TIER_SVG[key]}</svg>`
}
