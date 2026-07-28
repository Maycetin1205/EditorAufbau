// fremdeQuellen — Werte aus den WEITEREN Datenquelle(n) eines Bausteins holen.
//
// Der Fall des Nutzers (2026-07-28): eine Karte zeigt dauerhaft den Termin aus
// dem Terminplaner UND Rasse/Notiz aus Kundenhaustieren. Zu jeder Zeile der
// ersten Quelle muss dafuer die zusammengehoerige Zeile der zweiten gefunden
// werden — erkennbar an den Schluesselfeldern („Adressnummer ist gleich
// Adressnummer"), die der Bediener am Baustein eingestellt hat.
//
// Diese Datei ist die EINE Stelle, die das tut. Jeder datengetriebene
// Baustein benutzt sie statt einer eigenen Abschrift — sonst faende die
// Tabelle ihre Partnerzeilen anders als die Karte.
//
// Kennt keinen Bausteintyp (Regel 2): sie sieht nur „ein Element mit
// Attributen" und „Zeilen". Alles Fachliche steht in den Attributen, die der
// Export aus dem Baum geschrieben hat.
//
// NICHT GEFUNDEN heisst LEER, nie „Zeile weg": das Feld bleibt leer, die
// Zeile bleibt stehen (Nutzer-Festlegung 2026-07-25). Verschwundene Zeilen
// waeren unsichtbarer Datenverlust — der Bediener saehe 240 statt 250 Saetze
// und merkte nie, dass zehn fehlen. Ein leeres Feld sieht er.

import { seGlobal } from '../../softengine/bridge'
import { findRuntimeDataSource, getField, rowsFor } from '../../softengine/data'
import { WEITERE_QUELLEN_PROP, type SchluesselPaar } from '../../core/data/sourceLinks'
import { zerlegeBindung } from '../../core/blocks/BlockDefinition'

// Attributname der Liste am Element: HTML normalisiert Attribute klein.
// Aus DERSELBEN Konstante wie die Prop, damit Export und Laufzeit nicht
// auseinanderlaufen koennen.
const WEITERE_QUELLEN_ATTR = WEITERE_QUELLEN_PROP.toLowerCase()

// „Wert eines Bindungscodes zu dieser Zeile" — das Einzige, was ein Baustein
// von hier braucht.
export type FeldLeser = (row: unknown, wert: string) => string

interface Nachschlag {
  // Zeilen der weiteren Quelle, gruppiert nach ihrem Schluessel.
  nachSchluessel: Map<string, unknown>
  // Schluesselfelder in der ERSTEN Quelle, in Paar-Reihenfolge.
  hierFelder: string[]
}

// Trennzeichen zwischen den Teilwerten eines mehrteiligen Schluessels. Ein
// Steuerzeichen, weil es in SE-Feldwerten nicht vorkommt: OHNE Trenner waere
// ('AB','C') derselbe Schluessel wie ('A','BC') — zwei verschiedene Kunden
// lieferten dieselbe Partnerzeile.
const SCHLUESSEL_TRENNER = '\x01'

// Schluessel aus mehreren Feldwerten. Leere Teilwerte machen den ganzen
// Schluessel ungueltig ('' zurueck) — ein halb gefuellter Schluessel traefe
// sonst jede Zeile mit derselben Luecke, und das waere geraten (Regel 7).
function schluesselAus(werte: readonly string[]): string {
  if (werte.length === 0) return ''
  const teile: string[] = []
  for (const w of werte) {
    const t = w.trim()
    if (t === '') return ''
    teile.push(t)
  }
  return teile.join(SCHLUESSEL_TRENNER)
}

// Die Liste der weiteren Quellen aus dem Element lesen. Kaputtes/fehlendes
// Attribut -> leere Liste (der Baustein zeigt dann nur die erste Quelle,
// statt gar nichts zu rendern).
function weitereAusAttribut(el: HTMLElement): { quelleId: string; keyPairs: SchluesselPaar[] }[] {
  const roh = el.getAttribute(WEITERE_QUELLEN_ATTR) ?? ''
  if (roh === '') return []
  try {
    const parsed: unknown = JSON.parse(roh)
    if (!Array.isArray(parsed)) return []
    const acc: { quelleId: string; keyPairs: SchluesselPaar[] }[] = []
    for (const e of parsed) {
      if (!e || typeof e !== 'object') continue
      const ee = e as Record<string, unknown>
      if (typeof ee.quelleId !== 'string' || ee.quelleId === '') continue
      const keyPairs: SchluesselPaar[] = []
      for (const p of Array.isArray(ee.keyPairs) ? ee.keyPairs : []) {
        if (!p || typeof p !== 'object') continue
        const pp = p as Record<string, unknown>
        if (typeof pp.fromField !== 'string' || typeof pp.toField !== 'string') continue
        if (pp.fromField.trim() === '' || pp.toField.trim() === '') continue
        keyPairs.push({ fromField: pp.fromField, toField: pp.toField })
      }
      if (keyPairs.length === 0) continue
      acc.push({ quelleId: ee.quelleId, keyPairs })
    }
    return acc
  } catch {
    return []
  }
}

// Den Feld-Leser fuer EINEN Hydrier-Durchlauf bauen.
//
// Die Zeilen jeder weiteren Quelle werden dabei EINMAL gelesen und nach ihrem
// Schluessel abgelegt. Ohne diesen Index suchte jede Zelle die Partnerzeile
// neu: bei 250 Zeilen und 3 Fremdspalten waeren das 750 Durchlaeufe durch die
// zweite Tabelle statt eines einzigen.
//
// Bei doppelten Schluesseln in der weiteren Quelle gewinnt die ERSTE Zeile —
// dieselbe Regel wie „gelesen wird aus der ersten Zeile der Quelle" und
// deterministisch; eine willkuerlich andere waere geraten.
export function macheFeldLeser(el: HTMLElement): FeldLeser {
  const weitere = weitereAusAttribut(el)
  if (weitere.length === 0) return (row, wert) => getField(row, zerlegeBindung(wert).code)

  const sedata = seGlobal().SEDATA
  const quellenListe = seGlobal().FF_DATA_SOURCES
  const nachschlag = new Map<string, Nachschlag>()

  for (const q of weitere) {
    const source = findRuntimeDataSource(quellenListe, q.quelleId)
    // Quelle nicht in der Maske (geloescht, nie mitexportiert): auslassen.
    // Die Stellen, die auf sie zeigen, bleiben leer — der Preflight hat das
    // beim Export im Klartext gemeldet.
    if (!source) continue
    const zeilen = rowsFor(sedata, source.name, source.tableId)
    const nachSchluessel = new Map<string, unknown>()
    for (const zeile of zeilen) {
      const key = schluesselAus(q.keyPairs.map((p) => getField(zeile, p.toField)))
      if (key !== '' && !nachSchluessel.has(key)) nachSchluessel.set(key, zeile)
    }
    nachschlag.set(q.quelleId, {
      nachSchluessel,
      hierFelder: q.keyPairs.map((p) => p.fromField),
    })
  }

  return (row, wert) => {
    const { quelleId, code } = zerlegeBindung(wert)
    if (quelleId === '') return getField(row, code)
    const eintrag = nachschlag.get(quelleId)
    if (!eintrag) return ''
    const key = schluesselAus(eintrag.hierFelder.map((f) => getField(row, f)))
    if (key === '') return ''
    const partner = eintrag.nachSchluessel.get(key)
    return partner === undefined ? '' : getField(partner, code)
  }
}
