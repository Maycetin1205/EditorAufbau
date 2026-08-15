// sourceLinks — die SCHLUESSELREGEL zwischen zwei Datenquellen und die
// Liste weiterer Quellen an einem Baustein.
//
// Wozu: eine Maske zeigt Werte aus MEHREREN Quellen. Damit die Laufzeit zu
// einer Zeile der ersten Quelle die passende Partnerzeile findet, braucht
// sie die Regel „welches Feld hier entspricht welchem Feld dort" — zum
// Beispiel „Adressnummer im Terminplaner = Adressnummer in Kundenhaustieren".
//
// Reine DATEN: kein Bildschirm, kein SoftEngine, kein Baustein. Alles
// Installations-Individuelle (welche Quellen, welche Feldcodes) sind DATEN,
// nie Code (Regel 5).
//
// Die aeltere Bibliotheks-Variante desselben Gedankens (SourceLink/findLink,
// gepflegt als eigener Bereich der Kommandozentrale) hat der Nutzer am
// 2026-07-28 verworfen; entfernt am 2026-07-30 — die Schluesselregel lebt
// seither NUR am Baustein, an dem sie wirkt (Regel 7, Bedienung am Ding).

import type { DataSource } from './dataSources'

// Ein Schluesselpaar: „dieses Feld hier" entspricht „jenem Feld dort".
// Beides Feldcodes = Technikwerte, unsichtbar (Regel 3).
export interface SchluesselPaar {
  fromField: string
  toField: string
}

// Nutzer-Entscheidung 2026-07-25: drei reichen. Mehr waere Theorie —
// niemand hat einen vierten Fall (Regel 10).
export const MAX_SCHLUESSELPAARE = 3

// Nur die Paare, bei denen BEIDE Feldcodes gefuellt sind. Ein halbes Paar
// wuerde jede Zeile treffen oder keine — beides ist geraten, und der Editor
// raet nie (Regel 7).
export function vollstaendigePaare(traeger: { keyPairs: readonly SchluesselPaar[] }): SchluesselPaar[] {
  return traeger.keyPairs.filter((p) => p.fromField.trim() !== '' && p.toField.trim() !== '')
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
// existieren (der Bediener tippt ja gerade) — es wird nur nicht benutzt.
// Angezeigt wird es nirgends: der Preflight kennt den Fall, blockt den Export
// aber seit 2026-08-10 nicht mehr, und nur seine Meldung 'Datenquelle fehlt'
// erreicht ueberhaupt noch die Steuerung.
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
