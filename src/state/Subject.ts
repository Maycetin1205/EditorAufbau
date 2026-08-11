// Subject
// Generische Klasse fuer das Observer-Pattern (Notiz Woche 1, CodeBase-Lektion).
// Haelt eine Liste von Listener-Funktionen, ruft sie bei notify auf.
// subscribe gibt eine unsubscribe-Funktion zurueck (verhindert Memory Leaks).

type Listener<T> = (data: T) => void

export class Subject<T = void> {
  // Set statt Array: gleicher Listener kann sich nicht doppelt anmelden, und
  // das Abmelden ist ein direktes delete (kein Neuaufbau der ganzen Liste).
  private listeners = new Set<Listener<T>>()

  subscribe(fn: Listener<T>): () => void {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  notify(data: T): void {
    // Ueber eine Momentaufnahme laufen: meldet sich ein Listener waehrend des
    // notify ab (oder ein neuer an), aendert das den laufenden Durchlauf nicht
    // — dasselbe Verhalten wie die fruehere filter-Kopie beim Array.
    for (const fn of [...this.listeners]) {
      // Jeder Listener fuer sich (A7.1, 2026-08-11). Bis dahin riss der ERSTE,
      // der wirft, alle SPAETEREN mit — und flog bis in den Aufrufer hinaus:
      // die Zustandsaenderung war schon passiert, aber halb Editor rechnete mit
      // veralteten Daten weiter, und der Autosave wurde nicht mehr geplant
      // (Editor.notify plant ihn NACH dem Melden). Ein einziger kaputter
      // Horcher konnte so still die Arbeit einer Sitzung kosten.
      //
      // Verschluckt wird der Fehler NICHT — er geht auf die Konsole. Ein
      // Bediener-Alert waere hier falsch: der Zustand ist in Ordnung, es
      // klemmt eine Anzeige, und Anzeigefehler in React fangen weiterhin die
      // Fehlergrenze (app/Fehlergrenze.tsx) beim Rendern ab. Die Horcher hier
      // stossen nur ein Neuzeichnen an, sie rendern nicht selbst.
      try {
        fn(data)
      } catch (fehler) {
        console.error('Subject: ein Horcher hat beim Melden geworfen.', fehler)
      }
    }
  }
}
