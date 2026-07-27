// notfallkopie — DIE eine Stelle fuer „unlesbarer Speicherstand".
//
// Nutzer-Regel „Verluste passieren nie still": beschaedigte Rohdaten ZUERST
// unter einem eigenen Schluessel sichern, dann in Klartext melden. Der
// beschaedigte Originalschluessel darf danach ueberschrieben werden — die
// Kopie ueberlebt, weil das Speichern sie nie anfasst.
//
// Gesichert wird nur, wenn dort noch KEINE Kopie liegt: die frueheste Kopie
// ist die wertvollste (eine zweite Panne wuerde sonst die erste Rettung
// ueberschreiben).
//
// Vier Faelle teilen diese Stelle — der Block-Baum (persistence.ts) und die
// drei Bibliotheken (Datenquellen, Relationen, Verknuepfungen). Der Baum
// konnte das seit jeher, die drei Bibliotheken fielen bei kaputtem JSON
// still auf ihren Startbestand zurueck: die echten Vorlagen des Bedieners
// waren weg, ersetzt durch die mitgelieferten, ohne ein Wort. Gefunden im
// Architektur-Review 2026-07-27.

export const BACKUP_SUFFIX = '__notfallkopie'

export function backupKeyFor(storageKey: string): string {
  return `${storageKey}${BACKUP_SUFFIX}`
}

// `bezeichnung` ist der Klarname dessen, was beschaedigt war — er steht in
// der Meldung, damit der Bediener weiss, WAS er verloren hat.
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
  if (typeof alert === 'function') {
    alert(
      `Der gespeicherte Stand „${bezeichnung}" war beschädigt und konnte nicht `
      + 'gelesen werden.\nEr wurde NICHT gelöscht, sondern als Notfallkopie '
      + `gesichert (Schlüssel „${backupKey}" im Browser-Speicher).\n`
      + 'Es geht vorerst ohne diesen Stand weiter; die Kopie bleibt erhalten, '
      + 'bis sie gerettet oder bewusst entfernt wird.',
    )
  }
}
