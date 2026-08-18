export interface ListenBindung {
  prop: string

  titelKey: string

  feldKey: string

  standardTitel: string

  // Gesetzt: die Feld-Auswahl liest NUR die Bibliotheks-Quelle, deren id in
  // dieser Block-Eigenschaft steht (z. B. nachschlagQuelle) — nicht die
  // Quellen in Reichweite. Eintraege speichern den nackten Feldcode.
  quelleProp?: string

  eintragsWahl?: EintragsWahl

  eintragsZuordnung?: EintragsZuordnung
}

export interface EintragsZuordnung {
  key: string
  label: string

  nurBeiWahl: string

  wertLabel: string
  nameLabel: string
  bedeutungLabel: string

  bedeutungen: readonly { wert: string; name: string }[]
}

export interface EintragsWahl {
  key: string

  label: string

  optionen: readonly EintragsWahlOption[]

  standard: string

  felderKey?: string
}

export interface EintragsWahlOption {
  wert: string
  name: string
  felder?: readonly { key: string; label: string }[]
}

export interface ZuordnungZeile {
  wert: string
  name: string
  bedeutung: string
}

export function eintragsWahlWert(w: EintragsWahl, eintrag: Record<string, unknown>): string {
  const roh = eintrag[w.key]
  return typeof roh === 'string' && w.optionen.some((o) => o.wert === roh) ? roh : w.standard
}

export function eintragsZuordnungLesen(
  z: EintragsZuordnung,
  eintrag: Record<string, unknown>,
): ZuordnungZeile[] {
  const roh = eintrag[z.key]
  if (!Array.isArray(roh)) return []
  return roh
    .filter((r): r is Record<string, unknown> => Boolean(r) && typeof r === 'object')
    .map((r) => ({
      wert: typeof r.wert === 'string' ? r.wert : '',
      name: typeof r.name === 'string' ? r.name : '',
      bedeutung: typeof r.bedeutung === 'string' ? r.bedeutung : '',
    }))
}

export function eintragsFelderVon(
  w: EintragsWahl,
  eintrag: Record<string, unknown>,
): readonly { key: string; label: string }[] {
  const wert = eintragsWahlWert(w, eintrag)
  return w.optionen.find((o) => o.wert === wert)?.felder ?? []
}

export function eintragsFelderLesen(
  w: EintragsWahl,
  eintrag: Record<string, unknown>,
): Record<string, string> {
  const roh = w.felderKey === undefined ? undefined : eintrag[w.felderKey]
  if (!roh || typeof roh !== 'object' || Array.isArray(roh)) return {}
  const raus: Record<string, string> = {}
  for (const [k, v] of Object.entries(roh as Record<string, unknown>)) {
    if (typeof v === 'string') raus[k] = v
  }
  return raus
}

export function listenStandardTitel(b: ListenBindung, index: number): string {
  return b.standardTitel.replace('{n}', String(index + 1))
}

export function listeLesen(roh: unknown, b: ListenBindung): Record<string, unknown>[] {
  if (!Array.isArray(roh)) return []
  return roh.map((x, i) => {
    if (x && typeof x === 'object') return { ...(x as Record<string, unknown>) }
    return {
      [b.titelKey]: typeof x === 'string' ? x : listenStandardTitel(b, i),
      [b.feldKey]: '',
    }
  })
}

// Ein Schluessel eines Eintrags, der nur unter einer Bedingung in den Export
// gehoert: das Detail-Buendel nur, solange die gewaehlte Darstellung ueberhaupt
// Felder hat, die Status-Zuordnung nur bei der Status-Darstellung. Als Regeln
// und nicht als Aufzaehlung von Sonderfaellen — eine weitere Wahl braucht dann
// nichts Neues.
interface BedingterSchluessel {
  key: string
  erlaubt: (eintrag: Record<string, unknown>) => boolean
}

function bedingteSchluessel(b: ListenBindung): BedingterSchluessel[] {
  const regeln: BedingterSchluessel[] = []
  const ausWahl = (wahl: EintragsWahl): void => {
    const key = wahl.felderKey
    if (key === undefined) return
    regeln.push({ key, erlaubt: (e) => eintragsFelderVon(wahl, e).length > 0 })
  }
  const wahl = b.eintragsWahl
  if (wahl) {
    ausWahl(wahl)
    const zuo = b.eintragsZuordnung
    if (zuo) {
      regeln.push({ key: zuo.key, erlaubt: (e) => eintragsWahlWert(wahl, e) === zuo.nurBeiWahl })
    }
  }
  return regeln
}

export function listeFuerExport(roh: unknown, b: ListenBindung): unknown {
  if (!Array.isArray(roh)) return roh
  const regeln = bedingteSchluessel(b)
  if (regeln.length === 0) return roh
  return roh.map((x) => {
    if (!x || typeof x !== 'object') return x
    const eintrag = x as Record<string, unknown>
    const weg = regeln
      .filter((r) => r.key in eintrag && !r.erlaubt(eintrag))
      .map((r) => r.key)
    if (weg.length === 0) return x
    const kopie = { ...eintrag }
    for (const k of weg) delete kopie[k]
    return kopie
  })
}

