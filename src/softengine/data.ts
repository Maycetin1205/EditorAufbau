// softengine/data — Daten lesen & schreiben (pure Helfer, Node-testbar)
//
// Teil der gemeinsamen SoftEngine-Schicht (Umzug 2026-07-15 aus
// blocks/kanban/seRuntime.ts, verhaltensgleich): alles, was Zeilen und
// Felder aus SoftEngine-Datenpaketen liest bzw. zurückschreibt. Kein DOM,
// keine Globals — die Aufrufer reichen alles herein.
//
// Abhängigkeitsregel der Schicht: Bausteine importieren src/softengine/*,
// diese Schicht kennt NIE einen Baustein.

export type UnknownRecord = Record<string, unknown>

export function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === 'object' && v !== null
}

export interface RuntimeLadeRelation {
  nr: string
  geberQuelleId: string
  belegartFeld: string
  belegnummerFeld: string
  jahrFeld: string
  archivFeld: string
  endeFelder: string[]
}

// Quellen-Definition in der EXPORTIERTEN Maske: die Vorlagen
// sind benutzerdefiniert und leben im Editor-localStorage — exportMask
// bettet die benutzten Definitionen deshalb als `window.FF_DATA_SOURCES = […]`
// in die Maske ein (window. statt var wegen WebUI-Kapselung, s. exportMask;
// nur was die Runtime braucht, Feld-Bindungen reisen weiter als Attribute).
// Hier wird ausschließlich darüber aufgelöst.
export interface RuntimeDataSource {
  id: string
  name: string
  tableId: string
  indexField: string
  ladeRelation?: RuntimeLadeRelation
}

// Eintrag zur source-id aus einer FF_DATA_SOURCES-Liste (pur, testbar).
// Kaputte/fremde Einträge werden ignoriert — nie raten.
export function findRuntimeDataSource(list: unknown, id: string): RuntimeDataSource | undefined {
  if (!Array.isArray(list) || id === '') return undefined
  for (const entry of list) {
    if (!isRecord(entry) || entry.id !== id) continue
    if (typeof entry.name !== 'string' || typeof entry.tableId !== 'string') continue
    const e = entry as Record<string, unknown>
    let ladeRelation: RuntimeLadeRelation | undefined
    if (isRecord(e.ladeRelation)) {
      const lr = e.ladeRelation
      const text = (v: unknown): string => (typeof v === 'string' ? v : '')
      const endeFelder = Array.isArray(lr.endeFelder) ? lr.endeFelder.filter((f): f is string => typeof f === 'string') : []
      if (typeof lr.nr === 'string' && typeof lr.geberQuelleId === 'string' && typeof lr.belegartFeld === 'string' && typeof lr.belegnummerFeld === 'string') {
        ladeRelation = {
          nr: lr.nr,
          geberQuelleId: lr.geberQuelleId,
          belegartFeld: lr.belegartFeld,
          belegnummerFeld: lr.belegnummerFeld,
          jahrFeld: text(lr.jahrFeld),
          archivFeld: text(lr.archivFeld),
          endeFelder,
        }
      }
    }
    return {
      id,
      name: entry.name,
      tableId: entry.tableId,
      indexField: typeof entry.indexField === 'string' ? entry.indexField : '',
      ...(ladeRelation ? { ladeRelation } : {}),
    }
  }
  return undefined
}

function asTrimmedString(v: unknown): string {
  return v == null ? '' : String(v).trim()
}

// Wert eines Feldcodes aus einer Zeile — Auflösung EXAKT wie getField der
// Referenzmaske (BLOCK 2/9, Commit 45a8027 Z. 722-741):
//  1. direkte Property,
//  2. Schlüssel-Scan: gleich, Präfix `code_` ODER Endung `_code` —
//     SoftEngine liefert Zeilen-Properties MIT Tabellen-Präfix
//     (`IDBID0001_253_30` für Code `253_30`; belegt durch den
//     SE-Echttest des Nutzers 2026-07-11, TFELD.Name),
//  3. 'pos_len'-Ausschnitt aus dem SATZ-Rohstring (SATZNEU vor SATZ).
export function getField(row: unknown, code: string): string {
  if (!isRecord(row) || code === '') return ''
  const key = code.trim()
  const direct = asTrimmedString(row[key])
  if (direct !== '') return direct
  for (const rk of Object.keys(row)) {
    if (rk === key || rk.startsWith(`${key}_`) || rk.endsWith(`_${key}`)) {
      const v = asTrimmedString(row[rk])
      if (v !== '') return v
    }
  }
  const m = /^(\d+)_(\d+)$/.exec(key)
  if (!m) return ''
  const raw = asTrimmedString(
    row.SATZNEU ?? row.SATZ ?? row.satzneu ?? row.satz ?? row.RAW ?? row.raw,
  )
  if (raw === '') return ''
  const pos = Number(m[1])
  const len = Number(m[2])
  if (len <= 0) return ''
  return raw.substring(pos, pos + len).trim()
}

