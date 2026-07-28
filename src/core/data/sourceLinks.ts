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
//
// ACHTUNG Stand 2026-07-28: die Datei traegt ZWEI Auspraegungen desselben
// Gedankens. Unten (`BausteinQuelle` …) die gelebte — die Regel haengt am
// Baustein. Oben (`SourceLink`, `findLink` …) die aeltere Bibliotheks-Variante
// aus der Kommandozentrale; der Nutzer hat sie verworfen, sie wird in einem
// eigenen Schritt entfernt und ist an KEINEN Produktivcode angeschlossen.
// Beide teilen sich `SchluesselPaar` + `vollstaendigePaare` mit Absicht: die
// Schluesselregel darf es nur einmal geben.

import type { DataSource } from './dataSources'

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
export function vollstaendigePaare(traeger: { keyPairs: readonly SchluesselPaar[] }): SchluesselPaar[] {
  return traeger.keyPairs.filter((p) => p.fromField.trim() !== '' && p.toField.trim() !== '')
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

// ---------------------------------------------------------------------------
// Mehrere Datenquellen AN EINEM BAUSTEIN
//
// Kurskorrektur 2026-07-28 (Nutzer): „allgemeine Verknuepfung ergibt keinen
// Sinn". Eine Regel, die als eigener Eintrag in einer Bibliothek liegt und
// vielleicht irgendwen betrifft, sieht der Bediener nicht und findet er nicht
// wieder. Die Regel gehoert an den Baustein, an dem sie wirkt (Regel 7,
// Bedienung am Ding).
//
// Sein Fall: eine Kanban-Karte zeigt DAUERHAFT den Termin aus dem Terminplaner
// UND Rasse/Notiz aus Kundenhaustieren. Kein Klick, keine Auswahl — beide
// Quellen gelten gleichzeitig. Wie viele es sind, steht nicht fest („koennte
// auch sein, dass ich nur eins haben will, und vielleicht sogar einen
// dritten"), darum eine Liste ohne Obergrenze statt eines festen Paares.
//
// Aufteilung: Eintrag 1 ist die bestehende `source`-Prop (sie liefert die
// ZEILEN). Eintrag 2..n stehen in dieser Liste, jeder mit seiner eigenen
// Schluesselregel zur ersten Quelle. Warum `source` nicht mit in die Liste
// wandert: das waere eine Schema-Migration jedes Bausteins in jedem
// Speicherstand — fuer null Gewinn (Regel 10).
//
// NUR EINE STUFE: Eintrag 3 verbindet zur ERSTEN Quelle, nie zu Eintrag 2.
// Mehrstufige Ketten waeren zur Laufzeit ein Nachschlage-Baum, dessen Kosten
// in SoftEngine niemand belegt hat (Regel 10).

// Eine WEITERE Datenquelle an einem Baustein.
export interface BausteinQuelle {
  // Quellen-id aus der Datenquellen-Bibliothek (Technikwert, unsichtbar).
  quelleId: string
  // Schluesselregel zur ERSTEN Quelle des Bausteins:
  //   fromField = Feldcode in der ersten Quelle
  //   toField   = Feldcode in DIESER Quelle
  // 1 bis MAX_SCHLUESSELPAARE Paare, UND-verknuepft — dieselbe Bedeutung und
  // dieselben Helfer wie oben, damit es nur EINE Schluesselregel-Logik gibt.
  keyPairs: SchluesselPaar[]
}

// Prop-Name der Liste am Baustein (Technikwert). Steht hier, damit ihn
// Registry, Inspector, Export und Laufzeit aus EINER Quelle beziehen.
export const WEITERE_QUELLEN_PROP = 'weitereQuellen'

// Wird jedem Baustein mit `acceptsDataSource` generisch untergemischt
// (BasicBlock.defineAndRegister) — kein Baustein deklariert das selbst, und
// ein NEUER Baustein bekommt die Faehigkeit damit geschenkt (Regel 2).
export const QUELLEN_DEFAULTS: Record<string, BausteinQuelle[]> = {
  [WEITERE_QUELLEN_PROP]: [],
}

// Eine weitere Quelle ist BRAUCHBAR, wenn sie eine Quelle nennt und
// mindestens ein vollstaendiges Schluesselpaar hat. Halbfertiges darf
// existieren (der Bediener tippt ja gerade) — es wird nur nicht benutzt, und
// der Preflight sagt es im Klartext statt still nichts zu tun (Regel 4).
export function quelleBrauchbar(q: BausteinQuelle): boolean {
  return q.quelleId !== '' && vollstaendigePaare(q).length > 0
}

// Die Liste defensiv aus den Block-Props lesen. normalizeProps uebernimmt
// bekannte Keys ROH (auch aus einer von Hand bearbeiteten Maskendatei), also
// wird hier geprueft — nie werfen, Kaputtes auslassen. Muster: listeLesen im
// Editor, sanitizeRelationTemplates daneben.
export function weitereQuellenAus(roh: unknown): BausteinQuelle[] {
  if (!Array.isArray(roh)) return []
  const acc: BausteinQuelle[] = []
  for (const entry of roh) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    if (typeof e.quelleId !== 'string') continue
    const keyPairs: SchluesselPaar[] = []
    for (const p of Array.isArray(e.keyPairs) ? e.keyPairs : []) {
      if (!p || typeof p !== 'object') continue
      const pp = p as Record<string, unknown>
      if (typeof pp.fromField !== 'string' || typeof pp.toField !== 'string') continue
      keyPairs.push({ fromField: pp.fromField, toField: pp.toField })
    }
    acc.push({ quelleId: e.quelleId, keyPairs: keyPairs.slice(0, MAX_SCHLUESSELPAARE) })
  }
  return acc
}

