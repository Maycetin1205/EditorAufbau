// speicherPlaner — entprellt speichern, aber nie auf Kosten der Arbeit.
//
// Beide Stores hatten dieselbe Mechanik wortgleich (Editor-Baum,
// Vorlagen-Bibliotheken): bei jeder Meldung den laufenden Timer verwerfen und
// neu auf 500 ms setzen. Das ist im Normalbetrieb richtig — waehrend einer
// DURCHGEHENDEN Arbeitsserie aber nicht: tippt oder zieht der Bediener, meldet
// jeder Schritt schneller als alle 500 ms, und damit wurde ueberhaupt nichts
// geschrieben. Der gespeicherte Stand blieb der von VOR der Serie. Wer das
// Fenster direkt nach dem Tippen schloss, verlor alles seit der letzten
// Ruhepause — und zwar STILL, genau das, was in diesem Projekt nicht passieren
// darf.
//
// Darum zwei Wege an EINER Stelle:
//   plane()  — der Normalbetrieb, entprellt wie bisher.
//   sofort() — schreibt einen AUSSTEHENDEN Stand jetzt. localStorage.setItem
//              ist synchron und dafuer geeignet. Steht nichts aus, tut es
//              nichts: ein Tab-Wechsel kostet dann keinen Speicherlauf.
// Wer sofort() ruft, steht in providers.tsx (pagehide / „Seite verborgen").
export class SpeicherPlaner {
  // Kein Parameter-Property: `erasableSyntaxOnly` verbietet sie (sie waeren
  // Code, der beim Loeschen der Typen nicht verschwindet).
  private readonly schreibe: () => void
  private readonly verzoegerungMs: number
  private timer: ReturnType<typeof setTimeout> | null = null

  constructor(schreibe: () => void, verzoegerungMs: number) {
    this.schreibe = schreibe
    this.verzoegerungMs = verzoegerungMs
  }

  plane(): void {
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      // Zuerst den Riegel loesen: danach weiss `sofort()`, dass nichts mehr
      // aussteht, und ein Tab-Wechsel schreibt nicht umsonst noch einmal.
      this.timer = null
      this.schreibe()
    }, this.verzoegerungMs)
  }

  sofort(): void {
    if (!this.timer) return
    clearTimeout(this.timer)
    this.timer = null
    this.schreibe()
  }
}
