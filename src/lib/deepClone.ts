// deepClone
// Tiefe Kopie eines serialisierbaren Werts. Nutzt structuredClone, wenn die
// Laufzeit es kennt, sonst JSON-Fallback. Verhindert, dass zwei Stellen
// versehentlich dieselbe verschachtelte Referenz teilen (z. B. defaultProps).
// Einzige Quelle der Wahrheit fuer Klonen – nicht pro Datei neu definieren.

export function deepClone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}
