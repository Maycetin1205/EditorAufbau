import { meldungen } from './meldungen'

export const BACKUP_SUFFIX = '__notfallkopie'

export function backupKeyFor(storageKey: string): string {
  return `${storageKey}${BACKUP_SUFFIX}`
}

export function sichereUnlesbaren(
  storageKey: string,
  raw: string,
  bezeichnung: string,
): void {
  const backupKey = backupKeyFor(storageKey)
  try {
    if (localStorage.getItem(backupKey) === null) {
      localStorage.setItem(backupKey, raw)
    }
  } catch { /* Das Sichern selbst darf nie zusaetzlich Schaden anrichten. */ }
  meldungen.melde(
    `Der gespeicherte Stand „${bezeichnung}" war beschädigt und konnte nicht `
    + 'gelesen werden.\nEr wurde NICHT gelöscht, sondern als Notfallkopie '
    + `gesichert (Schlüssel „${backupKey}" im Browser-Speicher).\n`
    + 'Es geht vorerst ohne diesen Stand weiter; die Kopie bleibt erhalten, '
    + 'bis sie gerettet oder bewusst entfernt wird.',
  )
}

const gemeldet = new Set<string>()

export function merkeSpeicherErfolg(storageKey: string): void {
  gemeldet.delete(storageKey)
}

export function meldeSpeicherPanne(
  storageKey: string,
  bezeichnung: string,
  fehler: unknown,
): void {
  console.warn(`Speichern fehlgeschlagen (${bezeichnung})`, fehler)
  if (gemeldet.has(storageKey)) return
  gemeldet.add(storageKey)
  meldungen.melde(
    `„${bezeichnung}" konnte nicht im Browser gespeichert werden.\n\n`
    + 'Das heißt: Änderungen von jetzt an sind beim Schließen des Fensters '
    + 'verloren. Der Editor läuft weiter, aber ohne Sicherung.\n\n'
    + 'Was hilft: die Maske exportieren, damit die Arbeit als Datei '
    + 'vorliegt — und Speicherplatz des Browsers freiräumen. Gelingt das '
    + 'Speichern wieder, meldet sich der Editor erst bei der nächsten '
    + 'Störung erneut.',
  )
}