// Wert eines Feldcodes in eine Zeile ZURÜCKschreiben (Schreibweg 5.3b):
// eine direkte Property wird gesetzt; ein 'pos_len'-Code patcht zusätzlich
// den SATZ-Rohstring (derselbe Schlüssel, den getField liest), damit jede
// Neu-Hydrierung den neuen Wert sieht. Feld wird exakt auf Feldlänge
// gebracht (auffüllen/kürzen), zu kurze Rohstrings bis zur Position
// verlängert — deterministisch. Rückgabe: wurde etwas geschrieben?
export function setField(row: unknown, code: string, value: string): boolean {
  if (!isRecord(row) || code === '') return false
  const key = code.trim()
  let written = false
  // ALLE Darstellungen aktualisieren, die getField lesen würde: direkte
  // Property UND präfixierte Schlüssel (`IDBID0001_253_30`, dieselbe
  // Scan-Regel wie getField) ...
  for (const rk of Object.keys(row)) {
    if (rk === key || rk.startsWith(`${key}_`) || rk.endsWith(`_${key}`)) {
      row[rk] = value
      written = true
    }
  }
  // ... und der pos_len-Patch im SATZ-Rohstring.
  const m = /^(\d+)_(\d+)$/.exec(key)
  if (m) {
    const rawKeys = ['SATZNEU', 'SATZ', 'satzneu', 'satz', 'RAW', 'raw'] as const
    const rawKey = rawKeys.find((k) => typeof row[k] === 'string')
    if (rawKey) {
      const raw = row[rawKey] as string
      const pos = Number(m[1])
      const len = Number(m[2])
      if (len > 0) {
        const field = value.length > len ? value.slice(0, len) : value.padEnd(len, ' ')
        const padded = raw.length < pos ? raw.padEnd(pos, ' ') : raw
        row[rawKey] = padded.slice(0, pos) + field + padded.slice(pos + len)
        written = true
      }
    }
  }
  return written
}

// Zeilen-Liste aus einem SEFileLoop-/Tabellen-Eintrag ziehen (SoftEngine
// benennt sie je nach Version unterschiedlich).
function rowsOfEntry(entry: unknown): unknown[] {
  if (!isRecord(entry)) return Array.isArray(entry) ? entry : []
  const candidates = [
    entry.Zeilen, entry.zeilen, entry.Saetze, entry.saetze,
    entry.Rows, entry.rows, entry.Daten, entry.daten,
  ]
  for (const c of candidates) {
    if (Array.isArray(c)) return c
    if (typeof c === 'string') {
      try {
        const parsed: unknown = JSON.parse(c)
        if (Array.isArray(parsed)) return parsed
      } catch { /* kein JSON -> nächster Kandidat */ }
    }
  }
  return []
}

function sameAlias(a: unknown, alias: string): boolean {
  return asTrimmedString(a).toLowerCase() === alias.trim().toLowerCase()
}

// Zeilen einer Datenquelle aus SEDATA: erst SEFileLoop (Array oder Objekt),
// dann Tabellen (ALIAS- und IDB-ID-Schlüssel). Nichts gefunden -> [].
export function rowsFor(seData: unknown, alias: string, idbId: string): unknown[] {
  if (!isRecord(seData) || !isRecord(seData.Daten)) return []
  const daten = seData.Daten

  const sfl = daten.SEFileLoop
  if (Array.isArray(sfl)) {
    for (const entry of sfl) {
      if (isRecord(entry) && (sameAlias(entry.ALIAS, alias) || sameAlias(entry.alias, alias))) {
        const rows = rowsOfEntry(entry)
        if (rows.length > 0) return rows
      }
    }
  } else if (isRecord(sfl)) {
    for (const key of Object.keys(sfl)) {
      const entry = sfl[key]
      if (sameAlias(key, alias)
        || (isRecord(entry) && (sameAlias(entry.ALIAS, alias) || sameAlias(entry.alias, alias)))) {
        const rows = rowsOfEntry(entry)
        if (rows.length > 0) return rows
      }
    }
  }

  const tab = daten.Tabellen
  if (isRecord(tab)) {
    const keys = [alias, alias.toUpperCase(), alias.toLowerCase(), idbId]
    for (const key of keys) {
      if (key !== '' && key in tab) {
        const rows = rowsOfEntry(tab[key])
        if (rows.length > 0) return rows
      }
    }
    for (const key of Object.keys(tab)) {
      if (sameAlias(key, alias)) {
        const rows = rowsOfEntry(tab[key])
        if (rows.length > 0) return rows
      }
    }
  }
  return []
}

// Daten aus einem geschobenen SE-Paket ziehen (Push-Weg): SoftEngine
// liefert an den REGISTER-Callback einen String ODER ein Objekt (Referenz
// __seConsume). Akzeptiert wird nur ein Paket mit Daten in einer belegten
// Form — SEFileLoop/ErpApiCall (Referenzmaske) oder Tabellen (alter
// Editor); alles andere (GET-Antworten, fremde Events) -> undefined.
export function payloadDaten(raw: unknown): UnknownRecord | undefined {
  let data = raw
  if (typeof data === 'string') {
    try { data = JSON.parse(data) } catch { return undefined }
  }
  if (!isRecord(data) || !isRecord(data.Daten)) return undefined
  const daten = data.Daten
  if (!daten.SEFileLoop && !daten.Tabellen && !daten.ErpApiCall) return undefined
  return daten
}

// Nutzlast aus einem message-Event ziehen (Fallback ohne basisHTML_REGISTER):
// SoftEngine/Elternfenster senden { MSG: { DATA } }, event.data als String
// oder Objekt (Referenz Block 1/9 + alter Editor). Kein MSG -> undefined
// (fremdes Event, z.B. von Devtools/Playwright).
export function messagePayload(eventData: unknown): unknown {
  let d = eventData
  if (typeof d === 'string') {
    try { d = JSON.parse(d) } catch { return undefined }
  }
  if (!isRecord(d) || !isRecord(d.MSG)) return undefined
  return d.MSG.DATA
}