// Eine Quelle, die an einer Stelle dieses Bausteins waehlbar ist.
export interface QuelleInReichweite {
  source: DataSource
  // Schluesselregel zur ersten Quelle. Fehlt bei der ERSTEN Quelle selbst —
  // sie braucht keine, sie liefert ja die Zeilen.
  paare?: SchluesselPaar[]
}

// DIE eine Stelle, die aus den Block-Props die erreichbaren Quellen macht:
// erste Quelle zuerst, danach die weiteren in Listen-Reihenfolge
// (deterministisch — daraus entsteht die Reihenfolge im Feld-Picker).
//
// Ausgelassen wird, was nicht traegt: unbekannte Quellen-ids (geloescht),
// halbfertige Schluesselregeln, die erste Quelle ein zweites Mal und
// Dubletten. Alles davon ist ein LAUTER Fall — der Preflight benennt ihn beim
// Export; hier wird nur nicht so getan, als koenne man Werte daraus holen.
//
// Ohne erste Quelle gibt es gar nichts: die weiteren haengen ueber ihre
// Schluesselregel an ihr, ohne sie haetten sie keinen Bezugspunkt.
export function quellenAufloesen(
  sourceId: unknown,
  weitereRoh: unknown,
  bibliothek: readonly DataSource[],
): QuelleInReichweite[] {
  const erste = typeof sourceId === 'string' && sourceId !== ''
    ? bibliothek.find((s) => s.id === sourceId)
    : undefined
  if (!erste) return []
  const acc: QuelleInReichweite[] = [{ source: erste }]
  const gesehen = new Set<string>([erste.id])
  for (const q of weitereQuellenAus(weitereRoh)) {
    if (gesehen.has(q.quelleId) || !quelleBrauchbar(q)) continue
    const source = bibliothek.find((s) => s.id === q.quelleId)
    if (!source) continue
    gesehen.add(source.id)
    acc.push({ source, paare: vollstaendigePaare(q) })
  }
  return acc
}

// Klarnamen der Schluesselfelder einer weiteren Quelle („Adressnummer",
// „Kunde + Jahr"), fuer die Anzeige im Feld-Picker. Genannt werden die Felder
// der ERSTEN Quelle: der Bediener denkt von seinen Zeilen aus. Feldcodes
// erscheinen nie (Regel 3); ein Code ohne Klarnamen wird ausgelassen statt als
// Technikwert durchzuschlagen.
export function paarKlartext(
  paare: readonly SchluesselPaar[],
  erste: DataSource | undefined,
): string {
  return paare
    .map((p) => erste?.fields.find((f) => f.code === p.fromField)?.label ?? '')
    .filter((n) => n !== '')
    .join(' + ')
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
