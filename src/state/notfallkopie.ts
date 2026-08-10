// notfallkopie — DIE eine Stelle fuer Speicher-Pannen.
//
// Zwei Faelle wohnen hier, weil beide dieselbe Nutzer-Regel bedienen
// („Verluste passieren nie still") und sonst ueber vier Dateien verstreut
// waeren:
//   1. LESEN schlaegt fehl -> sichereUnlesbaren (Rohdaten retten, dann melden)
//   2. SCHREIBEN schlaegt fehl -> meldeSpeicherPanne / merkeSpeicherErfolg
//
// Fall 1 im Detail:
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
// Drei Faelle teilen diese Stelle — der Block-Baum (persistence.ts) und die
// zwei Bibliotheken (Datenquellen, Relationen; bis 2026-07-30 auch die
// entfernten Verknuepfungen). Der Baum konnte das seit jeher, die
// Bibliotheken fielen bei kaputtem JSON still auf ihren Startbestand
// zurueck: die echten Vorlagen des Bedieners waren weg, ersetzt durch die
// mitgelieferten, ohne ein Wort. Gefunden im Architektur-Review 2026-07-27.

export const BACKUP_SUFFIX = '__notfallkopie'

export function backupKeyFor(storageKey: string): string {
  return `${storageKey}${BACKUP_SUFFIX}`
}

// --- Fall 3: der Stand ist LESBAR, darf aber nicht angefasst werden ----
//
// A3 (2026-08-10): ein Stand aus einer neueren Editorversion (und ab A4 auch
// einer, bei dem beim Laden etwas verlorenginge) wird unter Quarantaene
// gestellt. Er bleibt unangetastet unter seinem eigenen Schluessel liegen —
// hier entsteht ZUSAETZLICH eine unveraenderte Kopie mit Zeitstempel.
//
// Warum eine zweite Kopie, wenn das Original doch stehenbleibt: sobald der
// Bediener in der Sperransicht eine gueltige Maskendatei oeffnet, darf der
// Autosave wieder schreiben — und der neue Stand landet auf demselben
// Schluessel. Ohne diese Kopie waeren die Rohdaten dann weg. Die Kopie
// ueberlebt das, weil kein Speicherweg sie je anfasst.
//
// Zwei eiserne Regeln: nichts wird ueberschrieben (der Zeitstempel bekommt
// notfalls eine laufende Nummer), und derselbe Inhalt wird nicht zweimal
// gesichert (sonst legt jedes Neuladen der gesperrten Seite eine weitere
// Kopie an, bis der Speicher voll ist).
export const QUARANTAENE_TEIL = '__quarantaene__'

export function quarantaeneKopien(storageKey: string): string[] {
  const anfang = `${storageKey}${QUARANTAENE_TEIL}`
  const raus: string[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key !== null && key.startsWith(anfang)) raus.push(key)
    }
  } catch { /* Speicher gesperrt — dann gibt es eben keine Liste. */ }
  return raus.sort()
}

// Liefert den Schluessel, unter dem die Rohdaten liegen — oder null, wenn der
// Browser das Sichern verweigert hat.
export function sichereQuarantaene(
  storageKey: string,
  raw: string,
  zeitstempel: string,
): string | null {
  try {
    for (const vorhanden of quarantaeneKopien(storageKey)) {
      if (localStorage.getItem(vorhanden) === raw) return vorhanden
    }
    const anfang = `${storageKey}${QUARANTAENE_TEIL}${zeitstempel}`
    let key = anfang
    for (let n = 2; localStorage.getItem(key) !== null; n++) key = `${anfang}-${n}`
    localStorage.setItem(key, raw)
    return key
  } catch {
    // Voller oder gesperrter Speicher. Die Rohdaten liegen weiterhin
    // unangetastet unter ihrem eigenen Schluessel; die Sperransicht bietet
    // sie ausserdem als Datei an.
    return null
  }
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

// --- Fall 2: SCHREIBEN schlaegt fehl ----------------------------------
//
// Bis 2026-07-28 schrieben alle vier Speicherwege (Maske + die drei
// Bibliotheken) bei einer Panne nur ein console.warn. Der Bediener sah nichts
// und arbeitete weiter — bei vollem oder gesperrtem Browser-Speicher war die
// Arbeit beim naechsten Oeffnen weg. Der Lese-Weg oben war seit jeher sauber
// geloest, der Schreib-Weg gar nicht.
//
// Gemeldet wird EINMAL je zusammenhaengender Stoerung, nicht je Versuch: der
// Autosave laeuft entprellt bei jeder Aenderung, bei vollem Speicher
// scheitert JEDER Versuch — eine Meldung pro Versuch machte den Editor
// unbedienbar.
//
// Der Merker haengt am Speicherschluessel, nicht global: die drei Wege sind
// unabhaengig. Ein globaler Merker wuerde von einem erfolgreichen
// Datenquellen-Speichern zurueckgesetzt, und die naechste Panne derselben,
// ununterbrochenen Masken-Stoerung meldete sich erneut.
const gemeldet = new Set<string>()

// Nach einem erfolgreichen Schreiben ist die Stoerung vorbei — die naechste
// ist eine NEUE und darf sich wieder melden. Ohne dieses Zuruecksetzen
// verschwiege der Editor jeden spaeteren Ausfall.
export function merkeSpeicherErfolg(storageKey: string): void {
  gemeldet.delete(storageKey)
}

// `bezeichnung` ist der Klarname dessen, was nicht gespeichert werden konnte
// — er steht in der Meldung, damit der Bediener weiss, WAS gefaehrdet ist.
export function meldeSpeicherPanne(
  storageKey: string,
  bezeichnung: string,
  fehler: unknown,
): void {
  console.warn(`Speichern fehlgeschlagen (${bezeichnung})`, fehler)
  if (gemeldet.has(storageKey)) return
  gemeldet.add(storageKey)
  if (typeof alert === 'function') {
    alert(
      `„${bezeichnung}" konnte nicht im Browser gespeichert werden.\n\n`
      + 'Das heißt: Änderungen von jetzt an sind beim Schließen des Fensters '
      + 'verloren. Der Editor läuft weiter, aber ohne Sicherung.\n\n'
      + 'Was hilft: die Maske exportieren, damit die Arbeit als Datei '
      + 'vorliegt — und Speicherplatz des Browsers freiräumen. Gelingt das '
      + 'Speichern wieder, meldet sich der Editor erst bei der nächsten '
      + 'Störung erneut.',
    )
  }
}
