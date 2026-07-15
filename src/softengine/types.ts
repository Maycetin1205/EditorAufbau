// softengine/types (U3)
// Geteilte Kleinteile der SoftEngine-Schicht: der Typwächter fuer fremde
// Objekte und der EINE Zugriff auf die untypisierten SoftEngine-Globals.
// Diese Datei importiert nichts aus dem Projekt — sie ist die Wurzel der
// Schicht. Abhaengigkeitsregel: Bausteine importieren die Schicht, die
// Schicht kennt NIE einen Baustein.

export type UnknownRecord = Record<string, unknown>

export function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === 'object' && v !== null
}

/* eslint-disable @typescript-eslint/no-explicit-any -- SEDATA/selib sind
   fremde, untypisierte SoftEngine-Globals (Formen siehe Referenzmaske). */
export function seGlobal(): any {
  return globalThis as any
}
/* eslint-enable @typescript-eslint/no-explicit-any */
