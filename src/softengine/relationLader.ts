// relationLader — Welle R: „Zeilen per Relation holen".
//
// Eine Quelle dieser Lade-Art bestellt bei SoftEngine keine SEFILELOOP
// (R1/exportMask); stattdessen holt die laufende Maske die Positionen des
// GEWÄHLTEN Belegs selbst — je Position ein GET_RELATION über die eine
// serielle Warteschlange (relations, Muster seGetNewIndex). Alle Kontrakte
// sind in der SoftEngine des Nutzers live belegt (Echttests 2026-08-10/11,
// Wellenkopf R im UMBAU-PLAN-V6.md):
//
//  - PARAMS je Frage: [BELART, POS, LEN, BELNR, JAHR, ARCHIV, '', POSNR,
//    '', '', '', ''] — die Feldzuordnungen der GEBER-Zeile stehen in der
//    Hol-Relation (FF_DATA_SOURCES.ladeRelation, R1).
//  - Breiter Schnitt POS=0/LEN=255 liefert die vordere Positionszeile in
//    EINEM Aufruf (die Antwortvariable fasst 255 Zeichen); nur Felder
//    dahinter kosten je eine eigene Frage (lade.zusatzFelder, vom Export
//    abgezählt — felderHinterSchnitt).
//  - Ende der Liste: die endeFelder (belegt 11_6 + 18_25) ZUSAMMEN leer.
//    SoftEngine antwortet hinter dem Ende mit LEEREM RESULT — darum fragt
//    der Lader mit satzAntwort (relations): die Antwort bleibt roh
//    (Spaltenpositionen!), und auch leer zählt als Antwort, sonst liefe
//    jedes Listen-Ende in den Timeout. Weil hier LEER etwas bedeutet, gilt
//    auch nur die belegte RESULT-Form als Antwort (extractSatzAntwort):
//    ein fremdes Paket mit irgendeinem leeren Feld schnitte die Liste sonst
//    mitten in den Positionen ab.
//  - KEIN ERPAPICALL: das friert die WinUI-Maske des Nutzers ein.
//
// Wer stößt an? blocks/shared/holendeQuellen — der Auswahl-Zustand wohnt in
// der Baustein-Schicht, diese Schicht kennt NIE einen Baustein. Sie bekommt
// die gewählte GEBER-Zeile fertig hereingereicht.
//
// Wohin fließen die Zeilen? In den geholteZeilen-Speicher, den rowsFor
// (data.ts) als letzten Weg liest — ab da verhält sich die Quelle wie jede
// andere (Tabelle, Verknüpfung, Ketten, Auswahl geben/folgen). Zum Schluss
// klingelt meldeNeueDaten (bridge) dieselbe Glocke wie ein Daten-Push.

import { meldeNeueDaten } from './bridge'
import { getField, type RuntimeLadeRelation } from './data'
import { geholteZeilenFuer, setzeGeholteZeilen } from './geholteZeilen'
import { executeRelation } from './relations'
import { meldeFehler } from './meldung'

// Notbremse gegen eine Endlos-Schleife: antwortet eine falsch eingestellte
// Relation IMMER mit Inhalt (Ende-Felder nie zusammen leer), würde der
// Lader sonst ewig weiterfragen. 999 ist bewusst großzügig — ein echter
// Beleg bleibt weit darunter; wird der Deckel doch erreicht, sagt es der
// Fehlerbalken im Klartext, statt still eine halbe Liste zu zeigen.
const MAX_POSITIONEN = 999

// Der breite Schnitt (Wellenkopf R): POS=0, LEN=255.
const SCHNITT_POS = '0'
const SCHNITT_LEN = '255'

export interface HolQuelle {
  id: string
  name: string
}

// Klickt der Bediener schnell zwei Belege nacheinander, läuft das Holen des
// ersten noch, wenn das zweite startet. Jeder Start erhöht die Generation
// seiner Quelle; ein laufendes Holen prüft nach JEDER Antwort, ob es noch
// die aktuelle ist — überholt heißt: still aussteigen, nichts einspeisen.
const generationen = new Map<string, number>()

// Leeren, aber nur klingeln, wenn vorher etwas zu sehen war — sonst
// zeichnete jeder folgenlose Auswahl-Wechsel die ganze Maske neu.
function leereQuelle(name: string): void {
  const vorher = geholteZeilenFuer(name)
  setzeGeholteZeilen(name, [])
  if (vorher !== undefined && vorher.length > 0) meldeNeueDaten()
}

