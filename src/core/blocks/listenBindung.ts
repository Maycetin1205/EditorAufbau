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

export function listeFuerExport(roh: unknown, b: ListenBindung): unknown {
  const wahl = b.eintragsWahl
  if (!Array.isArray(roh) || !wahl) return roh

  const bedingt = new Set<string>()
  if (b.eintragsZuordnung) bedingt.add(b.eintragsZuordnung.key)
  if (wahl.felderKey) bedingt.add(wahl.felderKey)
  if (bedingt.size === 0) return roh
  return roh.map((x) => {
    if (!x || typeof x !== 'object') return x
    const eintrag = x as Record<string, unknown>

    const erlaubt = new Set<string>()
    const gewaehlt = eintragsWahlWert(wahl, eintrag)
    if (b.eintragsZuordnung && gewaehlt === b.eintragsZuordnung.nurBeiWahl) {
      erlaubt.add(b.eintragsZuordnung.key)
    }
    if (wahl.felderKey && eintragsFelderVon(wahl, eintrag).length > 0) {
      erlaubt.add(wahl.felderKey)
    }
    const weg = [...bedingt].filter((k) => !erlaubt.has(k) && k in eintrag)
    if (weg.length === 0) return x
    const kopie = { ...eintrag }
    for (const k of weg) delete kopie[k]
    return kopie
  })
}

