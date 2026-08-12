// Die Geber-Zuordnung der holenden Quellen (Welle R, Etappe R3).
//
// Geprüft wird die EINE Stelle, an der sich R3 entscheiden hat: aus welchem
// Attribut liest der Auslöser die Auswahl-Quelle eines Gebers? Bis R3 stand
// dort hart `source` — Tabelle und Kanban wurden gefunden, das
// Nachschlage-Formularfeld nie, weil es seine Quelle in `nachschlagQuelle`
// nennt (Registry: satzWahl.quelleProp) und `source` bei ihm gar nicht erst
// exportiert wird.
//
// Node-Test ohne DOM (wie die übrigen Tests dieses Projekts): der DOM-Scan
// selbst bleibt ungetestet — er wäre eine neue Testgattung (Regel 9). Was
// hier hängen bleibt, ist der Fehler, der R3 überhaupt nötig machte: ein
// Geber-Baustein, der in dieser Zuordnung fehlt oder auf dem falschen
// Attribut steht.

import { describe, expect, it } from 'vitest'
// Side-Effect-Importe: registrieren die echten Bausteine (Muster export.test).
import '../formfeld/FormFeldBlock'
import '../tabelle/TabelleBlock'
import '../kanban/KanbanBlock'
import '../trenner/TrennerBlock'
import { quelleAttrJeTag } from './holendeQuellen'

describe('quelleAttrJeTag', () => {
  it('nimmt für das Nachschlage-Feld dessen Nachschlage-Quelle', () => {
    // Der Fall aus R3: die Wahl im Nachschlage-Fenster stammt aus der
    // NACHSCHLAGE-Quelle, nicht aus einer eigenen Datenquelle.
    expect(quelleAttrJeTag().get('ff-formfeld')).toBe('nachschlagquelle')
  })

  it('nimmt für Zeilen-Geber die normale Datenquelle', () => {
    const map = quelleAttrJeTag()
    expect(map.get('ff-tabelle')).toBe('source')
    expect(map.get('ff-kanban')).toBe('source')
  })

  it('kennt nur Bausteine, an denen der Bediener einen Satz herausgreift', () => {
    // Ohne SatzWahl gibt es nichts abzugeben — der Trenner taucht nie auf,
    // auch wenn er (theoretisch) irgendein source-Attribut trüge.
    expect(quelleAttrJeTag().has('ff-trenner')).toBe(false)
  })
})