// Eine Frage an die Hol-Relation: der Ausschnitt [pos, len] der Position
// posNr. Timeout und fehlende Verbindung lösen still zu '' auf (Optionen);
// '' wiederum liest der Aufrufer als „nichts da" — still-harmlos.
async function frage(
  lade: RuntimeLadeRelation,
  schluessel: { belegart: string; belegnummer: string; jahr: string; archiv: string },
  posNr: number,
  pos: string,
  len: string,
): Promise<string> {
  const antwort = await executeRelation(
    { id: 'relation-lader', verb: 'GET_RELATION', nr: lade.nr, params: [] },
    [
      schluessel.belegart,
      pos,
      len,
      schluessel.belegnummer,
      schluessel.jahr,
      schluessel.archiv,
      '',
      String(posNr),
      '',
      '',
      '',
      '',
    ],
    { still: true, satzAntwort: true },
  )
  return antwort.wert
}

// Auswahl der Geber-Quelle hat gewechselt: Zeilen neu holen (oder leeren).
// `geberZeile` undefined = Abwahl. Läuft asynchron; eingespeist wird erst,
// wenn ALLES da ist (Anzeige erst am Ende) — außer dem sofortigen Leeren,
// denn die Positionen des VORHERIGEN Belegs dürfen nicht stehen bleiben,
// während die neuen laden.
export function ladeZeilenPerRelation(
  quelle: HolQuelle,
  lade: RuntimeLadeRelation,
  geberZeile: unknown,
): void {
  const gen = (generationen.get(quelle.id) ?? 0) + 1
  generationen.set(quelle.id, gen)

  if (geberZeile === undefined) {
    leereQuelle(quelle.name)
    return
  }

  const schluessel = {
    belegart: getField(geberZeile, lade.belegartFeld),
    belegnummer: getField(geberZeile, lade.belegnummerFeld),
    // Jahr/Archiv dürfen leer zugeordnet sein — dann gehen sie leer hinaus
    // und die Relation findet nur den aktuellen Nummernkreis (belegt
    // 2026-08-11: leer fand die 262er-Belege, erst mit Werten auch die 261er).
    jahr: lade.jahrFeld === '' ? '' : getField(geberZeile, lade.jahrFeld),
    archiv: lade.archivFeld === '' ? '' : getField(geberZeile, lade.archivFeld),
  }
  // Halber Schlüssel trifft nichts — dieselbe Regel wie schluesselAus in
  // fremdeQuellen: mit leerer Belegart/-nummer zu fragen hieße raten.
  if (schluessel.belegart === '' || schluessel.belegnummer === '') {
    leereQuelle(quelle.name)
    return
  }

  leereQuelle(quelle.name)

  void (async () => {
    const zeilen: Record<string, string>[] = []
    let endeGesehen = false

    for (let posNr = 1; posNr <= MAX_POSITIONEN; posNr += 1) {
      const satz = await frage(lade, schluessel, posNr, SCHNITT_POS, SCHNITT_LEN)
      if (generationen.get(quelle.id) !== gen) return // überholt: still raus

      // Ende: alle Ende-Felder ZUSAMMEN leer. Ein Timeout löst zu '' auf
      // und liest sich genauso — die Liste endet dann eben hier, ohne
      // Balken (still-harmlos, Etappe R2).
      if (lade.endeFelder.every((feld) => getField({ SATZ: satz }, feld) === '')) {
        endeGesehen = true
        break
      }

      // Die Zeile: SATZ-Rohstring (getField schneidet die Spalten im
      // Fenster selbst) plus je eine direkte Property für jedes Feld
      // hinter dem Schnitt.
      const zeile: Record<string, string> = { SATZ: satz }
      for (const feld of lade.zusatzFelder) {
        const trenner = feld.indexOf('_')
        const wert = await frage(
          lade,
          schluessel,
          posNr,
          feld.slice(0, trenner),
          feld.slice(trenner + 1),
        )
        if (generationen.get(quelle.id) !== gen) return
        zeile[feld] = wert
      }
      zeilen.push(zeile)
    }

    if (!endeGesehen) {
      meldeFehler(
        `Positionen laden: nach ${MAX_POSITIONEN} Zeilen ohne Ende-Kennung abgebrochen `
        + `(Relation Nr. ${lade.nr}) — die Liste ist wahrscheinlich unvollständig, `
        + 'vermutlich passen Relationsnummer oder Ende-Felder nicht.',
      )
    }

    // Vollständig geholt und nicht überholt: einspeisen und ALLE Bausteine
    // über die normale Daten-Glocke neu zeichnen lassen.
    if (generationen.get(quelle.id) === gen) {
      setzeGeholteZeilen(quelle.name, zeilen)
      meldeNeueDaten()
    }
  })()
}
