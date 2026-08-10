// speicherGate — DER eine Riegel vor jedem Schreiben in den Browser-Speicher.
//
// Warum es ihn gibt (A3): der Maskendatei-Import lehnt eine Schemaversion aus
// der Zukunft ab, der Browser-Speicher tat das nicht. Eine alte oder
// gecachte App las deshalb einen neueren Stand, warf alles weg, was sie nicht
// kannte, und der Autosave schrieb die verkleinerte Fassung 500 ms spaeter
// fest. Der Bediener sah nichts — sein neuerer Stand war weg.
//
// Der Riegel steht deshalb an der SCHREIB-Naht, nicht in der Oberflaeche: es
// gibt genau zwei Stellen im Produkt, die in den Browser-Speicher schreiben
// (`persistence.persistState` fuer den Baum, `VorlagenStore.schreibeJetzt`
// fuer Datenquellen UND Relationen), und beide fragen hier. Damit kann kein
// Klick, kein Timer und keine Geste einen gesperrten Stand ueberschreiben —
// auch keine, die es morgen erst gibt.
//
// NICHT gesperrt wird der RETTUNGS-Weg (notfallkopie.ts): eine Notfall- oder
// Quarantaene-Kopie schreibt unter EIGENEN Schluesseln und nimmt niemandem
// etwas weg. Sie muss auch dann noch entstehen koennen, wenn alles andere
// dicht ist.
//
// Bewusst ein Modul-Singleton: die zwei Vorlagen-Bibliotheken entstehen
// selbst beim Modul-Import (DataSourceStore/RelationStore) — sie koennen
// nichts erreichen, was erst spaeter in providers.tsx gebaut wird. A10 nimmt
// den Riegel spaeter in den technischen Sitzungsbesitz; DASS es zwei Bauarten
// sind, steht bereits in CLAUDE.md.

import type { LadeProblem } from './ladeKette'

// Was einen Stand unter Quarantaene gebracht hat — in Klartext, plus die
// Rohdaten, damit die Sperransicht sie als Datei anbieten kann.
export interface Quarantaene {
  // Ein Satz fuer den Bediener. Keine vorgetaeuschte Reparatur.
  grund: string
  // Betroffener Bereich, Eintrag/Pfad und Grund — je Fund einer.
  probleme: readonly LadeProblem[]
  // Wo die unveraenderte Kopie liegt (Schluessel im Browser-Speicher) —
  // null, wenn der Browser das Sichern verweigert hat (voller/gesperrter
  // Speicher). Dann liegen die Rohdaten immer noch unangetastet unter ihrem
  // eigenen Schluessel; nur die zweite Sicherung fehlt.
  kopieSchluessel: string | null
  // Die Rohdaten selbst, Byte fuer Byte wie gelesen.
  rohdaten: string
}

class SpeicherGate {
  private _quarantaene: Quarantaene | null = null

  get quarantaene(): Quarantaene | null { return this._quarantaene }

  get gesperrt(): boolean { return this._quarantaene !== null }

  // Sperren kann nur der LADE-Weg beim Browserstart (persistence.ts). Eine
  // zweite Sperre ueberschreibt die erste nicht: der erste Grund ist der
  // echte, alles danach waere Folgeschaden.
  sperre(quarantaene: Quarantaene): void {
    if (this._quarantaene) return
    this._quarantaene = quarantaene
  }

  // Aufheben darf die Sperre GENAU ZWEIERLEI (Nutzer-Entscheidung A3):
  // das Oeffnen eines nachweislich gueltigen Standes (Maskendatei) und das
  // ausdruecklich bestaetigte Leeren. Beides passiert in der Sperransicht.
  // Ein „Verlust bestaetigen" gibt es nicht — es wuerde einen kleineren
  // Stand ueber die Rohdaten schreiben.
  entsperre(): void {
    this._quarantaene = null
  }

  darfSchreiben(): boolean { return this._quarantaene === null }
}

export const speicherGate = new SpeicherGate()
