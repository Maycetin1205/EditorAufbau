// Subject
// Generische Klasse fuer das Observer-Pattern (Notiz Woche 1, CodeBase-Lektion).
// Haelt eine Liste von Listener-Funktionen, ruft sie bei notify auf.
// subscribe gibt eine unsubscribe-Funktion zurueck (verhindert Memory Leaks).

type Listener<T> = (data: T) => void

export class Subject<T = void> {
  private listeners: Listener<T>[] = []

  subscribe(fn: Listener<T>): () => void {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn)
    }
  }

  notify(data: T): void {
    this.listeners.forEach((fn) => fn(data))
  }
}
