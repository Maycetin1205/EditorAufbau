// softengine/relationLader — Welle R: "Zeilen per Relation holen"
//
// Eine Quelle dieser Lade-Art bestellt bei SoftEngine keine SEFILELOOP;
// stattdessen lauscht sie auf die Auswahl einer GEBER-Quelle und holt
// je nach gewähltem Satz ihre Positionen selbst — serialisiert über
// die allgemeine GET_RELATION-Warteschlange (seGetNewIndex).
//
// Nachbildung des Handbau-Laders v3 aus behandlung-umbau/index.basis.source.html
// (dort direkt am Masken-Event-Handler).

import type { RuntimeLadeRelation } from './data'
import { getField } from './data'
import { executeRelation } from './relations'

export interface LaderKontext {
  // Liefert die gewählte Zeile des Geber-Blocks (anhand der Block-ID).
  // undefined = keine Auswahl aktiv (oder rausklickt).
  gewaehlteZeile: (geberId: string) => unknown | undefined
  // Speist die geholten Zeilen unter der id der holenden Quelle ein.
  speiseZeilen: (quelleId: string, zeilen: unknown[]) => void
}

// Jede Quelle, die gerade holt, merkt sich hier ihre "Generation".
// Klickt der Bediener schnell um, erhöht sich die Generation — läuft noch
// ein asynchrones Holen der alten Generation, verwirft es am Ende sein
// Ergebnis still, statt die neue Auswahl wieder zu überschreiben.
const generationen = new Map<string, number>()

export function starteRelationLader(
  quelleId: string,
  ladeRelation: RuntimeLadeRelation,
  kontext: LaderKontext,
): void {
  const geberId = ladeRelation.geberQuelleId // Block-ID des Gebers
  const zeile = kontext.gewaehlteZeile(geberId)

  // 1. Generationszähler für diese Quelle erhöhen
  const gen = (generationen.get(quelleId) ?? 0) + 1
  generationen.set(quelleId, gen)

  // 2. Abwahl (keine Zeile) leert die Quelle
  if (zeile === undefined) {
    kontext.speiseZeilen(quelleId, [])
    return
  }

  // 3. Schlüssel aus der gewählten Zeile lesen
  const belegart = getField(zeile, ladeRelation.belegartFeld)
  const belegnummer = getField(zeile, ladeRelation.belegnummerFeld)
  const jahr = ladeRelation.jahrFeld !== '' ? getField(zeile, ladeRelation.jahrFeld) : ''
  const archiv = ladeRelation.archivFeld !== '' ? getField(zeile, ladeRelation.archivFeld) : ''

  // Kein voller Schlüssel = keine Anfrage (wie schluesselAus in fremdeQuellen)
  if (belegart === '' || belegnummer === '') {
    kontext.speiseZeilen(quelleId, [])
    return
  }

  // ALTE Zeilen sofort leeren: der Bediener hat einen neuen Beleg angeklickt,
  // die alten Positionen dürfen nicht stehen bleiben, während wir laden.
  kontext.speiseZeilen(quelleId, [])

  // 4. Positionen nacheinander abfragen
  const geholteZeilen: unknown[] = []

  // Wir starten die asynchrone Schleife ohne await (fire-and-forget),
  // das Ende speist die Daten ein.
  void (async () => {
    let posNr = 1

    while (true) {
      if (generationen.get(quelleId) !== gen) return // abgebrochen/überholt

      // Parameter genau nach dem Handbau-Lader v3:
      // BELART, POS (0 = Zeilenanfang), LEN (255 = maximale Pufferbreite),
      // BELNR, JAHR, ARCHIV, '', POSNR, '', '', '', ''
      const params = [
        belegart,
        '0',
        '255',
        belegnummer,
        jahr,
        archiv,
        '',
        String(posNr),
        '',
        '',
        '',
        '',
      ]

      const antwort = await executeRelation(
        { id: 'hol-lader', verb: 'GET_RELATION', nr: ladeRelation.nr, params: [] },
        params,
      )

      if (generationen.get(quelleId) !== gen) return // abgebrochen während Wartezeit

      const rohSatz = antwort.wert

      // Zeile formen: SATZ-Property (wie echte Tabellenzeilen) plus
      // direkte Ende-Felder zum Prüfen.
      const neueZeile: Record<string, string> = {
        SATZ: rohSatz,
      }

      // Ende erkennen: wenn ALLE Ende-Felder leer sind. SoftEngine bricht nicht
      // selbst ab, sondern liefert leere Strings für Positionen hinter dem Ende.
      let allesLeer = true
      for (const endeCode of ladeRelation.endeFelder) {
        // Direkte Auswertung wie getField, aber hier auf dem SATZ-Rohstring.
        // getField würde auf neueZeile.SATZ funktionieren.
        const wert = getField({ SATZ: rohSatz }, endeCode)
        neueZeile[endeCode] = wert
        if (wert !== '') allesLeer = false
      }

      // Ein Timeout führt zu wert: '' -> allesLeer ist true.
      if (allesLeer) {
        break // Ende der Belegpositionen
      }

      geholteZeilen.push(neueZeile)
      posNr += 1
    }

    // Vollständig geholt und nicht überholt -> einspeisen
    if (generationen.get(quelleId) === gen) {
      kontext.speiseZeilen(quelleId, geholteZeilen)
    }
  })()
}
