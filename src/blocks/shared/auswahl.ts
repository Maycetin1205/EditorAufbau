// auswahl — der EINE Auswahl-Zustand der laufenden Maske.
//
// „Zeile anklicken → andere Bausteine filtern danach" braucht einen Ort, an
// dem die Auswahl WOHNT: die Karten/Zeilen selbst werden bei jedem
// SoftEngine-Push neu gebaut, an ihnen kann der Zustand nicht haengen.
// Dieses Modul haelt ihn je GEBER-Baustein (Schluessel = data-ff-id aus dem
// Export) und meldet jede Aenderung — die Datenanschluesse hydrieren dann
// alle Bausteine neu, genau wie beim Tageswechsel (Muster: gewaehlterTag).
//
// Toggle-Regel (Nutzer 2026-08-05, „rausklicken"): dieselbe Zeile noch
// einmal waehlen hebt die Auswahl auf. Ohne Auswahl filtert nichts.
//
// Identitaet einer Zeile = ihr JSON-Abdruck: die Zeilenobjekte sind nach
// jedem Push NEUE Objekte mit gleichem Inhalt — Referenzvergleich waere
// nach dem ersten Push immer falsch. Bleibt der Abdruck nach einer
// Neu-Hydrierung aus, ist die Zeile weg (anderer Tag, geloescht) und die
// Auswahl wird AUFGEHOBEN statt unsichtbar weiterzufiltern: sonst saehe der
// Bediener gefilterte Folge-Tabellen ohne markierte Zeile und koennte nie
// wieder rausklicken (Regel 4, nichts scheitert still).
//
// Kennt keinen Baustein (Regel 2): nur Zeilen, Abdruecke und Hoerer.

import { AUSWAHL_FOLGE_PROP, type AuswahlFolge } from '../../core/data/auswahlFolge'

// JSON-Abdruck als Zeilen-Identitaet. Kaputte/zyklische Objekte liefern ''
// — eine Zeile ohne Abdruck ist nie „dieselbe" und nie waehlbar.
export function merkmalVon(zeile: unknown): string {
  if (zeile == null) return ''
  try {
    return JSON.stringify(zeile) ?? ''
  } catch {
    return ''
  }
}

const zustand = new Map<string, { zeile: unknown; merkmal: string }>()
const hoerer = new Set<() => void>()

// Waehrend einer Meldung kann ein Hydrier-Lauf die Auswahl erneut aendern
// (klareAuswahl, wenn die Zeile verschwunden ist). Statt verschachtelt neu
// zu melden, laeuft die Runde danach noch einmal — idempotent, endet sicher:
// die zweite Runde findet nichts mehr zu bereinigen.
let meldungLaeuft = false
let nachmeldung = false

function melde(): void {
  if (meldungLaeuft) {
    nachmeldung = true
    return
  }
  meldungLaeuft = true
  try {
    do {
      nachmeldung = false
      hoerer.forEach((cb) => cb())
    } while (nachmeldung)
  } finally {
    meldungLaeuft = false
  }
}

export function aufAuswahlHoeren(cb: () => void): void {
  hoerer.add(cb)
}

// Die gewaehlte Zeile eines Gebers — undefined = keine Auswahl.
export function auswahlFuer(geberId: string): unknown | undefined {
  return zustand.get(geberId)?.zeile
}

// Der Abdruck der gewaehlten Zeile ('' = keine Auswahl) — damit ein Geber
// seine Auswahl nach der Neu-Hydrierung in den NEUEN Zeilen wiederfindet.
export function auswahlMerkmal(geberId: string): string {
  return zustand.get(geberId)?.merkmal ?? ''
}

// Zeile waehlen — dieselbe Zeile noch einmal = abwaehlen (Toggle).
export function waehleAuswahl(geberId: string, zeile: unknown): void {
  if (geberId === '') return
  const merkmal = merkmalVon(zeile)
  if (merkmal === '') return
  const alt = zustand.get(geberId)
  if (alt && alt.merkmal === merkmal) zustand.delete(geberId)
  else zustand.set(geberId, { zeile, merkmal })
  melde()
}

export function klareAuswahl(geberId: string): void {
  if (!zustand.has(geberId)) return
  zustand.delete(geberId)
  melde()
}

// Nur fuer gezielte Laufzeit-Tests: definierter Ausgangszustand.
export function setzeAuswahlZurueck(): void {
  zustand.clear()
}

// ---------------------------------------------------------------------------
// Laufzeit-Leser des Export-Attributs (HTML normalisiert Attribute klein).
// Streng wie weitereAusAttribut in fremdeQuellen: nur Eintraege mit Geber und
// mindestens einem VOLLSTAENDIGEN Feldpaar zaehlen — Halbfertiges hat der
// Preflight beim Export bereits im Klartext gemeldet.
const AUSWAHL_FOLGE_ATTR = AUSWAHL_FOLGE_PROP.toLowerCase()

export function folgenAusAttribut(el: HTMLElement): AuswahlFolge[] {
  const roh = el.getAttribute(AUSWAHL_FOLGE_ATTR) ?? ''
  if (roh === '') return []
  try {
    const parsed: unknown = JSON.parse(roh)
    if (!Array.isArray(parsed)) return []
    const acc: AuswahlFolge[] = []
    for (const e of parsed) {
      if (!e || typeof e !== 'object') continue
      const ee = e as Record<string, unknown>
      if (typeof ee.geberId !== 'string' || ee.geberId === '') continue
      const keyPairs: AuswahlFolge['keyPairs'] = []
      for (const p of Array.isArray(ee.keyPairs) ? ee.keyPairs : []) {
        if (!p || typeof p !== 'object') continue
        const pp = p as Record<string, unknown>
        if (typeof pp.fromField !== 'string' || typeof pp.toField !== 'string') continue
        if (pp.fromField.trim() === '' || pp.toField.trim() === '') continue
        keyPairs.push({ fromField: pp.fromField, toField: pp.toField })
      }
      if (keyPairs.length === 0) continue
      acc.push({ geberId: ee.geberId, keyPairs })
    }
    return acc
  } catch {
    return []
  }
}
