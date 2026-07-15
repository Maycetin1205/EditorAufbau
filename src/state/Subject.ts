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
    for (const fn of [...this.listeners]) fn(data)
  }
}
