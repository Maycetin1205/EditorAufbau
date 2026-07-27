// sourceLinks — das Modell einer VERKNUEPFUNG zwischen zwei Datenquellen.
//
// Wozu: eine Maske zeigt Werte aus MEHREREN Quellen. Damit der Editor zu
// einer Zeile der einen Quelle die passende Zeile der anderen findet, braucht
// er die Regel „welches Feld hier entspricht welchem Feld dort" — zum
// Beispiel „Kundennummer im Auftrag = Kundennummer im Kundenstamm".
// Genau das ist eine Verknuepfung.
//
// Reine DATEN: kein Bildschirm, kein SoftEngine, kein Baustein. Dieselbe
// Schicht und dieselbe Bauart wie dataSources und relations daneben — die
// Verknuepfung ist der dritte Fall desselben Musters, deshalb wird nichts
// Neues erfunden (Regel 10).
//
// Alles Installations-Individuelle (welche Quellen, welche Feldcodes) sind
// DATEN, nie Code (Regel 5).

// Ein Schluesselpaar: „dieses Feld hier" entspricht „jenem Feld dort".
// Beides Feldcodes = Technikwerte, unsichtbar (Regel 3).
export interface SchluesselPaar {
  fromField: string
  toField: string
}

export interface SourceLink {
  // Stabiler Technikwert. Wer eine Verknuepfung referenziert, merkt sich
  // diese id — sie aendert sich nie wieder.
  id: string
  // Die zwei verknuepften Quellen (ids aus der Datenquellen-Bibliothek).
  fromSourceId: string
  toSourceId: string
  // 1 bis MAX_SCHLUESSELPAARE Paare, UND-verknuepft: ALLE muessen passen,
  // damit zwei Zeilen als zusammengehoerig gelten. Mehr als eins braucht
  // man, wenn ein Feld allein nicht eindeutig ist („Kunde UND Jahr").
  keyPairs: SchluesselPaar[]
}

// Nutzer-Entscheidung 2026-07-25: drei reichen. Mehr waere Theorie —
// niemand hat einen vierten Fall (Regel 10).
export const MAX_SCHLUESSELPAARE = 3

// Eine Verknuepfung ist BRAUCHBAR, wenn beide Quellen gesetzt und
// verschieden sind und mindestens ein vollstaendiges Schluesselpaar da ist.
// Halbfertige Eintraege duerfen existieren (der Bediener tippt ja gerade),
// sie werden nur nicht zum Verbinden benutzt — und der Preflight sagt es
// spaeter im Klartext, statt still nichts zu tun (Regel 4).
export function istBrauchbar(link: SourceLink): boolean {
  if (link.fromSourceId === '' || link.toSourceId === '') return false
  if (link.fromSourceId === link.toSourceId) return false
  return vollstaendigePaare(link).length > 0
}

// Nur die Paare, bei denen BEIDE Feldcodes gefuellt sind. Ein halbes Paar
// wuerde jede Zeile treffen oder keine — beides ist geraten, und der Editor
// raet nie (Regel 7).
export function vollstaendigePaare(link: SourceLink): SchluesselPaar[] {
  return link.keyPairs.filter((p) => p.fromField.trim() !== '' && p.toField.trim() !== '')
}

// Die Verknuepfung zwischen zwei Quellen finden — RICHTUNGSFREI.
// „Auftrag zu Kunde" und „Kunde zu Auftrag" sind dieselbe Beziehung; der
// Bediener soll sie nicht zweimal anlegen muessen. Nur brauchbare zaehlen.
export function findLink(
  links: readonly SourceLink[],
  aId: string,
  bId: string,
): SourceLink | undefined {
  if (aId === '' || bId === '' || aId === bId) return undefined
  return links.find((l) =>
    istBrauchbar(l)
    && ((l.fromSourceId === aId && l.toSourceId === bId)
      || (l.fromSourceId === bId && l.toSourceId === aId)))
}

// Schluesselpaare aus SICHT einer bestimmten Quelle ausrichten. Die
// Verknuepfung ist richtungsfrei gespeichert; wer sie benutzt, hat aber
// immer eine Hauptquelle und eine Zusatzquelle. Diese Funktion dreht die
// Paare so, dass `haupt` links steht — DIE eine Stelle, die das tut, damit
// die Drehung nicht an jeder Fundstelle neu (und irgendwann falsch)
// nachgebaut wird.
export function paareAusSicht(
  link: SourceLink,
  hauptSourceId: string,
): { haupt: string; zusatz: string }[] {
  const paare = vollstaendigePaare(link)
  return link.fromSourceId === hauptSourceId
    ? paare.map((p) => ({ haupt: p.fromField, zusatz: p.toField }))
    : paare.map((p) => ({ haupt: p.toField, zusatz: p.fromField }))
}

// Eine leere Verknuepfung zum Weiterbearbeiten (ein leeres Paar, damit im
// Formular sofort eine Zeile steht).
export function leereVerknuepfung(): Omit<SourceLink, 'id'> {
  return { fromSourceId: '', toSourceId: '', keyPairs: [{ fromField: '', toField: '' }] }
}

// Gespeicherten Bestand defensiv einlesen (Muster sanitizeRelationTemplates):
// nie werfen, kaputte Eintraege still auslassen, Dubletten-ids verwerfen.
// Ein kaputter localStorage darf den Editor nie am Starten hindern.
export function sanitizeSourceLinks(raw: unknown): SourceLink[] {
  if (!Array.isArray(raw)) return []
  const acc: SourceLink[] = []
  const seen = new Set<string>()
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    if (typeof e.id !== 'string' || e.id === '' || seen.has(e.id)) continue
    if (typeof e.fromSourceId !== 'string' || typeof e.toSourceId !== 'string') continue
    if (!Array.isArray(e.keyPairs)) continue
    const keyPairs: SchluesselPaar[] = []
    for (const p of e.keyPairs) {
      if (!p || typeof p !== 'object') continue
      const pp = p as Record<string, unknown>
      if (typeof pp.fromField !== 'string' || typeof pp.toField !== 'string') continue
      keyPairs.push({ fromField: pp.fromField, toField: pp.toField })
    }
    if (keyPairs.length === 0) continue
    seen.add(e.id)
    acc.push({
      id: e.id,
      fromSourceId: e.fromSourceId,
      toSourceId: e.toSourceId,
      // Ueberzaehlige Paare abschneiden statt den Eintrag zu verwerfen:
      // ein alter Stand mit vier Paaren soll nicht verschwinden.
      keyPairs: keyPairs.slice(0, MAX_SCHLUESSELPAARE),
    })
  }
  return acc
}
