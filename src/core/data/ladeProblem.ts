// ladeProblem — die Form, in der ein Sanitizer sagt, WAS er nicht uebernehmen
// konnte (A4).
//
// Bis hierher lieferten `sanitizeDataSources` und `sanitizeRelationTemplates`
// nur eine kuerzere Liste: ein kaputter Eintrag verschwand, und der naechste
// Speicherlauf schrieb die ausgeduennte Bibliothek fest. Der Bediener sah
// nichts — genau der Verlust, den Regel 4 verbietet.
//
// Bewusst OHNE „Bereich": in welcher Bibliothek der Eintrag stand, weiss der
// Aufrufer, nicht der Sanitizer. Der Aufrufer setzt ihn davor
// (state/ladeKette.LadeProblem).
//
// Und bewusst ein SATZ-BRUCHSTUECK als Grund, kleingeschrieben: der Fund
// erscheint im Datei-Weg hinter „Die Datei ist beschädigt: …".
export interface EintragProblem {
  // Eintrags-id, wo es eine gibt — sonst die Position („Eintrag 3"), damit
  // der Bediener die Stelle in seiner Datei findet.
  stelle: string
  grund: string
}

// Derselbe Fund, sobald der Aufrufer weiss, WORIN er steckt. Diese Form
// zeigt die Ablehnung einer Maskendatei.
export interface LadeProblem extends EintragProblem {
  bereich: string
}

// Die drei Bereiche eines Standes, mit ihren Namen fuer den Bediener. Sie
// stehen hier und nicht bei den Ladewegen, damit Browser-Speicher und
// Maskendatei denselben Bereich nennen (A4) — und damit die
// Topologie-Pruefung sie ohne Ringschluss erreicht.
export const BEREICH_AUFBAU = 'Masken-Aufbau'
export const BEREICH_QUELLEN = 'Datenquellen'
export const BEREICH_RELATIONEN = 'Relationen'

// Funde eines Sanitizers in ihren Bereich stellen.
//
// Der leere Fall ist kein Versehen: das KRITERIUM „ist etwas verlorengegangen"
// ist der Vergleich (state/ladeKette.keinVerlust), nicht die Meldung des
// Sanitizers. Ein Wert, den der Sanitizer gar nicht ansieht — `idbId: 42`,
// `fields: "kaputt"` —, verschwindet lautlos und wird von ihm nicht gemeldet.
// Dann sagt der Fund wenigstens den Bereich, statt zu schweigen.
export function mitBereich(
  bereich: string,
  probleme: readonly EintragProblem[],
): LadeProblem[] {
  if (probleme.length === 0) {
    return [{ bereich, stelle: '', grund: 'Angaben in diesem Bereich stimmen nicht' }]
  }
  return probleme.map((p) => ({ bereich, stelle: p.stelle, grund: p.grund }))
}
